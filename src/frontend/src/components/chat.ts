// ChatComponent.ts
import { Component } from "../core/Component";
import { io, Socket } from "socket.io-client";

export class chat extends Component {
  private socket!: Socket;
  private userId: number | null = null;
  private currentChatUserId: number | null = null;

  private messagesDiv!: HTMLElement;
  private messageInput!: HTMLInputElement;
  private chatHeaderName!: HTMLElement;
  private sendBtn!: HTMLButtonElement;

  constructor() {
    super("div", "w-full max-w-md flex flex-col gap-4");
  }

  render(): void {
    this.el.innerHTML = `
      <!-- Chat Container -->
      <div id="chat-container" class="w-full h-[600px] bg-white shadow-lg rounded-xl flex flex-col">
        <div class="bg-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center">
          <div class="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
          <h2 class="font-semibold" id="chat-header-name">Chat</h2>
        </div>
        <div id="messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50"></div>
        <div class="border-t p-3 flex gap-2">
          <input id="messageInput" type="text" placeholder="Type a message..." class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 text-black"/>
          <button id="sendBtn" class="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition">Send</button>
        </div>
      </div>
    `;

    // Grab elements
    this.messagesDiv = this.el.querySelector("#messages") as HTMLElement;
    this.messageInput = this.el.querySelector("#messageInput") as HTMLInputElement;
    this.chatHeaderName = this.el.querySelector("#chat-header-name") as HTMLElement;
    this.sendBtn = this.el.querySelector("#sendBtn") as HTMLButtonElement;

    // Attach event listeners
    this.sendBtn.onclick = () => this.sendMessage();
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });

    // Auto-connect
    this.initializeChat();
  }

  private async getCurrentUser() {
    try {
      const response = await fetch("http://localhost:3000/api/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else {
        console.error("Failed to fetch user");
        return null;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  private async initializeChat() {
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      console.log("Logged in as:", currentUser.username);
      this.userId = currentUser.id;
      this.chatHeaderName.textContent = `${currentUser.username}`;
      this.connect();
    }
  }

  private connect() {
    if (!this.userId) return;

    this.socket = io("http://localhost:4000");
    this.socket.on("connect", () => {
      this.socket.emit("join", { id: this.userId });
    });

    this.socket.on("receive-message", (msg: any) => {
      if (msg.from === this.currentChatUserId || msg.to === this.currentChatUserId) {
        this.appendMessage(msg.content, false);
      }
    });

    this.socket.on("message-sent", (msg: any) => {
      this.appendMessage(msg.content, true);
    });
  }

  private joinRoom(targetId: number) {
    this.currentChatUserId = targetId;
    if (!this.currentChatUserId || !this.socket) return;

    this.socket.emit("join-conversation", this.currentChatUserId);
    this.chatHeaderName.textContent = `Chat with User ${this.currentChatUserId}`;
  }

  private sendMessage() {
    const content = this.messageInput.value.trim();
    if (!content || !this.currentChatUserId) return;

    this.socket.emit("send_message", {
      to: this.currentChatUserId,
      content
    });

    this.messageInput.value = "";
  }

  private appendMessage(text: string, isMine: boolean) {
    const messageDiv = document.createElement("div");
    if (isMine)
    {
      messageDiv.className = "flex justify-end";
      messageDiv.innerHTML = `<div class="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs">${text}</div>`;
    }
    else
    {
      messageDiv.className = "flex";
      messageDiv.innerHTML = `<div class="bg-gray-200 px-4 py-2 rounded-lg max-w-xs">${text}</div>`;
    }

    this.messagesDiv.appendChild(messageDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }
}
