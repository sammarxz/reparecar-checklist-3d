// Ordem de serviço: cartão do veículo e as abas do modal da OS do produto. Só a aba Checklist funciona.
import { state, itemOf } from '../state.js';
import { VEHICLE } from '../config.js';
import { PART_BY_ID } from '../data/parts.js';
import { CATEGORIES, ITEM_SIDE_LABEL, formatMinutes, itemImage } from '../data/checklist.js';
import { $, esc, pad2, ICONS } from './dom.js';
import { go } from './flow.js';
import { openReport, viewsBlock } from './report.js';

const TABS = [['general', 'Geral'], ['checklist', 'Checklist'], ['budget', 'Orç.'], ['notes', 'Notas'], ['history', 'Histórico']];
const root = $('viewOs');

function summaryCard() {
  const rows = [
    ['Cliente', VEHICLE.owner], ['Placa', VEHICLE.plate], ['Cor', VEHICLE.color], ['Quilometragem', VEHICLE.mileage],
  ];
  return `
    <section class="card os-summary" aria-label="Veículo">
      <div class="os-id">
        <span class="os-number">OS nº ${VEHICLE.serviceOrder}</span>
        <b>${esc(VEHICLE.name)} (${VEHICLE.year})</b>
        <span class="status">${esc(VEHICLE.status)}</span>
      </div>
      <dl class="os-facts">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </section>`;
}

function tabsBar() {
  const index = TABS.findIndex(([id]) => id === state.osTab);
  return `
    <div class="os-tabs" role="tablist" aria-label="Seções da ordem de serviço" style="--tabs:${TABS.length};--index:${index}">
      <span class="os-tabs-pill" aria-hidden="true"></span>
      ${TABS.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === state.osTab}" tabindex="${id === state.osTab ? 0 : -1}">${label}</button>`).join('')}
    </div>`;
}

function damagesSection() {
  const list = state.damages.map((d, i) => `<li><span class="n">${pad2(i + 1)}</span><b>${esc(d.type)}</b><span>${esc(PART_BY_ID[d.partId].label)}</span></li>`).join('');
  return `
    <section class="os-section">
      <h3>Danos na carroceria <span class="count">${state.damages.length}</span></h3>
      ${state.damages.length ? `<div class="os-views">${viewsBlock()}</div><ol class="os-damages">${list}</ol>` : '<p class="os-muted">Nenhum dano registrado na entrada.</p>'}
    </section>`;
}

function problemItem(name) {
  const it = itemOf(name);
  return `
    <li class="os-problem">
      <img src="${itemImage(name)}" alt="" width="48" height="48" loading="lazy" decoding="async">
      <div>
        <b>${esc(name)}</b>
        <span>${ITEM_SIDE_LABEL[it.side]} · ${formatMinutes(it.time)}</span>
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ''}
      </div>
    </li>`;
}

function problemsSection() {
  const groups = CATEGORIES
    .map(c => [c, c.items.filter(n => itemOf(n).status === 'problem')])
    .filter(([, names]) => names.length)
    .map(([c, names]) => `<h4>${c.label}</h4><ul class="os-problems">${names.map(problemItem).join('')}</ul>`)
    .join('');
  return `
    <section class="os-section">
      <h3>Itens com problema</h3>
      ${groups || '<p class="os-muted">Todos os itens do veículo estão OK. Nenhum problema encontrado.</p>'}
    </section>`;
}

function checklistTab() {
  const actions = state.checklistSaved
    ? `<div class="os-actions">
        <button class="btn" type="button" data-os="edit">Editar checklist</button>
        <button class="btn icon-btn" type="button" data-os="print" aria-label="Imprimir checklist" title="Imprimir checklist">${ICONS.printer}</button>
      </div>`
    : '';
  let body;
  if (!state.checklistCreated) {
    body = `<div class="os-empty"><p>Nenhum checklist criado para essa OS.</p><button class="btn primary" type="button" data-os="create">Criar checklist</button></div>`;
  } else if (!state.checklistSaved) {
    body = `<div class="os-empty"><p>Checklist em preenchimento.</p><button class="btn primary" type="button" data-os="continue">Continuar checklist</button></div>`;
  } else {
    body = damagesSection() + problemsSection();
  }
  return `<div class="os-tab-head"><h2>Checklist</h2>${actions}</div>${body}`;
}

function tabContent() {
  if (state.osTab === 'checklist') return checklistTab();
  return '<div class="os-empty"><p>Esta aba fica fora deste protótipo.</p></div>';
}

export function renderOs() {
  root.innerHTML = `${summaryCard()}<section class="card os-main">${tabsBar()}<div class="os-panel" role="tabpanel">${tabContent()}</div></section>`;
}

// Troca a aba sem redesenhar a barra, para o fundo branco deslizar até a aba nova.
function selectTab(tab) {
  state.osTab = tab;
  const bar = root.querySelector('.os-tabs');
  bar.style.setProperty('--index', TABS.findIndex(([id]) => id === tab));
  for (const b of bar.querySelectorAll('[role="tab"]')) {
    const on = b.dataset.tab === tab;
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
  }
  root.querySelector('.os-panel').innerHTML = tabContent();
  bar.querySelector(`[data-tab="${tab}"]`).focus();
}

root.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]')?.dataset.tab;
  if (tab) {
    selectTab(tab);
    return;
  }
  const action = e.target.closest('[data-os]')?.dataset.os;
  if (action === 'create') askDialog.showModal();
  if (action === 'continue' || action === 'edit') go(state.bodywork ? 'damages' : 'items');
  if (action === 'print') openReport();
});

// Antes do checklist: com dano de funilaria, começa pelos danos; sem dano, vai direto para o passo 2.
const askDialog = $('askBodywork');
askDialog.addEventListener('click', e => {
  const answer = e.target.closest('[data-bodywork]')?.dataset.bodywork;
  if (!answer) return;
  askDialog.close();
  state.checklistCreated = true;
  state.bodywork = answer === 'yes';
  go(state.bodywork ? 'damages' : 'items');
});

// Setas trocam de aba, como o tablist do produto.
root.addEventListener('keydown', e => {
  if (!e.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const index = TABS.findIndex(([id]) => id === state.osTab);
  const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
  selectTab(TABS[next][0]);
});
