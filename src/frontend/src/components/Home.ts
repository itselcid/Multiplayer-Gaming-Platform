/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Home.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 19:43:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/07 04:44:23 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { userState } from "../core/appStore";

export class Home extends Component {
  constructor() {
    super("div", 'pl-5 pr-5 pt-3');
  }

  render() {
	this.el.innerHTML = `  
    <div class="flex flex-col items-center px-2 sm:px-4 lg:px-8">
	<div class= "flex flex-col lg:flex-row items-center w-full gap-8 mt-5">
	<div class="flex flex-col  text-center lg:text-left">
	<h1 class="text-3xl sm:text-4xl lg:text-5xl font-display text-ctex ">Gear up, space champion</h1>
	<h2 class="text-3xl sm:text-4xl lg:text-5xl  font-display text-ctex text-center pl-20 mt-5">It’s game time at Galactik Pingpong!</h2>
	</div>
	<img src="/avatar.png" alt="avatar" class="w-64 h-64 sm:w-96 sm:h-96 lg:w-120 lg:h-120 object-contain ">
		</div>
        <button id="Letsplay" class="self-center w-fit px-8 py-4 text-5xl font-display animate-bounce text-gray-300 hover:text-neon-cyan bg-clip-text 
		shadow-sm rounded-sm hover:animate-none hover:bg-clip-border transition">
        	Let's play
		</button>
		<p class="mt-12 max-w-7xl text-center text-ctex italic text-lg sm:text-xl lg:text-2xl">
			In the vast expanse of digital space, Galactik was born , a ping pong game where the speed of light meets the bounce of a ball. Crafted by a team of passionate creators, this universe was forged with code, creativity, and a whole lot of flair. Meet
		</p>
	</div>   
	`;
	const letplay = this.el.querySelector("#Letsplay") as HTMLElement ;
	letplay.onclick = () => this.selectmode();
  }
  
  selectmode(){
	const logged = userState.get();
	
	// if(!logged){
	// 	navigate("/login");
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
	  container.querySelector("#remote")?.addEventListener("click",()=> this.handleRemote());
	  container.querySelector("#bot")?.addEventListener("click",()=> navigate("/game?mode=bot"));
	  container.querySelector("#cancel")?.addEventListener("click",() => container.remove());
  }

  handleRemote(){
	
  }
}

