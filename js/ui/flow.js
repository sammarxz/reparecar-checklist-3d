// Navegação do protótipo: a ordem de serviço e os três passos do checklist (danos, itens e orçamento).
import { state } from '../state.js';
import { VEHICLE } from '../config.js';
import { $, toast } from './dom.js';
import { renderOs } from './os-page.js';
import { renderDamages } from './damages-panel.js';
import { renderItems } from './checklist-items.js';
import { renderBudget } from './budget.js';

const VIEWS = { os: $('viewOs'), damages: $('viewDamages'), items: $('viewItems'), budget: $('viewBudget') };
const RENDER = { os: renderOs, damages: renderDamages, items: renderItems, budget: renderBudget };
const STEPS = [['damages', 'Danos'], ['items', 'Checklist'], ['budget', 'Orçamento']];
const stepper = $('stepper');

export function go(view) {
  state.view = view;
  for (const [id, el] of Object.entries(VIEWS)) el.hidden = id !== view;
  const inChecklist = view !== 'os';
  $('title').textContent = `${inChecklist ? 'Checklist' : 'Ordem de serviço'} · ${VEHICLE.plate}`;
  stepper.hidden = !inChecklist;
  if (inChecklist) renderStepper();
  RENDER[view]();
  window.scrollTo(0, 0);
}

// Sair do passo de danos com um dano aberto perderia o rascunho.
export function leaveDamages(to) {
  if (state.draft) {
    toast('Conclua ou cancele o dano aberto antes de seguir.');
    return;
  }
  go(to);
}

// Danos e Checklist alternam livremente. Orçamento só chega salvando o checklist.
function renderStepper() {
  const current = STEPS.findIndex(([id]) => id === state.view);
  stepper.innerHTML = `<ol>${STEPS.map(([id, label], i) => {
    const status = i < current ? 'done' : i === current ? 'current' : 'next';
    const canGo = id !== 'budget' && state.view !== 'budget' && i !== current;
    const inner = `<span class="step-n">${i + 1}</span><span class="step-label">${label}</span>`;
    const body = canGo
      ? `<button type="button" data-step="${id}">${inner}</button>`
      : `<span ${i === current ? 'aria-current="step"' : ''}>${inner}</span>`;
    return `<li class="${status}">${body}</li>`;
  }).join('')}</ol>`;
  stepper.querySelector('[data-step="items"]')?.addEventListener('click', () => leaveDamages('items'));
  stepper.querySelector('[data-step="damages"]')?.addEventListener('click', () => go('damages'));
}

// Seta do cabeçalho: dentro do checklist volta para a OS; na OS, o pátio fica fora do protótipo.
$('btnHeaderBack').addEventListener('click', () => {
  if (state.view === 'os') toast('Volta para o pátio. Fora deste protótipo.');
  else if (state.view === 'damages') leaveDamages('os');
  else go('os');
});
