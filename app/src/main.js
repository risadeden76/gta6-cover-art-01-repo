// Wires the page: photos in, layout/size/grade/caption controls, per-panel
// crop and position, live preview, PNG export. A `?shot=` query sets up a
// fixed scene for a screenshot instead (./shots.js).
import { drawCover, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subcaptionInput = document.getElementById('subcaption');
const gradeSelect = document.getElementById('grade');
const panelSelect = document.getElementById('panel');
const panelPhotoSelect = document.getElementById('panel-photo');
const zoomInput = document.getElementById('zoom');
const zoomVal = document.getElementById('zoom-val');
const panXInput = document.getElementById('panx');
const panYInput = document.getElementById('pany');
const status = document.getElementById('status');
const photoList = document.getElementById('photo-list');

const state = {
  sizeKey: 'square',
  layout: 'poster',
  caption: 'Sunset Heist',
  subcaption: 'Neon Boulevard · Leonida',
  gradeKey: 'sunset',
  photos: [],
  panels: [
    { photo: 0, zoom: 100, panX: 0, panY: 0 },
    { photo: 1, zoom: 100, panX: 0, panY: 0 },
    { photo: 0, zoom: 115, panX: 0, panY: 0 },
    { photo: 1, zoom: 115, panX: 0, panY: 0 },
    { photo: 0, zoom: 130, panX: 0, panY: 0 },
    { photo: 1, zoom: 130, panX: 0, panY: 0 },
    { photo: 0, zoom: 110, panX: 0, panY: 0 },
    { photo: 1, zoom: 110, panX: 0, panY: 0 },
    { photo: 0, zoom: 125, panX: 0, panY: 0 },
  ],
};

function panelCount() {
  if (state.layout === 'nine') return 9;
  return state.layout === 'grid' ? 4 : 3;
}

function currentPanel() {
  return state.panels[Number(panelSelect.value)];
}

function redraw() {
  state.caption = captionInput.value;
  state.subcaption = subcaptionInput.value;
  state.gradeKey = gradeSelect.value;
  drawCover(canvas, state);
  if (!document.body.classList.contains('shot-cover')) {
    canvas.style.aspectRatio = `${canvas.width} / ${canvas.height}`;
  }
}

function refreshPhotoUI() {
  photoList.textContent = `${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} loaded — panels can share one photo or use several.`;
  panelPhotoSelect.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = photo.name;
    panelPhotoSelect.appendChild(option);
  });
  panelPhotoSelect.value = String(currentPanel().photo);
}

function syncPanelControls() {
  const panel = currentPanel();
  panelPhotoSelect.value = String(panel.photo);
  zoomInput.value = String(panel.zoom);
  zoomVal.textContent = `${panel.zoom}%`;
  panXInput.value = String(panel.panX);
  panYInput.value = String(panel.panY);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Loads a real sample photograph (kit starter photo) into the photo list. */
async function addSample(kind, name) {
  if (state.photos.some((p) => p.name === name)) return;
  try {
    const image = await loadImage(`./samples/${kind}.jpg`);
    state.photos.push({ name, image });
  } catch {
    status.textContent = `Could not load the ${name} sample photo.`;
    return;
  }
  refreshPhotoUI();
  redraw();
}

function setChoice(group, key, value) {
  document.querySelectorAll(`[id^="${group}-"]`).forEach((button) => {
    button.classList.toggle('active', button.id === `${group}-${value}`);
  });
  state[key] = value;
  redraw();
}

document.getElementById('photos').addEventListener('change', async (event) => {
  const files = [...event.target.files];
  for (const file of files) {
    try {
      const image = await loadImage(URL.createObjectURL(file));
      state.photos.push({ name: file.name, image });
    } catch {
      status.textContent = `Could not load ${file.name}.`;
    }
  }
  refreshPhotoUI();
  redraw();
});

document.getElementById('sample-boulevard').addEventListener('click', () => addSample('boulevard', 'Sample: Boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => addSample('pier', 'Sample: Pier'));
document.getElementById('layout-poster').addEventListener('click', () => setChoice('layout', 'layout', 'poster'));
document.getElementById('layout-triple').addEventListener('click', () => setChoice('layout', 'layout', 'triple'));
document.getElementById('layout-grid').addEventListener('click', () => setChoice('layout', 'layout', 'grid'));
document.getElementById('layout-nine').addEventListener('click', () => setChoice('layout', 'layout', 'nine'));
document.getElementById('size-square').addEventListener('click', () => setChoice('size', 'sizeKey', 'square'));
document.getElementById('size-portrait').addEventListener('click', () => setChoice('size', 'sizeKey', 'portrait'));
document.getElementById('size-wide').addEventListener('click', () => setChoice('size', 'sizeKey', 'wide'));

captionInput.addEventListener('input', redraw);
subcaptionInput.addEventListener('input', redraw);
gradeSelect.addEventListener('change', redraw);
panelSelect.addEventListener('change', syncPanelControls);
panelPhotoSelect.addEventListener('change', () => { currentPanel().photo = Number(panelPhotoSelect.value); redraw(); });
zoomInput.addEventListener('input', () => { currentPanel().zoom = Number(zoomInput.value); zoomVal.textContent = `${zoomInput.value}%`; redraw(); });
panXInput.addEventListener('input', () => { currentPanel().panX = Number(panXInput.value); redraw(); });
panYInput.addEventListener('input', () => { currentPanel().panY = Number(panYInput.value); redraw(); });
document.getElementById('fill-all').addEventListener('click', () => {
  const photo = currentPanel().photo;
  for (let i = 0; i < panelCount(); i++) state.panels[i].photo = photo;
  status.textContent = 'Every panel now uses the same photo.';
  redraw();
});

document.getElementById('export').addEventListener('click', () => {
  redraw();
  const size = SIZES[state.sizeKey];
  canvas.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    a.click();
    status.textContent = `Saved vice-cover-${size.w}x${size.h}.png`;
  }, 'image/png');
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async ({ sizeKey, layout, grade, caption }) => {
    state.sizeKey = sizeKey;
    state.layout = layout;
    state.gradeKey = grade;
    state.caption = caption;
    captionInput.value = caption;
    const sub = params.get('sub');
    if (sub) { state.subcaption = sub; subcaptionInput.value = sub; }
    gradeSelect.value = grade;
    setChoice('layout', 'layout', layout);
    setChoice('size', 'sizeKey', sizeKey);
    if (state.photos.length === 0) {
      await addSample('boulevard', 'Sample: Boulevard');
      await addSample('pier', 'Sample: Pier');
    }
    for (let i = 0; i < panelCount(); i++) {
      state.panels[i].photo = i % 2;
      state.panels[i].zoom = 100 + (i % 3) * 12;
    }
    refreshPhotoUI();
    redraw();
  });
} else {
  addSample('boulevard', 'Sample: Boulevard');
  addSample('pier', 'Sample: Pier');
  syncPanelControls();
}
