// Pinos de dano projetados sobre o carro: um por dano registrado e um tracejado para o rascunho.
import * as THREE from 'three';
import { camera, canvas } from './renderer.js';
import { state } from '../state.js';
import { PART_BY_ID } from '../data/parts.js';
import { pad2 } from '../ui/dom.js';

const container = document.getElementById('markers');
const v3 = new THREE.Vector3();
let onSelect = () => {};

export function onMarkerClick(fn) { onSelect = fn; }

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
  const wanted = new Set(state.damages.map(d => `d${d.id}`));
  if (state.draft) wanted.add('draft');
  for (const el of [...container.children]) if (!wanted.has(el.dataset.key)) el.remove();

  if (state.draft) {
    const el = ensure('draft', 'marker dmg sel draft');
    el.textContent = pad2(state.damages.length + 1);
    place(el, state.draft.point, rect);
  }
  state.damages.forEach((d, i) => {
    const el = ensure(`d${d.id}`, 'marker dmg', () => onSelect(d.id));
    el.textContent = pad2(i + 1);
    el.title = PART_BY_ID[d.partId].label;
    el.classList.toggle('sel', state.damageSel === d.id);
    place(el, d.point, rect);
  });
}
