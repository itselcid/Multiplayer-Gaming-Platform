/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_recrute.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 15:12:27 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/30 21:05:13 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { addElement, Component } from "../core/Component";
import { getAllowance, type Tournament } from "../web3/getters";
import { bigint_to_date } from "../tools/date";
import { userState, web3auth } from "../core/appStore";
import { nullAddress } from "../web3/tools";
import { approveAllowence, join_tournament } from "../web3/setters";
import { join_tournament_inactive } from "./Tournament_card";
import { get_player_id } from "../tools/get_player_id";
import { Metamask_error } from "./Metamask_error";
import { logged } from "../main";
import { getRevertReason } from "../tools/errors";
import { formatNumber } from "../tools/tournament_tools";
import { username_availabality_checker } from "./CreateTournament";

export	const fill_tournament_recrute = async (tournament: Tournament, tournament_recrute: HTMLElement) => {
	const	account = await web3auth.getEthAddress();
	if (await web3auth.isLoggedIn()) {
		const i = await get_player_id(tournament, account || nullAddress);
		if (i < tournament.maxParticipants) {
			const	registered = new Tournament_recrute_registered(tournament);
			registered.mount(tournament_recrute);
		} else if (tournament.participants === tournament.maxParticipants) {
			const	full = new Tournament_recrute_full();
			full.mount(tournament_recrute);
		} else {
			const	register = new Tournament_recrute_register(tournament);
			register.mount(tournament_recrute);
		}
	} else {
		if (tournament.participants === tournament.maxParticipants) {
			const	full = new Tournament_recrute_full();
			full.mount(tournament_recrute);
		} else {
			const	not_connected = new join_tournament_inactive();
			not_connected.mount(tournament_recrute);
		}
	}
}

class	PendingButton extends Component {
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

class	Tournament_recrute_register_button extends Component {
	private	_tournament: Tournament;

	constructor(tournament: Tournament) {
		super('button', 'w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:scale-105 border-2 border-cyan-400');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		const	allowence = await getAllowance(await web3auth.getEthAddress());
		let		button_text = '';
		if (!allowence) {
			button_text = 'Approve TRIZcoin';
		} else {
			button_text = `REGISTER NOW - ${formatNumber(formatEther(this._tournament.entryFee))} TRIZcoin`;
		}

		this.el.innerHTML = `
                  
                    <span class="flex items-center justify-center gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-7 h-7" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
						${button_text}
                    </span>
		`;

		
	}
}

class Tournament_recrute_register extends Component {
	private	_tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		let	username_input: HTMLInputElement;
		
		if (!userState.get()) {
			const	username_container = addElement('div', 'mb-6', this.el);
			username_container.insertAdjacentHTML('beforeend', `
					<label class="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-widest mb-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
						</svg>
						Your Username
					</label>
				`);
			const	username = addElement('div', 'relative group', username_container);
			addElement('div', 'absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition', username);
			username_input = addElement('input', 'relative w-full px-5 py-4 bg-slate-900/90 border-2 border-cyan-400/50 rounded-xl text-white text-lg placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all', username) as HTMLInputElement;;
			username_input.type = 'text';
			username_input.placeholder = 'Enter your username...';
		}
		// const register_button = addElement('button', 'w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:scale-105 border-2 border-cyan-400', this.el);
		
		const	register_button = new Tournament_recrute_register_button(this._tournament);
		
		register_button.mount(this.el);
		register_button.el.onclick = async () => {
			if (!userState.get()) {
				if (await username_availabality_checker(username_input.value))
					return;
			}
			const	pend_button = new PendingButton();
			try {
				const	allowence = await getAllowance(await web3auth.getEthAddress());
				register_button.el.hidden = true;
				pend_button.mount(this.el);
				if (allowence < this._tournament.entryFee) {
					await approveAllowence(this._tournament.entryFee);
					pend_button.unmount();
					register_button.render();
					register_button.el.hidden = false;
				} else {
					const state = userState.get();
					if (await join_tournament(this._tournament, state && state.username !== undefined? state.username: username_input.value)) {
						pend_button.unmount();
						register_button.render();
						register_button.el.hidden = false;
						return;
					}
					const	registered = new Tournament_recrute_registered(this._tournament);
					registered.render();
					this.el.innerHTML = registered.el.innerHTML;
					this._tournament.participants++;
					const	current_participants = document.getElementById('tournament-recrute-current-participants');
					const	current_progress = document.getElementById('tournament-recrute-progress');
					const	spots = document.getElementById("left-spots");
					if (current_participants && current_progress && spots) {
						current_participants.textContent = String(this._tournament.participants);
						const percentage = String((Number(this._tournament.participants) / Number(this._tournament.maxParticipants)) * 100);
						current_progress.style.width = `${percentage}%`;
						spots.textContent = String(this._tournament.maxParticipants - this._tournament.participants) + ' spots left';
					}
				}
			} catch (err) {
				pend_button.unmount();
				register_button.el.hidden = false;
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

class Tournament_recrute_full extends Component {
	constructor() {
		super('div', 'w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-slate-700/50 border-2 border-slate-600 text-slate-400 cursor-not-allowed');
	}

	render(): void {
		this.el.innerHTML = `
                    <span class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x w-7 h-7" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
                      TOURNAMENT FULL
                    </span>
		`;
	}
}

class Tournament_recrute_registered extends Component {
	private	_tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div');
		this._tournament = tournament;
	}

	render(): void {
		this.el.innerHTML = `
			<div
                  class="w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-500/50 text-green-400"
                >
                    <span class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-7 h-7" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                      REGISTERED SUCCESSFULLY
                    </span>
                </div>

				
				

                
                  <div class="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p class="text-green-400 text-center font-bold flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-5 h-5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                      Tournament starts ${bigint_to_date(this._tournament.startTime)}
                    </p>
                  </div>
		`;
	}
}

export class Tournament_recrute extends Component {
	private	_tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div', 'lg:col-span-2 space-y-6');
		this._tournament = tournament;
	}

	render() {
		const progressPercentage = Number(this._tournament.participants) / Number(this._tournament.maxParticipants) * 100;
		this.el.innerHTML = `
		<div class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl"></div>
              <div class="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-cyan-400/50 p-8">
                <div class="flex items-center justify-between mb-8">
                  <div>
                    <h3 class="text-4xl font-black text-white mb-2">
                      Registration Status
                    </h3>
                    <p class="text-cyan-300/60 font-bold">Secure your place in the arena</p>
                  </div>
                  <div class="text-right">
                    <p id="tournament-recrute-current-participants" class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      ${this._tournament.participants}
                    </p>
                    <p class="text-cyan-300/60 text-sm font-bold">/ ${this._tournament.maxParticipants}</p>
                  </div>
                </div>

                <div class="mb-8">
                  <div class="flex justify-between mb-3">
                    <span class="text-cyan-300 text-sm font-bold">Players Registered</span>
                    <span class="text-cyan-300 text-sm font-bold" id="left-spots">${Number(this._tournament.maxParticipants) - Number(this._tournament.participants)} spots left</span>
                  </div>
                  <div class="h-4 bg-slate-800/50 rounded-full overflow-hidden border border-cyan-500/30">
                    <div
						id="tournament-recrute-progress"
						class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
						style="width: ${progressPercentage}%"
                    >
                  </div>
                  </div>
                </div>

				<div id="tournament-recrute">
				</div>
                

              </div>
            </div>
			`;

		const	tournament_recrute : HTMLElement = this.el.querySelector('#tournament-recrute') as HTMLElement;
		fill_tournament_recrute(this._tournament, tournament_recrute);
		
	}
}