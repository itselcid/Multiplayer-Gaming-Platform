/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   sign_in.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/10 20:23:20 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/16 20:49:10 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { login_state, web3auth } from "../core/appStore";
import { Component } from "../core/Component";

export class Sign_in extends Component {
	constructor() {
		super('button', 'relative px-6 py-2.5 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-slate-900 transition-all font-bold text-sm uppercase tracking-wider overflow-hidden group');
	}

	render(): void {
	    this.el.innerHTML = `
		<span class="relative z-10">
			Sign In
		</span>
		<div class="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
		`

		this.el.onclick = async () => {
			const	connected = await web3auth.isLoggedIn();
			if (connected)
				login_state.set('connected');
			else
				login_state.set('not connected');
		}
	}
}
