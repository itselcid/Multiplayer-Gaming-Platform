import './style.css';

export function Welcome() {
  return `
  <div class="pl-5 pr-5">
  <div class="relative h-24">
    <img src="/logo.png" alt="Logo" class="absolute top-0 left-0 object-none object-left-top w-16" />
    <button class="absolute top-4 right-4 text-[#A1B7E6] px-6 py-3 rounded-xl hover:bg-[#A1B7E6]/75 transition">
      Sign In
    </button>
  </div> 
  <h1 class="text-5xl font-display text-[#A1B7E6] pl-25">
    Gear up, space champion
  </h1>
  <h2 class="text-5xl font-display text-[#A1B7E6] text-center pl-40">
    It’s game time at Galactik Pingpong!
  </h2>
  <div class="relative h-20">
  <button class="absolute top-30 left-150 text-[#A1B7E6] text-5xl animate-bounce font-display px-6 py-3 rounded-xl hover:bg-[#A1B7E6]/75 transition">
    Let's play
    </button>
  <img src="/avatar.png" alt="avatar" class="object-contain w-120 h-120 absolute right-0 object-right-top " />
  </div>
`;
}
