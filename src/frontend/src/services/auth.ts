/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: laoubaid <laoubaid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/07 16:25:07 by laoubaid          #+#    #+#             */
/*   Updated: 2025/12/09 00:42:43 by laoubaid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { userState } from "../core/appStore";

const API_URL = 'http://localhost:3000/api';

// Define the User type based on your backend response
export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

// Define what the login and register response looks like
interface SignResponse {
    message: string;
    user: User;
}

export class AuthService {


    // returns a User as a promise, or throw an Error in case of failer !!!
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

            const data: SignResponse = await response.json();

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

            userState.set(data.user);        // THE RIGHT PLACE ???
            return data.user;

        } catch (error) {
            // Handle network errors (server down, no internet, etc.)
            if (error instanceof Error) {
                throw error;  // Re-throw our custom error messages
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
