// Mission 02 — Black Hole Drop
// Pilot a probe on real 1/r² gravity. Collect science pods, skim the disk, survive.

import { el } from './game-data.js';
import { WORLD, initState } from './blackhole-state.js';
import { drawScene } from './blackhole-render.js';
import { advanceProbe } from './blackhole-physics.js';
import { bindBlackHoleControls } from './blackhole-input.js';

export function mountBlackHole(stage, api) {
  const hud = el('div', 'bh-hud');
  const canvas = document.createElement('canvas');
  canvas.width = WORLD.W;
  canvas.height = WORLD.H;
  canvas.className = 'g-canvas bh-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Black hole flight simulator');
  canvas.style.maxWidth = '660px';
  const hint = el('p', 'bh-hint', 'TOUCH · drag on the field to steer  /  KEYBOARD · WASD or arrow keys  /  collect green science pods');
  const over = el('div', 'bh-over');
  over.hidden = true;

  const startButton = el('button', 'button primary', 'Begin descent ↘');
  startButton.type = 'button';

  const intro = el('div', 'g-center', `
    <p style="font-size:34px;margin:0">◉</p>
    <h3 class="g-title-line">Black Hole Drop</h3>
    <p class="g-sub">Your probe starts in a decaying orbit. Gravity follows the same 1/r² law Newton published in 1687 — thrust to fight it, gather science pods, and see how long you last.</p>`);
  const introActions = el('div', 'g-actions');
  introActions.append(startButton);
  intro.append(introActions);

  stage.append(hud, canvas, hint, intro, over);

  const ctx = canvas.getContext('2d');
  const state = initState();
  const controls = bindBlackHoleControls(canvas);
  const { keys } = controls;
  let raf = 0;
  let last = 0;
  let running = false;

  // HUD (hidden until first frame)
  function paintHud() {
    hud.innerHTML = `
      <span>SCORE <b>${Math.round(state.score)}</b></span>
      <span>TIME <b>${state.time.toFixed(0)}S</b></span>
      <span>HULL</span>
      <span class="bh-hull"><span class="${state.hull < 40 ? 'low' : ''}" style="width:${Math.max(state.hull, 0)}%"></span></span>
      <span>${state.alert ? '<i class="bh-alert">PROXIMITY ALERT</i>' : 'NOMINAL'}</span>`;
  }

  function endGame(cause) {
    state.over = true;
    running = false;
    const score = Math.round(state.score);
    const xp = Math.floor(state.score / 8);
    if (xp > 0) api.addXp(xp);
    api.setBest(score);
    over.innerHTML = `
      <p class="g-title-line">${cause === 'hull' ? 'Hull integrity lost' : 'Crossed the event horizon'}</p>
      <p class="g-sub" style="margin:8px auto 0">${cause === 'hull'
        ? 'The disk stripped the probe apart. Skimming pays, but hull plating is finite.'
        : 'Nothing escapes inside the event horizon — not even light. The probe is now part of the singularity.'}</p>
      <p class="bh-hint" style="margin-top:10px">FINAL SCORE <b style="color:var(--amber)">${score}</b> · SURVIVED ${state.time.toFixed(1)}S · +${xp} XP</p>`;
    const again = el('button', 'button primary', 'Fly again ↻');
    again.type = 'button';
    again.addEventListener('click', () => { reset(); });
    over.append(again);
    over.hidden = false;
    hint.hidden = true;
  }

  function step(now) {
    if (!running) return;
    controls.update(state);
    const result = advanceProbe(now, last, state, keys, api, WORLD);
    last = now;
    paintHud();
    drawScene(ctx, state, keys, now, WORLD);
    if (result.cause) { endGame(result.cause); return; }
    raf = requestAnimationFrame(step);
  }

  function reset() {
    Object.assign(state, initState());
    over.hidden = true;
    over.innerHTML = '';
    controls.reset();
    hint.hidden = false;
    paintHud();
    running = true;
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  startButton.addEventListener('click', reset);
  paintHud();
  drawScene(ctx, state, keys, performance.now(), WORLD);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    controls.destroy();
  };
}
