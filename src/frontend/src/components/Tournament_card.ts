/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_card.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/15 01:14:19 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/25 10:56:44 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { addElement, Component } from "../core/Component";
import type { Tournament } from "../web3/getters";
import { bigint_to_date } from "../tools/date";
import { formatNumber, get_tournament_status } from "../tools/tournament_tools";
import { navigate } from "../core/router";
import { Tournament_status } from "./Tournament_status";

// interface Tournament {
//   id: string;
//   name: string;
//   entryFee: string;
//   startTime: string;
//   participants: number;
//   prizePool: string;
// }


export class Tournament_card extends Component {
	private	tournament;

	constructor(tournmnt: Tournament) {
		super('div', 'group relative bg-gradient-to-br from-space-blue to-space-dark border-2 border-neon-cyan/30 rounded-xl p-6 hover:border-neon-cyan transition-all hover:shadow-2xl hover:shadow-neon-cyan/30 transform hover:scale-105');
		this.tournament = tournmnt;
	}
	
	render(): void {
		const	status = new Tournament_status(get_tournament_status(this.tournament));
		status.mount(this.el);

		const	tournament_name = addElement('h3', 'text-2xl font-bold my-4 text-neon-cyan', this.el);
		tournament_name.textContent = this.tournament.title;

		const	tournament_info = addElement('div', 'space-y-3 mb-6', this.el);
		tournament_info.insertAdjacentHTML('beforeend', `
			<div class="flex items-center space-x-3 text-gray-300">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coins w-5 h-5 text-neon-gold" aria-hidden="true"><circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path></svg>
			  <span>
				Entry Fee:
				<span class="text-neon-gold font-semibold">
					${formatNumber(formatEther(this.tournament.entryFee))} TRIZcoin
				</span>
			  </span>
			</div>
			<div class="flex items-center space-x-3 text-gray-300">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-5 h-5 text-neon-purple" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
			  <span>${bigint_to_date(this.tournament.startTime)}</span>
			</div>
			<div class="flex items-center space-x-3 text-gray-300">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-5 h-5 text-neon-cyan" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
			  <span>${this.tournament.maxParticipants} participants</span>
			</div>
			`);

		const	prize_pool = addElement('div', 'mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-400/40 rounded-xl p-6 neon-border', this.el);
		prize_pool.insertAdjacentHTML('beforeend', `
			<div class="text-sm text-gray-400 mb-1">Prize Pool</div>
			<div class="text-2xl font-bold text-neon-gold">
			  ${formatNumber(formatEther(this.tournament.entryFee * BigInt(this.tournament.maxParticipants)))} TRIZcoin
			</div>
			`);
	  
		const	join_tournament = addElement('Button', 'block w-full py-3 rounded-lg text-center font-bold transition-all bg-ctex hover:shadow-lg hover:shadow-neon-cyan/50', this.el);
		join_tournament.textContent = 'Enter Tournament';
		join_tournament.onclick = () => {
			navigate('/tournaments/'+ String(this.tournament.id));
		}
		// if (login_state.get() === 'connected') {
		// 	console.log('here:', this.tournament.id);
		// 	const	join_button_active = new join_tournament_active(Number(this.tournament.id));
		// 	join_button_active.mount(join_tournament)
		// } else if (login_state.get() === 'not connected') {
		// 	const	join_button_inactive = new join_tournament_inactive();
		// 	join_button_inactive.mount(join_tournament);
		// }
    
	}
}



export class join_tournament_inactive extends Component {
	constructor() {
		super('Button', 'block w-full py-3 rounded-lg text-center font-bold transition-all bg-gray-600 opacity-50');
	}

	render(): void {
		this.el.textContent = 'Connect Wallet to Enter';
		this.el.style = "cursor: not-allowed !important;";
		(this.el as HTMLButtonElement).disabled = true;
	}
}
