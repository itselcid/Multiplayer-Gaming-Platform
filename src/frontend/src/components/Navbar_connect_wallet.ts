// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Navbar_connect_wallet.ts                           :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/04 20:04:52 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/05 02:52:02 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { web3auth } from "../core/appStore";
import { addElement, Component } from "../core/Component";

export class Navbar_connect_wallet extends Component {
	constructor() {
		super('div');
	}

	render() {
	const	connect_wallet_button = addElement('button', 'flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-lg hover:shadow-neon-cyan/50 transition-all transform hover:scale-105');
	connect_wallet_button.insertAdjacentHTML('beforeend', `
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
		<span class="font-semibold">Connect Wallet</span>
	`);
	connect_wallet_button.onclick = web3auth.login;

	this.el.append(connect_wallet_button);
	}
}
