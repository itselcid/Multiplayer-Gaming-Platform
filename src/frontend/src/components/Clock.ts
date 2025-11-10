// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Clock.ts                                           :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/14 15:05:23 by kez-zoub          #+#    #+#             //
//   Updated: 2025/10/18 00:58:15 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";
import { Navbar } from "../components/Navbar";
import { State } from "../core/state";

export class Clock extends Component {
	constructor() {
		super("div");
		this.el.className = "min-h-screen w-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100";
  }

  render() {
	const	time = new State(new Date());
	const pad = (num: number) => num.toString().padStart(2, "0");

	setInterval(() => {
		time.set(new Date())
	}, 1000);

	const navbar = new Navbar();
	navbar.mount(this.el);


	const	header = document.createElement("h2");
	header.className = "text-3xl font-bold text-sky-400 mb-8";
	header.textContent = "Real-Time Clock";
	this.el.append(header);

	const	time_outer_container = document.createElement("div");
	time_outer_container.className = "bg-slate-800/70 backdrop-blur-sm px-10 py-8 rounded-2xl shadow-2xl border border-slate-700/50";

	const	time_inner_container = document.createElement("div");
	time_inner_container.className = "text-7xl font-mono tracking-widest";
	time_inner_container.textContent = `${pad(time.get().getHours())}:${pad(time.get().getMinutes())}:${pad(time.get().getSeconds())}`;
	time_outer_container.append(time_inner_container);
	this.el.append(time_outer_container);

	time.subscribe(value =>{
		time_inner_container.textContent = `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
	})
  }
}


