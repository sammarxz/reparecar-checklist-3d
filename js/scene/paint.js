// Destaque visual das peças: brilho laranja na peça selecionada e mais fraco sob o ponteiro.
import { state } from '../state.js';
import { PART_BY_ID } from '../data/parts.js';

let hovered = null;
export const getHovered = () => hovered;

function paintPart(part) {
  const selected = state.selected === part.id;
  const hex = selected ? 0xff7439 : part.id === hovered ? 0xff9a66 : 0x000000;
  const intensity = selected ? 0.42 : part.id === hovered ? 0.1 : 0;
  for (const m of part.meshes) {
    if (m.material.emissive && !m.material.emissiveMap) {
      m.material.emissive.setHex(hex);
      m.material.emissiveIntensity = intensity;
    }
  }
}

export function setHover(id) {
  if (id === hovered) return;
  const prev = hovered;
  hovered = id;
  if (prev) paintPart(PART_BY_ID[prev]);
  if (id) paintPart(PART_BY_ID[id]);
}

// Troca a peça selecionada e repinta a anterior e a nova.
export function setSelected(id) {
  const prev = state.selected;
  state.selected = id;
  if (prev) paintPart(PART_BY_ID[prev]);
  if (id) paintPart(PART_BY_ID[id]);
}
