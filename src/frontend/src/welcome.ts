import './style.css';

export function Welcome() {
  return `
<div class="relative w-full h-screen overflow-auto">
  <div class="absolute inset-0 bg-gradient-to-t from-indigo-950 to-[#0D1324] -z-10"></div>

  <div class="pl-5 pr-5 pt-3">
    <div class="relative h-30">
      <img src="/logo.png" alt="Logo" class="absolute top-0 left-0 object-none object-left-top" />
      <button class="absolute top-4 right-4 text-ctex px-6 py-3 shadow-xl/30 rounded-xl hover:bg-ctex/75 transition">Sign In
        </button>
    </div> 

    <div class="relative h-25">
      <img src="/avatar.png" alt="avatar" class="object-contain  w-120 h-120 absolute right-15 object-right-top " />
      <h1 class="text-5xl font-display text-ctex pl-10 p-5">Gear up, space champion</h1>
      <h2 class="text-5xl font-display text-ctex pl-60 p-5">It’s game time at Galactik Pingpong!</h2>
        <button
            class="absolute top-65 left-195 text-5xl font-display px-6 py-3 animate-bounce bg-gradient-to-r from-ctex to-indigo-500 bg-clip-text text-transparent rounded-xl hover:animate-none  hover:text-[#0D1324]/75 hover:bg-clip-border transition">
        Let's play</button>
      <p class=" pt-65 pl-30 pr-30 text-center text-ctex font-italic text-2xl ">In the vast expanse of digital space, Galactik was born , a ping pong game where the speed of light meets the bounce of a ball. Crafted by a team of passionate creators, this universe was forged with code, creativity, and a whole lot of flair. Meet </p>
    </div>   
  </div>
</div>

  `;
}
