import { $, REDUCED, GOLD, TAU, seeded, sizeCanvas, watchVisible } from './shared.js';

/* ---------------- Hero starfield: parallax, twinkle, constellations, meteors ---------------- */
(() => {
  const canvas = $('#sky'); if (!canvas) return;
  const hero = canvas.parentElement;
  let ctx, W, H, stars = [], meteors = [];
  const mouse = { x: .5, y: .5, tx: .5, ty: .5, px: -9999, py: -9999, on: false };
  let visible = true, last = 0, nextMeteor = 2.5;

  function build(){
    ({ w: W, h: H, ctx } = sizeCanvas(canvas));
    const rnd = seeded(7);
    const n = Math.round(W * H / 4200);
    stars = Array.from({ length: n }, () => {
      const z = .25 + rnd() * .75;
      const c = rnd() > .88 ? '190,205,235' : rnd() > .5 ? '236,232,224' : '226,197,150';
      return { x: rnd() * W, y: rnd() * H, z, r: z * 1.3 + .35, c,
               tw: .4 + rnd() * 1.6, ph: rnd() * TAU };
    });
  }

  function spawnMeteor(t){
    const a = (Math.PI / 180) * (18 + Math.random() * 22);
    const sp = 520 + Math.random() * 380;
    meteors.push({
      x: Math.random() * W * .9, y: Math.random() * H * .35,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0, max: .8 + Math.random() * .6
    });
    nextMeteor = t + 3.5 + Math.random() * 5;
  }

  function frame(now){
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = now / 1000;
    const dt = Math.min(.05, (t - last) || .016); last = t;

    mouse.x += (mouse.tx - mouse.x) * .05;   /* eased parallax */
    mouse.y += (mouse.ty - mouse.y) * .05;
    ctx.clearRect(0, 0, W, H);

    /* stars */
    const pts = [];
    for (const s of stars){
      const a = (.55 + .45 * Math.sin(t * s.tw + s.ph)) * (.35 + .65 * s.z);
      const x = s.x + (mouse.x - .5) * 46 * s.z;
      const y = s.y + (mouse.y - .5) * 30 * s.z;
      ctx.fillStyle = `rgba(${s.c},${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
      pts.push({ x, y });
    }

    /* constellation lines form around the cursor */
    if (mouse.on && !REDUCED){
      const mx = mouse.px, my = mouse.py, R = 150, near = [];
      for (const p of pts){
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < R) near.push({ ...p, k: 1 - d / R });
      }
      near.sort((a, b) => b.k - a.k);
      near.length = Math.min(near.length, 26);
      for (let i = 0; i < near.length; i++)
        for (let j = i + 1; j < near.length; j++){
          const d = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y);
          if (d < 120){
            const a = .3 * Math.min(near[i].k, near[j].k) * (1 - d / 120);
            ctx.strokeStyle = `rgba(${GOLD},${a.toFixed(3)})`;
            ctx.lineWidth = .7;
            ctx.beginPath();
            ctx.moveTo(near[i].x, near[i].y); ctx.lineTo(near[j].x, near[j].y);
            ctx.stroke();
          }
        }
      /* small reticle at the cursor */
      ctx.strokeStyle = `rgba(${GOLD},.55)`; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx - 9, my); ctx.lineTo(mx - 3, my);
      ctx.moveTo(mx + 3, my); ctx.lineTo(mx + 9, my);
      ctx.moveTo(mx, my - 9); ctx.lineTo(mx, my - 3);
      ctx.moveTo(mx, my + 3); ctx.lineTo(mx, my + 9);
      ctx.stroke();
    }

    /* meteors */
    if (!REDUCED){
      if (t > nextMeteor) spawnMeteor(t);
      meteors = meteors.filter(m => m.life < m.max);
      for (const m of meteors){
        m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt;
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * .16, m.y - m.vy * .16);
        g.addColorStop(0, `rgba(255,244,224,${(.9 * fade).toFixed(3)})`);
        g.addColorStop(1, 'rgba(255,244,224,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * .16, m.y - m.vy * .16);
        ctx.stroke();
      }
    }
  }

  hero.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.px = e.clientX - r.left; mouse.py = e.clientY - r.top;
    mouse.tx = mouse.px / r.width; mouse.ty = mouse.py / r.height;
    mouse.on = true;
  });
  hero.addEventListener('pointerleave', () => { mouse.on = false; });

  new ResizeObserver(() => build()).observe(canvas);
  watchVisible(hero, v => visible = v);
  build();
  requestAnimationFrame(frame);
})();
