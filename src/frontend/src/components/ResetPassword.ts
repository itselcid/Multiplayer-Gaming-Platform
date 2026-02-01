import { Component } from "../core/Component";
import { navigate } from "../core/router";

export class ResetPassword extends Component {
    private step: 'form' | 'success' = 'form';
    private newPassword: string = '';
    private confirmPassword: string = '';
    private token: string = '';

    constructor() {
        super('div', 'fixed inset-0 z-[100] flex items-center justify-center');
        this.el.id = 'auth-overlay';

        // Extract token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.token = urlParams.get('token') || '';
    }

    render() {
        this.el.innerHTML = `
            <!-- Backdrop -->
            <div id="auth-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out will-change-opacity"></div>

            <!-- Box Container -->
            <div id="auth-content" class="relative z-10 w-[420px] rounded-xl overflow-hidden opacity-0 translate-y-10 scale-95 transition-[opacity,transform] duration-500 ease-out will-change-transform" 
                 style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(10, 30, 60, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
                
                <!-- Diagonal pattern overlay -->
                <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>

                <div class="relative z-10 px-10 py-8" id="content-container">
                    <!-- Dynamic Content will be injected here -->
                </div>
            </div>
            
            <!-- Close Area -->
            <div id="close-area" class="absolute inset-0 z-0"></div>
        `;

        this.renderStep();
        this.attachGlobalListeners();
    }

    private getPasswordStrength(password: string): { strength: number; label: string; color: string } {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Weak', color: '#ff4466' };
        if (strength <= 3) return { strength, label: 'Medium', color: '#ffaa00' };
        return { strength, label: 'Strong', color: '#00ff88' };
    }

