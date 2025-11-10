// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   ProfileOld.ts                                      :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/14 00:11:17 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/05 17:44:43 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

export class ProfileOld extends Component {
  private params: { name: string; job: string };

  constructor(params: { name: string; job: string }) {
    super("div");
    this.params = params;
  }

  render() {
    this.el.innerHTML = `
	  <div class="min-h-screen bg-slate-950 pt-24 px-6">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold text-sky-400 mb-6">Team Profiles</h2>
    <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-700/50">
        <img src="https://placehold.co/100x100/1e293b/94a3b8?text=JD" class="mx-auto rounded-full mb-4">
        <h3 class="text-lg font-semibold text-sky-400">${this.params.name? this.params.name: 'default name'}</h3>
        <p class="text-slate-300 text-sm mb-3">${this.params.job? this.params.job: 'good for nothing'}</p>
        <a href="/profiles/1" class="text-sm text-slate-200 hover:text-sky-400 transition-colors">View Profile →</a>
      </div>
    </div>
  </div>
</div>
    `;
  }
}

