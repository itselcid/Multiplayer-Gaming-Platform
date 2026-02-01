// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   TwoFactorVerify.ts                                 :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/28 18:52:22 by kez-zoub          #+#    #+#             //
//   Updated: 2026/01/28 18:52:22 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { AuthService } from "../services/auth";
import { userState } from "../core/appStore";

export class TwoFactorVerify extends Component {
    private errorMessage: string = '';
    private isLoading: boolean = false;
    private method: 'email' | 'totp' = 'totp';

    constructor(_params?: Record<string, string>) {
        super('div', 'fixed inset-0 z-[100] flex items-center justify-center');
        this.el.id = 'twofa-overlay';

        // Read method from URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const method = urlParams.get('method');
        if (method === 'email') {
            this.method = 'email';
        }
    }

    render() {
        this.el.innerHTML = `
			<!-- Backdrop -->
			<div id="twofa-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out will-change-opacity"></div>

			<!-- 2FA Verification Box -->
			<div id="twofa-content" class="relative z-10 w-[420px] rounded-xl overflow-hidden opacity-0 translate-y-10 scale-95 transition-[opacity,transform] duration-500 ease-out will-change-transform" 
				 style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(10, 30, 60, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
				
				<!-- Diagonal pattern overlay -->
				<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>

				<div class="relative z-10 px-10 py-8">
					<!-- Header -->
					<div class="text-center mb-8">
						<!-- Shield Icon -->
						<div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style="background: rgba(0, 217, 255, 0.1); border: 2px solid rgba(0, 217, 255, 0.3);">
							<svg class="w-8 h-8 text-[#00d9ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
								<path d="m9 12 2 2 4-4"/>
							</svg>
						</div>
						<h1 class="font-['Audiowide',sans-serif] text-[24px] tracking-wide mb-2">
							<span class="text-[#00d9ff]">2FA VERIFICATION</span>
						</h1>
						<p class="font-['Zen_Dots',sans-serif] text-[11px] text-white/60">
							${this.method === 'email'
                ? 'Enter the code sent to your email'
                : 'Enter the code from your authenticator app'}
						</p>
					</div>

					<!-- Error Message -->
					<div id="twofa-error-message" class="text-red-400 text-xs text-center mb-4 ${this.errorMessage ? '' : 'hidden'}">
						${this.errorMessage}
					</div>

					<!-- 2FA Form -->
					<form id="twofa-form" class="flex flex-col gap-5">
						<!-- Code Input -->
						<div class="relative">
							<label class="block font-['Audiowide',sans-serif] text-[9px] text-[#00d9ff] mb-2 tracking-widest uppercase">
								${this.method === 'email' ? 'Email Code' : 'Authenticator Code'}
							</label>
							<div id="code-container" class="relative h-[56px] rounded-md transition-colors duration-200" style="background: rgba(10, 22, 40, 0.6); border: 1.5px solid rgba(0, 217, 255, 0.3);">
								<input 
									type="text" 
									id="twofa-code" 
									placeholder="000000" 
									maxlength="6"
									autocomplete="one-time-code"
									inputmode="numeric"
									pattern="[0-9]*"
									class="w-full h-full bg-transparent border-none outline-none text-center font-['Audiowide',sans-serif] text-[24px] tracking-[0.5em] text-white placeholder:text-white/20" 
								/>
							</div>
						</div>

						<!-- Verify Button -->
						<button 
							type="submit" 
							id="verify-btn"
							class="mt-2 h-[48px] rounded-lg font-['Audiowide',sans-serif] text-[15px] tracking-wider uppercase transition-transform transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
							style="background: #00d9ff; color: #0a1628; box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);"
							${this.isLoading ? 'disabled' : ''}
						>
							${this.isLoading ? 'Verifying...' : 'Verify'}
						</button>
					</form>

					${this.method === 'email' ? `
						<!-- Resend Code -->
						<div class="text-center mt-4">
							<button type="button" id="resend-code-btn" class="font-['Zen_Dots',sans-serif] text-[9px] text-white/50 hover:text-[#00d9ff] transition-colors">
								Didn't receive the code? Resend
							</button>
						</div>
					` : ''}

					<!-- Help Text -->
					<div class="mt-6 p-4 rounded-lg" style="background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2);">
						<p class="font-['Zen_Dots',sans-serif] text-[9px] text-white/50 text-center">
							${this.method === 'email'
                ? '💡 Check your spam folder if you don\'t see the email'
                : '💡 Open your authenticator app (Google Authenticator, Authy, etc.) to get the code'}
						</p>
					</div>

					<!-- Back to Login -->
					<div class="text-center mt-6">
						<button type="button" id="back-btn" class="font-['Zen_Dots',sans-serif] text-[10px] text-white/50 hover:text-[#b967ff] transition-colors">
							← Back to login
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

        // Trigger enter animation
        requestAnimationFrame(() => {
            this.el.offsetHeight;

            const backdrop = this.el.querySelector('#twofa-backdrop');
            const content = this.el.querySelector('#twofa-content');

            if (backdrop) {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
            }

            if (content) {
                content.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
                content.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            }

            // Focus the code input
            const codeInput = this.el.querySelector('#twofa-code') as HTMLInputElement;
            if (codeInput) {
                codeInput.focus();
            }
        });
    }

    private attachEventListeners() {
        const codeInput = this.el.querySelector('#twofa-code') as HTMLInputElement;
        const codeContainer = this.el.querySelector('#code-container') as HTMLElement;
        const form = this.el.querySelector('#twofa-form') as HTMLFormElement;
        const backBtn = this.el.querySelector('#back-btn') as HTMLButtonElement;
        const resendBtn = this.el.querySelector('#resend-code-btn') as HTMLButtonElement;
        const closeArea = this.el.querySelector('#close-area') as HTMLElement;

        // Visual effects for input
        const setFocus = (container: HTMLElement, focused: boolean) => {
            if (focused) {
                container.style.borderColor = '#00d9ff';
                container.style.boxShadow = '0 0 15px rgba(0,217,255,0.4)';
            } else {
                container.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                container.style.boxShadow = 'none';
            }
        };

        codeInput?.addEventListener('focus', () => setFocus(codeContainer, true));
        codeInput?.addEventListener('blur', () => setFocus(codeContainer, false));

        // Only allow numbers
        codeInput?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/[^0-9]/g, '');
        });

        // Form Submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.setErrorMessage('');

            const code = codeInput.value.trim();

            if (!code || code.length < 6) {
                this.setErrorMessage('Please enter a 6-digit code');
                return;
            }

            await this.verify2FA(code);
        });

        // Back to login
        backBtn?.addEventListener('click', () => {
            this.onNavigate('/login');
        });

        // Resend code (for email method)
        resendBtn?.addEventListener('click', async () => {
            // TODO: Implement resend logic
            // For now, just show a message
            this.setErrorMessage('');
            const originalText = resendBtn.textContent;
            resendBtn.textContent = 'Sending...';
            resendBtn.disabled = true;

            // Simulate sending
            setTimeout(() => {
                resendBtn.textContent = 'Code sent!';
                setTimeout(() => {
                    resendBtn.textContent = originalText;
                    resendBtn.disabled = false;
                }, 2000);
            }, 1000);
        });

        // Close on click outside - go back to login
        closeArea?.addEventListener('click', () => {
            this.onNavigate('/login');
        });
    }

    private async verify2FA(code: string) {
        this.isLoading = true;
        this.render();

        try {
            const user = await AuthService.verify2FA(code);
            userState.set(user);
            this.onNavigate('/profile');
        } catch (error) {
            this.isLoading = false;
            if (error instanceof Error) {
                this.setErrorMessage(error.message);
            } else {
                this.setErrorMessage('Verification failed');
            }
            this.render();
        }
    }

    private onNavigate(path: string) {
        const backdrop = this.el.querySelector('#twofa-backdrop');
        const content = this.el.querySelector('#twofa-content');

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

    private setErrorMessage(msg: string) {
        this.errorMessage = msg;
        const errorEl = this.el.querySelector('#twofa-error-message');
        if (errorEl) {
            errorEl.textContent = msg;
            if (msg) errorEl.classList.remove('hidden');
            else errorEl.classList.add('hidden');
        }
    }
}
