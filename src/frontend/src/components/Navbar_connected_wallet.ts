// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Navbar_connected_wallet.ts                         :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/05 00:12:54 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/05 02:52:23 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { web3auth } from "../core/appStore";
import { addElement, Component } from "../core/Component";
import { navigate } from "../core/router";
import { shortenEthAddress } from "../web3/tools";

export class Navbar_connected_wallet extends Component {
	constructor() {
		super('div');
	}

	async render() {
		const	link = addElement('a', 'flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 hover:border-neon-cyan transition-all');
		link.onclick = (e) => {
			e.preventDefault();
			navigate('/profile');
		}
		const	link_span = addElement('span', 'text-sm font-mono', link);
		link_span.textContent = shortenEthAddress(await web3auth.getEthAddress()); 

		link.insertAdjacentHTML('beforeend', `
			<div class="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-4 h-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
				</svg>
			</div>
		`);

		this.el.append(link);
	}
}
