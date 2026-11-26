const W = 640;
const H = 440;
const CX = W / 2;
const CY = H / 2;
const HORIZON_R = 34;
const DANGER_R = 118;
const GRAVITY = 26000;
const THRUST = 160;
const START_ORBIT_R = 180;

export const WORLD = { W, H, CX, CY, HORIZON_R, DANGER_R, GRAVITY, THRUST };

export function spawnPod() {
  const angle = Math.random() * Math.PI * 2;
  const r = DANGER_R + 25 + Math.random() * 90;
  return {
    x: CX + Math.cos(angle) * r,
    y: CY + Math.sin(angle) * r * 0.9,
    collected: false,
    phase: Math.random() * 6,
  };
}

export function initState() {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.sqrt((GRAVITY / START_ORBIT_R) * 0.92);
  return {
    px: CX + Math.cos(angle) * START_ORBIT_R,
    py: CY + Math.sin(angle) * START_ORBIT_R * 0.9,
    vx: -Math.sin(angle) * speed,
    vy: Math.cos(angle) * speed,
    hull: 100,
    score: 0,
    time: 0,
    over: false,
    pods: [spawnPod(), spawnPod(), spawnPod()],
    alert: false,
  };
}
