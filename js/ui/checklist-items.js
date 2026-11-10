// Passo Checklist: os itens mecânicos do produto, em categorias recolhíveis, com Ok ou Problema.
// Problema pede lado e tempo estimado. Ao salvar, item sem resposta vira Ok depois de confirmar, como no produto.
import { state, itemOf, setItem } from '../state.js';
import { CATEGORIES, ITEM_NAMES, ITEM_SIDE_LABEL, TIME_OPTIONS, formatMinutes, itemImage } from '../data/checklist.js';
import { $, esc, toast, ICONS, UPLOAD_BOX, bindUploadStubs } from './dom.js';
import { go } from './flow.js';

const body = $('itemsBody');
const dialog = $('confirmPending');
let showErrors = false;
let justOpened = null; // item que acabou de virar Problema: o formulário entra animado

const options = (pairs, value, placeholder) =>
  `<option value="">${placeholder}</option>${pairs.map(([v, l]) => `<option value="${v}" ${String(value) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}`;

function problemFields(name, it) {
  const sideError = showErrors && !it.side ? '<span class="field-error">Selecione o lado.</span>' : '';
  const timeError = showErrors && !it.time ? '<span class="field-error">Selecione o tempo estimado.</span>' : '';
  return `
    <div class="ck-fields ${justOpened === name ? '' : 'open'}"><div class="ck-fields-inner">
      <div class="ck-row">
        <div class="field ${sideError ? 'invalid' : ''}"><label>Lado (se aplicável)</label><select data-field="side">${options(Object.entries(ITEM_SIDE_LABEL), it.side, 'Selecione o lado')}</select>${sideError}</div>
        <div class="field ${timeError ? 'invalid' : ''}"><label>Tempo estimado</label><select data-field="time">${options(TIME_OPTIONS, it.time, 'Selecione o tempo')}</select>${timeError}</div>
      </div>
      <div class="field"><label>Descreva o problema encontrado</label><textarea data-field="desc" placeholder="Detalhe o problema, sintomas observados e urgência">${esc(it.desc)}</textarea></div>
      <div class="field"><label>Documentar com fotos / vídeos</label>${UPLOAD_BOX}</div>
    </div></div>`;
}

function itemCard(name) {
  const it = itemOf(name);
  return `
    <div class="ck-item ${it.status}" data-item="${esc(name)}">
      <div class="ck-head">
        <img class="ck-icon" src="${itemImage(name)}" alt="" width="56" height="56" loading="lazy" decoding="async">
        <span class="ck-name">${esc(name)}</span>
        <div class="ck-actions">
          <button class="st ${it.status === 'ok' ? 'on-ok' : ''}" type="button" data-act="ok" aria-pressed="${it.status === 'ok'}">Ok</button>
          <button class="st ${it.status === 'problem' ? 'on-problem' : ''}" type="button" data-act="problem" aria-pressed="${it.status === 'problem'}">Problema</button>
        </div>
      </div>
      ${it.status === 'problem' ? problemFields(name, it) : ''}
    </div>`;
}

function categoryCard(c) {
  const done = c.items.filter(n => itemOf(n).status !== 'pending').length;
  const open = state.openCats.has(c.id);
  const cls = done === c.items.length ? 'full' : done ? 'part' : '';
  return `
    <section class="cat ${open ? 'open' : ''}" data-cat="${c.id}">
      <button class="cat-head" type="button" aria-expanded="${open}"><span class="cat-title">${c.label}</span><span class="count ${cls}">${done}/${c.items.length}</span>${ICONS.chevron}</button>
      <div class="cat-body"><div class="cat-items">${c.items.map(itemCard).join('')}</div></div>
    </section>`;
}

function stats() {
  const evaluated = ITEM_NAMES.filter(n => itemOf(n).status !== 'pending').length;
  const problems = ITEM_NAMES.filter(n => itemOf(n).status === 'problem');
  const minutes = problems.reduce((sum, n) => sum + (itemOf(n).time || 0), 0);
  return `
    <div class="ck-stats">
      <div><b>${evaluated}<small> / ${ITEM_NAMES.length}</small></b><span>itens avaliados</span></div>
      <div><b>${problems.length}</b><span>problemas</span></div>
      <div><b>${minutes ? formatMinutes(minutes) : '0 min'}</b><span>tempo estimado</span></div>
    </div>`;
}

export function renderItems() {
  const scroll = body.scrollTop;
  body.innerHTML = `
    <div class="panel-intro">
      <div class="eyebrow">Checklist</div>
      <h2>Inspeção mecânica</h2>
      <div class="sub">Marque cada item como Ok ou Problema. Problema pede lado e tempo estimado.</div>
    </div>
    ${stats()}
    ${CATEGORIES.map(categoryCard).join('')}`;
  body.scrollTop = scroll;
  bindUploadStubs(body);
  const fresh = justOpened && body.querySelector(`[data-item="${CSS.escape(justOpened)}"] .ck-fields`);
  justOpened = null;
  // Timeout em vez de rAF, que pausa com a aba em segundo plano.
  if (fresh) setTimeout(() => { void fresh.offsetHeight; fresh.classList.add('open'); }, 20);
}

body.addEventListener('click', e => {
  const head = e.target.closest('.cat-head');
  if (head) {
    // Só troca a classe, para a altura animar sem redesenhar a lista.
    const section = head.closest('.cat');
    const opening = !state.openCats.has(section.dataset.cat);
    opening ? state.openCats.add(section.dataset.cat) : state.openCats.delete(section.dataset.cat);
    section.classList.toggle('open', opening);
    head.setAttribute('aria-expanded', opening);
    return;
  }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  const name = act.closest('[data-item]').dataset.item;
  const status = act.dataset.act;
  if (status === 'problem' && itemOf(name).status !== 'problem') justOpened = name;
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

// Primeiro salvamento cria o orçamento; os seguintes, como a edição do produto, só voltam para a OS.
function finish() {
  showErrors = false;
  if (state.checklistSaved) {
    go('os');
    toast('Checklist atualizado.');
    return;
  }
  state.checklistSaved = true;
  go('budget');
}

function save() {
  const incomplete = ITEM_NAMES.filter(n => itemOf(n).status === 'problem' && (!itemOf(n).side || !itemOf(n).time));
  if (incomplete.length) {
    showErrors = true;
    for (const c of CATEGORIES) if (c.items.some(n => incomplete.includes(n))) state.openCats.add(c.id);
    renderItems();
    body.querySelector('.field.invalid')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    toast('Preencha o lado e o tempo estimado dos problemas.');
    return;
  }
  const pending = ITEM_NAMES.filter(n => itemOf(n).status === 'pending');
  if (pending.length) {
    $('confirmText').textContent = pending.length === 1
      ? '1 item está sem resposta. Ele será salvo como Ok.'
      : `${pending.length} itens estão sem resposta. Eles serão salvos como Ok.`;
    dialog.showModal();
    return;
  }
  finish();
}

$('btnItemsSave').addEventListener('click', save);
$('btnItemsBack').addEventListener('click', () => go('damages'));
$('confirmOk').addEventListener('click', () => {
  for (const n of ITEM_NAMES) if (itemOf(n).status === 'pending') setItem(n, { status: 'ok' });
  dialog.close();
  finish();
});
$('confirmCancel').addEventListener('click', () => dialog.close());
