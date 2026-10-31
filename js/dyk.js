import { $, shuffle } from './shared.js';

/* ---------------- Interlude · Did You Know ----------------
   A flip-through fact deck for casual learning. Shuffles on every visit;
   prev/next cycles with a live counter. */
(() => {
  const textEl = $('#dykText'); if (!textEl) return;
  const card = $('#dykCard'), counter = $('#dykCounter');

  const FACTS = [
    'Saturn would float in water. Its average density is less than 1 gram per cubic centimetre — the only planet lighter than H₂O.',
    'A day on Venus is longer than its year. It takes 243 Earth days to spin once, but only 225 to orbit the Sun.',
    'A teaspoon of neutron star would weigh about a billion tonnes — roughly a mountain compressed into a spoon.',
    'The Sun holds 99.86% of the Solar System\u2019s mass. Everything else — planets, moons, asteroids — shares the remaining 0.14%.',
    'Space begins 100 km overhead. If your car could drive straight up, you would reach the edge of space in about an hour.',
    'Jupiter\u2019s Great Red Spot is a storm wider than Earth that has been raging for at least 190 years.',
    'Sunlight is 8 minutes old when it reaches you. Light from the Andromeda Galaxy is 2.5 million years old.',
    'There are more stars in the observable universe than grains of sand on all of Earth\u2019s beaches.',
    'The footprints on the Moon will last for millions of years — there is no wind or water to erase them.',
    'Olympus Mons on Mars is the tallest volcano known — nearly three times the height of Mount Everest.',
    'Every atom of gold, calcium, and iron in your body was forged inside a star that died before the Sun was born.',
    'About one million Earths could fit inside the Sun — and the Sun is an ordinary mid-sized star.'
  ];

  let order = shuffle(FACTS.map((_, i) => i)), i = 0;

  function show(){
    card.classList.remove('flip'); void card.offsetWidth; card.classList.add('flip');
    textEl.textContent = FACTS[order[i]];
    counter.textContent =
      `${String(i + 1).padStart(2, '0')} / ${String(FACTS.length).padStart(2, '0')}`;
  }

  $('#dykNext').addEventListener('click', () => { i = (i + 1) % order.length; show(); });
  $('#dykPrev').addEventListener('click', () => { i = (i - 1 + order.length) % order.length; show(); });
  $('#dykShuffle').addEventListener('click', () => {
    order = shuffle(order); i = 0; show();
  });

  show();
})();
