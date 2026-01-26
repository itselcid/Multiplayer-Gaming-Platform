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
import { Tournament_history } from "../components/Tournament_history";
import { Match_history } from "../components/match_history";
import { addElement, Component } from "../core/Component";
import { userState } from "../core/appStore";

// Use relative URL to go through nginx proxy
const API_URL = '/api';

interface UserProfile {
	id: number;
	username: string;
	email: string;
	avatar?: string;
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
				this.otherUser = null;
			}
		} catch (error) {
			console.error('Failed to fetch user profile:', error);
			this.otherUser = null;
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
		const displayEmail = user ? user.email : '';
		const displayAvatar = user ? user.username.charAt(0).toUpperCase() : '?';

		return `
			<div class="bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-6">
				<div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl">
					${displayAvatar}
				</div>
				<h2 class="text-2xl font-bold text-center mb-6 text-neon-cyan">${displayName}</h2>
				<div class="space-y-4">
					<div class="flex items-center space-x-3 p-3 bg-space-dark/50 rounded-lg">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-5 h-5 text-neon-cyan"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg>
						<span class="text-gray-300 text-sm">${displayEmail}</span>
					</div>
					<div class="flex items-center space-x-3 p-3 bg-space-dark/50 rounded-lg">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5 text-neon-cyan"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
						<span class="text-gray-300 text-sm font-mono">0X26A2BF1978...71A973CF</span>
					</div>
				</div>
			</div>
		`;
	}

	render() {
		this.el.innerHTML = '';

		this.el.insertAdjacentHTML('beforeend', `
								<div class="mb-12">
								   <h1 class="text-5xl font-bold mb-4 pb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
								   Player Profile
								   </h1>
								</div>
								   `);
		const container = addElement('div', 'grid grid-cols-1 lg:grid-cols-3 gap-8', this.el);
		const profile_achievement = addElement('div', 'lg:col-span-1 space-y-6', container);

		// If viewing another user's profile, render inline; otherwise use Player_card component
		if (!this.isOwnProfile) {
			profile_achievement.insertAdjacentHTML('beforeend', this.renderOtherUserCard());
		} else {
			const player_card = new Player_card();
			player_card.mount(profile_achievement);
		}

		const achievements = new Achievements();
		achievements.mount(profile_achievement);

		// const tournament_history = new Tournament_history();
		// tournament_history.mount(container);

		const match_history = new Match_history();
		match_history.mount(container);
	}
}
