
import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { AuthService, TwoFactorRequiredError } from "../services/auth";

export class Login extends Component {
    private errorMessage: string = '';

    constructor() {
        // Removed transition-all and backdrop properties from the parent container to avoid heavy repaints
        super('div', 'fixed inset-0 z-[100] flex items-center justify-center');
        this.el.id = 'auth-overlay';
    }

    render() {
        this.el.innerHTML = `
            <div id="auth-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out will-change-opacity"></div>

            <div id="auth-content" class="relative z-10 w-[420px] rounded-xl overflow-hidden opacity-0 translate-y-10 scale-95 transition-[opacity,transform] duration-500 ease-out will-change-transform" 
                 style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(10, 30, 60, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
                
                <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>

                <div class="relative z-10 px-10 py-8">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <h1 class="font-['Audiowide',sans-serif] text-[28px] tracking-wide mb-2">
                            <span class="text-[#00d9ff]">SIGN IN</span>
                        </h1>
                        <p class="font-['Zen_Dots',sans-serif] text-[11px] text-white/60">Access your account</p>
                    </div>

                    <!-- Error Message -->
                    <div id="error-message" class="text-red-400 text-xs text-center mb-4 ${this.errorMessage ? '' : 'hidden'}">
                        ${this.errorMessage}
                    </div>

                    <!-- Login Form -->
                    <form id="login-form" class="flex flex-col gap-5">
                        <!-- Username Input -->
                        <div class="relative">
                            <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Username</label>
                            <div id="username-container" class="relative h-[44px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                                <input type="text" id="username" placeholder="Enter username" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                            </div>
                        </div>

                        <!-- Password Input -->
                        <div class="relative">
                            <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Password</label>
                            <div id="password-container" class="relative h-[44px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                                <input type="password" id="password" placeholder="Enter password" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                            </div>
                        </div>

                        <!-- Login Button -->
                        <button type="submit" class="mt-4 h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-transform transform hover:scale-[1.02] active:scale-[0.98]" style="background: #00d9ff; color: #0a1628; box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                            Sign In
                        </button>

                        <!-- Forgot Password -->
                        <div class="text-center -mt-2">
                            <button type="button" id="forgot-password-btn" class="font-['Zen_Dots',sans-serif] text-[9px] text-white/50 hover:text-[#00d9ff] transition-colors">forgot password?</button>
                        </div>
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

                    <!-- Alternative Login -->
                    <button type="button" id="github-btn" class="w-full h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-transform transform hover:scale-[1.02] active:scale-[0.98]" style="background: rgba(168, 85, 247, 0.2); color: #b967ff; border: 1.5px solid #b967ff; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);">
                        Continue with Github
                    </button>

                    <!-- Register Link -->
                    <div class="text-center mt-6">
                        <span class="font-['Zen_Dots',sans-serif] text-[10px] text-white/50">New player? </span>
                        <button type="button" id="register-btn" class="font-['Zen_Dots',sans-serif] text-[10px] text-[#00d9ff] hover:text-[#b967ff] transition-colors">
                            Create account
                        </button>
                    </div>

                </div>
            </div>
            
             <!-- Close Area to click outside -->
            <div id="close-area" class="absolute inset-0 z-0"></div>
        `;

        this.attachEventListeners();
    }

    mount(parent: HTMLElement) {
        super.mount(parent);

        // Trigger enter animation in the next frame to ensure DOM is ready and transitions trigger
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
        const passwordInput = this.el.querySelector('#password') as HTMLInputElement;
        const usernameContainer = this.el.querySelector('#username-container') as HTMLElement;
        const passwordContainer = this.el.querySelector('#password-container') as HTMLElement;
        const form = this.el.querySelector('#login-form') as HTMLFormElement;
        const registerBtn = this.el.querySelector('#register-btn') as HTMLButtonElement;
        const forgotPasswordBtn = this.el.querySelector('#forgot-password-btn') as HTMLButtonElement;
        const githubBtn = this.el.querySelector('#github-btn') as HTMLButtonElement;
        const closeArea = this.el.querySelector('#close-area') as HTMLElement;

        // Visual effects for inputs
        // Removed heavy box-shadow transition, kept it simpler or use specific transitions
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

        passwordInput?.addEventListener('focus', () => setFocus(passwordContainer, true));
        passwordInput?.addEventListener('blur', () => setFocus(passwordContainer, false));

        // Form Submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.setErrorMessage('');

            if (!usernameInput.value || !passwordInput.value) {
                this.setErrorMessage('Please fill in all fields');
                return;
            }

            try {
                await AuthService.login(usernameInput.value, passwordInput.value);
                this.onNavigate('/profile');
            } catch (error) {
                // Check if 2FA is required
                if (error instanceof TwoFactorRequiredError) {
                    // Navigate to 2FA verification page with method
                    this.onNavigate(`/login/verify?method=${error.method}`);
                    return;
                }
                if (error instanceof Error) {
                    this.setErrorMessage(error.message);
                } else {
                    this.setErrorMessage('Login failed');
                }
            }
        });

        // Navigation
        forgotPasswordBtn?.addEventListener('click', () => {
            this.onNavigate('/forgot-password');
        });

        registerBtn?.addEventListener('click', () => {
            this.onNavigate('/register');
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
                    this.setErrorMessage(error.message);
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
        }, 400); // Match transition duration (slightly less to be safe)
    }

    private setErrorMessage(msg: string) {
        this.errorMessage = msg;
        const errorEl = this.el.querySelector('#error-message');
        if (errorEl) {
            errorEl.textContent = msg;
            if (msg) errorEl.classList.remove('hidden');
            else errorEl.classList.add('hidden');
        }
    }
}
