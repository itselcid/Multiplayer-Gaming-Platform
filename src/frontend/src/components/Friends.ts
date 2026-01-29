import { Component } from "../core/Component";
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
  username: string;
  email: string;
  avatar?: string;
}

type Tab = 'friends' | 'requests' | 'search';

export class Friends extends Component {
  private unsubscribeAuth: (() => void) | null = null;
  private activeTab: Tab = 'friends';
  private searchQuery: string = '';
  private isLoading: boolean = false;
  private error: string = '';

  // Data from backend
  private friends: Friend[] = [];
  private receivedRequests: Friend[] = [];
  private sentRequests: Friend[] = [];
  private allUsers: User[] = [];
  private myUserId: number | null = null;

  constructor() {
    super("div", "w-full max-w-2xl mx-auto pt-24 px-4 grid-bg min-h-screen");
    this.init();
  }

  private init() {
    this.unsubscribeAuth = userState.subscribe((user) => {
      if (user) {
        this.myUserId = user.id;
        this.loadData();
      } else {
        this.myUserId = null;
        this.friends = [];
        this.receivedRequests = [];
        this.sentRequests = [];
        this.allUsers = [];
        this.render();
      }
    });
  }

  private async loadData() {
    this.isLoading = true;
    this.error = '';
    this.render();

    try {
      const [friends, received, sent, users] = await Promise.all([
        this.getFriends(),
        this.getReceivedRequests(),
        this.getSentRequests(),
        this.getAllUsers()
      ]);

      console.log('Loaded friends:', friends);
      console.log('Loaded received requests:', received);
      console.log('Loaded sent requests:', sent);

      this.friends = friends;
      this.receivedRequests = received;
      this.sentRequests = sent;
      this.allUsers = users;
    } catch (err: any) {
      this.error = err.message || 'Failed to load data';
      console.error('Failed to load friends data:', err);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  // ============ API CALLS (direct to user-service backend) ============

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {};

    // Only set Content-Type if there's a body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response;
  }

  private async getFriends(): Promise<Friend[]> {
    const response = await this.fetchApi('/friends');
    const data = await response.json();
    return data.friends;
  }

  private async getReceivedRequests(): Promise<Friend[]> {
    const response = await this.fetchApi('/friends/requests/received');
    const data = await response.json();
    return data.friends;
  }

  private async getSentRequests(): Promise<Friend[]> {
    const response = await this.fetchApi('/friends/requests/sent');
    const data = await response.json();
    return data.friends;
  }

  private async getAllUsers(): Promise<User[]> {
    const response = await this.fetchApi('/users');
    const data = await response.json();
    return data.users;
  }

  private async sendFriendRequestApi(friendId: number): Promise<void> {
    await this.fetchApi(`/friends/requests/send/${friendId}`, { method: 'PUT' });
  }

  private async acceptRequestApi(friendId: number): Promise<void> {
    await this.fetchApi(`/friends/requests/accept/${friendId}`, { method: 'PUT' });
  }

  private async rejectRequestApi(friendId: number): Promise<void> {
    await this.fetchApi(`/friends/requests/reject/${friendId}`, { method: 'POST' });
  }

  // ============ END API CALLS ============

  unmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    super.unmount();
  }

  private escapeHtml(text: string) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private renderAvatar(avatar: string | undefined, size: string = 'w-10 h-10') {
    if (avatar && (avatar.startsWith('/') || avatar.startsWith('http'))) {
      return `<img src="${avatar}" alt="avatar" class="${size} rounded-full object-cover" />`;
    }
    return `<span class="text-lg">${avatar || '👤'}</span>`;
  }

