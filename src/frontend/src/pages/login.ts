

import type { HtmlTagDescriptor } from "vite";
import { Component } from "../core/Component";
import '../style.css';
// import { login } from "../core/appStore";
import { navigate } from "../core/router";
import { AuthService } from "../services/auth";

export class Login extends Component {
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
                        Welcome Back
                    </h1>
                    <p class="mt-2 text-gray-400">Login to your Ping Pong account</p>
                </div>

                <!-- Error Message (if any) -->
                ${this.errorMessage ? `
                    <div class="bg-red-700 bg-opacity-10 border border-red-500 text-white-500 px-4 py-3 rounded">
                        ${this.errorMessage}
                    </div>
                ` : ''}

                <!-- Login Form -->
                <form id="login-form" class="space-y-6">
                    
                    <!-- Username Input -->
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input 
                            type="text" 
                            id="username" 
                            required
                            class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Enter your username"
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
                            class="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Enter your password"
                        >
                    </div>

                    <!-- Login Button -->
                    <button 
                        type="submit" 
                        class="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Login
                    </button>
                </form>

                <!-- Divider -->
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-600"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                    </div>
                </div>

                <!-- GitHub OAuth Button -->
                <button 
                    id="github-btn"
                    class="w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                    <span>🐙</span>
                    Login with GitHub
                </button>

                <!-- Sign Up Link -->
                <p class="text-center text-gray-400">
                    Don't have an account? 
                    <a href="/register" class="text-neon-cyan hover:underline">Sign up</a>
                </p>

