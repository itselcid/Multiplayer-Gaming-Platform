/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Home.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 19:43:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/17 13:32:01 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { userState } from "../core/appStore";
import { Game } from "../pages/Game";

interface Friend {
  id: number;
  username: string;
  avatar: string;
}

export class Home extends Component {
	private friends: Friend[] = [];
	
  constructor() {
    super("div", 'pl-5 pr-5 pt-3');
  }

  private async getfriends() : Promise<Friend[]>{
	const response = await this.fetchApi();
    const data = await response.json();
    return data.friends;
	
  }
  private async fetchApi(options: RequestInit = {}){
	 const headers: Record<string, string> = {};
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
	const user = userState.get();
    const response = await fetch(`/api/friends?id=${user?.id}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || 'Something went wrong');
    }

    return response;
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
	
	if(!logged){
		navigate("/login");
		return;
	}
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
	  container.querySelector("#remote")?.addEventListener("click",()=> {this.handleRemote()});
	  container.querySelector("#bot")?.addEventListener("click",()=> navigate("/game?mode=bot"));
	  container.querySelector("#cancel")?.addEventListener("click",() => container.remove());
  }

  async handleRemote(){
	this.friends = await this.getfriends();
	const container1 = document.createElement("div");
	container1.className =`fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50`;
	if(!this.friends.length){
		container1.innerHTML=`<div class="backdrop-blur-xl rounded-xl shadow-xl flex flex-col gap-4 p-6">
		<h2 class="text-3xl text-center text-ctex mb-4">No playmates around</h2>
		<button id="make" class="btn px-6 py-3 rounded-sm text-white/75 hover:bg-neon-cyan/75  transition">👥 Start Friendships</button>
      	<button id="cancel" class="btn px-6  py-3 rounded-sm text-white/75 hover:bg-neon-cyan/75  transition mt-2">Cancel</button>
		</div>`;
		
	}
	else{
		container1.innerHTML = `<div class="backdrop-blur-xl rounded-xl shadow-xl flex flex-col gap-4 p-6">
		<h2 class="text-3xl text-center text-ctex mb-4">Select a playmate</h2>
		<div id="friendsList" class="flex flex-col gap-2"></div>
		<button id="cancel" class="btn px-6 py-3 rounded-sm text-white/75 hover:bg-neon-cyan/75 transition mt-4">Cancel</button>
    	</div>`;
		const list = container1.querySelector("#friendsList");

  		this.friends.forEach(friend => {
    		const btn = document.createElement("button");
    		btn.className =
    		  "btn flex items-center gap-3 px-4 py-2 rounded-sm text-white/80 hover:bg-neon-cyan/75 transition text-left";
    		const avatar = document.createElement("img");
    		avatar.src = friend.avatar || '👤'; 
    		avatar.alt = friend.username;
    		avatar.className = "w-8 h-8 rounded-full object-cover"; 
   		 	btn.innerHTML = `${this.renderAvatar(friend.avatar)}<span>${friend.username}</span>`;
    		btn.addEventListener("click", async () => {
				const room = new Game("remote","");
				const url = await room.createroom(friend);
				navigate(url)});
			list?.appendChild(btn);});
		}
		
		this.el.append(container1);
		container1.querySelector("#make")?.addEventListener("click",()=>navigate("/friends"));
		container1.querySelector("#cancel")?.addEventListener("click",() => container1.remove());
	}
	renderAvatar(avatar: string | undefined, size: string = 'w-8 h-8') {
		if (avatar && avatar.startsWith('/public')) {
    	avatar = avatar.replace('/public', '');
	}
    if (avatar && (avatar.startsWith('/') || avatar.startsWith('http'))) {
      return `<img src="${avatar}" alt="avatar" class="${size} rounded-full object-cover" />`;
    }
    return `<span class="text-sm">${avatar || '👤'}</span>`;
  }
}