  private async sendFriendRequest(userId: number) {
    try {
      await this.sendFriendRequestApi(userId);
      await this.loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  }

  private async acceptRequest(friendId: number) {
    try {
      await this.acceptRequestApi(friendId);
      await this.loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  }

  private async rejectRequest(friendId: number) {
    try {
      await this.rejectRequestApi(friendId);
      await this.loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  }

  private renderFriendsList() {
    if (this.friends.length === 0) {
      return `
        <div class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2">👥</div>
          <p>No friends yet</p>
          <p class="text-sm mt-1">Search for users to add friends</p>
        </div>
      `;
    }

    return this.friends.map(friend => `
      <div class="flex items-center justify-between p-3 bg-space-dark/50 border border-neon-cyan/10 rounded-lg hover:border-neon-cyan/30 transition">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
            ${this.renderAvatar(friend.avatar)}
          </div>
          <div>
            <h3 class="font-semibold text-gray-200">${this.escapeHtml(friend.username)}</h3>
            <p class="text-xs text-neon-cyan/70">Friend</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  private renderRequestsList() {
    const receivedHtml = this.receivedRequests.length > 0 ? `
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-neon-cyan/80 mb-2">Received Requests</h3>
        ${this.receivedRequests.map(req => `
          <div class="flex items-center justify-between p-3 bg-space-dark/50 border border-neon-cyan/10 rounded-lg mb-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
                ${this.renderAvatar(req.avatar)}
              </div>
              <span class="font-medium text-gray-200">${this.escapeHtml(req.username)}</span>
            </div>
            <div class="flex gap-2">
              <button class="accept-btn bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-500 transition" data-id="${req.id}">
                Accept
              </button>
              <button class="reject-btn bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition" data-id="${req.id}">
                Reject
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const sentHtml = this.sentRequests.length > 0 ? `
      <div>
        <h3 class="text-sm font-semibold text-neon-purple/80 mb-2">Sent Requests (Pending)</h3>
        ${this.sentRequests.map(req => `
          <div class="flex items-center justify-between p-3 bg-space-dark/30 border border-neon-purple/20 rounded-lg mb-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-neon-purple/60 to-neon-purple rounded-full flex items-center justify-center overflow-hidden">
                ${this.renderAvatar(req.avatar)}
              </div>
              <span class="font-medium text-gray-400">${this.escapeHtml(req.username)}</span>
            </div>
            <span class="text-xs text-neon-purple/70">Pending...</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    if (!receivedHtml && !sentHtml) {
      return `
        <div class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2">📬</div>
          <p>No pending requests</p>
        </div>
      `;
    }

    return receivedHtml + sentHtml;
  }

  private renderSearchResults() {
    const query = this.searchQuery.toLowerCase().trim();

    // Get IDs for comparison (convert to numbers for consistent comparison)
    const friendIds = new Set(this.friends.map(f => Number(f.id)));
    const sentRequestIds = new Set(this.sentRequests.map(r => Number(r.id)));
    const receivedRequestIds = new Set(this.receivedRequests.map(r => Number(r.id)));

    // Filter users: exclude self, exclude friends, filter by search query
    const filteredUsers = this.allUsers.filter(user => {
      if (Number(user.id) === Number(this.myUserId)) return false; // Exclude self
      if (friendIds.has(Number(user.id))) return false; // Hide friends from search
      if (!query) return true;
      return user.username.toLowerCase().includes(query);
    });

    if (filteredUsers.length === 0) {
      return `
        <div class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2">🔍</div>
          <p>No users found</p>
        </div>
      `;
    }

    return filteredUsers.map(user => {
      const hasSentRequest = sentRequestIds.has(Number(user.id));
      const hasReceivedRequest = receivedRequestIds.has(Number(user.id));

      let actionBtn = '';
      if (hasSentRequest) {
        actionBtn = `<span class="text-neon-gold text-sm font-medium">✓ Request Sent</span>`;
      } else if (hasReceivedRequest) {
        actionBtn = `<button class="accept-btn bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-500 transition" data-id="${user.id}">Accept</button>`;
      } else {
        actionBtn = `<button class="add-friend-btn bg-neon-purple text-white px-3 py-1 rounded text-sm hover:bg-neon-purple/80 transition" data-id="${user.id}">Add Friend</button>`;
      }

      return `
        <div class="flex items-center justify-between p-3 bg-space-dark/50 border border-neon-cyan/10 rounded-lg mb-2 hover:border-neon-cyan/30 transition">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full flex items-center justify-center overflow-hidden">
              ${this.renderAvatar(user.avatar)}
            </div>
            <div>
              <h3 class="font-semibold text-gray-200">${this.escapeHtml(user.username)}</h3>
              <p class="text-xs text-gray-500">${this.escapeHtml(user.email)}</p>
            </div>
          </div>
          ${actionBtn}
        </div>
      `;
    }).join('');
  }

  render() {
    const loggedInUser = userState.get();

    if (!loggedInUser) {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    this.el.innerHTML = `
      <div class="bg-space-blue/80 border border-neon-cyan/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <!-- Header -->
        <div class="p-4 bg-space-dark/50 border-b border-neon-cyan/10">
          <div class="flex justify-between items-center mb-3">
            <h1 class="text-xl font-bold text-neon-cyan">👥 Friends</h1>
            <span class="text-xs text-gray-400 font-mono"></span>
          </div>
          
          <!-- Tabs -->
          <div class="flex gap-2 bg-space-dark/50 p-1 rounded-lg">
            <button id="tab-friends" class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${this.activeTab === 'friends' ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm' : 'text-gray-400 hover:text-neon-cyan'}">
              Friends (${this.friends.length})
            </button>
            <button id="tab-requests" class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${this.activeTab === 'requests' ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm' : 'text-gray-400 hover:text-neon-cyan'}">
              Requests ${this.receivedRequests.length > 0 ? `(${this.receivedRequests.length})` : ''}
            </button>
            <button id="tab-search" class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${this.activeTab === 'search' ? 'bg-neon-cyan/20 text-neon-cyan shadow-sm' : 'text-gray-400 hover:text-neon-cyan'}">
              Add Friend
            </button>
          </div>

          ${this.activeTab === 'search' ? `
            <div class="mt-3 relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                id="search-input"
                type="text"
                placeholder="Search users by username..."
                value="${this.escapeHtml(this.searchQuery)}"
                class="w-full pl-10 pr-4 py-2 bg-space-dark/50 border border-neon-cyan/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-gray-200 placeholder-gray-500"
              />
            </div>
          ` : ''}
        </div>

        <!-- Content -->
        <div class="p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
          ${this.isLoading ? `
            <div class="text-center py-8">
              <div class="animate-spin text-4xl mb-2">⏳</div>
              <p class="text-gray-400">Loading...</p>
            </div>
          ` : this.error ? `
            <div class="text-center py-8 text-red-400">
              <div class="text-4xl mb-2">❌</div>
              <p>${this.escapeHtml(this.error)}</p>
              <button id="retry-btn" class="mt-2 text-neon-cyan hover:underline">Retry</button>
            </div>
          ` : this.activeTab === 'friends' ? this.renderFriendsList()
        : this.activeTab === 'requests' ? this.renderRequestsList()
          : this.renderSearchResults()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Tab buttons
    const tabFriends = this.el.querySelector('#tab-friends');
    const tabRequests = this.el.querySelector('#tab-requests');
    const tabSearch = this.el.querySelector('#tab-search');

    tabFriends?.addEventListener('click', () => {
      this.activeTab = 'friends';
      this.render();
    });

    tabRequests?.addEventListener('click', () => {
      this.activeTab = 'requests';
      this.render();
    });

    tabSearch?.addEventListener('click', () => {
      this.activeTab = 'search';
      this.render();
    });

    // Search input
    const searchInput = this.el.querySelector('#search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value;
        this.render();
        // Restore focus
        const newInput = this.el.querySelector('#search-input') as HTMLInputElement;
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      });
    }

    // Add friend buttons
    this.el.querySelectorAll('.add-friend-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = parseInt((btn as HTMLElement).dataset.id || '0');
        if (userId) this.sendFriendRequest(userId);
      });
    });

    // Accept buttons
    this.el.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const friendId = parseInt((btn as HTMLElement).dataset.id || '0');
        if (friendId) this.acceptRequest(friendId);
      });
    });

    // Reject buttons
    this.el.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const friendId = parseInt((btn as HTMLElement).dataset.id || '0');
        if (friendId) this.rejectRequest(friendId);
      });
    });

    // Retry button
    const retryBtn = this.el.querySelector('#retry-btn');
    retryBtn?.addEventListener('click', () => this.loadData());
  }
}
