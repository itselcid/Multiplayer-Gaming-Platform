import './style.css';

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
