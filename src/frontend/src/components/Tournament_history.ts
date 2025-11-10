// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Tournament_history.ts                              :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/06 02:11:14 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/06 02:13:28 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

export class Tournament_history extends Component {
	constructor() {
		super('div', 'lg:col-span-2');
	}

	render(): void {
		this.el.innerHTML = `
			<div class="bg-gradient-to-br from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-6">
				<h3 class="text-2xl font-bold mb-6 text-neon-cyan flex items-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-6 h-6 mr-2" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>
					</svg>
						Tournament History
					</h3>
					<div class="space-y-4">
						<div class="bg-space-dark/50 border border-neon-purple/20 rounded-lg p-4 hover:border-neon-purple/50 transition-all">
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center space-x-4">
									<div class="px-4 py-2 rounded-lg font-bold bg-green-500/20 text-green-400">
										WIN
									</div>
									<div>
										<div class="text-white font-semibold">
											vs NebulaNinja
										</div>
										<div class="text-gray-400 text-sm">
											2024-01-12
										</div>
									</div>
								</div>
								<div class="text-2xl font-bold text-neon-cyan">
									11-9
								</div>
							</div>
							<div class="flex items-center space-x-2 text-sm">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-4 h-4 text-neon-cyan" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>
								</svg>
									<span class="text-gray-400">
										Blockchain verified:
									</span>
									<span class="text-neon-cyan font-mono">
										0xabc...def
									</span>
								</div>
							</div>
							<div class="bg-space-dark/50 border border-neon-purple/20 rounded-lg p-4 hover:border-neon-purple/50 transition-all">
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center space-x-4">
										<div class="px-4 py-2 rounded-lg font-bold bg-red-500/20 text-red-400">
											LOSS
										</div>
										<div>
											<div class="text-white font-semibold">
												vs CosmicAce
											</div>
											<div class="text-gray-400 text-sm">
												2024-01-11
											</div>
										</div>
									</div>
									<div class="text-2xl font-bold text-neon-cyan">
										8-11
									</div>
								</div>
								<div class="flex items-center space-x-2 text-sm">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-4 h-4 text-neon-cyan" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>
									</svg>
									<span class="text-gray-400">
										Blockchain verified:
									</span>
									<span class="text-neon-cyan font-mono">
										0x123...456
									</span>
								</div>
							</div>
							<div class="bg-space-dark/50 border border-neon-purple/20 rounded-lg p-4 hover:border-neon-purple/50 transition-all">
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center space-x-4">
										<div class="px-4 py-2 rounded-lg font-bold bg-green-500/20 text-green-400">
											WIN
										</div>
										<div>
											<div class="text-white font-semibold">
												vs StarStriker
											</div>
											<div class="text-gray-400 text-sm">
												2024-01-10
											</div>
										</div>
									</div>
									<div class="text-2xl font-bold text-neon-cyan">
										11-7
									</div>
								</div>
								<div class="flex items-center space-x-2 text-sm">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-4 h-4 text-neon-cyan" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>
									</svg>
									<span class="text-gray-400">
										Blockchain verified:
									</span>
									<span class="text-neon-cyan font-mono">
										0x789...012
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
		` 
	}
}


