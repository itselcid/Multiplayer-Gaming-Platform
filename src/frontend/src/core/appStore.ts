/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   appStore.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/03 15:31:14 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/21 23:42:28 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Disconnect_wallet } from "../components/Disconnect_wallet";
import { Navbar_connect_wallet, Navbar_connected_wallet } from "../components/Navbar";
import { Sign_in } from "../components/sign_in";
import { join_tournament_active, join_tournament_inactive } from "../components/Tournament_card";
import { TournamentsDisplay, TournamentTab } from "../pages/Tournaments";
import { Web3Auth } from "../web3/auth";
import { tournamentsGlobal } from "../web3/getters";
import { State } from "./state";

// nav bar active tab state
// state init
const url = new URL(window.location.href);
const pathSegments = url.pathname.split('/').filter(Boolean); // remove empty parts
if (!pathSegments[0])
	pathSegments[0] = 'home';
export const active_tab = new State(
	{
		old: '',
		new: pathSegments[0]
	}
);
// subscribers
export const active_tab_sub = () => {
	active_tab.subscribe(() => {
		const aT = active_tab.get();
		if (aT.old) {
			const	old_tab = document.getElementById(aT.old);
			if (old_tab)
				old_tab.className = 'transition-all text-gray-300 hover:text-neon-cyan';
		}
		const new_tab = document.getElementById(aT.new);
		if (new_tab)
			new_tab.className = 'transition-all text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]';
	});
}

// web3logged
export const	web3auth = new Web3Auth();
export const login_state = new State(
	'sign in'
	// await web3auth.isLoggedIn()
);
export const web3_login_sub = () => {
	login_state.subscribe(() => {
		const	auth = document.getElementById('auth');
		const	disconnect_container = document.getElementById('disconnect_container');
		const	join_tournament = document.querySelectorAll<HTMLElement>('.join-tournament-button');
		if (!auth) {
			console.error('cant find auth id');
			return ;
		}
		if (login_state.get() === 'sign in')
		{
			const	sign_in = new Sign_in();
			auth.innerHTML = '';
			sign_in.mount(auth)
		}
		else if (login_state.get() === 'connected')
		{
			const	navbar_connected_wallet = new Navbar_connected_wallet();
			auth.innerHTML = '';
			navbar_connected_wallet.mount(auth);
			if (disconnect_container) {
				disconnect_container.innerHTML = '';
				const	disconnect = new Disconnect_wallet();
				disconnect.mount(disconnect_container);
			}
			if (join_tournament) {
				let i: number = 0;
				tournamentsGlobal.forEach(tournament => {
					join_tournament[i].innerHTML = '';
					const	join_button_active = new join_tournament_active(Number(tournament.id));
					join_button_active.mount(join_tournament[i]);
					i++;
				});
			}
			
		} else {
			console.log('web3 is not connected');
			const	navbar_connect_wallet = new Navbar_connect_wallet();
			auth.innerHTML = '';
			navbar_connect_wallet.mount(auth);
			if (disconnect_container) {
				disconnect_container.innerHTML = '';
			}
			if (join_tournament) {
				join_tournament.forEach(element => {
					element.innerHTML = '';
					const	join_button_inactive = new join_tournament_inactive();
					join_button_inactive.mount(element);
				});
			}
		}
	})
}

// tournament tabs
export const	tournament_tab = new State('all');
export const	tournament_tab_sub = () => {
	tournament_tab.subscribe(() => {
		const tournament_tab_container = document.getElementById('tournamentsTabs');
		const	tournament_list_container = document.getElementById('tournaments-list')
		if (tournament_tab_container) {
			tournament_tab_container.innerHTML = '';
			const	tournament = new TournamentTab();
			tournament.mount(tournament_tab_container);
		}
		if (tournament_list_container) {
			tournament_list_container.innerHTML = '';
			const	tournamentsDisplay = new TournamentsDisplay();
			tournamentsDisplay.mount(tournament_list_container);
		}
	})
}
