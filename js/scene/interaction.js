// Ponteiro sobre o canvas: arrastar gira, roda aproxima, toque curto escolhe uma peça.
// Quem decide o que fazer com o toque é quem registra o handler em onTap.
import * as THREE from 'three';
import { canvas, camera } from './renderer.js';
import { rotateBy, zoomBy } from './camera.js';
import { setHover, getHovered } from './paint.js';
import { debugLine } from '../ui/dom.js';

const TAP_MAX_MOVE = 14; // px: um dedo se mexe mais que um mouse
const PICK_INTERVAL = 40; // ms: raycast em 366 mil triângulos não roda a cada movimento

let pickables = [];
let tapHandler = () => {};
let drag = null, moved = 0, lastPick = 0, lastHit = null;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

export function setPickables(list) { pickables = list; }
export function onTap(fn) { tapHandler = fn; }

function pick(e) {
  const now = performance.now();
  if (now - lastPick < PICK_INTERVAL) return;
  lastPick = now;
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickables, false)[0];
  lastHit = hit || null;
  setHover(hit ? hit.object.userData.part.id : null);
  canvas.style.cursor = hit ? 'pointer' : drag ? 'grabbing' : 'grab';
}

function tapAt(e, source) {
  lastPick = 0;
  pick(e);
  const id = getHovered();
  debugLine(`${source} · ${id ? `peça: ${id}` : 'nada sob o toque'}`);
  if (!id) return;
  tapHandler(id, lastHit.point.clone());
}

canvas.addEventListener('pointerdown', e => {
  drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
  moved = 0;
  try { canvas.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético sem captura */ }
  debugLine(`pointerdown ${e.pointerType}`);
});
canvas.addEventListener('pointercancel', () => { drag = null; });
canvas.addEventListener('pointermove', e => {
  if (!drag) { pick(e); return; }
  rotateBy(e.clientX - drag.x, e.clientY - drag.y);
  moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
  drag = { ...drag, x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', e => {
  if (drag && moved < TAP_MAX_MOVE) tapAt(e, `pointerup ${e.pointerType}`);
  drag = null;
});
canvas.addEventListener('pointerleave', () => { drag = null; setHover(null); });
canvas.addEventListener('wheel', e => { e.preventDefault(); zoomBy(e.deltaY); }, { passive: false });
