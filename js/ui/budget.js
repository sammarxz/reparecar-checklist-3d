// Passo Orçamento. No produto, o primeiro salvamento do checklist cria o orçamento e abre a tela dele.
// Aqui fica o resumo do que o orçamento recebe; preços e peças ficam fora do protótipo.
import { state, itemOf } from '../state.js';
import { ITEM_NAMES, ITEM_SIDE_LABEL, formatMinutes } from '../data/checklist.js';
import { $, esc } from './dom.js';
import { go } from './flow.js';
import { openReport } from './report.js';

const body = $('budgetBody');

export function renderBudget() {
  const problems = ITEM_NAMES.filter(n => itemOf(n).status === 'problem');
  const minutes = problems.reduce((sum, n) => sum + itemOf(n).time, 0);
  const rows = problems.map(n => {
    const it = itemOf(n);
    return `<li><b>${esc(n)}</b><span>${ITEM_SIDE_LABEL[it.side]}</span><span>${formatMinutes(it.time)}</span></li>`;
  }).join('');
  body.innerHTML = `
    <div class="eyebrow">Orçamento</div>
    <h2>Orçamento criado a partir do checklist</h2>
    <div class="sub">No produto, esta etapa abre a tela do orçamento com os itens com problema. Preços e peças ficam fora deste protótipo.</div>
    <div class="ck-stats">
      <div><b>${problems.length}</b><span>itens com problema</span></div>
      <div><b>${minutes ? formatMinutes(minutes) : '0 min'}</b><span>tempo estimado</span></div>
      <div><b>${state.damages.length}</b><span>danos na carroceria</span></div>
    </div>
    ${problems.length ? `<ul class="budget-list">${rows}</ul>` : '<p class="os-muted">Nenhum item com problema. O orçamento começa vazio.</p>'}
    <button class="link-btn" type="button" data-budget="report">Ver checklist para impressão</button>`;
}

body.addEventListener('click', e => {
  if (e.target.closest('[data-budget="report"]')) openReport();
});
$('btnBudgetOs').addEventListener('click', () => go('os'));
