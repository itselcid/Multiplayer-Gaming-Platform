/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament_refund.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 20:13:50 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/22 02:49:33 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { formatEther } from "viem";
import { Component } from "../core/Component";
import type { Tournament } from "../web3/getters";

export class Tournament_refund extends Component {
	private	_tournament: Tournament;
		
	constructor(tournament: Tournament) {
		super('div', 'lg:col-span-2 space-y-6');
		this._tournament = tournament;
	}

	render(): void {
		const	playersRegistred = 30;
		this.el.innerHTML  = `
      


            <div class="relative group">
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 to-slate-500/20 rounded-3xl blur-xl"></div>
              <div class="relative bg-gradient-to-br from-red-500/10 via-slate-500/10 to-slate-600/10 backdrop-blur-xl rounded-3xl border border-red-400/30 p-8">
                <div class="text-center">
                  <div class="inline-block p-4 bg-gradient-to-br from-red-500/20 to-slate-500/20 rounded-full border-4 border-red-400/30 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert w-16 h-16 text-red-400" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                  </div>
                  
                  <h3 class="text-4xl font-black text-slate-200 mb-4">
                    Tournament Cancelled
                  </h3>
                  
                  <p class="text-slate-400 text-lg mb-2">Not enough players registered in time</p>
                  <p class="text-slate-500 text-sm mb-8">Required: ${this._tournament.participants} players • Got: ${playersRegistred} players</p>

                  
                    <div class="mt-8">
                      <div class="mb-6 p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <p class="text-cyan-300 font-bold text-lg mb-2">Refund Available</p>
                        <p class="text-cyan-400/70 text-sm">Your entry fee of ${formatEther(this._tournament.entryFee)} TRIZcoin can be claimed back</p>
                      </div>

                      <button
                        class="w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform bg-slate-700/50 border-2 border-slate-600 text-slate-400 cursor-not-allowed"
                            >
                          <span class="flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-7 h-7" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                            REFUND CLAIMED
                          </span>
                      </button>

					  <button
                        class="w-full py-6 rounded-2xl font-black text-xl tracking-wide transition-all transform 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-2xl shadow-cyan-500/50 hover:scale-105 border-2 border-cyan-400"
                      >
                        
                          <span class="flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coins w-7 h-7" aria-hidden="true"><circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path></svg>
                            CLAIM REFUND - ${formatEther(this._tournament.entryFee)} TRIZcoin
                          </span>
                      </button>

                      
                        <div class="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <p class="text-green-400 text-center font-bold flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big w-5 h-5" aria-hidden="true"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                            Refund processed successfully
                          </p>
                        </div>
                     
                    </div>
                  
                </div>
              </div>
            </div>

            <div class="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-600/30 p-6">
              <h4 class="text-xl font-black text-slate-300 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert w-5 h-5 text-slate-400" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                What Happened?
              </h4>
              <p class="text-slate-400 leading-relaxed">
                This tournament failed to meet the minimum participant requirement of 8 players before the scheduled start time. 
                All registered players are eligible for a full refund of their entry fee. If you participated, please claim your refund above.
              </p>
            </div>
	`;
	}
}