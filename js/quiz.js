/* ============================================================
   Cosmos Learn — quiz.js
   Interactive space quiz with scoring + explanations.
   Used on activities.html
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('quizForm');
  if (!form) return;

  var QUESTIONS = [
    {
      q: 'Which planet has the hottest surface?',
      opts: ['Mercury', 'Venus', 'Mars', 'Jupiter'],
      correct: 1,
      why: "Venus' thick CO\u2082 atmosphere traps heat in a runaway greenhouse effect \u2014 about 465 \u00B0C, hotter than Mercury even though Venus is farther from the Sun."
    },
    {
      q: 'How long does sunlight take to reach Earth?',
      opts: ['8 seconds', 'About 8 minutes', 'About 8 hours', 'It arrives instantly'],
      correct: 1,
      why: 'Light travels 300,000 km/s, but the Sun is 150 million km away \u2014 the trip takes about 8 minutes 20 seconds.'
    },
    {
      q: 'What galaxy do we live in?',
      opts: ['Andromeda', 'The Milky Way', 'Triangulum', 'The Whirlpool'],
      correct: 1,
      why: 'Our Sun is one of 100\u2013400 billion stars in the Milky Way. Andromeda is our nearest large galactic neighbour.'
    },
    {
      q: 'Which mission first landed humans on the Moon?',
      opts: ['Artemis I', 'Apollo 11', 'Gemini 4', 'Voyager 2'],
      correct: 1,
      why: 'Apollo 11, July 1969. Neil Armstrong and Buzz Aldrin spent about 21 hours on the lunar surface.'
    },
    {
      q: 'What is a light-year?',
      opts: ['A unit of time', 'A unit of distance', 'The brightness of a star', 'The speed of light'],
      correct: 1,
      why: 'A light-year is the distance light travels in one year \u2014 about 9.46 trillion km.'
    },
    {
      q: 'Which planet is the largest in the Solar System?',
      opts: ['Saturn', 'Neptune', 'Jupiter', 'Earth'],
      correct: 2,
      why: 'Jupiter is 11\u00D7 wider than Earth \u2014 about 1,300 Earths would fit inside it.'
    },
    {
      q: 'Why does Mars look red?',
      opts: ['Red lava flows', 'Iron oxide (rust) dust', 'Red algae oceans', 'Its thin atmosphere'],
      correct: 1,
      why: 'Martian soil is rich in iron oxide \u2014 literal rust \u2014 which paints the whole planet red.'
    },
    {
      q: 'Where does the James Webb Space Telescope orbit?',
      opts: ['Low Earth orbit', 'Around the Moon', 'A point called L2, 1.5 million km away', 'In orbit around Mars'],
      correct: 2,
      why: 'JWST sits at Lagrange point 2, far from Earth\u2019s heat and light, with a tennis-court-sized sunshield keeping it near \u2212233 \u00B0C.'
    }
  ];

  function message(score, total) {
    var pct = score / total;
    if (pct === 1) return 'Perfect score \u2014 commander material! \uD83C\uDFC5';
    if (pct >= 0.75) return 'Excellent, astronaut! Almost a perfect orbit. \uD83D\uDE80';
    if (pct >= 0.5) return 'Good launch \u2014 review the explanations and try again. \uD83D\uDEF0\uFE0F';
    return 'Every astronomer starts somewhere. Read the basics and re-launch! \uD83C\uDF31';
  }

  /* Build the quiz */
  form.innerHTML = QUESTIONS.map(function (q, qi) {
    var options = q.opts.map(function (opt, oi) {
      return '<label class="option">' +
        '<input type="radio" name="q' + qi + '" value="' + oi + '">' +
        '<span>' + opt + '</span></label>';
    }).join('');
    return '<fieldset class="question" data-q="' + qi + '">' +
      '<legend class="q-title">' + (qi + 1) + '. ' + q.q + '</legend>' +
      options +
      '<p class="explanation">\uD83D\uDCA1 ' + q.why + '</p>' +
      '</fieldset>';
  }).join('') +
  '<div class="quiz-actions">' +
    '<button type="submit" class="btn btn-red">Check my answers</button>' +
    '<button type="button" class="btn btn-ghost-dark hidden" id="quizRestart">Try again</button>' +
  '</div>' +
  '<p class="quiz-score" id="quizScore" aria-live="polite"></p>';

  /* Grade it */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var score = 0;
    var unanswered = 0;

    QUESTIONS.forEach(function (q, qi) {
      var fieldset = form.querySelector('fieldset[data-q="' + qi + '"]');
      var chosen = form.querySelector('input[name="q' + qi + '"]:checked');
      var options = fieldset.querySelectorAll('.option');
      for (var oi = 0; oi < options.length; oi++) {
        options[oi].classList.remove('correct', 'wrong');
        if (oi === q.correct) options[oi].classList.add('correct');
        if (chosen && Number(chosen.value) === oi && oi !== q.correct) {
          options[oi].classList.add('wrong');
        }
      }
      if (!chosen) unanswered++;
      if (chosen && Number(chosen.value) === q.correct) score++;
      var why = fieldset.querySelector('.explanation');
      if (why) why.classList.add('show');
    });

    var scoreEl = document.getElementById('quizScore');
    if (scoreEl) {
      if (unanswered > 0) {
        scoreEl.textContent = '\u26A0\uFE0F You left ' + unanswered +
          (unanswered === 1 ? ' question' : ' questions') +
          ' unanswered \u2014 answer everything to get your official score!';
      } else {
        scoreEl.textContent = 'You scored ' + score + ' / ' + QUESTIONS.length + '. ' + message(score, QUESTIONS.length);
      }
      scoreEl.classList.add('show');
      scoreEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    var restart = document.getElementById('quizRestart');
    if (restart) restart.classList.remove('hidden');

    var inputs = form.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) inputs[i].disabled = true;
  });

  /* Restart */
  form.addEventListener('click', function (e) {
    if (e.target.id !== 'quizRestart') return;
    var inputs = form.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) { inputs[i].disabled = false; inputs[i].checked = false; }
    var opts = form.querySelectorAll('.option');
    for (var j = 0; j < opts.length; j++) opts[j].classList.remove('correct', 'wrong');
    var exps = form.querySelectorAll('.explanation');
    for (var k = 0; k < exps.length; k++) exps[k].classList.remove('show');
    var scoreEl = document.getElementById('quizScore');
    if (scoreEl) { scoreEl.textContent = ''; scoreEl.classList.remove('show'); }
    e.target.classList.add('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
