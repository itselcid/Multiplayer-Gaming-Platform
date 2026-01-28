// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Settings.ts                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/28 18:25:00 by kez-zoub          #+#    #+#             //
//   Updated: 2026/01/28 18:25:00 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";
import { userState } from "../core/appStore";
import { AuthService } from "../services/auth";
import { navigate } from "../core/router";

const API_URL = '/api';

type SettingsTab = 'profile' | '2fa' | 'danger';

export class Settings extends Component {
    private isOpen: boolean = false;
    private activeTab: SettingsTab = 'profile';
    private isLoading: boolean = false;
    private message: { type: 'success' | 'error'; text: string } | null = null;
    private qrCode: string | null = null;
    private totpSecret: string | null = null;
    private awaiting2FAConfirm: boolean = false;

    constructor() {
        super('div', 'settings-wrapper');
    }

    public toggle(): void {
        this.isOpen = !this.isOpen;
        this.render();
    }

    public open(): void {
        this.isOpen = true;
        this.render();
    }

    public close(): void {
        this.isOpen = false;
        this.qrCode = null;
        this.totpSecret = null;
        this.awaiting2FAConfirm = false;
        this.message = null;
        this.render();
    }

    private setMessage(type: 'success' | 'error', text: string): void {
        this.message = { type, text };
        this.render();
        // Auto-clear after 5 seconds
        setTimeout(() => {
            if (this.message?.text === text) {
                this.message = null;
                this.render();
            }
        }, 5000);
    }

