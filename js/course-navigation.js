import { modules } from './course-data.js';
import {
  course, progress, peekXp, pad, two, lessonKey, readTime,
  doneCount, TOTAL_LESSONS, TOTAL_XP, accentOf,
} from './course-state.js';

function renderIndex() {
  const root = course.indexRoot;
  if (!root) return;
  const rows = modules.map((module, index) => {
    const total = module.topics.length;
    const done = doneCount(index);
    return `<button class="ci-row${done === total ? ' ci-done' : ''}" data-goto="${index}" type="button">
      <b>${pad(index)}</b><span>${module.title}</span><em>${done}/${total}</em></button>`;
  }).join('');
  root.innerHTML = `<p class="ci-head">COURSE INDEX · LIVE</p>${rows}
    <p class="ci-foot"><span>XP BANK · SHARED WITH ARCADE</span><b>${peekXp()} XP</b></p>`;
}

function renderStrip() {
  const done = modules.reduce((sum, _, index) => sum + doneCount(index), 0);
  const pct = Math.round((done / TOTAL_LESSONS) * 100);
  const complete = done === TOTAL_LESSONS;
  course.strip.innerHTML = `<span class="cp-bar"><i style="width:${pct}%"></i></span><b>${done}/${TOTAL_LESSONS}</b> LESSONS · ${pct}% COURSE · <b>${peekXp()} XP</b>${complete ? ' · <em>COURSE COMPLETE</em>' : ''}`;
  course.strip.classList.toggle('all-done', complete);
}

export function updateNav() {
  course.nav.querySelectorAll('button').forEach((button, index) => {
    button.setAttribute('aria-current', index === course.activeModule);
    const total = modules[index].topics.length;
    const done = doneCount(index);
    const count = button.querySelector(`[data-count="${index}"]`);
    count.textContent = `${done}/${total}`;
    count.classList.toggle('complete', done === total);
    const pct = (done / total) * 100;
    button.querySelector(`[data-bar="${index}"]`).style.background =
      `linear-gradient(90deg,var(--amber) ${pct}%,rgba(255,255,255,.08) ${pct}%)`;
    button.classList.toggle('module-complete', done === total);
  });
  renderIndex();
  renderStrip();
}

export function firstUnread() {
  for (let module = 0; module < modules.length; module++) {
    const lesson = modules[module].topics.findIndex((_, index) =>
      !progress.lessons[lessonKey(module, index)]);
    if (lesson !== -1) return [module, lesson];
  }
  return null;
}

export function initNavigation() {
  const statsRoot = document.querySelector('#hero-stats');
  if (statsRoot) {
    const totalMinutes = modules.reduce((sum, module) =>
      sum + module.topics.reduce((minutes, topic) => minutes + readTime(topic), 0), 0);
    statsRoot.innerHTML = [
      [two(modules.length), 'MODULES'],
      [two(TOTAL_LESSONS), 'LESSONS'],
      [`~${totalMinutes}`, 'MIN TO READ'],
      [String(TOTAL_XP), 'XP ON OFFER'],
    ].map(([value, label]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`).join('');
  }

  course.indexRoot = document.querySelector('#course-index');
  course.indexRoot?.addEventListener('click', (event) => {
    const row = event.target.closest('[data-goto]');
    if (!row) return;
    course.activeModule = Number(row.dataset.goto);
    course.activeLesson = 0;
    course.showLesson();
  });

  course.continueBtn = document.querySelector('#continue-btn');
  if (course.continueBtn) {
    const paintResume = () => {
      const target = firstUnread();
      course.continueBtn.innerHTML = target
        ? `Resume · module ${pad(target[0])} <span>↓</span>`
        : 'Course complete — review <span>↓</span>';
    };
    paintResume();
    course.continueBtn.addEventListener('click', () => {
      const target = firstUnread();
      if (target) [course.activeModule, course.activeLesson] = target;
      course.showLesson();
    });
  }

  course.nav = document.querySelector('#module-nav');
  course.content = document.querySelector('#module-content');
  course.strip = document.querySelector('#course-progress');
  modules.forEach((module, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span class="nav-top"><span><i class="nav-dot" style="background:${accentOf(index)}"></i>MODULE ${pad(index)}</span><b class="nav-count" data-count="${index}"></b></span>${module.title}<i class="nav-bar" data-bar="${index}"></i>`;
    button.addEventListener('click', () => {
      course.activeModule = index;
      course.activeLesson = 0;
      course.showLesson();
    });
    course.nav.append(button);
  });
}
