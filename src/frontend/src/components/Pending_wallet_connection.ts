// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Pending_wallet_connection.ts                       :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/11/08 14:40:19 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/09 01:31:44 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

export class Pending_wallet_connection extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-10 bg-black/40 backdrop-blur-sm overflow-y-auto overscroll-y-auto no-scrollbar flex justify-center items-start');
	}

	render(): void {
	    this.el.innerHTML = `

        <div class="max-w-lg w-full relative z-10 my-8" style="animation: fadeIn 0.5s ease-out;">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
            
            <div class="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-12 border border-cyan-500/20 shadow-2xl">
              
              <div class="relative w-44 h-44 mx-auto mb-10">
                <div class="absolute inset-0 rounded-full border border-cyan-500/20"></div>
                <div class="absolute inset-4 rounded-full border border-purple-500/20"></div>
                
                <div class="absolute inset-0">
                  <div class="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" style="animation: orbit 3s linear infinite;"></div>
                </div>
                <div class="absolute inset-0">
                  <div class="absolute top-1/2 left-1/2 w-2.5 h-2.5 -ml-1.25 -mt-1.25 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" style="animation: orbit 4s linear infinite reverse; animationDelay: -1s;"></div>
                </div>
                
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 border border-cyan-500/30 backdrop-blur-sm">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link w-14 h-14 text-cyan-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </div>
                </div>
              </div>

              <div class="text-center space-y-4 mb-8">
                <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  Connecting Your Wallet
                </h2>
                <p class="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
                  Please approve the connection request in your MetaMask extension to continue
                </p>
              </div>

              <div class="flex justify-center space-x-2 mb-8">
                <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
                <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
              </div>

              <div class="bg-slate-800/50 rounded-xl p-5 border border-cyan-500/20">
                <div class="flex items-center justify-center space-x-3 text-cyan-300">
                  <div class="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <span class="text-sm font-medium">Awaiting your signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      
		`
	}
}
