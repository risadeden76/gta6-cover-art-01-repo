// Procedural sample scenes, painted on a canvas with plain 2D shapes so the
// app has photos to work with before the user adds their own. These are
// original drawings, not photographs and not game artwork.

/** Paints a scene and returns the canvas, usable as an image source. */
export function paintSample(kind, width = 1200, height = 900) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (kind === 'pier') paintPier(ctx, width, height);
  else paintBoulevard(ctx, width, height);
  return canvas;
}

function sky(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  stops.forEach(([at, colour]) => g.addColorStop(at, colour));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h * 0.62);
}

function sunDisc(ctx, x, y, r, colour) {
  const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.6);
  glow.addColorStop(0, colour);
  glow.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function palmTree(ctx, x, y, size, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = '#1c0a26';
  ctx.fillStyle = '#1c0a26';
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.55, 0, -size);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.05 + i * 0.18);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(
      Math.cos(a) * size * 0.5, -size - Math.sin(a) * size * 0.5,
      Math.cos(a) * size, -size + size * 0.3,
    );
    ctx.lineWidth = size * 0.04;
    ctx.stroke();
  }
  ctx.restore();
}

function building(ctx, x, y, w, h, colour, lit) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lit;
  for (let row = 0; row < Math.floor(h / 46); row++) {
    for (let col = 0; col < Math.floor(w / 38); col++) {
      if ((row * 7 + col * 3) % 4 === 0) ctx.fillRect(x + 8 + col * 38, y + 10 + row * 46, 16, 22);
    }
  }
}

function paintBoulevard(ctx, w, h) {
  sky(ctx, w, h, [[0, '#2b0a4d'], [0.55, '#ff7a3d'], [1, '#ffd166']]);
  sunDisc(ctx, w * 0.68, h * 0.34, h * 0.11, '#fff3b0');
  building(ctx, w * 0.02, h * 0.18, w * 0.2, h * 0.46, '#3a1445', '#ffd166');
  building(ctx, w * 0.26, h * 0.1, w * 0.16, h * 0.54, '#2c0e3a', '#ff9a5c');
  building(ctx, w * 0.78, h * 0.14, w * 0.2, h * 0.5, '#33123f', '#ffd166');
  const road = ctx.createLinearGradient(0, h * 0.62, 0, h);
  road.addColorStop(0, '#4a1a52');
  road.addColorStop(1, '#160a20');
  ctx.fillStyle = road;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 6; i++) {
    const y = h * 0.66 + i * h * 0.055;
    const ww = 8 + i * 14;
    ctx.fillRect(w / 2 - ww / 2, y, ww, 5);
  }
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, h * 0.62, w, 6);
  palmTree(ctx, w * 0.1, h * 0.98, h * 0.3, -0.18);
  palmTree(ctx, w * 0.9, h * 0.98, h * 0.26, 0.22);
  ctx.fillStyle = 'rgba(255,46,136,0.25)';
  ctx.fillRect(0, 0, w, h);
}

function paintPier(ctx, w, h) {
  sky(ctx, w, h, [[0, '#120a3d'], [0.5, '#ff2e88'], [1, '#ff9a5c']]);
  sunDisc(ctx, w * 0.5, h * 0.42, h * 0.13, '#ffe9a8');
  const sea = ctx.createLinearGradient(0, h * 0.55, 0, h);
  sea.addColorStop(0, '#ff7a3d');
  sea.addColorStop(0.4, '#7a2a6d');
  sea.addColorStop(1, '#1c0a30');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.strokeStyle = 'rgba(255,233,168,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const y = h * (0.58 + i * 0.045);
    ctx.beginPath();
    ctx.moveTo(w * (0.42 + (i % 3) * 0.03), y);
    ctx.lineTo(w * (0.58 - (i % 2) * 0.04), y);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a1c2e';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.strokeStyle = '#12081d';
  ctx.lineWidth = 4;
  for (let i = 0; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo((w / 10) * i, h * 0.72);
    ctx.lineTo((w / 10) * i, h);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(w * (0.12 + i * 0.13), h * 0.7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w * (0.12 + i * 0.13) - 2, h * 0.7, 4, h * 0.06);
  }
  palmTree(ctx, w * 0.06, h * 0.74, h * 0.22, -0.2);
  palmTree(ctx, w * 0.95, h * 0.74, h * 0.18, 0.25);
}
