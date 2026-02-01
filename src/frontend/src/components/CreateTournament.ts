/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CreateTournament.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 18:01:17 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/30 19:04:40 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { parseEther } from "viem";
import { addElement, Component } from "../core/Component";
import { date_to_bigint } from "../tools/date";
import { approveAllowence, create_tournament } from "../web3/setters";
import { getAllowance } from "../web3/getters";
import { walletClientMetamask } from "../web3/contracts/contracts";
import { Metamask_error } from "./Metamask_error";
import { getRevertReason } from "../tools/errors";
import { isUsernameTaken } from "../tools/fetching";
import { userState } from "../core/appStore";

class	PendingButton extends Component {
	constructor() {
		super('button', 'relative flex-1 px-8 py-4 rounded-xl text-white font-black text-lg uppercase tracking-wider overflow-hidden group transition-all duration-300 shadow-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 shadow-gray-600/50 disabled:hover:scale-100')
	}
	
	render(): void {
		const button = this.el as HTMLButtonElement;
		button.disabled = true;

		// ripple effect
		this.el.insertAdjacentHTML('beforeend', `
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="w-20 h-20 border-2 border-white/30 rounded-full animate-ping" style="animation-duration: 2s">
					</div>
				</div>
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="w-20 h-20 border-2 border-white/20 rounded-full animate-ping" style="animation-duration: 2s; animation-delay: 0.5s">
					</div>
				</div>
			`);

		const	text_container = addElement('span', 'absolute inset-0 flex flex-col items-center justify-center', this.el);
		text_container.insertAdjacentHTML('beforeend', `<span class="relative z-10 animate-pulse text-base mb-1">Processing</span>`);
		const	text_container_animation = addElement('div', 'flex gap-1', text_container);
		[0, 1, 2].map((i) => {text_container_animation.insertAdjacentHTML('beforeend', `
				<div
					class="w-1 h-1 bg-white rounded-full animate-bounce"
					style="animation-delay: ${i * 0.15}s; animation-duration: 0.6s">
				</div>
			`)})
	}
}

export const	username_availabality_checker = async (username: string): Promise<Number> => {
	const	root = document.getElementById('app');
	if (!root)
		return (1);
	try {
		const	usernameIsTaken = await isUsernameTaken(username);
		if (usernameIsTaken) {
			const	metamask_error = new Metamask_error(
				"Transaction failed",
				"The transaction failed for the following reason: Username already taken",
				false
			);
			metamask_error.mount(root);
			return(1);
		}
	} catch (err) {
		const	metamask_error = new Metamask_error(
			"Transaction failed",
			"The transaction failed for the following reason: " + getRevertReason(err),
			false
		);
		metamask_error.mount(root);
		return (1);
	}
	return (0);
}

