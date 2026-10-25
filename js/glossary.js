import { $, $$ } from './shared.js';

/* ---------------- 05 · Glossary ----------------
   NEW module: a searchable astronomy glossary. Clickable category filter
   chips (Stellar, Planetary, Cosmology, Tools, Mechanics) plus a live
   text filter — the user types and the list narrows. Each term exposes
   a definition + a short "see also" link that jumps to the relevant
   chapter. Designed to integrate with the existing aesthetic (gold-on-ink,
   monospace labels, dotted-leader rows). */
(() => {
  const wrap = $('#glossaryGrid'); if (!wrap) return;
  const search = $('#glossarySearch');
  const chips = $$('#glossaryFilters .gl-chip');
  const countEl = $('#glossaryCount');

  /* Glossary entries — grouped by topic so learners can scan a category at a time.
     Each entry: term (display), category (filter key), def (definition paragraph),
     see (optional chapter anchor — rendered as a gold link). */
  const TERMS = [
    /* Stellar */
    { term:'Protostar', cat:'Stellar',
      def:'A young star still gathering mass from its parent molecular cloud. The protostar phase ends once hydrogen fusion ignites in the core and radiation pushes back against the infalling gas.',
      see:'#stars' },
    { term:'Main sequence', cat:'Stellar',
      def:'The longest, most stable phase of a star\u2019s life, during which hydrogen fuses to helium in the core. About 90% of all stars in the night sky are currently on the main sequence.',
      see:'#stars' },
    { term:'Red giant', cat:'Stellar',
      def:'A late-stage low-mass star that has swollen and cooled after exhausting the hydrogen in its core. The Sun will become one in roughly 5 billion years, expanding to perhaps 200\u00d7 its current radius.',
      see:'#stars' },
    { term:'Supergiant', cat:'Stellar',
      def:'A massive, luminous late-stage star — the high-mass counterpart of the red giant. Supergiants are the largest known stars and end their lives as supernovae. Examples: Betelgeuse, Antares, Rigel.',
      see:'#stars' },
    { term:'Supernova', cat:'Stellar',
      def:'The explosive death of a massive star, briefly outshining its entire galaxy. The explosion forges elements heavier than iron and seeds the next generation of stars — every atom of gold in your body was once a supernova.',
      see:'#stars' },
    { term:'White dwarf', cat:'Stellar',
      def:'The cooling core of a low-mass star left after its outer layers have drifted away as a planetary nebula. About the size of Earth, with a density of about 1 tonne per teaspoon, it glows only with stored heat.',
      see:'#stars' },
    { term:'Neutron star', cat:'Stellar',
      def:'The collapsed core of a massive star that crushed matter to nuclear density. About 20 km across with a mass greater than the Sun. Spinning neutron stars emit lighthouse-like beams — observed as pulsars.',
      see:'#stars' },
    { term:'Black hole', cat:'Stellar',
      def:'A region of spacetime where gravity is so strong that nothing — not even light — can escape once past the event horizon. Stellar-mass black holes form from the cores of stars above ~20 solar masses.',
      see:'#stars' },
    { term:'Pulsar', cat:'Stellar',
      def:'A rapidly rotating neutron star whose beams of radiation sweep across Earth\u2019s view like a lighthouse. The fastest known pulsar, PSR J1748\u20122446ad, spins 716 times per second.',
      see:'#stars' },

    /* Planetary */
    { term:'Gas giant', cat:'Planetary',
      def:'A massive planet composed mostly of hydrogen and helium with no solid surface. Jupiter and Saturn are the Solar System\u2019s gas giants; their cores may be 10\u201320 Earth masses of rock and ice.',
      see:'#solar' },
    { term:'Ice giant', cat:'Planetary',
      def:'A planet composed mostly of denser materials — water, ammonia, and methane ices — under a hydrogen-helium envelope. Uranus and Neptune are the Solar System\u2019s ice giants.',
      see:'#solar' },
    { term:'Astronomical unit (AU)', cat:'Planetary',
      def:'The mean distance from Earth to the Sun — about 149.6 million km. Used as the standard ruler inside the Solar System; Neptune sits at 30 AU, Voyager 1 at ~164 AU.',
      see:'#scale' },
    { term:'Habitable zone', cat:'Planetary',
      def:'The orbital range around a star where temperatures allow liquid water on a planet\u2019s surface. Earth is in the middle of the Sun\u2019s habitable zone; Mars sits on its outer edge.',
      see:'#solar' },
    { term:'Exoplanet', cat:'Planetary',
      def:'A planet orbiting a star other than the Sun. Over 5,500 have been confirmed since 1992; Proxima b, an Earth-sized exoplanet around Proxima Centauri, is the nearest known at 4.24 light-years.',
      see:'#solar' },

    /* Cosmology */
    { term:'Light-year', cat:'Cosmology',
      def:'The distance light travels in one Julian year through a vacuum — about 9.46 trillion km. Often confused with a unit of time, but it is purely a distance. The nearest star is 4.24 light-years away.',
      see:'#scale' },
    { term:'Parsec', cat:'Cosmology',
      def:'A distance of about 3.26 light-years, defined by the parallax of one arcsecond. Astronomers prefer parsecs for galactic and extragalactic scales; the Andromeda Galaxy is ~780 kiloparsecs away.',
      see:'#scale' },
    { term:'Redshift', cat:'Cosmology',
      def:'The stretching of light to longer wavelengths caused by the expansion of space between source and observer. Higher redshift means greater distance — and we see the source further back in time.',
      see:'#scale' },
    { term:'Cosmic microwave background (CMB)', cat:'Cosmology',
      def:'The afterglow of the Big Bang — the oldest light in the universe, released 380,000 years after the Big Bang when atoms formed and photons could travel freely. Today it is a faint glow at 2.725 K, detectable in every direction.',
      see:'#scale' },
    { term:'Observable universe', cat:'Cosmology',
      def:'The spherical volume of space from which light has had time to reach us since the Big Bang — 46.5 billion light-years in radius. Beyond this horizon, the universe almost certainly continues, but its light has not yet arrived.',
      see:'#scale' },
    { term:'Sagittarius A*', cat:'Cosmology',
      def:'The supermassive black hole at the center of the Milky Way, ~4.3 million solar masses. The Event Horizon Telescope captured its first direct image in 2022 — a glowing orange donut of plasma at the event horizon.',
      see:'#scale' },

    /* Tools */
    { term:'Telescope', cat:'Tools',
      def:'An instrument that collects and focuses light (or other radiation) to make distant objects visible. Galileo\u2019s first refractor (1609) had ~30\u00d7 magnification; today\u2019s Webb telescope collects 25 m\u00b2 of light across the universe.',
      see:'#stars' },
    { term:'Spectroscopy', cat:'Tools',
      def:'The study of light split into its component wavelengths. Each element leaves unique fingerprint lines in a star\u2019s spectrum, revealing its composition, temperature, and motion — even for objects trillions of km away.',
      see:'#stars' },
    { term:'Event Horizon Telescope', cat:'Tools',
      def:'A planet-spanning network of radio dishes observing the same target at the same time, acting as one Earth-sized telescope. It produced the first direct image of a black hole (M87\u2019s in 2019, Sagittarius A\u2019s in 2022).',
      see:'#scale' },

    /* Mechanics */
    { term:'Orbit', cat:'Mechanics',
      def:'The path one body follows around another under gravity. Orbits are governed by Kepler\u2019s three laws: closed ellipses, equal areas in equal times, and the period\u2013distance relationship that powers the Solar System map above.',
      see:'#solar' },
    { term:'Kepler\u2019s laws', cat:'Mechanics',
      def:'Three empirical rules Johannes Kepler derived from observations: (1) orbits are ellipses with the Sun at one focus, (2) a line from planet to Sun sweeps equal areas in equal times, (3) the squared period is proportional to the cubed semi-major axis.',
      see:'#solar' },
    { term:'Fusion', cat:'Mechanics',
      def:'The joining of light atomic nuclei to form heavier ones, releasing energy by the mass\u2013energy equivalence E=mc\u00b2. Hydrogen-to-helium fusion powers every main-sequence star; heavier fusion stages occur only in massive stars.',
      see:'#stars' },
    { term:'Event horizon', cat:'Mechanics',
      def:'The boundary around a black hole past which nothing can return. For a non-rotating black hole of mass M, its Schwarzschild radius is R = 2GM/c\u00b2 — about 30 km for a 10-solar-mass black hole.',
      see:'#stars' },
    { term:'Accretion disk', cat:'Mechanics',
      def:'A flat, rotating disk of gas and dust spiralling into a massive central body — a protostar, white dwarf, neutron star, or black hole. Friction heats the disk to enormous temperatures, often making it brighter than any star.',
      see:'#stars' }
  ];

  const CAT_LABELS = {
    All:      'All',
    Stellar:  'Stars & Lifecycles',
    Planetary:'Planets & Moons',
    Cosmology:'Cosmology',
    Tools:    'Telescopes & Tools',
    Mechanics:'Mechanics'
  };

  let active = 'All';

  function matches(t, filter){
    if (active !== 'All' && t.cat !== active) return false;
    if (!filter) return true;
    const hay = (t.term + ' ' + t.def).toLowerCase();
    return hay.includes(filter.toLowerCase());
  }

  function termCard(t){
    const seeLabel = t.see === '#solar' ? 'Solar System'
                   : t.see === '#stars' ? 'Lives of Stars'
                   : t.see === '#scale' ? 'Cosmic Scale' : '';
    const seeEl = seeLabel
      ? `<a class="gl-see" href="${t.see}" aria-label="Open the ${seeLabel} chapter">See: ${seeLabel} →</a>`
      : '';
    return `
      <article class="gl-card">
        <header class="gl-head">
          <h3 class="gl-term">${t.term}</h3>
          <span class="gl-cat">${CAT_LABELS[t.cat]}</span>
        </header>
        <p class="gl-def">${t.def}</p>
        ${seeEl}
      </article>`;
  }

  function render(){
    const filter = (search?.value || '').trim();
    const matches_ = TERMS.filter(t => matches(t, filter));
    wrap.innerHTML = matches_.map(termCard).join('');
    if (countEl){
      countEl.textContent =
        matches_.length === 1 ? '1 term'
                              : `${matches_.length} of ${TERMS.length} terms`;
    }
  }

  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(o => o.classList.remove('active'));
    c.classList.add('active');
    active = c.dataset.cat;
    render();
  }));
  search?.addEventListener('input', render);
  render();
})();
