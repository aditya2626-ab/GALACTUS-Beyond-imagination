import { $, ARROW, shuffle } from './shared.js';

/* ---------------- 04 · Quiz ---------------- */
(() => {
  const box = $('#quizBox'); if (!box) return;

  const ICON_OK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const QUESTIONS = [
    { q:'Which planet has the shortest day — spinning once in under 10 hours?',
      a:['Mercury', 'Jupiter', 'Mars', 'Venus'], c:1,
      ex:'Despite being the largest planet, Jupiter spins fastest: one full rotation takes just 9 hours 56 minutes.' },
    { q:'What are Saturn\u2019s rings mostly made of?',
      a:['Fire and gas', 'Ice and rock', 'Liquid water', 'Dust from the Sun'], c:1,
      ex:'Saturn is circled by rings of ice and rock only tens of meters thick — the Solar System\u2019s showpiece.' },
    { q:'Main-sequence stars like the Sun spend their lives fusing hydrogen into\u2026',
      a:['Carbon', 'Helium', 'Iron', 'Oxygen'], c:1,
      ex:'Hydrogen nuclei fuse into helium, releasing the energy that makes stars shine. Heavier elements come later — or in other stars.' },
    { q:'Which landmark is our nearest stellar neighbor?',
      a:['Neptune', 'Proxima Centauri', 'Sagittarius A*', 'Andromeda Galaxy'], c:1,
      ex:'Proxima Centauri is our nearest stellar neighbor, 4.24 light-years away. Voyager 1 would need over 70,000 years to get there.' },
    { q:'What remnant does a star born below 8 solar masses leave behind?',
      a:['A white dwarf', 'A neutron star', 'A black hole', 'A new planet'], c:0,
      ex:'A lower-mass star sheds its outer layers as a planetary nebula and leaves an Earth-sized white dwarf that slowly cools.' },
    { q:'What is the nearest large galaxy to the Milky Way?',
      a:['The Sombrero Galaxy', 'The Whirlpool Galaxy', 'Andromeda Galaxy', 'The Large Magellanic Cloud'], c:2,
      ex:'The Andromeda Galaxy is the nearest large galaxy, 2.5 million light-years away. It is closing with us at 110 km/s.' }
  ];

  let questions = [], i = 0, score = 0, locked = false;

  const rankOf = s =>
    s >= 6 ? ['Master Navigator', 'A flawless run. You read the sky like an atlas — now go outside and check it against the real thing.']
    : s === 5 ? ['Apprentice Astronomer', 'One slip, but the fundamentals are firmly in place. The night sky is officially within reach.']
    : s >= 3 ? ['Stargazer', 'Solid instincts. Revisit the chapters above and the last points will come quickly.']
    : ['Grounded Dreamer', 'Everyone starts by looking up. Scroll back through the guide and try again — every answer is in there.'];

  function render(){
    locked = false;
    const q = questions[i];
    box.innerHTML = `
      <div class="q-meta"><span>QUESTION ${String(i + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}</span>
        <span>SCORE ${score}</span></div>
      <div class="q-bar"><i style="width:${(i / questions.length) * 100}%"></i></div>
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
    const q = questions[i];
    const good = j === q.c;
    if (good) score++;

    box.querySelectorAll('.q-opt').forEach((b, k) => {
      b.disabled = true;
      const mark = b.querySelector('b');
      if (k === q.c){ b.classList.add('right'); mark.outerHTML = `<b class="mark">${ICON_OK}</b>`; }
      else if (k === j){ b.classList.add('wrong'); mark.outerHTML = `<b class="mark">${ICON_NO}</b>`; }
      else b.classList.add('dim');
    });
    box.querySelector('.q-bar i').style.width = ((i + 1) / questions.length) * 100 + '%';

    const foot = box.querySelector('.q-foot');
    foot.hidden = false;
    foot.innerHTML = `
      <p class="q-explain"><strong>${good ? 'Correct.' : 'Not quite.'}</strong> ${q.ex}</p>
      <button class="btn ghost small" id="qNext" type="button">
        ${i === questions.length - 1 ? 'See results' : 'Next question'}${ARROW}</button>`;
    $('#qNext').addEventListener('click', () => {
      i++;
      i < questions.length ? render() : results();
    });
  }

  function results(){
    const [rank, note] = rankOf(score);
    box.innerHTML = `
      <div class="q-meta"><span>RESULT</span><span>SCORE ${score} / ${questions.length}</span></div>
      <div class="q-bar"><i style="width:100%"></i></div>
      <p class="q-score">${score}<span> / ${questions.length}</span></p>
      <h3 class="q-rank">${rank}</h3>
      <p class="q-note">${note}</p>
      <button class="btn solid small" id="qAgain" type="button">Take it again</button>`;
    $('#qAgain').addEventListener('click', startRound);
  }

  function startRound(){
    questions = shuffle(QUESTIONS).map(q => {
      const answers = shuffle(q.a.map((text, index) => ({ text, correct: index === q.c })));
      return { ...q, a: answers.map(answer => answer.text), c: answers.findIndex(answer => answer.correct) };
    });
    i = 0;
    score = 0;
    render();
  }

  startRound();
})();