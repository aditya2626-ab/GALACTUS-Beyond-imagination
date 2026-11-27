import { MESSIER_TARGETS, rngFrom } from './game-data.js';

const W = 640;
const H = 440;

export function drawObject(ctx, o) {
  const r = rngFrom(o.id + o.x.toFixed(0));
  switch (o.type) {
    case 'nebula': {
      const g = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, o.size * 2.2);
      g.addColorStop(0, 'rgba(255,140,170,.55)');
      g.addColorStop(0.6, 'rgba(180,120,200,.22)');
      g.addColorStop(1, 'rgba(180,120,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(o.x - o.size * 2.2, o.y - o.size * 2.2, o.size * 4.4, o.size * 4.4);
      break;
    }
    case 'cluster': {
      for (let i = 0; i < 45; i++) {
        const rad = o.size * Math.pow(r(), 0.8);
        const a = r() * Math.PI * 2;
        ctx.fillStyle = `rgba(255,240,215,${0.25 + r() * 0.6})`;
        ctx.beginPath();
        ctx.arc(o.x + Math.cos(a) * rad, o.y + Math.sin(a) * rad, 0.7 + r() * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'galaxy': {
      const g = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, o.size * 2);
      g.addColorStop(0, 'rgba(255,238,200,.6)');
      g.addColorStop(1, 'rgba(255,238,200,0)');
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(o.x % 2);
      ctx.scale(1.6, 0.7);
      ctx.fillStyle = g;
      ctx.fillRect(-o.size * 2, -o.size * 2, o.size * 4, o.size * 4);
      ctx.restore();
      break;
    }
    case 'planetary': {
      const g = ctx.createRadialGradient(o.x, o.y, o.size * 0.6, o.x, o.y, o.size * 1.6);
      g.addColorStop(0, 'rgba(120,255,220,.08)');
      g.addColorStop(0.65, 'rgba(120,255,220,.55)');
      g.addColorStop(1, 'rgba(120,255,220,0)');
      ctx.fillStyle = g;
      ctx.fillRect(o.x - o.size * 1.6, o.y - o.size * 1.6, o.size * 3.2, o.size * 3.2);
      break;
    }
  }
}

export function render(ctx, objects, stars, revealAll) {
  ctx.fillStyle = '#02020a';
  ctx.fillRect(0, 0, W, H);
  for (const star of stars) {
    ctx.fillStyle = `rgba(255,255,255,${star.a})`;
    ctx.fillRect(star.x, star.y, star.s, star.s);
  }
  for (const o of objects) drawObject(ctx, o);
  if (revealAll) {
    ctx.font = '11px "DM Mono",monospace';
    ctx.textAlign = 'center';
    for (const o of objects) {
      ctx.fillStyle = 'rgba(110,195,200,.95)';
      ctx.fillText(`${o.catalog} — ${o.name}`, o.x, o.y - o.size * 2.4);
      ctx.strokeStyle = 'rgba(110,195,200,.5)';
      ctx.strokeRect(o.x - o.size * 2.4, o.y - o.size * 2.4, o.size * 4.8, o.size * 4.8);
    }
  }
}

export function makeSky(target) {
  const r = rngFrom(target.id + Date.now());
  const others = MESSIER_TARGETS.filter((t) => t.id !== target.id);
  const decoys = [];
  const sameType = others.filter((t) => t.type === target.type);
  if (sameType.length) decoys.push(sameType[Math.floor(r() * sameType.length)]);
  while (decoys.length < 5) {
    const t = others[Math.floor(r() * others.length)];
    if (!decoys.includes(t)) decoys.push(t);
  }
  const objects = [{ ...target }, ...decoys].map((t) => ({
    ...t,
    x: 55 + r() * (W - 110),
    y: 55 + r() * (H - 110),
    size: t.type === 'nebula' ? 7 + r() * 4 : t.type === 'galaxy' ? 9 + r() * 4 : 10 + r() * 5,
  }));
  const stars = Array.from({ length: 230 }, () => ({
    x: r() * W,
    y: r() * H,
    s: r() > 0.88 ? 2 : 1.2,
    a: 0.1 + r() * 0.6,
  }));
  return { objects, stars };
}

