// Mission 06 — Astronomy Through Time
// Drag discoveries into chronological order. Up/down buttons keep it mobile-friendly.

import { TIMELINE_EVENTS, el, shuffle } from './game-data.js';

const ROUNDS = 4;
const PER_ROUND = 5;

export function mountTimeline(stage, api) {
  let round = 0;
  let score = 0;
  let items = [];
  let checked = false;
  let dragId = null;

  const top = el('p', 'g-top');
  const track = el('div', 'g-track', '<span class="cyan"></span>');
  const hint = el('p', 'tl-hint', 'OLDEST ↑ · NEWEST ↓ — DRAG THE ROWS, OR USE THE ARROWS');
  const list = el('div', 'tl-list');
  const actions = el('div', 'g-actions');
  stage.append(top, track, hint, list, actions);

  function correctOrder() {
    return [...items].sort((a, b) => a.year - b.year);
  }

  function paint() {
    const order = correctOrder();
    top.innerHTML = `ERA ${Math.max(round, 1)} / ${ROUNDS} · CORRECT PLACEMENTS <b>${score}</b>`;
    track.firstElementChild.style.width = `${((round + (checked ? 1 : 0)) / ROUNDS) * 100}%`;
    list.innerHTML = '';
    items.forEach((ev, i) => {
      const row = el('article', 'tl-row');
      row.dataset.id = ev.id;
      row.draggable = !checked;
      const correct = checked && ev.id === order[i].id;
      if (checked) row.classList.add(correct ? 'right' : 'wrong');
      row.innerHTML = `
        <button class="tl-grip" type="button" aria-label="Drag to reorder: ${ev.event}">⋮⋮</button>
        <div class="tl-text"><b>${ev.event}</b>${checked ? `<span>${ev.scientist} · ${ev.yearLabel} — ${ev.detail}</span>` : ''}</div>
        ${checked ? `<span class="tl-mark ${correct ? 'right' : 'wrong'}">${correct ? '✓' : '✗'}</span>` : ''}
        <span class="tl-move">
          <button type="button" data-move="up" aria-label="Move up" ${checked || i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" data-move="down" aria-label="Move down" ${checked || i === items.length - 1 ? 'disabled' : ''}>↓</button>
        </span>`;
      row.querySelector('.tl-grip').addEventListener('pointerdown', (event) => {
        if (checked) return;
        dragId = ev.id;
        row.classList.add('dragging');
        try { event.dataTransfer.setData('text/plain', ev.id); } catch { /* drag not available */ }
      });
      row.addEventListener('pointerup', () => { dragId = null; row.classList.remove('dragging'); });
      row.addEventListener('dragstart', (event) => {
        dragId = ev.id;
        row.classList.add('dragging');
        event.dataTransfer.setData('text/plain', ev.id);
      });
      row.addEventListener('dragend', () => { dragId = null; row.classList.remove('dragging'); });
      row.addEventListener('dragover', (event) => {
        if (!dragId || dragId === ev.id) return;
        event.preventDefault();
        row.classList.add('over');
      });
      row.addEventListener('dragleave', () => row.classList.remove('over'));
      row.addEventListener('drop', (event) => {
        event.preventDefault();
        row.classList.remove('over');
        if (!dragId || dragId === ev.id) return;
        const from = items.findIndex((x) => x.id === dragId);
        const to = items.findIndex((x) => x.id === ev.id);
        items.splice(to, 0, items.splice(from, 1)[0]);
        dragId = null;
        paint();
      });
      row.querySelectorAll('[data-move]').forEach((button) => {
        button.addEventListener('click', () => {
          const dir = button.dataset.move === 'up' ? -1 : 1;
          move(ev.id, dir);
        });
      });
      list.append(row);
    });
  }

  function move(id, dir) {
    const i = items.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    items.splice(j, 0, items.splice(i, 1)[0]);
    paint();
  }

  function newRound(n) {
    round = n;
    checked = false;
    items = shuffle(TIMELINE_EVENTS).slice(0, PER_ROUND);
    actions.innerHTML = '';
    const check = el('button', 'button primary', 'Check my timeline');
    check.type = 'button';
    check.addEventListener('click', checkOrder);
    actions.append(check);
    paint();
  }

  function checkOrder() {
    checked = true;
    const order = correctOrder();
    const correct = items.filter((ev, i) => ev.id === order[i].id).length;
    score += correct;
    api.addXp(correct * 6);
    if (correct === PER_ROUND) api.signal(`Perfect timeline · +${correct * 6} XP`, 'ok', 2800);
    else api.signal(`${correct} of ${PER_ROUND} rows in the right era`, 'warn', 2800);
    paint();
    actions.innerHTML = '';
    const next = el('button', 'button primary', round >= ROUNDS ? 'See results' : 'Next era →');
    next.type = 'button';
    next.addEventListener('click', () => {
      if (round >= ROUNDS) finish();
      else newRound(round + 1);
    });
    actions.append(next);
  }

  function finish() {
    api.setBest(score);
    stage.innerHTML = '';
    const center = el('div', 'g-center', `
      <p style="font-size:34px;margin:0">✷</p>
      <h3 class="g-title-line">Journey through time complete</h3>
      <p class="g-sub">You placed <b style="color:var(--amber)">${score} of ${ROUNDS * PER_ROUND}</b> discoveries in the correct order. Astronomy is one long relay race of better eyes.</p>`);
    const again = el('button', 'button primary', 'Travel again ↻');
    again.type = 'button';
    again.addEventListener('click', () => {
      score = 0;
      stage.innerHTML = '';
      stage.append(top, track, hint, list, actions);
      newRound(1);
    });
    center.append(again);
    stage.append(center);
  }

  newRound(1);
  return () => {};
}
