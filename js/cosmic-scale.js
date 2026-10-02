import { $, GOLD, TAU, sizeCanvas } from './shared.js';

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
