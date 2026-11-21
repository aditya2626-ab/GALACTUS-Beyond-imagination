import { lessons } from './data.js';

const lessonList = document.querySelector('#lesson-list');
lessonList.innerHTML = lessons.map((lesson, i) => `
  <article class="lesson">
    <span class="lesson-number">LESSON 0${i + 1}</span>
    <h3>${lesson.title}</h3><p>${lesson.text}</p>
    <p class="takeaway">Keep in mind · ${lesson.takeaway}</p>
    <p class="prompt">${lesson.prompt}</p>
  </article>`).join('');

const tasks = [
  {
    kind: 'sequence',
    prompt: 'Tap these star-life moments in the order described in lesson two.',
    items: ['A molecular cloud gathers under gravity', 'Hydrogen fusion begins', 'A Sun-like star leaves a white dwarf'],
    answer: [0, 1, 2],
    why: 'Gravity gathers gas first; a hot core can then start fusion. Sun-like stars eventually leave white dwarfs.'
  },
  {
    kind: 'choose',
    prompt: 'You see a galaxy whose light took 2.5 million years to arrive. What are you also doing?',
    items: ['Seeing it as it was 2.5 million years ago', 'Seeing it exactly as it is today', 'Seeing the edge of the whole universe'],
    answer: 0,
    why: 'Light takes time to travel. The image shows the galaxy as it was when that light began its journey.'
  },
  {
    kind: 'match',
    prompt: 'A probe moves forward while gravity pulls it inward. What best describes its path?',
    items: ['A curved path that keeps falling around the planet', 'A straight line because forward motion cancels gravity', 'A path that needs gravity to switch off'],
    answer: 0,
    why: 'Forward motion and inward gravitational pull combine to bend the path into an orbit.'
  },
  {
    kind: 'apply',
    prompt: 'A spectrum from a distant star has recognizable patterns. What can astronomers infer?',
    items: ['Clues about its composition', 'Its exact surface landscape', 'That it has planets with life'],
    answer: 0,
    why: 'Spectral patterns can reveal composition, temperature, and motion. They do not prove life on nearby planets.'
  }
];
const box = document.querySelector('#activity');
let index = 0;
let score = 0;
let locked = false;
let sequence = [];

function render() {
  if (index === tasks.length) return showResults();
  locked = false;
  sequence = [];
  const task = tasks[index];
  box.innerHTML = `<div class="activity-meta"><span>ACTIVITY 0${index + 1} / 0${tasks.length}</span>
    <span>${score} ON TRACK</span></div><h3>${task.prompt}</h3>
    <div class="choices">${task.items.map((item, i) =>
      `<button type="button" data-index="${i}">${item}</button>`).join('')}</div>
    <p class="activity-feedback" hidden></p>
    <button class="activity-action" type="button" disabled>Check answer →</button>`;
  const choices = [...box.querySelectorAll('.choices button')];
  const feedback = box.querySelector('.activity-feedback');
  const next = box.querySelector('.activity-action');
  choices.forEach(button => button.addEventListener('click', () => {
    if (locked) return;
    const pick = Number(button.dataset.index);
    if (task.kind === 'sequence') {
      if (sequence.includes(pick)) sequence = sequence.filter(i => i !== pick);
      else sequence.push(pick);
      button.classList.toggle('selected');
      choices.forEach(choice => {
        const i = Number(choice.dataset.index);
        const order = sequence.indexOf(i);
        choice.textContent = `${order < 0 ? '·' : order + 1}. ${task.items[i]}`;
      });
      next.disabled = sequence.length !== task.items.length;
      return;
    }
    locked = true;
    score += Number(pick === task.answer);
    choices.forEach((choice, i) => {
      choice.disabled = true;
      if (i === task.answer) choice.classList.add('correct');
      else if (i === pick) choice.classList.add('incorrect');
    });
    feedback.hidden = false;
    feedback.textContent = `${pick === task.answer ? 'That fits.' : 'Take another look.'} ${task.why}`;
    next.disabled = false;
    next.textContent = index === tasks.length - 1 ? 'Finish →' : 'Continue →';
  }));
  next.addEventListener('click', () => {
    if (task.kind === 'sequence' && !locked) {
      locked = true;
      score += Number(sequence.join(',') === task.answer.join(','));
      choices.forEach(button => button.disabled = true);
      feedback.hidden = false;
      feedback.textContent = `${sequence.join(',') === task.answer.join(',')
        ? 'That order fits.' : 'The order is cloud, fusion, then remnant.'} ${task.why}`;
      next.textContent = index === tasks.length - 1 ? 'Finish →' : 'Continue →';
      return;
    }
    index++;
    render();
  });
}

function showResults() {
  box.innerHTML = `<div class="activity-meta"><span>CHECK COMPLETE</span>
    <span>${score} / ${tasks.length} REASONED THROUGH</span></div>
    <h3>${score === tasks.length ? 'Lovely work. The big ideas are in place.' : 'Good start. A second look will sharpen the picture.'}</h3>
    <p class="activity-feedback">${score} of ${tasks.length} responses lined up with the lessons. Every answer came from the course above.</p>
    <button class="activity-action" id="retry" type="button">Try the set again ↻</button>`;
  box.querySelector('#retry').addEventListener('click', () => {
    index = 0;
    score = 0;
    render();
  });
}
render();
