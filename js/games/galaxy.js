// Mission 01 — Galaxy Classifier
// Classify procedurally drawn galaxies: spiral, elliptical or irregular.

import { GALAXY_FACTS, el } from './game-data.js';
import { drawGalaxy } from './galaxy-draw.js';

const TYPES = ['spiral', 'elliptical', 'irregular'];
const ROUNDS = 10;

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
