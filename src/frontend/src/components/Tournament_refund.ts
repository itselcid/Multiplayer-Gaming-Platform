/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_refund.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 20:13:50 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/27 03:06:09 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { addElement, Component } from "../core/Component";
import { getPlayer, type Tournament } from "../web3/getters";
import { web3auth } from "../core/appStore";
import { nullAddress } from "../web3/tools";
import { get_player_id } from "../tools/get_player_id";
import { Metamask_error } from "./Metamask_error";
import { claim_refunds } from "../web3/setters";
import { getRevertReason } from "../tools/errors";

export class	PendingButton extends Component {
	constructor() {
		super('button', 'relative w-full h-20 py-6 rounded-2xl text-white font-black text-lg uppercase tracking-wider overflow-hidden group transition-all duration-300 shadow-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 shadow-gray-600/50 disabled:hover:scale-100')
	}
	
	render(): void {
		const button = this.el as HTMLButtonElement;
		button.disabled = true;

		// ripple effect
		this.el.insertAdjacentHTML('beforeend', `
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="w-20 h-20 border-2 border-white/30 rounded-full animate-ping" style="animation-duration: 2s">
					</div>
				</div>
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="w-20 h-20 border-2 border-white/20 rounded-full animate-ping" style="animation-duration: 2s; animation-delay: 0.5s">
					</div>
				</div>
			`);

		const	text_container = addElement('span', 'absolute inset-0 flex flex-col items-center justify-center', this.el);
		text_container.insertAdjacentHTML('beforeend', `<span class="relative z-10 animate-pulse text-base mb-1">Processing</span>`);
		const	text_container_animation = addElement('div', 'flex gap-1', text_container);
		[0, 1, 2].map((i) => {text_container_animation.insertAdjacentHTML('beforeend', `
				<div
					class="w-1 h-1 bg-white rounded-full animate-bounce"
					style="animation-delay: ${i * 0.15}s; animation-duration: 0.6s">
				</div>
			`)})
	}
}

class Tournament_refund_claim extends Component {
	private	_tournament: Tournament;
	private _index: bigint;
	
	constructor(tournament: Tournament, index: bigint) {
		super('div', '');
		this._tournament = tournament;
		this._index = index;
	}

	render(): void {
		this.el.insertAdjacentHTML('beforeend', `
			<div class="mb-6 p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <p class="text-cyan-300 font-bold text-lg mb-2">Refund Available</p>
                        <p class="text-cyan-400/70 text-sm">Your entry fee of ${formatEther(this._tournament.entryFee)} TRIZcoin can be claimed back</p>
                      </div>
			`);
		
		const	claim_button = addElement('button', 'w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:scale-105 border-2 border-cyan-400', this.el);
		claim_button.insertAdjacentHTML('beforeend', `
						<span class="flex items-center justify-center gap-3">
						  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coins w-7 h-7" aria-hidden="true"><circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path></svg>
						  CLAIM REFUND - ${formatEther(this._tournament.entryFee)} TRIZcoin
						</span>
			`);

			claim_button.onclick = async () => {
			const	pend_button = new PendingButton();
			try {
				claim_button.hidden = true;
				pend_button.mount(this.el);
				await claim_refunds(this._tournament.id, this._index);
				this.unmount();
				const	container = document.getElementById('tournament-refund');
				if (container) {
					const claimed = new Tournament_refund_claimed();
					claimed.mount(container);
				}
			} catch (err) {
				pend_button.unmount();
				claim_button.hidden = false;
				const	root = document.getElementById('app');
				if (root) {
					const	metamask_error = new Metamask_error(
						"Transaction failed",
						"The transaction failed for the following reason: " + getRevertReason(err),
						false
					);
					metamask_error.mount(root);
				}
			}
		}
	}
}

class Tournament_refund_claimed extends Component {
	
	constructor() {
		super('div', 'w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-slate-700/50 border-2 border-slate-600 text-slate-400 cursor-not-allowed');
	}

	render(): void {
		this.el.innerHTML = `
			<span class="flex items-center justify-center gap-3">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-7 h-7" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
				REFUND CLAIMED
			</span>
		`;
	}
}

