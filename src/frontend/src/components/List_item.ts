// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   List_item.ts                                       :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/14 15:03:47 by kez-zoub          #+#    #+#             //
//   Updated: 2025/10/14 16:03:52 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

export class List_item extends Component {
  constructor(
	  private id: number,
	  private title: string,
	  private description: string,
	  private price: string,
	  private image: string
  ) {
    super("div"); // ✅ valid HTML tag
  }

  render() {
    this.el.innerHTML = `<div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow border border-slate-700/40">
  <img src=${this.image} alt="Listing Image" class="rounded-xl mb-4">
  <h3 class="text-lg font-semibold text-sky-400 mb-2">${this.title}</h3>
  <p class="text-slate-300 text-sm mb-4">${this.description}</p>
  <div class="flex justify-between items-center">
    <span class="text-sky-400 font-medium">$${this.price}/mo</span>
    <a href="/listing/${this.id}" class="text-sm text-slate-200 hover:text-sky-400 transition-colors">View →</a>
  </div>
</div>`
;
  }
}

