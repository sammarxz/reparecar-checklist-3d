// Estado da tela e regras de negócio do checklist. Sem DOM e sem three.js.
import { ITEMS } from './data/checklist.js';
import { PARTS, PART_BY_ID } from './data/parts.js';

export const state = {
  tab: 'checklist',
  // Checklist: um registro por item do template, como no produto
  items: {},
  problemOrder: [],
  selected: null,
  highlight: new Set(),
  openCats: new Set(),
  justOpened: null,
  showProblems: false,
  showEvaluated: false,
  // Danos: um pino por toque, registrado só em "Concluir dano"
  damages: [],
  damageSel: null,
  damageSeq: 0,
  draft: null,
};

const EMPTY_ITEM = { status: 'pending', side: null, partId: null, time: null, desc: '' };
export const getItem = name => state.items[name] || EMPTY_ITEM;

export function setItem(name, patch) {
  const prev = getItem(name);
  state.items[name] = patch.status === 'ok' ? { ...EMPTY_ITEM, status: 'ok' } : { ...prev, ...patch };
  for (const p of PARTS) {
    const has = partStatus(p) === 'problem';
    const idx = state.problemOrder.indexOf(p.id);
    if (has && idx < 0) state.problemOrder.push(p.id);
    if (!has && idx >= 0) state.problemOrder.splice(idx, 1);
  }
}

// Item que pode ficar em mais de um lado exige o lado quando marcado como problema.
export const needsSide = it => new Set(it.parts.map(id => PART_BY_ID[id].side)).size > 1;

// Peças que um item marca no carro: a peça tocada, ou as do lado escolhido.
export function itemHits(it) {
  const d = getItem(it.name);
  if (d.partId) return [d.partId];
  if (!d.side && needsSide(it)) return []; // problema sem lado ainda não marca o carro
  if (d.side && d.side !== 'all') {
    return it.parts.filter(id => PART_BY_ID[id].side === d.side || !['left', 'right'].includes(PART_BY_ID[id].side));
  }
  return it.parts;
}

export function partStatus(part) {
  let ok = false;
  for (const it of part.items) {
    const d = getItem(it.name);
    if (d.status === 'problem' && itemHits(it).includes(part.id)) return 'problem';
    if (d.status === 'ok') ok = true;
  }
  return ok ? 'ok' : 'pending';
}

export function summary() {
  let evaluated = 0, problems = 0, minutes = 0, missing = 0;
  for (const it of ITEMS) {
    const d = getItem(it.name);
    if (d.status !== 'pending') evaluated++;
    if (d.status === 'problem') {
      problems++;
      minutes += d.time || 0;
      if (!d.time || !d.desc || (!d.side && needsSide(it))) missing++;
    }
  }
  return { evaluated, problems, minutes, missing };
}

export function fmtTime(min) {
  if (!min) return '';
  if (min >= 1440) return `${min / 1440}d`;
  const h = Math.floor(min / 60), m = min % 60;
  return (h ? `${h}h` : '') + (m ? `${m}min` : '');
}

export function clearSelection() {
  state.selected = null;
  state.damageSel = null;
  state.draft = null;
}

// Exemplo pré-carregado, para a tela abrir em uso.
export function seed() {
  setItem('Pastilhas', { status: 'problem', side: 'left', partId: 'wheel-fl', time: 60, desc: 'Pastilha no limite, 2 mm.' });
  setItem('Freio/Brake Light', { status: 'problem', side: 'right', partId: 'taillight-r', time: 30, desc: 'Lâmpada queimada.' });
  for (const n of ['Luz Alta', 'Luz Baixa', 'Meia Luz', 'Óleo de Motor', 'Filtro de óleo']) setItem(n, { status: 'ok' });
}
