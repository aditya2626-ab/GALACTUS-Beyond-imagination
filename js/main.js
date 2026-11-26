/* ============================================================
   Galactus — main.js
   All site interactivity. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  $$('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Dark / light theme ---------- */
  var themeBtn = $('#themeToggle');
  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    if (themeBtn) {
      themeBtn.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19'; /* sun / moon */
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  var dark = false;
  try { dark = localStorage.getItem('galactus-theme') === 'dark'; } catch (e) {}
  applyTheme(dark);
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      dark = !dark;
      try { localStorage.setItem('galactus-theme', dark ? 'dark' : 'light'); } catch (e) {}
      applyTheme(dark);
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = $('#navToggle');
  var mainNav = $('#mainNav');
  function closeNav() {
    document.body.classList.remove('nav-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '\u2630';
    }
  }
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.textContent = open ? '\u2715' : '\u2630';
    });
    $$('#mainNav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = $('#siteHeader');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var t0 = performance.now();
    function tick(t) {
      var p = Math.min((t - t0) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = $$('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { io2.observe(el); });
  }

  /* ---------- "Did you know?" fact rotator ---------- */
  var slides = $$('.fact-slide');
  if (slides.length > 1) {
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 6000);
  }

  /* ---------- Accordions (event delegation) ---------- */
  document.addEventListener('click', function (e) {
    var head = e.target.closest('.accordion-head');
    if (!head) return;
    var acc = head.closest('.accordion');
    if (!acc) return;
    var open = acc.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Filter chips (missions, activities) ---------- */
  var chips = $$('.filter-chip');
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var f = chip.getAttribute('data-filter');
        var shown = 0;
        $$('.filterable').forEach(function (el) {
          var show = f === 'all' || el.getAttribute('data-category') === f;
          el.classList.toggle('filter-hidden', !show);
          if (show) shown++;
        });
        var status = $('#filterStatus');
        if (status) {
          status.textContent = 'Showing ' + shown + (shown === 1 ? ' item.' : ' items.');
        }
      });
    });
  }

  /* ---------- Live page search (utility bar) ---------- */
  var searchInput = $('#searchInput');
  var searchStatus = $('#searchStatus');
  var searchForm = $('#siteSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      var items = $$('[data-searchable]');
      if (!items.length) { if (searchStatus) searchStatus.textContent = ''; return; }
      var shown = 0;
      items.forEach(function (el) {
        var match = !q || el.textContent.toLowerCase().indexOf(q) !== -1;
        el.classList.toggle('search-hidden', !match);
        if (match) shown++;
      });
      if (searchStatus) {
        if (!q) searchStatus.textContent = '';
        else if (shown === 0) searchStatus.textContent = 'No matches for \u201C' + searchInput.value.trim() + '\u201D on this page.';
        else searchStatus.textContent = shown + (shown === 1 ? ' match' : ' matches') + ' on this page.';
      }
    });
    if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- Planet explorer (solar-system.html) ---------- */
  var PLANETS = {
    sun: {
      name: 'The Sun', tagline: 'Our home star',
      distance: '\u2014 (we orbit it!)',
      diameter: '1,392,700 km',
      day: '25\u201335 days (it spins at different speeds)',
      year: '230 million years to orbit the Milky Way',
      moons: '\u2014',
      fact: 'The Sun holds 99.8% of all the mass in the Solar System. Everything else is leftovers.',
      swatch: 'swatch-sun'
    },
    mercury: {
      name: 'Mercury', tagline: 'The speediest planet',
      distance: '57.9 million km',
      diameter: '4,879 km',
      day: '176 Earth days (one sunrise to the next)',
      year: '88 days',
      moons: '0',
      fact: 'A day on Mercury is longer than its year \u2014 the Sun rises only once every 176 Earth days.',
      swatch: 'swatch-mercury'
    },
    venus: {
      name: 'Venus', tagline: 'The runaway greenhouse',
      distance: '108.2 million km',
      diameter: '12,104 km',
      day: '243 Earth days (and it spins backwards!)',
      year: '225 days',
      moons: '0',
      fact: 'Venus spins backwards, so the Sun rises in the west and sets in the east.',
      swatch: 'swatch-venus'
    },
    earth: {
      name: 'Earth', tagline: 'The goldilocks world',
      distance: '149.6 million km',
      diameter: '12,756 km',
      day: '24 hours',
      year: '365.25 days',
      moons: '1',
      fact: 'Earth is the only place in the universe where we know liquid water is stable on the surface.',
      swatch: 'swatch-earth'
    },
    mars: {
      name: 'Mars', tagline: 'The rusty frontier',
      distance: '227.9 million km',
      diameter: '6,792 km',
      day: '24.6 hours',
      year: '687 days',
      moons: '2 (Phobos & Deimos)',
      fact: 'Olympus Mons is the tallest volcano in the Solar System \u2014 about 2.5\u00D7 taller than Mount Everest.',
      swatch: 'swatch-mars'
    },
    jupiter: {
      name: 'Jupiter', tagline: 'The giant guardian',
      distance: '778.6 million km',
      diameter: '142,984 km',
      day: '9.9 hours',
      year: '11.9 Earth years',
      moons: '95+',
      fact: "Jupiter's Great Red Spot is a storm wider than Earth that has raged for centuries.",
      swatch: 'swatch-jupiter'
    },
    saturn: {
      name: 'Saturn', tagline: 'Lord of the rings',
      distance: '1.43 billion km',
      diameter: '120,536 km',
      day: '10.7 hours',
      year: '29.4 Earth years',
      moons: '146+',
      fact: "Saturn's rings are mostly water ice \u2014 pieces range from dust grains to bigger than a house.",
      swatch: 'swatch-saturn'
    },
    uranus: {
      name: 'Uranus', tagline: 'The sideways ice giant',
      distance: '2.87 billion km',
      diameter: '51,118 km',
      day: '17.2 hours',
      year: '84 Earth years',
      moons: '28',
      fact: 'Uranus rolls around the Sun on its side, tilted about 98 degrees.',
      swatch: 'swatch-uranus'
    },
    neptune: {
      name: 'Neptune', tagline: 'The windy blue giant',
      distance: '4.5 billion km',
      diameter: '49,528 km',
      day: '16.1 hours',
      year: '165 Earth years',
      moons: '16',
      fact: "Neptune's winds can scream at 2,100 km/h \u2014 the fastest in the Solar System.",
      swatch: 'swatch-neptune'
    }
  };

  var stripBtns = $$('.planet-btn');
  var planetName = $('#planetName');
  if (stripBtns.length && planetName) {
    var swatchEl = $('#planetSwatch');
    function setPlanet(key) {
      var p = PLANETS[key];
      if (!p) return;
      planetName.textContent = p.name;
      $('#planetTagline').textContent = p.tagline;
      $('#planetDistance').textContent = p.distance;
      $('#planetDiameter').textContent = p.diameter;
      $('#planetDay').textContent = p.day;
      $('#planetYear').textContent = p.year;
      $('#planetMoons').textContent = p.moons;
      $('#planetFact').textContent = p.fact;
      if (swatchEl) swatchEl.className = 'planet-big ' + p.swatch;
      stripBtns.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-planet') === key);
      });
    }
    stripBtns.forEach(function (b) {
      b.addEventListener('click', function () { setPlanet(b.getAttribute('data-planet')); });
    });
    setPlanet(stripBtns[0].getAttribute('data-planet'));
  }

  /* ---------- "Your weight across the Solar System" mini lab ---------- */
  var weightInput = $('#weightInput');
  var weightResults = $('#weightResults');
  if (weightInput && weightResults) {
    var GRAVITY = [
      ['The Moon', 0.17, 'swatch-moon'],
      ['Mercury', 0.38, 'swatch-mercury'],
      ['Venus', 0.91, 'swatch-venus'],
      ['Mars', 0.38, 'swatch-mars'],
      ['Jupiter', 2.53, 'swatch-jupiter'],
      ['Saturn', 1.07, 'swatch-saturn'],
      ['Uranus', 0.89, 'swatch-uranus'],
      ['Neptune', 1.14, 'swatch-neptune']
    ];
    function renderWeights() {
      var w = parseFloat(weightInput.value);
      if (!w || w <= 0) {
        weightResults.innerHTML = '<p class="weight-hint">Enter your Earth weight above and watch it change world by world \u2728</p>';
        return;
      }
      weightResults.innerHTML = GRAVITY.map(function (g) {
        return '<div class="weight-chip">' +
          '<span class="planet-dot ' + g[2] + '"></span>' +
          '<div><strong>' + g[0] + '</strong><span>' + (w * g[1]).toFixed(1) + ' kg</span></div>' +
          '</div>';
      }).join('');
    }
    weightInput.addEventListener('input', renderWeights);
    renderWeights();
  }

  /* ---------- Newsletter signup (demo validation) ---------- */
  var newsForm = $('#newsletterForm');
  var newsMsg = $('#newsletterMsg');
  if (newsForm && newsMsg) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailEl = $('#newsletterEmail');
      var email = emailEl ? emailEl.value.trim() : '';
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      newsMsg.textContent = ok
        ? '\uD83C\uDF89 Welcome aboard! Check your inbox for your first lesson.'
        : "Hmm, that email doesn't look right \u2014 try again?";
      newsMsg.classList.toggle('ok', ok);
      newsMsg.classList.toggle('err', !ok);
      if (ok && emailEl) newsForm.reset();
    });
  }

  /* ---------- Highlight the current page in the nav ---------- */
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (path === '') path = 'index.html';
  $$('#mainNav a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').toLowerCase();
    a.classList.toggle('active', href === path);
  });
})();
