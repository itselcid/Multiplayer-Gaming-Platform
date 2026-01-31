import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { io, Socket } from "socket.io-client";
import { userState, matchNotificationState } from "../core/appStore";
import { socketService } from "../services/socket";
import type { MatchNotification } from "../web3/getters";
import { Game } from "../pages/Game";

// Use relative URLs to go through nginx proxy
const API_URL = '/api';
const CHAT_WS_URL = '/chat-ws/'; // WebSocket endpoint for chat

interface Friend {
  id: number;
  username: string;
  avatar: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
  status: string;
  lastSeen: string;
  unread: number;
  typing: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface Message {
  id?: number;
  text: string;
  isMine: boolean;
  time: string;
  reactions: string[];
  isSystemMessage?: boolean;
  matchLink?: string;
  tournamentLink?: string;
}

export class chat extends Component {
  private socket: Socket | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private currentChatUserId: number | null = null;
  private oldestMessageId: number | null = null;
  private messageInput: string = '';
  private searchQuery: string = '';
  private activeMenuUserId: number | null = null;
  private isLoadingFriends: boolean = false;

  private users: Record<number, User> = {};
  private conversations: Record<number, Message[]> = {};
  private blockedUsers: Set<number> = new Set();

  // Tournament notification subscription
  private unsubscribeMatchNotification: (() => void) | null = null;

  // System user ID for tournament notifications
  private static TOURNAMENT_SYSTEM_USER_ID = 999999;

  // Cache for online friends list
  private cachedOnlineFriends: number[] = [];

  async fetchOlderMessages() {
    if (!this.currentChatUserId || !this.oldestMessageId) return;
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const res = await fetch(
        `${API_URL}/chat/messages/${this.currentChatUserId}/older?cursor=${this.oldestMessageId}`,
        {
          credentials: 'include',
          headers: {
            'x-user-id': currentUser.id.toString()
          }
        }
      );
      const older = await res.json();
      if (!older.length) return;

      this.oldestMessageId = older[older.length - 1].id;
      older.reverse();

      const myUserId = currentUser.id;
      const oldMsgs = older.map((m: any) => ({
        text: m.content,
        isMine: m.senderId === myUserId,
        time: new Date(m.createdAt).toLocaleTimeString(),
        id: m.id,
        reactions: []
      }));

      if (this.currentChatUserId) {
        this.conversations[this.currentChatUserId] = [
          ...oldMsgs,
          ...this.conversations[this.currentChatUserId]
        ];
      }

      this.render();
      const container = this.el.querySelector('#messages-container');
      if (container) {
        container.scrollTop = 50;
      }
    } catch (error) {
      console.error("Error fetching older messages:", error);
    }
  }

