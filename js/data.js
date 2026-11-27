export const facts = [
  'Looking far away is also looking back in time: sunlight takes about eight minutes to reach Earth.',
  'A day on Venus is longer than its year: it rotates in about 243 Earth days, but orbits the Sun in about 225.',
  'Neutron stars pack more mass than the Sun into a sphere roughly the size of a city.',
  'The observable universe is about 93 billion light-years across because space expanded while ancient light traveled.',
  'Saturn’s average density is lower than water’s — it would float in a bathtub big enough to hold it.',
  'The Sun contains nearly all the mass in the Solar System, yet it is a middle-sized star.',
  'Pluto was reclassified as a dwarf planet in 2006 by the International Astronomical Union.',
  'The cosmic microwave background is a faint glow from when the universe became transparent to light.'
];
export const tasks = [
  { type: 'order', title: 'Put a star’s early life in order', items: ['A cloud of gas and dust gathers under gravity', 'Hydrogen fusion begins in the core', 'A stable main-sequence star shines'], answer: [0, 1, 2], explain: 'Gravity gathers the cloud first. As the core heats, fusion begins and the star enters its main-sequence stage.' },
  { type: 'match', title: 'Match each spacecraft role with its job', pairs: [['Moves across a planetary surface', 'Rover'], ['Circles a world to map or study it', 'Orbiter'], ['Investigates space or flies past a target', 'Probe']], options: ['Rover', 'Orbiter', 'Probe'], explain: 'A rover lands and moves; an orbiter circles a world; a probe investigates a target or its surroundings.' },
  { type: 'multi', title: 'Select the four rocky inner planets', items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'], answer: [0, 1, 2, 3], explain: 'The four inner planets are Mercury, Venus, Earth and Mars. Jupiter and Saturn are outer giant planets.' },
  { type: 'choose', title: 'A galaxy’s light took 2.5 million years to reach us. What do you see?', items: ['The galaxy as it was 2.5 million years ago', 'The galaxy exactly as it is today', 'The edge of the whole universe'], answer: 0, explain: 'Light takes time to travel, so the image shows the galaxy when that light began its journey.' },
  { type: 'choose', title: 'Which unit best describes the average Earth–Sun distance?', items: ['Astronomical Unit (AU)', 'Light-year', 'Parsec'], answer: 0, explain: 'One AU is the average distance between Earth and the Sun, about 149.6 million kilometres.' },
  { type: 'choose', title: 'What does a galaxy’s redshift help astronomers study?', items: ['The expansion of the universe', 'A planet’s surface temperature', 'The number of moons around a planet'], answer: 0, explain: 'The redshift of distant galaxies is a key observation showing that the universe is expanding.' }
];
