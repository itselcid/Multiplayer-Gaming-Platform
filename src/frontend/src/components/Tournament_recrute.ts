/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_recrute.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 15:12:27 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/02 22:08:29 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { addElement, Component } from "../core/Component";
import { getPlayer, type Tournament } from "../web3/getters";
import { bigint_to_date } from "../tools/date";
import { web3auth } from "../core/appStore";
import { lowerCaseAddress, nullAddress } from "../web3/tools";
import { join_tournament } from "../web3/setters";
import { join_tournament_inactive } from "./Tournament_card";
import { get_player_id } from "../tools/get_player_id";

class Tournament_recrute_register extends Component {
	private	_tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div');
		this._tournament = tournament;
	}

	render(): void {
		const	logged = false;
		let	username_input: HTMLInputElement;
		if (!logged) {
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
		const register_button = addElement('button', 'w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:scale-105 border-2 border-cyan-400', this.el);
		
		register_button.innerHTML = `
                  
                    <span class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-7 h-7" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
                      REGISTER NOW - ${formatEther(this._tournament.entryFee)} TRIZcoin
                    </span>
		`;
		
		register_button.onclick = async () => {
			await join_tournament(this._tournament, logged? 'username from db': username_input.value);
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

	async render() {
		const	account = await web3auth.getEthAddress();
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
                    <p class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      ${this._tournament.participants}
                    </p>
                    <p class="text-cyan-300/60 text-sm font-bold">/ ${this._tournament.maxParticipants}</p>
                  </div>
                </div>

                <div class="mb-8">
                  <div class="flex justify-between mb-3">
                    <span class="text-cyan-300 text-sm font-bold">Players Registered</span>
                    <span class="text-cyan-300 text-sm font-bold">${Number(this._tournament.maxParticipants) - Number(this._tournament.participants)} spots left</span>
                  </div>
                  <div class="h-4 bg-slate-800/50 rounded-full overflow-hidden border border-cyan-500/30">
                    <div 
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
		if (this._tournament.participants === this._tournament.maxParticipants) {
			const	full = new Tournament_recrute_full();
			full.mount(tournament_recrute);
		}
		else if (!(await web3auth.isLoggedIn())) {
			const	not_connected = new join_tournament_inactive();
			not_connected.mount(tournament_recrute);
		} else {
			const i = await get_player_id(this._tournament, account || nullAddress);
			// for (;i < this._tournament.maxParticipants; i++) {
			// 	const	player = await getPlayer(this._tournament.id, this._tournament.currentRound, i);
			// 	if (lowerCaseAddress(player.addr) === lowerCaseAddress(account)) {
			// 		console.log('address found: ', account, player.addr);
			// 		break;
			// 	}
			// }
			if (i < this._tournament.maxParticipants) {
				const	registered = new Tournament_recrute_registered(this._tournament);
				registered.mount(tournament_recrute);
			} else {
				const	register = new Tournament_recrute_register(this._tournament);
				register.mount(tournament_recrute);
			}
		}
	}
}