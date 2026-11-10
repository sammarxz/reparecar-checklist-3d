// Passo Checklist. O cartão é igual a components/pages/checklist do produto: categorias em sequência, Ok ou Problema
// por item, formulário do problema e o modal de itens não verificados. O painel ao lado resume e navega a lista.
import { state, itemOf, setItem } from '../state.js';
import { CATEGORIES, ITEM_NAMES, SIDE_OPTIONS, TIME_OPTIONS, formatMinutes, itemImage } from '../data/checklist.js';
import { PART_BY_ID } from '../data/parts.js';
import { $, esc, pad2, toast, ICONS, UPLOAD_BOX, bindUploadStubs } from './dom.js';
import { go } from './flow.js';

const body = $('itemsBody');
const summary = $('itemsSummary');
const pendingDialog = $('confirmPending');
let showErrors = false;

// Mensagens do schema do produto (superRefine em components/pages/checklist/index.tsx).
const ERRORS = {
  side: 'Lado é obrigatório para itens com problema',
  time: 'Tempo estimado é obrigatório para itens com problema',
  desc: 'Descrição do problema é obrigatória',
};
const missing = it => ({ side: !it.side, time: !it.time, desc: !it.desc.trim() });
const hasErrors = name => Object.values(missing(itemOf(name))).some(Boolean);

