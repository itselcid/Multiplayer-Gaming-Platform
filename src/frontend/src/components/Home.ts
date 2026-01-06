/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Home.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 19:43:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/06 07:51:35 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";
import { navigate } from "../core/router";

export class Home extends Component {
  constructor() {
    super("div", 'pl-5 pr-5 pt-3');
  }

  render() {
	this.el.innerHTML = `  
    <div class="min-h-screen">
		<img src="/avatar.png" alt="avatar" class="object-contain  w-120 h-120 absolute right-15 object-right-top ">
    	<h1 class="text-5xl font-display text-ctex pl-10 p-5">Gear up, space champion</h1>
    	<h2 class="text-5xl font-display text-ctex pl-60 p-5">It’s game time at Galactik Pingpong!</h2>
        <button id="Letsplay" class="absolute top-65 left-195 text-5xl font-display px-6 py-3 animate-bounce text-gray-300 hover:text-neon-cyan bg-clip-text rounded-xl hover:animate-none hover:bg-clip-border transition">
        	Let's play
		</button>
		<p class=" pt-65 pl-30 pr-30 text-center text-ctex font-italic text-2xl ">
			In the vast expanse of digita2l space, Galactik was born , a ping pong game where the speed of light meets the bounce of a ball. Crafted by a team of passionate creators, this universe was forged with code, creativity, and a whole lot of flair. Meet
		</p>
	</div>   
	`;
	const letplay = this.el.querySelector("#Letsplay") as HTMLElement ;
	letplay.onclick = () => this.selectmode();
  }
  
  selectmode(){
	// if(logged()){
	// 	navigate(/login);
	// 	return;
	// }
	const container = document.createElement("div");
	container.className =`fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50`;
	container.innerHTML=`<div class="backdrop-blur-xl rounded-xl shadow-xl flex flex-col gap-4 p-6">
	<h2 class="text-3xl text-center text-ctex mb-4">Choose your game mode</h2>
      <button id="local" class="btn px-6 py-3 rounded-sm text-black hover:bg-neon-cyan  transition">🎮 Local Game</button>
      <button id="remote" class="btn px-6 py-3 rounded-sm text-black hover:bg-neon-cyan transition">🌐 Play with Friend</button>
      <button id="bot" class="btn px-6 py-3 rounded-sm text-black hover:bg-neon-cyan  transition">🤖 Play vs Bot</button>
      <button id="cancel" class="btn px-6  py-3 rounded-sm text-black hover:bg-neon-cyan  transition mt-2">Cancel</button>
	  </div>`
	  this.el.append(container);
	  container.querySelector("#local")?.addEventListener("click",()=> navigate("/game?mode=local"));
	  container.querySelector("#remote")?.addEventListener("click",()=> navigate("/game?mode=bot"));
	  container.querySelector("#bot")?.addEventListener("click",()=> navigate("/game?mode=bot"));
	  container.querySelector("#cancel")?.addEventListener("click",() => container.remove());
  }
}

