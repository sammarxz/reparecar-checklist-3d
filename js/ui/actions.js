// Ações da tela: tocar na lataria, abrir, concluir e remover um dano.
// Junta estado, cena e painel. O painel importa daqui; daqui só se chama renderDamages().
import { state, clearSelection } from '../state.js';
import { setSelected } from '../scene/paint.js';
import { resetView, focusPoint } from '../scene/camera.js';
import { renderDamages } from './damages-panel.js';
import { toast } from './dom.js';

// O toque cria um rascunho com pino provisório. O dano entra na lista só em "Concluir dano".
export function startDamage(partId, point) {
  state.draft = { partId, point, type: '', desc: '' };
  state.damageSel = null;
  setSelected(partId);
  focusPoint(point);
  renderDamages();
}

export function selectDamage(id) {
  const d = state.damages.find(x => x.id === id);
  state.draft = null;
  state.damageSel = id;
  setSelected(d ? d.partId : null);
  if (d) focusPoint(d.point);
  renderDamages();
}

export function closeDamage() {
  clearSelection();
  setSelected(null);
  resetView();
  renderDamages();
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
  else renderDamages();
}
