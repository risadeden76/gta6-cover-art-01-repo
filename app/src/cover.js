// Draws a multi-panel sunset cover onto a canvas: each panel holds one photo
// (cover-fit, per-panel zoom and pan), a neon-sunset colour grade, a drawn sun
// and palm silhouettes on the hero panel, and bold caption lettering on a band.
// Everything drawn here is original vector work; no game artwork or font file.

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

export const GRADES = {
  sunset: { top: 'rgba(255,122,61,0.34)', bottom: 'rgba(255,46,136,0.42)', sun: '#ffd166', saturate: 1.28, contrast: 1.06 },
  neon: { top: 'rgba(0,229,255,0.26)', bottom: 'rgba(255,46,136,0.46)', sun: '#7df9ff', saturate: 1.35, contrast: 1.08 },
  gold: { top: 'rgba(255,190,80,0.30)', bottom: 'rgba(214,90,20,0.40)', sun: '#fff3b0', saturate: 1.22, contrast: 1.05 },
  noir: { top: 'rgba(90,40,160,0.34)', bottom: 'rgba(20,8,40,0.48)', sun: '#c9a7ff', saturate: 1.1, contrast: 1.1 },
};

/** Panel rectangles (fractions of the cover) for each layout. */
export function layoutPanels(layout, count) {
  if (layout === 'triple') {
    return [
      [0, 0, 1 / 3, 1],
      [1 / 3, 0, 1 / 3, 1],
      [2 / 3, 0, 1 / 3, 1],
    ].slice(0, count);
  }
  if (layout === 'nine') {
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) cells.push([c / 3, r / 3, 1 / 3, 1 / 3]);
    }
    return cells.slice(0, count);
  }
  if (layout === 'grid') {
    return [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ].slice(0, count);
  }
  return [
    [0, 0, 1, 0.58],
    [0, 0.58, 0.5, 0.42],
    [0.5, 0.58, 0.5, 0.42],
  ].slice(0, count);
}

/** Draws one photo cover-fit inside a panel rect, with zoom and pan. */
export function drawPhotoInPanel(ctx, photo, rect, panel) {
  const [fx, fy, fw, fh] = rect;
  const x = fx * ctx.canvas.width;
  const y = fy * ctx.canvas.height;
  const w = fw * ctx.canvas.width;
  const h = fh * ctx.canvas.height;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!photo || !photo.image) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3d1a56');
    g.addColorStop(1, '#12081d');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  } else {
    const img = photo.image;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const zoom = (panel.zoom ?? 100) / 100;
    const scale = Math.max(w / iw, h / ih) * zoom;
    const pw = iw * scale;
    const ph = ih * scale;
    const dx = x + (w - pw) / 2 + ((panel.panX ?? 0) / 50) * (pw - w) * 0.5;
    const dy = y + (h - ph) / 2 + ((panel.panY ?? 0) / 50) * (ph - h) * 0.5;
    ctx.drawImage(img, dx, dy, pw, ph);
  }
  ctx.restore();
}

/** Deterministic film grain: a small noise tile, drawn over the panels at low
 * opacity so the cover reads as printed poster art, not flat vector. */
let grainPattern = null;
function getGrainPattern(ctx) {
  if (grainPattern) return grainPattern;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(128, 128);
  let seed = 1234567;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainPattern = ctx.createPattern(tile, 'repeat');
  return grainPattern;
}