            </div>
        `;

        // TODO: Attach event listeners here
        this.attachEventListeners();
    }

    private attachEventListeners() {
        // Handle form submit
        const form = this.el.querySelector('#login-form') as HTMLFormElement;
        
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();  // Stop page reload
            
            const username = this.el.querySelector('#username') as HTMLInputElement;
            const password = this.el.querySelector('#password') as HTMLInputElement;
            
            try {
                await AuthService.login(username.value, password.value);
                navigate('/profile');
            } catch (error) {
            // On error, show error message
                if (error instanceof Error) {
                    this.errorMessage = error.message;
                }
                this.render();
            }
        });



        // TODO: Handle GitHub button click
        const githubBtn = this.el.querySelector('#github-btn') as HTMLElement;

        githubBtn?.addEventListener('click', async () => {
            // TODO: Redirect to GitHub OAuth
            try {
                window.location.href = await AuthService.github();
            } catch (error) {
                if (error instanceof Error) {
                    this.errorMessage = error.message;
                }
                this.render();
            }
        });
    }
}


// ------------------------------------------------------------------- OLD Version

// // src/pages/login.ts
// import { Component } from '../core/Component';
// import '../style.css';


// // Login.ts
// export class Login extends Component {
//   constructor() {
//     // Remove background styles from component root
//     super('div', 'w-full min-h-screen flex items-center justify-center');
//   }

//   render() {
//     this.el.insertAdjacentHTML('beforeend', `
//       <div class="bg-ctex/10 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md">
//         <h2 class="text-3xl font-display text-ctex mb-6 text-center">Sign In</h2>
                
//         <!-- Error message display -->
//         <div id="errorMessage" class="hidden mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm"></div>
                
//         <form id="loginForm" class="space-y-4">
//           <div>
//             <label for="text" class="block text-ctex mb-2">Username</label>
//             <input 
//               type="text" 
//               id="username" 
//               name="username"
//               class="w-full px-4 py-2 rounded-lg bg-[#0D1324] text-ctex border border-ctex/30 focus:outline-none focus:border-ctex transition"
//               placeholder="Enter your username"
//               required
//             />
//           </div>
                    
//           <div>
//             <label for="password" class="block text-ctex mb-2">Password</label>
//             <input 
//               type="password" 
//               id="password" 
//               name="password"
//               class="w-full px-4 py-2 rounded-lg bg-[#0D1324] text-ctex border border-ctex/30 focus:outline-none focus:border-ctex transition"
//               placeholder="Enter your password"
//               required
//             />
//           </div>
                    
//           <button 
//             type="submit"
//             id="submitBtn"
//             class="w-full py-3 bg-gradient-to-r from-ctex to-indigo-500 text-[#0D1324] font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Sign In
//           </button>
//         </form>
                
//         <p class="text-ctex/70 text-center mt-4">
//           Don't have an account? 
//           <button id="goToRegister" class="text-ctex hover:underline font-semibold">Register</button>
//         </p>
                
//         <button id="backToWelcome" class="text-ctex/50 hover:text-ctex mt-4 text-sm flex items-center gap-2">
//           <span>←</span> Back to Welcome
//         </button>
//       </div>
//     `);

//     this.attachEventListeners();
//   }

//   attachEventListeners() {
//     const form = this.el.querySelector('#loginForm');
//     const backBtn = this.el.querySelector('#backToWelcome');
//     const registerBtn = this.el.querySelector('#goToRegister');

//     form?.addEventListener('submit', (e) => this.handleLogin(e));
//     backBtn?.addEventListener('click', () => this.navigateToWelcome());
//     registerBtn?.addEventListener('click', () => this.navigateToRegister());
//   }

//   async handleLogin(e: Event) {
//     e.preventDefault();
        
//     const form = e.target as HTMLFormElement;
//     const username = (form.querySelector('#username') as HTMLInputElement).value;
//     const password = (form.querySelector('#password') as HTMLInputElement).value;
//     const submitBtn = form.querySelector('#submitBtn') as HTMLButtonElement;
//     const errorDiv = this.el.querySelector('#errorMessage');

//     // Hide previous errors
//     this.hideError();

//     // Disable button and show loading state
//     submitBtn.disabled = true;
//     submitBtn.textContent = 'Signing in...';

//     try {
//       const response = await fetch('http://localhost:3000/api/auth/login', {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Login failed');
//       }
//       if (errorDiv) {
//         errorDiv.textContent = data.message;
//         errorDiv.classList.remove('hidden');
//       }

//       // Store token (adjust based on your API response structure)
//       if (data.token) {
//         localStorage.setItem('authToken', data.token);
//       }
            
//       // Store user data if provided
//       if (data.user) {
//         localStorage.setItem('userData', JSON.stringify(data.user));
//       }

//       console.log('Login successful:', data);

//       const me = await fetch('http://localhost:3000/api/users/me', {
//         method: 'GET',
//         credentials: "include"
//       })
//       const Medata = await me.json();
//       console.log("====", Medata);
            
//       // Navigate to dashboard or home page
//       this.onLoginSuccess(data);
            
//     } catch (error) {
//       this.showError(error instanceof Error ? error.message : 'An error occurred during login');
//       console.error('Login error:', error);
//     } finally {
//       // Re-enable button
//       submitBtn.disabled = false;
//       submitBtn.textContent = 'Sign In';
//     }
//   }

//   showError(message: string) {
//     const errorDiv = this.el.querySelector('#errorMessage');
//     if (errorDiv) {
//       errorDiv.textContent = message;
//       errorDiv.classList.remove('hidden');
//     }
//   }

//   hideError() {
//     const errorDiv = this.el.querySelector('#errorMessage');
//     if (errorDiv) {
//       errorDiv.classList.add('hidden');
//     }
//   }

//   onLoginSuccess(data: any) {
//     // Dispatch custom event or use your router to navigate
//     window.dispatchEvent(new CustomEvent('user-logged-in', { detail: data }));
        
//     // Example navigation (adjust based on your routing system)
//     // window.location.hash = '#/dashboard';
//   }

//   navigateToWelcome() {
//     window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'welcome' } }));
//     // Or: window.location.hash = '#/welcome';
//   }

//   navigateToRegister() {
//     window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'register' } }));
//     // Or: window.location.hash = '#/register';
//   }
// }

// // AuthService.ts (separate service for reusability)
// export class AuthService {
//   private static baseURL = 'http://localhost:3000/api';

//   static async login(email: string, password: string) {
//     const response = await fetch(`${this.baseURL}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Login failed');
//     }

//     return response.json();
//   }

//   static async register(email: string, password: string, username?: string) {
//     const response = await fetch(`${this.baseURL}/auth/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password, username }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Registration failed');
//     }

//     return response.json();
//   }

//   static logout() {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userData');
//     window.dispatchEvent(new CustomEvent('user-logged-out'));
//   }

//   static isAuthenticated(): boolean {
//     return !!localStorage.getItem('authToken');
//   }

//   static getToken(): string | null {
//     return localStorage.getItem('authToken');
//   }

//   static getUser(): any {
//     const userData = localStorage.getItem('userData');
//     return userData ? JSON.parse(userData) : null;
//   }

//   // Helper for authenticated requests
//   static async authenticatedFetch(url: string, options: RequestInit = {}) {
//     const token = this.getToken();
        
//     const headers = {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//       ...options.headers,
//     };

//     return fetch(url, { ...options, headers });
//   }
// }



