export const landmarks = [
  {
    name: 'Earth', label: 'HOME', distance: '0 km (for now)', x: .16, y: .53, color: '#c9db84',
    description: 'A rocky planet with liquid-water oceans and a thin atmosphere. As far as we know, it is the only world with life.'
  },
  {
    name: 'Solar System', label: 'OUR NEIGHBORHOOD', distance: 'About 2 light-years across (including the distant Oort cloud)', x: .32, y: .39, color: '#db8b69',
    description: 'The Sun and everything held by its gravity: eight planets, dwarf planets, moons, comets, and smaller pieces of rock and ice.'
  },
  {
    name: 'Milky Way', label: 'OUR GALAXY', distance: 'About 100,000 light-years across', x: .51, y: .60, color: '#c9db84',
    description: 'A barred spiral galaxy containing hundreds of billions of stars. Our Solar System sits in one of its spiral arms.'
  },
  {
    name: 'Andromeda', label: 'NEARBY GALAXY', distance: 'About 2.5 million light-years away', x: .70, y: .34, color: '#db8b69',
    description: 'The nearest large galaxy to the Milky Way. Its light has traveled for millions of years before reaching us.'
  },
  {
    name: 'Observable universe', label: 'THE HORIZON', distance: 'About 93 billion light-years across', x: .87, y: .56, color: '#c9db84',
    description: 'The region from which light has had time to reach us since the universe began. The whole universe may extend far beyond it.'
  }
];

export const facts = [
  'Looking far away is also looking back in time: sunlight takes about eight minutes to reach Earth.',
  'A day on Venus is longer than its year. It rotates once in about 243 Earth days, but orbits the Sun in about 225.',
  'Neutron stars pack more mass than the Sun into a sphere roughly the size of a city.',
  'The observable universe is about 93 billion light-years across because space expanded while ancient light traveled.',
  'Saturn’s average density is lower than water’s. It would float in a bathtub large enough to hold it (and made of something stronger).'
];

export const lessons = [
  {
    title: 'A universe with a horizon',
    text: 'The universe is about 13.8 billion years old. Because light travels at a finite speed, we can observe only regions whose light has had time to reach us. This boundary is the observable universe; it is not necessarily the edge of everything.',
    takeaway: 'A horizon marks what we can observe, not necessarily what exists.',
    prompt: 'Think: why does a telescope also act like a time machine?'
  },
  {
    title: 'The lives of stars',
    text: 'Stars form when gravity gathers gas in a molecular cloud. As the center compresses and heats, hydrogen fusion can begin. A star’s mass shapes its lifetime and ending: Sun-like stars leave white dwarfs, while more massive stars can explode and leave neutron stars or black holes.',
    takeaway: 'A star’s birth mass helps determine how it lives and dies.',
    prompt: 'Notice: the Sun is a star, but stars do not all share its fate.'
  },
  {
    title: 'Orbits are falling, with a twist',
    text: 'Gravity pulls an orbiting object inward while its forward motion carries it onward. Together, those motions make a curved path. Change the object’s speed and direction, and the orbit can change too.',
    takeaway: 'An orbit is continuous falling that keeps missing the ground.',
    prompt: 'Imagine giving a ball more sideways speed on a very tall mountain.'
  },
  {
    title: 'Reading the light',
    text: 'Astronomers learn about distant objects from the light they collect. A spectrum spreads light into its component wavelengths; patterns in it can reveal what an object is made of, how hot it is, and whether it is moving toward or away from us.',
    takeaway: 'Light carries clues across distances we cannot cross.',
    prompt: 'Ask: what could a fingerprint in starlight tell us?'
  }
];
