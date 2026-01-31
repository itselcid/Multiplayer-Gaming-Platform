/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Success_wallet_connection.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/09 01:35:01 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/31 16:33:11 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { web3auth } from "../core/appStore";
import { addElement, Component } from "../core/Component";

export class Success_wallet_connection extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar flex justify-center items-start');
	}

	async render(): Promise<void> {
		const	container = addElement('div', 'max-w-lg w-full relative z-10 my-8', this.el);
		container.style = 'animation: fadeIn 0.5s ease-out;';
		const	container2 = addElement('div', 'relative', container);

		// glow effect
		addElement('div', 'absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl', container2);
		const	container3 = addElement('div', 'relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-green-500/20 shadow-2xl', container2);

		container3.insertAdjacentHTML('beforeend', `
									  <div class="relative w-44 h-44 mx-auto mb-10">
									  	<div class="absolute inset-0 rounded-full border-2 border-green-500/30" style="animation: expandCircle 2s ease-out infinite;"></div>
									  	<div class="absolute inset-0 rounded-full border-2 border-green-500/30" style="animation: expandCircle 2s ease-out infinite; animation-delay: 0.5s;"></div>

									  	<div class="absolute inset-0 rounded-full border-2 border-green-500/20"></div>
									  	<div class="absolute inset-8 rounded-full border border-green-500/10"></div>

									  	<div class="absolute inset-0 flex items-center justify-center">
									  		<div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-8 border border-green-500/30 backdrop-blur-sm">
									  			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check w-14 h-14 text-green-400"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
										  	</div>
									  	</div>
									  </div>
									  `);
		container3.insertAdjacentHTML('beforeend', `

									  <div class="text-center space-y-4 mb-8">
									  	<h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
									  		Successfully Connected
									  	</h2>
									  	<p class="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
									  		Your wallet is now connected and verified. You're ready to compete in the galaxy!
									  	</p>
									  </div>
									  `);
		const	wallet_address = await web3auth.getEthAddress();
		container3.insertAdjacentHTML('beforeend', `
										<div class="bg-gradient-to-br from-green-950/30 to-emerald-950/30 rounded-xl p-6 border border-green-500/30 mb-8" style="animation: slide-up 0.6s ease-out 0.2s both;">
									  		<div class="flex items-center justify-between mb-4">
									  			<span class="text-green-300 text-xs font-bold uppercase tracking-widest">Connected Wallet</span>
									  			<div class="flex items-center space-x-2">
									  				<div class="relative">
									 				<div class="w-2 h-2 bg-green-400 rounded-full"></div>
									 				<div class="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
									 			</div>
									  			<span class="text-green-400 text-xs font-mono">LIVE</span>
									  		</div>
										</div>
										<div class="bg-slate-900/70 rounded-lg px-4 py-3.5 border border-slate-700/50">
									  	<p class="text-green-400 font-mono text-sm tracking-wide">${wallet_address.toUpperCase()}</p>
										</div>
									</div>
		`);
		container3.insertAdjacentHTML('beforeend', `
			<div class="grid grid-cols-3 gap-3 mb-8" style="animation: slide-up 0.6s ease-out 0.3s both;">
				<div class="bg-slate-800/50 rounded-lg p-4 border border-green-500/20 text-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check w-5 h-5 text-green-400 mx-auto mb-2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
					<p class="text-slate-400 text-xs">Verified</p>
				</div>
				<div class="bg-slate-800/50 rounded-lg p-4 border border-green-500/20 text-center">
					<div class="text-green-400 text-sm font-bold mb-2">AVAX</div>
					<p class="text-slate-400 text-xs">Network</p>
				</div>
				<div class="bg-slate-800/50 rounded-lg p-4 border border-green-500/20 text-center">
					<div class="text-green-400 text-lg mb-2"></div>
					<p class="text-slate-400 text-xs">Ready</p>
				</div>
			</div>
		`);
		const	play = addElement('button', 'w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20', container3);
		play.style = 'animation: slide-up 0.6s ease-out 0.4s both;';
		play.textContent = 'Launch Galactic Pong →';
		play.onclick = () => {
			this.unmount();
		};
	}
}
