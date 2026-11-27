// Shared mission data + small helpers for the arcade.

export function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFrom(key) {
  return mulberry32(hash(key));
}

export function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

export function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// ---------- Mission 05 · Galaxy facts ----------
export const GALAXY_FACTS = {
  spiral:
    'Spiral galaxies have flat rotating disks with winding arms of young blue stars and gas — like our Milky Way and Andromeda. About 60% of bright galaxies are spirals.',
  elliptical:
    'Elliptical galaxies are smooth football-shaped balls of old amber stars with little gas and no new star formation. Many are giants found at the centres of galaxy clusters.',
  irregular:
    'Irregular galaxies have no defined shape — often scrambled by gravity from a neighbour. The Magellanic Clouds beside the Milky Way are classic examples.',
};

// ---------- Mission 04 · Messier targets ----------
export const MESSIER_TARGETS = [
  { id: 'm1', name: 'Crab Nebula', catalog: 'M1', type: 'nebula', fact: 'Remains of a supernova seen from Earth in 1054 CE.' },
  { id: 'm13', name: 'Great Hercules Cluster', catalog: 'M13', type: 'cluster', fact: 'A ball of ~300,000 ancient stars; the Arecibo message was aimed here.' },
  { id: 'm31', name: 'Andromeda Galaxy', catalog: 'M31', type: 'galaxy', fact: 'The nearest large galaxy — it will merge with ours in ~4.5 billion years.' },
  { id: 'm42', name: 'Orion Nebula', catalog: 'M42', type: 'nebula', fact: 'A stellar nursery where new stars are being born right now.' },
  { id: 'm45', name: 'Pleiades', catalog: 'M45', type: 'cluster', fact: 'The Seven Sisters — young hot stars wrapped in blue reflection nebulosity.' },
  { id: 'm51', name: 'Whirlpool Galaxy', catalog: 'M51', type: 'galaxy', fact: 'The first galaxy recognised as a spiral, with a famous grand-design shape.' },
  { id: 'm57', name: 'Ring Nebula', catalog: 'M57', type: 'planetary', fact: 'A dying Sun-like star puffing off its outer layers.' },
  { id: 'm81', name: "Bode's Galaxy", catalog: 'M81', type: 'galaxy', fact: 'A bright spiral galaxy 12 million light-years away.' },
  { id: 'm8', name: 'Lagoon Nebula', catalog: 'M8', type: 'nebula', fact: 'A giant glowing cloud of hydrogen visible to the naked eye from dark sites.' },
  { id: 'm22', name: 'Sagittarius Cluster', catalog: 'M22', type: 'cluster', fact: 'One of the nearest globular clusters to Earth.' },
  { id: 'm104', name: 'Sombrero Galaxy', catalog: 'M104', type: 'galaxy', fact: 'A galaxy seen edge-on with a dramatic dust lane like a hat brim.' },
  { id: 'm27', name: 'Dumbbell Nebula', catalog: 'M27', type: 'planetary', fact: 'A planetary nebula shaped like an hourglass of cast-off gas.' },
];

// ---------- Mission 02 · Telescope catalogue ----------
export const SCOPE_TARGETS = [
  { id: 'moon', name: 'The Moon', ra: 5.5, dec: 15, kind: 'moon', info: "Earth's companion. Craters, maria and mountain ranges are visible even in small scopes." },
  { id: 'jupiter', name: 'Jupiter', ra: 3.2, dec: 22, kind: 'planet', info: 'The largest planet — watch the four Galilean moons shuffle night by night.' },
  { id: 'saturn', name: 'Saturn', ra: 21.8, dec: -15, kind: 'planet', info: 'The ring system spans 280,000 km yet is only ~10 m thick in places.' },
  { id: 'm31', name: 'Andromeda Galaxy (M31)', ra: 0.7, dec: 41, kind: 'galaxy', info: '2.5 million light-years away — the most distant object visible unaided.' },
  { id: 'm42', name: 'Orion Nebula (M42)', ra: 5.6, dec: -5, kind: 'nebula', info: 'A stellar nursery 1,300 light-years away, glowing pink in H-alpha light.' },
  { id: 'm13', name: 'Hercules Cluster (M13)', ra: 16.7, dec: 36, kind: 'cluster', info: 'A spherical swarm of ~300,000 ancient stars orbiting our galaxy.' },
  { id: 'vega', name: 'Vega', ra: 18.6, dec: 39, kind: 'star', info: 'The brightest star of the summer triangle, 25 light-years away.' },
  { id: 'm57', name: 'Ring Nebula (M57)', ra: 18.9, dec: 33, kind: 'nebula', info: "A dying star's cast-off shell of glowing gas in Lyra." },
];

