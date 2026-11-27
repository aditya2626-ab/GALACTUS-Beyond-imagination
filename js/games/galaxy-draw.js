import { mulberry32 } from './game-data.js';

export function drawGalaxy(ctx, type, seed) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const rnd = mulberry32(seed);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 130; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.1 + rnd() * 0.5})`;
    ctx.fillRect(rnd() * W, rnd() * H, 1.2, 1.2);
  }

  const tilt = type === 'spiral' ? 0.35 + rnd() * 0.3 : 0;
  const rot = rnd() * Math.PI * 2;
  const plot = (x, y, size, color) => {
    const rx = x * Math.cos(rot) - y * Math.sin(rot);
    const ry = (x * Math.sin(rot) + y * Math.cos(rot)) * (1 - tilt * 0.75);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + rx, cy + ry, size, 0, Math.PI * 2);
    ctx.fill();
  };

  if (type === 'spiral') {
    const arms = 2 + Math.floor(rnd() * 3);
    const twist = 3 + rnd() * 3;
    const spread = 0.35;
    const core = ctx.createRadialGradient(cx, cy, 2, cx, cy, 40);
    core.addColorStop(0, 'rgba(255,236,190,.95)');
    core.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = core;
    ctx.fillRect(cx - 45, cy - 45, 90, 90);
    for (let i = 0; i < 2600; i++) {
      const base = (Math.floor(rnd() * arms) / arms) * Math.PI * 2;
      const t = Math.pow(rnd(), 0.65);
      const r = 12 + t * 105;
      const angle = base + t * twist + (rnd() - 0.5) * spread;
      const alpha = 0.15 + rnd() * 0.5;
      plot(Math.cos(angle) * r, Math.sin(angle) * r * 0.55, 0.5 + rnd() * 1.3,
        rnd() > 0.35 ? `rgba(190,215,255,${alpha})` : `rgba(255,240,220,${alpha})`);
      if (rnd() > 0.985) plot(Math.cos(angle) * r, Math.sin(angle) * r * 0.55, 2.4, 'rgba(230,240,255,.95)');
    }
  } else if (type === 'elliptical') {
    const rad = 60 + rnd() * 35;
    const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, rad * 1.3);
    halo.addColorStop(0, 'rgba(255,232,200,.9)');
    halo.addColorStop(0.55, 'rgba(255,215,175,.35)');
    halo.addColorStop(1, 'rgba(255,215,175,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1700; i++) {
      const r = rad * Math.pow(rnd(), 1.9);
      const a = rnd() * Math.PI * 2;
      plot(Math.cos(a) * r, Math.sin(a) * r * 0.62, 0.5 + rnd() * 1.1, `rgba(255,228,190,${0.2 + rnd() * 0.55})`);
      if (rnd() > 0.99) plot(Math.cos(a) * r, Math.sin(a) * r * 0.62, 2.2, 'rgba(255,244,225,.9)');
    }
  } else {
    const clumps = 5 + Math.floor(rnd() * 4);
    for (let c = 0; c < clumps; c++) {
      const ccx = cx + (rnd() - 0.5) * 150;
      const ccy = cy + (rnd() - 0.5) * 130;
      const spread = 18 + rnd() * 30;
      const n = 150 + Math.floor(rnd() * 160);
      for (let i = 0; i < n; i++) {
        const alpha = 0.15 + rnd() * 0.5;
        ctx.fillStyle = rnd() > 0.4 ? `rgba(180,220,255,${alpha})` : `rgba(255,235,210,${alpha})`;
        ctx.beginPath();
        ctx.arc(ccx + (rnd() - 0.5) * spread * 2, ccy + (rnd() - 0.5) * spread * 1.4, 0.5 + rnd() * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (rnd() > 0.4) {
        ctx.fillStyle = 'rgba(255,150,190,.65)';
        ctx.beginPath();
        ctx.arc(ccx + (rnd() - 0.5) * 30, ccy + (rnd() - 0.5) * 30, 4 + rnd() * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const vg = ctx.createRadialGradient(cx, cy, H / 3, cx, cy, H / 1.2);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

