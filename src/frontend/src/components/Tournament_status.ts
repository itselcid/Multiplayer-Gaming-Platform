/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_status.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 14:27:21 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/20 23:54:46 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";

export class Tournament_status extends Component {
	private	_status: string;
	constructor(status: string) {
		super('div', 'absolute right-4 top-4');
		this._status = status;
	}

	render(): void {
		switch (this._status) {
			case 'pending':
				this.el.innerHTML = `
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-full mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3 h-3 stroke-yellow-400 animate-pulse" aria-hidden="true"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>
						<span class="text-yellow-400 font-bold text-xs tracking-wider">PENDING</span>
					</div>
				`;
				break;
			case 'ongoing':
				this.el.innerHTML = `
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400 rounded-full mb-6">
						<span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
						<span class="text-green-400 font-bold text-xs tracking-wider">ONGOING</span>
					</div>
				`;
				break;
			case 'finished':
				this.el.innerHTML = `
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-400 rounded-full mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-3 h-3 stroke-gray-400" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
						<span class="text-gray-400 font-bold text-xs tracking-wider">FINISHED</span>
					</div>
				`;
				break;
			case 'expired':
				this.el.innerHTML = `
					<div class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400 rounded-full mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x w-3 h-3 stroke-red-500" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
						<span class="text-red-400 font-bold text-xs tracking-wider">EXPIRED</span>
					</div>
				`;
				break;
		}
	}
}
