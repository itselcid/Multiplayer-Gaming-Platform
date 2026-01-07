/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_rounds_matches.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:11:27 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/24 21:33:12 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addElement, Component } from "../core/Component";
import { navigate } from "../core/router";
import { get_match_status, get_round_name } from "../tools/tournament_tools";
import { getMatch, getMatchKey, type Match, type Tournament } from "../web3/getters";

export class Round extends Component {
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
		round_content_current.textContent = get_round_name(this._tournament.currentRound);
	}
}

class LiveMatch extends Component {
	private	_tournament: Tournament;
	private _match: Match;
	private	_id:bigint;

	constructor(tournament: Tournament, match: Match, id:bigint) {
		super('div', 'relative group');
		this._tournament = tournament;
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

		this.el.onclick = () => {
			navigate('/match/' + getMatchKey(this._tournament.id, this._tournament.currentRound, this._id));
		}
	}
}

class	PendingMatch extends Component {
	private	_tournament: Tournament;
	private _match: Match;
	private	_id:bigint;

	constructor(tournament: Tournament, match: Match, id:bigint) {
		super('div', 'relative group');
		this._tournament = tournament;
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
		
		this.el.onclick = () => {
			navigate('/match/' + getMatchKey(this._tournament.id, this._tournament.currentRound, this._id));
		}
	}
}

class	FinishedMatch extends Component {
	private	_tournament: Tournament;
	private _match: Match;
	private	_id:bigint;

	constructor(tournament: Tournament, match: Match, id:bigint) {
		super('div', 'relative group');
		this._tournament = tournament;
		this._match = match;
		this._id = id
	}

	render(): void {
		let	winner;
		let	loser;
		let	winner_score;
		let loser_score;
		if (this._match.player1Score > this._match.player2Score) {
			winner = this._match.player1;
			winner_score = this._match.player1Score;
			loser = this._match.player2;
			loser_score = this._match.player2Score;
		} else {
			loser = this._match.player1;
			loser_score = this._match.player1Score;
			winner = this._match.player2;
			winner_score = this._match.player2Score;
		}
		const	match_container = addElement('div', 'relative backdrop-blur-xl rounded-2xl border p-6 transition-all bg-gradient-to-br from-slate-700/30 to-slate-800/20 hover:border-slate-400/50 border-slate-600/50 shadow-lg shadow-slate-500/20', this.el);

		const	match_header = addElement('div', 'flex items-center justify-between mb-5', match_container);
		const	match_id = addElement('span', 'text-cyan-300/70 text-sm font-bold tracking-wider', match_header);
		match_id.textContent = 'MATCH #' + String(this._id);
		const	match_status = addElement('span', 'px-4 py-1.5 bg-gradient-to-r from-slate-600/50 to-slate-700/50 border border-slate-400/50 rounded-full text-slate-300 text-xs font-black flex items-center gap-2 shadow-lg shadow-slate-500/30', match_header);
		match_status.insertAdjacentHTML('beforeend', `
				<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        FINISHED
			`);

		const	live_score = addElement('div', 'grid grid-cols-3 gap-6 items-center', match_container);

		const	first_score_container = addElement('div', 'text-center space-y-3', live_score);
		const	first_score_username_container = addElement('div', 'p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-400/50 inline-block relative shadow-lg shadow-amber-500/20', first_score_container);
		const	first_score_username = addElement('p', 'text-white font-black text-base tracking-tight', first_score_username_container);
		first_score_username.textContent = winner.username;
		first_score_username_container.insertAdjacentHTML('beforeend', `
			<div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
                                <svg class="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                            </div>
			`);
		const	first_score = addElement('div', 'text-5xl font-black transition-all text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-yellow-500', first_score_container);
		first_score.textContent = String(winner_score);

		live_score.insertAdjacentHTML('beforeend', `
				<div class="text-center">
					<div class="relative">
						<div class="absolute inset-0 bg-slate-500/20 blur-xl">
						</div>
						<span class="relative text-slate-400 font-black text-xl tracking-widest">
							VS
						</span>
					</div>
				</div>
			`);

		const	second_score_container = addElement('div', 'text-center space-y-3', live_score);
		const	second_score_username_container = addElement('div', 'p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 inline-block opacity-60', second_score_container);
		const	second_score_username = addElement('p', 'text-white font-black text-base tracking-tight', second_score_username_container);
		second_score_username.textContent = loser.username;
		const	second_score = addElement('div', 'text-5xl font-black transition-all text-slate-600', second_score_container);
		second_score.textContent = String(loser_score);
		
		this.el.onclick = () => {
			navigate('/match/' + getMatchKey(this._tournament.id, this._tournament.currentRound, this._id));
		}
	}
}

export class Matches extends Component {
	private _tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div', 'space-y-5');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		for (let i = 0n; i < this._tournament.currentRound; i++) {
			const	match = await getMatch(this._tournament.id, this._tournament.currentRound, i);
			const	match_status = get_match_status(match);
			console.log(match);
			if (match_status === 'pending') {
				// should be a cooldown period of 5 min before starting the match after its creation
				const	live_match = new LiveMatch(this._tournament, match, i);
				live_match.mount(this.el);
			} else {
				const	finished_match = new FinishedMatch(this._tournament, match, i);
				finished_match.mount(this.el);
			}
			// ui for cooldown period
			// const	pending_match = new PendingMatch(this._tournament, match, i);
			// pending_match.mount(this.el);
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
		this.el.id = 'tournament-rounds-matches';
		const	round = new Round(this._tournament);
		round.mount(this.el);

		const	matches = new Matches(this._tournament);
		matches.mount(this.el)
	}
}
