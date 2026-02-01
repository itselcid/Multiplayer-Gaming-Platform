// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Achievements.ts                                    :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/06 01:50:41 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/06 02:08:29 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";
import { userState } from "../core/appStore";

// All possible achievements (must match backend seed)
const ALL_ACHIEVEMENTS = [
	{ key: 'FIRST_WIN', name: 'Winner', description: 'Win your first match', icon: '🏆' },
	{ key: 'CONSISTENT', name: 'Consistent', description: 'Play 10 matches', icon: '🎯' },
	{ key: 'ON_FIRE', name: 'On Fire', description: 'Win 3 matches in a row', icon: '🔥' },
	{ key: 'FAMILY', name: 'Family', description: 'Add your first friend', icon: '🤝' },
	{ key: 'FLAWLESS', name: 'Flawless', description: 'Win with 0 points conceded', icon: '💎' },
	{ key: 'LEVEL_UP', name: 'Rising Star', description: 'No longer a beginner', icon: '🌟' }
];

interface Achievement {
	id: number;
	key: string;
	name: string;
	description: string;
	icon: string;
}

interface UserAchievement {
	unlockedAt: Date;
	achievement: Achievement;
}

export class Achievements extends Component {
	private userAchievements: UserAchievement[] | null = null;

	constructor(achievements?: UserAchievement[]) {
		super('div', 'bg-gradient-to-br from-space-blue to-space-dark border border-neon-gold/30 rounded-xl p-6');
		// Use provided achievements (for other user profiles) or get from userState (own profile)
		if (achievements) {
			this.userAchievements = achievements;
		} else {
			const user = userState.get();
			this.userAchievements = user?.achievements || null;
		}
	}

	render(): void {
		// Get the set of unlocked achievement keys for quick lookup
		const unlockedKeys = new Set(
			this.userAchievements?.map(ua => ua.achievement.key) || []
		);

		// Build achievement items HTML
		const achievementItems = ALL_ACHIEVEMENTS.map(achievement => {
			const isUnlocked = unlockedKeys.has(achievement.key);

			if (isUnlocked) {
				// Unlocked achievement - gold styling
				return `
					<div class="flex items-center space-x-3 p-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30" title="${achievement.description}">
						<span class="text-2xl">${achievement.icon}</span>
						<div class="flex flex-col">
							<span class="text-neon-gold font-medium">${achievement.name}</span>
							<span class="text-gray-400 text-xs">${achievement.description}</span>
						</div>
					</div>
				`;
			} else {
				// Locked achievement - dimmed styling
				return `
					<div class="flex items-center space-x-3 p-3 rounded-lg bg-space-dark/50 border border-gray-700 opacity-50" title="${achievement.description}">
						<span class="text-2xl grayscale">${achievement.icon}</span>
						<div class="flex flex-col">
							<span class="text-gray-500 font-medium">${achievement.name}</span>
							<span class="text-gray-600 text-xs">${achievement.description}</span>
						</div>
					</div>
				`;
			}
		}).join('');

		this.el.innerHTML = `
			<h3 class="text-xl font-bold mb-4 text-neon-gold flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-5 h-5 mr-2" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6">
				</svg>
				Achievements
				<span class="ml-auto text-sm text-gray-400">${unlockedKeys.size}/${ALL_ACHIEVEMENTS.length}</span>
			</h3>
			<div class="space-y-3">
				${achievementItems}
			</div>
		`;
	}
}
