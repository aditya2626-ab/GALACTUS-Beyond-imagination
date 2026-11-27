import { modules } from './course-data.js';

const COURSE_KEY = 'galactus-course-v1';
const ARCADE_KEY = 'galactus-arcade-v1';

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(COURSE_KEY));
    if (saved && saved.lessons) {
      return {
        lessons: saved.lessons,
        quizXp: saved.quizXp || {},
        quickXp: saved.quickXp || {},
      };
    }
  } catch { /* first visit */ }
  return { lessons: {}, quizXp: {}, quickXp: {} };
}

export const progress = loadProgress();
export const saveProgress = () => localStorage.setItem(COURSE_KEY, JSON.stringify(progress));

export function peekXp() {
  try {
    const saved = JSON.parse(localStorage.getItem(ARCADE_KEY));
    return saved && typeof saved.xp === 'number' ? saved.xp : 0;
  } catch { return 0; }
}

export function addXp(amount) {
  let store = null;
  try { store = JSON.parse(localStorage.getItem(ARCADE_KEY)); } catch { store = null; }
  if (!store || typeof store.xp !== 'number' || !store.best) store = { xp: 0, best: {} };
  store.xp += Math.round(amount);
  localStorage.setItem(ARCADE_KEY, JSON.stringify(store));
  return store.xp;
}

export function signal(text) {
  let root = document.querySelector('#signal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'signal-root';
    document.body.append(root);
  }
  const toast = document.createElement('p');
  toast.className = 'course-signal';
  toast.textContent = text;
  root.append(toast);
  requestAnimationFrame(() => toast.classList.add('on'));
  setTimeout(() => {
    toast.classList.remove('on');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

export const pad = (n) => `0${n + 1}`.slice(-2);
export const two = (n) => String(n).padStart(2, '0');
export const lessonKey = (module, lesson) => `${module}-${lesson}`;
export const readTime = (topic) => {
  const text = [topic.body, topic.keyIdea, topic.dive, topic.activity, topic.fact, (topic.points || []).join(' ')]
    .filter(Boolean).join(' ');
  return Math.max(2, Math.round(text.split(/\s+/).length / 170));
};
export const doneCount = (module) => modules[module].topics
  .filter((_, lesson) => progress.lessons[lessonKey(module, lesson)]).length;
export const TOTAL_LESSONS = modules.reduce((sum, module) => sum + module.topics.length, 0);
export const TOTAL_XP = modules.reduce((sum, module) => sum + module.topics.length * 12 + module.quiz.length * 5, 0);
const ACCENTS = {
  amber: '#e8b863', gold: '#d9a441', cyan: '#6ec3c8',
  ember: '#d85a3c', violet: '#a896d4', sage: '#bcd49a',
};
export const accentOf = (module) => ACCENTS[modules[module].accent] || ACCENTS.amber;

export const course = {
  activeModule: 0,
  activeLesson: 0,
  quizIndex: 0,
  quizScore: 0,
  quizLocked: false,
  viewIsQuiz: false,
  showLesson: null,
  openQuiz: null,
  updateNav: null,
};
