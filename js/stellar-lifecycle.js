import { $, $$, TAU, seeded, sizeCanvas, watchVisible } from './shared.js';

/* ---------------- 02 · Stellar lifecycle lab ---------------- */
(() => {
  const canvas = $('#starCanvas'); if (!canvas) return;
  const stage = canvas.parentElement;
  const massRange = $('#massRange'), massOut = $('#massOut');
  const massNote = $('#massNote');
  const outT = $('#stTemp'), outL = $('#stLum'), outLife = $('#stLife'), outRem = $('#stRem');
  const descEl = $('#stageDesc'), traceBtn = $('#traceBtn'), traceLabel = $('#traceLabel');
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

  const state = { m: massOf(parseFloat(massRange.value)), stage: 2, t: 0 };

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
    const fate = remnantOf(m);
    massOut.textContent = 'MASS \u00b7 ' + massStr(m) + ' M\u2609';
    outT.textContent = Math.round(T).toLocaleString('en-US') + ' K';
    outL.textContent = fmtLum(L);
    outLife.textContent = fmtLife(m);
    outRem.textContent = fate;
    nodes[3].lastElementChild.textContent = m >= 8 ? 'Supergiant' : 'Red giant';
    nodes[4].lastElementChild.textContent = fate;
    massNote.textContent = m < 8
      ? 'This star ends as a white dwarf because it was born below 8 M\u2609.'
      : m < 20
        ? 'This star ends as a neutron star because it was born between 8 and 20 M\u2609.'
        : 'This star ends as a black hole because it was born above 20 M\u2609.';
    descEl.textContent = STAGE_DESC[state.stage](m);
  }

  function stopTrace(){
    if (traceTimer){ clearInterval(traceTimer); traceTimer = null; }
    traceLabel.textContent = 'Play lifecycle';
    traceBtn.setAttribute('aria-pressed', 'false');
  }
  function setStage(i, stop = true){
    if (stop) stopTrace();
    state.stage = i;
    nodes.forEach((n, j) => n.classList.toggle('active', j === i));
    descEl.textContent = STAGE_DESC[i](state.m);
    descEl.setAttribute('aria-label', `${nodes[i].lastElementChild.textContent} stage`);
  }
  nodes.forEach((n, i) => n.addEventListener('click', () => setStage(i)));
  traceBtn.addEventListener('click', () => {
    if (traceTimer){ stopTrace(); return; }
    stopTrace();
    let i = 0;
    traceLabel.textContent = 'Pause lifecycle';
    traceBtn.setAttribute('aria-pressed', 'true');
    setStage(0, false);
    traceTimer = setInterval(() => {
      if (++i > 4){ stopTrace(); return; }
      setStage(i, false);
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
