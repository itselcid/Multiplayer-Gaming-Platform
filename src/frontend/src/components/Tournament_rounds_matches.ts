/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_rounds_matches.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:11:27 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/29 02:00:07 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addElement, Component } from "../core/Component";
import { getMatch, type Match, type Tournament } from "../web3/getters";

class Round extends Component {
	private _tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div', 'relative group');
		this._tournament = tournament;
	}
	
	render(): void {
		addElement('div', 'absolute inset-0 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-3xl blur-xl', this.el);
		const	round_container = addElement('div', 'relative bg-gradient-to-r from-neon-cyan/10 via-blue-500/10 to-neon-purple/10 backdrop-blur-xl rounded-3xl border border-cyan-400/50 p-6 overflow-hidden', this.el);
		addElement('div', 'absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl', round_container);
		const	round = addElement('div', 'relative flex items-center gap-4', round_container);
		round.insertAdjacentHTML('beforeend', `
				<div class="p-3 bg-gradient-to-br from-neon-cyan/30 to-blue-500/30 rounded-2xl border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-8 h-8 text-cyan-400"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
				</div>
			`);
		
		const	round_content = addElement('div', '', round);
		round_content.insertAdjacentHTML('beforeend', `
				<p class="text-cyan-300/60 text-sm font-bold mb-1 tracking-wide">CURRENT ROUND</p>
			`);
		const	round_content_current = addElement('h3', 'text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neon-cyan', round_content);
		
		switch (this._tournament.currentRound) {
			case 1n:
				round_content_current.textContent = 'Finals';
				break;
			case 2n:
				round_content_current.textContent = 'Semi Finals';
				break;
			case 4n:
				round_content_current.textContent = 'Quarter Finals';
				break;
			default:
				round_content_current.textContent = 'Round ' + String(this._tournament.currentRound);
		}
	}
}

class LiveMatch extends Component {
	private _match: Match;
	private	_id:bigint;

	constructor(match: Match, id:bigint) {
		super('div', 'relative group');
		this._match = match;
		this._id = id
	}

	render(): void {
		this.el.insertAdjacentHTML('beforeend', `
				<div class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all">
				</div>
			`);

		const	match_container = addElement('div', 'relative backdrop-blur-xl rounded-2xl border p-6 transition-all bg-gradient-to-br from-green-500/10 to-emerald-500/5 hover:border-green-400/50 border-green-700/50 shadow-lg shadow-green-500/20', this.el);
		
		const	match_header = addElement('div', 'flex items-center justify-between mb-5', match_container);
		const	match_id = addElement('span', 'text-cyan-300/70 text-sm font-bold tracking-wider', match_header);
		match_id.textContent = 'MATCH #' + String(this._id);
		match_header.insertAdjacentHTML('beforeend', `
				<span class="px-4 py-1.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/70 rounded-full text-green-400 text-xs font-black flex items-center gap-2 shadow-lg shadow-green-500/30">
					<span class="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400">
					</span>
					LIVE NOW
				</span>
			`);

		const	live_score = addElement('div', 'grid grid-cols-3 gap-6 items-center', match_container);

		const	first_score_container = addElement('div', 'text-center space-y-3', live_score);
		const	first_score_username_container = addElement('div', 'p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30 inline-block', first_score_container);
		const	first_score_username = addElement('p', 'text-white font-black text-base tracking-tight', first_score_username_container);
		first_score_username.textContent = this._match.player1.username;
		const	first_score = addElement('div', 'text-5xl font-black transition-all text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-400', first_score_container);
		first_score.textContent = String(this._match.player1Score);

		live_score.insertAdjacentHTML('beforeend', `
				<div class="text-center">
					<div class="relative">
						<div class="absolute inset-0 bg-purple-500/20 blur-xl">
						</div>
						<span class="relative text-slate-400 font-black text-xl tracking-widest">
							VS
						</span>
					</div>
				</div>
			`);

		const	second_score_container = addElement('div', 'text-center space-y-3', live_score);
		const	second_score_username_container = addElement('div', 'p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 inline-block', second_score_container);
		const	second_score_username = addElement('p', 'text-white font-black text-base tracking-tight', second_score_username_container);
		second_score_username.textContent = this._match.player2.username;
		const	second_score = addElement('div', 'text-5xl font-black transition-all text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-400', second_score_container);
		second_score.textContent = String(this._match.player2Score);
	}
}

class	PendingMatch extends Component {
	private _match: Match;
	private	_id:bigint;

	constructor(match: Match, id:bigint) {
		super('div', 'relative group');
		this._match = match;
		this._id = id
	}

	render(): void {
		const	match_container = addElement('div', 'relative backdrop-blur-xl rounded-2xl border p-6 transition-all bg-slate-900/70 border-slate-600/30 hover:border-neon-cyan/50', this.el);

		const	match_header = addElement('div', 'flex items-center justify-between mb-5', match_container);
		const	match_id = addElement('span', 'text-cyan-300/70 text-sm font-bold tracking-wider', match_header);
		match_id.textContent = 'MATCH #' + String(this._id);
		const	match_status = addElement('span', 'px-4 py-1.5 bg-slate-700/30 border border-slate-500/50 rounded-full text-slate-400 text-xs font-bold', match_header);
		match_status.textContent = 'STARTING SOON (04:23)';

		const	live_score = addElement('div', 'grid grid-cols-3 gap-6 items-center', match_container);

		const	first_score_container = addElement('div', 'text-center space-y-3', live_score);
		const	first_score_username_container = addElement('div', 'p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30 inline-block', first_score_container);
		const	first_score_username = addElement('p', 'text-white font-black text-base tracking-tight', first_score_username_container);
		first_score_username.textContent = this._match.player1.username;
		const	first_score = addElement('div', 'text-5xl font-black transition-all text-slate-600', first_score_container);
		first_score.textContent = String(this._match.player1Score);

		live_score.insertAdjacentHTML('beforeend', `
				<div class="text-center">
					<div class="relative">
						<div class="absolute inset-0 bg-purple-500/20 blur-xl">
						</div>
						<span class="relative text-slate-400 font-black text-xl tracking-widest">
							VS
						</span>
					</div>
				</div>
			`);

		const	second_score_container = addElement('div', 'text-center space-y-3', live_score);
		const	second_score_username_container = addElement('div', 'p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 inline-block', second_score_container);
		const	second_score_username = addElement('p', 'text-white font-black text-base tracking-tight', second_score_username_container);
		second_score_username.textContent = this._match.player2.username;
		const	second_score = addElement('div', 'text-5xl font-black transition-all text-slate-600', second_score_container);
		second_score.textContent = String(this._match.player2Score);
		
	}
}

class Matches extends Component {
	private _tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div', 'space-y-4');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		for (let i = 0n; i < this._tournament.currentRound; i++) {
			const	match = await getMatch(this._tournament.id, this._tournament.currentRound, i);
			const	live_match = new LiveMatch(match, i);
			live_match.mount(this.el);
			const	pending_match = new PendingMatch(match, i);
			pending_match.mount(this.el);
		}
		
	}
}

export class Tournament_rounds_matches extends Component {
	private _tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div', 'lg:col-span-2 space-y-6');
		this._tournament = tournament;
	}

	render(): void {
		const	round = new Round(this._tournament);
		round.mount(this.el);

		const	matches = new Matches(this._tournament);
		matches.mount(this.el)
	}
}
