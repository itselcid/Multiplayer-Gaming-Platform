import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getFriends } from '../db'; // You might need to adjust this import based on your db.ts export
import cookie from 'cookie';

interface SocketUser {
    userId: number;
    username: string;
}

class SocketService {
    private io: Server | null = null;

    // Map<UserId, SocketId> - simple in-memory store 
    private onlineUsers = new Map<number, string>();

    initialize(server: any, options: any) {
        this.io = new Server(server, options);

        // 1. Authentication Middleware
        this.io.use((socket, next) => {
            // const token = socket.handshake.auth.token; // Client sends { auth: { token: "..." } }
            // const token = socket.handshake.cookies?.authToken;
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies.authToken;

            if (!token) return next(new Error("Authentication error"));

            try {
                const decoded = jwt.verify(token, env.JWT_SEC) as any;
                // Attach user data to socket session
                // Ensure userId is a number to match DB/Map keys
                const userId = typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId;

                (socket as any).user = { userId: userId, username: decoded.username };
                console.log(`Socket Auth Success: ${decoded.username} (${userId}) type: ${typeof userId}`);
                next();

            } catch (err) {
                console.error("Socket Auth Failed:", err);
                next(new Error("Authentication error"));
            }
        });

        this.io.on('connection', async (socket) => {
            const user = (socket as any).user as SocketUser;

            // 2. Mark as Online
            this.onlineUsers.set(user.userId, socket.id);
            console.log(`User ${user.username} (${user.userId}) connected`);

            // 3. Sync Initial State (Send "Who is online" to ME)
            await this.syncInitialOnlineFriends(socket, user.userId);

            // 4. Notify Friends "I am Online"
            await this.notifyFriendsStatus(user.userId, 'online');

            socket.on('disconnect', async () => {
                // 5. Mark as Offline
                this.onlineUsers.delete(user.userId);
                // 6. Notify Friends "I am Offline"
                await this.notifyFriendsStatus(user.userId, 'offline');
            });
        });
    }

    // Helper: Sync initial online friends to the connecting user
    private async syncInitialOnlineFriends(socket: any, userId: number) {
        try {
            const friends = await getFriends(userId);
            const onlineFriendIds: number[] = [];

            for (const friend of friends) {
                if (this.onlineUsers.has(friend.id)) {
                    onlineFriendIds.push(friend.id);
                }
            }

            // Emit the list to the user
            socket.emit('initial_online_list', onlineFriendIds);
        } catch (error) {
            console.error('Error syncing initial friends:', error);
        }
    }

    // Helper: Notify friends of a status change
    private async notifyFriendsStatus(userId: number, status: 'online' | 'offline') {
        if (!this.io) return;

        try {
            // Get all friends from DB
            const friends = await getFriends(userId);

            // For each friend, check if they are online
            for (const friend of friends) {
                const friendId = friend.id;
                const friendSocketId = this.onlineUsers.get(friendId);

                // If friend is online, send them an event
                if (friendSocketId) {
                    this.io.to(friendSocketId).emit('friend_status', {
                        userId: userId,
                        status: status
                    });
                }
            }
        } catch (error) {
            console.error('Error notifying friends:', error);
        }
    }

    // Public API to check status (e.g. for initial page load)
    isUserOnline(userId: number): boolean {
        return this.onlineUsers.has(userId);
    }
}

export const socketService = new SocketService();
