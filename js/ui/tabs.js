// Seletor Danos / Checklist. No desktop fica dentro do painel, no .tabs-slot que cada aba coloca
// depois do próprio cabeçalho. No celular fica logo após o cabeçalho da página.
// É sempre o mesmo nó: os listeners de clique sobrevivem às trocas de lugar.
import { MOBILE_LAYOUT } from '../config.js';

const tabs = document.querySelector('.tabs');
const pageHeader = document.querySelector('.page-header');
const mobile = matchMedia(MOBILE_LAYOUT);

// Chamado ao fim de cada render do painel, que recria o .tabs-slot.
export function placeTabs() {
  const slot = mobile.matches ? null : document.querySelector('#panel .tabs-slot');
  if (slot) slot.appendChild(tabs);
  else if (tabs.previousElementSibling !== pageHeader) pageHeader.after(tabs);
}

mobile.addEventListener('change', placeTabs);