export function grainCover(ctx) {
  const pattern = getGrainPattern(ctx);
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

/** Sunset grade: warm wash, vignette and a thin white comic border. */
export function gradePanel(ctx, rect, grade) {
  const [fx, fy, fw, fh] = rect;
  const x = fx * ctx.canvas.width;
  const y = fy * ctx.canvas.height;
  const w = fw * ctx.canvas.width;
  const h = fh * ctx.canvas.height;
  const wash = ctx.createLinearGradient(x, y, x, y + h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  const vig = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,0,20,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = Math.max(3, ctx.canvas.width * 0.004);
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

/** Palm silhouettes drawn on the hero panel. The sample scenes and user
 * photos carry their own sun, so no extra sun is drawn here. */
export function drawPalmsOnHero(ctx, rect) {
  const [fx, fy, fw, fh] = rect;
  const x = fx * ctx.canvas.width;
  const y = fy * ctx.canvas.height;
  const w = fw * ctx.canvas.width;
  const h = fh * ctx.canvas.height;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  drawPalm(ctx, x + w * 0.06, y + h * 0.98, Math.min(w, h) * 0.34, -0.25);
  drawPalm(ctx, x + w * 0.94, y + h * 0.98, Math.min(w, h) * 0.26, 0.3);
  ctx.restore();
}

/** One palm tree silhouette: curved trunk and five fronds. */
export function drawPalm(ctx, baseX, baseY, size, lean) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(lean);
  ctx.strokeStyle = 'rgba(12,4,20,0.92)';
  ctx.fillStyle = 'rgba(12,4,20,0.92)';
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.55, 0, -size);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.08 + i * 0.21);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(
      Math.cos(a) * size * 0.55, -size - Math.sin(a) * size * 0.45,
      Math.cos(a) * size * 0.95, -size + size * 0.28 - Math.sin(a) * size * 0.1,
    );
    ctx.lineWidth = size * 0.045;
    ctx.stroke();
  }
  ctx.restore();
}

/** Bold caption lettering with outline and neon offset shadow. */
export function drawCaption(ctx, caption, subcaption, grade) {
  const { width: w, height: h } = ctx.canvas;
  const text = (caption || '').trim().toUpperCase();
  const bandH = h * 0.17;
  const bandY = h - bandH;
  const band = ctx.createLinearGradient(0, bandY, 0, h);
  band.addColorStop(0, 'rgba(16,4,28,0)');
  band.addColorStop(0.35, 'rgba(16,4,28,0.82)');
  band.addColorStop(1, 'rgba(16,4,28,0.94)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(0, bandY, w, Math.max(3, h * 0.005));
  if (text) {
    let size = h * 0.085;
    const setFont = () => { ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", sans-serif`; };
    setFont();
    while (ctx.measureText(text).width > w * 0.92 && size > 14) { size -= 2; setFont(); }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255,46,136,0.9)';
    ctx.shadowBlur = size * 0.22;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeStyle = '#16041f';
    ctx.lineWidth = size * 0.16;
    ctx.strokeText(text, w / 2, bandY + bandH * 0.52);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, w / 2, bandY + bandH * 0.52);
  }
  const sub = (subcaption || '').trim().toUpperCase();
  if (sub) {
    const size = Math.max(13, h * 0.02);
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd166';
    const gap = text ? 0 : 0;
    ctx.fillText(sub.split('').join('\u2009'), w / 2, bandY + bandH * 0.86 + gap);
  }
}

/**
 * Draws the whole cover.
 * state: { sizeKey, layout, caption, subcaption, gradeKey, photos, panels }
 * photos: [{ image }] — panels: [{ photo, zoom, panX, panY }] per panel index.
 */
export function drawCover(canvas, state) {
  const size = SIZES[state.sizeKey] ?? SIZES.square;
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.gradeKey] ?? GRADES.sunset;
  ctx.filter = `saturate(${grade.saturate}) contrast(${grade.contrast})`;
  ctx.fillStyle = '#12081d';
  ctx.fillRect(0, 0, w, h);
  const panels = layoutPanels(state.layout, state.panels.length);
  const gutter = 0.008;
  panels.forEach((rect, i) => {
    const inset = [rect[0] + gutter / 2, rect[1] + gutter / 2, rect[2] - gutter, rect[3] - gutter];
    const panel = state.panels[i] ?? { photo: 0, zoom: 100, panX: 0, panY: 0 };
    drawPhotoInPanel(ctx, state.photos[panel.photo] ?? null, inset, panel);
  });
  ctx.filter = 'none';
  panels.forEach((rect, i) => {
    const inset = [rect[0] + gutter / 2, rect[1] + gutter / 2, rect[2] - gutter, rect[3] - gutter];
    gradePanel(ctx, inset, grade);
  });
  if (state.layout === 'poster' || state.layout === 'grid') drawPalmsOnHero(ctx, panels[0]);
  grainCover(ctx);
  drawCaption(ctx, state.caption, state.subcaption, grade);
}