const options = (pairs, value, placeholder) =>
  `<option value="">${placeholder}</option>${pairs.map(([v, l]) => `<option value="${v}" ${String(value) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}`;

const error = (it, field) => (showErrors && missing(it)[field] ? `<span class="field-error">${ERRORS[field]}</span>` : '');

function problemFields(it) {
  return `
    <div class="ck-fields">
      <div class="field"><label>Lado (se aplicável)</label><select data-field="side">${options(SIDE_OPTIONS, it.side, 'Selecione o lado')}</select>${error(it, 'side')}</div>
      <div class="field"><label>Tempo estimado</label><select data-field="time">${options(TIME_OPTIONS, it.time, 'Selecione o tempo')}</select>${error(it, 'time')}</div>
      <div class="field"><label>Descreva o problema encontrado</label><textarea data-field="desc" placeholder="Detalhe o problema, sintomas observados e urgência">${esc(it.desc)}</textarea>${error(it, 'desc')}</div>
      <div class="field"><label>Documentar com fotos / vídeos</label>${UPLOAD_BOX}</div>
    </div>`;
}

function itemCard(name) {
  const it = itemOf(name);
  const ok = it.status === 'ok';
  const problem = it.status === 'problem';
  return `
    <div class="ck-item ${it.status}" data-item="${esc(name)}">
      <div class="ck-head">
        <div class="ck-id">
          <span class="ck-icon"><img src="${itemImage(name)}" alt="" width="56" height="56" loading="lazy" decoding="async"></span>
          <span class="ck-name">${esc(name)}</span>
        </div>
        <div class="ck-actions">
          <button class="st ok ${ok ? 'on' : ''}" type="button" data-act="ok" aria-pressed="${ok}">Ok${ok ? ICONS.check : ''}</button>
          <button class="st problem ${problem ? 'on' : ''}" type="button" data-act="problem" aria-pressed="${problem}">Problema${problem ? ICONS.close : ''}</button>
        </div>
      </div>
      ${problem ? problemFields(it) : ''}
    </div>`;
}

export function renderItems() {
  const scroll = body.scrollTop;
  body.innerHTML = CATEGORIES.map(c => `
    <section class="ck-category" data-cat="${c.id}">
      <h2>${c.label}</h2>
      <div class="ck-list">${c.items.map(itemCard).join('')}</div>
    </section>`).join('');
  body.scrollTop = scroll;
  bindUploadStubs(body);
  renderSummary();
  // Rótulos do rodapé como getSubmitButtonLabel e o botão de voltar do produto.
  $('btnItemsBack').textContent = state.checklistSaved ? 'Cancelar' : 'Voltar';
  $('btnItemsSave').textContent = state.checklistSaved ? 'Salvar Checklist' : 'Ir para orçamento';
}

function damagesSummary() {
  if (!state.bodywork) return '<p class="os-muted">Sem dano de funilaria a reparar.</p>';
  if (!state.damages.length) return '<p class="os-muted">Nenhum dano registrado.</p>';
  return `<ol class="sum-damages">${state.damages.map((d, i) => `<li><span class="n">${pad2(i + 1)}</span><b>${esc(d.type)}</b><span>${esc(PART_BY_ID[d.partId].label)}</span></li>`).join('')}</ol>`;
}

// Painel ao lado: progresso, categorias que levam até o trecho da lista e os danos da etapa 1.
function renderSummary() {
  const evaluated = ITEM_NAMES.filter(n => itemOf(n).status !== 'pending').length;
  const problems = ITEM_NAMES.filter(n => itemOf(n).status === 'problem');
  const minutes = problems.reduce((sum, n) => sum + (itemOf(n).time || 0), 0);
  const categories = CATEGORIES.map(c => {
    const done = c.items.filter(n => itemOf(n).status !== 'pending').length;
    const cls = done === c.items.length ? 'full' : done ? 'part' : '';
    return `<li><button type="button" data-goto="${c.id}"><span>${c.label}</span><span class="count ${cls}">${done}/${c.items.length}</span></button></li>`;
  }).join('');
  summary.innerHTML = `
    <div class="panel-intro">
      <div class="eyebrow">Checklist</div>
      <h2>Resumo da inspeção</h2>
      <div class="sub">Marque cada item como Ok ou Problema. Problema pede lado, tempo e descrição.</div>
    </div>
    <div class="ck-stats">
      <div><b>${evaluated}<small> / ${ITEM_NAMES.length}</small></b><span>itens avaliados</span></div>
      <div><b>${problems.length}</b><span>problemas</span></div>
      <div><b>${minutes ? formatMinutes(minutes) : '0 min'}</b><span>tempo estimado</span></div>
    </div>
    <div class="sum-extra">
      <div class="eyebrow">Categorias</div>
      <ul class="cat-nav">${categories}</ul>
      <div class="eyebrow">Danos na carroceria</div>
      ${damagesSummary()}
    </div>`;
}

summary.addEventListener('click', e => {
  const id = e.target.closest('[data-goto]')?.dataset.goto;
  if (id) body.querySelector(`[data-cat="${id}"]`).scrollIntoView({ block: 'start', behavior: 'smooth' });
});

body.addEventListener('click', e => {
  const act = e.target.closest('[data-act]');
  if (!act) return;
  const name = act.closest('[data-item]').dataset.item;
  const status = act.dataset.act;
  setItem(name, status === 'ok' ? { status, side: '', time: null, desc: '' } : { status });
  renderItems();
});

body.addEventListener('change', e => {
  const field = e.target.dataset.field;
  if (!field || field === 'desc') return;
  const name = e.target.closest('[data-item]').dataset.item;
  setItem(name, { [field]: field === 'time' ? Number(e.target.value) || null : e.target.value });
  renderItems();
});

body.addEventListener('input', e => {
  if (e.target.dataset.field !== 'desc') return;
  setItem(e.target.closest('[data-item]').dataset.item, { desc: e.target.value });
});

// No produto, o primeiro salvamento cria o orçamento e abre a tela dele, que fica fora do protótipo.
// Aqui os dois casos voltam para a OS, com o checklist pronto na aba.
function finish() {
  showErrors = false;
  if (!state.checklistSaved) toast('Orçamento criado. A tela do orçamento fica fora deste protótipo.');
  state.checklistSaved = true;
  go('os');
}

function openPending(names) {
  const n = names.length;
  $('pendingText').textContent = `${n} ${n === 1 ? 'item' : 'itens'} não ${n === 1 ? 'foi marcado' : 'foram marcados'}. Deseja confirmar que ${n === 1 ? 'ele está' : 'todos estão'} OK?`;
  const list = $('pendingList');
  list.innerHTML = names.map(name => `<li>${ICONS.check}${esc(name)}</li>`).join('');
  list.scrollTop = 0;
  pendingDialog.showModal();
  checkPendingScroll();
}

// Como no produto, "Sim, está tudo OK" só libera depois de rolar a lista até o fim.
function checkPendingScroll() {
  const list = $('pendingList');
  $('pendingOk').disabled = list.scrollTop + list.clientHeight < list.scrollHeight - 4;
}

function save() {
  const invalid = ITEM_NAMES.filter(n => itemOf(n).status === 'problem' && hasErrors(n));
  if (invalid.length) {
    showErrors = true;
    renderItems();
    body.querySelector(`[data-item="${CSS.escape(invalid[0])}"]`).scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  const pending = ITEM_NAMES.filter(n => itemOf(n).status === 'pending');
  if (pending.length) {
    openPending(pending);
    return;
  }
  finish();
}

$('btnItemsSave').addEventListener('click', save);
$('btnItemsBack').addEventListener('click', () => {
  if (state.checklistSaved || !state.bodywork) go('os');
  else go('damages');
});
$('pendingList').addEventListener('scroll', checkPendingScroll);
$('pendingOk').addEventListener('click', () => {
  for (const n of ITEM_NAMES) if (itemOf(n).status === 'pending') setItem(n, { status: 'ok' });
  pendingDialog.close();
  finish();
});
$('pendingCancel').addEventListener('click', () => pendingDialog.close());
