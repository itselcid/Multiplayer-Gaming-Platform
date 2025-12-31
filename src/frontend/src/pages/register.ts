

import type { HtmlTagDescriptor } from "vite";
import { Component } from "../core/Component";
import '../style.css';
// import { login } from "../core/appStore";
import { navigate } from "../core/router";
import { AuthService } from "../services/auth";

export class Register extends Component {
    private errorMessage: string = '';

    constructor() {
        super('div', 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black');
    }

    render() {
        this.el.innerHTML = `
            <div class="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
                
                <!-- Header -->
                <div class="text-center">
                    <h1 class="text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        Welcome To Galaktic Pong
                    </h1>
                    <p class="mt-2 text-gray-400">Create your account</p>
                </div>

                <!-- Error Message (if any) -->
                ${this.errorMessage ? `
                    <div class="bg-red-700 bg-opacity-10 border border-red-500 text-white-500 px-4 py-3 rounded">
                        ${this.errorMessage}
                    </div>
                ` : ''}

                <!-- Register Form -->
                <form id="register-form" class="space-y-6">
                    
                    <!-- Username Input -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            required
                            minlength="3"
                            class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Enter your username"
                        >
                    </div>

                    <!-- Email Input -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            required
                            class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Enter your email"
                        >
                    </div>

                    <!-- Password Input -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password" 
                            required
                            minlength="8"
                            class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="At least 8 characters"
                        >
                        <p class="mt-1 text-xs text-gray-400">Must be at least 8 characters</p>
                    </div>

                    <!-- Confirm Password Input -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            required
                            minlength="8"
                            class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Confirm your password"
                        >
                    </div>

                    <!-- Register Button -->
                    <button 
                        type="submit" 
                        class="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Create Account
                    </button>
                </form>

                <!-- Sign In Link -->
                <p class="text-center text-gray-400">
                    Already have an account? 
                    <a href="/login" class="text-neon-cyan hover:underline">Sign in</a>
                </p>

            </div>
        `;

        this.attachEventListeners();
    }

    private attachEventListeners() {
        const form = this.el.querySelector('#register-form') as HTMLFormElement;
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();   // stop reload
                
                const username = (this.el.querySelector('#username') as HTMLInputElement).value;
                const email = (this.el.querySelector('#email') as HTMLInputElement).value;
                const password = (this.el.querySelector('#password') as HTMLInputElement).value;
                const confirmPassword = (this.el.querySelector('#confirm-password') as HTMLInputElement).value;
                
                // Clear previous errors
                this.errorMessage = '';
                
                // Validation
                if (password.length < 8) {
                    this.errorMessage = 'Password must be at least 8 characters long';
                    this.render();
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.errorMessage = 'Passwords do not match';
                    this.render();
                    return;
                }
                
                try {

                    await AuthService.register(username, email, password);
                    navigate('/profile');
                    
                } catch (error) {
                    if (error instanceof Error) {
                        this.errorMessage = error.message;
                    }
                    this.render();
                }
            });
        }
    }
}