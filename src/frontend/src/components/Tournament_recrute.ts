/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_recrute.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 15:12:27 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/22 02:12:44 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { Component } from "../core/Component";
import type { Tournament } from "../web3/getters";
import { bigint_to_date } from "../tools/date";

export class Tournament_recrute extends Component {
	private	_tournament: Tournament;

	constructor(tournament: Tournament) {
		super('div', 'lg:col-span-2 space-y-6');
		this._tournament = tournament;
	}

	render(): void {
		const	currentPlayerNumber = 3;
		const progressPercentage = currentPlayerNumber / Number(this._tournament.participants) * 100;
		this.el.innerHTML = `
		<div class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-3xl blur-xl"></div>
              <div class="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl border border-cyan-400/50 p-8">
                <div class="flex items-center justify-between mb-8">
                  <div>
                    <h3 class="text-4xl font-black text-white mb-2">
                      Registration Status
                    </h3>
                    <p class="text-cyan-300/60 font-bold">Secure your place in the arena</p>
                  </div>
                  <div class="text-right">
                    <p class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      ${currentPlayerNumber}
                    </p>
                    <p class="text-cyan-300/60 text-sm font-bold">/ ${this._tournament.participants}</p>
                  </div>
                </div>

                <div class="mb-8">
                  <div class="flex justify-between mb-3">
                    <span class="text-cyan-300 text-sm font-bold">Players Registered</span>
                    <span class="text-cyan-300 text-sm font-bold">${Number(this._tournament.participants) - currentPlayerNumber} spots left</span>
                  </div>
                  <div class="h-4 bg-slate-800/50 rounded-full overflow-hidden border border-cyan-500/30">
                    <div 
                      class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style="width: ${progressPercentage}%"
                    >
                  </div>
                  </div>
                </div>

                <button
                  class="w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-500/50 text-green-400 cursor-not-allowed"
                >
                    <span class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-7 h-7" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                      REGISTERED SUCCESSFULLY
                    </span>
                </button>

				<button
                  class="w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-slate-700/50 border-2 border-slate-600 text-slate-400 cursor-not-allowed">
                    <span class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x w-7 h-7" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
                      TOURNAMENT FULL
                    </span>
                </button>
				<button
                  class="w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:scale-105 border-2 border-cyan-400"
                >
                  
                    <span class="flex items-center justify-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-7 h-7" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle></svg>
                      REGISTER NOW - ${formatEther(this._tournament.entryFee)} TRIZcoin
                    </span>
                </button>

                
                  <div class="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p class="text-green-400 text-center font-bold flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-5 h-5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                      Tournament starts ${bigint_to_date(this._tournament.startTime)}
                    </p>
                  </div>

              </div>
            </div>
			`;
	}
}