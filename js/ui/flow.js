// Navegação do protótipo: a ordem de serviço e os dois passos do checklist (danos e itens).
import { state } from '../state.js';
import { VEHICLE } from '../config.js';
import { $, toast } from './dom.js';
import { renderOs } from './os-page.js';
import { renderDamages } from './damages-panel.js';
import { renderItems } from './checklist-items.js';

const VIEWS = { os: $('viewOs'), damages: $('viewDamages'), items: $('viewItems') };
const RENDER = { os: renderOs, damages: renderDamages, items: renderItems };

// Títulos e imagens das etapas. As imagens vêm de apps/frontend/public/images:
// onboarding/funilaria-pintura.webp e image-d7.webp, a prancheta da tela de sucesso do orçamento.
const STEPS = {
  damages: { n: 1, title: 'Marque os danos na carroceria', image: 'assets/steps/funilaria.webp' },
  items: { n: 2, title: 'Faça a inspeção do veículo', image: 'assets/steps/checklist.webp' },
};
const TOTAL_STEPS = 2;
const stepCard = $('stepCard');

export function go(view) {
  state.view = view;
  for (const [id, el] of Object.entries(VIEWS)) el.hidden = id !== view;
  const inChecklist = view !== 'os';
  $('title').textContent = `${inChecklist ? 'Checklist' : 'Ordem de serviço'} · ${VEHICLE.plate}`;
  stepCard.hidden = !inChecklist;
  if (inChecklist) renderStepCard(STEPS[view]);
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

// Anel de progresso como components/ui/circular-progress.tsx: raio 16 num quadro de 40.
function progressRing(step, total) {
  const length = 2 * Math.PI * 16;
  const offset = length - (length * step) / total;
  return `
    <span class="step-ring" role="img" aria-label="Progresso: ${step} de ${total}">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" class="track"/>
        <circle cx="20" cy="20" r="16" class="bar" stroke-dasharray="${length.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
      </svg>
      <b>${step}</b>
    </span>`;
}

// Cabeçalho da etapa como components/pages/process-step-header.tsx.
function renderStepCard({ n, title, image }) {
  stepCard.innerHTML = `
    <div class="step-copy">
      ${progressRing(n, TOTAL_STEPS)}
      <div>
        <span class="step-of">Passo ${n} de ${TOTAL_STEPS}</span>
        <div class="step-title">${title}</div>
      </div>
    </div>
    <img src="${image}" alt="" height="64" decoding="async">`;
}

// Seta do cabeçalho: dentro do checklist volta para a OS; na OS, o pátio fica fora do protótipo.
$('btnHeaderBack').addEventListener('click', () => {
  if (state.view === 'os') toast('Volta para o pátio. Fora deste protótipo.');
  else if (state.view === 'damages') leaveDamages('os');
  else go('os');
});
