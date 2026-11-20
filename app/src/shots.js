// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// scene loaded; ?shot=cover shows the cover alone at an export size.
// window.__shotReady is set once the cover has been painted.
import { SIZES } from './cover.js';

export async function runShot(shot, query, setup) {
  const sizeKey = query.get('size') ?? 'square';
  const layout = query.get('layout') ?? 'poster';
  const grade = query.get('grade') ?? 'sunset';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const size = SIZES[sizeKey] ?? SIZES.square;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const canvas = document.getElementById('cover');
    canvas.width = size.w;
    canvas.height = size.h;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = `${query.get('dw') ?? size.w}px`;
    canvas.style.height = `${query.get('dh') ?? size.h}px`;
    canvas.style.objectFit = 'fill';
    canvas.style.aspectRatio = 'auto';
  }
  await setup({ sizeKey, layout, grade, caption });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
