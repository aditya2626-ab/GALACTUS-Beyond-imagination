// GALACTUS Arcade — shared store, signals, and the mission hub.
// Progress persists in localStorage on this device.

import { mountGalaxy } from './games/galaxy.js';
import { mountBlackHole } from './games/blackhole.js';
import { mountTelescope } from './games/telescope.js';
import { mountMessier } from './games/messier.js';
import { mountDistance } from './games/distance.js';
import { mountTimeline } from './games/timeline.js';
import { el } from './games/game-data.js';

// ---------- ranks ----------
const RANKS = [
  'Stargazer',
  'Apprentice Astronomer',
  'Sky Navigator',
  'Observatory Keeper',
  'Deep Space Explorer',
  'Master Astronomer',
  'Cosmic Legend',
];

function xpForLevel(level) {
  return (150 * (level - 1) * level) / 2;
}
function levelFromXp(xp) {
  return Math.min(Math.floor((-1 + Math.sqrt(1 + (8 * xp) / 150)) / 2) + 1, RANKS.length);
}

// ---------- persistent store ----------
const KEY = 'galactus-arcade-v1';

const store = load();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && typeof raw.xp === 'number' && raw.best) return raw;
  } catch { /* first visit */ }
  return { xp: 0, best: {} };
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(store));
}

const listeners = new Set();
function emit() {
  listeners.forEach((fn) => fn());
}

function addXp(amount) {
  if (!(amount > 0)) return;
  const before = levelFromXp(store.xp);
  store.xp += Math.round(amount);
  save();
  const after = levelFromXp(store.xp);
  if (after > before) signal(`Rank up — you are now a ${RANKS[after - 1]}`, 'ok', 3600);
  else signal(`+${Math.round(amount)} XP`, 'ok');
  emit();
}

function setBest(id, score) {
  if (!(score > (store.best[id] || 0))) return;
  store.best[id] = score;
  save();
  emit();
}

// ---------- signal toasts ----------
function signal(text, kind = 'ok', ttl = 2600) {
  const root = document.querySelector('#signal-root');
  if (!root) return;
  const toast = el('p', `signal signal-${kind}`, text);
  root.append(toast);
  requestAnimationFrame(() => toast.classList.add('on'));
  setTimeout(() => {
    toast.classList.remove('on');
    setTimeout(() => toast.remove(), 350);
  }, ttl);
}

// ---------- mission registry ----------
const MISSIONS = [
  {
    id: 'galaxy', glyph: '✦', title: 'Galaxy Classifier',
    tagline: 'Sort deep-survey frames into spirals, ellipticals and irregulars — exactly what Galaxy Zoo volunteers did by hand.',
    unit: 'correct', reward: '5 XP per hit · streak bonus', mount: mountGalaxy,
  },
  {
    id: 'blackhole', glyph: '◉', title: 'Black Hole Drop',
    tagline: 'Pilot a probe around a monster black hole. Skim the accretion disk for bonus science — but do not cross the event horizon.',
    unit: 'points', reward: 'XP from mission score', mount: mountBlackHole,
  },
  {
    id: 'telescope', glyph: '⌖', title: 'Telescope Simulator',
    tagline: 'Dial in RA/Dec coordinates, choose a filter and exposure, then capture planets, nebulae and galaxies.',
    unit: 'captures', reward: '50 XP per new capture', mount: mountTelescope,
  },
  {
    id: 'messier', glyph: '✳', title: 'Messier Marathon',
    tagline: 'Hunt nebulae, clusters and galaxies in a timed star-field safari. Wrong clicks cost precious seconds.',
    unit: 'points', reward: '10 XP per find', mount: mountMessier,
  },
  {
    id: 'distance', glyph: '⇢', title: 'Light-Year Estimator',
    tagline: 'Feel the true scale of space: guess distances from the ISS to the deepest galaxies on a logarithmic slider.',
    unit: 'points', reward: 'up to 10 XP per estimate', mount: mountDistance,
  },
  {
    id: 'timeline', glyph: '✷', title: 'Astronomy Through Time',
    tagline: 'Drag discoveries into chronological order, from Eratosthenes measuring Earth to JWST’s first light.',
    unit: 'placements', reward: '6 XP per correct row', mount: mountTimeline,
  },
];

