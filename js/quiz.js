import { $, ARROW } from './shared.js';

/* ---------------- 04 · Quiz ---------------- */
(() => {
  const box = $('#quizBox'); if (!box) return;

  const ICON_OK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const QUESTIONS = [
    { q:'Which planet has the shortest day — spinning once in under 10 hours?',
      a:['Mercury', 'Jupiter', 'Mars', 'Venus'], c:1,
      ex:'Despite being the largest planet, Jupiter spins fastest: one full rotation takes just 9 hours 56 minutes.' },
    { q:'Roughly how much of the Solar System\u2019s mass is contained in the Sun itself?',
      a:['About 70%', 'About 85%', 'About 99.8%', 'About 50%'], c:2,
      ex:'The Sun holds 99.8% of all the mass in the Solar System. Everything else — planets, moons, asteroids — is a rounding error.' },
    { q:'Main-sequence stars like the Sun spend their lives fusing hydrogen into\u2026',
      a:['Carbon', 'Helium', 'Iron', 'Oxygen'], c:1,
      ex:'Hydrogen nuclei fuse into helium, releasing the energy that makes stars shine. Heavier elements come later — or in other stars.' },
    { q:'A light-year is a unit of\u2026',
      a:['Time', 'Brightness', 'Distance', 'Temperature'], c:2,
      ex:'One light-year is the distance light travels in a year: about 9.46 trillion kilometers.' },
    { q:'After the Sun becomes a red giant, what will it leave behind?',
      a:['A neutron star', 'A white dwarf', 'A black hole', 'A new solar system'], c:1,
      ex:'At ~1 solar mass, the Sun is far too light to collapse further. Its core will end as an Earth-sized white dwarf, cooling for eternity.' },
    { q:'Which of these is the closest star to the Sun?',
      a:['Sirius', 'Betelgeuse', 'Proxima Centauri', 'Polaris'], c:2,
      ex:'Proxima Centauri, part of the Alpha Centauri system, lies just 4.24 light-years away — and even hosts a planet in the habitable zone.' }
  ];

  let i = 0, score = 0, locked = false;

  const rankOf = s =>
    s >= 6 ? ['Master Navigator', 'A flawless run. You read the sky like an atlas — now go outside and check it against the real thing.']
    : s === 5 ? ['Apprentice Astronomer', 'One slip, but the fundamentals are firmly in place. The night sky is officially within reach.']
    : s >= 3 ? ['Stargazer', 'Solid instincts. Revisit the chapters above and the last points will come quickly.']
    : ['Grounded Dreamer', 'Everyone starts by looking up. Scroll back through the guide and try again — every answer is in there.'];

  function render(){
    locked = false;
    const q = QUESTIONS[i];
    box.innerHTML = `
      <div class="q-meta"><span>QUESTION ${String(i + 1).padStart(2, '0')} / ${String(QUESTIONS.length).padStart(2, '0')}</span>
        <span>SCORE ${score}</span></div>
      <div class="q-bar"><i style="width:${(i / QUESTIONS.length) * 100}%"></i></div>
      <h3 class="q-text">${q.q}</h3>
      <div class="q-opts">${q.a.map((o, j) =>
        `<button class="q-opt" type="button" data-j="${j}"><b>${'ABCD'[j]}</b><span>${o}</span></button>`).join('')}
      </div>
      <div class="q-foot" hidden></div>`;
    box.querySelectorAll('.q-opt').forEach(b =>
      b.addEventListener('click', () => answer(+b.dataset.j)));
  }

  function answer(j){
    if (locked) return;
    locked = true;
    const q = QUESTIONS[i];
    const good = j === q.c;
    if (good) score++;

    box.querySelectorAll('.q-opt').forEach((b, k) => {
      b.disabled = true;
      const mark = b.querySelector('b');
      if (k === q.c){ b.classList.add('right'); mark.outerHTML = `<b class="mark">${ICON_OK}</b>`; }
      else if (k === j){ b.classList.add('wrong'); mark.outerHTML = `<b class="mark">${ICON_NO}</b>`; }
      else b.classList.add('dim');
    });
    box.querySelector('.q-bar i').style.width = ((i + 1) / QUESTIONS.length) * 100 + '%';

    const foot = box.querySelector('.q-foot');
    foot.hidden = false;
    foot.innerHTML = `
      <p class="q-explain"><strong>${good ? 'Correct.' : 'Not quite.'}</strong> ${q.ex}</p>
      <button class="btn ghost small" id="qNext" type="button">
        ${i === QUESTIONS.length - 1 ? 'See results' : 'Next question'}${ARROW}</button>`;
    $('#qNext').addEventListener('click', () => {
      i++;
      i < QUESTIONS.length ? render() : results();
    });
  }

  function results(){
    const [rank, note] = rankOf(score);
    box.innerHTML = `
      <div class="q-meta"><span>RESULT</span><span>SCORE ${score} / ${QUESTIONS.length}</span></div>
      <div class="q-bar"><i style="width:100%"></i></div>
      <p class="q-score">${score}<span> / ${QUESTIONS.length}</span></p>
      <h3 class="q-rank">${rank}</h3>
      <p class="q-note">${note}</p>
      <button class="btn solid small" id="qAgain" type="button">Take it again</button>`;
    $('#qAgain').addEventListener('click', () => { i = 0; score = 0; render(); });
  }

  render();
})();