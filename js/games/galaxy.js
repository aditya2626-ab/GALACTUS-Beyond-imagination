// Mission 01 — Galaxy Classifier
// Classify procedurally drawn galaxies: spiral, elliptical or irregular.

import { GALAXY_FACTS, el, mulberry32 } from './game-data.js';

const TYPES = ['spiral', 'elliptical', 'irregular'];
const ROUNDS = 10;

function drawGalaxy(ctx, type, seed) {
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

function newRound() {
  return {
    type: TYPES[Math.floor(Math.random() * 3)],
    seed: Math.floor(Math.random() * 1e9),
  };
}

export function mountGalaxy(stage, api) {
  let idx = 0;
  let score = 0;
  let streak = 0;
  let round = newRound();

  const top = el('p', 'g-top');
  const track = el('div', 'g-track', '<span></span>');
  const canvas = document.createElement('canvas');
  canvas.width = 340;
  canvas.height = 340;
  canvas.className = 'g-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Unknown galaxy image to classify');
  const frame = el('div', 'mz-target', '<span>SURVEY FRAME</span>');
  frame.style.marginTop = '14px';
  const choices = el('div', 'g-choices');
  const note = el('div', 'g-note');
  note.hidden = true;

  TYPES.forEach((type) => {
    const button = el('button', null, type[0].toUpperCase() + type.slice(1));
    button.type = 'button';
    button.dataset.type = type;
    button.addEventListener('click', () => answer(type));
    choices.append(button);
  });

  const nextButton = el('button', 'button primary');
  nextButton.type = 'button';
  nextButton.addEventListener('click', next);

  stage.append(top, track, canvas, frame, choices, note);

  const ctx = canvas.getContext('2d');

  function paint() {
    top.innerHTML = `ROUND ${String(idx + 1).padStart(2, '0')} / ${ROUNDS} · SCORE <b>${score}</b> · STREAK <b>${streak >= 3 ? `🔥${streak}` : streak}</b>`;
    track.firstElementChild.style.width = `${((idx + (note.hidden ? 0 : 1)) / ROUNDS) * 100}%`;
    drawGalaxy(ctx, round.type, round.seed);
    frame.innerHTML = `<span>SURVEY FRAME #${1000 + idx}</span>`;
  }

  function answer(choice) {
    if (!note.hidden) return;
    choices.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
      if (button.dataset.type === round.type) button.classList.add('right');
      else if (button.dataset.type === choice) button.classList.add('wrong');
    });
    const correct = choice === round.type;
    if (correct) {
      const bonus = streak >= 2 ? 5 : 0;
      score += 1;
      streak += 1;
      api.addXp(5 + bonus);
    } else {
      streak = 0;
    }
    note.innerHTML = `<b>${correct ? 'CORRECT' : `IT WAS A ${round.type.toUpperCase()} GALAXY`}</b> · ${GALAXY_FACTS[round.type]}`;
    nextButton.textContent = idx + 1 >= ROUNDS ? 'See results' : 'Next galaxy';
    note.append(el('div', 'g-actions', ''), nextButton);
    note.hidden = false;
    paint();
  }

  function next() {
    if (idx + 1 >= ROUNDS) {
      api.setBest(score);
      stage.innerHTML = '';
      stage.append(el('div', 'g-center', `
        <p style="font-size:34px;margin:0">✦</p>
        <h3 class="g-title-line">Classification complete</h3>
        <p class="g-sub">You identified <b style="color:var(--amber)">${score} of ${ROUNDS}</b> galaxies correctly. Real survey volunteers classify thousands a week.</p>`), );
      const again = el('button', 'button primary', 'Run another survey ↻');
      again.type = 'button';
      again.addEventListener('click', () => {
        idx = 0; score = 0; streak = 0; round = newRound();
        note.hidden = true;
        stage.innerHTML = '';
        stage.append(top, track, canvas, frame, choices, note);
        paint();
      });
      stage.lastElementChild.append(again);
      return;
    }
    idx += 1;
    round = newRound();
    note.hidden = true;
    note.innerHTML = '';
    choices.querySelectorAll('button').forEach((button) => {
      button.disabled = false;
      button.classList.remove('right', 'wrong');
    });
    paint();
  }

  paint();
  return () => {};
}
