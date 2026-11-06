// Aba Checklist: resumo com filtros, categorias recolhíveis e o formulário de problema do produto.
import { state, getItem, setItem, needsSide, summary, fmtTime } from '../state.js';
import { CATEGORIES, ITEM_BY_NAME, TOTAL_ITEMS, SIDE_LABEL, TIME_OPTIONS, IMAGE_SLUG } from '../data/checklist.js';
import { PART_BY_ID } from '../data/parts.js';
import { IMAGE_BASE_URL } from '../config.js';
import { refs, esc, plural, ICONS, UPLOAD_BOX, bindUploadStubs } from './dom.js';
import { selectZone, focusCategory, focusItem, clearHighlight } from './actions.js';
import { placeTabs } from './tabs.js';

const { panel } = refs;

function header(part, s) {
  if (part) {
    return `
      <button class="linkback" id="back">${ICONS.back}Checklist completo</button>
      <div class="eyebrow">Zona tocada no carro</div>
      <h2>${esc(part.label)}</h2>
      <div class="chips" style="margin-top:8px"><span class="chip accent">Lado: ${SIDE_LABEL[part.side]}</span><span class="chip">${plural(part.items.length, 'item', 'itens')}</span></div>
      <div class="tabs-slot"></div>`;
  }
  return `
    <div class="eyebrow">Checklist</div>
    <h2>Inspeção do veículo</h2>
    <div class="sub">Toque em uma zona do carro para ver só os itens dela. Toque no nome do item para o carro mostrar onde ele fica.</div>
    <div class="tabs-slot"></div>
    <div class="stats">
      <button class="stat toggle ok ${state.showEvaluated ? 'on' : ''}" id="toggleEvaluated" aria-pressed="${state.showEvaluated}"><b>${s.evaluated}<small> / ${TOTAL_ITEMS}</small></b><span>itens avaliados</span></button>
      <button class="stat toggle ${state.showProblems ? 'on' : ''}" id="toggleProblems" aria-pressed="${state.showProblems}"><b>${s.problems}</b><span>problemas</span></button>
      <div class="stat"><b>${fmtTime(s.minutes) || '0'}</b><span>tempo estimado</span></div>
    </div>`;
}

function problemFields(it, d) {
  const sideOptions = Object.entries(SIDE_LABEL).map(([k, l]) => `<option value="${k}" ${d.side === k ? 'selected' : ''}>${l}</option>`).join('');
  const timeOptions = TIME_OPTIONS.map(([m, l]) => `<option value="${m}" ${d.time === m ? 'selected' : ''}>${l}</option>`).join('');
  return `
    <div class="fields-wrap ${state.justOpened === it.name ? 'enter' : 'open'}"><div class="fields">
      <div class="field"><label>Lado (se aplicável)</label><select data-field="side" data-name="${esc(it.name)}"><option value="">Selecione o lado</option>${sideOptions}</select></div>
      <div class="field"><label>Tempo estimado</label><select data-field="time" data-name="${esc(it.name)}"><option value="">Selecione o tempo</option>${timeOptions}</select></div>
      <div class="field"><label>Descreva o problema encontrado</label><textarea data-field="desc" data-name="${esc(it.name)}" placeholder="Detalhe o problema, sintomas observados e urgência">${esc(d.desc || '')}</textarea></div>
      <div class="field"><label>Documentar com fotos / vídeos</label>${UPLOAD_BOX}</div>
    </div></div>`;
}

function itemCard(it) {
  const d = getItem(it.name);
  const where = d.partId ? PART_BY_ID[d.partId].label : d.side ? SIDE_LABEL[d.side] : null;
  const slug = IMAGE_SLUG[it.name];
  const img = slug ? `<img class="icon" loading="lazy" decoding="async" src="${IMAGE_BASE_URL}${slug}.webp" alt="">` : '<span class="icon"></span>';
  return `<div class="item ${d.status}" data-item="${esc(it.name)}">
    <div class="head">${img}<button class="name" type="button" data-focus="${esc(it.name)}" title="Ver no carro">${esc(it.name)}${d.status === 'problem' && where ? `<small>${esc(where)}</small>` : ''}</button></div>
    <div class="actions">
      <button class="st ${d.status === 'ok' ? 'on-ok' : ''}" data-act="ok" data-name="${esc(it.name)}">Ok${d.status === 'ok' ? ' ✓' : ''}</button>
      <button class="st ${d.status === 'problem' ? 'on-problem' : ''}" data-act="problem" data-name="${esc(it.name)}">Problema${d.status === 'problem' ? ' ✕' : ''}</button>
    </div>
    ${d.status === 'problem' ? problemFields(it, d) : ''}</div>`;
}

