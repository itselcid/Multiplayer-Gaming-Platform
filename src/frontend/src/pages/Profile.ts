/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Profile.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/05 17:41:32 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/12 02:54:27 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Achievements } from "../components/Achievements";
import { Player_card } from "../components/Player_card";
import { XPTracker } from "../components/xpStatus";
import { Settings } from "../components/Settings";
import { Tournament_history } from "../components/Tournament_history";
import { Match_history } from "../components/match_history";
import { addElement, Component } from "../core/Component";
import { userState } from "../core/appStore";
import { navigate } from "../core/router";

// Use relative URL to go through nginx proxy
const API_URL = '/api';

interface UserAchievement {
	unlockedAt: Date;
	achievement: {
		id: number;
		key: string;
		name: string;
		description: string;
		icon: string;
	};
}

interface UserProfile {
	id: number;
	username: string;
	email: string;
	avatar?: string;
	achievements?: UserAchievement[];
}

export class ProfileView extends Component {
	private userId: number | null = null;
	private otherUser: UserProfile | null = null;
	private isLoading: boolean = false;
	private isOwnProfile: boolean = true;

	constructor(params?: { id?: string }) {
		super('div', 'max-w-6xl mx-auto px-6 py-12');
		// If an ID is passed in URL params, use it; otherwise show logged-in user's profile
		if (params?.id) {
			this.userId = parseInt(params.id);
			const currentUser = userState.get();
			// Check if viewing own profile or another user's
			if (!currentUser || this.userId !== currentUser.id) {
				this.isOwnProfile = false;
				this.isLoading = true;
			}
		}
	}

	async mount(parent: HTMLElement): Promise<void> {
		super.mount(parent);
		if (!this.isOwnProfile && this.userId) {
			await this.loadOtherUserProfile();
		}
	}

	private async loadOtherUserProfile(): Promise<void> {
		try {
			const response = await fetch(`${API_URL}/users/${this.userId}`, {
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				this.otherUser = data.user;
			} else {
				// User not found - redirect to 404
				navigate('/404');
				return;
			}
		} catch (error) {
			console.error('Failed to fetch user profile:', error);
			navigate('/404');
			return;
		}

		// If user data is null/undefined after successful response, also redirect
		if (!this.otherUser) {
			navigate('/404');
			return;
		}

		this.isLoading = false;
		this.render();
	}

	private renderOtherUserCard(): string {
		if (this.isLoading) {
			return '<div class="text-center text-gray-400 py-8">Loading...</div>';
		}

		const user = this.otherUser;
		const displayName = user ? user.username : 'User not found';
		const displayInitial = user ? user.username.charAt(0).toUpperCase() : '?';
		// Build avatar URL - prepend /public if avatar path doesn't start with http
		const avatarPath = user?.avatar || '/default-avatar.png';
		const avatarUrl = avatarPath.startsWith('http') ? avatarPath : `/public${avatarPath}`;

		return `
			<div class="bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-6">
				<div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl overflow-hidden">
					<img src="${avatarUrl}" alt="${displayName}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerHTML='${displayInitial}';" />
				</div>
				<h2 class="text-2xl font-bold text-center mb-6 text-neon-cyan">${displayName}</h2>
			</div>
		`;
	}

	render() {
		this.el.innerHTML = '';

		this.el.insertAdjacentHTML('beforeend', `
								<div class="mb-12 flex items-center justify-between">
								   <h1 class="text-5xl font-bold mb-4 pb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
								   Player Profile
								   </h1>
								   <div id="profile-settings-container"></div>
								</div>
								   `);

		// Add settings button (only for own profile)
		const currentUser = userState.get();
		if (this.isOwnProfile && currentUser) {
			const settingsContainer = this.el.querySelector('#profile-settings-container');
			if (settingsContainer) {
				const settings = new Settings();
				settings.mount(settingsContainer as HTMLElement);
			}
		}
		const container = addElement('div', 'grid grid-cols-1 lg:grid-cols-3 gap-8', this.el);
		const profile_achievement = addElement('div', 'lg:col-span-1 space-y-6', container);

		// If viewing another user's profile, render inline; otherwise use Player_card component
		if (!this.isOwnProfile) {
			profile_achievement.insertAdjacentHTML('beforeend', this.renderOtherUserCard());
		} else {
			const player_card = new Player_card();
			player_card.mount(profile_achievement);
		}


		// Check if user is a guest (not logged in)
		if (!currentUser) {
			// Guest user - show creative call-to-action instead of achievements/match history
			profile_achievement.insertAdjacentHTML('beforeend', `
				<div class="bg-gradient-to-br from-space-blue to-space-dark border border-neon-purple/30 rounded-xl p-6 text-center">
					<div class="text-6xl mb-4">🎮</div>
					<h3 class="text-xl font-bold text-neon-purple mb-2">Ready to Play?</h3>
					<p class="text-gray-400 text-sm">Log in to track your achievements!</p>
				</div>
			`);

			const rightPanel = addElement('div', 'lg:col-span-2', container);
			rightPanel.innerHTML = `
				<div class="bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-8 h-full flex flex-col items-center justify-center text-center">
					<div class="relative mb-8">
						<div class="w-32 h-32 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center animate-pulse">
							<span class="text-7xl">🏓</span>
						</div>
						<div class="absolute -top-2 -right-2 w-8 h-8 bg-neon-gold rounded-full flex items-center justify-center text-lg animate-bounce">
							✨
						</div>
					</div>
					<h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
						Join the Arena
					</h2>
					<p class="text-gray-400 mb-8 max-w-md">
						Create an account to compete against players worldwide, unlock achievements, and climb the leaderboards!
					</p>
					<div class="flex flex-wrap gap-4 justify-center">
						<a href="/register" class="px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg font-bold text-white hover:shadow-lg hover:shadow-neon-cyan/30 transition-all transform hover:scale-105">
							🚀 Get Started
						</a>
						<a href="/login" class="px-8 py-3 bg-space-dark border border-neon-cyan/50 rounded-lg font-bold text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all">
							Sign In
						</a>
					</div>
					<div class="mt-8 flex items-center gap-8 text-gray-500 text-sm">
						<div class="flex items-center gap-2">
							<span class="text-neon-cyan">🏆</span> Earn Trophies
						</div>
						<div class="flex items-center gap-2">
							<span class="text-neon-purple">⚡</span> Real-time Matches
						</div>
						<div class="flex items-center gap-2">
							<span class="text-neon-gold">🔥</span> Streak Rewards
						</div>
					</div>
				</div>
			`;
			return;
		}

		// XP Tracker - between player card and achievements
		// TODO: Replace with actual user XP data when available
		const user = this.isOwnProfile ? currentUser : this.otherUser;
		if (user) {
			const xpTracker = new XPTracker({
				currentXP: (user as any).xp ?? 750,
				maxXP: (user as any).maxXp ?? 1000,
				level: (user as any).level ?? 1
			});
			xpTracker.mount(profile_achievement);
		}

		const achievements = new Achievements(
			!this.isOwnProfile ? this.otherUser?.achievements : undefined
		);
		achievements.mount(profile_achievement);

		// Determine the target user ID for match history
		const targetUserId = this.isOwnProfile
			? currentUser?.id
			: this.userId;

		const match_history = new Match_history(
			targetUserId?.toString() || 'me',
			targetUserId ?? undefined
		);
		match_history.mount(container);
	}
}
