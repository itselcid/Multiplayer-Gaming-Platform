
import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { AuthService } from "../services/auth";

export class Register extends Component {
    private errorMessage: string = '';
    private successMessage: string = '';

    constructor() {
        super('div', 'fixed inset-0 z-[100] flex items-center justify-center');
        this.el.id = 'auth-overlay';
    }

    render() {
        this.el.innerHTML = `
            <!-- Optimized Backdrop -->
            <div id="auth-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out will-change-opacity"></div>

            <!-- Register Box Container -->
            <div id="auth-content" class="relative z-10 w-[420px] rounded-xl overflow-hidden opacity-0 translate-y-10 scale-95 transition-[opacity,transform] duration-500 ease-out will-change-transform" 
                 style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(10, 30, 60, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
                
                <!-- Diagonal pattern overlay -->
                <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>

                <div class="relative z-10 px-10 py-8">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <h1 class="font-['Audiowide',sans-serif] text-[28px] tracking-wide mb-2">
                            <span class="text-[#00d9ff]">SIGN UP</span>
                        </h1>
                        <p class="font-['Zen_Dots',sans-serif] text-[11px] text-white/60">Create your account</p>
                    </div>

                     <!-- Messages -->
                    <div id="error-message" class="text-red-400 text-xs text-center mb-4 hidden"></div>
                    <div id="success-message" class="text-green-400 text-xs text-center mb-4 hidden"></div>

                    <!-- Register Form -->
                    <form id="register-form" class="flex flex-col gap-4">
                        <!-- Username Input -->
                        <div class="relative">
                            <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Username</label>
                            <div id="username-container" class="relative h-[44px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                                <input type="text" id="username" placeholder="Choose username" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                            </div>
                        </div>

                        <!-- Email Input -->
                         <div class="relative">
                            <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Email</label>
                            <div id="email-container" class="relative h-[44px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                                <input type="email" id="email" placeholder="Enter email" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                            </div>
                        </div>

                        <!-- Password Input -->
                        <div class="relative">
                            <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Password</label>
                            <div id="password-container" class="relative h-[44px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                                <input type="password" id="password" placeholder="Create password" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                            </div>
                        </div>

                         <!-- Repeat Password Input -->
                        <div class="relative">
                            <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Confirm Password</label>
                            <div id="repeat-container" class="relative h-[44px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                                <input type="password" id="repeat-password" placeholder="Repeat password" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                                <!-- Password match indicator -->
                                <div id="match-indicator" class="hidden absolute right-3 top-1/2 -translate-y-1/2">
                                     <div id="match-dot" class="w-2 h-2 rounded-full" style="box-shadow: 0 0 8px rgba(0, 0, 0, 0.8);"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Register Button -->
                        <button type="submit" class="mt-4 h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-transform transform hover:scale-[1.02] active:scale-[0.98]" style="background: #00d9ff; color: #0a1628; box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                            Create Account
                        </button>
                    </form>

                    <!-- Divider -->
                    <div class="relative my-6">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-white/10"></div>
                        </div>
                        <div class="relative flex justify-center text-xs uppercase">
                            <span class="px-3 text-white/40 font-['Zen_Dots',sans-serif] text-[9px]" style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.9) 0%, rgba(10, 30, 60, 0.9) 100%);">or</span>
                        </div>
                    </div>

                    <!-- Alternative Registration -->
                    <button type="button" id="github-btn" class="w-full h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-transform transform hover:scale-[1.02] active:scale-[0.98]" style="background: rgba(168, 85, 247, 0.2); color: #b967ff; border: 1.5px solid #b967ff; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);">
                        Continue with Github
                    </button>

                    <!-- Login Link -->
                    <div class="text-center mt-6">
                        <span class="font-['Zen_Dots',sans-serif] text-[10px] text-white/50">Already have an account? </span>
                        <button type="button" id="login-btn" class="font-['Zen_Dots',sans-serif] text-[10px] text-[#00d9ff] hover:text-[#b967ff] transition-colors">
                            Sign in
                        </button>
                    </div>

                </div>
            </div>

             <!-- Close Area -->
            <div id="close-area" class="absolute inset-0 z-0"></div>
        `;

        this.attachEventListeners();
    }

    mount(parent: HTMLElement) {
        super.mount(parent);
        // Trigger enter animation
        requestAnimationFrame(() => {
            // Force reflow
            this.el.offsetHeight;

            const backdrop = this.el.querySelector('#auth-backdrop');
            const content = this.el.querySelector('#auth-content');

            if (backdrop) {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
            }

            if (content) {
                content.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
                content.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            }
        });
    }

