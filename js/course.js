import { modules } from './course-data.js';
import { tasks } from './data.js';
const nav = document.querySelector('#module-nav');
const content = document.querySelector('#module-content');
let activeModule = 0;

function showModule(index) {
  activeModule = index;
  const module = modules[index];
  nav.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-current', i === index));
  content.innerHTML = `<div class="module-banner"><img src="assets/${module.image}" alt="">
    <div class="module-banner-copy"><p class="eyebrow">MODULE 0${index + 1} / ${module.subtitle}</p>
    <h3>${module.title}</h3><p>${module.intro}</p></div></div>
    <div class="topic-grid">${module.topics.map(topic => `<section class="topic-card">
      <h4>${topic.title}</h4><p>${topic.body}</p>
      ${topic.points ? `<ul>${topic.points.map(point => `<li>${point}</li>`).join('')}</ul>` : ''}
      ${topic.fact ? `<p class="topic-fact"><b>FIELD NOTE</b> · ${topic.fact}</p>` : ''}</section>`).join('')}</div>`;
}
modules.forEach((module, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<span>MODULE 0${index + 1}</span>${module.title}`;
  button.addEventListener('click', () => showModule(index));
  nav.append(button);
});
showModule(0);

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