function categoryCard(c, part, filter) {
  let items = c.items.map(([n]) => ITEM_BY_NAME[n]).filter(it => !part || part.items.includes(it));
  if (filter) items = items.filter(it => filter(getItem(it.name)));
  if (!items.length) return '';
  const done = filter ? items.length : items.filter(it => getItem(it.name).status !== 'pending').length;
  const total = items.length;
  const open = Boolean(part || filter) || state.openCats.has(c.id);
  const cls = done === total ? 'full' : done ? 'part' : '';
  return `<section class="cat ${open ? 'open' : ''}" data-cat="${c.id}">
    <button class="cat-head" data-cat="${c.id}" aria-expanded="${open}"><span class="cat-title">${c.label}</span><span class="count ${cls}">${done}/${total}</span>${ICONS.chevron}</button>
    <div class="cat-body"><div class="items">${items.map(itemCard).join('')}</div></div>
  </section>`;
}

export function renderChecklist() {
  const s = summary();
  const part = state.selected ? PART_BY_ID[state.selected] : null;
  const onlyProblems = state.showProblems && !part;
  const onlyEvaluated = state.showEvaluated && !part;
  const filter = onlyProblems ? d => d.status === 'problem' : onlyEvaluated ? d => d.status !== 'pending' : null;
  const label = onlyProblems ? 'Só os problemas' : onlyEvaluated ? 'Só os itens avaliados' : '';
  const groups = CATEGORIES.map(c => categoryCard(c, part, filter)).join('');
  const empty = onlyProblems ? 'Nenhum problema registrado.' : onlyEvaluated ? 'Nenhum item avaliado ainda.' : 'Esta zona não tem itens no checklist mecânico.';

  panel.innerHTML = header(part, s) + (label ? `<div class="eyebrow spaced">${label}</div>` : '') + (groups || `<div class="empty">${empty}</div>`);
  placeTabs();
  bindChecklist(part, Boolean(filter));
}

function bindChecklist(part, filtered) {
  panel.querySelector('#toggleProblems')?.addEventListener('click', () => { state.showProblems = !state.showProblems; state.showEvaluated = false; renderChecklist(); });
  panel.querySelector('#toggleEvaluated')?.addEventListener('click', () => { state.showEvaluated = !state.showEvaluated; state.showProblems = false; renderChecklist(); });
  panel.querySelector('#back')?.addEventListener('click', () => selectZone(null));

  // Abrir e fechar categoria só troca classe, para a altura animar sem recarregar a lista.
  panel.querySelectorAll('.cat-head').forEach(b => b.addEventListener('click', () => {
    if (part || filtered) return;
    const id = b.dataset.cat, section = b.closest('.cat'), opening = !state.openCats.has(id);
    opening ? state.openCats.add(id) : state.openCats.delete(id);
    section.classList.toggle('open', opening);
    b.setAttribute('aria-expanded', opening);
    if (opening) focusCategory(id); else clearHighlight();
  }));

  panel.querySelectorAll('[data-focus]').forEach(b => b.addEventListener('click', () => focusItem(b.dataset.focus)));

  panel.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    const name = b.dataset.name, it = ITEM_BY_NAME[name], act = b.dataset.act;
    const patch = { status: act };
    state.justOpened = act === 'problem' && getItem(name).status !== 'problem' ? name : null;
    if (act === 'problem') {
      patch.partId = part ? part.id : null;
      patch.side = part ? part.side : needsSide(it) ? null : PART_BY_ID[it.parts[0]].side;
    }
    setItem(name, patch);
    renderChecklist();
  }));

  panel.querySelectorAll('[data-field]').forEach(f => f.addEventListener('input', () => {
    const field = f.dataset.field;
    const value = field === 'time' ? Number(f.value) || null : f.value || null;
    const patch = { [field]: value };
    if (field === 'side') patch.partId = null;
    setItem(f.dataset.name, patch);
    if (field !== 'desc') renderChecklist();
  }));

  bindUploadStubs(panel);

  // formulário recém-aberto entra animado; timeout em vez de rAF, que pausa com a aba oculta
  const fresh = panel.querySelector('.fields-wrap.enter');
  if (fresh) setTimeout(() => fresh.classList.add('open'), 30);
}
