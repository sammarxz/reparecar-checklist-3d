// Painel da direita: despacha para a aba ativa.
import { state } from '../state.js';
import { refs } from './dom.js';
import { renderChecklist } from './checklist-panel.js';
import { renderDamages } from './damages-panel.js';

export function render() {
  if (state.tab === 'damages') {
    renderDamages();
    return;
  }
  refs.drawer.classList.remove('open');
  renderChecklist();
}