    private async updateProfile(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const oldpassword = formData.get('oldpassword') as string;
        const newpassword = formData.get('newpassword') as string;
        const repeatednewpasswd = formData.get('repeatednewpasswd') as string;

        const body: any = {};
        if (username) body.username = username;
        if (email) body.email = email;
        if (oldpassword && newpassword && repeatednewpasswd) {
            body.password = { oldpassword, newpassword, repeatednewpasswd };
        }

        if (Object.keys(body).length === 0) {
            this.setMessage('error', 'Please fill at least one field to update');
            return;
        }

        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            userState.set(data.user);
            this.setMessage('success', 'Profile updated successfully!');
            form.reset();
        } catch (error: any) {
            this.setMessage('error', error.message || 'Failed to update profile');
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    private async setup2FA(method: 'email' | 'totp', password: string): Promise<void> {
        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`${API_URL}/2fa/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ method, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to setup 2FA');
            }

            this.awaiting2FAConfirm = true;

            if (method === 'totp' && data.qrCode) {
                this.qrCode = data.qrCode;
                this.totpSecret = data.secret;
                this.setMessage('success', 'Scan the QR code with your authenticator app');
            } else {
                this.setMessage('success', data.message || 'Verification code sent to your email');
            }
        } catch (error: any) {
            this.setMessage('error', error.message || 'Failed to setup 2FA');
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    private async confirm2FA(code: string): Promise<void> {
        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`${API_URL}/2fa/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid code');
            }

            // Refresh user state
            const user = await AuthService.getCurrentUser();
            userState.set(user);

            this.awaiting2FAConfirm = false;
            this.qrCode = null;
            this.totpSecret = null;
            this.setMessage('success', '2FA enabled successfully!');
        } catch (error: any) {
            this.setMessage('error', error.message || 'Failed to confirm 2FA');
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    private async disable2FA(password: string): Promise<void> {
        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`${API_URL}/2fa/setup`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to disable 2FA');
            }

            // Refresh user state
            const user = await AuthService.getCurrentUser();
            userState.set(user);

            this.setMessage('success', '2FA disabled successfully!');
        } catch (error: any) {
            this.setMessage('error', error.message || 'Failed to disable 2FA');
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    private async deleteAccount(password: string): Promise<void> {
        this.isLoading = true;
        this.render();

        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete account');
            }

            userState.set(null);
            this.close();
            navigate('/');
        } catch (error: any) {
            this.setMessage('error', error.message || 'Failed to delete account');
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    private async logout(): Promise<void> {
        this.isLoading = true;
        this.render();

        try {
            await AuthService.logout();
            this.close();
            navigate('/');
        } catch (error) {
            this.setMessage('error', 'Failed to logout');
        } finally {
            this.isLoading = false;
        }
    }

    private bindEvents(): void {
        // Close button
        const closeBtn = this.el.querySelector('#settings-close-btn');
        closeBtn?.addEventListener('click', () => this.close());

        // Overlay click to close
        const overlay = this.el.querySelector('#settings-overlay');
        overlay?.addEventListener('click', () => this.close());

        // Tab buttons
        const tabBtns = this.el.querySelectorAll('[data-tab]');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeTab = btn.getAttribute('data-tab') as SettingsTab;
                this.message = null;
                this.qrCode = null;
                this.totpSecret = null;
                this.awaiting2FAConfirm = false;
                this.render();
            });
        });

        // Profile form
        const profileForm = this.el.querySelector('#settings-profile-form');
        profileForm?.addEventListener('submit', (e) => this.updateProfile(e));

        // 2FA setup form
        const setup2faForm = this.el.querySelector('#settings-2fa-setup-form');
        setup2faForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const method = formData.get('method') as 'email' | 'totp';
            const password = formData.get('password') as string;
            await this.setup2FA(method, password);
        });

        // 2FA confirm form
        const confirm2faForm = this.el.querySelector('#settings-2fa-confirm-form');
        confirm2faForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const code = formData.get('code') as string;
            await this.confirm2FA(code);
        });

        // 2FA disable form
        const disable2faForm = this.el.querySelector('#settings-2fa-disable-form');
        disable2faForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const password = formData.get('password') as string;
            await this.disable2FA(password);
        });

        // Delete account form
        const deleteForm = this.el.querySelector('#settings-delete-form');
        deleteForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const password = formData.get('password') as string;
            const confirm = formData.get('confirm') as string;

            if (confirm !== 'DELETE') {
                this.setMessage('error', 'Please type DELETE to confirm');
                return;
            }

            await this.deleteAccount(password);
        });

        // Logout button
        const logoutBtn = this.el.querySelector('#settings-logout-btn');
        logoutBtn?.addEventListener('click', () => this.logout());
    }

    private renderProfileTab(): string {
        const user = userState.get();
        return `
			<form id="settings-profile-form" class="settings-form">
				<div class="settings-form-group">
					<label class="settings-label">Username</label>
					<input type="text" name="username" class="settings-input" placeholder="${user?.username || 'Enter username'}" minlength="3" maxlength="16" />
				</div>
				<div class="settings-form-group">
					<label class="settings-label">Email</label>
					<input type="email" name="email" class="settings-input" placeholder="${user?.email || 'Enter email'}" />
				</div>
				<div class="settings-divider"></div>
				<h4 class="settings-subtitle">Change Password</h4>
				<div class="settings-form-group">
					<label class="settings-label">Current Password</label>
					<input type="password" name="oldpassword" class="settings-input" placeholder="Enter current password" />
				</div>
				<div class="settings-form-group">
					<label class="settings-label">New Password</label>
					<input type="password" name="newpassword" class="settings-input" placeholder="Enter new password" />
				</div>
				<div class="settings-form-group">
					<label class="settings-label">Confirm New Password</label>
					<input type="password" name="repeatednewpasswd" class="settings-input" placeholder="Repeat new password" />
				</div>
				<button type="submit" class="settings-btn settings-btn-primary" ${this.isLoading ? 'disabled' : ''}>
					${this.isLoading ? 'Saving...' : 'Save Changes'}
				</button>
			</form>
		`;
    }

    private render2FATab(): string {
        const user = userState.get();
        const has2FA = user?.twoFactor?.method;

        if (this.awaiting2FAConfirm) {
            return `
				<div class="settings-2fa-confirm">
					${this.qrCode ? `
						<div class="settings-qr-wrapper">
							<img src="${this.qrCode}" alt="QR Code" class="settings-qr-code" />
							<p class="settings-hint">Scan with Google Authenticator or similar app</p>
							${this.totpSecret ? `<p class="settings-secret">Manual entry: <code>${this.totpSecret}</code></p>` : ''}
						</div>
					` : ''}
					<form id="settings-2fa-confirm-form" class="settings-form">
						<div class="settings-form-group">
							<label class="settings-label">Verification Code</label>
							<input type="text" name="code" class="settings-input" placeholder="Enter 6-digit code" required />
						</div>
						<button type="submit" class="settings-btn settings-btn-primary" ${this.isLoading ? 'disabled' : ''}>
							${this.isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
						</button>
					</form>
				</div>
			`;
        }

        if (has2FA) {
            return `
				<div class="settings-2fa-status">
					<div class="settings-2fa-enabled">
						<svg class="settings-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
							<path d="m9 12 2 2 4-4"/>
						</svg>
						<div>
							<h4>2FA is Enabled</h4>
							<p>Method: ${has2FA === 'totp' ? 'Authenticator App' : 'Email'}</p>
						</div>
					</div>
					<form id="settings-2fa-disable-form" class="settings-form">
						<div class="settings-form-group">
							<label class="settings-label">Enter password to disable 2FA</label>
							<input type="password" name="password" class="settings-input" placeholder="Enter password" required />
						</div>
						<button type="submit" class="settings-btn settings-btn-danger" ${this.isLoading ? 'disabled' : ''}>
							${this.isLoading ? 'Disabling...' : 'Disable 2FA'}
						</button>
					</form>
				</div>
			`;
        }

        return `
			<form id="settings-2fa-setup-form" class="settings-form">
				<p class="settings-description">Add an extra layer of security to your account with two-factor authentication.</p>
				<div class="settings-form-group">
					<label class="settings-label">2FA Method</label>
					<div class="settings-radio-group">
						<label class="settings-radio">
							<input type="radio" name="method" value="totp" checked />
							<span class="settings-radio-label">
								<strong>Authenticator App</strong>
								<small>Use Google Authenticator, Authy, etc.</small>
							</span>
						</label>
						<label class="settings-radio">
							<input type="radio" name="method" value="email" />
							<span class="settings-radio-label">
								<strong>Email</strong>
								<small>Receive codes via email</small>
							</span>
						</label>
					</div>
				</div>
				<div class="settings-form-group">
					<label class="settings-label">Password</label>
					<input type="password" name="password" class="settings-input" placeholder="Enter your password" required minlength="4" />
				</div>
				<button type="submit" class="settings-btn settings-btn-primary" ${this.isLoading ? 'disabled' : ''}>
					${this.isLoading ? 'Setting up...' : 'Enable 2FA'}
				</button>
			</form>
		`;
    }

    private renderDangerTab(): string {
        return `
			<div class="settings-danger-zone">
				<div class="settings-danger-section">
					<h4>Logout</h4>
					<p>Sign out of your account on this device.</p>
					<button id="settings-logout-btn" class="settings-btn settings-btn-outline" ${this.isLoading ? 'disabled' : ''}>
						${this.isLoading ? 'Logging out...' : 'Logout'}
					</button>
				</div>
				<div class="settings-divider"></div>
				<div class="settings-danger-section">
					<h4>Delete Account</h4>
					<p class="settings-warning">⚠️ This action is permanent and cannot be undone. All your data will be deleted.</p>
					<form id="settings-delete-form" class="settings-form">
						<div class="settings-form-group">
							<label class="settings-label">Enter your password</label>
							<input type="password" name="password" class="settings-input" placeholder="Enter password" required />
						</div>
						<div class="settings-form-group">
							<label class="settings-label">Type DELETE to confirm</label>
							<input type="text" name="confirm" class="settings-input settings-input-danger" placeholder="DELETE" required />
						</div>
						<button type="submit" class="settings-btn settings-btn-danger" ${this.isLoading ? 'disabled' : ''}>
							${this.isLoading ? 'Deleting...' : 'Delete My Account'}
						</button>
					</form>
				</div>
			</div>
		`;
    }

    render(): void {
        this.el.innerHTML = `
			<style>
				.settings-wrapper {
					position: relative;
					display: inline-block;
				}

				.settings-trigger {
					background: transparent;
					border: none;
					cursor: pointer;
					padding: 0.5rem;
					border-radius: 0.5rem;
					transition: all 0.3s ease;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.settings-trigger:hover {
					background: rgba(45, 215, 255, 0.1);
				}

				.settings-trigger svg {
					width: 1.5rem;
					height: 1.5rem;
					color: #a0aec0;
					transition: all 0.3s ease;
				}

				.settings-trigger:hover svg {
					color: #2dd7ff;
					transform: rotate(45deg);
				}

				.settings-overlay {
					position: fixed;
					inset: 0;
					background: rgba(0, 0, 0, 0.7);
					backdrop-filter: blur(4px);
					z-index: 999;
					animation: fadeIn 0.3s ease;
				}

				.settings-panel {
					position: fixed;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 90%;
					max-width: 500px;
					max-height: 85vh;
					overflow-y: auto;
					background: linear-gradient(135deg, rgba(10, 22, 40, 0.98) 0%, rgba(30, 11, 61, 0.98) 100%);
					border: 2px solid rgba(45, 215, 255, 0.3);
					border-radius: 1rem;
					box-shadow: 0 0 40px rgba(45, 215, 255, 0.2), 0 0 80px rgba(185, 103, 255, 0.1);
					z-index: 1000;
					animation: slideIn 0.3s ease;
				}

				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}

				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translate(-50%, -48%);
					}
					to {
						opacity: 1;
						transform: translate(-50%, -50%);
					}
				}

				.settings-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 1.25rem 1.5rem;
					border-bottom: 1px solid rgba(45, 215, 255, 0.2);
				}

				.settings-title {
					font-family: 'Audiowide', sans-serif;
					font-size: 1.25rem;
					color: #2dd7ff;
					margin: 0;
					text-shadow: 0 0 10px rgba(45, 215, 255, 0.5);
				}

				.settings-close {
					background: transparent;
					border: none;
					cursor: pointer;
					padding: 0.5rem;
					border-radius: 0.5rem;
					transition: all 0.2s ease;
				}

				.settings-close:hover {
					background: rgba(255, 100, 100, 0.2);
				}

				.settings-close svg {
					width: 1.25rem;
					height: 1.25rem;
					color: #a0aec0;
				}

				.settings-close:hover svg {
					color: #ff6b6b;
				}

				.settings-tabs {
					display: flex;
					border-bottom: 1px solid rgba(45, 215, 255, 0.2);
					padding: 0 1rem;
				}

				.settings-tab {
					background: transparent;
					border: none;
					padding: 1rem 1.25rem;
					font-family: 'Inter', sans-serif;
					font-size: 0.875rem;
					color: #a0aec0;
					cursor: pointer;
					position: relative;
					transition: all 0.2s ease;
				}

				.settings-tab:hover {
					color: #2dd7ff;
				}

				.settings-tab.active {
					color: #2dd7ff;
				}

				.settings-tab.active::after {
					content: '';
					position: absolute;
					bottom: -1px;
					left: 0;
					right: 0;
					height: 2px;
					background: linear-gradient(90deg, #2dd7ff, #b967ff);
					box-shadow: 0 0 10px rgba(45, 215, 255, 0.5);
				}

				.settings-tab.danger {
					color: #ff6b6b;
				}

				.settings-content {
					padding: 1.5rem;
				}

				.settings-form {
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}

				.settings-form-group {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}

				.settings-label {
					font-size: 0.875rem;
					color: rgba(255, 255, 255, 0.7);
				}

				.settings-input {
					background: rgba(0, 0, 0, 0.3);
					border: 1px solid rgba(45, 215, 255, 0.3);
					border-radius: 0.5rem;
					padding: 0.75rem 1rem;
					color: white;
					font-size: 0.875rem;
					transition: all 0.2s ease;
				}

				.settings-input:focus {
					outline: none;
					border-color: #2dd7ff;
					box-shadow: 0 0 10px rgba(45, 215, 255, 0.3);
				}

				.settings-input::placeholder {
					color: rgba(255, 255, 255, 0.3);
				}

				.settings-input-danger:focus {
					border-color: #ff6b6b;
					box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
				}

				.settings-divider {
					height: 1px;
					background: rgba(45, 215, 255, 0.2);
					margin: 1rem 0;
				}

				.settings-subtitle {
					font-size: 0.9rem;
					color: #b967ff;
					margin: 0 0 0.5rem 0;
				}

				.settings-btn {
					padding: 0.75rem 1.5rem;
					border-radius: 0.5rem;
					font-family: 'Inter', sans-serif;
					font-size: 0.875rem;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.2s ease;
					border: none;
				}

				.settings-btn:disabled {
					opacity: 0.6;
					cursor: not-allowed;
				}

				.settings-btn-primary {
					background: linear-gradient(135deg, #2dd7ff 0%, #b967ff 100%);
					color: white;
				}

				.settings-btn-primary:hover:not(:disabled) {
					box-shadow: 0 0 20px rgba(45, 215, 255, 0.5);
					transform: translateY(-1px);
				}

				.settings-btn-outline {
					background: transparent;
					border: 1px solid rgba(45, 215, 255, 0.5);
					color: #2dd7ff;
				}

				.settings-btn-outline:hover:not(:disabled) {
					background: rgba(45, 215, 255, 0.1);
					border-color: #2dd7ff;
				}

				.settings-btn-danger {
					background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
					color: white;
				}

				.settings-btn-danger:hover:not(:disabled) {
					box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
					transform: translateY(-1px);
				}

				.settings-message {
					padding: 0.75rem 1rem;
					border-radius: 0.5rem;
					font-size: 0.875rem;
					margin-bottom: 1rem;
				}

				.settings-message-success {
					background: rgba(46, 213, 115, 0.2);
					border: 1px solid rgba(46, 213, 115, 0.5);
					color: #2ed573;
				}

				.settings-message-error {
					background: rgba(255, 107, 107, 0.2);
					border: 1px solid rgba(255, 107, 107, 0.5);
					color: #ff6b6b;
				}

				.settings-description {
					color: rgba(255, 255, 255, 0.6);
					font-size: 0.875rem;
					margin-bottom: 1rem;
				}

				.settings-radio-group {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
				}

				.settings-radio {
					display: flex;
					align-items: flex-start;
					gap: 0.75rem;
					cursor: pointer;
					padding: 0.75rem;
					border: 1px solid rgba(45, 215, 255, 0.2);
					border-radius: 0.5rem;
					transition: all 0.2s ease;
				}

				.settings-radio:hover {
					background: rgba(45, 215, 255, 0.05);
					border-color: rgba(45, 215, 255, 0.4);
				}

				.settings-radio input[type="radio"] {
					accent-color: #2dd7ff;
					margin-top: 0.25rem;
				}

				.settings-radio-label {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;
				}

				.settings-radio-label strong {
					color: white;
					font-size: 0.875rem;
				}

				.settings-radio-label small {
					color: rgba(255, 255, 255, 0.5);
					font-size: 0.75rem;
				}

				.settings-2fa-enabled {
					display: flex;
					align-items: center;
					gap: 1rem;
					padding: 1rem;
					background: rgba(46, 213, 115, 0.1);
					border: 1px solid rgba(46, 213, 115, 0.3);
					border-radius: 0.5rem;
					margin-bottom: 1.5rem;
				}

				.settings-icon-check {
					width: 2.5rem;
					height: 2.5rem;
					color: #2ed573;
				}

				.settings-2fa-enabled h4 {
					color: #2ed573;
					margin: 0;
					font-size: 1rem;
				}

				.settings-2fa-enabled p {
					color: rgba(255, 255, 255, 0.6);
					margin: 0.25rem 0 0 0;
					font-size: 0.8rem;
				}

				.settings-qr-wrapper {
					text-align: center;
					margin-bottom: 1.5rem;
				}

				.settings-qr-code {
					width: 200px;
					height: 200px;
					border-radius: 0.5rem;
					background: white;
					padding: 0.5rem;
				}

				.settings-hint {
					color: rgba(255, 255, 255, 0.6);
					font-size: 0.8rem;
					margin-top: 0.75rem;
				}

				.settings-secret {
					margin-top: 0.5rem;
					font-size: 0.75rem;
					color: rgba(255, 255, 255, 0.5);
				}

				.settings-secret code {
					background: rgba(0, 0, 0, 0.3);
					padding: 0.25rem 0.5rem;
					border-radius: 0.25rem;
					font-family: monospace;
					color: #2dd7ff;
				}

				.settings-danger-zone {
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}

				.settings-danger-section h4 {
					color: white;
					margin: 0 0 0.5rem 0;
					font-size: 1rem;
				}

				.settings-danger-section p {
					color: rgba(255, 255, 255, 0.6);
					font-size: 0.875rem;
					margin: 0 0 1rem 0;
				}

				.settings-warning {
					color: #ff6b6b !important;
					background: rgba(255, 107, 107, 0.1);
					padding: 0.75rem;
					border-radius: 0.5rem;
					border: 1px solid rgba(255, 107, 107, 0.3);
				}

				/* Scrollbar styling */
				.settings-panel::-webkit-scrollbar {
					width: 6px;
				}

				.settings-panel::-webkit-scrollbar-track {
					background: rgba(0, 0, 0, 0.2);
				}

				.settings-panel::-webkit-scrollbar-thumb {
					background: rgba(45, 215, 255, 0.3);
					border-radius: 3px;
				}

				.settings-panel::-webkit-scrollbar-thumb:hover {
					background: rgba(45, 215, 255, 0.5);
				}
			</style>

			<!-- Settings Trigger Button -->
			<button class="settings-trigger" id="settings-trigger-btn" title="Settings">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3"/>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
				</svg>
			</button>

			${this.isOpen ? `
				<!-- Overlay -->
				<div id="settings-overlay" class="settings-overlay"></div>

				<!-- Settings Panel -->
				<div class="settings-panel">
					<div class="settings-header">
						<h2 class="settings-title">Settings</h2>
						<button id="settings-close-btn" class="settings-close">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"/>
								<line x1="6" y1="6" x2="18" y2="18"/>
							</svg>
						</button>
					</div>

					<div class="settings-tabs">
						<button class="settings-tab ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">Profile</button>
						<button class="settings-tab ${this.activeTab === '2fa' ? 'active' : ''}" data-tab="2fa">2FA Security</button>
						<button class="settings-tab danger ${this.activeTab === 'danger' ? 'active' : ''}" data-tab="danger">Danger Zone</button>
					</div>

					<div class="settings-content">
						${this.message ? `
							<div class="settings-message settings-message-${this.message.type}">
								${this.message.text}
							</div>
						` : ''}

						${this.activeTab === 'profile' ? this.renderProfileTab() : ''}
						${this.activeTab === '2fa' ? this.render2FATab() : ''}
						${this.activeTab === 'danger' ? this.renderDangerTab() : ''}
					</div>
				</div>
			` : ''}
		`;

        // Bind trigger button
        const triggerBtn = this.el.querySelector('#settings-trigger-btn');
        triggerBtn?.addEventListener('click', () => this.toggle());

        // Bind other events if panel is open
        if (this.isOpen) {
            this.bindEvents();
        }
    }
}
