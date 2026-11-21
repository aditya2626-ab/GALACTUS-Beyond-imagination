import { facts } from './data.js';
import './universe.js';

let fact = 0;
function showFact() {
  document.querySelector('#fact-text').textContent = facts[fact];
  document.querySelector('#fact-index').textContent = `NOTE ${String(fact + 1).padStart(2, '0')}`;
  fact = (fact + 1) % facts.length;
}
document.querySelector('#another-fact').addEventListener('click', showFact);
showFact();

const moments = [
  ['1609 · GALILEO', 'Turns a telescope toward the night sky.'],
  ['1924 · HUBBLE', 'Finds that Andromeda lies beyond the Milky Way.'],
  ['1969 · APOLLO 11', 'Humans walk on the Moon.'],
  ['TODAY', 'We use light to study the distant past.']
];
document.querySelector('#timeline').innerHTML = moments.map(([date, event]) =>
  `<div class="time-point"><strong>${date}</strong><span>${event}</span></div>`).join('');
