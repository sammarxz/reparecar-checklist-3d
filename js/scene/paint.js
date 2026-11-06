// Destaque visual das peças: brilho laranja na peça selecionada, nas peças em foco e sob o ponteiro.
import { state } from '../state.js';
import { PART_BY_ID } from '../data/parts.js';

let hovered = null;
export const getHovered = () => hovered;

export function paintPart(part) {
  const focused = state.selected === part.id || state.highlight.has(part.id);
  const hex = focused ? 0xff7439 : part.id === hovered ? 0xff9a66 : 0x000000;
  const intensity = focused ? 0.42 : part.id === hovered ? 0.1 : 0;
  for (const m of part.meshes) {
    m.material.color.setHex(m.material.userData.base);
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

export function setHighlight(ids) {
  const prev = [...state.highlight];
  state.highlight = new Set(ids);
  for (const id of new Set([...prev, ...ids])) paintPart(PART_BY_ID[id]);
}

export function clearHighlight() { setHighlight([]); }

// Troca a peça selecionada e repinta a anterior e a nova.
export function setSelected(id) {
  const prev = state.selected;
  state.selected = id;
  if (prev) paintPart(PART_BY_ID[prev]);
  if (id) paintPart(PART_BY_ID[id]);
}
