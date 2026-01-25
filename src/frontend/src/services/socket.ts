/* ************************************************************************** */
/*                                                                            */
/*   socket.ts                                          :::      ::::::::   */
/*                                                    +:+ +:+         +:+     */
/*   By: Antigravity                                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/01/23 19:15:00 by Antigravity       #+#    #+#             */
/*                                                                            */
/* ************************************************************************** */

import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, (...args: any[]) => void> = new Map();

    connect() {
        if (this.socket?.connected) return;


        const SOCKET_URL = '/';

        this.socket = io(SOCKET_URL, {
            withCredentials: true, // Critical for cookie-based auth
            path: '/online-status/',
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            this.reattachListeners();
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');    // for debuginh
        });

        this.socket.on('connect_error', (err: Error) => {
            console.error('Socket connection error:', err.message);    // for debuginh
        });

        // Debug: Listen for friends status
        this.socket.on('friend_status', (data: any) => {
            console.log('Friend status update:', data);    // for debuging
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Subscribe to an event
     */
    on(event: string, callback: (...args: any[]) => void) {
        // Store listener to re-attach if socket reconnects/re-initializes
        this.listeners.set(event, callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    /**
     * Unsubscribe from an event
     */
    off(event: string) {
        this.listeners.delete(event);
        if (this.socket) {
            this.socket.off(event);
        }
    }

    emit(event: string, data?: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
    }

    isSocketConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    private reattachListeners() {
        if (!this.socket) return;
        this.listeners.forEach((callback, event) => {
            // Avoid adding duplicate listeners if they persist
            if (!this.socket?.hasListeners(event)) {
                this.socket?.on(event, callback);
            }
        });
    }
}

export const socketService = new SocketService();
