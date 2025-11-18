/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Metamask_warning.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/14 21:19:53 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/14 21:49:28 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { addElement, Component } from "../core/Component";

export class Metamask_warning extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar flex justify-center items-start');
	}

	render(): void {
		const	container = addElement('div', 'max-w-lg w-full relative z-10', this.el);
		container.style = 'animation: fadeIn 0.5s ease-out;';

		const	container2 = addElement('div', 'relative', container);

		addElement('div', 'absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl blur-xl', container2);
		const	container3 = addElement('div', 'relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-yellow-500/20 shadow-2xl my-8', container2);
		
		container3.insertAdjacentHTML('beforeend', `
				<div class="relative w-44 h-44 mx-auto mb-10">

					<div class="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-pulse"></div>
					<div class="absolute inset-8 rounded-full border border-yellow-500/20"></div>

					<div class="absolute inset-0 flex items-center justify-center">
						<div class="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-500/30 backdrop-blur-sm">
							<svg class="w-14 h-14 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>
						</div>
					</div>
				</div>
			`);

		container3.insertAdjacentHTML('beforeend', `
				<div class="text-center space-y-4 mb-8">
				<h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
					Wrong Network Detected
				</h2>
				<p class="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
					You're connected to an unsupported network. Please switch to Ethereum Mainnet to continue.
				</p>
				</div>
			`);

		container3.insertAdjacentHTML('beforeend', `
				<div class="bg-yellow-950/30 rounded-xl p-5 border border-yellow-500/30 mb-8">
				<div class="flex items-start space-x-4">
					<div class="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
					<svg class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					</div>
					<div class="flex-1">
					<h3 class="text-yellow-300 font-semibold text-sm mb-1.5">Network Mismatch</h3>
					<p class="text-slate-400 text-xs leading-relaxed mb-3">
						Galactic Pong requires Ethereum Mainnet. Please switch networks in your MetaMask wallet.
					</p>
					<div class="flex items-center space-x-2">
						<div class="flex-1 bg-slate-800/50 rounded px-3 py-2 border border-slate-700">
						<p class="text-slate-500 text-xs">Current Network</p>
						<p class="text-yellow-400 text-sm font-mono">Polygon</p>
						</div>
						<svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
						<div class="flex-1 bg-slate-800/50 rounded px-3 py-2 border border-green-500/30">
						<p class="text-slate-500 text-xs">Required Network</p>
						<p class="text-green-400 text-sm font-mono">Avalanche</p>
						</div>
					</div>
					</div>
				</div>
				</div>
				`);
				
		container3.insertAdjacentHTML('beforeend', `		
				<div class="space-y-3">
				  <button
					class="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20"
				  >
					Switch to Ethereum Mainnet
				  </button>
				</div>
			`);
		
		
	}
}