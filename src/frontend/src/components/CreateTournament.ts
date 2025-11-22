/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CreateTournament.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 18:01:17 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/19 12:57:15 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { parseEther } from "viem";
import { addElement, Component } from "../core/Component";
import { date_to_bigint } from "../tools/date";
import { create_tournament } from "../web3/setters";

export class CreateTournament extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar flex justify-center items-start');
	}

	render(): void {
		const	container = addElement('div', 'relative max-w-2xl w-full my-8', this.el);
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
		
		const	content = addElement('div', 'relative p-10', globalContainer);

		const	header = addElement('div', 'flex items-center justify-between mb-10', content);
		header.insertAdjacentHTML('beforeend', `
				<div class="relative">
					<h2 class="text-5xl text-center font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-pink-400 animate-pulse">
						INITIALIZE TOURNAMENT
					</h2>
					<div class="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-pink-400 rounded-full"></div>
				</div>
			`);
		const	closeButton = addElement('button', 'absolute right-4 top-4 text-neon-cyan hover:text-red-500 text-3xl w-12 h-12 flex items-center justify-center rounded-full border-2 border-neon-cyan hover:border-red-500 hover:bg-neon-cyan/20 duration-300', header);
		closeButton.textContent = '×';
		closeButton.onclick = () => {this.unmount()};

		const	form = addElement('div', 'grid grid-cols-2 gap-6', content);

		const	title = addElement('div', 'col-span-2 space-y-3', form);
		title.insertAdjacentHTML('beforeend', `
			<label class="flex items-center gap-2 text-neon-cyan font-bold text-sm uppercase tracking-widest">
			  <span class="text-xl">🎮</span>
			  Tournament Name
			</label>
			`);
		const	title_group = addElement('div', 'relative group', title);
		addElement('div', 'absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl blur opacity-30 group-hover:opacity-60 transition', title_group);
		const	title_input = addElement('input', 'relative w-full px-5 py-4 bg-slate-900/90 border-2 border-neon-cyan/50 rounded-xl text-white text-lg placeholder-slate-500 focus:border-neon-cyan focus:outline-none focus:ring-4 focus:ring-neon-cyan/20 transition-all', title_group) as HTMLInputElement;
		title_input.type = 'text';
		title_input.placeholder = 'Enter epic tournament name...';

		const	entryFee = addElement('div', 'space-y-3', form);
		entryFee.insertAdjacentHTML('beforeend', `
			<label class="flex items-center gap-2 text-neon-purple font-bold text-sm uppercase tracking-widest">
			  <span class="text-xl">💎</span>
			  Entry Fee
			</label>
			`);
		const	entryFee_group = addElement('div', 'relative group', entryFee);
		addElement('div', 'absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition', entryFee_group);
		const	entryFee_input_container = addElement('div', 'relative', entryFee_group);
		const	entryFee_input = addElement('input', 'w-full no-spinner px-5 py-4 bg-slate-900/90 border-2 border-neon-purple/50 rounded-xl text-white text-lg placeholder-slate-500 focus:border-neon-purple focus:outline-none focus:ring-4 focus:ring-neon-purple/20 transition-all', entryFee_input_container) as HTMLInputElement;
		entryFee_input.type = 'number';
		entryFee_input.placeholder = '0.00';
		const	entryFee_span = addElement('span', 'absolute right-4 top-1/2 -translate-y-1/2 text-neon-gold font-black text-sm px-3 py-1 bg-neon-gold/10 rounded-full border border-neon-gold/30', entryFee_input_container);
		entryFee_span.textContent = 'TRIZcoin';

		const	participants = addElement('div', 'space-y-3', form);
		participants.insertAdjacentHTML('beforeend', `
				<label class="flex items-center gap-2 text-pink-400 font-bold text-sm uppercase tracking-widest">
				<span class="text-xl">👥</span>
				Max Players
				</label>
			`);
		const	participants_group = addElement('div', 'relative group', participants);
		addElement('div', 'absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-neon-cyan rounded-xl blur opacity-30 group-hover:opacity-60 transition', participants_group);
		const	participants_input = addElement('input', 'relative no-spinner w-full px-5 py-4 bg-slate-900/90 border-2 border-pink-500/50 rounded-xl text-white text-lg placeholder-slate-500 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400/20 transition-all', participants_group) as HTMLInputElement;
		participants_input.type = 'number';
		participants_input.placeholder = '8';

		const	startTime = addElement('div', 'col-span-2 space-y-3', form);
		startTime.insertAdjacentHTML('beforeend', `
				<label class="flex items-center gap-2 text-neon-cyan font-bold text-sm uppercase tracking-widest">
					<span class="text-xl">⏰</span>
					Launch Time (UTC)
				</label>
			`);
		const	startTime_group = addElement('div', 'relative group', startTime);
		addElement('div', 'absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl blur opacity-30 group-hover:opacity-60 transition', startTime_group);
		const	startTime_input = addElement('input', 'relative w-full px-5 py-4 bg-slate-900/90 border-2 border-neon-cyan/50 rounded-xl text-white text-lg focus:border-neon-cyan focus:outline-none focus:ring-4 focus:ring-neon-cyan/20 transition-all', startTime_group) as HTMLInputElement;
		startTime_input.type = 'datetime-local';
		
		content.insertAdjacentHTML('beforeend', `
			<div class="mt-8 relative">
			  <div class="absolute -inset-1 bg-gradient-to-r from-neon-gold via-orange-500 to-neon-gold rounded-2xl blur opacity-40 animate-pulse"></div>
			  <div class="relative p-6 bg-slate-900/90 border-2 border-neon-gold rounded-2xl">
				<div class="flex items-center justify-between">
				  <div class="flex items-center gap-3">
					<span class="text-4xl">🏆</span>
					<div>
					  <div class="text-neon-gold/70 text-sm font-bold uppercase tracking-wider">Total Prize Pool</div>
					  <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-gold to-orange-400">
						0.00 TRIZcoin
					  </div>
					</div>
				  </div>
				  <div class="text-5xl animate-bounce">💰</div>
				</div>
			  </div>
			</div>
			`);
		
		const	buttons = addElement('div', 'flex gap-6 mt-8', content);
		const	cancel_button = addElement('button', 'flex-1 px-8 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-slate-400 font-bold text-lg uppercase tracking-wider hover:border-slate-400 hover:text-slate-300 hover:bg-slate-800 transition-all duration-300 hover:scale-105', buttons);
		cancel_button.textContent = 'Cancel';
		cancel_button.onclick = () => {this.unmount();}
		const	create_button = addElement('button', 'relative flex-1 px-8 py-4 bg-gradient-to-r from-neon-cyan via-neon-purple to-pink-500 rounded-xl text-white font-black text-lg uppercase tracking-wider overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl shadow-neon-cyan/50', buttons);
		create_button.insertAdjacentHTML('beforeend', `
				<div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-neon-purple to-neon-cyan"></div>
					<span class="relative flex items-center justify-center gap-2">
					<span class="text-2xl">🚀</span>
					Create
					<span class="text-2xl">🚀</span>
				</span>
			`);
		create_button.onclick = async () => {
			await create_tournament(
				title_input.value,
				parseEther(entryFee_input.value),
				BigInt(participants_input.value),
				date_to_bigint(startTime_input.value)
			);
			this.unmount();
		};
		
	}
}