import { $, $$ } from './shared.js';

/* ---------------- Reveal on scroll + active nav link ---------------- */
(() => {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  const links = $$('.nav-links a');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const so = new IntersectionObserver(es => es.forEach(e => {
    const link = map.get(e.target.id);
    if (link && e.isIntersecting){
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  }), { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const sec = document.getElementById(id); if (sec) so.observe(sec); });

  /* reading progress bar along the very top of the page */
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.appendChild(bar);
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      ticking = false;
    });
  }, { passive: true });
})();
