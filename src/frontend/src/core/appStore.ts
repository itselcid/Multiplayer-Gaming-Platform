/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   appStore.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/03 15:31:14 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/12/21 22:45:45 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Disconnect_wallet } from "../components/Disconnect_wallet";
import { Navbar_connect_wallet, Navbar_connected_wallet } from "../components/Navbar";
import { Sign_in } from "../components/sign_in";
import { Tournament_card } from "../components/Tournament_card";
import { render_claim_prize_button } from "../components/Tournament_claim_prize";
import { fill_tournament_recrute } from "../components/Tournament_recrute";
import { render_claim_refund_button } from "../components/Tournament_refund";
import { cachedTournaments } from "../main";
import { TournamentView } from "../pages/Tournament";
import { TournamentsDisplay, TournamentTab } from "../pages/Tournaments";
import { get_tournament_status, tournament_id_to_index } from "../tools/tournament_tools";
import { Web3Auth } from "../web3/auth";
import { get_tournament_batch, getTournament, watchTournamentCreation, watchTournamentStatus } from "../web3/getters";
import { shortenEthAddress } from "../web3/tools";
import { matchRoute } from "./router";
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
	// 'sign in'
	await web3auth.isLoggedIn() ? 'connected': 'not connected'
);
export const web3_login_sub = () => {
	login_state.subscribe(() => {
		const	auth = document.getElementById('auth');
		const	disconnect_container = document.getElementById('disconnect_container');
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
			
		} else {
			const	navbar_connect_wallet = new Navbar_connect_wallet();
			auth.innerHTML = '';
			navbar_connect_wallet.mount(auth);
			if (disconnect_container) {
				disconnect_container.innerHTML = '';
			}
		}
	})
}

// tournament tabs
export const	tournament_tab = new State('all');
export const	tournament_tab_sub = () => {
	tournament_tab.subscribe(async () => {
		if (!cachedTournaments.length) {
			await get_tournament_batch(10);
		}
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

// web3 account
export const	currentWeb3Account = new State(await web3auth.getEthAddress());
export const	currentWeb3AccountSub = () => {
	currentWeb3Account.subscribe(async () => {
		// display wallet address
		const	account_container = document.getElementById('current-web3-account');
		if (account_container) {
			account_container.textContent = shortenEthAddress(await web3auth.getEthAddress());
		}

		const	match = matchRoute(location.pathname);
		if (match) {
			const { view: View, params } = match;
			if (View === TournamentView) {
				const	index = tournament_id_to_index(BigInt(params.id));
				let tournament;
				if (index !== -1)
					tournament = cachedTournaments[index];
				else
					tournament = await getTournament(BigInt(params.id));
				// display current user state is a pending tournament
				const	tournament_recrute : HTMLElement = document.querySelector('#tournament-recrute') as HTMLElement;
				if (tournament_recrute) {
					tournament_recrute.innerHTML = '';
					fill_tournament_recrute(tournament, tournament_recrute);
				}

				// display current user state is a finished tournament
				const prize_button_container = document.querySelector('#claim-prize-container') as HTMLElement | null;
				if (prize_button_container) {
					prize_button_container.innerHTML = '';
					render_claim_prize_button(tournament, prize_button_container);
				}

				// display current user state is a expired tournament
				const	tournament_refund = document.querySelector('#tournament-refund') as HTMLElement | null;
				if (tournament_refund) {
					tournament_refund.innerHTML = '';
					render_claim_refund_button(tournament, tournament_refund);
				}
			}
		}
	})
}

// add tournaments
export const	addTouranamentState = new State(-1n); // TODO : case where tournament array is so big can't be retrieved in one fetch
export const	addTouranamentStateSub = () => {
	// use events instead of polling
	watchTournamentCreation();
	addTouranamentState.subscribe(async () => {
		if (addTouranamentState.get() === -1n)
			return;
		const	tournaments_container = document.getElementById('tournaments-container');
		if (tournaments_container) {
			// tournaments_container.innerHTML = '';
			const	tournament = await getTournament(addTouranamentState.get());
			cachedTournaments.unshift(tournament);
			if (
				tournament_tab.get() === 'all' ||
				tournament_tab.get() === get_tournament_status(tournament)
			) {
				const	card = new Tournament_card(tournament);
				card.render();
				tournaments_container.prepend(card.el);
			};
		}
	})
}

// update tournaments
export const	updateTournamentState = new State(-1n);
export const	updateTournamentStateSub = () => {
	watchTournamentStatus();
	updateTournamentState.subscribe(async () => {
		const	_id = updateTournamentState.get();
		if (_id == -1n)
			return;
		const	tournament = await getTournament(_id);
		cachedTournaments[tournament_id_to_index(_id)] = tournament;
		const	tournaments_container = document.getElementById('tournaments-container');
		if (tournaments_container) {
			tournaments_container.innerHTML = '';
			cachedTournaments.map(tournament => {
				if (
					tournament_tab.get() === 'all' ||
					tournament_tab.get() === get_tournament_status(tournament)
				) {
					const	card = new Tournament_card(tournament);
					card.mount(tournaments_container);
				};
			});
		}
		const	match = matchRoute(location.pathname);
		if (match) {
			const { view: View, params } = match;
			if (View === TournamentView && _id === BigInt(params.id)) {
				const	root = document.getElementById('bg');
				if (root) {
					root.innerHTML = '';
					new View(params).mount(root);
				}
			}
		}
	})
}