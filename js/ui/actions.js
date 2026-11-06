// Ações da tela: o que acontece quando o usuário toca no carro, na lista ou nas abas.
// Junta estado, cena e painel. Os painéis importam daqui; daqui só se chama render().
import { state, getItem, setItem, itemHits, clearSelection } from '../state.js';
import { ITEMS, ITEM_BY_NAME, CATEGORIES } from '../data/checklist.js';
import { PART_BY_ID } from '../data/parts.js';
import { paintPart, setSelected, setHighlight, clearHighlight, setHover } from '../scene/paint.js';
import { applyView, focusPart, focusPoint } from '../scene/camera.js';
import { setPickables } from '../scene/interaction.js';
import { pickSets } from '../scene/model.js';
import { render } from './panel.js';
import { toast, refs } from './dom.js';

// ---------- Checklist ----------

// Toque numa zona: filtra o checklist para os itens dela e leva a câmera até lá.
export function selectZone(id) {
  clearHighlight();
  setSelected(id);
  if (id) {
    const part = PART_BY_ID[id];
    // Problema aberto sem lado: tocar na peça define o lado e a peça.
    for (const it of part.items) {
      const d = getItem(it.name);
      if (d.status === 'problem' && !d.partId && !d.side) setItem(it.name, { partId: id, side: part.side });
    }
    focusPart(part);
  } else {
    applyView('iso');
  }
  render();
}

// Abrir uma categoria leva a câmera à zona dela e acende as zonas dos itens.
export function focusCategory(catId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  setHighlight(ITEMS.filter(i => i.cat === catId).flatMap(i => i.parts));
  focusPart(PART_BY_ID[cat.zone], catId);
}

// Tocar no nome do item acende as zonas dele e leva a câmera até a primeira.
export function focusItem(name) {
  const it = ITEM_BY_NAME[name];
  const ids = itemHits(it);
  setHighlight(ids);
  const first = ids.find(id => id.endsWith('-l') || id.endsWith('fl')) || ids[0];
  if (first) focusPart(PART_BY_ID[first], it.cat);
}

export { clearHighlight };

// ---------- Danos ----------

// O toque cria um rascunho com pino provisório. O dano entra na lista só em "Concluir dano".
export function startDamage(partId, point) {
  state.draft = { partId, point, type: '', desc: '' };
  state.damageSel = null;
  setSelected(partId);
  focusPoint(point);
  render();
}

export function selectDamage(id) {
  const d = state.damages.find(x => x.id === id);
  state.draft = null;
  state.damageSel = id;
  setSelected(d ? d.partId : null);
  if (d) focusPoint(d.point);
  render();
}

export function closeDamage() {
  clearSelection();
  for (const p of Object.values(PART_BY_ID)) if (p.meshes.length) paintPart(p);
  applyView('iso');
  render();
}

export function commitDamage() {
  const d = state.draft || state.damages.find(x => x.id === state.damageSel);
  if (!d) return;
  if (!d.type) { toast('Selecione o tipo de avaria.'); return; }
  if (state.draft) state.damages.push({ ...state.draft, id: ++state.damageSeq });
  closeDamage();
}

export function removeDamage(id) {
  state.damages = state.damages.filter(d => d.id !== id);
  if (state.damageSel === id) closeDamage();
  else render();
}

// ---------- Abas ----------

export function setTab(tab) {
  state.tab = tab;
  setPickables(tab === 'damages' ? pickSets.body : pickSets.zone);
  const prev = state.selected;
  clearSelection();
  if (prev) paintPart(PART_BY_ID[prev]);
  clearHighlight();
  setHover(null);
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
  document.body.dataset.tab = tab;
  applyView('iso');
  render();
  refs.panel.scrollTop = 0; // cada aba começa do topo
}

// Toque no carro: a aba decide se é zona do checklist ou ponto de dano.
export function handleTap(partId, point) {
  if (state.tab === 'damages') startDamage(partId, point);
  else selectZone(partId);
}