// ---------- Mission 03 · Distance objects (km) ----------
export const DISTANCE_OBJECTS = [
  { name: 'The International Space Station', emoji: '🛰️', km: 400_000, fact: 'Orbits about 400 km overhead — you can see it with the naked eye.' },
  { name: 'The Moon', emoji: '🌕', km: 384_400, fact: 'Light takes 1.3 seconds to travel from the Moon to Earth.' },
  { name: 'The Sun', emoji: '☀️', km: 149_600_000, fact: '1 astronomical unit — sunlight is 8 minutes 20 seconds old when it reaches you.' },
  { name: 'Mars (closest approach)', emoji: '🔴', km: 54_600_000, fact: 'At its nearest, Mars is still over 140 times farther than the Moon.' },
  { name: 'Jupiter', emoji: '🪐', km: 778_500_000, fact: 'About 5.2 AU from the Sun — light takes ~43 minutes to reach it.' },
  { name: 'Neptune', emoji: '🔵', km: 4_500_000_000, fact: 'The farthest planet — discovered with mathematics before it was ever seen.' },
  { name: 'Voyager 1 (current distance)', emoji: '📡', km: 24_700_000_000, fact: 'The farthest human-made object, flying through interstellar space.' },
  { name: 'Proxima Centauri (nearest star)', emoji: '⭐', km: 40_100_000_000_000, fact: '4.24 light-years — our fastest spacecraft would take ~70,000 years to get there.' },
  { name: 'Sirius (brightest night star)', emoji: '✨', km: 81_500_000_000_000, fact: '8.6 light-years away, shining 25 times brighter than the Sun.' },
  { name: 'Centre of the Milky Way', emoji: '🌌', km: 236_000_000_000_000_000, fact: '~26,000 light-years — the light left before humans existed.' },
  { name: 'Andromeda Galaxy', emoji: '🌌', km: 236_000_000_000_000_000_00, fact: '2.5 million light-years — the most distant thing visible to the naked eye.' },
  { name: 'Messier 87 (black hole imaged)', emoji: '🕳️', km: 520_000_000_000_000_000_000, fact: '55 million light-years — the first black hole ever photographed (2019).' },
];

