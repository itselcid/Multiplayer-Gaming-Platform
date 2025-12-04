/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Metamask_error.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/08 17:57:08 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/05 00:05:05 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { web3auth } from "../core/appStore";
import { addElement, Component } from "../core/Component";

export class Metamask_error extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar flex justify-center items-start');
	}

	render(): void {
		const	container = addElement('div', 'max-w-lg w-full relative z-10', this.el);
		container.style = 'animation: fadeIn 0.5s ease-out;';

		const	container2 = addElement('div', 'relative', container);

		addElement('div', 'absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-3xl blur-xl', container2);
		const	container3 = addElement('div', 'relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-red-500/20 shadow-2xl my-8', container2);


		container3.insertAdjacentHTML('beforeend', `
		<div class="relative w-44 h-44 mx-auto mb-10">
			<div class="absolute inset-0 rounded-full border-2 border-red-500/20"></div>
			<div class="absolute inset-8 rounded-full border border-red-500/10"></div>

			<div class="absolute inset-0 flex items-center justify-center">
				<div class="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl p-8 border border-red-500/30 backdrop-blur-sm">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x w-14 h-14 text-red-400"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
				</div>
			</div>
		</div>
	`);

		container3.insertAdjacentHTML('beforeend', `
			<div class="text-center space-y-4 mb-8">
				<h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">
					Connection Rejected
				</h2>
				<p class="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
					The wallet connection was declined. You need to approve the connection to play Galactic Pong.
				</p>
			</div>

			<div class="bg-red-950/30 rounded-xl p-5 border border-red-500/30 mb-8">
				<div class="flex items-start space-x-4">
					<div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x w-5 h-5 text-red-400"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
					</div>
					<div class="flex-1">
						<h3 class="text-red-300 font-semibold text-sm mb-1.5">
							Connection Failed
						</h3>
						<p class="text-slate-400 text-xs leading-relaxed">
							You rejected the MetaMask connection request. To access game features, please approve the connection.
						</p>
					</div>
				</div>
			</div>
		`)
              

		const	retry_return = addElement('div', 'space-y-3', container3);

		const	retry = addElement('button', 'w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20', retry_return);
		retry.textContent = 'Try Connection Again';
		retry.onclick = () => {
			this.unmount();
			web3auth.login();
		}

		const	reeturn = addElement('button', 'w-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-slate-700', retry_return);
		reeturn.textContent = 'Return';
		reeturn.onclick = () => {
			this.unmount();
		}
 	}
}