// class Tournament_refund_claim_processed extends Component {
	
// 	constructor() {
// 		super('div', 'mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl');
// 	}

// 	render(): void {
// 		this.el.innerHTML = `
// 			<p class="text-green-400 text-center font-bold flex items-center justify-center gap-2">
// 				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-5 h-5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
// 				Refund processed successfully
// 			</p>
// 		`;
// 	}
// }

export const render_claim_refund_button = async(tournament: Tournament, tournament_refund: HTMLElement) => {
	if (await web3auth.isLoggedIn()) {
		const	account = await web3auth.getEthAddress();
		const	i = await get_player_id(tournament, account || nullAddress);
		if (i < tournament.maxParticipants) {
			const	player = await getPlayer(tournament.id, tournament.currentRound, i);
			if (!player.claimed) {
				const	claim = new Tournament_refund_claim(tournament, i);
				claim.mount(tournament_refund);
			} else {
				const	claimed = new Tournament_refund_claimed();
				claimed.mount(tournament_refund);
			}
		}
	}
}

export class Tournament_refund extends Component {
	private	_tournament: Tournament;
		
	constructor(tournament: Tournament) {
		super('div', 'lg:col-span-2 space-y-6');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		let reason = 'Not enough players registered in time';
		let more_info = `Required: ${this._tournament.maxParticipants} players • Got: ${this._tournament.participants} players`;
		let full_reason = `
				This tournament failed to meet the minimum participant requirement of ${this._tournament.maxParticipants} players before the scheduled start time. 
        	    All registered players are eligible for a full refund of their entry fee. If you participated, please claim your refund above.
			`;
		if (this._tournament.participants === this._tournament.maxParticipants) {
			reason = 'No winner could be determined';
			more_info = '';
			full_reason = `
					All remaining matches ended in forfeits, leaving no valid winner. As a result, the tournament has been automatically expired.

					All registered players are eligible for a full refund of their entry fee.
					If you participated, please claim your refund above.
				`;	
		}
		this.el.innerHTML  = `
            <div class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 to-slate-500/20 rounded-3xl blur-xl"></div>
              <div class="relative bg-gradient-to-br from-red-500/10 via-slate-500/10 to-slate-600/10 backdrop-blur-xl rounded-3xl border border-red-400/30 p-8">
                <div class="text-center">
                  <div class="inline-block p-4 bg-gradient-to-br from-red-500/20 to-slate-500/20 rounded-full border-4 border-red-400/30 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert w-16 h-16 text-red-400" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                  </div>
                  
                  <h3 class="text-4xl font-black text-slate-200 mb-4">
                    Tournament Cancelled
                  </h3>
                  
                  <p class="text-slate-400 text-lg mb-2">${reason}</p>
                  <p class="text-slate-500 text-sm mb-8">${more_info}</p>

                  
                    <div class="mt-8" id="tournament-refund"></div>
                  
                </div>
              </div>
            </div>

            <div class="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-600/30 p-6">
              <h4 class="text-xl font-black text-slate-300 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert w-5 h-5 text-slate-400" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                What Happened?
              </h4>
              <p class="text-slate-400 leading-relaxed">
              	${full_reason}  
			  </p>
            </div>
		`;
		const	tournament_refund = this.el.querySelector('#tournament-refund') as HTMLElement | null;
		if (tournament_refund) {
			render_claim_refund_button(this._tournament, tournament_refund);
		}
		// if (await web3auth.isLoggedIn()) {
		// 	const	account = await web3auth.getEthAddress();
		// 	const	i = await get_player_id(this._tournament, account || nullAddress);
		// 	if (i < this._tournament.maxParticipants) {
		// 		const	player = await getPlayer(this._tournament.id, this._tournament.currentRound, i);
		// 		if (!player.claimed) {
		// 			const	claim = new Tournament_refund_claim(this._tournament, i);
		// 			claim.mount(tournament_refund);
		// 		} else {
		// 			const	claimed = new Tournament_refund_claimed();
		// 			claimed.mount(tournament_refund);
		// 		}
		// 	}
		// }
	}
}