// Landmark fields: name, category, note, distance, relative x, relative y, color.
export const scenes = [
  {
    title: 'The neighborhood', scale: '1×', caption: 'COSMIC NEIGHBORHOOD · DISTANCES COMPRESSED',
    objects: [
      ['Milky Way', 'OUR GALAXY', 'A barred spiral galaxy with hundreds of billions of stars. Our Solar System sits in one of its spiral arms.', 'About 100,000 light-years across', .24, .53, '#c9db84'],
      ['Solar System', 'OUR NEIGHBORHOOD', 'The Sun and everything held by its gravity: planets, dwarf planets, moons, comets, and distant icy bodies.', 'The distant Oort cloud may span about 2 light-years', .49, .47, '#db8b69'],
      ['Andromeda', 'NEARBY GALAXY', 'The nearest large galaxy to the Milky Way. Its light has traveled for millions of years before reaching us.', 'About 2.5 million light-years away', .73, .34, '#c9db84'],
      ['Observable universe', 'THE HORIZON', 'The region from which light has had time to reach us. The whole universe may extend far beyond it.', 'About 93 billion light-years across', .88, .70, '#db8b69']
    ]
  },
  {
    title: 'The Solar System', scale: '3×', caption: 'SOLAR SYSTEM · PLANET SIZES EXAGGERATED',
    objects: [
      ['Sun', 'STAR', 'Our star contains nearly all the mass in the Solar System. Its gravity holds the planets in orbit.', 'About 150 million km from Earth', .50, .52, '#e6bb69'],
      ['Earth', 'PLANET', 'A rocky world with liquid-water oceans and a thin atmosphere. It is the only world known to host life.', 'One astronomical unit from the Sun', .67, .29, '#79b6b3'],
      ['Mars', 'PLANET', 'A cold, dusty world with a thin atmosphere, ancient river valleys, and the tallest volcano known in the Solar System.', 'About 1.5 AU from the Sun', .76, .69, '#db8b69'],
      ['Jupiter', 'GAS GIANT', 'The largest planet. Its Great Red Spot is a long-lived storm, and many moons orbit this giant world.', 'About 5.2 AU from the Sun', .28, .22, '#d6ae85'],
      ['Saturn', 'RINGED PLANET', 'A gas giant surrounded by bright rings made mostly of countless pieces of ice and rock.', 'About 9.6 AU from the Sun', .24, .78, '#c9db84'],
      ['Voyager 1', 'SPACECRAFT · 1977', 'Launched to explore the outer planets, Voyager 1 is now in interstellar space and still sends faint signals home.', 'Humanity’s most distant spacecraft', .90, .48, '#b6a2ce']
    ]
  },
  {
    title: 'Earth & Moon', scale: '6×', caption: 'EARTH ORBIT · MISSIONS AND OBSERVATORIES',
    objects: [
      ['Earth', 'HOME WORLD', 'Our planet’s atmosphere and magnetic field help shield life from parts of the space environment.', 'Mean radius: 6,371 km', .47, .52, '#79b6b3'],
      ['Moon', 'NATURAL SATELLITE', 'Earth’s only natural satellite. Its gravity raises ocean tides and its surface preserves impact history.', 'About 384,400 km from Earth', .75, .34, '#d5d1bd'],
      ['Apollo 11', 'CREWED MISSION · 1969', 'Neil Armstrong and Buzz Aldrin became the first people to walk on the Moon; Michael Collins orbited above.', 'First crewed lunar landing', .77, .72, '#e6bb69'],
      ['International Space Station', 'ORBITAL LAB · 1998–', 'A crewed research laboratory in low Earth orbit, built and operated through international cooperation.', 'About 400 km above Earth', .26, .23, '#c9db84'],
      ['James Webb Space Telescope', 'SPACE OBSERVATORY · 2021–', 'An infrared observatory studying early galaxies, stars, and the atmospheres of some exoplanets.', 'Orbits the Sun near L2', .17, .78, '#b6a2ce'],
      ['Hubble Space Telescope', 'SPACE OBSERVATORY · 1990–', 'A space telescope whose observations have helped measure cosmic expansion and reveal distant galaxies.', 'Low Earth orbit', .91, .48, '#db8b69']
    ]
  },
  {
    title: 'Mars missions', scale: '10×', caption: 'MARS EXPLORATION · ROBOTS ON AND AROUND THE PLANET',
    objects: [
      ['Mars', 'THE RED PLANET', 'A rocky world with polar ice, giant volcanoes, and evidence that liquid water once flowed across its surface.', 'Mean radius: 3,390 km', .49, .51, '#db8b69'],
      ['Curiosity', 'ROVER · 2012–', 'NASA’s rover studies Mount Sharp inside Gale Crater to learn whether Mars once had conditions suitable for microbes.', 'Exploring Gale Crater', .27, .27, '#e6bb69'],
      ['Perseverance', 'ROVER · 2021–', 'A rover exploring Jezero Crater, collecting rock cores and searching for signs of ancient microbial life.', 'Exploring Jezero Crater', .76, .29, '#c9db84'],
      ['Ingenuity', 'MARS HELICOPTER · 2021–24', 'The first aircraft to make a powered, controlled flight on another planet. It flew 72 times alongside Perseverance.', 'Technology demonstrator', .77, .73, '#b6a2ce'],
      ['Mars Reconnaissance Orbiter', 'ORBITER · 2006–', 'Maps the surface in detail, studies the climate, and relays data between rovers and Earth.', 'Circles Mars in low orbit', .25, .75, '#79b6b3'],
      ['Viking 1', 'LANDER · 1976', 'The first US spacecraft to land successfully on Mars, returning surface images and conducting experiments.', 'First successful US Mars landing', .51, .85, '#d5d1bd']
    ]
  }
];
