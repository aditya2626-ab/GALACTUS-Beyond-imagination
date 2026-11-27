// Arcade progress storage and score notifications.
import { el } from './games/game-data.js';
import { RANKS, levelFromXp } from './arcade-ui.js';

const KEY = 'galactus-arcade-v1';

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && Number.isFinite(data.xp) && data.xp >= 0 && data.best && typeof data.best === 'object') {
      return { xp: data.xp, best: data.best };
    }
  } catch { /* first visit or unavailable storage */ }
  return { xp: 0, best: {} };
}

export const store = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); }
  catch { /* play still works when storage is unavailable */ }
}

export function createSignal() {
  return (message, kind = 'ok', ttl = 2600) => {
    const root = document.querySelector('#signal-root');
    if (!root) return;
    const toast = el('p', `signal signal-${kind}`, message);
    root.append(toast);
    requestAnimationFrame(() => toast.classList.add('on'));
    setTimeout(() => {
      toast.classList.remove('on');
      setTimeout(() => toast.remove(), 350);
    }, ttl);
  };
}

export function awardXp(amount, signal, emit) {
  if (!(amount > 0)) return;
  const before = levelFromXp(store.xp);
  store.xp += Math.round(amount);
  save();
  const after = levelFromXp(store.xp);
  if (after > before) signal(`Rank up — you are now a ${RANKS[after - 1]}`, 'ok', 3600);
  else signal(`+${Math.round(amount)} XP`, 'ok');
  emit();
}

export function updateBest(id, score, emit) {
  if (!(score > (store.best[id] || 0))) return;
  store.best[id] = score;
  save();
  emit();
}