    private attachEventListeners() {
        const usernameInput = this.el.querySelector('#username') as HTMLInputElement;
        const emailInput = this.el.querySelector('#email') as HTMLInputElement;
        const passwordInput = this.el.querySelector('#password') as HTMLInputElement;
        const repeatInput = this.el.querySelector('#repeat-password') as HTMLInputElement;

        const usernameContainer = this.el.querySelector('#username-container') as HTMLElement;
        const emailContainer = this.el.querySelector('#email-container') as HTMLElement;
        const passwordContainer = this.el.querySelector('#password-container') as HTMLElement;
        const repeatContainer = this.el.querySelector('#repeat-container') as HTMLElement;

        const matchIndicator = this.el.querySelector('#match-indicator') as HTMLElement;
        const matchDot = this.el.querySelector('#match-dot') as HTMLElement;

        const form = this.el.querySelector('#register-form') as HTMLFormElement;
        const loginBtn = this.el.querySelector('#login-btn') as HTMLButtonElement;
        const githubBtn = this.el.querySelector('#github-btn') as HTMLButtonElement;
        const closeArea = this.el.querySelector('#close-area') as HTMLElement;

        // Visual effects for inputs
        const setFocus = (container: HTMLElement, focused: boolean) => {
            if (focused) {
                container.style.borderColor = '#00d9ff';
                container.style.boxShadow = '0 0 15px rgba(0,217,255,0.4)';
            } else {
                container.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                container.style.boxShadow = 'none';
            }
        };

        usernameInput?.addEventListener('focus', () => setFocus(usernameContainer, true));
        usernameInput?.addEventListener('blur', () => setFocus(usernameContainer, false));

        emailInput?.addEventListener('focus', () => setFocus(emailContainer, true));
        emailInput?.addEventListener('blur', () => setFocus(emailContainer, false));

        passwordInput?.addEventListener('focus', () => setFocus(passwordContainer, true));
        passwordInput?.addEventListener('blur', () => setFocus(passwordContainer, false));

        repeatInput?.addEventListener('focus', () => setFocus(repeatContainer, true));
        repeatInput?.addEventListener('blur', () => setFocus(repeatContainer, false));


        // Password match logic
        const checkMatch = () => {
            const pass = passwordInput.value;
            const repeat = repeatInput.value;

            if (repeat) {
                matchIndicator.classList.remove('hidden');
                if (pass === repeat) {
                    matchDot.style.backgroundColor = '#00ff88';
                    matchDot.style.boxShadow = '0 0 8px rgba(0, 255, 136, 0.8)';
                } else {
                    matchDot.style.backgroundColor = '#ff4466';
                    matchDot.style.boxShadow = '0 0 8px rgba(255, 68, 102, 0.8)';
                }
            } else {
                matchIndicator.classList.add('hidden');
            }
        };

        passwordInput?.addEventListener('input', checkMatch);
        repeatInput?.addEventListener('input', checkMatch);

        // Form Submit
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.setMessage('error', '');
            this.setMessage('success', '');

            const username = usernameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const repeat = repeatInput.value;

            if (!username || !email || !password || !repeat) {
                this.setMessage('error', 'Please fill in all fields');
                return;
            }
            if (password !== repeat) {
                this.setMessage('error', 'Passwords do not match');
                return;
            }
            if (password.length < 6) {
                this.setMessage('error', 'Password must be at least 6 characters');
                return;
            }

            try {
                await AuthService.register(username, email, password);
                this.setMessage('success', 'Registration successful! Redirecting...');
                setTimeout(() => {
                    this.onNavigate('/profile');
                }, 1000);
            } catch (error) {
                if (error instanceof Error) {
                    this.setMessage('error', error.message);
                } else {
                    this.setMessage('error', 'Registration failed');
                }
            }
        });

        loginBtn?.addEventListener('click', () => {
            this.onNavigate('/login');
        });

        // Close on click outside
        closeArea?.addEventListener('click', () => {
            this.onNavigate('/');
        });

        // Github Login
        githubBtn?.addEventListener('click', async () => {
            try {
                window.location.href = await AuthService.github();
            } catch (error) {
                if (error instanceof Error) {
                    this.setMessage('error', error.message);
                }
            }
        });

    }

    private onNavigate(path: string) {
        const backdrop = this.el.querySelector('#auth-backdrop');
        const content = this.el.querySelector('#auth-content');

        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
        }

        if (content) {
            content.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
            content.classList.add('opacity-0', 'translate-y-10', 'scale-95');
        }

        setTimeout(() => {
            navigate(path);
        }, 400);
    }

    private setMessage(type: 'error' | 'success', msg: string) {
        const errorEl = this.el.querySelector('#error-message');
        const successEl = this.el.querySelector('#success-message');

        if (type === 'error' && errorEl) {
            errorEl.textContent = msg;
            if (msg) errorEl.classList.remove('hidden');
            else errorEl.classList.add('hidden');
            if (successEl) successEl.classList.add('hidden');
        } else if (type === 'success' && successEl) {
            successEl.textContent = msg;
            if (msg) successEl.classList.remove('hidden');
            else successEl.classList.add('hidden');
            if (errorEl) errorEl.classList.add('hidden');
        }
    }
}
