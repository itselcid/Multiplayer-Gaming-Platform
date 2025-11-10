// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Navbar.ts                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/14 14:43:40 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/10 20:30:32 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { active_tab } from "../core/appStore";
import { addElement, Component } from "../core/Component";
import { navigate } from "../core/router";

const	link = (tag: string, classes: string, parent: HTMLElement, text: string, id: string, path: string): HTMLElement => {
	const	link = addElement(tag, classes, parent);
	link.textContent = text;
	link.id = id;
	link.onclick = (e) => {
		e.preventDefault();
		navigate(path)
		active_tab.set(
			{
				old: active_tab.get().new,
				new: id
			}
		)
	}
	return (link);
}

export class Navbar extends Component {
  constructor() {
    super("nav");
	this.el.className = "border-b border-neon-cyan/20 bg-space-blue/50 backdrop-blur-md";
  }

  render() {

	const	container = addElement('div', 'max-w-7xl mx-auto px-6 py-2');
	const	container2 = addElement('div', 'flex items-center justify-between', container);
	container2.insertAdjacentHTML('beforeend', `
		<div class="flex items-center space-x-2">
			<img src="/logo.png" alt="Logo" class="h-15">
			<span class="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
				GALACTIK PONG
			</span>
		</div>
	`);
	const	links_container = addElement('div', 'flex items-center space-x-8', container2);
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Home', 'home', '/');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Tournaments', 'tournaments', '/tournaments');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Leaderboard', 'leaderboard', '/leaderboard');
	link('a', 'transition-all text-gray-300 hover:text-neon-cyan', links_container, 'Profile', 'profile', '/profile');


	const	auth = addElement('div', '', container2);
	auth.id = 'auth';

	//if (isLogged)
	//	connected_wallet.mount(container2);
	//else
	//	connect_wallet.mount(container2);
	
	this.el.append(container);

  }
}