  async fetchMessages(userId: number) {
    const currentUser = userState.get();
    if (!currentUser) return;

    // For tournament system user, use the tournament notifications endpoint
    if (userId === chat.TOURNAMENT_SYSTEM_USER_ID) {
      await this.loadTournamentNotifications();
      this.markMessagesAsSeen(userId); // Mark notifications as seen in DB
      this.scrollToBottom();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/chat/messages/${userId}?markSeen=true`, {
        credentials: 'include',
        headers: {
          'x-user-id': currentUser.id.toString()
        }
      });
      const messages = await res.json();
      const myUserId = currentUser.id;

      this.oldestMessageId = messages[messages.length - 1]?.id || null;
      messages.reverse();

      this.conversations[userId] = messages.map((m: any) => ({
        text: m.content,
        isMine: m.senderId === myUserId,
        time: new Date(m.createdAt).toLocaleTimeString(),
        id: m.id,
        reactions: []
      }));

      this.render();
      this.scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  private async loadFriends() {
    if (this.isLoadingFriends) return;
    this.isLoadingFriends = true;

    try {
      // CHANGE THIS ENDPOINT - FROM '/users/friends' TO '/friends'
      const response = await fetch(`${API_URL}/friends`, {  // <-- CHANGE HERE
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load friends');
      }

      const data = await response.json();

      // CHANGE HERE - Your Friends component returns { friends: [...] }
      const friends: Friend[] = data.friends || [];  // <-- ADD '.friends'

      this.users = {};
      const friendIds: number[] = [];

      friends.forEach((friend: Friend) => {
        // IMPORTANT: Your Friends component uses 'username', not 'name'
        this.users[friend.id] = {
          id: friend.id,
          name: friend.username,  // <-- CHANGE 'username' to 'name' for chat
          avatar: friend.avatar || '',
          status: 'Offline',  // Default to Offline, actual status comes from socket/API
          lastSeen: '',  // Empty - will show last message if exists
          unread: 0,
          typing: false
        };
        friendIds.push(friend.id);
      });

      if (friendIds.length > 0) {
        await this.fetchLastMessages(friendIds);
      }

      // Fetch online friends via REST API
      await this.fetchOnlineFriends();

      // Apply cached online status
      this.applyOnlineStatus();

      // Load saved tournament notifications
      await this.loadTournamentNotifications();

      this.render();
    } catch (error) {
      console.error('Failed to load friends:', error);
      this.users = {};  // <-- Clear users on error
      this.render();    // <-- Re-render to show empty state
    } finally {
      this.isLoadingFriends = false;
    }
  }

  async sendInvite(friendId: number, url: string) {
    try {
      const user = userState.get();
      if (!user) { throw new Error("User not logged in"); }
      console.log("Sending game invite to user ID:", friendId);
      const response = await fetch(`api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          receiverId: friendId,
          content: `Game Invite\nJoin me in Galactik Pingpong! Click here to play: ${url}\nAfter 10min of now this link will no longer be available`
        }),
        credentials: 'include'
      });
    }
    catch (error) {
      console.error("Error sending game invite:", error);
      alert('Network error. Please check your connection and try again.');
    }
  }



  private async fetchLastMessages(userIds: number[]) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      // ADD HEADER like in your Friends component
      const response = await fetch(`${API_URL}/chat/messages/latest-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()  // <-- ADD THIS
        },
        body: JSON.stringify({ userIds }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        Object.keys(data).forEach((key) => {
          const userId = Number(key);
          const msg = data[userId];
          if (this.users[userId]) {
            this.users[userId].lastMessage = msg.content;
            this.users[userId].lastMessageTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            this.users[userId].unread = msg.unreadCount || 0;
          }
        });
        this.render();
      }
    } catch (error) {
      console.error('Failed to fetch last messages:', error);
    }
  }

  // Fetch online friends via REST API
  private async fetchOnlineFriends() {
    try {
      const response = await fetch(`${API_URL}/friends/online`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const onlineFriends: Friend[] = data.friends || [];

        // Update cache with online friend IDs
        this.cachedOnlineFriends = onlineFriends.map(f => f.id);
        console.log('Fetched online friends:', this.cachedOnlineFriends);
      }
    } catch (error) {
      console.error('Failed to fetch online friends:', error);
    }
  }

  // Load saved tournament notifications from backend
  private async loadTournamentNotifications() {
    const currentUser = userState.get();
    if (!currentUser) {
      console.log('loadTournamentNotifications: No current user');
      return;
    }

    console.log('loadTournamentNotifications: Fetching for user', currentUser.id);

    try {
      const response = await fetch(`${API_URL}/chat/tournament-notifications`, {
        credentials: 'include',
        headers: {
          'x-user-id': currentUser.id.toString()
        }
      });

      console.log('loadTournamentNotifications: Response status', response.status);

      if (response.ok) {
        const data = await response.json();
        const notifications = data.notifications || [];

        console.log('loadTournamentNotifications: Got', notifications.length, 'notifications', notifications);

        if (notifications.length > 0) {
          // Ensure tournament system user exists
          this.ensureTournamentSystemUser();

          // Convert notifications to messages
          let unreadCount = 0;
          notifications.forEach((n: any) => {
            if (!n.seen) {
              unreadCount++;
            }
            const message: Message = {
              id: n.id,
              text: `your next match in Tournament is ready!`,
              isMine: false,
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reactions: [],
              isSystemMessage: true,
              matchLink: n.matchLink // Use the saved matchLink from database
            };

            if (!this.conversations[chat.TOURNAMENT_SYSTEM_USER_ID]) {
              this.conversations[chat.TOURNAMENT_SYSTEM_USER_ID] = [];
            }

            // Avoid duplicates by ID or matchLink
            const exists = this.conversations[chat.TOURNAMENT_SYSTEM_USER_ID].some(m =>
              m.id === n.id || (n.matchKey && m.matchLink === `/match/${n.matchKey}`)
            );
            if (!exists) {
              this.conversations[chat.TOURNAMENT_SYSTEM_USER_ID].push(message);
              console.log('loadTournamentNotifications: Added message', message.id);
            }
          });

          // Update last message and unread count for user list
          const lastNotification = notifications[notifications.length - 1];
          if (lastNotification) {
            this.users[chat.TOURNAMENT_SYSTEM_USER_ID].lastMessage = `your next match in Tournament is ready!`;
            this.users[chat.TOURNAMENT_SYSTEM_USER_ID].lastMessageTime = new Date(lastNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.users[chat.TOURNAMENT_SYSTEM_USER_ID].unread = unreadCount;
          }

          console.log('Loaded tournament notifications:', notifications.length, 'Unread:', unreadCount);
        } else {
          console.log('loadTournamentNotifications: No notifications found');
        }
      } else {
        console.error('loadTournamentNotifications: Error response', await response.text());
      }
    } catch (error) {
      console.error('Failed to load tournament notifications:', error);
    }
  }

  // Save tournament notification to backend
  private async saveTournamentNotification(notification: MatchNotification) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_URL}/chat/tournament-notifications`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()
        },
        body: JSON.stringify({
          tournamentId: Number(notification.tournamentId),
          round: Number(notification.round),
          opponentUsername: notification.opponentUsername,
          matchKey: notification.matchKey,
          matchLink: `/match/${notification.matchKey}`,
          content: `your next match in Tournament is ready!`
        })
      });

      if (response.ok) {
        console.log('Tournament notification saved to database');
      } else {
        console.error('Failed to save tournament notification:', await response.text());
      }
    } catch (error) {
      console.error('Error saving tournament notification:', error);
    }
  }

  // Apply online status from cache to loaded users
  private applyOnlineStatus() {
    if (Object.keys(this.users).length === 0) return;

    // Set all users to offline first
    Object.keys(this.users).forEach((key) => {
      const userId = Number(key);
      this.users[userId].status = 'Offline';
    });

    // Mark cached online friends as online
    this.cachedOnlineFriends.forEach((friendId: number) => {
      if (this.users[friendId]) {
        this.users[friendId].status = 'Online';
      }
    });

    // Don't call render here - let the caller decide when to render
  }

  private async loadBlockedUsers() {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_URL}/chat/blocked`, {
        headers: {
          'x-user-id': currentUser.id.toString()
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.blockedUsers = new Set(data.blockedIds || []);
        this.render();
      }
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    }
  }

  private initSocket() {
    this.unsubscribeAuth = userState.subscribe((user) => {
      if (user) {
        // Only load if we haven't already loaded
        if (Object.keys(this.users).length === 0) {
          this.loadFriends();
          this.loadBlockedUsers();
        }

        if (!this.socket || !this.socket.connected) {
          this.connectSocket(user);
        }

        // Subscribe to online status updates
        this.subscribeToOnlineStatus();

        // Subscribe to tournament match notifications
        this.subscribeToMatchNotifications();
      } else {
        this.users = {};
        this.conversations = {};
        this.blockedUsers.clear();

        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }

        // Unsubscribe from online status events
        this.unsubscribeFromOnlineStatus();

        // Unsubscribe from match notifications
        this.unsubscribeFromMatchNotifications();

        this.render();
      }
    });
  }

  private subscribeToMatchNotifications() {
    console.log('chat.subscribeToMatchNotifications: Setting up subscription');

    // Cleanup any existing subscription first to prevent leaks
    this.unsubscribeFromMatchNotifications();

    // Ensure tournament system user exists
    this.ensureTournamentSystemUser();

    // Subscribe to match notification state
    this.unsubscribeMatchNotification = matchNotificationState.subscribe((notification: MatchNotification | null) => {
      console.log('chat.subscribeToMatchNotifications: Received notification state:', notification);
      if (!notification) return;

      console.log('chat.subscribeToMatchNotifications: Calling handleMatchNotification');
      this.handleMatchNotification(notification);

      // Clear the state so it doesn't trigger again on remount
      matchNotificationState.set(null);
    });
  }

  private unsubscribeFromMatchNotifications() {
    if (this.unsubscribeMatchNotification) {
      this.unsubscribeMatchNotification();
      this.unsubscribeMatchNotification = null;
    }
  }

  private ensureTournamentSystemUser() {
    const systemUserId = chat.TOURNAMENT_SYSTEM_USER_ID;
    console.log('ensureTournamentSystemUser: checking for user', systemUserId, 'exists:', !!this.users[systemUserId]);
    if (!this.users[systemUserId]) {
      this.users[systemUserId] = {
        id: systemUserId,
        name: 'Tournament',
        avatar: '/logo.png',
        status: 'Online',
        lastSeen: 'System',
        unread: 0,
        typing: false,
        lastMessage: 'Tournament notifications'
      };
      // Initialize empty conversation
      this.conversations[systemUserId] = [];
      console.log('ensureTournamentSystemUser: Created tournament user, users now:', Object.keys(this.users));
    }
  }

  private handleMatchNotification(notification: MatchNotification) {
    const systemUserId = chat.TOURNAMENT_SYSTEM_USER_ID;

    // Ensure system user exists
    this.ensureTournamentSystemUser();

    // Create notification message
    const message: Message = {
      id: Date.now(),
      text: `your next match in Tournament is ready!`,
      isMine: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      isSystemMessage: true,
      matchLink: `/match/${notification.matchKey}`
    };

    // Add to tournament conversation
    if (!this.conversations[systemUserId]) {
      this.conversations[systemUserId] = [];
    }

    // Deduplicate: check if this match notification already exists
    const matchLink = `/match/${notification.matchKey}`;
    const exists = this.conversations[systemUserId].some(m => m.matchLink === matchLink);
    if (exists) {
      console.log('handleMatchNotification: Notification already exists for match', notification.matchKey);
      return;
    }

    this.conversations[systemUserId].push(message);

    // Update last message for the user list - include tournament link info
    this.users[systemUserId].lastMessage = `your next match in Tournament is ready!`;
    this.users[systemUserId].lastMessageTime = message.time;

    // If not currently viewing tournament chat, increment unread
    if (this.currentChatUserId !== systemUserId) {
      this.users[systemUserId].unread = (this.users[systemUserId].unread || 0) + 1;
      console.log('New tournament notification - unread count:', this.users[systemUserId].unread);
    } else {
      // If chat is open, mark it as seen in DB after it's saved
      const markAsSeen = async () => {
        await this.saveTournamentNotification(notification);
        await this.markMessagesAsSeen(systemUserId);
        await this.loadTournamentNotifications(); // Reload to get IDs and seen status
      };
      markAsSeen();
      return;
    }

    // Save notification to backend for persistence
    this.saveTournamentNotification(notification);

    this.render();

    // Auto-open tournament chat if desired (optional)
    // this.openChat(systemUserId);
  }

  private subscribeToOnlineStatus() {
    // Listen for initial online friends list
    socketService.on('initial_online_list', (onlineFriendIds: number[]) => {
      console.log('Received initial online list:', onlineFriendIds);
      this.cachedOnlineFriends = onlineFriendIds;
      this.applyOnlineStatus();
      this.render();
    });

    // Listen for friend status changes (online/offline)
    socketService.on('friend_status', (data: { userId: number, status: 'online' | 'offline' }) => {
      console.log('Friend status update:', data);

      // Update the cache
      if (data.status === 'online') {
        if (!this.cachedOnlineFriends.includes(data.userId)) {
          this.cachedOnlineFriends.push(data.userId);
        }
      } else {
        this.cachedOnlineFriends = this.cachedOnlineFriends.filter(id => id !== data.userId);
      }

      // Update the user status if user is loaded
      if (this.users[data.userId]) {
        this.users[data.userId].status = data.status === 'online' ? 'Online' : 'Offline';
        this.render();
      }
    });

    // Request the online friends list if socket is connected
    socketService.emit('get_online_friends');
  }

  private unsubscribeFromOnlineStatus() {
    socketService.off('initial_online_list');
    socketService.off('friend_status');
  }

  private connectSocket(user: any) {
    if (this.socket && this.socket.connected) return;

    // Connect to WebSocket through nginx proxy
    this.socket = io('/', {
      path: '/chat-ws/',
      transports: ['websocket', 'polling']
    });

    this.socket.on("connect", () => {
      console.log("Connected to chat server");
      this.socket?.emit("join", user.id);
    });

    this.socket.on("receive-message", (message: any) => {
      this.handleReceiveMessage(message);
    });

    this.socket.on("unread-count-update", (data: any) => {
      this.handleUnreadCountUpdate(data);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from chat server");
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  private handleReceiveMessage(message: any) {
    const currentUser = userState.get();
    if (!currentUser) return;

    const isMine = message.from === currentUser.id;
    const otherUserId = isMine ? message.to : message.from;

    console.log('socket received message:', message);
    if (!this.conversations[otherUserId]) {
      this.conversations[otherUserId] = [];
    }

    // Check if we already have this message (deduplication)
    // But allow replacing optimistic messages (negative IDs)
    const existingIndex = this.conversations[otherUserId].findIndex(m => m.id === message.id);
    if (existingIndex !== -1) return;

    // Check if we have an optimistic version (content matches, ID is negative)
    // and replace it properly
    const optimisticIndex = this.conversations[otherUserId].findIndex(m =>
      m.isMine && m.text === message.content && (m.id && m.id < 0)
    );

    if (optimisticIndex !== -1) {
      console.log('Replacing optimistic message', this.conversations[otherUserId][optimisticIndex].id, 'with real message', message.id);
      this.conversations[otherUserId].splice(optimisticIndex, 1);
    }

    const timeStr = new Date(message.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    this.conversations[otherUserId].push({
      text: message.content,
      isMine: isMine,
      time: timeStr,
      id: message.id,
      reactions: []
    });

    if (this.users[otherUserId]) {
      this.users[otherUserId].lastMessage = message.content;
      this.users[otherUserId].lastMessageTime = timeStr;
    }

    if (this.currentChatUserId === otherUserId) {
      this.render();
      this.scrollToBottom();

      // If the chat is open, mark the message as seen in the database
      if (!isMine) {
        this.markMessagesAsSeen(otherUserId);
      }
    } else {
      if (!isMine && this.users[otherUserId]) {
        this.users[otherUserId].unread = (this.users[otherUserId].unread || 0) + 1;
      }
      this.render();
    }
  }

  constructor() {
    super("div", "w-full max-w-6xl mx-auto py-15");

    // Check immediately if user is logged in
    const currentUser = userState.get();
    if (currentUser) {
      console.log('User already logged in, loading friends...');
      this.loadFriends();
      this.loadBlockedUsers();
      this.connectSocket(currentUser);
      this.subscribeToOnlineStatus();
    }

    this.initSocket();
  }

  unmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    this.unsubscribeFromOnlineStatus();
    this.unsubscribeFromMatchNotifications();
    super.unmount();
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Online': return 'bg-green-500';
      case 'Away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  }

  escapeHtml(text: string) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  linkify(text?: string) {
    if (!text) return '';
    const escaped = this.escapeHtml(text);

    return escaped.replace(/(https?:\/\/[^\s"<]+)/g, (url) => {
      try {
        const urlObj = new URL(url);
        const currentHost = window.location.hostname;

        // Check if the URL belongs to our site
        if (urlObj.hostname === currentHost || urlObj.hostname === 'localhost') {
          const relativePath = urlObj.pathname + urlObj.search + urlObj.hash;
          return `<a href="${relativePath}" target="_blank" rel="noopener noreferrer" class="text-neon-cyan underline">invite link</a>`;
        }

        // It's an external link (like Facebook), keep the full URL
        const safe = encodeURI(url);
        return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="text-neon-cyan underline">check this out!</a>`;

      } catch (e) {
        return url;
      }
    });
  }

  renderAvatar(avatar: string | undefined, size: string = 'w-8 h-8') {
    if (avatar && (avatar.startsWith('/') || avatar.startsWith('http'))) {
      return `<img src="${avatar}" alt="avatar" class="${size} rounded-full object-cover" />`;
    }
    return `<span class="text-lg">${avatar || ''}</span>`;
  }

  renderUsersList() {


    const filtered = Object.values(this.users).filter(user =>
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    return filtered.map(user => {
      const isSystemUser = user.id === chat.TOURNAMENT_SYSTEM_USER_ID;
      return `
      <div class="user-item p-2 cursor-pointer transition-all hover:bg-neon-cyan/10 border-l-4 ${this.currentChatUserId === user.id
          ? 'bg-neon-cyan/10 border-neon-cyan'
          : 'border-transparent'
        }" data-user-id="${user.id}">
        <div class="flex items-center gap-2">
          <div class="relative">
            <div class="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
              ${this.renderAvatar(user.avatar)}
            </div>
            ${!isSystemUser ? `<div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${this.getStatusColor(user.status)} rounded-full border-2 border-space-dark"></div>` : ''}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-200 truncate">${this.escapeHtml(user.name)}</h3>
              ${user.lastMessageTime ? `<span class="text-[10px] text-gray-500">${user.lastMessageTime}</span>` : ''}
            </div>
            <div class="flex justify-between items-center">
              ${user.lastMessage ? `<p class="text-xs text-gray-500 truncate max-w-[120px]">${this.linkify(user.lastMessage)}</p>` : '<p class="text-xs text-gray-500">&nbsp;</p>'}
              ${user.unread > 0 ? `
                <span class="bg-neon-cyan text-space-dark text-xs rounded-full px-2 py-0.5 font-semibold">
                  ${user.unread}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `}).join('');
  }

  renderMessages() {
    if (!this.currentChatUserId) return '';

    const user = this.users[this.currentChatUserId];
    const isBlocked = this.blockedUsers.has(this.currentChatUserId);
    const messages = this.conversations[this.currentChatUserId] || [];

    // If user is blocked, show header with unblock button and simple message
    if (isBlocked) {
      return `
        <div class="px-4 py-2 border-b backdrop-blur-xl bg-black/60 border-neon-cyan/10 flex items-center justify-between rounded-lg mb-4">
        <div class="flex items-center gap-2">
            <div class="relative">
              <div class="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden opacity-50">
                ${this.renderAvatar(user?.avatar)}
              </div>
            </div>
            <div>
              <h2 class="font-semibold text-gray-400">${this.escapeHtml(user?.name || 'User')}</h2>
              <p class="text-xs text-red-400">Blocked</p>
            </div>
          </div>
          <div class="flex items-center gap-2 relative">
            <button id="unblock-user-btn" class="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition" data-user-id="${this.currentChatUserId}">
              Unblock
            </button>
          </div>
        </div>
        <div id="messages-container" class="space-y-4 flex-1 overflow-y-auto no-scrollbar flex items-center justify-center">
          <p class="text-gray-500 text-sm">You have blocked this user</p>
        </div>
      `;
    }

    const messagesHtml = messages.map((msg) => {
      // Check if it's a system message (tournament notification)
      if (msg.isSystemMessage) {
        console.log('Tournament message:', msg); // Debug log
        return `
          <div class="flex justify-center my-4">
            <div class="max-w-sm w-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-cyan/30 rounded-xl p-4 shadow-lg">
              <div class="text-center">
                <p class="text-lg font-bold text-neon-cyan whitespace-pre-wrap mb-3">${this.linkify(msg.text)}</p>
                <button class="play-match-btn inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition shadow-md text-lg cursor-pointer" data-match-link="${msg.matchLink || '/match/test'}">
                  Play Now
                </button>
              </div>
              <div class="text-center mt-3">
                <span class="text-xs text-gray-500">${this.escapeHtml(msg.time)}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Regular message
      return `
        <div class="flex ${msg.isMine ? 'justify-end' : 'justify-start'}">
          <div class="group max-w-xs lg:max-w-md ${msg.isMine ? 'order-2' : 'order-1'}">
            <div class="px-4 py-3 rounded-2xl ${msg.isMine
          ? 'bg-blue-800 text-white rounded-br-sm'
          : 'bg-space-blue/80 backdrop-blur-xl text-gray-200 rounded-bl-sm border border-neon-cyan/20'
        }">
              <p class="text-xs font-thin leading-relaxed whitespace-pre-wrap">${this.linkify(msg.text)}</p>
            </div>
            <div class="flex items-center gap-2 mt-1 px-2">
              <span class="text-xs font-light text-gray-500">${this.escapeHtml(msg.time)}</span>
              ${msg.reactions.length > 0 ? `
                <div class="flex gap-1">
                  ${msg.reactions.map(r => `<span class="text-xs">${r}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Check if this is the tournament system user
    const isSystemUser = this.currentChatUserId === chat.TOURNAMENT_SYSTEM_USER_ID;

    // Show welcome message for tournament system if no messages
    let displayMessages = messagesHtml;
    if (isSystemUser && messages.length === 0) {
      displayMessages = `
        <div class="flex justify-center my-4">
          <div class="max-w-sm w-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-cyan/30 rounded-xl p-4 shadow-lg">
            <div class="text-center">
              <p class="text-2xl mb-2"></p>
              <h3 class="text-lg font-bold text-neon-cyan mb-2">Tournament Notifications</h3>
              <p class="text-sm text-gray-300 mb-3">When your tournament match starts, you'll receive a notification here with a link to view your tournament.</p>
              <p class="text-xs text-gray-500">Join a tournament to get started!</p>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="px-4 py-2 border-b border-neon-cyan/10 bg-space-dark/50 backdrop-blur-xl flex items-center justify-between rounded-lg mb-4">
        <div class="flex items-center gap-2 ${!isSystemUser ? 'cursor-pointer hover:opacity-80' : ''} transition" ${!isSystemUser ? `id="chat-user-profile-link" data-user-id="${user.id}" title="View profile"` : ''}>
          <div class="relative">
            <div class="w-8 h-8 ${isSystemUser ? 'bg-gradient-to-r from-neon-purple to-neon-cyan' : 'bg-gradient-to-br from-neon-purple to-neon-cyan'} rounded-full flex items-center justify-center overflow-hidden">
              ${this.renderAvatar(user.avatar)}
            </div>
            ${!isSystemUser ? `<div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${this.getStatusColor(user.status)} rounded-full border-2 border-space-dark"></div>` : ''}
          </div>
          <div>
            <h2 class="font-semibold ${isSystemUser ? 'text-neon-cyan' : 'text-gray-200'}">${this.escapeHtml(user.name)}</h2>
            <p class="text-xs text-gray-500">${isSystemUser ? 'Tournament Notifications' : this.escapeHtml(user.lastSeen)}</p>
          </div>
        </div>
        ${!isSystemUser ? `
          <div class="flex items-center relative gap-2 bg-dark/60 relative">
            <button id="chat-header-menu-btn" class="p-2 hover:bg-neon-cyan/10 rounded-lg transition text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
            <div class="menu-actions-container" data-user-id="${user.id}"></div>
          </div>
        ` : ''}
      </div>
      <div id="messages-container" class="space-y-4 flex-1 overflow-y-auto no-scrollbar">
        ${displayMessages}
      </div>
    `;
  }

  updateMenuDropdown() {
    const container = this.el.querySelector('.menu-actions-container') as HTMLElement;
    if (!container) return;

    const userId = parseInt(container.dataset.userId || '0');
    const isBlocked = this.blockedUsers.has(userId);

    if (this.activeMenuUserId === userId) {
      container.innerHTML = `
        <div class="absolute right-0 top-2 bg-dark/60 border border-neon-cyan/20 shadow-xl rounded-xl py-2 z-50 w-40">
            <button class="menu-action-play w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neon-cyan/10 hover:text-neon-cyan flex items-center gap-2 transition-colors" data-user-id="${userId}">
                <span></span> Play Game
            </button>
            ${isBlocked ? `
              <button class="menu-action-unblock w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-green-500/10 flex items-center gap-2 transition-colors" data-user-id="${userId}">
                  <span></span> Unblock User
              </button>
            ` : `
              <button class="menu-action-block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors" data-user-id="${userId}">
                  <span></span> Block User
              </button>
            `}
        </div>
      `;
    } else {
      container.innerHTML = '';
    }
  }

  render() {
    const currentUser = this.currentChatUserId ? this.users[this.currentChatUserId] : null;
    const loggedInUser = userState.get();

    // Save focus state
    const activeId = document.activeElement?.id;
    const selectionStart = (document.activeElement as any)?.selectionStart;
    const selectionEnd = (document.activeElement as any)?.selectionEnd;

    this.el.innerHTML = `
      <div class="h-[82vh] border-neon-cyan/20  rounded-2xl shadow-2xl overflow-hidden flex backdrop-blur-md">
        
        <!-- Sidebar -->
          <div class="w-2/8  border-r border-neon-cyan/10 flex flex-col">
            <div class="p-3 border-b border-neon-cyan/10">
              <div class="flex justify-between items-center mb-2">
                <h1 class=" text-sm md:text-md lg:text-lg font-bold text-neon-cyan">Messages</h1>
                ${loggedInUser ? `<span class="text-xs text-gray-400 font-mono"></span>` : ''}
              </div>


              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search..."
                  value="${this.escapeHtml(this.searchQuery)}"
                  class="w-full pl-10 pr-4 py-2 bg-black/60 border border-neon-cyan/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-gray-200 placeholder-gray-500"
                />
              </div>
            </div>
            <div id="users-list" class="flex-1 overflow-y-auto no-scrollbar">
              ${this.renderUsersList()}
            </div>
          </div>

        <!-- Main Chat Area -->
          <div class="flex-1 flex flex-col relative overflow-hidden bg-black/60" style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(30, 11, 61, 0.85) 100%);  inset 0 0 30px rgba(0, 217, 255, 0.05);">
		    <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>
            ${!currentUser ? `
              <div class="flex-1 flex items-center justify-center text-gray-400">
                <div class="text-center">
                  <p class="text-xl font-semibold text-neon-cyan/70">Select a conversation</p>
                  <p class="text-sm mt-2">Choose from your friends to start chatting</p>
                </div>
              </div>
            ` : `
              <div class="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col">
                ${this.renderMessages()}
              </div>
              ${!this.blockedUsers.has(this.currentChatUserId!) && this.currentChatUserId !== chat.TOURNAMENT_SYSTEM_USER_ID ? `
                <div class="p-4 border-t border-neon-cyan/10 bg-space-dark/50 backdrop-blur-xl">
                  <div class="bg-space-blue/50  border border-neon-cyan/20 rounded-2xl px-4 py-2 flex items-end gap-2">
                    <textarea
                      id="message-input"
                      placeholder="Type a message..."
                      rows="1"
                      class="flex-1 bg-transparent resize-none focus:outline-none text-gray-200 py-2 placeholder-gray-500"
                      style="min-height: 24px; max-height: 128px;"
                    >${this.escapeHtml(this.messageInput)}</textarea>
                    <button id="send-btn" class="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition">
                      <svg class="w-5 h-5 transform rotate-90 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ` : ''}
            `}
          </div>
      </div>
    `;

    this.attachEventListeners();

    // Restore focus
    if (activeId) {
      const element = this.el.querySelector(`#${activeId}`) as any;
      if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        element.focus();
        if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
          element.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }
  }

  attachEventListeners() {
    // Scroll listener for older messages
    const container = this.el.querySelector('#messages-container');
    if (container) {
      container.addEventListener('scroll', () => {
        if (container.scrollTop === 0) {
          this.fetchOlderMessages();
        }
      });
    }



    // User selection
    this.el.querySelectorAll('.user-item').forEach(item => {
      item.addEventListener('click', () => {
        const userId = parseInt((item as HTMLElement).dataset.userId || '0');
        this.selectUser(userId);
      });
    });

    // Profile link in chat header
    const profileLink = this.el.querySelector('#chat-user-profile-link');
    if (profileLink) {
      profileLink.addEventListener('click', () => {
        const userId = (profileLink as HTMLElement).dataset.userId;
        if (userId) {
          window.history.pushState({}, '', `/profile/${userId}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      });
    }

    // Chat header menu button
    const headerMenuBtn = this.el.querySelector('#chat-header-menu-btn');
    if (headerMenuBtn) {
      headerMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentChatUserId) {
          this.activeMenuUserId = this.activeMenuUserId === this.currentChatUserId ? null : this.currentChatUserId;
          this.updateMenuDropdown();
        }
      });
    }

    // Menu actions - use event delegation on the menu container
    this.el.querySelector('.menu-actions-container')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const playBtn = target.closest('.menu-action-play');
      const blockBtn = target.closest('.menu-action-block');
      const unblockBtn = target.closest('.menu-action-unblock');

      if (playBtn) {
        e.stopPropagation();
        if (!this.currentChatUserId) {
          this.activeMenuUserId = null;
          this.updateMenuDropdown();
          return;
        }
        const friend: Friend = {
          id: this.users[this.currentChatUserId].id,
          username: this.users[this.currentChatUserId].name, avatar: this.users[this.currentChatUserId].avatar
        };
        const room = new Game("remote", "");
        const url = await room.createroom(friend);
        const fullUrl = new URL(String(url), window.location.origin).href;
        await this.sendInvite(friend.id, fullUrl);
        navigate(url)
      }

      if (blockBtn) {
        e.stopPropagation();
        const userId = parseInt((blockBtn as HTMLElement).dataset.userId || '0');
        this.blockUser(userId);
        this.activeMenuUserId = null;
        this.updateMenuDropdown();
      }

      if (unblockBtn) {
        e.stopPropagation();
        const userId = parseInt((unblockBtn as HTMLElement).dataset.userId || '0');
        this.unblockUser(userId);
        this.activeMenuUserId = null;
        this.updateMenuDropdown();
      }
    });

    // Close menu when clicking outside
    this.el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#chat-header-menu-btn') && !target.closest('.menu-actions-container') && this.activeMenuUserId !== null) {
        this.activeMenuUserId = null;
        this.updateMenuDropdown();
      }
    });

    // Unblock button
    const unblockBtn = this.el.querySelector('#unblock-user-btn');

    if (unblockBtn) {
      unblockBtn.addEventListener('click', () => {
        const userId = parseInt((unblockBtn as HTMLElement).dataset.userId || '0');
        if (userId) this.unblockUser(userId);
      });
    }

    // Search
    const searchInput = this.el.querySelector('#search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value;
        this.render();
        // Restore focus to search input after re-render
        const newSearchInput = this.el.querySelector('#search-input') as HTMLInputElement;
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
        }
      });
    }

    // Message input
    const messageInput = this.el.querySelector('#message-input') as HTMLTextAreaElement;
    if (messageInput) {
      messageInput.addEventListener('input', (e) => {
        this.messageInput = (e.target as HTMLTextAreaElement).value;
      });

      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Send button
    const sendBtn = this.el.querySelector('#send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.sendMessage();
      });
    }

    // Play Match buttons (tournament notifications)
    this.el.querySelectorAll('.play-match-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const matchLink = (e.currentTarget as HTMLElement).dataset.matchLink;
        if (matchLink) {
          navigate(matchLink);
        }
      });
    });
  }

  selectUser(userId: number) {
    this.currentChatUserId = userId;
    if (this.users[userId]) {
      this.users[userId].unread = 0;
    }

    if (this.socket) {
      this.socket.emit("join-conversation", userId);
    }

    this.messageInput = '';
    this.render(); // Render immediately to show the chat view
    this.fetchMessages(userId);
  }

  sendMessage() {
    const content = this.messageInput.trim();

    console.log('=== DEBUG sendMessage() ===');
    console.log('1. Message content:', content);
    console.log('2. Current chat user ID:', this.currentChatUserId);
    console.log('3. Socket exists:', !!this.socket);
    console.log('4. Socket connected:', this.socket?.connected);

    if (!content || !this.currentChatUserId) {
      console.log('❌ Cannot send: No content or no user selected');
      return;
    }

    // Check if socket is actually connected
    if (this.socket && this.socket.connected) {
      console.log('5. Emitting socket event "send_message"...');
      console.log('6. Payload:', { to: this.currentChatUserId, content: content });

      this.socket.emit("send_message", {
        to: this.currentChatUserId,
        content: content
      });

      console.log('Socket emit called');

    } else {
      console.error('❌ Socket is NOT connected! Cannot send via WebSocket.');
      console.log('   Trying HTTP fallback...');

      // Use HTTP fallback immediately
      this.sendMessageViaHttp(content);
    }

    this.messageInput = '';
    const inputEl = this.el.querySelector('#message-input') as HTMLTextAreaElement;
    if (inputEl) {
      inputEl.value = '';
      inputEl.focus(); // Restore focus after sending
      console.log('7. Input cleared and focused');
    }

    console.log('=== END DEBUG ===');
  }

  private async sendMessageViaHttp(content: string) {
    if (!this.currentChatUserId) return;

    const currentUser = userState.get();
    if (!currentUser) {
      console.error('No user logged in for HTTP fallback');
      return;
    }

    try {
      console.log('📡 Sending message via HTTP POST...');

      // Use optimistic update so user sees message immediately
      this.addOptimisticMessage(content);

      const response = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()
        },
        body: JSON.stringify({
          receiverId: this.currentChatUserId,
          content: content
        }),
        credentials: 'include'
      });

      console.log('HTTP Response status:', response.status);

      // Check if response is HTML (error) or JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Server returned HTML instead of JSON:', text.substring(0, 200));
        throw new Error('Server returned HTML error page');
      }

      if (response.ok) {
        const message = await response.json();
        console.log('Message sent via HTTP:', message);

        // Update the optimistic message with real data
        //this.updateOptimisticMessage(message);

      } else {
        const error = await response.json();
        console.error('❌ HTTP send failed:', error);

        if (response.status === 403) {
          alert('You cannot send messages to this user (Blocked)');
          // Remove optimistic message
          if (this.currentChatUserId && this.conversations[this.currentChatUserId]) {
            const optIndex = this.conversations[this.currentChatUserId].findIndex(m => m.id && m.id < 0);
            if (optIndex !== -1) {
              this.conversations[this.currentChatUserId].splice(optIndex, 1);
              this.render();
            }
          }
        } else {
          alert(`Failed to send message: ${error.message || error.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('❌ HTTP send error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  }

  private addOptimisticMessage(content: string): number {
    if (!this.currentChatUserId) return -1;

    console.log('Adding optimistic message...');

    if (!this.conversations[this.currentChatUserId]) {
      this.conversations[this.currentChatUserId] = [];
    }

    // Generate a unique temporary ID (use negative numbers to distinguish from real IDs)
    const tempId = -Date.now();

    const tempMessage: Message = {
      text: content,
      isMine: true,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }),
      id: tempId,  // Negative ID = optimistic message
      reactions: []
    };

    this.conversations[this.currentChatUserId].push(tempMessage);

    // Update UI immediately
    this.render();
    this.scrollToBottom();

    console.log('Optimistic message added with temp ID:', tempId);
    return tempId; // Return the temp ID so we can find it later
  }

  async blockUser(userId: number) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const res = await fetch(`${API_URL}/chat/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()
        },
        body: JSON.stringify({ userId: userId })
      });

      if (res.ok) {
        // Add to blocked users set
        this.blockedUsers.add(userId);
        this.render();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('An error occurred while blocking the user');
    }
  }

  async unblockUser(userId: number) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const res = await fetch(`${API_URL}/chat/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()
        },
        body: JSON.stringify({ userId: userId })
      });

      if (res.ok) {
        // Remove from blocked users set
        this.blockedUsers.delete(userId);
        this.render();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('An error occurred while unblocking the user');
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.el.querySelector('#messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  private handleUnreadCountUpdate(data: { fromUserId: number, count: number }) {
    if (this.users[data.fromUserId]) {
      this.users[data.fromUserId].unread = data.count;
      this.render();
    }
  }

  private async markMessagesAsSeen(userId: number) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      await fetch(`${API_URL}/chat/messages/${userId}/mark-seen`, {
        method: 'PUT',
        headers: {
          'x-user-id': currentUser.id.toString()
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  }
}
