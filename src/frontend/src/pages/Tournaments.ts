/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournaments.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/14 21:57:12 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/18 04:25:01 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Tournament_card } from "../components/Tournament_card";
import { tournament_tab } from "../core/appStore";
import { addElement, Component } from "../core/Component";
import { getTournaments, type Tournament } from "../web3/getters";

export class TournamentTab extends Component {
	constructor() {
		super('div', 'mb-12 flex gap-4');
	}

	render(): void {
		const	all_tournaments = addElement('button', 'px-8 py-4 rounded-xl font-bold text-sm tracking-wider border-2 transition-all duration-300 hover:scale-105 text-gray-400 border-transparent', this.el);
		all_tournaments.textContent = 'ALL TOURNAMENTS';
		all_tournaments.onclick = () => {
			tournament_tab.set('all');
		};

		const	pend = addElement('button', 'px-8 py-4 glass-effect rounded-xl font-bold text-sm tracking-wider text-gray-400 border-2 border-transparent hover:border-cyan-400/30 transition-all duration-300 hover:scale-105', this.el);
		pend.textContent = 'PENDING';
		pend.onclick = () => {
			tournament_tab.set('pending');
		};
		
		const	ongoing = addElement('button', 'px-8 py-4 glass-effect rounded-xl font-bold text-sm tracking-wider text-gray-400 border-2 border-transparent hover:border-cyan-400/30 transition-all duration-300 hover:scale-105', this.el);
		ongoing.textContent = 'ONGOING';
		ongoing.onclick = () => {
			tournament_tab.set('ongoing');
		};

		const	finished = addElement('button', 'px-8 py-4 glass-effect rounded-xl font-bold text-sm tracking-wider text-gray-400 border-2 border-transparent hover:border-cyan-400/30 transition-all duration-300 hover:scale-105', this.el);
		finished.textContent = 'FINISHED';
		finished.onclick = () => {
			tournament_tab.set('finished');
		};

		const	active_classes = 'filter-tab px-8 py-4 glass-effect rounded-xl font-bold text-sm tracking-wider border-2 hover:border-cyan-400/30 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-cyan-400 text-cyan-400 neon-border';
		switch (tournament_tab.get()) {
			case 'all':
				all_tournaments.className = active_classes;
				break;
			case 'pending':
				pend.className = active_classes;
				break;
			case 'ongoing':
				ongoing.className = active_classes;
				break;
			case 'finished':
				finished.className = active_classes;
		}
	}
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class TournamentsDisplay extends Component {
	private tournaments: Tournament[] = [];

	constructor() {
		super('div', 'min-h-[400px] transition-all duration-300');
	}

	async render(): Promise<void> {
	const	container = addElement('div', 'transition-opacity duration-200 opacity-0', this.el);
	const	container2 = addElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-12', container);
	try {
		await sleep(1000);
		this.tournaments = await getTournaments();
	} catch {
		console.error('error during fetching tournaments');
	} finally {
		container.className = 'transition-opacity duration-200 opacity-100';
		this.tournaments = [];
		this.tournaments.map(tournament => {
			if (
				tournament_tab.get() === 'all' ||
				tournament_tab.get() === 'pending' && tournament.status === 0 ||
				tournament_tab.get() === 'ongoing' && tournament.status === 1 ||
				tournament_tab.get() === 'finished' && tournament.status === 2
			) {
				const	card = new Tournament_card(tournament);
				card.mount(container2);
			};
		});
	}
	// console.log(typeof(tournaments));
	}
}

export class Tournaments extends Component {
	constructor() {
		super('div', 'max-w-7xl mx-auto px-6 py-12 w-full');
	};

	render(): void {
	// const tournaments = [{
    // id: '1',
    // name: 'Galactic Championship',
    // entryFee: '0.5 AVAX',
    // startTime: '2024-01-15 18:00 UTC',
    // participants: 64,
    // prizePool: '32 AVAX'
	// }, {
    // id: '2',
    // name: 'Nebula Cup',
    // entryFee: 'Free',
    // startTime: '2024-01-16 14:00 UTC',
    // participants: 128,
    // prizePool: 'Glory'
	// }, {
    // id: '3',
    // name: 'Cosmic Masters',
    // entryFee: '1.0 AVAX',
    // startTime: '2024-01-17 20:00 UTC',
    // participants: 32,
    // prizePool: '50 AVAX'
	// }, {
    // id: '4',
    // name: 'Starlight League',
    // entryFee: '0.25 AVAX',
    // startTime: '2024-01-18 16:00 UTC',
    // participants: 256,
    // prizePool: '100 AVAX'
	// }];

	const	title = addElement('div', 'mb-12', this.el);
	title.insertAdjacentHTML('beforeend', `
			<h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent pb-2">
			Tournament Lobby
			</h1>
			<p class="text-xl text-gray-300">
			Choose your arena and compete for blockchain glory
			</p>
		`);

	const	tournamentsTabContainer = addElement('div', '', this.el);
	tournamentsTabContainer.id = 'tournamentsTabs';
	const	tournamentsTab = new TournamentTab();
	tournamentsTab.mount(tournamentsTabContainer);

	const	tournamentsDisplayContainer = addElement('div', '', this.el);
	tournamentsDisplayContainer.id = 'tournaments-list';
	const	tournamentsDisplay = new TournamentsDisplay();
	tournamentsDisplay.mount(tournamentsDisplayContainer);
	
	const	live_feed = addElement('div', 'bg-gradient-to-r from-space-blue to-space-dark border border-neon-cyan/30 rounded-xl p-8', this.el);
	live_feed.insertAdjacentHTML('beforeend', `
		<h2 class="text-2xl font-bold mb-6 text-neon-cyan">
		  Live Tournament Feed
		</h2>
		<div class="space-y-4">
		  <div class="flex items-center justify-between p-4 bg-space-dark/50 rounded-lg border border-neon-purple/20">
			<div class="flex items-center space-x-3">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-5 h-5 text-neon-cyan" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
			  <span class="text-gray-300">
				Player
				<span class="text-neon-gold font-bold">CosmicAce</span> won
				Galactic Championship
			  </span>
			</div>
			<span class="text-sm text-gray-500">2 min ago</span>
		  </div>
		  <div class="flex items-center justify-between p-4 bg-space-dark/50 rounded-lg border border-neon-purple/20">
			<div class="flex items-center space-x-3">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-5 h-5 text-neon-cyan" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
			  <span class="text-gray-300">
				Score verified on chain:
				<span class="text-neon-cyan font-mono">0xf8a3...b2e1</span>
			  </span>
			</div>
			<span class="text-sm text-gray-500">5 min ago</span>
		  </div>
		  <div class="flex items-center justify-between p-4 bg-space-dark/50 rounded-lg border border-neon-purple/20">
			<div class="flex items-center space-x-3">
			  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-5 h-5 text-neon-cyan" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
			  <span class="text-gray-300">
				New tournament
				<span class="text-neon-purple font-bold">
				  Quantum Arena
				</span>
				starting soon
			  </span>
			</div>
			<span class="text-sm text-gray-500">8 min ago</span>
		  </div>
		`);
	}
	
}