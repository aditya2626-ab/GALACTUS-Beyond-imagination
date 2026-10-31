import { $, $$ } from './shared.js';

/* ---------------- Learning progress ----------------
   localStorage-backed chapter completion tracking. Chapters are marked
   complete from the "Key takeaways" box at the end of each chapter; the
   nav pill and the hero progress panel reflect the state live. The quiz
   writes its best score to the same store and signals this module with
   a 'galactus:quiz-best' event. */
(() => {
  const KEY = 'galactus:progress';
  const CHAPTERS = [
    { id:'solar',   label:'Solar System' },
    { id:'stars',   label:'Lives of Stars' },
    { id:'scale',   label:'Cosmic Scale' },
    { id:'gravity', label:'Gravity Lab' }
  ];

  const readStore = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  };
  const writeStore = d => {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode */ }
  };

  let done = readStore().chapters || {};
  const navEl = $('#navProgress'), heroEl = $('#heroProgress');
  if (!navEl && !heroEl) return;

  function render(){
    const n = CHAPTERS.filter(c => done[c.id]).length;
    if (navEl) navEl.textContent = `PROGRESS ${n}/${CHAPTERS.length}`;

    if (heroEl){
      let best = null;
      try { best = parseInt(localStorage.getItem('galactus:quizBest') || '', 10); } catch { /* private mode */ }
      const next = CHAPTERS.find(c => !done[c.id]);
      heroEl.innerHTML = `
        <div class="hp-row">
          <span class="hp-lab">YOUR PROGRESS</span>
          <span class="hp-dots" aria-hidden="true">${CHAPTERS.map(c =>
            `<i class="${done[c.id] ? 'on' : ''}" title="${c.label}"></i>`).join('')}</span>
          <span class="hp-count">${n} of ${CHAPTERS.length} chapters</span>
          ${best != null ? `<span class="hp-quiz">QUIZ BEST ${best}/9</span>` : ''}
          ${next
            ? `<a class="hp-next" href="#${next.id}">Continue · ${next.label} →</a>`
            : `<a class="hp-next" href="#quiz">All chapters read — test yourself →</a>`}
        </div>`;
    }

    $$('.mark-btn').forEach(b => {
      const on = !!done[b.dataset.ch];
      b.classList.toggle('done', on);
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? '✓ Chapter completed' : 'Mark chapter complete';
    });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('.mark-btn');
    if (!b) return;
    const id = b.dataset.ch;
    if (done[id]) delete done[id]; else done[id] = true;
    writeStore({ ...readStore(), chapters: done });
    render();
  });

  document.addEventListener('galactus:quiz-best', render);
  addEventListener('storage', render);
  render();
})();
