import { modules } from './course-data.js';
import {
  course, progress, saveProgress, addXp, signal, pad, two, lessonKey,
} from './course-state.js';
import { banner, stepper } from './course-lessons.js';

export function openQuiz() { course.quizIndex = 0; course.quizScore = 0; course.quizLocked = false; renderQuiz(); }

function renderQuiz() {
  course.viewIsQuiz = true;
  const module = modules[course.activeModule];
  const quiz = module.quiz;
  if (course.quizIndex < quiz.length) {
    const q = quiz[course.quizIndex];
    course.content.innerHTML = banner(module, course.activeModule) + stepper(module, true) + `
      <section class="topic-card quiz-card">
        <p class="quiz-meta">MODULE CHECK · QUESTION ${pad(course.quizIndex)} OF ${two(quiz.length)} · SCORE ${course.quizScore}/${quiz.length}</p>
        <h4>${q.q}</h4>
        <div class="activity-items quiz-items">${q.options.map((option, i) => `<button type="button" data-opt="${i}">${option}</button>`).join('')}</div>
        <p class="activity-feedback" hidden></p>
      </section>`;
    const card = course.content.querySelector('.quiz-card');
    card.querySelectorAll('[data-opt]').forEach((button) => button.addEventListener('click', () => {
      if (course.quizLocked) return;
      course.quizLocked = true;
      const pick = Number(button.dataset.opt);
      const right = pick === q.answer;
      if (right) course.quizScore++;
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
      next.textContent = course.quizIndex === quiz.length - 1 ? 'See your result →' : 'Next question →';
      next.addEventListener('click', () => { course.quizIndex++; course.quizLocked = false; renderQuiz(); });
      card.append(next);
    }));
  } else showQuizSummary(quiz);
  course.updateNav();
  course.content.scrollTop = 0;
}

function showQuizSummary(quiz) {
  course.viewIsQuiz = true;
  const module = modules[course.activeModule];
  const firstTime = !progress.quizXp[course.activeModule];
  const earned = firstTime && course.quizScore ? course.quizScore * 5 : 0;
  let note;
  if (!course.quizScore) note = 'No points this round — revisit a lesson and try again. XP unlocks when you score.';
  else if (firstTime) {
    progress.quizXp[course.activeModule] = true;
    saveProgress();
    signal(`+${earned} XP — module check cleared · ${addXp(earned)} XP total`);
    note = `+${earned} XP banked — 5 XP per correct answer.`;
  } else note = 'Module XP already claimed — this run is practice.';
  course.updateNav();
  course.content.innerHTML = banner(module, course.activeModule) + stepper(module, true) + `
    <section class="topic-card quiz-card">
      <p class="quiz-meta">MODULE CHECK · COMPLETE</p>
      <h4>${course.quizScore === quiz.length ? 'A clear pass — every answer fits.' : `${course.quizScore} of ${quiz.length} — partly there.`}</h4>
      <p>${note}</p>
      <div class="lesson-foot"><button class="mark-btn" data-retry="1" type="button">TRY THE CHECK AGAIN ↻</button><button class="text-button" data-back="1" type="button">Back to lessons</button></div>
    </section>`;
  course.content.scrollTop = 0;
}

// ---------- 30-second quick check (+2 XP, first correct answer only) ----------
export function answerQuick(pick) {
  const card = course.content.querySelector('.aside-card.quick');
  if (!card || card.dataset.locked === '1') return;
  card.dataset.locked = '1';
  const quick = modules[course.activeModule].topics[course.activeLesson].quick;
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
  const key = lessonKey(course.activeModule, course.activeLesson);
  if (right && !progress.quickXp[key]) {
    progress.quickXp[key] = true;
    saveProgress();
    signal(`QUICK CHECK · +2 XP — ${addXp(2)} XP total`);
    course.updateNav();
  }
}

