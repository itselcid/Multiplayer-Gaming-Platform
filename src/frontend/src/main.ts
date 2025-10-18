import './style.css';
import { startShootingStars } from './shootstars';
import { Welcome } from './welcome';

window.addEventListener("load", () => {
  const canvas = document.getElementById("starfield") as HTMLCanvasElement;
  if (canvas) startShootingStars(canvas);
});

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = Welcome();