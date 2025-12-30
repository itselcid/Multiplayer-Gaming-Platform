/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Match.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 16:43:52 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/25 10:59:27 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";
import { getMatchWithKey } from "../web3/getters";
import { tobedeleted_submit_match_score } from "../web3/setters";
import { nullAddress } from "../web3/tools";

export class MatchView extends Component {
	private params: { key: string};
	
	constructor (params: { key: string}) {
		super('div', 'min-h-screen flex items-center justify-center p-4');
		this.params = params;
	}

	async render(): Promise<void> {
		const	match = await getMatchWithKey(this.params.key as `0x${string}`);
		if (match.player1.addr === nullAddress) {
			// not found
			return ;
		}
		// console.log(match);
		this.el.innerHTML = `

		<div class="relative w-full max-w-2xl">
			<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-3 mb-4">
				<Rocket class="text-cyan-400" size={40} />
				<h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
				Galactic Pong
				</h1>
				<Rocket class="text-purple-400 transform scale-x-[-1]" size={40} />
			</div>
			<p class="text-purple-200 text-lg">Match Score Entry (Dev Mode)</p>
			</div>

			<div class="rounded-2xl shadow-2xl border border-purple-400 border-opacity-30 p-8">
			<div class="space-y-6">
				<!-- First three parameters -->
				<div class="grid grid-cols-3 gap-4">
					<div class="space-y-2">
						<label class="text-purple-300 text-sm font-semibold">
							tournament_id
						</label>
						<input
							type="number"
							id='param1'
							class="w-full border-2 border-purple-400 border-opacity-50 rounded-lg px-3 py-2 text-white text-lg placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
							placeholder="1"
							required
						/>
					</div>

					<div class="space-y-2">
						<label class="text-purple-300 text-sm font-semibold">
							current_round
						</label>
						<input
							type="number"
							id='param2'
							class="w-full border-2 border-purple-400 border-opacity-50 rounded-lg px-3 py-2 text-white text-lg placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
							placeholder="1"
							required
						/>
					</div>

					<div class="space-y-2">
						<label class="text-purple-300 text-sm font-semibold">
							match_id
						</label>
						<input
							type="number"
							id='param3'
							class="w-full border-2 border-purple-400 border-opacity-50 rounded-lg px-3 py-2 text-white text-lg placeholder-purple-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
							placeholder="0"
							required
						/>
					</div>
				</div>

				<div class="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>

				<div class="space-y-2">
				<label class="flex items-center gap-2 text-cyan-300 text-lg font-semibold">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
					${match.player1.username} Score
				</label>
				<input
					type="number"
					id='player1score'
					class="w-full border-2 border-cyan-400 border-opacity-50 rounded-lg px-4 py-3 text-white text-xl placeholder-purple-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
					placeholder="Enter score"
					required
				/>
				</div>

				
				<div class="flex items-center justify-center">
				<div class="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1"></div>
				<span class="px-4 text-2xl font-bold text-purple-300">VS</span>
				<div class="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent flex-1"></div>
				</div>


				<div class="space-y-2">
				<label class="flex items-center gap-2 text-pink-300 text-lg font-semibold">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
					${match.player2.username} Score
				</label>
				<input
					type="number"
					id='player2score'
					class="w-full border-2 border-pink-400 border-opacity-50 rounded-lg px-4 py-3 text-white text-xl placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
					placeholder="Enter score"
					required
				/>
				</div>

				<button
				id='submit'
				class="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold text-xl py-4 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95"
				>
					Submit Match Score
				</button>
			</div>

			
			<div class="mt-6 p-4 bg-black bg-opacity-30 rounded-lg border border-yellow-500 border-opacity-30">
				<p class="text-yellow-300 text-sm font-mono">
				<span class="font-bold">Dev Mode:</span> Check browser console for submitted data
				</p>
			</div>
			</div>
		</div>
	`
		const	param1 = this.el.querySelector('#param1') as HTMLInputElement;
		const	param2 = this.el.querySelector('#param2') as HTMLInputElement;
		const	param3 = this.el.querySelector('#param3') as HTMLInputElement;
		const	player1score = this.el.querySelector('#player1score') as HTMLInputElement;
		const	player2score = this.el.querySelector('#player2score') as HTMLInputElement;
		const	submit_button = this.el.querySelector('#submit') as HTMLButtonElement;
		if (param1 && param2 && param3 && player1score && player2score && submit_button) {
			submit_button.onclick = async () => {
				console.log('param1: ', param1.value, ', param2: ', param2.value, ', param3: ', param3.value, ', player 1: ', player1score.value, ', player 2: ', player2score.value);
				await tobedeleted_submit_match_score(
					BigInt(param1.value), 
					BigInt(param2.value), 
					BigInt(param3.value), 
					BigInt(player1score.value), 
					BigInt(player2score.value)
				);
			}
		}
	}
}