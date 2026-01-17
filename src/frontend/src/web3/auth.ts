/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/04 12:18:56 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/15 03:12:04 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Metamask_error } from "../components/Metamask_error";
import { Metamask_network_warning } from "../components/Metamask_warning";
import { Pending_wallet_connection } from "../components/Pending_wallet_connection";
import { Success_wallet_connection } from "../components/Success_wallet_connection";
import { currentWeb3Account, login_state, web3auth } from "../core/appStore";

export class Web3Auth {
	private _storageKey = 'wallet_address';

	private	polling(): void {
		setInterval(async () => {
			const	eth = window.ethereum;

			if (typeof(eth) === 'undefined' || !await web3auth.isLoggedIn())
				return ;

			const	accounts = await eth.request({
				method: 'eth_accounts'
			}) as string[];
			const	chainId = await eth.request({
				method: 'eth_chainId'
			}) as string;

			if (accounts[0] !== currentWeb3Account.get()) {
				currentWeb3Account.set(accounts[0]);
			}

			// keep displaying metamask warning in case of being on wrong network
			const VITE_FUJI_CHAIN_ID = import.meta.env.VITE_FUJI_CHAIN_ID;
			if (chainId !== VITE_FUJI_CHAIN_ID) {
				const	metamask_warning = document.getElementById('metamask-network-warning');
				const	metamask_error = document.getElementById('metamask-error');
				if (!metamask_warning && !metamask_error) {
					const	root = document.getElementById('app');
					if (root) {
						const	warning_page = new Metamask_network_warning(chainId);
						warning_page.mount(root);
					}
				}
			}

		}, 1000);
	}

	constructor() {
		// console.log("web3auth called");
		this.polling();
	}

	isWalletInstalled(): boolean {
		return (typeof window.ethereum !== 'undefined');
	};

	login = async() : Promise<string | null> => {
		const	pend = new Pending_wallet_connection();
		const	root = document.getElementById('app');
		if (root)
			pend.mount(root);
		else {
			console.error('root not found');
			return (null);
		}

		if (typeof window.ethereum === 'undefined') {
			const	metamask_error = new Metamask_error(
				"MetaMask Not Detected",
				"It looks like MetaMask isn’t installed on your browser. Please install MetaMask to connect your wallet and continue.",
				false
			);
			pend.unmount();
			metamask_error.mount(root);
			return (null);
		}

		try {
			await window.ethereum.request({
				method: 'wallet_requestPermissions',
				params: [{ eth_accounts: {} }]
			});

			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts'
			}) as string[];


			const address = accounts[0];
			localStorage.setItem(this._storageKey, address);

			login_state.set('connected');

			//this.setupAccountListener();
			// console.log('Logged in with account ', address);
			pend.unmount();
			const	succ = new Success_wallet_connection();
			succ.mount(root);
			return (address);
		} catch (err) {
			pend.unmount();
			const	error_page = new Metamask_error(
				'Connection Rejected',
				'You rejected the MetaMask connection request. To access game features, please approve the connection.',
				true
			);
			error_page.mount(root);
			return (null);
		}
	};

	logout(): void {
		localStorage.removeItem(this._storageKey);
		login_state.set('not connected');
		console.log('Logged out');
	};

	async isLoggedIn(): Promise<boolean> {
		const storedAddress = localStorage.getItem(this._storageKey);

		if (!storedAddress)
			return (false);

		if (typeof window.ethereum === 'undefined') {
			console.error('wallet is not installed');
			return (false);
		}

		try {
			const accounts = await window.ethereum.request<string[]>({
				method: 'eth_accounts'
			})
			if (!accounts)
				return (false);
			return (accounts.includes(storedAddress));
		} catch (err) {
			console.error('Error checkig login status: ', err);
			return (false);
		}
	}

	// get current connected address or empty string if metamask ins
	async getEthAddress(): Promise<string> {
	// Make sure MetaMask (or another wallet) is installed
		if (typeof window.ethereum === 'undefined') {
			return ('');
		}

		try {
			// Request the list of connected accounts
			const accounts = await window.ethereum.request({
			method: 'eth_accounts'
			}) as string[];

			// Return the first connected address (if any)
			return accounts?.[0] ?? "";
		} catch (err) {
			console.error('Error fetching Ethereum address:', err);
			return ('');
		}
	};

// async getMetaMaskProvider(): Promise<any | null> {
//   const eth = (window as any).ethereum;
//   if (!eth) return null;

//   // Multiple providers available?
//   if (eth.providers?.length) {
//     const metamask = eth.providers.find((p: any) => p.isMetaMask);
//     if (metamask) return metamask;
//   }

//   // If single provider but it's a proxy, try to unwrap it
//   if (eth.isMetaMask && eth._state?.accounts) {
//     console.warn("⚠️ Likely a proxied MetaMask — events may not work");
//     return eth;
//   }

//   return eth;
// }

// async events() {
//   const metamask = await this.getMetaMaskProvider();
//   if (!metamask) {
//     console.error("MetaMask not detected");
//     return;
//   }

//   console.log("Using provider:", metamask);

//   metamask.on("accountsChanged", (accounts: string[]) => {
//     console.log("🔥 Account changed:", accounts);
//   });

//   metamask.on("chainChanged", (chainId: string) => {
//     console.log("🔥 Chain changed:", chainId);
//   });

//   metamask.on("disconnect", (err: any) => {
//     console.log("🔥 Disconnected:", err);
//   });

//   await metamask.request({ method: "eth_requestAccounts" });
// }

	

}