    private renderStep() {
        const container = this.el.querySelector('#content-container');
        if (!container) return;

        if (this.step === 'form') {
            const passwordStrength = this.getPasswordStrength(this.newPassword);

            container.innerHTML = `
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="flex justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#00d9ff]" style="filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.6));" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h1 class="font-['Audiowide',sans-serif] text-[28px] tracking-wide mb-2">
                        <span class="text-[#00d9ff]">NEW PASSWORD</span>
                    </h1>
                    <p class="font-['Zen_Dots',sans-serif] text-[11px] text-white/60">Create a strong password for your account</p>
                </div>

                <div id="toast-message" class="hidden mb-4 p-3 rounded-lg text-[11px] font-['Zen_Dots',sans-serif] text-center border"></div>

                <!-- Form -->
                <form id="reset-form" class="flex flex-col gap-5">
                    <!-- New Password Input -->
                    <div class="relative">
                        <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">New Password</label>
                        <div id="new-password-container" class="relative h-[44px] rounded-md transition-all duration-300" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                            <input type="password" id="new-password" value="${this.newPassword}" placeholder="Enter new password" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                        </div>

                        <!-- Password Strength Indicator -->
                        <div id="strength-indicator" class="mt-2 ${this.newPassword ? '' : 'hidden'}">
                            <div class="flex items-center gap-2 mb-1">
                                <div class="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                                    <div id="strength-bar" class="h-full transition-all duration-300" style="width: ${(passwordStrength.strength / 5) * 100}%; background: ${passwordStrength.color}; box-shadow: 0 0 8px ${passwordStrength.color}"></div>
                                </div>
                                <span id="strength-label" class="font-['Zen_Dots',sans-serif] text-[8px]" style="color: ${passwordStrength.color}">${passwordStrength.label}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Confirm Password Input -->
                    <div class="relative">
                        <label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">Confirm Password</label>
                        <div id="confirm-password-container" class="relative h-[44px] rounded-md transition-all duration-300" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
                            <input type="password" id="confirm-password" value="${this.confirmPassword}" placeholder="Confirm new password" class="w-full h-full bg-transparent border-none outline-none px-4 font-['Zen_Dots',sans-serif] text-[12px] text-white placeholder:text-white/30" />
                            <!-- Password match indicator -->
                            <div id="match-indicator" class="absolute right-3 top-1/2 -translate-y-1/2 ${this.confirmPassword ? '' : 'hidden'}">
                                <div class="w-2 h-2 rounded-full ${this.newPassword === this.confirmPassword ? 'bg-[#00ff88]' : 'bg-[#ff4466]'}" style="box-shadow: 0 0 8px ${this.newPassword === this.confirmPassword ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 68, 102, 0.8)'}"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Password Requirements -->
                    <div class="rounded-lg p-4" style="background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2);">
                        <p class="font-['Zen_Dots',sans-serif] text-[8px] text-white/60 mb-2">Password requirements:</p>
                        <ul id="requirements-list" class="space-y-1">
                            <li class="font-['Zen_Dots',sans-serif] text-[8px] flex items-center gap-2 ${this.newPassword.length >= 8 ? 'text-[#00ff88]' : 'text-white/40'}">
                                <div class="w-1 h-1 rounded-full ${this.newPassword.length >= 8 ? 'bg-[#00ff88]' : 'bg-white/40'}"></div>
                                At least 8 characters
                            </li>
                            <li class="font-['Zen_Dots',sans-serif] text-[8px] flex items-center gap-2 ${/[a-z]/.test(this.newPassword) && /[A-Z]/.test(this.newPassword) ? 'text-[#00ff88]' : 'text-white/40'}">
                                <div class="w-1 h-1 rounded-full ${/[a-z]/.test(this.newPassword) && /[A-Z]/.test(this.newPassword) ? 'bg-[#00ff88]' : 'bg-white/40'}"></div>
                                Upper and lowercase letters
                            </li>
                            <li class="font-['Zen_Dots',sans-serif] text-[8px] flex items-center gap-2 ${/\d/.test(this.newPassword) ? 'text-[#00ff88]' : 'text-white/40'}">
                                <div class="w-1 h-1 rounded-full ${/\d/.test(this.newPassword) ? 'bg-[#00ff88]' : 'bg-white/40'}"></div>
                                At least one number
                            </li>
                        </ul>
                    </div>

                    <button type="submit" class="mt-4 h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98]" style="background: #00d9ff; color: #0a1628; box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                        Reset Password
                    </button>
                </form>
            `;
            this.attachStepListeners();
        } else if (this.step === 'success') {
            container.innerHTML = `
                <!-- Success Message -->
                <div class="text-center py-8">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style="background: rgba(0, 255, 136, 0.1); border: 2px solid #00ff88; box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-[#00ff88]" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <h2 class="font-['Audiowide',sans-serif] text-[20px] text-[#00ff88] mb-3">PASSWORD RESET</h2>
                    <p class="font-['Zen_Dots',sans-serif] text-[10px] text-white/60 mb-6">Your password has been successfully updated</p>
                    <p class="font-['Zen_Dots',sans-serif] text-[9px] text-white/40">Redirecting to login...</p>
                </div>
            `;

            // Auto-redirect after showing success
            setTimeout(() => {
                this.onNavigate('/login');
            }, 2500);
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
        closeArea?.addEventListener('click', () => this.onNavigate('/login'));
    }

    private attachStepListeners() {
        if (this.step === 'form') {
            const form = this.el.querySelector('#reset-form') as HTMLFormElement;
            const newPasswordInput = this.el.querySelector('#new-password') as HTMLInputElement;
            const confirmPasswordInput = this.el.querySelector('#confirm-password') as HTMLInputElement;
            const newPasswordContainer = this.el.querySelector('#new-password-container') as HTMLElement;
            const confirmPasswordContainer = this.el.querySelector('#confirm-password-container') as HTMLElement;

            // Visual effects for new password input
            const setNewPasswordFocus = (focused: boolean) => {
                if (focused) {
                    newPasswordContainer.style.borderColor = '#00d9ff';
                    newPasswordContainer.style.boxShadow = '0 0 15px rgba(0,217,255,0.4)';
                } else {
                    newPasswordContainer.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    newPasswordContainer.style.boxShadow = 'none';
                }
            };

            // Visual effects for confirm password input
            const setConfirmPasswordFocus = (focused: boolean) => {
                if (focused) {
                    confirmPasswordContainer.style.borderColor = '#00d9ff';
                    confirmPasswordContainer.style.boxShadow = '0 0 15px rgba(0,217,255,0.4)';
                } else {
                    confirmPasswordContainer.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    confirmPasswordContainer.style.boxShadow = 'none';
                }
            };

            newPasswordInput?.addEventListener('focus', () => setNewPasswordFocus(true));
            newPasswordInput?.addEventListener('blur', () => setNewPasswordFocus(false));
            newPasswordInput?.addEventListener('input', (e) => {
                this.newPassword = (e.target as HTMLInputElement).value;
                this.updatePasswordStrength();
                this.updateMatchIndicator();
            });

            confirmPasswordInput?.addEventListener('focus', () => setConfirmPasswordFocus(true));
            confirmPasswordInput?.addEventListener('blur', () => setConfirmPasswordFocus(false));
            confirmPasswordInput?.addEventListener('input', (e) => {
                this.confirmPassword = (e.target as HTMLInputElement).value;
                this.updateMatchIndicator();
            });

            // Form submit
            form?.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit();
            });
        }
    }

    private updatePasswordStrength() {
        const strengthIndicator = this.el.querySelector('#strength-indicator');
        const strengthBar = this.el.querySelector('#strength-bar') as HTMLElement;
        const strengthLabel = this.el.querySelector('#strength-label') as HTMLElement;

        if (!strengthIndicator || !strengthBar || !strengthLabel) return;

        const strength = this.getPasswordStrength(this.newPassword);

        if (this.newPassword) {
            strengthIndicator.classList.remove('hidden');
            strengthBar.style.width = `${(strength.strength / 5) * 100}%`;
            strengthBar.style.background = strength.color;
            strengthBar.style.boxShadow = `0 0 8px ${strength.color}`;
            strengthLabel.textContent = strength.label;
            strengthLabel.style.color = strength.color;
        } else {
            strengthIndicator.classList.add('hidden');
        }

        // Update requirements list dynamically
        this.updateRequirementsList();
    }

    private updateRequirementsList() {
        const reqsList = this.el.querySelector('#requirements-list');
        if (!reqsList) return;

        const requirements = [
            { test: this.newPassword.length >= 8, text: 'At least 8 characters' },
            { test: /[a-z]/.test(this.newPassword) && /[A-Z]/.test(this.newPassword), text: 'Upper and lowercase letters' },
            { test: /\d/.test(this.newPassword), text: 'At least one number' }
        ];

        reqsList.innerHTML = requirements.map(req => `
            <li class="font-['Zen_Dots',sans-serif] text-[8px] flex items-center gap-2 ${req.test ? 'text-[#00ff88]' : 'text-white/40'}">
                <div class="w-1 h-1 rounded-full ${req.test ? 'bg-[#00ff88]' : 'bg-white/40'}"></div>
                ${req.text}
            </li>
        `).join('');
    }

    private updateMatchIndicator() {
        const matchIndicator = this.el.querySelector('#match-indicator');
        if (!matchIndicator) return;

        if (this.confirmPassword) {
            matchIndicator.classList.remove('hidden');
            const dot = matchIndicator.querySelector('div');
            if (dot) {
                const isMatch = this.newPassword === this.confirmPassword;
                dot.className = `w-2 h-2 rounded-full ${isMatch ? 'bg-[#00ff88]' : 'bg-[#ff4466]'}`;
                dot.style.boxShadow = isMatch ? '0 0 8px rgba(0, 255, 136, 0.8)' : '0 0 8px rgba(255, 68, 102, 0.8)';
            }
        } else {
            matchIndicator.classList.add('hidden');
        }
    }

    private async handleSubmit() {
        // Validation
        if (!this.newPassword || !this.confirmPassword) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.showToast('Passwords do not match!', 'error');
            return;
        }

        if (this.newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters', 'error');
            return;
        }

        try {
            this.showToast('Resetting password...', 'info');

            // Mock API call - replace with actual endpoint
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ token: this.token, newpassword: this.newPassword })
            });

            if (response.ok) {
                this.showToast('Password reset successful!', 'success');
                this.step = 'success';
                this.renderStep();
            } else {
                this.showToast('Invalid or expired reset token', 'error');
            }
        } catch (error) {
            this.showToast('Reset failed. Please try again.', 'error');
        }
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
