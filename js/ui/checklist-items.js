// Passo Checklist, igual a components/pages/checklist do produto: categorias em sequência, Ok ou Problema por item,
// formulário do problema e o modal de itens não verificados ao salvar.
import { state, itemOf, setItem } from '../state.js';
import { CATEGORIES, ITEM_NAMES, SIDE_OPTIONS, TIME_OPTIONS, itemImage } from '../data/checklist.js';
import { $, esc, ICONS, UPLOAD_BOX, bindUploadStubs } from './dom.js';
import { go } from './flow.js';

const body = $('itemsBody');
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
    <section class="ck-category">
      <h2>${c.label}</h2>
      <div class="ck-list">${c.items.map(itemCard).join('')}</div>
    </section>`).join('');
  body.scrollTop = scroll;
  bindUploadStubs(body);
  // Rótulos do rodapé como getSubmitButtonLabel e o botão de voltar do produto.
  $('btnItemsBack').textContent = state.checklistSaved ? 'Cancelar' : 'Voltar';
  $('btnItemsSave').textContent = state.checklistSaved ? 'Salvar Checklist' : 'Ir para orçamento';
}

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

// Primeiro salvamento cria o orçamento; os seguintes, como a edição do produto, só voltam para a OS.
function finish() {
  showErrors = false;
  if (state.checklistSaved) {
    go('os');
    return;
  }
  state.checklistSaved = true;
  go('budget');
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
