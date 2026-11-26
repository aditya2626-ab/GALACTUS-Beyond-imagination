// Mission 03 — Telescope Simulator
// Dial RA/Dec, choose filter + exposure, capture procedural deep-sky images.

import { SCOPE_TARGETS, el, hash, rngFrom } from './game-data.js';

const FILTERS = [
  { id: 'visible', label: 'VISIBLE' },
  { id: 'halpha', label: 'H-ALPHA' },
  { id: 'oiii', label: 'O-III' },
  { id: 'infrared', label: 'INFRARED' },
];

const fmtRa = (h) => `${String(Math.floor(h) % 24).padStart(2, '0')}h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}m`;
const fmtDec = (d) => `${d >= 0 ? '+' : '−'}${String(Math.floor(Math.abs(d))).padStart(2, '0')}° ${String(Math.round((Math.abs(d) % 1) * 60)).padStart(2, '0')}′`;

function drawEmpty(ctx, hint) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const r = rngFrom(`empty-${Date.now()}`);
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.25})`;
    ctx.fillRect(r() * W, r() * H, 1, 1);
  }
  if (hint) {
    ctx.fillStyle = 'rgba(216,90,60,.9)';
    ctx.font = '13px "DM Sans",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty sky — adjust pointing', W / 2, H / 2 - 6);
    ctx.fillStyle = 'rgba(216,90,60,.65)';
    ctx.font = '11px "DM Sans",sans-serif';
    ctx.fillText(hint, W / 2, H / 2 + 16);
  }
}

function drawTarget(ctx, target, filter, exposure) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r = rngFrom(target.id);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#020208';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.6})`;
    ctx.fillRect(r() * W, r() * H, r() > 0.9 ? 2 : 1, r() > 0.9 ? 2 : 1);
  }
  const glow = (x, y, rad, c1, c2) => {
    const g = ctx.createRadialGradient(x, y, 1, x, y, rad);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };

  switch (target.kind) {
    case 'moon': {
      glow(cx, cy, 110, 'rgba(230,230,215,.95)', 'rgba(230,230,215,0)');
      ctx.fillStyle = '#d8d8cf';
      ctx.beginPath();
      ctx.arc(cx, cy, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120,120,115,.55)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(cx + (r() - 0.5) * 100, cy + (r() - 0.5) * 100, 12 + r() * 26, 10 + r() * 20, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 22; i++) {
        const x = cx + (r() - 0.5) * 160;
        const y = cy + (r() - 0.5) * 160;
        const cr = 2 + r() * 9;
        ctx.fillStyle = 'rgba(150,150,145,.7)';
        ctx.beginPath();
        ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(240,240,235,.5)';
        ctx.beginPath();
        ctx.arc(x - cr * 0.25, y - cr * 0.25, cr * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'planet': {
      if (target.id === 'saturn') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.35);
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = `rgba(220,200,160,${0.8 - i * 0.2})`;
          ctx.lineWidth = 6 - i * 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 78 + i * 12, 20 + i * 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        const pg = ctx.createLinearGradient(0, -34, 0, 34);
        pg.addColorStop(0, '#e8d9a8');
        pg.addColorStop(0.5, '#d4b878');
        pg.addColorStop(1, '#b89a5e');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        const pg = ctx.createLinearGradient(0, cy - 62, 0, cy + 62);
        pg.addColorStop(0, '#d9b98a');
        pg.addColorStop(0.25, '#e8d3ab');
        pg.addColorStop(0.35, '#b5764a');
        pg.addColorStop(0.5, '#ecd9b4');
        pg.addColorStop(0.65, '#c98a5e');
        pg.addColorStop(0.8, '#e3cda2');
        pg.addColorStop(1, '#c9a06e');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 66, 56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(200,80,50,.85)';
        ctx.beginPath();
        ctx.ellipse(cx + 22, cy + 18, 13, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = 'rgba(240,240,230,.95)';
          ctx.beginPath();
          ctx.arc(cx - 90 + i * 60 + r() * 10, cy + (r() - 0.5) * 130, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'galaxy': {
      glow(cx, cy, 130, 'rgba(255,240,210,.8)', 'rgba(255,240,210,0)');
      for (let i = 0; i < 900; i++) {
        const t = Math.pow(r(), 0.7);
        const ang = r() * Math.PI * 2;
        ctx.fillStyle = `rgba(${230 + r() * 25},${225 + r() * 25},${205 + r() * 30},${0.1 + r() * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * t * 105, cy + Math.sin(ang) * t * 38, 0.6 + r() * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(60,50,45,.5)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80, 24, 0.35, 0.3, 2.6);
      ctx.stroke();
      break;
    }
    case 'nebula': {
      const cols = filter === 'halpha'
        ? ['rgba(255,60,90,', 'rgba(255,120,140,']
        : ['rgba(255,110,160,', 'rgba(120,220,220,'];
      for (let i = 0; i < 9; i++) {
        glow(cx + (r() - 0.5) * 180, cy + (r() - 0.5) * 140, 45 + r() * 70,
          `${cols[i % 2]}${0.16 + r() * 0.2})`, `${cols[i % 2]}0)`);
      }
      for (let i = 0; i < 4; i++) {
        glow(cx - 14 + i * 9 + (r() - 0.5) * 8, cy + (r() - 0.5) * 10, 10, 'rgba(255,255,240,.95)', 'rgba(255,255,240,0)');
      }
      break;
    }
    case 'cluster': {
      for (let i = 0; i < 400; i++) {
        const rad = 85 * Math.pow(r(), 1.6);
        const a = r() * Math.PI * 2;
        ctx.fillStyle = `rgba(255,240,220,${0.25 + r() * 0.65})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.85, 0.6 + r() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      glow(cx, cy, 40, 'rgba(255,240,210,.5)', 'rgba(255,240,210,0)');
      break;
    }
    case 'star': {
      glow(cx, cy, 26, 'rgba(255,255,245,1)', 'rgba(180,210,255,0)');
      ctx.strokeStyle = 'rgba(255,255,245,.55)';
      ctx.lineWidth = 1.6;
      for (const a of [0, Math.PI / 2]) {
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a) * 52, cy - Math.sin(a) * 52);
        ctx.lineTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52);
        ctx.stroke();
      }
      break;
    }
  }

  const post = ctx.createLinearGradient(0, 0, W, 0);
  if (filter === 'halpha') post.addColorStop(0, 'rgba(255,40,60,.28)');
  else if (filter === 'oiii') post.addColorStop(0, 'rgba(40,230,200,.22)');
  else if (filter === 'infrared') post.addColorStop(0, 'rgba(255,120,30,.3)');
  else post.addColorStop(0, 'rgba(255,255,255,0)');
  ctx.fillStyle = post;
  ctx.fillRect(0, 0, W, H);

  if (exposure < 0.5) {
    ctx.fillStyle = `rgba(0,0,0,${(0.5 - exposure) * 0.9})`;
    ctx.fillRect(0, 0, W, H);
  } else if (exposure > 1.4) {
    ctx.fillStyle = `rgba(255,255,255,${(exposure - 1.4) * 0.45})`;
    ctx.fillRect(0, 0, W, H);
  }
  const noise = 0.02 + (1 - Math.abs(exposure - 1)) * 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${r() * noise})`;
    ctx.fillRect(r() * W, r() * H, 1, 1);
  }
}

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

  const info = el('div', 'scope-info', '<b>OBSERVATORY READY</b>Select a target from the catalogue to begin an observation run.');
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
    drawEmpty(ctx, '');
    info.innerHTML = `<b>${target.name}</b><span class="coords">CATALOGUE POSITION ${fmtRa(target.ra)} / ${fmtDec(target.dec)}</span><br>${target.info}`;
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
