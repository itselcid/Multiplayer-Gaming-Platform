/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Shouting_stars.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kez-zoub <kez-zoub@student.1337.ma>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/10 12:46:35 by kez-zoub          #+#    #+#             */
/*   Updated: 2025/11/14 21:53:06 by kez-zoub         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { addElement, Component } from "../core/Component";

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  color: string; // <-- added
}

export function startShootingStars(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("2D context not supported");
    return;
  }

  let width = window.innerWidth;
  let height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const stars: ShootingStar[] = [];

  const colors = [
    (opacity: number) => `rgba(250, 250, 250, ${opacity})`, 
    (opacity: number) => `rgba(101, 249, 252, ${opacity})`,
    (opacity: number) => `rgba(224, 143, 248, ${opacity})`, 
  ];

  // Create a single shooting star
  function createStar(): ShootingStar {
    const colorIndex = Math.floor(Math.random() * colors.length); 
    return {
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      length: 75 + Math.random() * 100,
      speed: 5 + Math.random() * 10,
      angle: Math.PI / 4,
      opacity: 0.001,
      color: colorIndex.toString(), 
    };
  }
  // Add stars gradually
  setInterval(() => {
    if (stars.length < 10) stars.push(createStar());
  }, 250);

  function animate() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = stars.length - 1; i >= 0; i--) {
      const star = stars[i];
      if (star.opacity < 1) star.opacity += 0.006;

      const colorFn = colors[parseInt(star.color)];
      ctx.strokeStyle = colorFn(star.opacity);
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Calculate tail
      const endX = star.x - star.length * Math.cos(star.angle);
      const endY = star.y - star.length * Math.sin(star.angle);

      ctx.moveTo(star.x, star.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Move star
      star.x += star.speed * Math.cos(star.angle);
      star.y += star.speed * Math.sin(star.angle);

      // Remove if offscreen
      if (star.x > width || star.y > height) {
        stars.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
}

export class Shouting_stars extends Component {
	constructor() {
		super('div', 'fixed inset-0 z-0');
	}

	render(): void {
		addElement('div', 'absolute inset-0 ', this.el);

		// const animation1 = addElement('div', 'absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse', this.el);
		// animation1.style = 'animation-duration: 4s;'
		// const	animation2 = addElement('div', 'absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse', this.el);
		// animation2.style = 'animation-duration: 6s; animation-delay: 1s;'
		// const	animation3 = addElement('div', 'absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse', this.el);
		// animation3.style = 'animation-duration: 8s; animation-delay: 2s;'


		const	stars = addElement('div', 'absolute inset-0 overflow-hidden', this.el);
		[...Array(15)].map((_, i) => {
			const colors = ['white', 'cyan-400', 'purple-400'];
			const color = colors[i % colors.length];
			const startY = Math.random() * 50; // Top half of screen
			const startX = Math.random() * 100;
			const duration = 0.5 + Math.random() * 1.5; // random duration between 0.5s and 2s
			const delay = Math.random() * 2; // random delay between 0s and 2s


			addElement('div', `absolute bg-gradient-to-t from-${color} from-10% to-transparent to-70% rounded-full`, stars).style = `
			linear-gradient(90deg, white, transparent);
			width: 2px;
			height: 200px;
			top: ${startY}%;
			left: ${startX}%;
			transform: rotate(-45deg);
			boxShadow: 0 0 10px currentcolor;
			animation: shootingStar ${duration}s linear infinite;
			animation-delay: ${delay}s;
			opacity: 0;
			`;
		});

		addElement('style', '', this.el).textContent = `
		@keyframes shootingStar {
  0% {
    transform: rotate(-45deg) translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.2;
  }
  90% {
    opacity: 0.2;
  }
  100% {
    transform: rotate(-45deg) translateY(100vh) translateX(0);
    opacity: 0;
  }
}
`;
	}
}

