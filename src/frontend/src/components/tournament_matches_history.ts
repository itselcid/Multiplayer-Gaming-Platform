/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournament_matches_history.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:33:28 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/21 19:37:31 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addElement, Component } from "../core/Component";
import { get_round_name } from "../tools/tournament_tools";
import { getMatch, type Match, type Tournament } from "../web3/getters";

class	History_match extends Component {
	private _match: Match;
	private _round: bigint;

	constructor(match: Match, round: bigint) {
		super('div', 'group/history relative');
		this._match = match;
		this._round = round;
	}

	render(): void {
		let winner;
		let winner_score;
		let loser;
		let loser_score;
		if (this._match.player1Score > this._match.player2Score) {
			winner = this._match.player1;
			winner_score = this._match.player1Score;
			loser = this._match.player2;
			loser_score = this._match.player2Score;
		} else {
			winner = this._match.player2;
			winner_score = this._match.player2Score;
			loser = this._match.player1;
			loser_score = this._match.player1Score;
		}
		const match_round = get_round_name(this._round);
		this.el.innerHTML = `
			<div class="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 rounded-xl opacity-0 group-hover/history:opacity-100 transition-all">
			</div>
			<div class="relative bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-5 flex-1">
						<span class="px-4 py-2 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-lg text-cyan-300/80 text-xs font-bold min-w-[140px] text-center border border-slate-600/30">
							${match_round}
						</span>
						<div class="flex items-center gap-5 flex-1">
							<span class="text-white font-bold text-sm min-w-[120px] text-right">
								${winner.username}
							</span>
							<div class="flex items-center gap-3">
								<span class="text-2xl font-black transition-all text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 scale-110">
									${String(winner_score)}
								</span>
								<span class="text-slate-500 font-black text-sm">
									:
								</span>
								<span class="text-2xl font-black transition-all text-slate-600">
									${String(loser_score)}
								</span>
							</div>
							<span class="text-white font-bold text-sm min-w-[120px]">
								${loser.username}
							</span>
						</div>
					</div>
				</div>
			</div>
		`;
	}
}

export class Tournament_matches_history extends Component {
	private _tournament: Tournament;
	
	constructor(tournament: Tournament) {
		super('div', 'relative group');
		this._tournament = tournament;
	}

	async render(): Promise<void> {
		addElement('div', 'absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl', this.el);
		const	matches_history_container = addElement('div', 'relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-600/30 p-6 overflow-hidden', this.el);
		addElement('div', 'absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl', matches_history_container);
		const	matches_history = addElement('div', 'relative', matches_history_container);
		matches_history.insertAdjacentHTML('beforeend', `
				<h3 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-200 mb-6 flex items-center gap-3">
					<div class="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-6 h-6 text-yellow-400"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
					</div>
					Match History
				</h3>
			`);
		const	matches_list = addElement('div', 'space-y-3', matches_history);
		for(let round = 1n; round !== this._tournament.maxParticipants; round *= 2n) {
			for (let index = 0n; index < round; index++) {
				const match = await getMatch(this._tournament.id, round, index);
				if (match.status === 0)
					continue;
				const history_match = new History_match(match, round);
				history_match.mount(matches_list);
			}
		}
	}
}