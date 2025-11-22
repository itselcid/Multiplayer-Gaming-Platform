/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_rounds_matches.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:11:27 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/20 19:37:35 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addElement, Component } from "../core/Component";

class Round extends Component {
	constructor() {
		super('div', 'relative group');
	}
	
	render(): void {
		addElement('div', 'absolute inset-0 bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 rounded-3xl blur-xl', this.el);
		const	round_container = addElement('div', 'relative bg-gradient-to-r from-neon-cyan/10 via-blue-500/10 to-neon-purple/10 backdrop-blur-xl rounded-3xl border border-cyan-400/50 p-6 overflow-hidden', this.el);
		addElement('div', 'absolute top-0 right-0 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl', round_container);
		const	round = addElement('div', 'relative flex items-center gap-4', round_container);
		round.insertAdjacentHTML('beforeend', `
				<div class="p-3 bg-gradient-to-br from-neon-cyan/30 to-blue-500/30 rounded-2xl border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy w-8 h-8 text-cyan-400"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
				</div>
			`);
		round.insertAdjacentHTML('beforeend', `
				<div>
					<p class="text-cyan-300/60 text-sm font-bold mb-1 tracking-wide">CURRENT ROUND</p>
					<h3 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neon-cyan">
					Quarter Finals
					</h3>
				</div>
			`);
		
	}
}

class Matches extends Component {
	constructor() {
		super('div', 'space-y-4');
	}

	render(): void {
		this.el.insertAdjacentHTML('beforeend', `
				<div class="relative group">
					<div class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all">
					</div>
					<div class="relative backdrop-blur-xl rounded-2xl border p-6 transition-all bg-gradient-to-br from-green-500/10 to-emerald-500/5 hover:border-green-400/50 border-green-700/50 shadow-lg shadow-green-500/20">
						<div class="flex items-center justify-between mb-5">
							<span class="text-cyan-300/70 text-sm font-bold tracking-wider">
								MATCH #1
							</span>
							<span class="px-4 py-1.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/70 rounded-full text-green-400 text-xs font-black flex items-center gap-2 shadow-lg shadow-green-500/30">
								<span class="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400">
								</span>
								LIVE NOW
							</span>
						</div>
						<div class="grid grid-cols-3 gap-6 items-center">
							<div class="text-center space-y-3">
								<div class="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30 inline-block">
									<p class="text-white font-black text-base tracking-tight">
										CryptoKing
									</p>
								</div>
								<div class="text-5xl font-black transition-all text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-400">
									2
								</div>
							</div>
							<div class="text-center">
								<div class="relative">
									<div class="absolute inset-0 bg-purple-500/20 blur-xl">
									</div>
									<span class="relative text-slate-400 font-black text-xl tracking-widest">
										VS
									</span>
								</div>
							</div>
							<div class="text-center space-y-3">
								<div class="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 inline-block">
									<p class="text-white font-black text-base tracking-tight">
										BlockMaster
									</p>
								</div>
								<div class="text-5xl font-black transition-all text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-400">
									1
								</div>
							</div>
						</div>
					</div>
				</div>
				
				
				<div class="relative group">
					<div class="relative backdrop-blur-xl rounded-2xl border p-6 transition-all bg-slate-900/70 border-slate-600/30 hover:border-neon-cyan/50">
						<div class="flex items-center justify-between mb-5">
							<span class="text-cyan-300/70 text-sm font-bold tracking-wider">
								MATCH #3
							</span>
							<span class="px-4 py-1.5 bg-slate-700/30 border border-slate-500/50 rounded-full text-slate-400 text-xs font-bold">
								STARTING SOON (04:23)
							</span>
						</div>
						<div class="grid grid-cols-3 gap-6 items-center">
							<div class="text-center space-y-3">
								<div class="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30 inline-block">
									<p class="text-white font-black text-base tracking-tight">
										DeFiLegend
									</p>
								</div>
								<div class="text-5xl font-black transition-all text-slate-600">
									0
								</div>
							</div>
							<div class="text-center">
								<div class="relative">
									<div class="absolute inset-0 bg-purple-500/20 blur-xl">
									</div>
									<span class="relative text-slate-400 font-black text-xl tracking-widest">
										VS
									</span>
								</div>
							</div>
							<div class="text-center space-y-3">
								<div class="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 inline-block">
									<p class="text-white font-black text-base tracking-tight">
										NFTGuru
									</p>
								</div>
								<div class="text-5xl font-black transition-all text-slate-600">
									0
								</div>
							</div>
						</div>
					</div>
				</div>
			`);
		
	}
}

export class Tournament_rounds_matches extends Component {
	constructor() {
		super('div', 'lg:col-span-2 space-y-6');
	}

	render(): void {
		const	round = new Round();
		round.mount(this.el);

		const	matches = new Matches();
		matches.mount(this.el)
	}
}