export class CreateTournament extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar flex justify-center items-start');
	}

	async render(): Promise<void> {
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
					<h2 class="text-5xl text-center font-black text-ctex animate-pulse">
						INITIALIZE TOURNAMENT
					</h2>
					<div class="absolute -bottom-2 left-0 right-0 h-1 bg-ctex rounded-full"></div>
				</div>
			`);
		const	closeButton = addElement('button', 'absolute right-4 top-4 text-neon-cyan hover:text-red-500 text-3xl w-12 h-12 flex items-center justify-center rounded-full border-2 border-neon-cyan hover:border-red-500 hover:bg-neon-cyan/20 duration-300', header);
		closeButton.textContent = '×';
		closeButton.onclick = () => {this.unmount()};

		const	form = addElement('div', 'grid grid-cols-2 gap-6', content);

		// if not logged in:
		let	username_input: HTMLInputElement;
		if (!userState.get()) {
			const	username = addElement('div', 'space-y-3', form);
			username.insertAdjacentHTML('beforeend', `
				<label class="flex items-center gap-2 text-neon-gold font-bold text-sm uppercase tracking-widest">
				  <span class="text-xl"></span>
				  Your Username
				</label>
				`);
			const	username_group = addElement('div', 'relative group', username);
			addElement('div', 'absolute -inset-0.5 bg-gradient-to-r from-neon-gold to-neon-purple rounded-xl blur opacity-30 group-hover:opacity-60 transition', username_group);
			username_input = addElement('input', 'relative w-full px-5 py-4 bg-slate-900/90 border-2 border-neon-gold/50 rounded-xl text-white text-lg placeholder-slate-500 focus:border-neon-gold focus:outline-none focus:ring-4 focus:ring-neon-gold/20 transition-all', username_group) as HTMLInputElement;
			username_input.type = 'text';
			username_input.placeholder = 'Enter your username';
		}

		// if logged in
		let	title;
		if (userState.get())
			title = addElement('div', 'col-span-2 space-y-3', form);
		// if not logged in
		else
			title = addElement('div', 'space-y-3', form);
		title.insertAdjacentHTML('beforeend', `
			<label class="flex items-center gap-2 text-neon-cyan font-bold text-sm uppercase tracking-widest">
			  <span class="text-xl"></span>
			  Tournament Name
			</label>
			`);
		const	title_group = addElement('div', 'relative group', title);
		addElement('div', 'absolute -inset-0.5 bg-ctex rounded-xl blur opacity-30 group-hover:opacity-60 transition', title_group);
		const	title_input = addElement('input', 'relative w-full px-5 py-4 bg-slate-900/90 border-2 border-neon-cyan/50 rounded-xl text-white text-lg placeholder-slate-500 focus:border-neon-cyan focus:outline-none focus:ring-4 focus:ring-neon-cyan/20 transition-all', title_group) as HTMLInputElement;
		title_input.type = 'text';
		title_input.placeholder = 'Enter an epic name...';

		const	entryFee = addElement('div', 'space-y-3', form);
		entryFee.insertAdjacentHTML('beforeend', `
			<label class="flex items-center gap-2 text-neon-purple font-bold text-sm uppercase tracking-widest">
			  <span class="text-xl"></span>
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
				<span class="text-xl"></span>
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
					<span class="text-xl"></span>
					Launch Time (UTC)
				</label>
			`);
		const	startTime_group = addElement('div', 'relative group', startTime);
		addElement('div', 'absolute -inset-0.5 bg-ctex rounded-xl blur opacity-30 group-hover:opacity-60 transition', startTime_group);
		const	startTime_input = addElement('input', 'relative w-full px-5 py-4 bg-slate-900/90 border-2 border-neon-cyan/50 rounded-xl text-white text-lg focus:border-neon-cyan focus:outline-none focus:ring-4 focus:ring-neon-cyan/20 transition-all', startTime_group) as HTMLInputElement;
		startTime_input.type = 'datetime-local';

		const	prizePoolContainer = addElement('div', 'mt-8 relative', content);
		addElement('div', 'absolute -inset-1 bg-gradient-to-r from-neon-gold via-orange-500 to-neon-gold rounded-2xl blur opacity-40 animate-pulse', prizePoolContainer);
		const	prizePoolContainer2 = addElement('div', 'relative p-6 bg-slate-900/90 border-2 border-neon-gold rounded-2xl', prizePoolContainer);
		const	prizePoolContainer3 =addElement('div', 'flex items-center justify-between', prizePoolContainer2);
		const	prizePoolContainer4 =addElement('div', 'flex items-center gap-3', prizePoolContainer3);
		prizePoolContainer4.insertAdjacentHTML('beforeend', `<span class="text-4xl"></span>`);
		const	prizePoolContainer5 =addElement('div', '', prizePoolContainer4);
		prizePoolContainer5.insertAdjacentHTML('beforeend', `<div class="text-neon-gold/70 text-sm font-bold uppercase tracking-wider">Total Prize Pool</div>`);
		const	totalPrizePool = addElement('div', 'text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-gold to-orange-400', prizePoolContainer5);
		totalPrizePool.textContent = "0.00 TRIZcoin";
		prizePoolContainer3.insertAdjacentHTML('beforeend', `<div class="text-5xl animate-bounce"></div>`);

		function updateTotalPrize() {
		const participants = parseFloat(participants_input.value) || 0;
		const entryFee = parseFloat(entryFee_input.value) || 0;
		totalPrizePool.textContent = (participants * entryFee).toFixed(2) + " TRIZcoin";
		}

		participants_input.addEventListener('input', updateTotalPrize);
		entryFee_input.addEventListener('input', updateTotalPrize);
		
		const	buttons = addElement('div', 'flex gap-6 mt-8', content);
		const	cancel_button = addElement('button', 'flex-1 px-8 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-slate-400 font-bold text-lg uppercase tracking-wider hover:border-slate-400 hover:text-slate-300 hover:bg-slate-800 transition-all duration-300 hover:scale-105', buttons);
		cancel_button.textContent = 'Cancel';
		cancel_button.onclick = () => {this.unmount();}
		const	create_button = addElement('button', 'relative flex-1 px-8 py-4 bg-neon-cyan rounded-xl text-space-dark font-black text-lg uppercase tracking-wider overflow-hidden group hover:scale-105 transition-all duration-300 shadow-2xl shadow-neon-cyan/50', buttons) as HTMLButtonElement;
		if (!walletClientMetamask)
				return;
		
		const	accounts = await walletClientMetamask.getAddresses();
		const	account = accounts[0];
		let		allowance = await getAllowance(account);
		// console.log('allowance',allowance);
		if (allowance == 0n){
			create_button.textContent = 'Approve';
		} else {
			create_button.textContent = 'Create';
		}
		create_button.onclick = async () => {
			create_button.disabled = true;
			const	root = document.getElementById('app');
			if (!root) {
				create_button.disabled = false;
				return ;
			}
			if (!userState.get()) {
				// console.log('user is not logged in, checking availability...');
				if (await username_availabality_checker(username_input.value)){
					// console.log('username not available');
					create_button.disabled = false;
					return;
				}
				// console.log('username available');
			}
			const	pend_button = new PendingButton();
			try {
				allowance = await getAllowance(account);	
				console.log('getting allowance',allowance);
				const	entryFeeValue:bigint = parseEther(entryFee_input.value);
				
				if (allowance < entryFeeValue) {
					create_button.hidden = true;
					pend_button.mount(buttons);
					await approveAllowence(entryFeeValue);
					pend_button.unmount();
					create_button.textContent = 'Create';
					create_button.hidden = false
				} else {
					create_button.hidden = true;
					pend_button.mount(buttons);
					const state = userState.get();
					await create_tournament(
						title_input.value,
						entryFeeValue,
						BigInt(participants_input.value),
						date_to_bigint(startTime_input.value),
						state && state.username !== undefined? state.username: username_input.value
					);
					this.unmount();
				}
	
			} catch(err) {
				const	root = document.getElementById('app');
				if (root) {
					pend_button.unmount();
					create_button.hidden = false;
					const	metamask_error = new Metamask_error(
						"Transaction failed",
						"The transaction failed for the following reason: " + getRevertReason(err),
						false
					);
					metamask_error.mount(root);
				}
				create_button.disabled = false;
			}
			create_button.disabled = false;
		};
	}
}