// ---------- Mission 06 · Astronomy through time ----------
export const TIMELINE_EVENTS = [
  { id: 'eratosthenes', year: -240, yearLabel: '240 BCE', event: 'Measured the circumference of the Earth using shadows', scientist: 'Eratosthenes', detail: 'Compare summer shadow angles in Alexandria and Syene to estimate Earth’s size within a few percent.' },
  { id: 'ptolemy', year: 150, yearLabel: '150 CE', event: 'Published the Almagest, the geocentric model of the heavens', scientist: 'Ptolemy', detail: 'The standard star catalogue and Earth-centred model used for over 1,300 years.' },
  { id: 'copernicus', year: 1543, yearLabel: '1543', event: 'Proposed the heliocentric model in "De Revolutionibus"', scientist: 'Nicolaus Copernicus', detail: 'Placed the Sun, not Earth, at the centre of the solar system.' },
  { id: 'galileo', year: 1610, yearLabel: '1610', event: 'Discovered the four largest moons of Jupiter', scientist: 'Galileo Galilei', detail: 'Moons orbiting Jupiter proved not everything circles the Earth.' },
  { id: 'newton', year: 1687, yearLabel: '1687', event: 'Published the law of universal gravitation in "Principia"', scientist: 'Isaac Newton', detail: 'Explained why planets orbit the Sun and apples fall to Earth with one law.' },
  { id: 'herschel', year: 1781, yearLabel: '1781', event: 'Discovered Uranus, the first new planet in recorded history', scientist: 'William Herschel', detail: 'Doubled the known radius of the solar system overnight.' },
  { id: 'laplace', year: 1796, yearLabel: '1796', event: 'Proposed the nebular hypothesis of solar system formation', scientist: 'Pierre-Simon Laplace', detail: 'Planets condense from a rotating disk of gas around the young Sun.' },
  { id: 'bessel', year: 1838, yearLabel: '1838', event: 'First measured the distance to a star (61 Cygni)', scientist: 'Friedrich Bessel', detail: 'Stellar parallax proved stars are unimaginably far away.' },
  { id: 'neptune', year: 1846, yearLabel: '1846', event: 'Neptune discovered by prediction, on paper first', scientist: 'Le Verrier & Galle', detail: 'Perturbations in Uranus’ orbit pointed to an unknown planet — found within 1° of prediction.' },
  { id: 'cmb', year: 1964, yearLabel: '1964', event: 'Discovered the cosmic microwave background radiation', scientist: 'Penzias & Wilson', detail: 'The afterglow of the Big Bang, accidentally found while calibrating a horn antenna.' },
  { id: 'relativity', year: 1915, yearLabel: '1915', event: 'Published general relativity, gravity as curved spacetime', scientist: 'Albert Einstein', detail: 'Explained Mercury’s odd orbit and predicted light bending around the Sun.' },
  { id: 'hubble-law', year: 1929, yearLabel: '1929', event: 'Discovered that the universe is expanding', scientist: 'Edwin Hubble', detail: 'Distant galaxies recede faster the farther they are — the expanding universe.' },
  { id: 'sputnik', year: 1957, yearLabel: '1957', event: 'Sputnik 1 became the first artificial satellite', scientist: 'USSR / Korolev team', detail: 'The Space Age begins with a beeping 58 cm sphere.' },
  { id: 'apollo11', year: 1969, yearLabel: '1969', event: 'First humans walked on the Moon', scientist: 'Armstrong, Aldrin & Collins', detail: 'Apollo 11 landed in the Sea of Tranquility; 12 humans walked on the Moon in total.' },
  { id: 'voyager', year: 1977, yearLabel: '1977', event: 'Voyager 1 & 2 launched on a grand tour of the planets', scientist: 'NASA JPL', detail: 'Now in interstellar space — the farthest human-made objects, still calling home.' },
  { id: 'hst', year: 1990, yearLabel: '1990', event: 'Hubble Space Telescope launched into orbit', scientist: 'NASA & ESA', detail: 'Freed from Earth’s atmosphere, it revealed the deep universe in stunning detail.' },
  { id: 'exoplanet', year: 1995, yearLabel: '1995', event: 'First confirmed exoplanet around a Sun-like star', scientist: 'Mayor & Queloz', detail: '51 Pegasi b — a hot Jupiter. Nobel Prize 2019. Thousands of worlds followed.' },
  { id: 'pluto-flyby', year: 2015, yearLabel: '2015', event: 'New Horizons flew by Pluto', scientist: 'NASA / Alan Stern team', detail: 'Revealed nitrogen glaciers and a heart-shaped plain on the dwarf planet.' },
  { id: 'gravwaves', year: 2015, yearLabel: '2015', event: 'First direct detection of gravitational waves', scientist: 'LIGO Collaboration', detail: 'Two black holes merged 1.3 billion light-years away — spacetime itself rang like a bell.' },
  { id: 'jwst', year: 2021, yearLabel: '2021', event: 'James Webb Space Telescope launched', scientist: 'NASA, ESA & CSA', detail: 'A 6.5 m gold-coated infrared eye observing the first galaxies.' },
];
