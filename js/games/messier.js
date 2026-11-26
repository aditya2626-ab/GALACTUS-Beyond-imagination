// Mission 04 — Messier Marathon
// Timed deep-sky safari: click the named object hidden in the star field.

import { MESSIER_TARGETS, el } from './game-data.js';
import { makeSky, render } from './messier-render.js';

const W = 640;
const H = 440;
const ROUND_TIME = 25;
const ROUNDS = 8;

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
        showNote(`TIME! ${target.catalog} ${target.name} was still hiding in the field.`, true);
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
