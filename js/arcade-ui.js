import { el } from './games/game-data.js';

// ---------- ranks ----------
export const RANKS = [
  'Stargazer',
  'Apprentice Astronomer',
  'Sky Navigator',
  'Observatory Keeper',
  'Deep Space Explorer',
  'Master Astronomer',
  'Cosmic Legend',
];

export function xpForLevel(level) {
  return (150 * (level - 1) * level) / 2;
}
export function levelFromXp(xp) {
  return Math.min(Math.floor((-1 + Math.sqrt(1 + (8 * xp) / 150)) / 2) + 1, RANKS.length);
}

export function renderRankCard(store, MISSIONS) {
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

export function renderGrid(grid, MISSIONS, store, openMission) {
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

export function updateStageBest(mission, store) {
  const best = store.best[mission.id];
  document.querySelector('#stage-best').innerHTML = best
    ? `BEST · <b>${best} ${mission.unit}</b>`
    : 'NO LOGGED RUN YET';
}

