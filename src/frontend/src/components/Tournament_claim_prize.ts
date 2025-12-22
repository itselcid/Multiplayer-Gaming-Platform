/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_claim_prize.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 01:41:54 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/21 22:16:35 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { Component } from "../core/Component";
import { getMatch, type Match, type Player, type Tournament } from "../web3/getters";
import { web3auth } from "../core/appStore";
import { lowerCaseAddress } from "../web3/tools";
import { PendingButton } from "./Tournament_refund";
import { claim_prize } from "../web3/setters";
import { get_player_id } from "../tools/get_player_id";
import { Metamask_error } from "./Metamask_error";

export const render_claim_prize_button = async (tournament: Tournament, button_container: HTMLElement) => {
	if (await web3auth.isLoggedIn()) {
		const account = await web3auth.getEthAddress();
		const match: Match = await getMatch(tournament.id, 1n, 0n);
		let	winner: Player;
		if (match.player1Score > match.player2Score) {
			winner = match.player1;
		} else {
			winner = match.player2;
		}
		const	i = await get_player_id(tournament, account);
		if (i < tournament.maxParticipants && lowerCaseAddress(winner.addr) === lowerCaseAddress(account)) {
			if (winner.claimed) {
				const button = new Claimed_button();
				button.mount(button_container);
			} else {
				const button = new Claim_button(tournament, match, i);
				button.mount(button_container);
			}
		}
	}
}

class Claimed_button extends Component {
	constructor() {
		super('button', "w-full py-5 rounded-2xl font-black text-lg tracking-wide transition-all transform bg-slate-700/50 border border-slate-600 text-slate-400 cursor-not-allowed");
	}

	async render(): Promise<void> {
		this.el.style = "cursor: not-allowed !important;";
		(this.el as HTMLButtonElement).disabled = true;
		this.el.insertAdjacentHTML('beforeend', `
				<span class="flex items-center justify-center gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-6 h-6" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
					PRIZE CLAIMED
				</span>
			`);
	}
}

class Claim_button extends Component {
	private	_tournament: Tournament;
	private	_match: Match;
	private _index: bigint;
	
	constructor(tournament: Tournament, match: Match, index: bigint) {
		super('button', "w-full py-5 rounded-2xl font-black text-lg tracking-wide transition-all transform bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-2xl shadow-yellow-500/50 hover:scale-105 border-2 border-yellow-400");
		this._tournament = tournament;
		this._match = match;
		this._index = index;
	}

	render(): void {
		this.el.insertAdjacentHTML('beforeend', `
			<span class="flex items-center justify-center gap-3">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-6 h-6" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>
				CLAIM YOUR PRIZE
			</span>
		`);
		this.el.onclick = async () => {
			const	pend_button = new PendingButton();
			try {
				const	container = document.getElementById('claim-prize-container');
				if (container) {
					this.el.hidden = true;
					pend_button.mount(container);
					await claim_prize(this._tournament.id, this._index);
					this.unmount();
					pend_button.unmount();
					const claimed = new Claimed_button();
					claimed.mount(container);
				}
			} catch {
				pend_button.unmount();
				this.el.hidden = false;
				const	root = document.getElementById('app');
				if (root) {
					const	metamask_error = new Metamask_error(
						"Action Canceled",
						"The transaction was rejected. Please approve it in your wallet if you want to continue.",
						false
					);
					metamask_error.mount(root);
				}
			}
		}
	}
}

export class Tournament_claim_prize extends Component {
	private	_tournament: Tournament;
	
	constructor(tournament: Tournament) {
		super('div', 'lg:col-span-2 space-y-6');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		const match: Match = await getMatch(this._tournament.id, 1n, 0n);
		let	winner: Player;
		let	loser: Player;
		if (match.player1Score > match.player2Score) {
			winner = match.player1;
			loser = match.player2;
		} else {
			winner = match.player2;
			loser = match.player1;
		}
		this.el.innerHTML = `
			<div class="relative group">
				<div class="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-3xl blur-xl"></div>
				<div class="relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-3xl border border-yellow-400/50 p-8">
					<div class="text-center">
					<div class="inline-block p-4 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-full border-4 border-yellow-400/50 mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-16 h-16 text-yellow-400" aria-hidden="true"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path><path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path><path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path></svg>
					</div>
					
					<h3 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-2 pb-4">
						${winner.username}
					</h3>
					
					<p class="text-cyan-300/60 text-lg font-bold mb-2">Champion</p>
					<p class="text-4xl font-black text-white mb-8">Prize: ${formatEther(this._tournament.entryFee * BigInt(this._tournament.maxParticipants))} TRIZcoin</p>
					
					<div class="flex justify-center gap-8 mb-8">
						<div class="text-center">
						<div class="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-slate-600/30 to-slate-700/30 rounded-full flex items-center justify-center border border-slate-500/50">
							<span class="text-slate-300 font-black text-lg">2</span>
						</div>
						<p class="text-slate-400 text-sm font-bold mb-1">${loser.username}</p>
						<p class="text-slate-500 text-xs">Runner-up</p>
						</div>
					</div>

					
						<div class="mt-8" id="claim-prize-container">
						
						</div>
					</div>
				</div>
			</div>
		`;
		const button_container = this.el.querySelector('#claim-prize-container') as HTMLElement | null;
		if (button_container) {
			render_claim_prize_button(this._tournament, button_container);
			// const account = await web3auth.getEthAddress();
			// const	i = await get_player_id(this._tournament, account);
			// if (i < this._tournament.maxParticipants && lowerCaseAddress(winner.addr) === lowerCaseAddress(account)) {
			// 	if (winner.claimed) {
			// 		const button = new Claimed_button();
			// 		button.mount(button_container);
			// 	} else {
			// 		const button = new Claim_button(this._tournament, match, i);
			// 		button.mount(button_container);
			// 	}
			// }
		}
	}
}