import { modules } from './course-data.js';
import { firstUnread } from './course-navigation.js';
import {
  course, progress, saveProgress, peekXp, addXp, signal,
  pad, two, lessonKey, readTime, doneCount, TOTAL_LESSONS, accentOf,
} from './course-state.js';

const ring = (done, total, m) => {
  const r = 20, c = 2 * Math.PI * r;
  const off = (c * (1 - (total ? done / total : 0))).toFixed(1);
  return `<svg class="banner-ring" viewBox="0 0 52 52" width="54" height="54" aria-hidden="true">
    <circle cx="26" cy="26" r="${r}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="3"></circle>
    <circle class="ring-fg" cx="26" cy="26" r="${r}" fill="none" stroke="${accentOf(m)}" stroke-width="3" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off}" transform="rotate(-90 26 26)"></circle>
    <text x="26" y="29.5" text-anchor="middle" fill="#f4f5f3" font-size="11" font-family="DM Mono,monospace">${done}/${total}</text></svg>`;
};
export const banner = (module, m) => {
  const total = module.topics.length, done = doneCount(m);
  const moduleXp = total * 12 + module.quiz.length * 5;
  return `<div class="module-banner"><img src="assets/${module.image}" alt="">
    <div class="banner-side">${ring(done, total, m)}<div class="banner-chips"><span>${total} LESSONS</span><span>+${moduleXp} XP</span></div></div>
    <div class="module-banner-copy"><p class="eyebrow">MODULE ${pad(m)} / ${module.subtitle}</p>
    <h3>${module.title}</h3><p>${module.intro}</p></div></div>`;
};
export const stepper = (module, quizCurrent) => `<div class="lesson-stepper">
  <button class="step-arrow" data-step="-1" type="button" aria-label="Previous lesson"${course.activeLesson === 0 && !quizCurrent ? ' disabled' : ''}>←</button>
  <div class="lesson-tabs">${module.topics.map((_, l) =>
    `<button class="lesson-tab${!quizCurrent && l === course.activeLesson ? ' current' : ''}${progress.lessons[lessonKey(course.activeModule, l)] ? ' done' : ''}" data-lesson="${l}" type="button" title="${module.topics[l].title}">${pad(l)}</button>`).join('')}
    <button class="lesson-tab quiz-tab${quizCurrent ? ' current' : ''}" data-quiz="1" type="button" title="Module check">✓</button></div>
  <button class="step-arrow" data-step="1" type="button" aria-label="Next lesson"${quizCurrent || course.activeLesson === module.topics.length - 1 ? ' disabled' : ''}>→</button>
  <span class="lesson-meta">${quizCurrent ? 'MODULE CHECK · USE THE ARROW TABS' : `LESSON ${pad(course.activeLesson)} OF ${two(module.topics.length)} · ~${readTime(module.topics[course.activeLesson])} MIN READ · ARROW KEYS TO FLIP`}</span></div>`;

export function showLesson() {
  course.viewIsQuiz = false;
  course.quizIndex = 0; course.quizScore = 0; course.quizLocked = false;
  const module = modules[course.activeModule];
  const topic = module.topics[course.activeLesson];
  const done = progress.lessons[lessonKey(course.activeModule, course.activeLesson)];
  const isLast = course.activeLesson === module.topics.length - 1;
  const label = done ? (isLast ? 'GO TO MODULE CHECK →' : '✓ COMPLETED') : 'MARK AS READ · +10 XP';
  const points = topic.points ? `<ul class="lesson-points">${topic.points.map((point) => `<li>${point}</li>`).join('')}</ul>` : '';
  const dive = topic.dive ? `<div class="lesson-dive"><button class="dive-btn" data-dive="1" type="button" aria-expanded="false">DEEP DIVE — GO FURTHER<i>+</i></button><div class="dive-body" hidden><p>${topic.dive}</p></div></div>` : '';
  const activity = topic.activity ? `<div class="lesson-try"><p class="aside-eyebrow">TRY THIS</p><p>${topic.activity}</p></div>` : '';
  const fact = topic.fact ? `<div class="aside-card note"><p class="aside-eyebrow">FIELD NOTE</p><p>${topic.fact}</p></div>` : '';
  const terms = topic.terms ? `<div class="aside-card terms"><p class="aside-eyebrow">NEW TERMS · TAP TO OPEN</p>${topic.terms.map(([term, def], i) =>
    `<div class="term"><button class="term-btn" data-term="${i}" type="button" aria-expanded="false"><i>+</i>${term}</button><p class="term-def" hidden>${def}</p></div>`).join('')}</div>` : '';
  const quick = topic.quick ? `<div class="aside-card quick"><p class="aside-eyebrow">30-SECOND CHECK · +2 XP</p>
    <p class="quick-q">${topic.quick.q}</p>
    <div class="quick-opts">${topic.quick.options.map((option, i) => `<button type="button" data-qopt="${i}">${option}</button>`).join('')}</div>
    <p class="activity-feedback" hidden></p></div>` : '';
  course.content.innerHTML = banner(module, course.activeModule) + stepper(module, false) + `
    <div class="lesson-grid">
      <section class="topic-card lesson-main">
        <h4>${topic.title}</h4>
        <p class="key-idea"><b>KEY IDEA</b>${topic.keyIdea || ''}</p>
        <p class="lesson-body">${topic.body}</p>
        ${points}${dive}${activity}
        <div class="lesson-foot"><button class="mark-btn${done && isLast ? ' to-check' : ''}" data-mark="1" type="button"${done && !isLast ? ' disabled' : ''}>${label}</button>${done ? '<span class="lesson-logged">LOGGED ON THIS DEVICE</span>' : ''}</div>
      </section>
      <aside class="lesson-aside">${fact}${terms}${quick}</aside>
    </div>`;
  course.updateNav();
  course.content.scrollTop = 0;
}

export function markLesson() {
  const key = lessonKey(course.activeModule, course.activeLesson);
  if (!progress.lessons[key]) {
    progress.lessons[key] = true;
    saveProgress();
    signal(`+10 XP — lesson logged · ${addXp(10)} XP total`);
    if (course.continueBtn) course.continueBtn.innerHTML = firstUnread() ? course.continueBtn.innerHTML.replace(/module \d\d/, `module ${pad(firstUnread()[0])}`) : 'Course complete — review <span>↓</span>';
  }
  const totalDone = modules.reduce((n, _, m) => n + doneCount(m), 0);
  if (totalDone === TOTAL_LESSONS) setTimeout(() => signal(`ALL ${TOTAL_LESSONS} LESSONS LOGGED — COURSE COMPLETE`), 400);
  if (course.activeLesson < modules[course.activeModule].topics.length - 1) { course.activeLesson++; course.showLesson(); }
  else course.openQuiz();
}

