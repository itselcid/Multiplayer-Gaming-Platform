/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 17:54:21 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/28 19:38:44 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Page404 } from "../components/Page404";
import { Tournament_claim_prize } from "../components/Tournament_claim_prize";
import { Tournament_info } from "../components/Tournament_info";
import { Tournament_matches_history } from "../components/tournament_matches_history";
import { Tournament_recrute } from "../components/Tournament_recrute";
import { Tournament_refund } from "../components/Tournament_refund";
import { Tournament_rounds_matches } from "../components/Tournament_rounds_matches";
import { addElement, Component } from "../core/Component";
import { cachedTournaments } from "../main";
import { get_tournament_status, tournament_id_to_index } from "../tools/tournament_tools";
import { getTournament, getTournamentLength } from "../web3/getters";

export class TournamentView extends Component {
	private params: { id: string};

	constructor(params: { id: string}) {
		super('div', 'relative w-[85%] mx-auto p-6');
		this.params = params;
	}

	async render(): Promise<void> {
		this.el.id = 'tournament-view';
		const id = Number(this.params.id);
		const	tournament_length = await getTournamentLength();

		if (isNaN(id) || id < 0 || id > tournament_length -1n) {
			const	root = document.getElementById('bg');
			if (root) {
				this.unmount();
				const err404 = new Page404()
				err404.mount(root);
			}
			return;
		}
		
		const	index = tournament_id_to_index(BigInt(id));
		let tournament;
		if (index !== -1)
			tournament = cachedTournaments[index];
		else
			tournament = await getTournament(BigInt(id));

		const	tournament_status = get_tournament_status(tournament);

		let	header_title = '';
		let	header_title_classes = 'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 pb-3 tracking-tight';
		let	header_text = '';
		let	header_text_classes = 'text-cyan-300/60 font-medium';

		switch (tournament_status) {
			case 'pending':
				header_title = 'Registration Open';
				header_text = 'Join the competition • Secure your spot';
				break;
			case 'ongoing':
				header_title = 'Tournament Arena';
				header_text = 'Real-time blockchain competition';
				break;
			case 'finished':
				header_title = 'Tournament Complete';
				header_title_classes = 'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 pb-3 tracking-tight';
				header_text = 'Victory achieved • Rewards ready';
				break;
			case 'expired':
				header_title = 'Tournament Expired';
				header_title_classes = 'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-slate-400 to-slate-500 pb-3 tracking-tight';
				header_text = 'Event cancelled • Refunds available';
				header_text_classes = 'text-slate-400 font-medium';
				break;
		}

		// header
		this.el.insertAdjacentHTML('beforeend', `
				<div class="mb-8">
					<h1 class="${header_title_classes}">
						${header_title}
					</h1>
					<p class="${header_text_classes}">${header_text}</p>
				</div>
			`);

		// tournament info, matches
		const	tournament_infos = addElement('div', 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8', this.el);
		tournament_infos.id = 'tournament-infos-container';

		const	tournament_info = addElement('div', 'lg:col-span-1', tournament_infos);
		const	tournament_info_component = new Tournament_info(tournament);
		tournament_info_component.mount(tournament_info);
		


		switch (tournament_status) {
			case 'pending':
				const	recrute = new Tournament_recrute(tournament);
				recrute.mount(tournament_infos);
				break;
			case 'ongoing':
				// round and matches
				const	tournament_rounds_matches = new Tournament_rounds_matches(tournament);
				tournament_rounds_matches.mount(tournament_infos);
				// matches history
				const	tournament_matches_history = new Tournament_matches_history(tournament);
				tournament_matches_history.mount(this.el);
				break;
			case 'finished':
				const	claim_prize = new Tournament_claim_prize(tournament);
				claim_prize.mount(tournament_infos);
				// matches history
				const	tournament_matches_history_2 = new Tournament_matches_history(tournament);
				tournament_matches_history_2.mount(this.el);
				break;
			case 'expired':
				const	claim_refund = new Tournament_refund(tournament);
				claim_refund.mount(tournament_infos);
				if (tournament.participants === tournament.maxParticipants) {
					// matches history
					const	tournament_matches_history_3 = new Tournament_matches_history(tournament);
					tournament_matches_history_3.mount(this.el);
				}
				break;
		}
		
	}
}
