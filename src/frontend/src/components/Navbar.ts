/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Navbar.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/14 14:43:40 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/01 01:45:02 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { active_tab, web3auth } from "../core/appStore";
import { addElement, Component } from "../core/Component";
import { navigate } from "../core/router";
import { shortenEthAddress } from "../web3/tools";

const	link = (tag: string, classes: string, parent: HTMLElement, text: string, id: string, path: string): HTMLElement => {
	const	link = addElement(tag, classes, parent);
	link.textContent = text;
	link.id = id;
	link.onclick = (e) => {
		e.preventDefault();
		navigate(path)
		active_tab.set(
			{
				old: active_tab.get().new,
				new: id
			}
		)
	}
	return (link);
}

export class Navbar extends Component {
  constructor() {
    super("nav");
	this.el.className = "border-b border-neon-cyan/20 bg-space-blue/50 backdrop-blur-md";
  }

  render() {

	const	container = addElement('div', 'max-w-7xl mx-auto px-6 py-2');
	const	container2 = addElement('div', 'flex items-center justify-between', container);

	const	logo = addElement('div', 'flex items-center space-x-2 cursor-pointer', container2);
	logo.insertAdjacentHTML('beforeend', `
			<img src="/logo.png" alt="Logo" class="h-15">
			<span class="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
				GALACTIK PONG
			</span>
	`);
	logo.onclick = () => {
		navigate('/');
		active_tab.set(
			{
				old: active_tab.get().new,
				new: 'home'
			}
		)
	}

	const	links_container = addElement('div', 'flex items-center space-x-8', container2);
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Home', 'home', '/');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Tournaments', 'tournaments', '/tournaments');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Leaderboard', 'leaderboard', '/leaderboard');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Profile', 'profile', '/profile');


	const	auth = addElement('div', '', container2);
	auth.id = 'auth';

	//if (isLogged)
	//	connected_wallet.mount(container2);
	//else
	//	connect_wallet.mount(container2);
	
	this.el.append(container);

  }
}

export class Navbar_connected_wallet extends Component {
	constructor() {
		super('div');
	}

	async render() {
		const	link = addElement('a', 'flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 hover:border-neon-cyan transition-all');
		link.onclick = (e) => {
			e.preventDefault();
			navigate('/profile');
			active_tab.set(
				{
					old: active_tab.get().new,
					new: 'profile'
				}
			)
		}
		const	link_span = addElement('span', 'text-sm font-mono', link);
		link_span.id = 'current-web3-account';
		link_span.textContent = shortenEthAddress(await web3auth.getEthAddress()); 

		link.insertAdjacentHTML('beforeend', `
			<div class="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-4 h-4" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
				</svg>
			</div>
		`);

		this.el.append(link);
	}
}

export class Navbar_connect_wallet extends Component {
	constructor() {
		super('div');
	}

	render() {
	const	connect_wallet_button = addElement('button', 'flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-lg hover:shadow-neon-cyan/50 transition-all transform hover:scale-105');
	connect_wallet_button.insertAdjacentHTML('beforeend', `
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
		<span class="font-semibold">Connect Wallet</span>
	`);
	connect_wallet_button.onclick = web3auth.login;

	this.el.append(connect_wallet_button);
	}
}
