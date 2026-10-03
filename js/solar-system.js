import { $, GOLD, TAU, seeded, sizeCanvas, watchVisible, ARROW } from './shared.js';

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
  const BACK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

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
        <div class="pc-nav">
          <button class="btn ghost small pc-prev" type="button">${BACK} Previous planet</button>
          <button class="btn ghost small pc-next" type="button">Next planet ${ARROW}</button>
        </div>`;
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
    if (e.target.closest('.pc-prev')) select((sel - 1 + p.length) % p.length);
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
