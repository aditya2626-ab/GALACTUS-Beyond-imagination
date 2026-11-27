export function drawTargetBody(ctx, target, filter, r, cx, cy, glow) {
  switch (target.kind) {
    case 'moon': {
      glow(cx, cy, 110, 'rgba(230,230,215,.95)', 'rgba(230,230,215,0)');
      ctx.fillStyle = '#d8d8cf';
      ctx.beginPath();
      ctx.arc(cx, cy, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120,120,115,.55)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(cx + (r() - 0.5) * 100, cy + (r() - 0.5) * 100, 12 + r() * 26, 10 + r() * 20, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 22; i++) {
        const x = cx + (r() - 0.5) * 160;
        const y = cy + (r() - 0.5) * 160;
        const cr = 2 + r() * 9;
        ctx.fillStyle = 'rgba(150,150,145,.7)';
        ctx.beginPath();
        ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(240,240,235,.5)';
        ctx.beginPath();
        ctx.arc(x - cr * 0.25, y - cr * 0.25, cr * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'planet': {
      if (target.id === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.35);
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = `rgba(220,200,160,${0.8 - i * 0.2})`;
          ctx.lineWidth = 6 - i * 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 78 + i * 12, 20 + i * 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        const pg = ctx.createLinearGradient(0, -34, 0, 34);
        pg.addColorStop(0, '#e8d9a8');
        pg.addColorStop(0.5, '#d4b878');
        pg.addColorStop(1, '#b89a5e');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        const pg = ctx.createLinearGradient(0, cy - 62, 0, cy + 62);
        pg.addColorStop(0, '#d9b98a');
        pg.addColorStop(0.25, '#e8d3ab');
        pg.addColorStop(0.35, '#b5764a');
        pg.addColorStop(0.5, '#ecd9b4');
        pg.addColorStop(0.65, '#c98a5e');
        pg.addColorStop(0.8, '#e3cda2');
        pg.addColorStop(1, '#c9a06e');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 66, 56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(200,80,50,.85)';
        ctx.beginPath();
        ctx.ellipse(cx + 22, cy + 18, 13, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = 'rgba(240,240,230,.95)';
          ctx.beginPath();
          ctx.arc(cx - 90 + i * 60 + r() * 10, cy + (r() - 0.5) * 130, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'galaxy': {
      glow(cx, cy, 130, 'rgba(255,240,210,.8)', 'rgba(255,240,210,0)');
      for (let i = 0; i < 900; i++) {
        const t = Math.pow(r(), 0.7);
        const ang = r() * Math.PI * 2;
        ctx.fillStyle = `rgba(${230 + r() * 25},${225 + r() * 25},${205 + r() * 30},${0.1 + r() * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * t * 105, cy + Math.sin(ang) * t * 38, 0.6 + r() * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(60,50,45,.5)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80, 24, 0.35, 0.3, 2.6);
      ctx.stroke();
      break;
    }
    case 'nebula': {
      const cols = filter === 'halpha'
        ? ['rgba(255,60,90,', 'rgba(255,120,140,']
        : ['rgba(255,110,160,', 'rgba(120,220,220,'];
      for (let i = 0; i < 9; i++) {
        glow(cx + (r() - 0.5) * 180, cy + (r() - 0.5) * 140, 45 + r() * 70,
          `${cols[i % 2]}${0.16 + r() * 0.2})`, `${cols[i % 2]}0)`);
      }
      for (let i = 0; i < 4; i++) {
        glow(cx - 14 + i * 9 + (r() - 0.5) * 8, cy + (r() - 0.5) * 10, 10, 'rgba(255,255,240,.95)', 'rgba(255,255,240,0)');
      }
      break;
    }
    case 'cluster': {
      for (let i = 0; i < 400; i++) {
        const rad = 85 * Math.pow(r(), 1.6);
        const a = r() * Math.PI * 2;
        ctx.fillStyle = `rgba(255,240,220,${0.25 + r() * 0.65})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.85, 0.6 + r() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      glow(cx, cy, 40, 'rgba(255,240,210,.5)', 'rgba(255,240,210,0)');
      break;
    }
    case 'star': {
      glow(cx, cy, 26, 'rgba(255,255,245,1)', 'rgba(180,210,255,0)');
      ctx.strokeStyle = 'rgba(255,255,245,.55)';
      ctx.lineWidth = 1.6;
      for (const a of [0, Math.PI / 2]) {
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a) * 52, cy - Math.sin(a) * 52);
        ctx.lineTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52);
        ctx.stroke();
      }
      break;
    }
  }
}
