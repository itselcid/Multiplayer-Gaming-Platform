/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Navbar.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/14 14:43:40 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/12 02:34:08 by kez-zoub         ###   ########.fr       */
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

	const	container = addElement('div', 'max-w-7xl mx-auto px-6 py-2', this.el);
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

	const	links_container = addElement('div', 'hidden lg:flex items-center space-x-8', container2);
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Home', 'home', '/');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Tournaments', 'tournaments', '/tournaments');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Leaderboard', 'leaderboard', '/leaderboard');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Profile', 'profile', '/profile');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Login', 'login', '/login');
		link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Chat', 'chat', '/chat');


	const	auth = addElement('div', 'hidden lg:block', container2);
	auth.id = 'auth';

	//if (isLogged)
	//	connected_wallet.mount(container2);
	//else
	//	connect_wallet.mount(container2);

	// inside container2
	// <!-- Hamburger Button -->
	container2.insertAdjacentHTML('beforeend', `
		<button id="hamburger" class="lg:hidden text-gray-300 hover:text-neon-cyan transition-all">
		  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
			<line x1="3" y1="12" x2="21" y2="12"></line>
			<line x1="3" y1="6" x2="21" y2="6"></line>
			<line x1="3" y1="18" x2="21" y2="18"></line>
		  </svg>
		</button>
		`);

	// container.insertAdjacentHTML('beforeend', `
	// 		<div id="mobileMenu" class="hidden lg:hidden mt-4 pb-4 space-y-4">
	// 			<a class="block text-center transition-all text-gray-300 hover:text-neon-cyan py-2" id="home-mobile">Home</a>
	// 			<a class="block text-center transition-all text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] py-2" id="tournaments-mobile">Tournaments</a>
	// 			<a class="block text-center transition-all text-gray-300 hover:text-neon-cyan py-2" id="leaderboard-mobile">Leaderboard</a>
	// 			<a class="block text-center transition-all text-gray-300 hover:text-neon-cyan py-2" id="profile-mobile">Profile</a>
			
	// 			<div class="pt-4 border-t border-neon-cyan/20">
	// 				<a class="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 hover:border-neon-cyan transition-all">
	// 				<span class="text-sm font-mono">0xBDE9...ADA0</span>
	// 				<div class="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
	// 					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-4 h-4" aria-hidden="true">
	// 					<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
	// 					<circle cx="12" cy="7" r="4"></circle>
	// 					</svg>
	// 				</div>
	// 				</a>
	// 			</div>
	// 		</div>
	// 	`);

	const	mobileMenu = addElement('div', 'hidden lg:hidden mt-4 pb-4 space-y-4', container);
	link('a', 'block text-center transition-all text-gray-300 hover:text-neon-cyan', mobileMenu, 'Home', 'homeMobile', '/');
	link('a', 'block text-center transition-all text-gray-300 hover:text-neon-cyan', mobileMenu, 'Tournaments', 'tournamentsMobile', '/tournaments');
	link('a', 'block text-center transition-all text-gray-300 hover:text-neon-cyan', mobileMenu, 'Leaderboard', 'leaderboardMobile', '/leaderboard');
	link('a', 'block text-center transition-all text-gray-300 hover:text-neon-cyan', mobileMenu, 'Profile', 'profileMobile', '/profile');
	const	authMobile = addElement('div', 'flex items-center justify-center', mobileMenu);
	authMobile.id = 'authMobile';

	const hamburger = container2.querySelector('#hamburger');
	// const mobileMenu = container.querySelector('#mobileMenu');
	// console.log(hamburger, mobileMenu);

	if(hamburger && mobileMenu) {
		// console.log('toggle registered')
		hamburger.addEventListener('click', () => {
			mobileMenu.classList.toggle('hidden');
			// console.log('toggle clicked')
		});
		
	}
	
	// this.el.append(container);

  }
}

export class Navbar_connected_wallet extends Component {
	constructor() {
		super('div');
	}

	async render() {
		const	link = addElement('a', 'flex items-center justify-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 hover:border-neon-cyan transition-all');
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
		const	link_span = addElement('span', 'text-sm font-mono current-web3-account', link);
		// link_span.id = 'current-web3-account';
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
		super('button', 'flex items-center justify-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-lg hover:shadow-neon-cyan/50 transition-all transform hover:scale-105');
	}

	render() {
	// const	connect_wallet_button = addElement('', '');
	this.el.insertAdjacentHTML('beforeend', `
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet w-5 h-5" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
		<span class="font-semibold">Connect Wallet</span>
	`);
	this.el.onclick = web3auth.login;

	// this.el.append(connect_wallet_button);
	}
}
