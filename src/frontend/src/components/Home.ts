/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Home.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ckhater <ckhater@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 19:43:15 by kez-zoub          #+#    #+#             */
/*   Updated: 2026/01/31 01:35:01 by ckhater          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from "../core/Component";
import { navigate } from "../core/router";
import { userState } from "../core/appStore";
import { Game } from "../pages/Game";
import { AuthService } from "../services/auth";

interface Friend {
  id: number;
  username: string;
  avatar: string;
}

export class Home extends Component {
	private friends: Friend[] = [];
	private online: Friend[] = [];
	
  constructor() {
    super("div", 'pl-5 pr-5 pt-3');
  }

  private async getfriends() : Promise<Friend[]>{
	const user = userState.get();
	const response = await this.fetchApi(`api/friends?id=${user?.id}`);
    const data = await response.json();
    return data.friends;
	
  }
  
  private async getonline() : Promise<Friend[]>{
	const response = await this.fetchApi("api/friends/online");
    const data = await response.json();
    return data.friends;
  }
  
  private async fetchApi(api:string,options: RequestInit = {}){
	 const headers: Record<string, string> = {};
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
    let response = await fetch(`${api}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

	if (response.status === 401 || response.status === 405) {
		AuthService.getCurrentUser();
	}
	
	response = await fetch(`${api}`, {
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
        <button id="Letsplay" class="self-center w-fit px-8 py-4 text-5xl font-display animate-bounce hover:text-neon-cyan bg-clip-text 
		shadow-sm rounded-sm hover:animate-none text-ctex hover:bg-clip-border transition">
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
	container.className =`fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50`;
	container.innerHTML=`<div class="backdrop-blur-xl rounded-xl shadow-xl items-center flex flex-col gap-4 p-6" 
	style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(30, 11, 61, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
	 <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>
	<h2 class="text-3xl text-center text-ctex mb-4">Choose your game mode</h2>
      <button id="local" class="btn px-10 py-3  w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition">🎮 Local Game</button>
      <button id="remote" class="btn px-10 py-3 w-fit shadow-sm rounded-sm text-ctex border border-transparent  hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition">🌐 Play with Friend</button>
      <button id="bot" class="btn px-10 py-3 w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)]  transition">🤖 Play vs Bot</button>
      <button id="cancel" class="btn px-10 py-3 w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)]  transition mt-2">Cancel</button>
	  </div>`
	  this.el.append(container);
	  container.querySelector("#local")?.addEventListener("click",()=> navigate("/game?mode=local"));
	  container.querySelector("#remote")?.addEventListener("click",()=> this.handleRemote());
	  container.querySelector("#bot")?.addEventListener("click",()=> navigate("/game?mode=bot"));
	  container.querySelector("#cancel")?.addEventListener("click",() => container.remove());
  }

  async handleRemote(){
	this.friends = await this.getfriends();
	this.online = await this.getonline();
	const container = document.createElement("div");
	container.className =`fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50`;
	if(!this.friends.length){
		container.innerHTML=`<div class="backdrop-blur-xl items-center rounded-xl shadow-xl flex flex-col gap-4 p-6" 
		style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(30, 11, 61, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
		<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>
		<h2 class="text-3xl text-center text-ctex mb-4">No playmates around</h2>
		<button id="make" class="btnpx-10 py-3  w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition">👥 Start Friendships</button>
      	<button id="cancel" class="btn px-10 py-3  w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition">Cancel</button>
		</div>`;
		
	}
	else if (!this.online.length){
		container.innerHTML = `<div class="backdrop-blur-xl rounded-xl items-center shadow-xl flex flex-col gap-4 p-6"
		style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(30, 11, 61, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
		<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>
		<h2 class="text-3xl text-center text-ctex mb-4">No online playmates around</h2>
		<button id="cancel" class="btn px-10 py-3  w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition">Cancel</button>
		</div>`;
	}
	else{
		container.innerHTML = `<div class="backdrop-blur-xl rounded-xl items-center shadow-xl flex flex-col gap-4 p-6"
		style="background: linear-gradient(135deg, rgba(10, 22, 40, 0.85) 0%, rgba(30, 11, 61, 0.85) 100%); border: 2px solid #00d9ff; box-shadow: 0 0 30px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(0, 217, 255, 0.05);">
		<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 217, 255, 0.1) 35px, rgba(0, 217, 255, 0.1) 70px);"></div>
		<h2 class="text-3xl text-center text-ctex mb-4">Select a playmate</h2>
		<div id="friendsList" class="flex flex-col gap-2"></div>
		<button id="cancel" class="btn px-10 py-3  w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition">Cancel</button>
    	</div>`;
		
		const list = container.querySelector("#friendsList");

  		this.online.forEach(friend => {
    		const btn = document.createElement("button");
    		btn.className =
    		  "btn overflow-y-auto flex text-center px-10 py-3 w-fit shadow-sm rounded-sm text-ctex border border-transparent hover:border-neon-cyan hover:shadow-[0_4px_15px_rgba(34,211,238,0.5)] transition";
    		const avatar = document.createElement("img");
    		avatar.src = friend.avatar || '👤'; 
    		avatar.alt = friend.username;
    		avatar.className = "w-8 h-8 rounded-full object-cover"; 
			
   		 	btn.innerHTML = `${this.renderAvatar(friend.avatar)}<span>${friend.username}</span>`;
    		btn.addEventListener("click", async () => {
				const room = new Game("remote","");
				const url = await room.createroom(friend);
				const fullUrl = new URL(String(url), window.location.origin).href;
				await	this.sendInvite(friend.id, fullUrl);
				navigate(url)});
			list?.appendChild(btn);});
		}
		
		this.el.append(container);
		container.querySelector("#make")?.addEventListener("click",()=>navigate("/friends"));
		container.querySelector("#cancel")?.addEventListener("click",() => container.remove());
	}

	async sendInvite(friendId: number, url: string) {
		try {
			const user = userState.get();
			if (!user) {throw new Error("User not logged in");}
			console.log("Sending game invite to user ID:", friendId);
		      const response = await fetch(`api/chat/messages`, {
      		  method: 'POST',
      		  headers: {
      		    'Content-Type': 'application/json',
      		    'x-user-id': user.id.toString()
      		  },
      		  body: JSON.stringify({
      		    receiverId: friendId,
      		    content: `🎮 Game Invite\nJoin me in Galactik Pingpong! Click here to play: ${url}\n🚨after 10min of now this link will no longer be available`
      		  }),
      		  credentials: 'include'
      		});	
		}
		catch (error) {
			console.error("Error sending game invite:", error);
			 alert('Network error. Please check your connection and try again.');
		}
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
