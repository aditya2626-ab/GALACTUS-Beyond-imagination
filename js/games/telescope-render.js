import { rngFrom } from './game-data.js';
import { drawTargetBody } from './telescope-targets.js';

export function drawEmpty(ctx, hint) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const r = rngFrom(`empty-${Date.now()}`);
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.25})`;
    ctx.fillRect(r() * W, r() * H, 1, 1);
  }
  if (hint) {
    ctx.fillStyle = 'rgba(216,90,60,.9)';
    ctx.font = '13px "DM Sans",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty sky — adjust pointing', W / 2, H / 2 - 6);
    ctx.fillStyle = 'rgba(216,90,60,.65)';
    ctx.font = '11px "DM Sans",sans-serif';
    ctx.fillText(hint, W / 2, H / 2 + 16);
  }
}

export export function drawTarget(ctx, target, filter, exposure) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r = rngFrom(target.id);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.6})`;
    ctx.fillRect(r() * W, r() * H, r() > 0.9 ? 2 : 1, r() > 0.9 ? 2 : 1);
  }
  const glow = (x, y, rad, c1, c2) => {
    const g = ctx.createRadialGradient(x, y, 1, x, y, rad);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };

  drawTargetBody(ctx, target, filter, r, cx, cy, glow);

  const post = ctx.createLinearGradient(0, 0, W, 0);
  if (filter === 'halpha') post.addColorStop(0, 'rgba(255,40,60,.28)');
  else if (filter === 'oiii') post.addColorStop(0, 'rgba(40,230,200,.22)');
  else if (filter === 'infrared') post.addColorStop(0, 'rgba(255,120,30,.3)');
  else post.addColorStop(0, 'rgba(255,255,255,0)');
  ctx.fillStyle = post;
  ctx.fillRect(0, 0, W, H);

  if (exposure < 0.5) {
    ctx.fillStyle = `rgba(0,0,0,${(0.5 - exposure) * 0.9})`;
    ctx.fillRect(0, 0, W, H);
  } else if (exposure > 1.4) {
    ctx.fillStyle = `rgba(255,255,255,${(exposure - 1.4) * 0.45})`;
    ctx.fillRect(0, 0, W, H);
  }
  const noise = 0.02 + (1 - Math.abs(exposure - 1)) * 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${r() * noise})`;
    ctx.fillRect(r() * W, r() * H, 1, 1);
  }
}

