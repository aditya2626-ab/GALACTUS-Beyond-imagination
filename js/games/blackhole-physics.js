import { spawnPod } from './blackhole-state.js';

export function advanceProbe(now, last, state, keys, api, world) {
  const { W, H, CX, CY, DANGER_R, GRAVITY, THRUST, HORIZON_R } = world;
  const dt = Math.min((now - last) / 1000, 0.05);
  let tx = Number(keys.right) - Number(keys.left) + (keys.touchX || 0);
  let ty = Number(keys.down) - Number(keys.up) + (keys.touchY || 0);
  const thrust = Math.hypot(tx, ty);
  if (thrust > 1) { tx /= thrust; ty /= thrust; }
  tx *= THRUST;
  ty *= THRUST;

  const dx = CX - state.px;
  const dy = CY - state.py;
  const r = Math.max(Math.hypot(dx, dy), 20);
  const g = GRAVITY / (r * r);
  state.vx += (dx / r) * g * dt + tx * dt;
  state.vy += (dy / r) * g * dt + ty * dt;
  state.px += state.vx * dt;
  state.py += state.vy * dt;

  const margin = 12;
  if (state.px < margin) { state.px = margin; state.vx = Math.abs(state.vx) * 0.6; }
  if (state.px > W - margin) { state.px = W - margin; state.vx = -Math.abs(state.vx) * 0.6; }
  if (state.py < margin) { state.py = margin; state.vy = Math.abs(state.vy) * 0.6; }
  if (state.py > H - margin) { state.py = H - margin; state.vy = -Math.abs(state.vy) * 0.6; }

  state.time += dt;
  state.score += dt * 10;
  state.alert = r < DANGER_R;
  if (state.alert) {
    const depth = 1 - (r - HORIZON_R) / (DANGER_R - HORIZON_R);
    state.hull -= (12 + depth * 55) * dt;
    state.score += depth * dt * 60;
  }
  for (const pod of state.pods) {
    pod.phase += dt * 3;
    if (!pod.collected && Math.hypot(pod.x - state.px, pod.y - state.py) < 16) {
      pod.collected = true;
      state.score += 100;
      state.pods.push(spawnPod());
      api.signal('Science pod secured +100', 'ok', 1600);
    }
  }
  if (state.pods.filter((pod) => !pod.collected).length < 3) state.pods.push(spawnPod());
  if (r <= HORIZON_R + 4) return { cause: 'horizon' };
  if (state.hull <= 0) { state.hull = 0; return { cause: 'hull' }; }
  return { cause: null };
}
