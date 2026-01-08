import { Component } from "../core/Component";
import { io, Socket } from "socket.io-client";
import { userState } from "../core/appStore";

// Use relative URL to go through nginx proxy
const API_URL = '/api';

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
}

export class chat extends Component {
  private socket: Socket | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private currentChatUserId: number | null = null;
  private oldestMessageId: number | null = null;
  private messageInput: string = '';
  private searchQuery: string = '';
  private activeTab: 'users' | 'tournaments' = 'users';
  private activeMenuUserId: number | null = null;
  private isLoadingFriends: boolean = false;
  
  // Friends loaded from backend API
  private users: Record<number, User> = {};

  private conversations: Record<number, Message[]> = {};

  // Set of blocked user IDs
  private blockedUsers: Set<number> = new Set();

  async fetchOlderMessages() {
    if (!this.currentChatUserId || !this.oldestMessageId) return;

    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const res = await fetch(
        `http://localhost:4000/messages/${this.currentChatUserId}/older?cursor=${this.oldestMessageId}`,
        { 
            credentials: 'include',
            headers: { 
                'x-user-id': currentUser.id.toString()
            } 
        }
      );
      const older = await res.json();
      if (!older.length) return; // no more messages

      // Update oldest message id
      this.oldestMessageId = older[older.length - 1].id;

      // Reverse older messages to be ASC (Oldest -> Newest)
      older.reverse();

      const myUserId = currentUser.id;

      // Prepend older messages
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

      // Maintain scroll position (important!)
      const container = this.el.querySelector('#messages-container');
      if (container) {
        container.scrollTop = 50; // adjust as needed
      }
    } catch (error) {
        console.error("Error fetching older messages:", error);
    }
  }

  async fetchMessages(userId: number) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
        const res = await fetch(`http://localhost:4000/messages/${userId}`, {
            credentials: 'include',
            headers: { 
                'x-user-id': currentUser.id.toString()
            }
        });
        const messages = await res.json();

        const myUserId = currentUser.id;

        // Oldest message id for pagination (messages are DESC, so last one is oldest)
        this.oldestMessageId = messages[messages.length - 1]?.id || null;

        // Reverse to show oldest first (ASC)
        messages.reverse();

        // Save in your conversations object
        this.conversations[userId] = messages.map((m: any) => ({
            text: m.content,
            isMine: m.senderId === myUserId,
            time: new Date(m.createdAt).toLocaleTimeString(),
            id: m.id,  // keep the id for pagination
            reactions: []
        }));

        this.render();
        this.scrollToBottom();
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
  }

  // Load friends from backend API (user-service)
  private async loadFriends() {
    if (this.isLoadingFriends) return;
    this.isLoadingFriends = true;

    try {
      const response = await fetch(`${API_URL}/users/friends`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load friends');
      }

      const data = await response.json();
      const friends: Friend[] = data.friends;

      // Convert friends to users format
      this.users = {};
      const friendIds: number[] = [];

      friends.forEach((friend: Friend) => {
        this.users[friend.id] = {
          id: friend.id,
          name: friend.username,
          avatar: friend.avatar || '👤',
          status: 'Offline',
          lastSeen: '',
          unread: 0,
          typing: false
        };
        friendIds.push(friend.id);
      });

      // Fetch last messages for these friends
      if (friendIds.length > 0) {
        this.fetchLastMessages(friendIds);
      }

      this.render();
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      this.isLoadingFriends = false;
    }
  }

  private async fetchLastMessages(userIds: number[]) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const response = await fetch(`http://localhost:4000/messages/latest-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id.toString()
        },
        body: JSON.stringify({ userIds }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // data is Record<number, Message>
        
        Object.keys(data).forEach((key) => {
          const userId = Number(key);
          const msg = data[userId];
          if (this.users[userId]) {
            this.users[userId].lastMessage = msg.content;
            this.users[userId].lastMessageTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        });
        this.render();
      }
    } catch (error) {
      console.error('Failed to fetch last messages:', error);
    }
  }

  // Load list of blocked users from backend
  private async loadBlockedUsers() {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const response = await fetch('http://localhost:4000/blocked', {
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
        // Load friends and blocked users from backend
        this.loadFriends();
        this.loadBlockedUsers();
        if (!this.socket || !this.socket.connected) {
            this.connectSocket(user);
        }
      } else {
        // Clear data when logged out
        this.users = {};
        this.conversations = {};
        this.blockedUsers.clear();
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        this.render();
      }
    });
  }

  private connectSocket(user: any) {
    if (this.socket && this.socket.connected) return;

    this.socket = io("http://localhost:4000");

    this.socket.on("connect", () => {
      console.log("Connected to chat server");
      this.socket?.emit("join", user.id);
    });

    this.socket.on("receive-message", (message: any) => {
      this.handleReceiveMessage(message);
    });
  }

  private handleReceiveMessage(message: any) {
    const currentUser = userState.get();
    if (!currentUser) return;

    const isMine = message.from === currentUser.id;
    const otherUserId = isMine ? message.to : message.from;
    
    if (!this.conversations[otherUserId]) {
      this.conversations[otherUserId] = [];
    }

    // Check if message already exists (to avoid duplicates if we optimistically added it)
    // But currently sendMessage adds it optimistically without ID.
    // If we receive it back from socket, we might want to update the ID or ignore if we don't care about ID sync yet.
    // However, since we are syncing across tabs, we should add it if it's not there.
    // Or better: The optimistic add in sendMessage should probably be replaced by waiting for the socket event 
    // OR we just handle the duplication check.
    
    // Simple duplication check by ID if available
    const exists = this.conversations[otherUserId].some(m => m.id === message.id);
    if (exists) return;

    const timeStr = new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    this.conversations[otherUserId].push({
      text: message.content,
      isMine: isMine,
      time: timeStr,
      id: message.id,
      reactions: []
    });

    // Update last message in user list
    if (this.users[otherUserId]) {
        this.users[otherUserId].lastMessage = message.content;
        this.users[otherUserId].lastMessageTime = timeStr;
    }

    if (this.currentChatUserId === otherUserId) {
      this.render();
      this.scrollToBottom();
    } else {
      if (!isMine && this.users[otherUserId]) {
          this.users[otherUserId].unread = (this.users[otherUserId].unread || 0) + 1;
          this.render();
      } else {
          // Re-render to show updated last message even if not unread
          this.render();
      }
    }
  }

  constructor() {
    super("div", "w-full max-w-3xl mx-auto");
    this.initSocket();
  }

  unmount() {
    if (this.unsubscribeAuth) {
        this.unsubscribeAuth();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    super.unmount();
  }

  getStatusColor(status: string) {
    switch(status) {
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

  renderAvatar(avatar: string | undefined, size: string = 'w-8 h-8') {
    if (avatar && (avatar.startsWith('/') || avatar.startsWith('http'))) {
      return `<img src="${avatar}" alt="avatar" class="${size} rounded-full object-cover" />`;
    }
    return `<span class="text-lg">${avatar || '👤'}</span>`;
  }

  renderUsersList() {
    if (this.activeTab === 'tournaments') {
      return `
        <div class="p-4 space-y-3">
          <div class="bg-neon-cyan/10 p-3 rounded-lg border border-neon-cyan/30">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-bold text-gray-200 text-sm">Summer Championship</h3>
              <span class="text-xs bg-neon-cyan/30 text-neon-cyan px-1.5 py-0.5 rounded">Live</span>
            </div>
            <p class="text-xs text-gray-400 mb-2">Semi-finals starting in 10m</p>
            <button class="w-full bg-neon-cyan text-space-dark text-xs py-1.5 rounded hover:bg-neon-cyan/80 transition font-medium">Watch Now</button>
          </div>
          
          <div class="bg-space-dark/50 p-3 rounded-lg border border-neon-purple/20">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-bold text-gray-200 text-sm">Weekly Blitz</h3>
              <span class="text-xs bg-neon-purple/30 text-neon-purple px-1.5 py-0.5 rounded">Upcoming</span>
            </div>
            <p class="text-xs text-gray-400 mb-2">Registration closes in 2h</p>
            <button class="w-full border border-neon-purple text-neon-purple text-xs py-1.5 rounded hover:bg-neon-purple/10 transition">Register</button>
          </div>
        </div>
      `;
    }

    const filtered = Object.values(this.users).filter(user => 
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    return filtered.map(user => `
      <div class="user-item p-2 cursor-pointer transition-all hover:bg-neon-cyan/10 border-l-4 ${
        this.currentChatUserId === user.id 
          ? 'bg-neon-cyan/10 border-neon-cyan' 
          : 'border-transparent'
      }" data-user-id="${user.id}">
        <div class="flex items-center gap-2">
          <div class="relative">
            <div class="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
              ${this.renderAvatar(user.avatar)}
            </div>
            <div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${this.getStatusColor(user.status)} rounded-full border-2 border-space-dark"></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-200 truncate">${this.escapeHtml(user.name)}</h3>
              ${user.lastMessageTime ? `<span class="text-[10px] text-gray-500">${user.lastMessageTime}</span>` : ''}
            </div>
            <div class="flex justify-between items-center">
              <p class="text-xs text-gray-500 truncate max-w-[120px]">${user.lastMessage ? this.escapeHtml(user.lastMessage) : this.escapeHtml(user.lastSeen)}</p>
              ${user.unread > 0 ? `
                <span class="bg-neon-cyan text-space-dark text-xs rounded-full px-2 py-0.5 font-semibold">
                  ${user.unread}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderMessages() {
    if (!this.currentChatUserId) return '';

    const user = this.users[this.currentChatUserId];
    const isBlocked = this.blockedUsers.has(this.currentChatUserId);
    const messages = this.conversations[this.currentChatUserId] || [];

    // If user is blocked, show header with unblock button and simple message
    if (isBlocked) {
      return `
        <div class="px-4 py-2 border-b border-neon-cyan/10 bg-space-dark/50 flex items-center justify-between rounded-lg mb-4">
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

    const messagesHtml = messages.map((msg) => `
      <div class="flex ${msg.isMine ? 'justify-end' : 'justify-start'}">
        <div class="group max-w-xs lg:max-w-md ${msg.isMine ? 'order-2' : 'order-1'}">
          <div class="px-4 py-3 rounded-2xl ${
            msg.isMine 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-space-blue/80 text-gray-200 rounded-bl-sm border border-neon-cyan/20'
          }">
            <p class="text-sm leading-relaxed">${this.escapeHtml(msg.text)}</p>
          </div>
          <div class="flex items-center gap-2 mt-1 px-2">
            <span class="text-xs text-gray-500">${this.escapeHtml(msg.time)}</span>
            ${msg.reactions.length > 0 ? `
              <div class="flex gap-1">
                ${msg.reactions.map(r => `<span class="text-xs">${r}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="px-4 py-2 border-b border-neon-cyan/10 bg-space-dark/50 flex items-center justify-between rounded-lg mb-4">
        <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" id="chat-user-profile-link" data-user-id="${user.id}" title="View profile">
          <div class="relative">
            <div class="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
              ${this.renderAvatar(user.avatar)}
            </div>
            <div class="absolute bottom-0 right-0 w-2.5 h-2.5 ${this.getStatusColor(user.status)} rounded-full border-2 border-space-dark"></div>
          </div>
          <div>
            <h2 class="font-semibold text-gray-200">${this.escapeHtml(user.name)}</h2>
            <p class="text-xs text-gray-500">${this.escapeHtml(user.lastSeen)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 relative">
          <button id="chat-header-menu-btn" class="p-2 hover:bg-neon-cyan/10 rounded-lg transition text-gray-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </button>
          <div class="menu-actions-container" data-user-id="${user.id}"></div>
        </div>
      </div>

      <div id="messages-container" class="space-y-4 flex-1 overflow-y-auto no-scrollbar">
        ${messagesHtml}
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
        <div class="absolute right-0 top-2 bg-space-blue border border-neon-cyan/20 shadow-xl rounded-xl py-2 z-50 w-40">
            <button class="menu-action-play w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neon-cyan/10 hover:text-neon-cyan flex items-center gap-2 transition-colors" data-user-id="${userId}">
                <span>🎮</span> Play Game
            </button>
            ${isBlocked ? `
              <button class="menu-action-unblock w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-green-500/10 flex items-center gap-2 transition-colors" data-user-id="${userId}">
                  <span>✅</span> Unblock User
              </button>
            ` : `
              <button class="menu-action-block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors" data-user-id="${userId}">
                  <span>🚫</span> Block User
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

    // Show login message if not logged in
    if (!loggedInUser) {
      this.el.innerHTML = `
        <div class="bg-space-blue/80 border border-neon-cyan/20 rounded-2xl shadow-xl p-8 text-center backdrop-blur-md">
          <div class="text-4xl mb-4">🔒</div>
          <p class="text-gray-400">Please login</p>
        </div>
      `;
      return;
    }

    this.el.innerHTML = `
      <div class="bg-space-blue/80 border border-neon-cyan/20 rounded-2xl shadow-2xl overflow-hidden h-[500px] flex backdrop-blur-md">
        
        <!-- Sidebar -->
        <div class="w-64 bg-space-dark/50 border-r border-neon-cyan/10 flex flex-col">
          <div class="p-3 border-b border-neon-cyan/10">
            <div class="flex justify-between items-center mb-2">
              <h1 class="text-lg font-bold text-neon-cyan">Messages</h1>
              ${loggedInUser ? `<span class="text-xs text-gray-400 font-mono">#${loggedInUser.id} ${this.escapeHtml(loggedInUser.username)}</span>` : ''}
            </div>
            
            <!-- Tabs -->
            <div class="flex gap-2 mb-3 bg-space-dark/50 p-1 rounded-lg">
              <button id="tab-users" class="flex-1 py-1 px-2 rounded-md text-sm font-medium transition-all ${this.activeTab === 'users' ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm' : 'text-gray-400 hover:text-neon-cyan'}">Users</button>
              <button id="tab-tournaments" class="flex-1 py-1 px-2 rounded-md text-sm font-medium transition-all ${this.activeTab === 'tournaments' ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm' : 'text-gray-400 hover:text-neon-cyan'}">Tournaments</button>
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
                class="w-full pl-10 pr-4 py-2 bg-space-dark/50 border border-neon-cyan/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
          <div id="users-list" class="flex-1 overflow-y-auto no-scrollbar">
            ${this.renderUsersList()}
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="flex-1 flex flex-col bg-space-dark/30">
          ${!currentUser ? `
            <div class="flex-1 flex items-center justify-center text-gray-400">
              <div class="text-center">
                <p class="text-xl font-semibold text-neon-cyan/70">Select a conversation</p>
                <p class="text-sm mt-2">Choose from your friends to start chatting</p>
              </div>
            </div>
          ` : `
            <div class="flex-1 overflow-y-auto no-scrollbar p-6 bg-gradient-to-b from-space-dark/30 to-space-blue/30 flex flex-col">
              ${this.renderMessages()}
            </div>

            ${!this.blockedUsers.has(this.currentChatUserId!) ? `
              <div class="p-4 border-t border-neon-cyan/10 bg-space-dark/50">
                <div class="bg-space-blue/50 border border-neon-cyan/20 rounded-2xl px-4 py-2 flex items-end gap-2">
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

    // Tabs
    const tabUsers = this.el.querySelector('#tab-users');
    const tabTournaments = this.el.querySelector('#tab-tournaments');

    if (tabUsers) {
      tabUsers.addEventListener('click', () => {
        this.activeTab = 'users';
        this.render();
      });
    }

    if (tabTournaments) {
      tabTournaments.addEventListener('click', () => {
        this.activeTab = 'tournaments';
        this.render();
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
    this.el.querySelector('.menu-actions-container')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const playBtn = target.closest('.menu-action-play');
      const blockBtn = target.closest('.menu-action-block');
      const unblockBtn = target.closest('.menu-action-unblock');
      
      if (playBtn) {
        e.stopPropagation();
        const userId = parseInt((playBtn as HTMLElement).dataset.userId || '0');
        console.log('Play with user', userId);
        this.activeMenuUserId = null;
        this.updateMenuDropdown();
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
    if (!content || !this.currentChatUserId) return;

    // Don't add optimistically, wait for socket event to ensure sync and no duplicates
    // The server will emit 'receive-message' back to us

    if (this.socket) {
      this.socket.emit("send_message", {
          to: this.currentChatUserId,
          content: content
      });
    }

    this.messageInput = '';
    // We don't render here, we wait for the message to come back
    // But we should clear the input in the UI
    const inputEl = this.el.querySelector('#message-input') as HTMLTextAreaElement;
    if (inputEl) {
        inputEl.value = '';
    }
  }

  async blockUser(userId: number) {
    const currentUser = userState.get();
    if (!currentUser) return;

    try {
      const res = await fetch('http://localhost:4000/block', {
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
      const res = await fetch('http://localhost:4000/unblock', {
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
}
