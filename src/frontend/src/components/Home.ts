// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   Home.ts                                            :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2025/10/13 19:43:15 by kez-zoub          #+#    #+#             //
//   Updated: 2025/11/10 20:45:21 by kez-zoub         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { Component } from "../core/Component";

export class Home extends Component {
  constructor() {
    super("div", 'pl-5 pr-5 pt-3');
  }

  render() {
	this.el.innerHTML = `  
    <div class="relative h-25">
		<img src="/avatar.png" alt="avatar" class="object-contain  w-120 h-120 absolute right-15 object-right-top ">
    	<h1 class="text-5xl font-display text-ctex pl-10 p-5">Gear up, space champion</h1>
    	<h2 class="text-5xl font-display text-ctex pl-60 p-5">It’s game time at Galactik Pingpong!</h2>
        <button class="absolute top-65 left-195 text-5xl font-display px-6 py-3 animate-bounce text-gray-300 hover:text-neon-cyan bg-clip-text rounded-xl hover:animate-none hover:bg-clip-border transition">
        	Let's play
		</button>
		<p class=" pt-65 pl-30 pr-30 text-center text-ctex font-italic text-2xl ">
			In the vast expanse of digital space, Galactik was born , a ping pong game where the speed of light meets the bounce of a ball. Crafted by a team of passionate creators, this universe was forged with code, creativity, and a whole lot of flair. Meet
		</p>
	</div>   
	`;
  }
}

