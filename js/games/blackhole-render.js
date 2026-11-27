export function drawScene(ctx, state, keys, now, { W, H, CX, CY, HORIZON_R, DANGER_R }) {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.08 + ((i * 37) % 50) / 100})`;
      ctx.fillRect((i * 97 + 31) % W, (i * 173 + 61) % H, 1.4, 1.4);
    }
    const disk = ctx.createRadialGradient(CX, CY, HORIZON_R, CX, CY, DANGER_R);
    disk.addColorStop(0, 'rgba(255,170,60,.85)');
    disk.addColorStop(0.45, 'rgba(255,110,60,.4)');
    disk.addColorStop(1, 'rgba(180,60,220,0)');
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.ellipse(CX, CY, DANGER_R, DANGER_R * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(CX, CY);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(255,200,120,${0.14 - i * 0.02})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, HORIZON_R + 14 + i * 16, (HORIZON_R + 14 + i * 16) * 0.6, now / 9000 + i, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(CX, CY, HORIZON_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,170,.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, HORIZON_R + 2, 0, Math.PI * 2);
    ctx.stroke();

    for (const pod of state.pods) {
      if (pod.collected) continue;
      const pulse = 3 + Math.sin(pod.phase) * 1.5;
      ctx.fillStyle = 'rgba(90,240,190,.9)';
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, pulse + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(90,240,190,.25)';
      ctx.beginPath();
      ctx.arc(pod.x, pod.y, pulse + 9, 0, Math.PI * 2);
      ctx.fill();
    }

    const angle = Math.atan2(state.vy, state.vx);
    ctx.save();
    ctx.translate(state.px, state.py);
    ctx.rotate(angle);
    ctx.fillStyle = state.alert ? '#ff5470' : '#f5f5f5';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-7, 6);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, -6);
    ctx.closePath();
    ctx.fill();
    if (keys.up || keys.down || keys.left || keys.right) {
      ctx.fillStyle = 'rgba(255,180,80,.9)';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-14 - Math.random() * 6, 0);
      ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    if (state.alert) {
      ctx.strokeStyle = `rgba(255,80,100,${0.4 + Math.sin(now / 90) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(state.px, state.py, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
}

