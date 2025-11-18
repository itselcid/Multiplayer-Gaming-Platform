/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Page404.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 22:32:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/15 03:11:28 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";

export class Page404 extends Component {
	constructor() {
		super('div');
		this.el.className = 'flex flex-col flex-1 items-center justify-center text-slate-100 text-center"';
	}
  render() {
	this.el.insertAdjacentHTML('beforeend',  `
		<h1 class="text-9xl font-bold text-sky-500/30 mb-4">404</h1>
		<p class="text-xl mb-6">Oops! The page you’re looking for doesn’t exist.</p>
		<a href="/" class="bg-sky-500/20 text-sky-400 px-6 py-3 rounded-xl border border-sky-500/40 hover:bg-sky-500/30 transition-all">
    		Go Home
  		</a>
	`);
	}
}

