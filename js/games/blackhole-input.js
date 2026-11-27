// Keyboard thrust plus touch drag steering for the black-hole mission.
export function bindBlackHoleControls(canvas) {
  const keys = { up: false, down: false, left: false, right: false, touchX: 0, touchY: 0 };
  const keymap = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  };
  let pointer = null;

  const onKeyDown = (event) => {
    const key = keymap[event.key];
    if (key) { keys[key] = true; event.preventDefault(); }
  };
  const onKeyUp = (event) => {
    const key = keymap[event.key];
    if (key) keys[key] = false;
  };
  const onBlur = () => Object.keys(keys).forEach((key) => { keys[key] = false; });
  const pointFrom = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };
  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault();
    pointer = { id: event.pointerId, ...pointFrom(event) };
    canvas.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (pointer?.id === event.pointerId) Object.assign(pointer, pointFrom(event));
  };
  const releasePointer = (event) => {
    if (pointer?.id === event.pointerId) pointer = null;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);

  return {
    keys,
    update(state) {
      keys.touchX = 0;
      keys.touchY = 0;
      if (!pointer) return;
      const dx = pointer.x - state.px;
      const dy = pointer.y - state.py;
      const distance = Math.hypot(dx, dy);
      if (distance > 18) {
        keys.touchX = dx / distance;
        keys.touchY = dy / distance;
      }
    },
    reset() { pointer = null; onBlur(); },
    destroy() {
      onBlur();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', releasePointer);
      canvas.removeEventListener('pointercancel', releasePointer);
    },
  };
}
