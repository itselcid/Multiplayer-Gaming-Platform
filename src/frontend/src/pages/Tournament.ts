/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/19 17:54:21 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/02 02:39:19 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Tournament_claim_prize } from "../components/Tournament_claim_prize";
import { Tournament_info } from "../components/Tournament_info";
import { Tournament_matches_history } from "../components/tournament_matches_history";
import { Tournament_recrute } from "../components/Tournament_recrute";
import { Tournament_refund } from "../components/Tournament_refund";
import { Tournament_rounds_matches } from "../components/Tournament_rounds_matches";
import { tournamentState } from "../core/appStore";
import { addElement, Component } from "../core/Component";
import { get_tournament_status } from "../tools/get_tournament_status";

export class Tournament extends Component {
	private params: { id: string};

	constructor(params: { id: string}) {
		super('div', 'relative w-[85%] mx-auto p-6');
		this.params = params;
	}

	render(): void {
		const	tournament = tournamentState.get()[Number(this.params.id)];
		
		// header
		this.el.insertAdjacentHTML('beforeend', `
				<div class="mb-8">
					<h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
						Tournament Arena
					</h1>
					<p class="text-cyan-300/60 font-medium">Real-time blockchain competition</p>
				</div>
			`);

		// tournament info, matches
		const	tournament_infos = addElement('div', 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8', this.el);

		const	tournament_info = addElement('div', 'lg:col-span-1', tournament_infos);
		const	tournament_info_component = new Tournament_info(tournament);
		tournament_info_component.mount(tournament_info);
		


		switch (get_tournament_status(tournament)) {
			case 'pending':
				const	recrute = new Tournament_recrute(tournament);
				recrute.mount(tournament_infos);
				break;
			case 'ongoing':
				// round and matches
				const	tournament_rounds_matches = new Tournament_rounds_matches(tournament);
				tournament_rounds_matches.mount(tournament_infos);
				// matches history
				const	tournament_matches_history = new Tournament_matches_history();
				tournament_matches_history.mount(this.el);
				break;
			case 'finished':
				const	claim_prize = new Tournament_claim_prize(tournament);
				claim_prize.mount(tournament_infos);
				break;
			case 'expired':
				const	claim_refund = new Tournament_refund(tournament);
				claim_refund.mount(tournament_infos);
				break;
		}
		
	}
}
