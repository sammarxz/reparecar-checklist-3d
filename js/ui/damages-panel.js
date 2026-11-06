// Painel de danos: registro livre e opcional.
// Cada dano é um card que expande no lugar com o formulário. O dano novo, tocado no carro, entra como
// último card já aberto; em tela empilhada ele abre num drawer de baixo.
import { state } from '../state.js';
import { PART_BY_ID, SIDE_LABEL, DAMAGE_TYPES } from '../data/parts.js';
import { STACKED_LAYOUT } from '../config.js';
import { refs, esc, pad2, ICONS, UPLOAD_BOX, bindUploadStubs } from './dom.js';
import { selectDamage, closeDamage, commitDamage, removeDamage } from './actions.js';

const { panel, drawer, sheet } = refs;
const stacked = matchMedia(STACKED_LAYOUT);

// Estado vazio no padrão PageEmptyState do produto: ilustração, título e descrição, sem ação.
const EMPTY_STATE = `
  <div class="empty-state" role="status">
    <img src="assets/search.webp" alt="" width="96" height="96" loading="lazy" decoding="async">
    <h3>Nenhum dano registrado</h3>
    <p>Se o carro chegou com amassado, risco ou trinca, toque no ponto do dano na lataria para registrar.</p>
  </div>`;

const INTRO = `
  <div class="panel-intro">
    <div class="eyebrow">Funilaria</div>
    <h2>Danos na lataria</h2>
    <div class="sub">Registro opcional, para provar o estado do carro na entrada. Toque na lataria no ponto do dano.</div>
  </div>`;

// Card aberto no último render. O próximo render desenha a partir dele e troca a classe depois,
// para a altura animar ao abrir e ao fechar.
let shownOpen = null;

function damageFields(d, { isDraft, head = '' }) {
  const options = DAMAGE_TYPES.map(t => `<option ${d.type === t ? 'selected' : ''}>${t}</option>`).join('');
  return `
    <div class="dmg-fields">
      ${head}
      <div class="field"><label>Avaria encontrada</label><select data-dmg="type"><option value="">Selecione a avaria</option>${options}</select></div>
      <div class="field"><label>Documentar com fotos / vídeos</label>${UPLOAD_BOX}</div>
      <div class="field"><label>Observação</label><textarea data-dmg="desc" placeholder="Tamanho, profundidade e se a pintura está comprometida">${esc(d.desc)}</textarea></div>
      <div class="row"><button class="btn" type="button" data-dmg="secondary">${isDraft ? 'Cancelar' : 'Remover'}</button><button class="btn primary" type="button" data-dmg="done">Concluir dano</button></div>
    </div>`;
}

function damageItem(d, number, key) {
  const isDraft = key === 'draft';
  const part = PART_BY_ID[d.partId];
  const open = String(shownOpen) === String(key);
  return `
    <div class="dmg-item ${isDraft ? 'draft' : ''} ${open ? 'open' : ''}" data-key="${key}">
      <div class="dmg-row">
        <button class="dmg-toggle" type="button" aria-expanded="${open}">
          <span class="n">${number}</span>
          <span class="t"><b>${esc(d.type || 'Nova avaria')}</b><span>${esc(part.label)} · ${SIDE_LABEL[part.side]}${isDraft ? ' · ainda não registrado' : ''}</span></span>
          ${ICONS.chevron}
        </button>
        ${isDraft ? '' : `<button class="del" type="button" data-del="${d.id}" aria-label="Remover dano ${number}">${ICONS.trash}</button>`}
      </div>
      <div class="dmg-body"><div class="dmg-inner">${damageFields(d, { isDraft })}</div></div>
    </div>`;
}

export function renderDamages() {
  const useDrawer = stacked.matches;
  const draftInList = Boolean(state.draft) && !useDrawer;
  const openKey = state.draft ? (draftInList ? 'draft' : null) : state.damageSel;

  const items = state.damages.map((d, i) => damageItem(d, pad2(i + 1), d.id));
  if (draftInList) items.push(damageItem(state.draft, pad2(state.damages.length + 1), 'draft'));
  panel.innerHTML = INTRO + (items.length ? `<div class="eyebrow spaced">Danos registrados</div><div class="dmg-list">${items.join('')}</div>` : EMPTY_STATE);
  bindList();
  animateOpen(openKey);

  // Dano novo em tela empilhada: o formulário abre no drawer.
  const draftInDrawer = useDrawer && Boolean(state.draft);
  const opening = draftInDrawer && !drawer.classList.contains('open');
  if (draftInDrawer) {
    const part = PART_BY_ID[state.draft.partId];
    const head = `<div class="dmg-head"><span class="badge-n">${pad2(state.damages.length + 1)}</span><div><b>${esc(part.label)}</b><small>${SIDE_LABEL[part.side]} · ainda não registrado</small></div></div>`;
    sheet.innerHTML = damageFields(state.draft, { isDraft: true, head });
    bindFields(sheet, state.draft, true);
  } else {
    sheet.innerHTML = '';
  }
  drawer.classList.toggle('open', draftInDrawer);
  if (opening) {
    // No celular o toque gera um click atrasado no mesmo ponto. Sem esta pausa ele cai no fundo
    // do drawer recém-aberto e o fecha na hora, ou aperta o botão que estiver ali.
    drawer.classList.add('settling');
    setTimeout(() => drawer.classList.remove('settling'), 400);
  }
}

// Troca o card aberto depois do render. Timeout em vez de rAF, que pausa com a aba em segundo plano.
function animateOpen(openKey) {
  const changed = String(shownOpen) !== String(openKey);
  shownOpen = openKey;
  if (!changed) return;
  setTimeout(() => {
    void panel.offsetHeight; // calcula o estado de partida; sem isso a transição pula direto para o fim
    for (const item of panel.querySelectorAll('.dmg-item')) {
      const open = item.dataset.key === String(openKey);
      item.classList.toggle('open', open);
      item.querySelector('.dmg-toggle').setAttribute('aria-expanded', open);
      if (open) setTimeout(() => item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 420);
    }
  }, 20);
}

function bindList() {
  for (const item of panel.querySelectorAll('.dmg-item')) {
    const key = item.dataset.key;
    const isDraft = key === 'draft';
    const d = isDraft ? state.draft : state.damages.find(x => String(x.id) === key);
    item.querySelector('.dmg-toggle').addEventListener('click', () => {
      if (isDraft) return; // o rascunho fica aberto até concluir ou cancelar
      if (String(state.damageSel) === key) closeDamage();
      else selectDamage(d.id);
    });
    item.querySelector('[data-del]')?.addEventListener('click', () => removeDamage(d.id));
    bindFields(item, d, isDraft);
  }
}

function bindFields(root, d, isDraft) {
  const title = root.closest('.dmg-item')?.querySelector('.t b');
  root.querySelector('[data-dmg="type"]').addEventListener('change', e => {
    d.type = e.target.value;
    if (title) title.textContent = d.type || 'Nova avaria';
  });
  root.querySelector('[data-dmg="desc"]').addEventListener('input', e => { d.desc = e.target.value; });
  root.querySelector('[data-dmg="secondary"]').addEventListener('click', () => (isDraft ? closeDamage() : removeDamage(d.id)));
  root.querySelector('[data-dmg="done"]').addEventListener('click', commitDamage);
  bindUploadStubs(root);
}

// O formulário do dano novo muda de lugar ao virar a tela.
stacked.addEventListener('change', renderDamages);
drawer.querySelector('.scrim').addEventListener('click', closeDamage);
drawer.querySelector('#sheetClose').addEventListener('click', closeDamage);