// ---------- hub ----------
const grid = document.querySelector('#mission-grid');
const stageWrap = document.querySelector('#play');
const stage = document.querySelector('#stage');
let cleanup = null;

function renderRankCard() {
  const level = levelFromXp(store.xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(Math.min(level + 1, RANKS.length));
  const pct = Math.min(((store.xp - floor) / (ceiling - floor)) * 100, 100);
  document.querySelector('#rank-name').textContent = RANKS[level - 1];
  document.querySelector('#rank-level').textContent = `RANK ${level} / ${RANKS.length}`;
  document.querySelector('#rank-xp').textContent = `${store.xp} XP TOTAL`;
  const fill = document.querySelector('#xp-fill');
  fill.style.width = `${pct}%`;
  const track = document.querySelector('#xp-track');
  track.setAttribute('aria-valuenow', Math.round(pct));
  document.querySelector('#xp-next').textContent =
    level >= RANKS.length ? 'Top rank reached — legendary.' : `Next rank at ${ceiling} XP`;

  const stats = document.querySelector('#rank-stats');
  stats.innerHTML = '';
  MISSIONS.forEach((mission) => {
    const best = store.best[mission.id];
    const chip = el('span', null, `${mission.glyph} <b>${best ? `${best} ${mission.unit}` : '—'}</b>`);
    chip.title = `${mission.title} best score`;
    stats.append(chip);
  });
}

function renderGrid() {
  grid.innerHTML = '';
  MISSIONS.forEach((mission, index) => {
    const best = store.best[mission.id];
    const card = el('button', 'mission-card');
    card.type = 'button';
    card.innerHTML = `
      <span class="mission-glyph" aria-hidden="true">${mission.glyph}</span>
      <p class="mission-index">MISSION 0${index + 1} · ${mission.reward}</p>
      <h3>${mission.title}</h3>
      <p>${mission.tagline}</p>
      <span class="mission-foot"><span>BEST · <b>${best ? `${best} ${mission.unit}` : '—'}</b></span><span>PLAY →</span></span>`;
    card.addEventListener('click', () => openMission(index));
    grid.append(card);
  });
}

function openMission(index) {
  const mission = MISSIONS[index];
  if (cleanup) { cleanup(); cleanup = null; }
  grid.querySelectorAll('.mission-card').forEach((card, i) => card.setAttribute('aria-current', i === index));
  stageWrap.hidden = false;
  document.querySelector('#stage-eyebrow').textContent = `MISSION 0${index + 1}`;
  document.querySelector('#stage-name').textContent = mission.title;
  document.querySelector('#stage-tagline').textContent = mission.tagline;
  updateStageBest(mission);
  stage.innerHTML = '';
  stageWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  cleanup = mission.mount(stage, {
    addXp,
    setBest: (score) => {
      setBest(mission.id, score);
      updateStageBest(mission);
    },
    signal,
  });
}

function updateStageBest(mission) {
  const best = store.best[mission.id];
  document.querySelector('#stage-best').innerHTML = best
    ? `BEST · <b>${best} ${mission.unit}</b>`
    : 'NO LOGGED RUN YET';
}

function closeMission() {
  if (cleanup) { cleanup(); cleanup = null; }
  stageWrap.hidden = true;
  stage.innerHTML = '';
  grid.querySelectorAll('.mission-card').forEach((card) => card.removeAttribute('aria-current'));
  document.querySelector('#missions').scrollIntoView({ behavior: 'smooth' });
}

document.querySelector('#stage-back').addEventListener('click', closeMission);
document.querySelector('#arcade-reset').addEventListener('click', () => {
  // deliberate double-confirm: progress is irreversible once cleared
  if (!confirm('Reset all XP and best scores? This cannot be undone.')) return;
  store.xp = 0;
  store.best = {};
  save();
  emit();
  signal('Progress reset — fresh skies ahead', 'warn');
});

listeners.add(() => {
  renderRankCard();
  renderGrid();
});
renderRankCard();
renderGrid();
