import { modules } from './course-data.js';
import { tasks } from './data.js';

// ---------- stores: course progress on this device + shared arcade XP ----------
const CKEY = 'galactus-course-v1';
const XKEY = 'galactus-arcade-v1';
function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(CKEY));
    if (raw && raw.lessons) return { lessons: raw.lessons, quizXp: raw.quizXp || {}, quickXp: raw.quickXp || {} };
  } catch { /* first visit */ }
  return { lessons: {}, quizXp: {}, quickXp: {} };
}
const progress = loadProgress();
const saveProgress = () => localStorage.setItem(CKEY, JSON.stringify(progress));
function peekXp() {
  try {
    const raw = JSON.parse(localStorage.getItem(XKEY));
    return raw && typeof raw.xp === 'number' ? raw.xp : 0;
  } catch { return 0; }
}
function addXp(amount) {
  let store = null;
  try { store = JSON.parse(localStorage.getItem(XKEY)); } catch { store = null; }
  if (!store || typeof store.xp !== 'number' || !store.best) store = { xp: 0, best: {} };
  store.xp += Math.round(amount);
  localStorage.setItem(XKEY, JSON.stringify(store));
  return store.xp;
}
function signal(text) {
  let root = document.querySelector('#signal-root');
  if (!root) { root = document.createElement('div'); root.id = 'signal-root'; document.body.append(root); }
  const toast = document.createElement('p');
  toast.className = 'course-signal';
  toast.textContent = text;
  root.append(toast);
  requestAnimationFrame(() => toast.classList.add('on'));
  setTimeout(() => { toast.classList.remove('on'); setTimeout(() => toast.remove(), 350); }, 2800);
}

// ---------- helpers ----------
const pad = (n) => `0${n + 1}`.slice(-2);
const two = (n) => String(n).padStart(2, '0');
const lessonKey = (m, l) => `${m}-${l}`;
const readTime = (topic) => {
  const text = [topic.body, topic.keyIdea, topic.dive, topic.activity, topic.fact, (topic.points || []).join(' ')]
    .filter(Boolean).join(' ');
  return Math.max(2, Math.round(text.split(/\s+/).length / 170));
};
const doneCount = (m) => modules[m].topics.filter((_, l) => progress.lessons[lessonKey(m, l)]).length;
const TOTAL_LESSONS = modules.reduce((n, module) => n + module.topics.length, 0);
const TOTAL_CHECKS = modules.reduce((n, module) => n + module.quiz.length, 0);
const TOTAL_XP = modules.reduce((n, module) => n + module.topics.length * 12 + module.quiz.length * 5, 0);
const ACCENTS = { amber: '#e8b863', gold: '#d9a441', cyan: '#6ec3c8', ember: '#d85a3c', violet: '#a896d4', sage: '#bcd49a' };
const accentOf = (m) => ACCENTS[modules[m].accent] || ACCENTS.amber;

