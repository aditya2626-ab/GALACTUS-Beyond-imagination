// Mission 02 — Black Hole Drop
// Pilot a probe on real 1/r² gravity. Collect science pods, skim the disk, survive.

import { el } from './game-data.js';

const W = 640;
const H = 440;
const CX = W / 2;
const CY = H / 2;
const HORIZON_R = 34;
const DANGER_R = 118;
const GRAVITY = 26000;
const THRUST = 160;
const START_ORBIT_R = 180;

function spawnPod() {
  const angle = Math.random() * Math.PI * 2;
  const r = DANGER_R + 25 + Math.random() * 90;
  return { x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r * 0.9, collected: false, phase: Math.random() * 6 };
}

function initState() {
  const a = Math.random() * Math.PI * 2;
  const v = Math.sqrt((GRAVITY / START_ORBIT_R) * 0.92);
  return {
    px: CX + Math.cos(a) * START_ORBIT_R,
    py: CY + Math.sin(a) * START_ORBIT_R * 0.9,
    vx: -Math.sin(a) * v,
    vy: Math.cos(a) * v,
    hull: 100,
    score: 0,
    time: 0,
    over: false,
    pods: [spawnPod(), spawnPod(), spawnPod()],
    alert: false,
  };
}

export function mountBlackHole(stage, api) {
  const hud = el('div', 'bh-hud');
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.className = 'g-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Black hole flight simulator');
  canvas.style.maxWidth = '660px';
  const pad = el('div', 'bh-pad');
  const hint = el('p', 'bh-hint', 'Arrow keys / WASD to thrust · collect green science pods · the closer you skim the disk, the more data you gather');
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

  stage.append(hud, canvas, pad, hint, intro, over);

  const ctx = canvas.getContext('2d');
  const state = initState();
  const keys = { up: false, down: false, left: false, right: false };
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

  function paintPad() {
    pad.innerHTML = '';
    const defs = [
      ['up', '↑', 'Thrust up'], ['left', '←', 'Thrust left'], ['down', '↓', 'Thrust down'], ['right', '→', 'Thrust right'],
    ];
    defs.forEach(([key, glyph, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = key === 'up' ? 'bh-up' : '';
      button.textContent = glyph;
      button.setAttribute('aria-label', label);
      button.addEventListener('pointerdown', (event) => { event.preventDefault(); keys[key] = true; });
      button.addEventListener('pointerup', () => { keys[key] = false; });
      button.addEventListener('pointerleave', () => { keys[key] = false; });
      pad.append(button);
    });
  }
  paintPad();

  const keymap = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  };
  const onKeyDown = (event) => {
    const key = keymap[event.key];
    if (key) { keys[key] = true; event.preventDefault(); }
  };
  const onKeyUp = (event) => {
    const key = keymap[event.key];
    if (key) keys[key] = false;
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function drawScene(now) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.08 + ((i * 37) % 50) / 100})`;
      ctx.fillRect((i * 97 + 31) % W, (i * 173 + 61) % H, 1.4, 1.4);
    }
    const disk = ctx.createRadialGradient(CX, CY, HORIZON_R, CX, CY, DANGER_R);
    disk.addColorStop(0, 'rgba(255,170,60,.85)');
    disk.addColorStop(0.45, 'rgba(255,110,60,.4)');
    disk.addColorStop(1, 'rgba(180,60,220,0)');
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.ellipse(CX, CY, DANGER_R, DANGER_R * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(CX, CY);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(255,200,120,${0.14 - i * 0.02})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, HORIZON_R + 14 + i * 16, (HORIZON_R + 14 + i * 16) * 0.6, now / 9000 + i, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(CX, CY, HORIZON_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,170,.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, HORIZON_R + 2, 0, Math.PI * 2);
    ctx.stroke();

    for (const pod of state.pods) {
      if (pod.collected) continue;
      const pulse = 3 + Math.sin(pod.phase) * 1.5;
      ctx.fillStyle = 'rgba(90,240,190,.9)';
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, pulse + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(90,240,190,.25)';
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, pulse + 9, 0, Math.PI * 2);
      ctx.fill();
    }

    const angle = Math.atan2(state.vy, state.vx);
    ctx.save();
    ctx.translate(state.px, state.py);
    ctx.rotate(angle);
    ctx.fillStyle = state.alert ? '#ff5470' : '#f5f5f5';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-7, 6);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, -6);
    ctx.closePath();
    ctx.fill();
    if (keys.up || keys.down || keys.left || keys.right) {
      ctx.fillStyle = 'rgba(255,180,80,.9)';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-14 - Math.random() * 6, 0);
      ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    if (state.alert) {
      ctx.strokeStyle = `rgba(255,80,100,${0.4 + Math.sin(now / 90) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(state.px, state.py, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
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
    pad.hidden = true;
    hint.hidden = true;
  }

  function step(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    let tx = 0;
    let ty = 0;
    if (keys.up) ty -= THRUST;
    if (keys.down) ty += THRUST;
    if (keys.left) tx -= THRUST;
    if (keys.right) tx += THRUST;

    const dx = CX - state.px;
    const dy = CY - state.py;
    const r = Math.max(Math.hypot(dx, dy), 20);
    const g = GRAVITY / (r * r);
    state.vx += (dx / r) * g * dt + tx * dt;
    state.vy += (dy / r) * g * dt + ty * dt;
    state.px += state.vx * dt;
    state.py += state.vy * dt;

    const margin = 12;
    if (state.px < margin) { state.px = margin; state.vx = Math.abs(state.vx) * 0.6; }
    if (state.px > W - margin) { state.px = W - margin; state.vx = -Math.abs(state.vx) * 0.6; }
    if (state.py < margin) { state.py = margin; state.vy = Math.abs(state.vy) * 0.6; }
    if (state.py > H - margin) { state.py = H - margin; state.vy = -Math.abs(state.vy) * 0.6; }

    state.time += dt;
    state.score += dt * 10;
    state.alert = r < DANGER_R;
    if (state.alert) {
      const depth = 1 - (r - HORIZON_R) / (DANGER_R - HORIZON_R);
      state.hull -= (12 + depth * 55) * dt;
      state.score += depth * dt * 60;
    }
    for (const pod of state.pods) {
      pod.phase += dt * 3;
      if (!pod.collected && Math.hypot(pod.x - state.px, pod.y - state.py) < 16) {
        pod.collected = true;
        state.score += 100;
        state.pods.push(spawnPod());
        api.signal('Science pod secured +100', 'ok', 1600);
      }
    }
    if (state.pods.filter((p) => !p.collected).length < 3) state.pods.push(spawnPod());

    paintHud();
    drawScene(now);

    if (r <= HORIZON_R + 4) { endGame('horizon'); return; }
    if (state.hull <= 0) { state.hull = 0; endGame('hull'); return; }
    raf = requestAnimationFrame(step);
  }

  function reset() {
    Object.assign(state, initState());
    over.hidden = true;
    over.innerHTML = '';
    pad.hidden = false;
    hint.hidden = false;
    paintHud();
    running = true;
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  startButton.addEventListener('click', reset);
  paintHud();
  drawScene(performance.now());

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
}
