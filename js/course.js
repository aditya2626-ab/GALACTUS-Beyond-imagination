import './course-field-check.js';
import { course } from './course-state.js';
import { showLesson } from './course-lessons.js';
import { openQuiz } from './course-quizzes.js';
import { initNavigation, updateNav } from './course-navigation.js';
import { installCourseControls } from './course-controls.js';

course.showLesson = showLesson;
course.openQuiz = openQuiz;
course.updateNav = updateNav;

initNavigation();
installCourseControls();
showLesson();

const sections = document.querySelectorAll('.view-section');
const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-entered');
  reveal.unobserve(entry.target);
}), { threshold: 0.12 });
sections.forEach((section) => reveal.observe(section));
