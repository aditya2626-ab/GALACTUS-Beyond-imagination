/* ============================================================
   PERIHELION — script.js
   helpers · reveal & nav · hero starfield · solar system ·
   stellar lifecycle · cosmic scale · quiz
   ============================================================ */
'use strict';

const TAU = Math.PI * 2;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GOLD = '227,177,95';
const ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* deterministic PRNG so decorative star fields stay put between frames */
function seeded(seed){
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/* DPR-aware canvas sizing; returns live 2D context + CSS dimensions */
function sizeCanvas(canvas){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, ctx };
}

/* pause heavy animation loops when their section is off-screen */
function watchVisible(el, cb){
  new IntersectionObserver(es => cb(es[0].isIntersecting), { threshold: .02 }).observe(el);
}

/* ---------------- Reveal on scroll + active nav link ---------------- */
(() => {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  const links = $$('.nav-links a');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const so = new IntersectionObserver(es => es.forEach(e => {
    const link = map.get(e.target.id);
    if (link && e.isIntersecting){
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const sec = document.getElementById(id); if (sec) so.observe(sec); });
})();

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

/* ---------------- 01 · Solar System: orbital map + dossiers ---------------- */
(() => {
  const canvas = $('#orbits'); if (!canvas) return;
  const stage = canvas.parentElement, card = $('#planetCard');

  const PLANETS = [
    { name:'Mercury', type:'ROCKY WORLD', color:'#a9988b', a:.387,  size:2.4, period:.241,
      temp:'167 °C',  diameter:'4,879 km',   day:'58.6 Earth days', year:'88 Earth days',   moons:'0',
      blurb:'A scorched, cratered messenger racing around the Sun faster than any other world.' },
    { name:'Venus',   type:'ROCKY WORLD', color:'#d9b382', a:.723,  size:3.6, period:.615,
      temp:'464 °C',  diameter:'12,104 km',  day:'243 Earth days · retrograde', year:'225 Earth days', moons:'0',
      blurb:'Earth\u2019s twin in size, wrapped in crushing clouds of acid — the hottest planet of all.' },
    { name:'Earth',   type:'ROCKY WORLD', color:'#7d9fc4', a:1,     size:3.8, period:1,
      temp:'15 °C',   diameter:'12,756 km',  day:'23.9 hours', year:'365.25 days',      moons:'1',
      blurb:'The only world known to harbor life; a thin blue film of water and air over rock.' },
    { name:'Mars',    type:'ROCKY WORLD', color:'#c6603f', a:1.524, size:3,   period:1.881,
      temp:'\u221263 °C', diameter:'6,792 km', day:'24.6 hours', year:'687 Earth days',   moons:'2',
      blurb:'A cold desert of rust and dust, home to the Solar System\u2019s tallest volcano.' },
    { name:'Jupiter', type:'GAS GIANT',   color:'#cfa678', a:5.203, size:8,   period:11.86,
      temp:'\u2212110 °C', diameter:'142,984 km', day:'9.9 hours', year:'11.9 Earth years', moons:'95',
      blurb:'Heavier than every other planet combined; its Great Red Spot has raged for centuries.' },
    { name:'Saturn',  type:'GAS GIANT',   color:'#d8c494', a:9.537, size:7,   period:29.45, ring:true,
      temp:'\u2212140 °C', diameter:'120,536 km', day:'10.7 hours', year:'29.4 Earth years', moons:'146',
      blurb:'Circled by rings of ice and rock only tens of meters thick — the Solar System\u2019s showpiece.' },
    { name:'Uranus',  type:'ICE GIANT',   color:'#9cc3c0', a:19.19, size:5,   period:84,
      temp:'\u2212195 °C', diameter:'51,118 km', day:'17.2 hours · retrograde', year:'84 Earth years', moons:'28',
      blurb:'An ice giant rolling on its side, its poles taking turns facing the Sun for 42 years.' },
    { name:'Neptune', type:'ICE GIANT',   color:'#7e97c6', a:30.07, size:5,   period:164.8,
      temp:'\u2212200 °C', diameter:'49,528 km', day:'16.1 hours', year:'164.8 Earth years', moons:'16',
      blurb:'The windiest world known — supersonic gales whip through its deep blue atmosphere.' }
  ];

  const p = PLANETS.map((o, i) => ({ ...o, phase: i * 2.4 }));
  let ctx, W, H, cx, cy, k, simT = 0, speed = 1, paused = false,
      hover = -1, sel = 2, visible = true, last = 0, bgStars = [];

  const rOf = a => Math.pow(a, .4) * k;   /* compressed distance scale */

  function build(){
    ({ w: W, h: H, ctx } = sizeCanvas(canvas));
    cx = W / 2; cy = H / 2;
    k = (Math.min(W, H) / 2 - 30) / Math.pow(30.07, .4);
    const rnd = seeded(21);
    bgStars = Array.from({ length: 42 }, () =>
      ({ x: rnd() * W, y: rnd() * H, r: rnd() + .3, a: .08 + rnd() * .22 }));
  }

  const row = (name, val) =>
    `<div class="pc-row"><dt>${name}</dt><i></i><dd>${val}</dd></div>`;

  function renderCard(pl, idx){
    card.classList.add('fade');
    setTimeout(() => {
      card.innerHTML = `
        <div class="pc-top"><span class="pc-type">${pl.type}</span>
          <span class="pc-idx">${String(idx + 1).padStart(2, '0')} / 08</span></div>
        <h3 class="pc-name">${pl.name}</h3>
        <p class="pc-blurb">${pl.blurb}</p>
        <dl>
          ${row('Mean temp', pl.temp)}
          ${row('Diameter', pl.diameter)}
          ${row('Day length', pl.day)}
          ${row('Year length', pl.year)}
          ${row('Known moons', pl.moons)}
        </dl>
        <button class="btn ghost small pc-next" type="button">Next planet ${ARROW}</button>`;
      card.classList.remove('fade');
    }, 140);
  }

  function select(i){ sel = i; renderCard(p[i], i); }

  function frame(now){
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = now / 1000;
    const dt = Math.min(.05, (t - last) || .016); last = t;
    if (!paused) simT += dt * speed;

    ctx.clearRect(0, 0, W, H);
    for (const s of bgStars){
      ctx.fillStyle = `rgba(233,228,214,${s.a})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    /* orbit paths */
    for (let i = 0; i < p.length; i++){
      ctx.beginPath(); ctx.arc(cx, cy, rOf(p[i].a), 0, TAU);
      ctx.strokeStyle = i === sel ? `rgba(${GOLD},.4)`
                      : i === hover ? `rgba(${GOLD},.22)`
                      : 'rgba(233,228,214,.08)';
      ctx.lineWidth = i === sel ? 1.1 : 1;
      ctx.stroke();
    }

    /* the Sun */
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
    g.addColorStop(0, 'rgba(250,220,160,.5)'); g.addColorStop(1, 'rgba(250,220,160,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f6d998'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();

    /* planets */
    p.forEach((pl, i) => {
      const th = pl.phase + TAU * simT / pl.period;
      const r = rOf(pl.a);
      const x = pl._x = cx + Math.cos(th) * r;
      const y = pl._y = cy + Math.sin(th) * r;

      ctx.shadowColor = pl.color; ctx.shadowBlur = 7;
      ctx.fillStyle = pl.color;
      ctx.beginPath(); ctx.arc(x, y, pl.size, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;

      if (pl.ring){
        ctx.strokeStyle = 'rgba(216,196,148,.65)'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.ellipse(x, y, pl.size * 2.1, pl.size * .75, -.45, 0, TAU); ctx.stroke();
      }
      if (i === hover || i === sel){
        ctx.fillStyle = 'rgba(233,228,214,.85)';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(pl.name.toUpperCase(), x + pl.size + 7, y + 3);
      }
      if (i === sel){
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = `rgba(${GOLD},.8)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, pl.size + 6, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  function hit(e){
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 1e9;
    p.forEach((pl, i) => {
      const d = Math.hypot(pl._x - x, pl._y - y);
      if (d < Math.max(pl.size + 9, 14) && d < bd){ bd = d; best = i; }
    });
    return best;
  }
  canvas.addEventListener('pointermove', e => {
    hover = hit(e);
    canvas.style.cursor = hover > -1 ? 'pointer' : 'default';
  });
  canvas.addEventListener('click', e => {
    const i = hit(e);
    if (i > -1) select(i);
  });
  card.addEventListener('click', e => {
    if (e.target.closest('.pc-next')) select((sel + 1) % p.length);
  });

  const playBtn = $('#playBtn'), speedRange = $('#speedRange'), speedOut = $('#speedOut');
  playBtn.addEventListener('click', () => {
    paused = !paused;
    playBtn.classList.toggle('paused', paused);
    playBtn.setAttribute('aria-label', paused ? 'Resume orbits' : 'Pause orbits');
  });
  speedRange.addEventListener('input', () => {
    speed = parseFloat(speedRange.value);
    speedOut.textContent = speed.toFixed(1) + '\u00d7';
  });

  new ResizeObserver(() => build()).observe(stage);
  watchVisible(stage, v => visible = v);
  build();
  select(2);           /* start on Earth */
  requestAnimationFrame(frame);
})();

/* ---------------- 02 · Stellar lifecycle lab ---------------- */
(() => {
  const canvas = $('#starCanvas'); if (!canvas) return;
  const stage = canvas.parentElement;
  const massRange = $('#massRange'), massOut = $('#massOut');
  const outT = $('#stTemp'), outL = $('#stLum'), outLife = $('#stLife'), outRem = $('#stRem');
  const descEl = $('#stageDesc'), traceBtn = $('#traceBtn');
  const nodes = $$('#stageNodes .stage');

  const M_MIN = .1, M_MAX = 40, SPAN = Math.log(M_MAX / M_MIN);
  const massOf = v => M_MIN * Math.exp((v / 100) * SPAN);
  const massStr = m => m < 10 ? m.toFixed(2) : m.toFixed(1);
  const remnantOf = m => m < 8 ? 'White dwarf' : m < 20 ? 'Neutron star' : 'Black hole';

  const fmtLife = m => {
    const g = 10 * Math.pow(m, -2.5);
    if (g >= 1000) return (g / 1000).toFixed(1) + ' trillion years';
    if (g >= 1)    return (g < 10 ? g.toFixed(1) : Math.round(g)) + ' billion years';
    return Math.max(1, Math.round(g * 1000)) + ' million years';
  };
  const fmtLum = l =>
    l >= 100 ? Math.round(l).toLocaleString('en-US') + '\u00d7 Sun'
    : l >= 1 ? l.toFixed(1) + '\u00d7 Sun'
    : l.toFixed(2) + '\u00d7 Sun';

  /* blackbody-ish temperature to color approximation */
  const kelvinRGB = K => {
    K = Math.max(1000, Math.min(40000, K)) / 100;
    let r, g, b;
    if (K <= 66){ r = 255; g = 99.47 * Math.log(K) - 161.12; }
    else { r = 329.7 * Math.pow(K - 60, -.1332); g = 288.12 * Math.pow(K - 60, -.0755); }
    if (K >= 66) b = 255; else if (K <= 19) b = 0;
    else b = 138.52 * Math.log(K - 10) - 305.04;
    const cl = x => Math.max(0, Math.min(255, Math.round(x)));
    return [cl(r), cl(g), cl(b)];
  };

  const state = { m: 1, stage: 2, t: 0 };

  const STAGE_DESC = [
    () => `Everything begins in a molecular cloud — hydrogen and dust drifting a few degrees above absolute zero, light-years across. Gravity gathers the gas into knots, and one knot starts falling in on itself.`,
    m => `Compression heats the core until it glows dull red, while a disk of leftover dust spins around it — the raw material of future planets. For a ${m < 1 ? 'small' : m > 10 ? 'massive' : 'sun-like'} star (${massStr(m)} M\u2609), this infall takes a few hundred thousand years.`,
    m => `Fusion ignites: hydrogen becomes helium, and radiation pushes back against gravity. This is the long middle of the story — about ${fmtLife(m)} of steady shining, set almost entirely by birth mass.`,
    m => m < 8
      ? `The core runs dry and contracts while the outer layers swell and cool into a vast red giant. Eventually the star drifts its outer layers away as a glowing shell — a planetary nebula.`
      : `The core runs dry and the star swells into a supergiant hundreds of times its original size. Then the core gives way all at once, collapsing in under a second and detonating as a supernova that can outshine its entire galaxy.`,
    m => {
      const r = remnantOf(m);
      if (r === 'White dwarf')
        return `Fate of a ${massStr(m)}-solar-mass star: an Earth-sized ember of carbon and oxygen, glowing only with stored heat. Nothing is burning anymore — it simply cools, slowly, for longer than the universe has existed so far.`;
      if (r === 'Neutron star')
        return `Fate of a ${massStr(m)}-solar-mass star: collapse stops at nuclear density, leaving a sphere ~20 km across. A teaspoon of its matter would weigh about a billion tonnes, and it can spin hundreds of times per second.`;
      return `Fate of a ${massStr(m)}-solar-mass star: nothing can stop the collapse. The core becomes a black hole — a place where gravity wins so completely that not even light can leave.`;
    }
  ];

  let ctx, W, H, bg = [], visible = true, last = 0, traceTimer = null;

  function build(){
    ({ w: W, h: H, ctx } = sizeCanvas(canvas));
    const rnd = seeded(99);
    bg = Array.from({ length: 30 }, () =>
      ({ x: rnd() * W, y: rnd() * H, r: rnd() * .9 + .3, a: .08 + rnd() * .2 }));
  }

  function glowStar(x, y, r, K, spread, glowA){
    const [cr, cg, cb] = kelvinRGB(K);
    const mix = f => [cr + (255 - cr) * f, cg + (255 - cg) * f, cb + (255 - cb) * f].map(Math.round);
    const [hr, hg, hb] = mix(.6);
    let g = ctx.createRadialGradient(x, y, r * .2, x, y, r * spread);
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${glowA})`);
    g.addColorStop(.45, `rgba(${cr},${cg},${cb},${glowA * .3})`);
    g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * spread, 0, TAU); ctx.fill();
    g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${hr},${hg},${hb},1)`);
    g.addColorStop(1, `rgba(${cr},${cg},${cb},1)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }

  /* seeded positions re-derived every frame → wisps drift, never jump */
  function drawNebula(t){
    const rnd = seeded(5);
    const x0 = W / 2, y0 = H * .54;
    for (let i = 0; i < 7; i++){
      const bx = x0 + (rnd() - .5) * W * .55 + Math.sin(t * .07 + i * 2.1) * 6;
      const by = y0 + (rnd() - .5) * H * .5 + Math.cos(t * .05 + i * 1.7) * 5;
      const br = 34 + rnd() * 60;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, i % 2 === 0 ? 'rgba(198,91,69,.10)' : 'rgba(227,177,95,.08)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
    }
    for (let i = 0; i < 9; i++){
      const px = x0 + (rnd() - .5) * W * .5, py = y0 + (rnd() - .5) * H * .45;
      ctx.fillStyle = `rgba(255,230,190,${(.25 + .2 * Math.sin(t * 1.3 + i)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(px, py, .9 + rnd(), 0, TAU); ctx.fill();
    }
  }

  function drawRemnant(t){
    const x = W / 2, y = H * .54;
    const kind = remnantOf(state.m);
    if (kind === 'White dwarf'){
      glowStar(x, y, 7, 12000, 5, .3);
    } else if (kind === 'Neutron star'){
      glowStar(x, y, 4, 25000, 7, .5);
      const ph = (t % 1.8) / 1.8;                      /* pulsar pulse rings */
      ctx.strokeStyle = `rgba(190,215,255,${(.5 * (1 - ph)).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 6 + ph * 44, 0, TAU); ctx.stroke();
    } else {                                           /* black hole */
      const g = ctx.createRadialGradient(x, y, 10, x, y, 60);
      g.addColorStop(0, 'rgba(240,200,140,.16)'); g.addColorStop(1, 'rgba(240,200,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 60, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate(-.3);
      ctx.strokeStyle = `rgba(240,200,140,${(.55 + .2 * Math.sin(t * 2)).toFixed(3)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 34, 10, 0, 0, TAU); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,236,200,.95)'; ctx.lineWidth = 1.4;   /* photon ring */
      ctx.beginPath(); ctx.arc(x, y, 13.8, 0, TAU); ctx.stroke();
    }
  }

  function frame(now){
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = now / 1000;
    Math.min(.05, (t - last) || .016); last = t;
    state.t = t;
    ctx.clearRect(0, 0, W, H);
    for (const s of bg){
      ctx.fillStyle = `rgba(233,228,214,${s.a})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    const x = W / 2, y = H * .54;
    const m = state.m, L = Math.pow(m, 3.5), T = 5778 * Math.sqrt(m);

    if (state.stage === 0){ drawNebula(t); return; }
    if (state.stage === 4){ drawRemnant(t); return; }

    let K = T, r = 16 + 22 * Math.log10(1 + L);
    if (state.stage === 1){ K = 2700; r *= .95; }                  /* protostar */
    if (state.stage === 3){ K = Math.min(T, 3900); r *= 1.85; }    /* red giant */
    r = Math.min(r, H / 2 - 18);
    r *= 1 + .015 * Math.sin(t * 1.8);
    glowStar(x, y, r, K, state.stage === 1 ? 3.6 : 2.8, state.stage === 1 ? .55 : .45);
  }

  function update(){
    const m = state.m, T = 5778 * Math.sqrt(m), L = Math.pow(m, 3.5);
    massOut.textContent = 'MASS \u00b7 ' + massStr(m) + ' M\u2609';
    outT.textContent = Math.round(T).toLocaleString('en-US') + ' K';
    outL.textContent = fmtLum(L);
    outLife.textContent = fmtLife(m);
    outRem.textContent = remnantOf(m);
    nodes[3].lastElementChild.textContent = m >= 8 ? 'Supergiant' : 'Red giant';
    nodes[4].lastElementChild.textContent = remnantOf(m);
    descEl.textContent = STAGE_DESC[state.stage](m);
  }

  function stopTrace(){ if (traceTimer){ clearInterval(traceTimer); traceTimer = null; } }
  function setStage(i){
    state.stage = i;
    nodes.forEach((n, j) => n.classList.toggle('active', j === i));
    descEl.textContent = STAGE_DESC[i](state.m);
    stopTrace();
  }
  nodes.forEach((n, i) => n.addEventListener('click', () => setStage(i)));
  traceBtn.addEventListener('click', () => {
    stopTrace();
    let i = 0; setStage(0);
    traceTimer = setInterval(() => {
      if (++i > 4){ stopTrace(); return; }
      setStage(i);
    }, 1300);
  });
  massRange.addEventListener('input', () => {
    state.m = massOf(parseFloat(massRange.value));
    update();
  });

  new ResizeObserver(() => build()).observe(stage);
  watchVisible(stage, v => visible = v);
  build();
  setStage(2);
  update();
  requestAnimationFrame(frame);
})();

/* ---------------- 03 · Cosmic scale: draggable log ruler ---------------- */
(() => {
  const canvas = $('#ladder'); if (!canvas) return;
  const distEl = $('#ladderDist'), markEl = $('#ladderLandmark'), factEl = $('#ladderFact');
  const LY = 9.4607e12;

  const STOPS = [
    { name:'The Moon',          short:'The Moon',          km:3.844e5,
      fact:'The farthest humans have ever traveled. Apollo astronauts needed about three days to cross this gap.' },
    { name:'The Sun',           short:'The Sun',           km:1.496e8,
      fact:'One astronomical unit. Sunlight reaching your skin left the Sun 8 minutes 20 seconds ago.' },
    { name:'Neptune',           short:'Neptune',           km:4.495e9,
      fact:'The outermost planet. Out here the Sun is 900 times dimmer than it is on Earth.' },
    { name:'Proxima Centauri',  short:'Proxima Centauri',  km:4.017e13,
      fact:'Our nearest stellar neighbor, 4.24 light-years away. Voyager 1 would need over 70,000 years to get there.' },
    { name:'Sagittarius A*',    short:'Sagittarius A*',    km:2.524e17,
      fact:'The supermassive black hole at the center of the Milky Way — 4 million solar masses, 26,000 light-years away.' },
    { name:'Andromeda Galaxy',  short:'Andromeda',         km:2.4e19,
      fact:'The nearest large galaxy, 2.5 million light-years away. It closes with us at 110 km/s — we merge in ~4.5 billion years.' },
    { name:'Edge of the observable universe', short:'Observable universe', km:4.4e23,
      fact:'46.5 billion light-years in every direction. The oldest light has traveled 13.8 billion years, stretched by expanding space itself.' }
  ];

  const MINL = Math.log10(STOPS[0].km);
  const MAXL = Math.log10(STOPS[STOPS.length - 1].km);
  const state = { L: Math.log10(4.017e13) };      /* start at Proxima Centauri */
  let ctx, W, H, dragging = false;
  const PAD = 34;

  const SUP = { '0':'\u2070','1':'\u00b9','2':'\u00b2','3':'\u00b3','4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079' };
  const sup = n => String(n).split('').map(c => SUP[c]).join('');

  function fmtKm(km){
    if (km < 1e7)  return Math.round(km).toLocaleString('en-US') + ' km';
    if (km < 1e13){
      const au = km / 1.496e8;
      return (au >= 100 ? Math.round(au).toLocaleString('en-US') : au.toFixed(2)) + ' AU';
    }
    const ly = km / LY;
    if (ly < 1e6)
      return (ly < 10 ? ly.toFixed(3) : ly < 1000 ? ly.toFixed(1) : Math.round(ly).toLocaleString('en-US')) + ' light-years';
    if (ly < 1e9) return (ly / 1e6).toFixed(2) + ' million light-years';
    return (ly / 1e9).toFixed(2) + ' billion light-years';
  }

  const xOf = L => PAD + (L - MINL) / (MAXL - MINL) * (W - PAD * 2);
  const lOf = x => MINL + (Math.max(PAD, Math.min(W - PAD, x)) - PAD) / (W - PAD * 2) * (MAXL - MINL);

  function nearest(){
    let best = 0, bd = 1e9;
    STOPS.forEach((s, i) => {
      const d = Math.abs(Math.log10(s.km) - state.L);
      if (d < bd){ bd = d; best = i; }
    });
    return best;
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    const y = H * .5;
    const labelAll = W > 640;

    /* baseline + origin */
    ctx.strokeStyle = 'rgba(233,228,214,.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    ctx.fillStyle = `rgba(${GOLD},1)`;
    ctx.beginPath(); ctx.arc(PAD, y, 3, 0, TAU); ctx.fill();

    /* decade ticks */
    const perDec = (W - PAD * 2) / (MAXL - MINL);
    const every = perDec < 26 ? 5 : perDec < 44 ? 2 : 1;
    const first = Math.ceil(MINL);
    ctx.textAlign = 'center';
    for (let e = first; e <= Math.floor(MAXL); e++){
      const x = xOf(e);
      ctx.strokeStyle = 'rgba(233,228,214,.14)';
      ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
      if ((e - first) % every === 0){
        ctx.fillStyle = 'rgba(233,228,214,.32)';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillText('10' + sup(e) + ' km', x, y + 20);
      }
    }

    /* landmarks */
    const ni = nearest();
    STOPS.forEach((s, i) => {
      const x = xOf(Math.log10(s.km));
      const active = i === ni;
      ctx.fillStyle = active ? `rgba(${GOLD},1)` : 'rgba(233,228,214,.75)';
      ctx.beginPath(); ctx.arc(x, y, active ? 4 : 2.4, 0, TAU); ctx.fill();
      if (active){
        ctx.strokeStyle = `rgba(${GOLD},.35)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
      }
      if (labelAll || active){
        ctx.strokeStyle = active ? `rgba(${GOLD},.5)` : 'rgba(233,228,214,.25)';
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y - 22); ctx.stroke();
        let align = 'center', tx = x;
        if (i === 0){ align = 'left'; tx = x - 4; }
        if (i === STOPS.length - 1){ align = 'right'; tx = x + 4; }
        ctx.fillStyle = active ? `rgba(${GOLD},1)` : 'rgba(233,228,214,.6)';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = align;
        ctx.fillText(s.short, tx, y - 28);
      }
    });

    /* draggable handle + live readout tag */
    const hx = xOf(state.L);
    ctx.strokeStyle = `rgba(${GOLD},.9)`; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(hx, y - 44); ctx.lineTo(hx, y + 30); ctx.stroke();
    ctx.fillStyle = `rgba(${GOLD},1)`;
    ctx.beginPath();
    ctx.moveTo(hx - 5, y - 44); ctx.lineTo(hx + 5, y - 44); ctx.lineTo(hx, y - 37);
    ctx.closePath(); ctx.fill();

    const label = fmtKm(Math.pow(10, state.L));
    ctx.font = '11px "IBM Plex Mono", monospace';
    const tw = ctx.measureText(label).width;
    const bx = Math.max(PAD, Math.min(W - PAD - tw - 16, hx - tw / 2 - 8));
    ctx.fillStyle = '#0a0c11'; ctx.strokeStyle = `rgba(${GOLD},.6)`; ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, y + 34, tw + 16, 20, 3);
    else ctx.rect(bx, y + 34, tw + 16, 20);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = `rgba(${GOLD},1)`; ctx.textAlign = 'left';
    ctx.fillText(label, bx + 8, y + 48);
  }

  function update(){
    const km = Math.pow(10, state.L);
    distEl.textContent = fmtKm(km);
    const ni = nearest();
    markEl.textContent = STOPS[ni].name;
    if (factEl.dataset.i !== String(ni)){
      factEl.dataset.i = ni;
      factEl.textContent = STOPS[ni].fact;
      factEl.classList.remove('flash'); void factEl.offsetWidth; factEl.classList.add('flash');
    }
    draw();
  }

  function setFromEvent(e){
    const r = canvas.getBoundingClientRect();
    state.L = lOf(e.clientX - r.left);
    update();
  }
  canvas.addEventListener('pointerdown', e => {
    dragging = true; canvas.setPointerCapture(e.pointerId); setFromEvent(e);
  });
  canvas.addEventListener('pointermove', e => { if (dragging) setFromEvent(e); });
  canvas.addEventListener('pointerup', () => dragging = false);
  canvas.addEventListener('pointercancel', () => dragging = false);

  new ResizeObserver(() => {
    ({ w: W, h: H, ctx } = sizeCanvas(canvas));
    update();
  }).observe(canvas);
})();

/* ---------------- 04 · Quiz ---------------- */
(() => {
  const box = $('#quizBox'); if (!box) return;

  const ICON_OK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const QUESTIONS = [
    { q:'Which planet has the shortest day — spinning once in under 10 hours?',
      a:['Mercury', 'Jupiter', 'Mars', 'Venus'], c:1,
      ex:'Despite being the largest planet, Jupiter spins fastest: one full rotation takes just 9 hours 56 minutes.' },
    { q:'Roughly how much of the Solar System\u2019s mass is contained in the Sun itself?',
      a:['About 70%', 'About 85%', 'About 99.8%', 'About 50%'], c:2,
      ex:'The Sun holds 99.8% of all the mass in the Solar System. Everything else — planets, moons, asteroids — is a rounding error.' },
    { q:'Main-sequence stars like the Sun spend their lives fusing hydrogen into\u2026',
      a:['Carbon', 'Helium', 'Iron', 'Oxygen'], c:1,
      ex:'Hydrogen nuclei fuse into helium, releasing the energy that makes stars shine. Heavier elements come later — or in other stars.' },
    { q:'A light-year is a unit of\u2026',
      a:['Time', 'Brightness', 'Distance', 'Temperature'], c:2,
      ex:'One light-year is the distance light travels in a year: about 9.46 trillion kilometers.' },
    { q:'After the Sun becomes a red giant, what will it leave behind?',
      a:['A neutron star', 'A white dwarf', 'A black hole', 'A new solar system'], c:1,
      ex:'At ~1 solar mass, the Sun is far too light to collapse further. Its core will end as an Earth-sized white dwarf, cooling for eternity.' },
    { q:'Which of these is the closest star to the Sun?',
      a:['Sirius', 'Betelgeuse', 'Proxima Centauri', 'Polaris'], c:2,
      ex:'Proxima Centauri, part of the Alpha Centauri system, lies just 4.24 light-years away — and even hosts a planet in the habitable zone.' }
  ];

  let i = 0, score = 0, locked = false;

  const rankOf = s =>
    s >= 6 ? ['Master Navigator', 'A flawless run. You read the sky like an atlas — now go outside and check it against the real thing.']
    : s === 5 ? ['Apprentice Astronomer', 'One slip, but the fundamentals are firmly in place. The night sky is officially within reach.']
    : s >= 3 ? ['Stargazer', 'Solid instincts. Revisit the chapters above and the last points will come quickly.']
    : ['Grounded Dreamer', 'Everyone starts by looking up. Scroll back through the guide and try again — every answer is in there.'];

  function render(){
    locked = false;
    const q = QUESTIONS[i];
    box.innerHTML = `
      <div class="q-meta"><span>QUESTION ${String(i + 1).padStart(2, '0')} / ${String(QUESTIONS.length).padStart(2, '0')}</span>
        <span>SCORE ${score}</span></div>
      <div class="q-bar"><i style="width:${(i / QUESTIONS.length) * 100}%"></i></div>
      <h3 class="q-text">${q.q}</h3>
      <div class="q-opts">${q.a.map((o, j) =>
        `<button class="q-opt" type="button" data-j="${j}"><b>${'ABCD'[j]}</b><span>${o}</span></button>`).join('')}
      </div>
      <div class="q-foot" hidden></div>`;
    box.querySelectorAll('.q-opt').forEach(b =>
      b.addEventListener('click', () => answer(+b.dataset.j)));
  }

  function answer(j){
    if (locked) return;
    locked = true;
    const q = QUESTIONS[i];
    const good = j === q.c;
    if (good) score++;

    box.querySelectorAll('.q-opt').forEach((b, k) => {
      b.disabled = true;
      const mark = b.querySelector('b');
      if (k === q.c){ b.classList.add('right'); mark.outerHTML = `<b class="mark">${ICON_OK}</b>`; }
      else if (k === j){ b.classList.add('wrong'); mark.outerHTML = `<b class="mark">${ICON_NO}</b>`; }
      else b.classList.add('dim');
    });
    box.querySelector('.q-bar i').style.width = ((i + 1) / QUESTIONS.length) * 100 + '%';

    const foot = box.querySelector('.q-foot');
    foot.hidden = false;
    foot.innerHTML = `
      <p class="q-explain"><strong>${good ? 'Correct.' : 'Not quite.'}</strong> ${q.ex}</p>
      <button class="btn ghost small" id="qNext" type="button">
        ${i === QUESTIONS.length - 1 ? 'See results' : 'Next question'}${ARROW}</button>`;
    $('#qNext').addEventListener('click', () => {
      i++;
      i < QUESTIONS.length ? render() : results();
    });
  }

  function results(){
    const [rank, note] = rankOf(score);
    box.innerHTML = `
      <div class="q-meta"><span>RESULT</span><span>SCORE ${score} / ${QUESTIONS.length}</span></div>
      <div class="q-bar"><i style="width:100%"></i></div>
      <p class="q-score">${score}<span> / ${QUESTIONS.length}</span></p>
      <h3 class="q-rank">${rank}</h3>
      <p class="q-note">${note}</p>
      <button class="btn solid small" id="qAgain" type="button">Take it again</button>`;
    $('#qAgain').addEventListener('click', () => { i = 0; score = 0; render(); });
  }

  render();
})();