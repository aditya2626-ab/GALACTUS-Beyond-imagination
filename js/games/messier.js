// Mission 04 — Messier Marathon
// Timed deep-sky safari: click the named object hidden in the star field.

import { MESSIER_TARGETS, el, hash, rngFrom } from './game-data.js';

const W = 640;
const H = 440;
const ROUND_TIME = 25;
const ROUNDS = 8;

function drawObject(ctx, o) {
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

function render(ctx, objects, stars, revealAll) {
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

function makeSky(target) {
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

export function mountMessier(stage, api) {
  let round = 0;
  let score = 0;
  let timeLeft = ROUND_TIME;
  let hunting = false;
  let target = null;
  const objects = [];
  let stars = [];
  let tick = null;

  const top = el('p', 'g-top');
  const track = el('div', 'g-track', '<span class="cyan"></span>');
  const announce = el('div', 'mz-target');
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.className = 'g-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Star field — click the target object');
  canvas.style.maxWidth = '660px';
  canvas.style.cursor = 'crosshair';
  const note = el('div', 'g-note');
  note.hidden = true;
  stage.append(top, track, announce, canvas, note);

  const ctx = canvas.getContext('2d');

  function paintTop() {
    top.innerHTML = `ROUND ${String(Math.max(round, 1)).padStart(2, '0')} / ${ROUNDS} · <b>${timeLeft}S</b> ON THE CLOCK · SCORE <b>${score}</b>`;
    track.firstElementChild.style.width = `${(timeLeft / ROUND_TIME) * 100}%`;
  }

  function newRound(n) {
    round = n;
    target = MESSIER_TARGETS[Math.floor(Math.random() * MESSIER_TARGETS.length)];
    const sky = makeSky(target);
    objects.length = 0;
    sky.objects.forEach((o) => objects.push(o));
    stars = sky.stars;
    timeLeft = ROUND_TIME;
    hunting = true;
    note.hidden = true;
    announce.innerHTML = `<span>FIND: ${target.catalog} — ${target.name.toUpperCase()}</span>`;
    render(ctx, objects, stars, false);
    paintTop();
    clearInterval(tick);
    tick = setInterval(() => {
      if (!hunting) return;
      timeLeft -= 1;
      paintTop();
      if (timeLeft <= 0) {
        hunting = false;
        render(ctx, objects, stars, true);
        showNote(`TIME! ${target.catalog} ${target.name} was still hiding in the field.`, false);
      }
    }, 1000);
  }

  function showNote(text, withNext) {
    note.innerHTML = `<b>${text}</b>${target ? target.fact : ''}`;
    note.hidden = false;
    if (withNext) {
      const nextButton = el('button', 'button primary', round >= ROUNDS ? 'See results' : 'Next field →');
      nextButton.type = 'button';
      nextButton.style.marginTop = '12px';
      nextButton.addEventListener('click', () => {
        if (round >= ROUNDS) finish();
        else newRound(round + 1);
      });
      note.append(nextButton);
    }
  }

  function finish() {
    clearInterval(tick);
    api.setBest(score);
    stage.innerHTML = '';
    const center = el('div', 'g-center', `
      <p style="font-size:34px;margin:0">✳</p>
      <h3 class="g-title-line">Marathon complete</h3>
      <p class="g-sub">Final score <b style="color:var(--amber)">${score}</b> points. Charles Messier catalogued 110 fuzzy objects that are <i>not</i> comets — comet hunters still curse his list today.</p>`);
    const again = el('button', 'button primary', 'Run it again ↻');
    again.type = 'button';
    again.addEventListener('click', () => {
      round = 0;
      score = 0;
      stage.innerHTML = '';
      stage.append(top, track, announce, canvas, note);
      newRound(1);
    });
    center.append(again);
    stage.append(center);
  }

  canvas.addEventListener('click', (event) => {
    if (!hunting || !target) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    const hit = objects.find((o) => Math.hypot(o.x - x, o.y - y) < o.size * 2);
    if (!hit) {
      api.signal('Missed — that is a bare star field · −3s', 'bad', 1600);
      timeLeft = Math.max(timeLeft - 3, 0);
      paintTop();
      return;
    }
    hunting = false;
    render(ctx, objects, stars, true);
    if (hit.id === target.id) {
      const gained = 100 + Math.round(timeLeft * 8);
      score += gained;
      api.addXp(10);
      api.signal(`Found ${hit.name}! +${gained} points`, 'ok', 2400);
    } else {
      timeLeft = Math.max(timeLeft - 5, 0);
      api.signal(`That is ${hit.catalog} ${hit.name} — not ${target.name} · −5s`, 'bad', 2600);
    }
    paintTop();
    showNote(`${target.catalog} ${target.name}: `, true);
  });

  stage.append();
  newRound(1);

  return () => {
    clearInterval(tick);
  };
}
