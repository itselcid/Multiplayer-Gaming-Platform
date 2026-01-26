
import { Component } from "../core/Component";
import { navigate } from "../core/router";

export class ForgotPassword extends Component {
    private step: 'email' | 'sent' = 'email';
    private email: string = '';

    constructor() {
        super('div', 'fixed inset-0 z-[100] flex items-center justify-center');
        this.el.id = 'auth-overlay';
    }

    render() {
        this.el.innerHTML = `
            <div id="auth-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out will-change-opacity"></div>

            <div id="auth-content" class="relative z-10 w-[420px] rounded-xl overflow-hidden opacity-0 translate-y-10 scale-95 transition-[opacity,transform] duration-500 ease-out will-change-transform" 
                 style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(30, 11, 61, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
                
                <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>

                <div class="relative z-10 px-10 py-8" id="content-container">
                </div>
            </div>
            
            <div id="close-area" class="absolute inset-0 z-0"></div>
        `;

        this.renderStep();
        this.attachGlobalListeners();
    }

    private renderStep() {
        const container = this.el.querySelector('#content-container');
        if (!container) return;

        if (this.step === 'email') {
            container.innerHTML = `
                <div class="text-center mb-8">
                    <div class="flex justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#00d9ff]" style="filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.6));" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <h1 class="font-['Audiowide',sans-serif] text-[28px] tracking-wide mb-2">
                        <span class="text-[#00d9ff]">RESET PASSWORD</span>
                    </h1>
                    <p class="font-['Zen_Dots',sans-serif] text-[11px] text-white/60">Enter your email to receive a reset link</p>
                </div>
                
                <div id="toast-message" class="hidden mb-4 p-3 rounded-lg text-[11px] font-['Zen_Dots',sans-serif] text-center border"></div>

                <!-- Form -->
                <form id="forgot-form" class="flex flex-col gap-5">
                    <div class="relative">
                        <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Email Address</label>
                        <div id="email-container" class="relative h-[44px] rounded-md transition-all duration-300" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                            <input type="email" id="email" value="${this.email}" placeholder="Enter your email" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                        </div>
                    </div>

                    <button type="submit" class="mt-4 h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98]" style="background: #00d9ff; color: #0a1628; box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                        Send Reset Link
                    </button>

                    <button type="button" id="back-btn" class="flex items-center justify-center gap-2 h-[44px] rounded-lg font-['Zen_Dots',sans-serif] text-[10px] text-white/50 hover:text-[#00d9ff] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        Back to login
                    </button>
                </form>
            `;
            this.attachStepListeners();
        } else if (this.step === 'sent') {
            container.innerHTML = `
                 <!-- Success Message -->
                <div class="text-center py-8">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style="background: rgba(0, 255, 136, 0.1); border: 2px solid #00ff88; box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#00ff88]" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <h2 class="font-['Audiowide',sans-serif] text-[20px] text-[#00ff88] mb-3">EMAIL SENT</h2>
                    <p class="font-['Zen_Dots',sans-serif] text-[10px] text-white/60 mb-6">Check your inbox for the password reset link</p>
                    <div class="rounded-lg p-4 mb-6" style="background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2);">
                        <p class="font-['Zen_Dots',sans-serif] text-[9px] text-white/60">Sent to: <span class="text-[#00d9ff]">${this.email}</span></p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col gap-3">
                    <button id="resend-btn" class="h-[44px] rounded-lg font-['Zen_Dots',sans-serif] text-[10px] text-white/50 hover:text-[#00d9ff] transition-colors" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.2);">
                        Resend email
                    </button>
                    <button type="button" id="back-to-login" class="flex items-center justify-center gap-2 h-[44px] rounded-lg font-['Zen_Dots',sans-serif] text-[10px] text-white/50 hover:text-[#00d9ff] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        Back to login
                    </button>
                </div>
            `;
            this.attachStepListeners();
        }
    }

    mount(parent: HTMLElement) {
        super.mount(parent);

        // Enter animation
        requestAnimationFrame(() => {
            this.el.offsetHeight; // force reflow
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

    private attachGlobalListeners() {
        // Close on area click
        const closeArea = this.el.querySelector('#close-area');
        closeArea?.addEventListener('click', () => this.onNavigate('/login')); // Or back to wherever
    }

    private attachStepListeners() {
        if (this.step === 'email') {
            const form = this.el.querySelector('#forgot-form');
            const emailInput = this.el.querySelector('#email') as HTMLInputElement;
            const backBtn = this.el.querySelector('#back-btn');
            const container = this.el.querySelector('#email-container') as HTMLElement;

            // Visual effects
            const setFocus = (focused: boolean) => {
                if (focused) {
                    container.style.borderColor = '#00d9ff';
                    container.style.boxShadow = '0 0 15px rgba(0,217,255,0.4)';
                } else {
                    container.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    container.style.boxShadow = 'none';
                }
            };
            emailInput?.addEventListener('focus', () => setFocus(true));
            emailInput?.addEventListener('blur', () => setFocus(false));
            emailInput?.addEventListener('input', (e) => this.email = (e.target as HTMLInputElement).value);

            // Back button
            backBtn?.addEventListener('click', () => this.onNavigate('/login'));

            // Submit
            form?.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!this.email) {
                    this.showToast('Please enter your email', 'error');
                    return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(this.email)) {
                    this.showToast('Please enter a valid email address', 'error');
                    return;
                }

                try {
                    // Mock API call - replace with actual endpoint
                    this.showToast('Sending...', 'info');
                    // Simulate delay
                    await new Promise(r => setTimeout(r, 1000));

                    // Assuming API call success here
                    const response = await fetch('/api/auth/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: this.email }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to send reset password email');
                    }

                    this.step = 'sent';
                    this.renderStep();
                } catch (error: any) {
                    this.showToast(error.message, 'error');
                }
            });

        } else if (this.step === 'sent') {
            const resendBtn = this.el.querySelector('#resend-btn');
            const backBtn = this.el.querySelector('#back-to-login');

            resendBtn?.addEventListener('click', () => {
                this.step = 'email';
                this.renderStep();
            });

            backBtn?.addEventListener('click', () => this.onNavigate('/login'));
        }
    }

    // Helper for navigation with exit animation
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

    private showToast(message: string, type: 'error' | 'success' | 'info') {
        const toastEl = this.el.querySelector('#toast-message');
        if (toastEl) {
            toastEl.textContent = message;
            toastEl.classList.remove('hidden');

            if (type === 'error') {
                toastEl.setAttribute('style', 'background: #0a1628; color: #ff4d4d; border: 1px solid #ff4d4d;');
            } else if (type === 'success') {
                toastEl.setAttribute('style', 'background: #0a1628; color: #00ff88; border: 1px solid #00ff88;');
            } else {
                toastEl.setAttribute('style', 'background: #0a1628; color: #00d9ff; border: 1px solid #00d9ff;');
            }

            // Auto hide after 3s
            setTimeout(() => {
                if (toastEl) toastEl.classList.add('hidden');
            }, 3000);
        }
    }
}
