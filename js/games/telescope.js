// Mission 03 — Telescope Simulator
// Dial RA/Dec, choose filter + exposure, capture procedural deep-sky images.

import { SCOPE_TARGETS, el } from './game-data.js';
import { drawEmpty, drawTarget } from './telescope-render.js';

const FILTERS = [
  { id: 'visible', label: 'VISIBLE' },
  { id: 'halpha', label: 'H-ALPHA' },
  { id: 'oiii', label: 'O-III' },
  { id: 'infrared', label: 'INFRARED' },
];

const fmtRa = (h) => `${String(Math.floor(h) % 24).padStart(2, '0')}h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}m`;
const fmtDec = (d) => `${d >= 0 ? '+' : '−'}${String(Math.floor(Math.abs(d))).padStart(2, '0')}° ${String(Math.round((Math.abs(d) % 1) * 60)).padStart(2, '0')}′`;

export function mountTelescope(stage, api) {
  const captured = new Set();
  let selected = null;
  let filter = 'visible';

  const layout = el('div', 'scope-layout');
  const catalog = el('div', 'scope-catalog');
  catalog.setAttribute('aria-label', 'Target catalogue');
  const panel = el('div', 'scope-panel');
  layout.append(catalog, panel);
  stage.append(layout);

  const viewfinder = document.createElement('canvas');
  viewfinder.width = 520;
  viewfinder.height = 360;
  viewfinder.className = 'g-canvas';
  viewfinder.setAttribute('role', 'img');
  viewfinder.setAttribute('aria-label', 'Telescope viewfinder');
  viewfinder.style.maxWidth = '100%';
  const ctx = viewfinder.getContext('2d');
  drawEmpty(ctx, '');

  const info = el('div', 'scope-info', '<b>OBSERVATORY READY</b>Choose a target, match its RA and Dec, then select a filter and exposure. Capture works within 0.7 hours of RA and 6° of Dec.');
  const sliders = el('div', 'g-slider-row');
  const raSlider = document.createElement('input');
  raSlider.type = 'range';
  raSlider.min = '0';
  raSlider.max = '23.9';
  raSlider.step = '0.1';
  raSlider.value = '0';
  raSlider.setAttribute('aria-label', 'Right ascension hours');
  const decSlider = document.createElement('input');
  decSlider.type = 'range';
  decSlider.min = '-90';
  decSlider.max = '90';
  decSlider.step = '1';
  decSlider.value = '0';
  decSlider.setAttribute('aria-label', 'Declination degrees');

  const raLabel = el('label', null, `RIGHT ASCENSION · DIAL IT IN<b class="ra-read">${fmtRa(0)}</b>`);
  const decLabel = el('label', null, `DECLINATION · DIAL IT IN<b class="dec-read">${fmtDec(0)}</b>`);
  const raBox = el('div', 'g-slider');
  const decBox = el('div', 'g-slider');
  raBox.append(raLabel, raSlider);
  decBox.append(decLabel, decSlider);
  sliders.append(raBox, decBox);

  const filtersRow = el('div', 'scope-filters', '<span>FILTER</span>');
  FILTERS.forEach((f) => {
    const button = el('button', null, f.label);
    button.type = 'button';
    button.setAttribute('aria-pressed', f.id === filter);
    button.addEventListener('click', () => {
      filter = f.id;
      filtersRow.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.textContent === f.label));
    });
    filtersRow.append(button);
  });
  const exposure = document.createElement('input');
  exposure.type = 'range';
  exposure.min = '0.2';
  exposure.max = '1.8';
  exposure.step = '0.1';
  exposure.value = '1';
  exposure.setAttribute('aria-label', 'Exposure seconds');
  const exposureRead = el('em', null, '1.0s');
  exposure.addEventListener('input', () => { exposureRead.textContent = `${Number(exposure.value).toFixed(1)}s`; });
  const exposureBox = el('div', 'scope-exposure');
  exposureBox.append(el('span', null, 'EXP'), exposure, exposureRead);
  filtersRow.append(exposureBox);

  const capture = el('button', 'button primary', 'Capture image ⌖');
  capture.type = 'button';
  capture.disabled = true;
  capture.style.alignSelf = 'flex-start';

  panel.append(viewfinder, info, sliders, filtersRow, capture);

  function paintCatalog() {
    catalog.innerHTML = '';
    SCOPE_TARGETS.forEach((target) => {
      const button = el('button', null, `<span>${target.name}</span>${captured.has(target.id) ? '<span class="captured">✓</span>' : ''}`);
      button.type = 'button';
      button.setAttribute('aria-current', selected && selected.id === target.id);
      button.addEventListener('click', () => pick(target));
      catalog.append(button);
    });
  }

  function pick(target) {
    selected = target;
    capture.disabled = false;
    drawEmpty(ctx, '');
    info.innerHTML = `<b>${target.name}</b><span class="coords">MATCH THIS POSITION · ${fmtRa(target.ra)} / ${fmtDec(target.dec)}</span><br>${target.info}`;
    paintCatalog();
    api.signal(`Slew to ${target.name} — dial in the coordinates`, 'warn', 3000);
  }

  const readRa = () => { raLabel.querySelector('b').textContent = fmtRa(Number(raSlider.value)); };
  const readDec = () => { decLabel.querySelector('b').textContent = fmtDec(Number(decSlider.value)); };
  raSlider.addEventListener('input', readRa);
  decSlider.addEventListener('input', readDec);

  capture.addEventListener('click', () => {
    if (!selected) return;
    let raErr = Math.abs(Number(raSlider.value) - selected.ra);
    if (raErr > 12) raErr = 24 - raErr;
    const decErr = Math.abs(Number(decSlider.value) - selected.dec);
    const raOk = raErr <= 0.7;
    const decOk = decErr <= 6;
    if (raOk && decOk) {
      drawTarget(ctx, selected, filter, Number(exposure.value));
      if (!captured.has(selected.id)) {
        captured.add(selected.id);
        api.addXp(50);
        api.setBest(captured.size);
        api.signal(`New capture logged: ${selected.name} · +50 XP`, 'ok', 3400);
        paintCatalog();
      } else {
        api.signal('Re-captured — try a different filter or exposure', 'warn', 2400);
      }
    } else {
      const hints = [];
      if (!raOk) hints.push(Number(raSlider.value) < selected.ra ? 'RA is too small — increase it' : 'RA is too large — decrease it');
      if (!decOk) hints.push(Number(decSlider.value) < selected.dec ? 'Dec is too low — head further north' : 'Dec is too high — head further south');
      drawEmpty(ctx, hints[0]);
      api.signal('Nothing in the field of view', 'bad', 2200);
    }
  });

  paintCatalog();
  return () => {};
}
