/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ConnectWallet.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/02 23:23:59 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/03 01:56:49 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { web3auth } from "../core/appStore";
import { addElement, Component } from "../core/Component";

export class ConnectWallet extends Component {
	constructor() {
		super('div', 'fixed flex justify-center items-center inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar');
	}

	render(): void {
		const	container = addElement('div', 'relative max-w-2xl w-full', this.el);
		// outer glow
		addElement('div', 'absolute inset-0 bg-gradient-to-r from-neon-purple via-pink-500 to-neon-cyan rounded-3xl blur-2xl opacity-30 animate-pulse', container);

		const globalContainer = addElement('div', 'relative bg-space-dark border-2 border-neon-cyan rounded-3xl overflow-hidden shadow-2xl shadow-neon-cyan/50', container);
		
		const	grid_background = addElement('div', 'absolute inset-0 opacity-15', globalContainer);
		addElement('div', 'absolute inset-0 bg-size-[50px_50px] bg-[image:linear-gradient(to_right,var(--color-neon-cyan)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-neon-cyan)_1px,transparent_1px)]', grid_background);
		
		// Animated gradient overlay
		addElement('div', 'absolute inset-0 bg-gradient-to-br from-neon-purple/30 via-blue-900/20 to-cyan-900/30', globalContainer);

		// Corner accent lights
		addElement('div', 'absolute top-0 left-0 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl', globalContainer);
		addElement('div', 'absolute bottom-0 right-0 w-40 h-40 bg-neon-purple/20 rounded-full blur-3xl', globalContainer);
		addElement('div', 'absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse', globalContainer);
		
		const	content = addElement('div', 'relative p-10 flex flex-col justify-center items-center', globalContainer);
		
		content.insertAdjacentHTML('beforeend', `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-20 h-20 mx-auto mb-6 text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
				<h2 class="text-3xl text-center font-bold mb-4 text-neon-cyan">Connect Your Wallet</h2>
				<p class="text-gray-300 mb-8 text-lg text-center">Connect your Metamask wallet to verify your identity and participate in blockchain-verified tournaments</p>
				`);
		const	connect_button = addElement('button', 'w-full m-4 px-8 py-4 rounded-lg bg-ctex text-white font-bold text-lg hover:shadow-2xl hover:shadow-neon-cyan/50 transition-all transform hover:scale-105', content);
		connect_button.textContent = 'Connect MetaMask';
		connect_button.onclick = async () => {
			await web3auth.login();
			this.unmount();
		}

		const	return_button = addElement('button', 'w-full m-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-slate-700', content);
		return_button.textContent = 'Return';
		return_button.onclick = () => {
			this.unmount();
		}
	}
}