/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_info.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:00:55 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/13 11:55:15 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { addElement, Component } from "../core/Component";
import { get_tournament_status } from "../tools/tournament_tools";
import type { Tournament } from "../web3/getters";
import { Tournament_status } from "./Tournament_status";
import { bigint_to_date } from "../tools/date";

export class Tournament_info extends Component {
	private	_tournament: Tournament;
	constructor(tournament: Tournament) {
		super('div', 'relative group');
		this._tournament = tournament;
	}

	render(): void {
		// addElement('div', 'absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl', tournament_info_group);
		const	status = get_tournament_status(this._tournament);
		let	container_classes = '';
		let	corner_classes = '';
		let	title_classes = '';
		switch (status) {
			case 'pending':
				container_classes = 'relative bg-gradient-to-br from-space-blue to-space-dark backdrop-blur-xl rounded-3xl border border-yellow-400/50 p-6 overflow-hidden';
				corner_classes = 'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-bl-full';
				title_classes = 'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-yellow-400 tracking-tight';
				break;
			case 'ongoing':
				container_classes = 'relative bg-gradient-to-br from-space-blue to-space-dark backdrop-blur-xl rounded-3xl border border-green-400/50 p-6 overflow-hidden';
				corner_classes = 'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-bl-full';
				title_classes = 'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-100 to-green-400 tracking-tight';
				break;
			case 'finished':
				container_classes = 'relative bg-gradient-to-br from-space-blue to-space-dark backdrop-blur-xl rounded-3xl border border-gray-400/50 p-6 overflow-hidden';
				corner_classes = 'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-400/20 to-transparent rounded-bl-full';
				title_classes = 'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-400 tracking-tight';
				break;
			case 'expired':
				container_classes = 'relative bg-gradient-to-br from-space-blue to-space-dark backdrop-blur-xl rounded-3xl border border-red-400/50 p-6 overflow-hidden';
				corner_classes = 'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-transparent rounded-bl-full';
				title_classes = 'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-100 to-red-400 tracking-tight';
				break;
		}
		const	tournament_info_container = addElement('div', container_classes, this.el);
		// 2 corner effects
		addElement('div', corner_classes, tournament_info_container);
		addElement('div', 'absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-tr-full', tournament_info_container);
		// tournament status
		const	tournament_status = new Tournament_status(status);
		tournament_status.mount(tournament_info_container);

		const	tournament_info_container_inner = addElement('div', 'relative', tournament_info_container);
		const	tournament_info_title = addElement('div', 'flex items-center justify-between mt-8 mb-4', tournament_info_container_inner);
		tournament_info_title.insertAdjacentHTML('beforeend', `
				<h2 class="${title_classes}">
					${this._tournament.title}
				</h2>
			`);
		
		const	tournament_info_body = addElement('div', 'space-y-5', tournament_info_container_inner);
		const	tournament_info_entryfee  = addElement('div', 'flex items-start gap-4 group/item', tournament_info_body);
		tournament_info_entryfee.insertAdjacentHTML('beforeend', `
				<div class="p-2.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coins w-5 h-5 text-yellow-400"><circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path></svg>
				</div>
				<div>
					<p class="text-cyan-300/60 text-sm font-medium mb-1">Entry Fee</p>
					<p class="text-2xl font-black text-yellow-400">
						${formatEther(this._tournament.entryFee)}
						<span class="text-base">TRIZcoin</span></p>
				</div>
			`);
		const	tournament_info_startTime = addElement('div', 'flex items-start gap-4 group/item', tournament_info_body);
		tournament_info_startTime.insertAdjacentHTML('beforeend', `
				<div class="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-5 h-5 text-purple-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
				</div>
				<div>
					<p class="text-cyan-300/60 text-sm font-medium mb-1">Start Time</p>
					<p class="text-white font-bold">${bigint_to_date(this._tournament.startTime)}</p>
				</div>
			`);
		const	tournament_info_participants = addElement('div', 'flex items-start gap-4 group/item', tournament_info_body);
		tournament_info_participants.insertAdjacentHTML('beforeend', `
				<div class="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-5 h-5 text-cyan-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
				</div>
				<div>
					<p class="text-cyan-300/60 text-sm font-medium mb-1">Participants</p>
					<p class="text-white font-bold">${this._tournament.maxParticipants} players</p>
				</div>
			`);
		const	tournament_info_prizePool = addElement('div', 'mt-8 pt-6 border-t border-cyan-500/20', tournament_info_body);
		tournament_info_prizePool.insertAdjacentHTML('beforeend', `
				<div class="relative group/prize">
					<div class="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-lg group-hover/prize:blur-xl transition-all"></div>
					<div class="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-2xl p-5 border border-yellow-400/40 shadow-lg shadow-yellow-500/10">
					<p class="text-yellow-300/70 text-sm font-medium mb-3 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-4 h-4"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
						Prize Pool
					</p>
					<p class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
						${formatEther(this._tournament.entryFee * BigInt(this._tournament.maxParticipants))} <span class="text-xl">TRIZcoin</span>
					</p>
					</div>
				</div>
			`);
	}
}