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

export class Achievements extends Component {
	constructor() {
		super('div', 'bg-gradient-to-br from-space-blue to-space-dark border border-neon-gold/30 rounded-xl p-6');
	}

	render(): void {
		this.el.innerHTML = `
					<h3 class="text-xl font-bold mb-4 text-neon-gold flex items-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-5 h-5 mr-2" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path>
						</svg>
						Achievements
					</h3>
					<div class="space-y-3"><div class="flex items-center space-x-3 p-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30">
						<span class="text-2xl">
							🏆
						</span>
						<span class="text-neon-gold">
							First Victory
						</span>
					</div>
					<div class="flex items-center space-x-3 p-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30">
						<span class="text-2xl">
							🔥
						</span>
						<span class="text-neon-gold">
							10 Win Streak
						</span>
					</div>
					<div class="flex items-center space-x-3 p-3 rounded-lg bg-space-dark/50 border border-gray-700 opacity-50">
						<span class="text-2xl">
							👑
						</span>
						<span class="text-gray-500">
							Tournament Champion
						</span>
					</div>
					<div class="flex items-center space-x-3 p-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30">
						<span class="text-2xl">
							⛓️
						</span>
						<span class="text-neon-gold">
							Blockchain Master
						</span>
					</div>
				</div>
				` 
	}
}

