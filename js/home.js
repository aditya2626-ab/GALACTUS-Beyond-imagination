import { facts, timeline } from './data.js';
import './universe.js';

let lastFact = -1;
document.querySelector('#another-fact').addEventListener('click', () => {
  let next = Math.floor(Math.random() * facts.length);
  if (facts.length > 1 && next === lastFact) next = (next + 1) % facts.length;
  lastFact = next;
  document.querySelector('#fact-text').textContent = facts[next];
  document.querySelector('#fact-index').textContent = `NOTE ${String(next + 1).padStart(2, '0')} / 08`;
});
document.querySelector('#another-fact').click();
document.querySelector('#timeline').innerHTML = timeline.map(([date, event]) =>
  `<article class="time-point"><strong>${date}</strong><span>${event}</span></article>`).join('');

const sections = document.querySelectorAll('.view-section');
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-entered'); reveal.unobserve(entry.target); }
}), { threshold: .12 });
sections.forEach(section => reveal.observe(section));
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const planet = document.querySelector('#hero-planet');
  document.querySelector('.hero').addEventListener('pointermove', event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    planet.style.setProperty('--parallax-x', `${(event.clientX / bounds.width - .5) * 16}px`);
    planet.style.setProperty('--parallax-y', `${(event.clientY / bounds.height - .5) * 12}px`);
  });
  document.querySelector('.hero').addEventListener('pointerleave', () => {
    planet.style.setProperty('--parallax-x', '0px');
    planet.style.setProperty('--parallax-y', '0px');
  });
}
