// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   appStore.ts                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/03 15:31:14 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/10 20:34:01 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Disconnect_wallet } from "../components/Disconnect_wallet";
import { Navbar_connect_wallet } from "../components/Navbar_connect_wallet";
import { Navbar_connected_wallet } from "../components/Navbar_connected_wallet";
import { Sign_in } from "../components/sign_in";
import { Web3Auth } from "../web3/auth";
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
			console.log('web3 is not connected');
			const	navbar_connect_wallet = new Navbar_connect_wallet();
			auth.innerHTML = '';
			navbar_connect_wallet.mount(auth);
			if (disconnect_container) {
				disconnect_container.innerHTML = '';
			}
		}
	})
}

