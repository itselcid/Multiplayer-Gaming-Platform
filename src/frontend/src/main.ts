/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/12 15:53:05 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/16 20:48:53 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import './style.css'
import { renderRoute } from "./core/router.ts"
import { addElement } from './core/Component.ts';
import { Navbar } from './components/Navbar.ts';
import { subs } from './core/state.ts';
import { Shouting_stars, startShootingStars } from './pages/Shouting_stars.ts';
import { TestBG } from './pages/TestBG.ts';
import { Metamask_warning } from './components/Metamask_warning.ts';

//  TODO: get user address from database for auth
export const user_address = '0x26a2bf197820c79150dde3db793c23bf71a973cf';

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
// const page = new Metamask_warning();
// page.mount(document.getElementById('app'));

subs();

// const	canva = document.getElementById('starfield') as HTMLCanvasElement;
// if (canva)
// 	startShootingStars(canva);
