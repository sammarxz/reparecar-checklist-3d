// Estado da tela de danos. Sem DOM e sem three.js.
export const state = {
  selected: null, // peça em destaque no carro
  damages: [], // danos registrados
  damageSel: null, // id do dano aberto para edição
  damageSeq: 0,
  draft: null, // dano tocado e ainda não registrado
};

export function clearSelection() {
  state.damageSel = null;
  state.draft = null;
}
