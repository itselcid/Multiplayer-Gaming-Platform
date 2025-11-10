// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Disconnect_wallet.ts                               :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/06 20:03:57 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/06 20:06:47 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { web3auth } from "../core/appStore";
import { Component } from "../core/Component";

export class Disconnect_wallet extends Component {
	constructor() {
		super('button', 'w-full py-3 bg-gradient-to-r from-red-500 to-red-700 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center space-x-2');
	}

	render(): void {
			this.el.onclick = () => {
				web3auth.logout();
			}
			this.el.insertAdjacentHTML('beforeend', `
										  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
											  </svg>
										  <span>
										  Disconnect Wallet
										  </span>
										  `);

	}
}