// ---------- hero: stats strip + live course index + resume button ----------
const statsRoot = document.querySelector('#hero-stats');
if (statsRoot) {
  const TOTAL_MIN = modules.reduce((n, module) => n + module.topics.reduce((t, tp) => t + readTime(tp), 0), 0);
  statsRoot.innerHTML = [
    [two(modules.length), 'MODULES'], [two(TOTAL_LESSONS), 'LESSONS'],
    [`~${TOTAL_MIN}`, 'MIN TO READ'], [String(TOTAL_XP), 'XP ON OFFER']
  ].map(([value, label]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`).join('');
}

const indexRoot = document.querySelector('#course-index');
function renderIndex() {
  if (!indexRoot) return;
  const rows = modules.map((module, m) => {
    const total = module.topics.length, done = doneCount(m);
    return `<button class="ci-row${done === total ? ' ci-done' : ''}" data-goto="${m}" type="button">
      <b>${pad(m)}</b><span>${module.title}</span><em>${done}/${total}</em></button>`;
  }).join('');
  indexRoot.innerHTML = `<p class="ci-head">COURSE INDEX · LIVE</p>${rows}
    <p class="ci-foot"><span>XP BANK · SHARED WITH ARCADE</span><b>${peekXp()} XP</b></p>`;
}
if (indexRoot) indexRoot.addEventListener('click', (event) => {
  const row = event.target.closest('[data-goto]');
  if (!row) return;
  activeModule = Number(row.dataset.goto);
  activeLesson = 0;
  showLesson();
});

const continueBtn = document.querySelector('#continue-btn');
function firstUnread() {
  for (let m = 0; m < modules.length; m++) {
    const l = modules[m].topics.findIndex((_, i) => !progress.lessons[lessonKey(m, i)]);
    if (l !== -1) return [m, l];
  }
  return null;
}
if (continueBtn) {
  const paintResume = () => {
    const target = firstUnread();
    continueBtn.innerHTML = target ? `Resume · module ${pad(target[0])} <span>↓</span>` : 'Course complete — review <span>↓</span>';
  };
  paintResume();
  continueBtn.addEventListener('click', () => {
    const target = firstUnread();
    if (target) { activeModule = target[0]; activeLesson = target[1]; }
    showLesson();
  });
}

// ---------- module nav + course progress strip ----------
const nav = document.querySelector('#module-nav');
const content = document.querySelector('#module-content');
const strip = document.querySelector('#course-progress');
let activeModule = 0, activeLesson = 0, qIndex = 0, qScore = 0, qLocked = false, viewIsQuiz = false;

modules.forEach((module, m) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<span class="nav-top"><span><i class="nav-dot" style="background:${accentOf(m)}"></i>MODULE ${pad(m)}</span><b class="nav-count" data-count="${m}"></b></span>${module.title}<i class="nav-bar" data-bar="${m}"></i>`;
  button.addEventListener('click', () => { activeModule = m; activeLesson = 0; showLesson(); });
  nav.append(button);
});

function updateNav() {
  nav.querySelectorAll('button').forEach((button, m) => {
    button.setAttribute('aria-current', m === activeModule);
    const total = modules[m].topics.length;
    const done = doneCount(m);
    const count = button.querySelector(`[data-count="${m}"]`);
    count.textContent = `${done}/${total}`;
    count.classList.toggle('complete', done === total);
    const pct = (done / total) * 100;
    button.querySelector(`[data-bar="${m}"]`).style.background = `linear-gradient(90deg,var(--amber) ${pct}%,rgba(255,255,255,.08) ${pct}%)`;
    button.classList.toggle('module-complete', done === total);
  });
  renderIndex();
  renderStrip();
}
function renderStrip() {
  const done = modules.reduce((n, _, m) => n + doneCount(m), 0);
  const pct = Math.round((done / TOTAL_LESSONS) * 100);
  const complete = done === TOTAL_LESSONS;
  strip.innerHTML = `<span class="cp-bar"><i style="width:${pct}%"></i></span><b>${done}/${TOTAL_LESSONS}</b> LESSONS · ${pct}% COURSE · <b>${peekXp()} XP</b>${complete ? ' · <em>COURSE COMPLETE</em>' : ''}`;
  strip.classList.toggle('all-done', complete);
}

// ---------- lesson view: banner (ring + chips), stepper, two-column card ----------
const ring = (done, total, m) => {
  const r = 20, c = 2 * Math.PI * r;
  const off = (c * (1 - (total ? done / total : 0))).toFixed(1);
  return `<svg class="banner-ring" viewBox="0 0 52 52" width="54" height="54" aria-hidden="true">
    <circle cx="26" cy="26" r="${r}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="3"></circle>
    <circle class="ring-fg" cx="26" cy="26" r="${r}" fill="none" stroke="${accentOf(m)}" stroke-width="3" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off}" transform="rotate(-90 26 26)"></circle>
    <text x="26" y="29.5" text-anchor="middle" fill="#f4f5f3" font-size="11" font-family="DM Mono,monospace">${done}/${total}</text></svg>`;
};
const banner = (module, m) => {
  const total = module.topics.length, done = doneCount(m);
  const moduleXp = total * 12 + module.quiz.length * 5;
  return `<div class="module-banner"><img src="assets/${module.image}" alt="">
    <div class="banner-side">${ring(done, total, m)}<div class="banner-chips"><span>${total} LESSONS</span><span>+${moduleXp} XP</span></div></div>
    <div class="module-banner-copy"><p class="eyebrow">MODULE ${pad(m)} / ${module.subtitle}</p>
    <h3>${module.title}</h3><p>${module.intro}</p></div></div>`;
};
const stepper = (module, quizCurrent) => `<div class="lesson-stepper">
  <button class="step-arrow" data-step="-1" type="button" aria-label="Previous lesson"${activeLesson === 0 && !quizCurrent ? ' disabled' : ''}>←</button>
  <div class="lesson-tabs">${module.topics.map((_, l) =>
    `<button class="lesson-tab${!quizCurrent && l === activeLesson ? ' current' : ''}${progress.lessons[lessonKey(activeModule, l)] ? ' done' : ''}" data-lesson="${l}" type="button" title="${module.topics[l].title}">${pad(l)}</button>`).join('')}
    <button class="lesson-tab quiz-tab${quizCurrent ? ' current' : ''}" data-quiz="1" type="button" title="Module check">✓</button></div>
  <button class="step-arrow" data-step="1" type="button" aria-label="Next lesson"${quizCurrent || activeLesson === module.topics.length - 1 ? ' disabled' : ''}>→</button>
  <span class="lesson-meta">${quizCurrent ? 'MODULE CHECK · USE THE ARROW TABS' : `LESSON ${pad(activeLesson)} OF ${two(module.topics.length)} · ~${readTime(module.topics[activeLesson])} MIN READ · ARROW KEYS TO FLIP`}</span></div>`;

function showLesson() {
  viewIsQuiz = false;
  qIndex = 0; qScore = 0; qLocked = false;
  const module = modules[activeModule];
  const topic = module.topics[activeLesson];
  const done = progress.lessons[lessonKey(activeModule, activeLesson)];
  const isLast = activeLesson === module.topics.length - 1;
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
  content.innerHTML = banner(module, activeModule) + stepper(module, false) + `
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
  updateNav();
  content.scrollTop = 0;
}

function markLesson() {
  const key = lessonKey(activeModule, activeLesson);
  if (!progress.lessons[key]) {
    progress.lessons[key] = true;
    saveProgress();
    signal(`+10 XP — lesson logged · ${addXp(10)} XP total`);
    if (continueBtn) continueBtn.innerHTML = firstUnread() ? continueBtn.innerHTML.replace(/module \d\d/, `module ${pad(firstUnread()[0])}`) : 'Course complete — review <span>↓</span>';
  }
  const totalDone = modules.reduce((n, _, m) => n + doneCount(m), 0);
  if (totalDone === TOTAL_LESSONS) setTimeout(() => signal(`ALL ${TOTAL_LESSONS} LESSONS LOGGED — COURSE COMPLETE`), 400);
  if (activeLesson < modules[activeModule].topics.length - 1) { activeLesson++; showLesson(); }
  else openQuiz();
}

// ---------- module check (3 questions, instant feedback, bonus XP) ----------
function openQuiz() { qIndex = 0; qScore = 0; qLocked = false; renderQuiz(); }

function renderQuiz() {
  viewIsQuiz = true;
  const module = modules[activeModule];
  const quiz = module.quiz;
  if (qIndex < quiz.length) {
    const q = quiz[qIndex];
    content.innerHTML = banner(module, activeModule) + stepper(module, true) + `
      <section class="topic-card quiz-card">
        <p class="quiz-meta">MODULE CHECK · QUESTION ${pad(qIndex)} OF ${two(quiz.length)} · SCORE ${qScore}/${quiz.length}</p>
        <h4>${q.q}</h4>
        <div class="activity-items quiz-items">${q.options.map((option, i) => `<button type="button" data-opt="${i}">${option}</button>`).join('')}</div>
        <p class="activity-feedback" hidden></p>
      </section>`;
    const card = content.querySelector('.quiz-card');
    card.querySelectorAll('[data-opt]').forEach((button) => button.addEventListener('click', () => {
      if (qLocked) return;
      qLocked = true;
      const pick = Number(button.dataset.opt);
      const right = pick === q.answer;
      if (right) qScore++;
      card.querySelectorAll('[data-opt]').forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add('correct');
        else if (i === pick) b.classList.add('incorrect');
      });
      const feedback = card.querySelector('.activity-feedback');
      feedback.hidden = false;
      feedback.textContent = `${right ? 'That fits.' : 'Take another look.'} ${q.explain}`;
      const next = document.createElement('button');
      next.className = 'activity-action';
      next.type = 'button';
      next.textContent = qIndex === quiz.length - 1 ? 'See your result →' : 'Next question →';
      next.addEventListener('click', () => { qIndex++; qLocked = false; renderQuiz(); });
      card.append(next);
    }));
  } else showQuizSummary(quiz);
  updateNav();
  content.scrollTop = 0;
}

function showQuizSummary(quiz) {
  viewIsQuiz = true;
  const module = modules[activeModule];
  const firstTime = !progress.quizXp[activeModule];
  const earned = firstTime && qScore ? qScore * 5 : 0;
  let note;
  if (!qScore) note = 'No points this round — revisit a lesson and try again. XP unlocks when you score.';
  else if (firstTime) {
    progress.quizXp[activeModule] = true;
    saveProgress();
    signal(`+${earned} XP — module check cleared · ${addXp(earned)} XP total`);
    note = `+${earned} XP banked — 5 XP per correct answer.`;
  } else note = 'Module XP already claimed — this run is practice.';
  updateNav();
  content.innerHTML = banner(module, activeModule) + stepper(module, true) + `
    <section class="topic-card quiz-card">
      <p class="quiz-meta">MODULE CHECK · COMPLETE</p>
      <h4>${qScore === quiz.length ? 'A clear pass — every answer fits.' : `${qScore} of ${quiz.length} — partly there.`}</h4>
      <p>${note}</p>
      <div class="lesson-foot"><button class="mark-btn" data-retry="1" type="button">TRY THE CHECK AGAIN ↻</button><button class="text-button" data-back="1" type="button">Back to lessons</button></div>
    </section>`;
  content.scrollTop = 0;
}

// ---------- 30-second quick check (+2 XP, first correct answer only) ----------
function answerQuick(pick) {
  const card = content.querySelector('.aside-card.quick');
  if (!card || card.dataset.locked === '1') return;
  card.dataset.locked = '1';
  const quick = modules[activeModule].topics[activeLesson].quick;
  const right = pick === quick.answer;
  card.querySelectorAll('[data-qopt]').forEach((b, i) => {
    b.disabled = true;
    if (i === quick.answer) b.classList.add('correct');
    else if (i === pick) b.classList.add('incorrect');
  });
  const feedback = card.querySelector('.activity-feedback');
  feedback.hidden = false;
  feedback.textContent = `${right ? 'Correct — quick read confirmed.' : 'Not quite — skim the lesson again.'} ${quick.explain}`;
  const retry = document.createElement('button');
  retry.className = 'text-button';
  retry.type = 'button';
  retry.textContent = 'Try again';
  retry.addEventListener('click', () => {
    card.dataset.locked = '';
    card.querySelectorAll('[data-qopt]').forEach((b) => { b.disabled = false; b.classList.remove('correct', 'incorrect'); });
    feedback.hidden = true;
    retry.remove();
  });
  card.append(retry);
  const key = lessonKey(activeModule, activeLesson);
  if (right && !progress.quickXp[key]) {
    progress.quickXp[key] = true;
    saveProgress();
    signal(`QUICK CHECK · +2 XP — ${addXp(2)} XP total`);
    updateNav();
  }
}

// one delegated listener covers every control rendered above
content.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-lesson]');
  if (tab) { activeLesson = Number(tab.dataset.lesson); showLesson(); return; }
  if (event.target.closest('[data-quiz]')) return openQuiz();
  const step = event.target.closest('[data-step]');
  if (step && !step.disabled) { activeLesson += Number(step.dataset.step); showLesson(); return; }
  if (event.target.closest('[data-mark]')) return markLesson();
  if (event.target.closest('[data-retry]')) return openQuiz();
  if (event.target.closest('[data-back]')) { activeLesson = modules[activeModule].topics.length - 1; showLesson(); return; }
  const termBtn = event.target.closest('[data-term]');
  if (termBtn) {
    const def = termBtn.nextElementSibling;
    const open = def.hidden;
    def.hidden = !open;
    termBtn.setAttribute('aria-expanded', String(open));
    termBtn.closest('.term').classList.toggle('open', open);
    return;
  }
  const diveBtn = event.target.closest('[data-dive]');
  if (diveBtn) {
    const wrap = diveBtn.closest('.lesson-dive');
    const body = wrap.querySelector('.dive-body');
    const open = body.hidden;
    body.hidden = !open;
    wrap.classList.toggle('open', open);
    diveBtn.setAttribute('aria-expanded', String(open));
    return;
  }
  const qopt = event.target.closest('[data-qopt]');
  if (qopt) return answerQuick(Number(qopt.dataset.qopt));
});

// keyboard: left / right arrows flip lessons (never while a module check is open)
document.addEventListener('keydown', (event) => {
  if (viewIsQuiz || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest && event.target.closest('select, input, textarea, [contenteditable]')) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const target = activeLesson + (event.key === 'ArrowRight' ? 1 : -1);
  if (target < 0 || target > modules[activeModule].topics.length - 1) return;
  activeLesson = target;
  showLesson();
});

showLesson();

// ---------- field check (bottom section, unchanged) ----------
const box = document.querySelector('#activity');
let taskIndex = 0, score = 0, locked = false, selected = [];
function renderTask() {
  if (taskIndex === tasks.length) return showResults();
  const task = tasks[taskIndex];
  selected = [];
  locked = false;
  const matching = task.type === 'match';
  const items = task.items || [];
  const controls = matching ? `<div class="match-list">${task.pairs.map(([prompt], i) =>
    `<label class="match-row"><span>${prompt}</span><select data-row="${i}" aria-label="Match for: ${prompt}">
    <option value="">Choose a role</option>${task.options.map(option => `<option>${option}</option>`).join('')}</select></label>`).join('')}</div>`
    : `<div class="activity-items">${items.map((item, i) => `<button type="button" data-choice="${i}">${item}</button>`).join('')}</div>`;
  box.innerHTML = `<div class="activity-meta"><span>FIELD CHECK · 0${taskIndex + 1} / 0${tasks.length}</span><span>${score.toFixed(1)} POINTS</span></div>
    <h3>${task.title}</h3><p class="activity-hint">${task.type === 'order' ? 'Select each step in order.' : task.type === 'multi' ? 'Select every answer that fits.' : matching ? 'Choose one role for each description.' : 'Choose the best explanation.'}</p>
    ${controls}<p class="activity-feedback" hidden></p><button class="activity-action" type="button" disabled>Check your thinking →</button>`;
  wireTask(task);
}
function wireTask(task) {
  const choices = [...box.querySelectorAll('[data-choice]')];
  const selects = [...box.querySelectorAll('select')];
  const feedback = box.querySelector('.activity-feedback');
  const action = box.querySelector('.activity-action');
  choices.forEach(button => button.addEventListener('click', () => {
    if (locked) return;
    const id = Number(button.dataset.choice);
    if (task.type === 'choose') return answerChoice(task, id, choices, feedback, action);
    selected = selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id];
    button.classList.toggle('selected', selected.includes(id));
    if (task.type === 'order') choices.forEach((item, i) => {
      item.textContent = `${selected.includes(i) ? selected.indexOf(i) + 1 : '·'}. ${task.items[i]}`;
    });
    action.disabled = selected.length < task.answer.length;
  }));
  selects.forEach(select => select.addEventListener('change', () => {
    action.disabled = selects.some(item => !item.value);
  }));
  action.addEventListener('click', () => {
    if (locked) { taskIndex++; renderTask(); return; }
    if (task.type === 'choose') return;
    const answer = task.type === 'match' ? selects.map(item => item.value) : selected;
    const credit = task.type === 'match' ? answer.filter((value, i) => value === task.pairs[i][1]).length / task.pairs.length
      : task.type === 'multi' ? multiCredit(answer, task.answer)
      : answer.reduce((total, value, i) => total + Number(value === task.answer[i]), 0) / task.answer.length;
    locked = true;
    score += credit;
    choices.forEach((button, i) => {
      button.disabled = true;
      if (task.type === 'multi' && task.answer.includes(i)) button.classList.add('correct');
      else if (task.type === 'multi' && answer.includes(i)) button.classList.add('incorrect');
      if (task.type === 'order' && selected.includes(i)) button.classList.add(selected.indexOf(i) === task.answer.indexOf(i) ? 'correct' : 'incorrect');
    });
    selects.forEach((item, i) => {
      item.disabled = true;
      item.classList.add(answer[i] === task.pairs[i][1] ? 'correct' : 'incorrect');
    });
    feedback.hidden = false;
    feedback.textContent = `${credit === 1 ? 'That fits.' : 'Some of that fits.'} You earned ${credit.toFixed(1)} / 1 point. ${task.explain}`;
    action.textContent = taskIndex === tasks.length - 1 ? 'See your summary →' : 'Next field check →';
    action.disabled = false;
  });
}
function answerChoice(task, choice, choices, feedback, action) {
  locked = true;
  const correct = choice === task.answer;
  score += Number(correct);
  choices.forEach((button, i) => { button.disabled = true; if (i === task.answer) button.classList.add('correct'); else if (i === choice) button.classList.add('incorrect'); });
  feedback.hidden = false;
  feedback.textContent = `${correct ? 'That fits.' : 'Take another look.'} ${task.explain}`;
  action.disabled = false;
  action.textContent = taskIndex === tasks.length - 1 ? 'See your summary →' : 'Next field check →';
}
function multiCredit(picked, correct) {
  const hits = picked.filter(item => correct.includes(item)).length;
  const misses = picked.length - hits;
  return Math.max(0, (hits - misses) / correct.length);
}
function showResults() {
  box.innerHTML = `<div class="activity-meta"><span>FIELD CHECK COMPLETE</span><span>${score.toFixed(1)} / ${tasks.length}</span></div>
    <h3>${score >= tasks.length ? 'A clear signal. You have the core ideas.' : 'A good first pass. Revisit any module and try again.'}</h3>
    <p class="activity-feedback">You earned ${score.toFixed(1)} of ${tasks.length} points. Partly correct answers still count, and every explanation points back to the course.</p>
    <button class="activity-action" id="retry" type="button">Try the field check again ↻</button>`;
  box.querySelector('#retry').addEventListener('click', () => { taskIndex = 0; score = 0; renderTask(); });
}
renderTask();

const sections = document.querySelectorAll('.view-section');
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-entered'); reveal.unobserve(entry.target); }
}), { threshold: .12 });
sections.forEach(section => reveal.observe(section));
