import { Component } from "../core/Component";
import { io, Socket } from "socket.io-client";
import { userState } from "../core/appStore";

const API_URL = 'http://localhost:3000/api';

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
}

interface Message {
  text: string;
  isMine: boolean;
  time: string;
  reactions: string[];
}

export class chat extends Component {
  private socket: Socket | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private currentChatUserId: number | null = null;
  private messageInput: string = '';
  private searchQuery: string = '';
  private activeTab: 'users' | 'tournaments' = 'users';
  private activeMenuUserId: number | null = null;
  private isLoadingFriends: boolean = false;
  
  // Friends loaded from backend API
  private users: Record<number, User> = {};

  private conversations: Record<number, Message[]> = {};

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
      });

      this.render();
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      this.isLoadingFriends = false;
    }
  }

  private initSocket() {
    this.unsubscribeAuth = userState.subscribe((user) => {
      if (user) {
        // Load friends from backend
        this.loadFriends();
        if (!this.socket || !this.socket.connected) {
            this.connectSocket(user);
        }
      } else {
        // Clear data when logged out
        this.users = {};
        this.conversations = {};
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

    const senderId = message.from;
    
    if (!this.conversations[senderId]) {
      this.conversations[senderId] = [];
    }

    const timeStr = new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    this.conversations[senderId].push({
      text: message.content,
      isMine: false,
      time: timeStr,
      reactions: []
    });

    if (this.currentChatUserId === senderId) {
      this.render();
      this.scrollToBottom();
    } else {
      if (this.users[senderId]) {
          this.users[senderId].unread = (this.users[senderId].unread || 0) + 1;
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
              ${user.unread > 0 ? `
                <span class="bg-neon-cyan text-space-dark text-xs rounded-full px-2 py-0.5 font-semibold">
                  ${user.unread}
                </span>
              ` : ''}
            </div>
            <p class="text-xs text-gray-500 truncate">${this.escapeHtml(user.lastSeen)}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderMessages() {
    if (!this.currentChatUserId) return '';

    const user = this.users[this.currentChatUserId];
    const messages = this.conversations[this.currentChatUserId] || [];

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
        <div class="flex items-center gap-2">
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
          ${this.activeMenuUserId === user.id ? `
            <div class="absolute right-0 top-10 bg-space-blue border border-neon-cyan/20 shadow-xl rounded-xl py-2 z-20 w-40 animate-fade-in">
                <button class="menu-action-play w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neon-cyan/10 hover:text-neon-cyan flex items-center gap-2 transition-colors" data-user-id="${user.id}">
                    <span>🎮</span> Play Game
                </button>
                <button class="menu-action-block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors" data-user-id="${user.id}">
                    <span>🚫</span> Block User
                </button>
            </div>
          ` : ''}
        </div>
      </div>

      <div id="messages-container" class="space-y-4 flex-1 overflow-y-auto no-scrollbar">
        ${messagesHtml}
      </div>
    `;
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
          `}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
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

    // Chat header menu button
    const headerMenuBtn = this.el.querySelector('#chat-header-menu-btn');
    if (headerMenuBtn) {
      headerMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentChatUserId) {
            this.activeMenuUserId = this.activeMenuUserId === this.currentChatUserId ? null : this.currentChatUserId;
            this.render();
        }
      });
    }

    // Menu actions
    this.el.querySelectorAll('.menu-action-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const userId = parseInt((btn as HTMLElement).dataset.userId || '0');
        console.log('Play with user', userId);
        this.activeMenuUserId = null;
        this.render();
      });
    });

    this.el.querySelectorAll('.menu-action-block').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const userId = parseInt((btn as HTMLElement).dataset.userId || '0');
        console.log('Block user', userId);
        this.activeMenuUserId = null;
        this.render();
      });
    });

    // Close menu when clicking outside
    this.el.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('#chat-header-menu-btn') && this.activeMenuUserId !== null) {
            this.activeMenuUserId = null;
            this.render();
        }
    });

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
    this.render();
    this.scrollToBottom();
  }

  sendMessage() {
    const content = this.messageInput.trim();
    if (!content || !this.currentChatUserId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (!this.conversations[this.currentChatUserId]) {
      this.conversations[this.currentChatUserId] = [];
    }

    this.conversations[this.currentChatUserId].push({
      text: content,
      isMine: true,
      time: timeStr,
      reactions: []
    });

    if (this.socket) {
      this.socket.emit("send_message", {
          to: this.currentChatUserId,
          content: content
      });
    }

    this.messageInput = '';
    this.render();
    this.scrollToBottom();
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
