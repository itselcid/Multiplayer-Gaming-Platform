// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Profile.ts                                         :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/05 17:41:32 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/06 02:14:45 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Achievements } from "../components/Achievements";
import { Player_card } from "../components/Player_card";
import { Tournament_history } from "../components/Tournament_history";
import { addElement, Component } from "../core/Component";

export class Profile extends Component {
	constructor() {
		super('div', 'max-w-6xl mx-auto px-6 py-12');
	}

	render() {
		this.el.insertAdjacentHTML('beforeend', `
								<div class="mb-12">
								   <h1 class="text-5xl font-bold mb-4 pb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
								   Player Profile
								   </h1>
								</div>

								   `);
		const	container = addElement('div', 'grid grid-cols-1 lg:grid-cols-3 gap-8', this.el);
		const	profile_achievement = addElement('div', 'lg:col-span-1 space-y-6', container);

		const	player_card = new Player_card();
		player_card.mount(profile_achievement);

		const	achievements = new Achievements();
		achievements.mount(profile_achievement);

		const	tournament_history = new Tournament_history();
		tournament_history.mount(container);
	}
}
