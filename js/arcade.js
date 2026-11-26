// GALACTUS Arcade — shared store, signals, and the mission hub.
// Progress persists in localStorage on this device.

import { mountGalaxy } from './games/galaxy.js';
import { mountBlackHole } from './games/blackhole.js';
import { mountTelescope } from './games/telescope.js';
import { mountMessier } from './games/messier.js';
import { mountDistance } from './games/distance.js';
import { mountTimeline } from './games/timeline.js';
import { el } from './games/game-data.js';
import { RANKS, levelFromXp, renderRankCard, renderGrid, updateStageBest } from './arcade-ui.js';
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

function openMission(index) {
  const mission = MISSIONS[index];
  if (cleanup) { cleanup(); cleanup = null; }
  grid.querySelectorAll('.mission-card').forEach((card, i) => card.setAttribute('aria-current', i === index));
  stageWrap.hidden = false;
  document.querySelector('#stage-eyebrow').textContent = `MISSION 0${index + 1}`;
  document.querySelector('#stage-name').textContent = mission.title;
  document.querySelector('#stage-tagline').textContent = mission.tagline;
  updateStageBest(mission, store);
  stage.innerHTML = '';
  stageWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  cleanup = mission.mount(stage, {
    addXp,
    setBest: (score) => {
      setBest(mission.id, score);
      updateStageBest(mission, store);
    },
    signal,
  });
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
  renderRankCard(store, MISSIONS);
  renderGrid(grid, MISSIONS, store, openMission);
});
renderRankCard(store, MISSIONS);
renderGrid(grid, MISSIONS, store, openMission);
