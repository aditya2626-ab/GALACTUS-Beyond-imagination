import { modules } from './course-data.js';
import { course } from './course-state.js';
import { markLesson } from './course-lessons.js';
import { answerQuick } from './course-quizzes.js';

export function installCourseControls() {
  const content = course.content;
// one delegated listener covers every control rendered above
course.content.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-lesson]');
  if (tab) { course.activeLesson = Number(tab.dataset.lesson); course.showLesson(); return; }
  if (event.target.closest('[data-quiz]')) return course.openQuiz();
  const step = event.target.closest('[data-step]');
  if (step && !step.disabled) { course.activeLesson += Number(step.dataset.step); course.showLesson(); return; }
  if (event.target.closest('[data-mark]')) return markLesson();
  if (event.target.closest('[data-retry]')) return course.openQuiz();
  if (event.target.closest('[data-back]')) { course.activeLesson = modules[course.activeModule].topics.length - 1; course.showLesson(); return; }
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
  if (course.viewIsQuiz || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest && event.target.closest('select, input, textarea, [contenteditable]')) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const target = course.activeLesson + (event.key === 'ArrowRight' ? 1 : -1);
  if (target < 0 || target > modules[course.activeModule].topics.length - 1) return;
  course.activeLesson = target;
  course.showLesson();
});

}
