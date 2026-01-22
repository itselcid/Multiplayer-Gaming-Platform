/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/12 15:53:05 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/17 14:12:18 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import './style.css'
import { renderRoute } from "./core/router.ts"
import { addElement } from './core/Component.ts';
import { Navbar } from './components/Navbar.ts';
import { subs } from './core/state.ts';
import { Shouting_stars } from './pages/Shouting_stars.ts';
import { TestBG } from './pages/TestBG.ts';
import { AuthService } from './services/auth';
import { initAuth, web3auth } from './core/appStore.ts';
(window as any).AuthService = AuthService;                    // delme !!!
import { userState } from './core/appStore';
(window as any).userState = userState;                           // delme !!!
import { type Tournament } from './web3/getters.ts';
//  TODO: get user address from database for auth
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
renderRoute();
// const page = new ConnectWallet();
// page.mount(document.getElementById('app'));

subs();

initAuth().then(() => {
  // Render the initial route after checking auth
  // console.error("wooooooooooooooooooooh");
  renderRoute();
});

// console.log(`the wallet== ${await web3auth.getEthAddress()}`);
// const	canva = document.getElementById('starfield') as HTMLCanvasElement;
// if (canva)
// 	startShootingStars(canva);
