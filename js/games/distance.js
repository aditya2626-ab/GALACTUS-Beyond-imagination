// Mission 05 — Light-Year Estimator
// Guess distances on a logarithmic slider; the truth bar never lies.

import { DISTANCE_OBJECTS, el, shuffle } from './game-data.js';

const ROUNDS = 8;
const LOG_MIN = 3;
const LOG_MAX = 23;
const DECADES = LOG_MAX - LOG_MIN;

function fmt(km) {
  if (km < 1e7) return `${(km / 1000).toLocaleString('en', { maximumFractionDigits: 0 })} thousand km`;
  const au = km / 1.496e8;
  if (au < 0.6) return `${km.toLocaleString('en', { maximumFractionDigits: 0 })} km`;
  if (au < 6300) return `${au.toLocaleString('en', { maximumFractionDigits: au < 10 ? 2 : 0 })} AU`;
  const ly = km / 9.461e12;
  if (ly < 100) return `${ly.toLocaleString('en', { maximumFractionDigits: 2 })} light-years`;
  if (ly < 1e6) return `${ly.toLocaleString('en', { maximumFractionDigits: 0 })} light-years`;
  if (ly < 1e9) return `${(ly / 1e6).toLocaleString('en', { maximumFractionDigits: 1 })} million light-years`;
  return `${(ly / 1e9).toLocaleString('en', { maximumFractionDigits: 1 })} billion light-years`;
}

function fmtGuess(km) {
  const au = km / 1.496e8;
  const ly = km / 9.461e12;
  if (km < 1e7) return `${km.toLocaleString('en', { maximumFractionDigits: 0 })} km`;
  if (au < 6300 && au >= 0.6) return `${au.toLocaleString('en', { maximumFractionDigits: au < 10 ? 2 : 0 })} AU (${km.toExponential(2)} km)`;
  if (ly < 9.46e9) return `${ly.toLocaleString('en', { maximumFractionDigits: ly < 100 ? 2 : 0 })} light-years (${km.toExponential(2)} km)`;
  return `${km.toExponential(2)} km`;
}

export function mountDistance(stage, api) {
  const pool = shuffle(DISTANCE_OBJECTS).slice(0, ROUNDS);
  let idx = 0;
  let total = 0;

  const top = el('p', 'g-top');
  const track = el('div', 'g-track', '<span></span>');
  const panel = el('div', 'dt-panel');
  stage.append(top, track, panel);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.step = '0.5';
  slider.value = '50';
  slider.setAttribute('aria-label', 'Distance guess, logarithmic scale');
  const guessRead = el('p', 'dt-guess');

  function paintGuess() {
    const km = Math.pow(10, LOG_MIN + (Number(slider.value) / 100) * DECADES);
    guessRead.textContent = fmtGuess(km);
  }
  slider.addEventListener('input', paintGuess);

  function paint() {
    const obj = pool[idx];
    top.innerHTML = `OBJECT ${idx + 1} / ${ROUNDS} · SCORE <b>${total}</b>`;
    track.firstElementChild.style.width = `${((idx + 0.5) / ROUNDS) * 100}%`;
    panel.innerHTML = `
      <div class="dt-emoji" aria-hidden="true">${obj.emoji}</div>
      <h3>How far is ${obj.name}?</h3>
      <p class="g-sub">The scale is logarithmic — every same-sized step multiplies the distance by ten.</p>
      <div class="dt-slider">
        <div class="dt-scale"><span>1,000 KM</span><span class="dt-mid">1,000 KM → 10 BILLION LY</span><span>10 BILLION LY</span></div>
      </div>`;
    const sliderBox = panel.querySelector('.dt-slider');
    sliderBox.append(slider, guessRead);
    paintGuess();

    if (!panel.querySelector('.dt-actions')) {
      const lock = el('button', 'button primary', 'Lock in my estimate');
      lock.type = 'button';
      lock.style.marginTop = '16px';
      lock.addEventListener('click', submit);
      const actions = el('div', 'dt-actions');
      actions.append(lock);
      panel.append(actions);
    } else {
      panel.querySelector('.dt-actions button').textContent = 'Lock in my estimate';
    }
  }

  function submit() {
    const obj = pool[idx];
    const guessKm = Math.pow(10, LOG_MIN + (Number(slider.value) / 100) * DECADES);
    const off = Math.abs(Math.log10(guessKm) - Math.log10(obj.km));
    let points = 10;
    let xp = 1;
    let label = 'WAY OFF';
    if (off <= 0.5) { points = 100; xp = 10; label = 'PERFECT ESTIMATE'; }
    else if (off <= 1.5) { points = 60; xp = 6; label = 'GREAT GUESS'; }
    else if (off <= 3) { points = 30; xp = 3; label = 'IN THE BALLPARK'; }
    total += points;
    api.addXp(xp);

    slider.disabled = true;
    panel.querySelector('.dt-actions').remove();

    const truePos = ((Math.log10(obj.km) - LOG_MIN) / DECADES) * 100;
    const guessPos = ((Math.log10(guessKm) - LOG_MIN) / DECADES) * 100;
    const result = el('div', 'dt-result', `
      <div class="dt-versus">
        <span class="you">YOUR GUESS · <b>${fmt(guessKm)}</b></span>
        <span class="real">ACTUAL · <b>${fmt(obj.km)}</b></span>
      </div>
      <div class="dt-bar"><i class="you" style="left:${Math.max(Math.min(guessPos, 100), 0)}%"></i><i class="real" style="left:${Math.max(Math.min(truePos, 100), 0)}%"></i></div>
      <div class="dt-legend"><span><i style="background:var(--amber)"></i>YOUR GUESS</span><span><i style="background:var(--sage)"></i>TRUE DISTANCE</span></div>
      <p class="dt-fact"><b>${label} · +${points} PTS</b> — ${obj.fact}</p>`);
    const nextButton = el('button', 'button primary', idx + 1 >= ROUNDS ? 'See results' : 'Next object →');
    nextButton.type = 'button';
    nextButton.style.marginTop = '14px';
    nextButton.addEventListener('click', () => {
      if (idx + 1 >= ROUNDS) {
        api.setBest(total);
        stage.innerHTML = '';
        const center = el('div', 'g-center', `
          <p style="font-size:34px;margin:0">⇢</p>
          <h3 class="g-title-line">Journey through space complete</h3>
          <p class="g-sub">Total estimation score <b style="color:var(--amber)">${total}</b> of ${ROUNDS * 100} possible points. Space is big — the fact that anyone gets these right is the impressive part.</p>`);
        const again = el('button', 'button primary', 'New journey ↻');
        again.type = 'button';
        again.addEventListener('click', () => {
          pool.sort(() => Math.random() - 0.5);
          idx = 0;
          total = 0;
          stage.innerHTML = '';
          stage.append(top, track, panel);
          slider.disabled = false;
          slider.value = '50';
          paint();
        });
        center.append(again);
        stage.append(center);
      } else {
        idx += 1;
        slider.disabled = false;
        slider.value = '50';
        paint();
      }
    });
    result.append(nextButton);
    panel.append(result);
  }

  paint();
  return () => {};
}
