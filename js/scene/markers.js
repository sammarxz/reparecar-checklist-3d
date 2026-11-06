// Marcadores HTML projetados sobre o carro: zonas com problema na aba Checklist, pinos de dano na aba Danos.
import * as THREE from 'three';
import { camera, canvas } from './renderer.js';
import { state } from '../state.js';
import { PART_BY_ID } from '../data/parts.js';

const container = document.getElementById('markers');
const v3 = new THREE.Vector3();
let handlers = { onZone: () => {}, onDamage: () => {} };

export function initMarkers(h) { handlers = h; }

function place(el, position, rect) {
  v3.copy(position).project(camera);
  el.style.left = `${((v3.x + 1) / 2) * rect.width}px`;
  el.style.top = `${((1 - v3.y) / 2) * rect.height}px`;
  el.hidden = v3.z > 1;
}

function ensure(key, className, onClick) {
  let el = container.querySelector(`[data-key="${key}"]`);
  if (!el) {
    el = document.createElement('button');
    el.className = className;
    el.dataset.key = key;
    if (onClick) el.addEventListener('click', onClick);
    container.appendChild(el);
  }
  return el;
}

export function updateMarkers() {
  const rect = canvas.getBoundingClientRect();
  const damagesTab = state.tab === 'damages';
  const wanted = new Set(damagesTab ? state.damages.map(d => `d${d.id}`).concat(state.draft ? ['draft'] : []) : state.problemOrder);
  for (const el of [...container.children]) if (!wanted.has(el.dataset.key)) el.remove();

  if (damagesTab) {
    if (state.draft) {
      const el = ensure('draft', 'marker dmg sel draft');
      el.textContent = String(state.damages.length + 1).padStart(2, '0');
      place(el, state.draft.point, rect);
    }
    state.damages.forEach((d, i) => {
      const el = ensure(`d${d.id}`, 'marker dmg', () => handlers.onDamage(d.id));
      el.textContent = String(i + 1).padStart(2, '0');
      el.title = PART_BY_ID[d.partId].label;
      el.classList.toggle('sel', state.damageSel === d.id);
      place(el, d.point, rect);
    });
    return;
  }

  state.problemOrder.forEach((id, i) => {
    const part = PART_BY_ID[id];
    const el = ensure(id, 'marker', () => handlers.onZone(id));
    el.textContent = i + 1;
    el.title = part.label;
    if (!part.center) { el.hidden = true; return; }
    place(el, part.center, rect);
  });
}
