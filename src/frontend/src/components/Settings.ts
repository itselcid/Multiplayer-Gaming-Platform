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
import { navigate, renderRoute } from "../core/router";

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
		const oldpassword = formData.get('oldpassword') as string;
		const newpassword = formData.get('newpassword') as string;
		const repeatednewpasswd = formData.get('repeatednewpasswd') as string;

		const body: any = {};
		if (username) body.username = username;
		if (newpassword && repeatednewpasswd) {
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
			this.close();
			renderRoute();
			form.reset();
		} catch (error: any) {
			this.setMessage('error', error.message || 'Failed to update profile');
		} finally {
			this.isLoading = false;
			this.render();
		}
	}

	private async uploadAvatar(file: File): Promise<void> {
		if (!file) {
			this.setMessage('error', 'Please select an image file');
			return;
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			this.setMessage('error', 'Please select a valid image file (JPEG, PNG, GIF, or WebP)');
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			this.setMessage('error', 'Image size must be less than 5MB');
			return;
		}

		this.isLoading = true;
		this.render();

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch(`${API_URL}/users/me/avatar`, {
				method: 'POST',
				credentials: 'include',
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to upload avatar');
			}

			// Refresh user state
			const user = await AuthService.getCurrentUser();
			userState.set(user);
			this.close();
			renderRoute();

			this.setMessage('success', 'Avatar updated successfully!');
		} catch (error: any) {
			this.setMessage('error', error.message || 'Failed to upload avatar');
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

		// Avatar upload
		const avatarInput = this.el.querySelector('#settings-avatar-input') as HTMLInputElement;
		avatarInput?.addEventListener('change', async (e) => {
			const target = e.target as HTMLInputElement;
			const file = target.files?.[0];
			if (file) {
				await this.uploadAvatar(file);
			}
		});

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
		const avatar = user?.avatar ? `${user.avatar}` : '/public/default-avatar.png';
		const avatarUrl = avatar.startsWith('http') ? avatar : `/public/${avatar}`;
		return `
			<!-- Avatar Upload Section -->
			<div class="settings-avatar-section">
				<div class="settings-avatar-preview">
					<img src="${avatarUrl}" alt="Current avatar" class="settings-avatar-img" />
					<label for="settings-avatar-input" class="settings-avatar-overlay">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
							<circle cx="12" cy="13" r="4"/>
						</svg>
						<span>Change</span>
					</label>
				</div>
				<input type="file" id="settings-avatar-input" accept="image/jpeg,image/png,image/gif,image/webp" hidden />
				<p class="settings-hint">Click to upload a new avatar (max 5MB)</p>
			</div>
			<div class="settings-divider"></div>
			<form id="settings-profile-form" class="settings-form">
				<div class="settings-form-group">
					<label class="settings-label">Username</label>
					<input type="text" name="username" class="settings-input" placeholder="${user?.username || 'Enter username'}" minlength="3" maxlength="16" />
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
		const has2FAMethod = user?.twoFactor?.method;
		const is2FAEnabled = user?.twoFactor?.enabled && has2FAMethod;

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

		// Show disable form if 2FA method exists (whether enabled or just configured but incomplete)
		if (has2FAMethod) {
			const statusTitle = is2FAEnabled ? '2FA is Enabled' : '2FA Setup Incomplete';
			const statusDescription = is2FAEnabled
				? `Method: ${has2FAMethod === 'totp' ? 'Authenticator App' : 'Email'}`
				: 'Setup was started but not confirmed. Delete to start fresh.';
			return `
				<div class="settings-2fa-status">
					<div class="settings-2fa-enabled ${!is2FAEnabled ? 'settings-2fa-pending' : ''}">
						<svg class="settings-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
							${is2FAEnabled ? '<path d="m9 12 2 2 4-4"/>' : '<path d="M12 8v4"/><path d="M12 16h.01"/>'}
						</svg>
						<div>
							<h4>${statusTitle}</h4>
							<p>${statusDescription}</p>
						</div>
					</div>
					<form id="settings-2fa-disable-form" class="settings-form">
						<div class="settings-form-group">
							<label class="settings-label">Enter password to ${is2FAEnabled ? 'disable' : 'delete'} 2FA</label>
							<input type="password" name="password" class="settings-input" placeholder="Enter password" required />
						</div>
						<button type="submit" class="settings-btn settings-btn-danger" ${this.isLoading ? 'disabled' : ''}>
							${this.isLoading ? 'Disabling...' : (is2FAEnabled ? 'Disable 2FA' : 'Delete 2FA Setup')}
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
					<p class="settings-warning">This action is permanent and cannot be undone. All your data will be deleted.</p>
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
