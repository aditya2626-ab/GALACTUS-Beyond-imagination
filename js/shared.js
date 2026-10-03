export const TAU = Math.PI * 2;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const GOLD = '227,177,95';
export const ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export function seeded(seed){
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export function shuffle(items){
  const result = [...items];
  const crypto = globalThis.crypto;
  for (let i = result.length - 1; i > 0; i--){
    const random = crypto
      ? crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296
      : Math.random();
    const j = Math.floor(random * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* DPR-aware canvas sizing; returns live 2D context + CSS dimensions */
export function sizeCanvas(canvas){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, ctx };
}

/* pause heavy animation loops when their section is off-screen */
export function watchVisible(el, cb){
  new IntersectionObserver(es => cb(es[0].isIntersecting), { threshold: .02 }).observe(el);
}
