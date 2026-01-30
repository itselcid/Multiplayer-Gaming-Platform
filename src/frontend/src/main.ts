/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/12 15:53:05 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/30 18:09:36 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import './style.css'
import { renderRoute } from "./core/router.ts"
import { addElement } from './core/Component.ts';
import { Navbar } from './components/Navbar.ts';
import { subs } from './core/state.ts';
import { Shouting_stars } from './pages/Shouting_stars.ts';
import { TestBG } from './pages/TestBG.ts';
import { initAuth } from './core/appStore.ts';
import { type Tournament } from './web3/getters.ts';

export let logged: boolean = true;
export	let cachedTournaments: Tournament[] = [];

const	container1 = addElement("div", "min-h-screen w-full bg-space-dark text-white");
const	shouting_stars = new Shouting_stars();
const	test = new TestBG();
const	container2 = addElement("div", "relative z-10 flex flex-col min-h-screen", container1);
test.mount(container1);
shouting_stars.mount(container1);
const	navBar = new Navbar();
navBar.mount(container2);

const	bg = addElement("main", "flex-1 flex flex-col", container2);
bg.id = "bg";
document.getElementById('app')?.append(container1);
// const page = new ConnectWallet();
// page.mount(document.getElementById('app'));

subs();
// renderRoute();


initAuth().then(() => {
  renderRoute();
});
