/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/07 16:25:07 by laoubaid          #+#    #+#             */
/*   Updated: 2026/01/30 20:51:38 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { userState } from "../core/appStore";

// Use relative URL to go through nginx proxy
const API_URL = '/api';

// the User type based on backend response
export interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    xp: number;
    twoFactor?: {
        method: string | null;
        enabled?: boolean;
    } | null;
    achievements?: {
        unlockedAt: Date;
        achievement: {
            id: number;
            key: string;
            name: string;
            description: string;
            icon: string;
        };
    }[];
    createdAt: Date;
    updatedAt: Date;
}

interface SignResponse {
    message: string;
    user: User;
}

interface LoginResponse {
    message: string;
    user?: User;
    requires2FA?: boolean;
    method?: 'email' | 'totp';
}

// Custom error class for 2FA required
export class TwoFactorRequiredError extends Error {
    public method: 'email' | 'totp';

    constructor(method: 'email' | 'totp' = 'totp') {
        super('2FA verification required');
        this.name = 'TwoFactorRequiredError';
        this.method = method;
    }
}

export class AuthService {
    // returns a User as a promise, throws TwoFactorRequiredError if 2FA is needed
    static async login(username: string, password: string): Promise<User> {
        try {
            // Make the API request
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Allows cookies to be sent/received
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok) {  // ok in between 200-299
                // Handle different error status codes
                if (response.status === 401) {
                    throw new Error('Invalid email or password');
                } else if (response.status === 400) {
                    throw new Error(data.message || 'Invalid request');
                } else if (response.status === 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    throw new Error('Login failed. Please try again.');
                }
            }

            // Check if 2FA is required
            if (data.requires2FA) {
                // Determine method from message or default to totp
                const method = data.message?.includes('email') ? 'email' : 'totp';
                throw new TwoFactorRequiredError(method);
            }

            if (!data.user) {
                throw new Error('Invalid response from server');
            }

            userState.set(data.user);
            return data.user;

        } catch (error) {
            // Re-throw TwoFactorRequiredError as-is
            if (error instanceof TwoFactorRequiredError) {
                throw error;
            }
            // Handle network errors (server down, no internet, etc.)
            if (error instanceof Error) {
                throw error;  // Re-throw our custom error messages
            }
            throw new Error('Network error. Please check your connection.');
        }
    }

    static async verify2FA(code: string): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/auth/login/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid verification code');
                } else if (response.status === 400) {
                    throw new Error(data.message || 'Invalid request');
                } else {
                    throw new Error('Verification failed. Please try again.');
                }
            }

            // Fetch full user data after successful 2FA
            const user = await AuthService.getCurrentUser();
            if (!user) {
                throw new Error('Failed to get user data');
            }

            return user;

        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error. Please check your connection.');
        }
    }

    static async github(): Promise<string> {
        return `${API_URL}/auth/github`;
    }


    static async register(username: string, email: string, password: string): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Allows cookies to be sent/received
                body: JSON.stringify({ username, email, password }),
            });

            const data: SignResponse = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error(data.message || 'Invalid request');
                } else if (response.status === 409) {
                    throw new Error(data.message || 'User already exists');
                } else {
                    throw new Error('Register failed. Please try again.');
                }
            }

            return await this.login(username, password);

        } catch (error) {
            // Handle network errors (server down, no internet, etc.)
            if (error instanceof Error) {
                throw error;  // Re-throw our custom error messages
            }
            throw new Error('Network error. Please check your connection.');
        }
    }

    static async getCurrentUser(): Promise<User | null> {

        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'GET',
                credentials: 'include',  // Allows cookies to be sent/received
            })

            if (response.status === 401) {
                return null;
            }

            if (!response.ok) {
                throw new Error('failed to get user')
            }

            const data = await response.json();

            userState.set(data.user);        // THE RIGHT PLACE ???
            return data.user;

        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    static async logout(): Promise<any> {

        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',  // Allows cookies to be sent/received
            })
            const data = await response.json();

            userState.set(null);        // THE RIGHT PLACE ???
            return data.message;

        } catch (error) {
            console.error('logout failed! error:', error);
            userState.set(null);        // THE RIGHT PLACE ???
            return null;
        }
    }

}
