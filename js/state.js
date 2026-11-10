// Estado do protótipo. Sem DOM e sem three.js.
export const state = {
  // Fluxo: 'os' é a ordem de serviço; 'damages', 'items' e 'budget' são os passos do checklist.
  view: 'os',
  osTab: 'checklist',
  checklistCreated: false,
  bodywork: null, // resposta a "Existe dano de funilaria?": sem dano, o checklist pula a etapa de danos
  checklistSaved: false, // salvo uma vez: o orçamento já existe e salvar de novo só volta para a OS

  // Danos na carroceria
  selected: null, // peça em destaque no carro
  damages: [], // danos registrados
  damageSel: null, // id do dano aberto para edição
  damageSeq: 0,
  draft: null, // dano tocado e ainda não registrado

  // Itens mecânicos: nome do item -> { status: 'ok' | 'problem', side, time, desc }
  items: {},
};

export function clearSelection() {
  state.damageSel = null;
  state.draft = null;
}

export const itemOf = name => state.items[name] ?? { status: 'pending', side: '', time: null, desc: '' };

export function setItem(name, patch) {
  state.items[name] = { ...itemOf(name), ...patch };
}
