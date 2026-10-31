import { $, GOLD, TAU, seeded, sizeCanvas, watchVisible } from './shared.js';

/* ---------------- 04 · Gravity Lab: drag-to-launch orbit simulator ----------------
   One inverse-square law generates every shape in the sky. The user drags on
   the canvas to set a start point + velocity; a dashed prediction shows the
   whole trajectory before release. Live readouts (speed, distance, shape,
   apsides, period) come from the state-vector orbital elements, and a shaded
   wedge behind the active body demonstrates Kepler's second law. */
(() => {
  const canvas = $('#gvCanvas'); if (!canvas) return;
  const stage = canvas.parentElement;

  const MU = 3e6;                                  /* star's gravitational parameter, px³/s² */
  const AU = 100;                                  /* 100 px reads out as 1 AU */
  const KMS = 29.8 / Math.sqrt(MU / AU);           /* px/s → km/s, calibrated so 1 AU circular = 29.8 */
  const T_YEAR = TAU * Math.sqrt(Math.pow(AU, 3) / MU);  /* sim seconds per displayed year */
  const R_STAR = 13, MAX_BODIES = 7, KV = 1.6;     /* impact radius, body cap, drag→speed */

  const els = {
    speed: $('#gvSpeed'), dist: $('#gvDist'), shape: $('#gvShape'),
    period: $('#gvPeriod'), peri: $('#gvPeri'), apo: $('#gvApo')
  };

  const PALETTE = ['#e9e4d6', '#9cc3c0', '#c6603f', '#d8c494', '#7d9fc4', '#cfa678', '#e3b15f'];
  let ctx, W, H, cx, cy, bgStars = [];
  let bodies = [], flashes = [], active = null;
  let visible = true, last = 0, readT = 0, turn = -.6, armed = false;
  const aim = { on: false, x0: 0, y0: 0, x: 0, y: 0 };

  const vCirc = r => Math.sqrt(MU / r);

  function build(){
    const pcx = cx, pcy = cy;
    ({ w: W, h: H, ctx } = sizeCanvas(canvas));
    cx = W / 2; cy = H / 2;
    if (pcx !== undefined){                          /* keep bodies centred through resizes */
      const dx = cx - pcx, dy = cy - pcy;
      bodies.forEach(b => {
        b.x += dx; b.y += dy;
        b.trail = b.trail.map(p => [p[0] + dx, p[1] + dy]);
      });
    }
    const rnd = seeded(9);
    bgStars = Array.from({ length: 34 }, () =>
      ({ x: rnd() * W, y: rnd() * H, r: rnd() + .3, a: .06 + rnd() * .2 }));
    if (!armed && W > 0){ armed = true; preset('ellipse'); preset('comet'); }
  }

  /* orbital elements from a state vector relative to the star */
  function orbitOf(x, y, vx, vy){
    const r = Math.hypot(x, y) || 1e-6, v2 = vx * vx + vy * vy;
    const eps = v2 / 2 - MU / r;
    const rv = x * vx + y * vy;
    const e = Math.hypot(((v2 - MU / r) * x - rv * vx) / MU,
                         ((v2 - MU / r) * y - rv * vy) / MU);
    const a = -MU / (2 * eps);                      /* negative when unbound */
    return { r, v: Math.sqrt(v2), eps, e, a,
             peri: a * (1 - e),                     /* positive in both cases: signs cancel when e > 1 */
             apo: eps < 0 ? a * (1 + e) : Infinity };
  }

  function shapeOf(o){
    if (o.peri <= R_STAR) return 'IMPACT TRAJECTORY';
    if (o.eps >= 0) return o.e > 1.05 ? 'HYPERBOLIC · ESCAPE' : 'PARABOLIC · ESCAPE';
    return o.e < .05 ? 'NEAR-CIRCULAR' : 'BOUND · ELLIPSE';
  }

  function setReadout(o){
    if (!o){
      Object.values(els).forEach(el => { if (el) el.textContent = '—'; });
      return;
    }
    els.speed.textContent = (o.v * KMS).toFixed(1) + ' km/s';
    els.dist.textContent = (o.r / AU).toFixed(2) + ' AU';
    els.shape.textContent = shapeOf(o);
    els.period.textContent = o.eps < 0
      ? (TAU * Math.sqrt(Math.pow(o.a, 3) / MU) / T_YEAR).toFixed(1) + ' yr' : '∞';
    els.peri.textContent = Math.max(0, o.peri / AU).toFixed(2) + ' AU';
    els.apo.textContent = o.apo === Infinity ? '∞' : (o.apo / AU).toFixed(2) + ' AU';
  }

  function spawn(x, y, vx, vy){
    if (bodies.length >= MAX_BODIES) bodies.shift();
    const b = { x, y, vx, vy, color: PALETTE[bodies.length % PALETTE.length], trail: [] };
    bodies.push(b); active = b;
    setReadout(orbitOf(x - cx, y - cy, vx, vy));
  }

  function preset(kind){
    turn += .9;                                     /* rotate each launch for variety */
    const c = Math.cos(turn), s = Math.sin(turn);
    let r, f;
    if (kind === 'circular'){ r = 150; f = 1; }
    else if (kind === 'ellipse'){ r = 170; f = .62; }
    else if (kind === 'comet'){ r = Math.min(W, H) * .42; f = .35; }
    else { r = 120; f = 1.5; }                      /* escape: 1.5 > √2 */
    spawn(cx + c * r, cy + s * r, -s * vCirc(r) * f, c * vCirc(r) * f);
  }

  function accel(x, y){
    const dx = x - cx, dy = y - cy;
    const d2 = dx * dx + dy * dy, d = Math.sqrt(d2) || 1;
    const k = -MU / (d2 * d);
    return [k * dx, k * dy];
  }

  /* integrate a copy forward to draw the aim prediction */
  function predict(x, y, vx, vy){
    const pts = [[x, y]];
    const dt = .02, brk = Math.hypot(W, H);
    for (let i = 0; i < 1500; i++){
      const [ax1, ay1] = accel(x, y);
      x += vx * dt + .5 * ax1 * dt * dt;
      y += vy * dt + .5 * ay1 * dt * dt;
      const [ax2, ay2] = accel(x, y);
      vx += .5 * (ax1 + ax2) * dt;
      vy += .5 * (ay1 + ay2) * dt;
      pts.push([x, y]);
      const d = Math.hypot(x - cx, y - cy);
      if (d < R_STAR || d > brk) break;
    }
    return pts;
  }

  function frame(now){
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = now / 1000;
    const dt = Math.min(.034, (t - last) || .016); last = t;

    /* physics — velocity Verlet, fixed substeps for stable ellipses */
    const SUB = 8, h = dt / SUB;
    for (let s = 0; s < SUB; s++){
      for (const b of bodies){
        const [ax1, ay1] = accel(b.x, b.y);
        b.x += b.vx * h + .5 * ax1 * h * h;
        b.y += b.vy * h + .5 * ay1 * h * h;
        const [ax2, ay2] = accel(b.x, b.y);
        b.vx += .5 * (ax1 + ax2) * h;
        b.vy += .5 * (ay1 + ay2) * h;
      }
    }

    const gone = [];
    for (const b of bodies){
      b.trail.push([b.x, b.y]);
      if (b.trail.length > 320) b.trail.shift();
      const d = Math.hypot(b.x - cx, b.y - cy);
      if (d < R_STAR + 2){ flashes.push({ x: b.x, y: b.y, age: 0 }); gone.push(b); }
      else if (d > Math.max(W, H) * 2.5) gone.push(b);
    }
    if (gone.length){
      bodies = bodies.filter(b => !gone.includes(b));
      if (gone.includes(active)) active = bodies[bodies.length - 1] || null;
      if (!active) setReadout(null);
    }

    /* readouts for the flying body, throttled */
    if (!aim.on && active && t - readT > .12){
      readT = t;
      setReadout(orbitOf(active.x - cx, active.y - cy, active.vx, active.vy));
    }

    /* ---- draw ---- */
    ctx.clearRect(0, 0, W, H);
    for (const s of bgStars){
      ctx.fillStyle = `rgba(233,228,214,${s.a})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    /* faint AU reference rings */
    ctx.font = '9px "IBM Plex Mono", monospace';
    for (let n = 1; n <= 3; n++){
      const r = n * AU;
      if (r > Math.min(W, H) / 2 + 30) break;
      ctx.strokeStyle = 'rgba(233,228,214,.05)';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(233,228,214,.22)';
      ctx.fillText(n + ' AU', cx + r * Math.SQRT1_2 + 5, cy - r * Math.SQRT1_2 - 5);
    }

    /* Kepler's second law: wedge swept by the active body */
    if (active && active.trail.length > 6){
      const pts = active.trail.slice(-46);
      ctx.fillStyle = `rgba(${GOLD},.05)`;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (const p of pts) ctx.lineTo(p[0], p[1]);
      ctx.closePath(); ctx.fill();
    }

    /* trails */
    for (const b of bodies){
      const n = b.trail.length;
      for (let i = 1; i < n; i++){
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = Math.pow(i / n, 1.6) * .5;
        ctx.beginPath();
        ctx.moveTo(b.trail[i - 1][0], b.trail[i - 1][1]);
        ctx.lineTo(b.trail[i][0], b.trail[i][1]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    /* the star */
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
    g.addColorStop(0, 'rgba(250,220,160,.5)'); g.addColorStop(1, 'rgba(250,220,160,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f6d998'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();

    /* bodies */
    for (const b of bodies){
      ctx.shadowColor = b.color; ctx.shadowBlur = 6;
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
      if (b === active){
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = `rgba(${GOLD},.8)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    /* impact flashes */
    flashes = flashes.filter(f => (f.age += dt) < .5);
    for (const f of flashes){
      const k = f.age / .5;
      ctx.strokeStyle = `rgba(198,91,69,${(1 - k).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(f.x, f.y, 4 + k * 22, 0, TAU); ctx.stroke();
    }

    /* aim vector + predicted trajectory */
    if (aim.on){
      const vx = (aim.x - aim.x0) * KV, vy = (aim.y - aim.y0) * KV;
      const pts = predict(aim.x0, aim.y0, vx, vy);
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = `rgba(${GOLD},.4)`; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (const p of pts) ctx.lineTo(p[0], p[1]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = `rgba(${GOLD},.9)`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(aim.x0, aim.y0); ctx.lineTo(aim.x, aim.y); ctx.stroke();
      const a = Math.atan2(aim.y - aim.y0, aim.x - aim.x0);
      ctx.beginPath();
      ctx.moveTo(aim.x, aim.y);
      ctx.lineTo(aim.x - 8 * Math.cos(a - .4), aim.y - 8 * Math.sin(a - .4));
      ctx.moveTo(aim.x, aim.y);
      ctx.lineTo(aim.x - 8 * Math.cos(a + .4), aim.y - 8 * Math.sin(a + .4));
      ctx.stroke();
      ctx.fillStyle = `rgba(${GOLD},1)`;
      ctx.beginPath(); ctx.arc(aim.x0, aim.y0, 3, 0, TAU); ctx.fill();

      setReadout(orbitOf(aim.x0 - cx, aim.y0 - cy, vx, vy));
    }
  }

  /* ---- interaction ---- */
  const pos = e => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  canvas.addEventListener('pointerdown', e => {
    const p = pos(e);
    aim.on = true; aim.x0 = aim.x = p.x; aim.y0 = aim.y = p.y;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!aim.on) return;
    const p = pos(e); aim.x = p.x; aim.y = p.y;
  });
  canvas.addEventListener('pointerup', () => {
    if (!aim.on) return;
    aim.on = false;
    const dx = aim.x - aim.x0, dy = aim.y - aim.y0;
    if (Math.hypot(dx, dy) > 8){
      spawn(aim.x0, aim.y0, dx * KV, dy * KV);
    } else {
      /* a short tap selects the nearest body instead of launching */
      let best = null, bd = 14;
      for (const b of bodies){
        const d = Math.hypot(b.x - aim.x0, b.y - aim.y0);
        if (d < bd){ bd = d; best = b; }
      }
      if (best){ active = best; setReadout(orbitOf(best.x - cx, best.y - cy, best.vx, best.vy)); }
    }
  });
  canvas.addEventListener('pointercancel', () => aim.on = false);

  $('#gvPresets')?.addEventListener('click', e => {
    const b = e.target.closest('[data-p]');
    if (b) preset(b.dataset.p);
  });
  $('#gvClear')?.addEventListener('click', () => {
    bodies = []; flashes = []; active = null; setReadout(null);
  });

  new ResizeObserver(() => build()).observe(stage);
  watchVisible(stage, v => visible = v);
  build();
  requestAnimationFrame(frame);
})();
