import { scenes } from './universe-data.js';

const canvas = document.querySelector('#universe');
const ctx = canvas.getContext('2d');
const card = document.querySelector('#object-card');
const list = document.querySelector('#landmarks');
const sceneNav = document.querySelector('#scene-nav');
const level = document.querySelector('#zoom-level');
const zoomIn = document.querySelector('#zoom-in');
const zoomOut = document.querySelector('#zoom-out');
let sceneIndex = 0;
let selected = 1;
let stars = [];

function selectScene(index) {
  sceneIndex = Math.max(0, Math.min(scenes.length - 1, index));
  selected = 0;
  renderScene();
}
function selectObject(index) {
  selected = index;
  const [name, type, detail, distance] = scenes[sceneIndex].objects[index];
  card.innerHTML = `<span class="object-number">${type}</span><h3>${name}</h3>
    <p>${detail}</p><span class="distance">${distance}</span>`;
  list.querySelectorAll('button').forEach((button, i) =>
    button.setAttribute('aria-pressed', i === index));
  drawMap();
}
function drawMap() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const objects = scenes[sceneIndex].objects;
  ctx.clearRect(0, 0, width, height);
  stars.forEach(star => {
    ctx.fillStyle = `rgba(231,231,213,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = 'rgba(201,219,132,.17)';
  ctx.setLineDash([2, 8]);
  ctx.beginPath();
  objects.forEach((object, i) => {
    const [, , , , xRatio, yRatio] = object;
    const x = xRatio * width, y = yRatio * height;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
  objects.forEach((object, i) => {
    const [name, , , , xRatio, yRatio, color] = object;
    const x = xRatio * width, y = yRatio * height;
    ctx.globalAlpha = i === selected ? 1 : .8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, i === selected ? 9 : 6, 0, Math.PI * 2);
    ctx.fill();
    if (i === selected) {
      ctx.globalAlpha = .28;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e9e6da';
    ctx.font = '11px "DM Mono", monospace';
    ctx.fillText(name, x + (xRatio > .72 ? -12 : 12), y - 10);
  });
}
function renderScene() {
  const scene = scenes[sceneIndex];
  document.querySelector('#map-caption').textContent = scene.caption;
  level.textContent = scene.scale;
  zoomOut.disabled = sceneIndex === 0;
  zoomIn.disabled = sceneIndex === scenes.length - 1;
  sceneNav.querySelectorAll('button').forEach((button, i) =>
    button.setAttribute('aria-pressed', i === sceneIndex));
  list.replaceChildren();
  scene.objects.forEach((object, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = object[0];
    button.addEventListener('click', () => selectObject(i));
    list.append(button);
  });
  sizeCanvas();
  selectObject(selected);
}
function sizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  canvas.width = bounds.width * dpr;
  canvas.height = bounds.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: 110 }, (_, i) => ({
    x: (i * 83.71 % 1) * bounds.width,
    y: (i * 53.17 % 1) * bounds.height,
    radius: (i % 4) * .35 + .4,
    alpha: .16 + (i % 5) * .07
  }));
  drawMap();
}
scenes.forEach((scene, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = scene.title;
  button.addEventListener('click', () => selectScene(i));
  sceneNav.append(button);
});
zoomIn.addEventListener('click', () => selectScene(sceneIndex + 1));
zoomOut.addEventListener('click', () => selectScene(sceneIndex - 1));
canvas.addEventListener('click', event => {
  const bounds = canvas.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  let nearest = 0, best = Infinity;
  scenes[sceneIndex].objects.forEach((object, i) => {
    const distance = (object[4] - x) ** 2 + (object[5] - y) ** 2;
    if (distance < best) { best = distance; nearest = i; }
  });
  selectObject(nearest);
});
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  selectScene(sceneIndex + (event.deltaY > 0 ? 1 : -1));
}, { passive: false });
new ResizeObserver(sizeCanvas).observe(canvas);
renderScene();
