// Aba Danos: registro livre e opcional. O formulário fica no painel no desktop e num drawer no celular.
import { state } from '../state.js';
import { SIDE_LABEL, DAMAGE_TYPES } from '../data/checklist.js';
import { PART_BY_ID } from '../data/parts.js';
import { STACKED_LAYOUT } from '../config.js';
import { refs, esc, pad2, ICONS, UPLOAD_BOX, bindUploadStubs } from './dom.js';
import { selectDamage, closeDamage, commitDamage, removeDamage } from './actions.js';
import { placeTabs } from './tabs.js';

const { panel, drawer, sheet } = refs;

// Estado vazio no padrão PageEmptyState do produto: ilustração, título e descrição, sem ação.
const EMPTY_STATE = `
  <div class="empty-state" role="status">
    <img src="assets/search.webp" alt="" width="96" height="96" loading="lazy" decoding="async">
    <h3>Nenhum dano registrado</h3>
    <p>Se o carro chegou com amassado, risco ou trinca, toque no ponto do dano na lataria para registrar.</p>
  </div>`;
const stacked = matchMedia(STACKED_LAYOUT);

function damageForm(sel) {
  const part = PART_BY_ID[sel.partId];
  const number = state.draft ? pad2(state.damages.length + 1) : pad2(state.damages.indexOf(sel) + 1);
  const options = DAMAGE_TYPES.map(t => `<option ${sel.type === t ? 'selected' : ''}>${t}</option>`).join('');
  return `
    <div class="dmg-form">
      <div class="dmg-head"><span class="badge-n">${number}</span><div><b>${esc(part.label)}</b><small>${SIDE_LABEL[part.side]}${state.draft ? ' · ainda não registrado' : ''}</small></div></div>
      <div class="field"><label>Avaria encontrada</label><select data-dmg="type"><option value="">Selecione a avaria</option>${options}</select></div>
      <div class="field"><label>Documentar com fotos / vídeos</label>${UPLOAD_BOX}</div>
      <div class="field"><label>Observação</label><textarea data-dmg="desc" placeholder="Tamanho, profundidade e se a pintura está comprometida">${esc(sel.desc)}</textarea></div>
      <div class="row"><button class="btn" id="dmgDel">${state.draft ? 'Cancelar' : 'Remover'}</button><button class="btn primary" id="dmgDone">Concluir dano</button></div>
    </div>`;
}

function damageRow(d, i) {
  return `<button class="dmg-row ${state.damageSel === d.id ? 'sel' : ''}" data-dmg-id="${d.id}">
    <span class="n">${pad2(i + 1)}</span>
    <span class="t"><b>${esc(d.type)}</b><span>${esc(PART_BY_ID[d.partId].label)}</span></span>
    <span class="del" data-del="${d.id}" role="button" aria-label="Remover">${ICONS.trash}</span>
  </button>`;
}

export function renderDamages() {
  const sel = state.draft || state.damages.find(d => d.id === state.damageSel);
  const form = sel ? damageForm(sel) : '';
  const rows = state.damages.map(damageRow).join('');
  const noDamages = !state.damages.length && !sel;

  panel.innerHTML = `
    <div class="panel-intro">
      <div class="eyebrow">Funilaria</div>
      <h2>Danos na lataria</h2>
      <div class="sub">Registro opcional, para provar o estado do carro na entrada. Toque na lataria no ponto do dano.</div>
    </div>
    <div class="tabs-slot"></div>
    ${noDamages ? EMPTY_STATE : ''}
    ${form}
    ${rows ? `<div class="eyebrow spaced">Danos registrados</div><div class="dmg-list">${rows}</div>` : ''}`;

  placeTabs();

  // Em tela empilhada o formulário vai para o drawer; no desktop fica no painel.
  const useDrawer = stacked.matches;
  sheet.innerHTML = useDrawer ? form : '';
  drawer.classList.toggle('open', useDrawer && Boolean(sel));
  bindDamages(sel, useDrawer ? sheet : panel);
}

function bindDamages(sel, formRoot) {
  formRoot.querySelector('[data-dmg="type"]')?.addEventListener('change', e => { sel.type = e.target.value; });
  formRoot.querySelector('[data-dmg="desc"]')?.addEventListener('input', e => { sel.desc = e.target.value; });
  formRoot.querySelector('#dmgDel')?.addEventListener('click', () => (state.draft ? closeDamage() : removeDamage(sel.id)));
  formRoot.querySelector('#dmgDone')?.addEventListener('click', commitDamage);
  bindUploadStubs(formRoot);
  panel.querySelectorAll('.dmg-row').forEach(b => b.addEventListener('click', e => { if (!e.target.closest('[data-del]')) selectDamage(Number(b.dataset.dmgId)); }));
  panel.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); removeDamage(Number(b.dataset.del)); }));
}

// O formulário muda de lugar ao virar a tela.
stacked.addEventListener('change', () => { if (state.tab === 'damages') renderDamages(); });
drawer.querySelector('.scrim').addEventListener('click', closeDamage);
refs.drawer.querySelector('#sheetClose').addEventListener('click', closeDamage);
