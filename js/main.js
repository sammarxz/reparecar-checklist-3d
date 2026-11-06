// Ponto de entrada: monta a cena, liga os eventos e carrega o modelo.
import { VEHICLE } from './config.js';
import { state } from './state.js';
import { PARTS } from './data/parts.js';
import { onFrame, startLoop } from './scene/renderer.js';
import { updateCamera } from './scene/camera.js';
import { loadModel, pickables } from './scene/model.js';
import { onTap, setPickables } from './scene/interaction.js';
import { onMarkerClick, updateMarkers } from './scene/markers.js';
import { $, refs, toast } from './ui/dom.js';
import { renderDamages } from './ui/damages-panel.js';
import { startDamage, selectDamage } from './ui/actions.js';

// Cabeçalho da página e do veículo
$('title').textContent = `Danos · ${VEHICLE.plate}`;
document.querySelector('.plate').textContent = VEHICLE.plate;
$('vName').textContent = VEHICLE.name;
$('vMeta').textContent = `${VEHICLE.owner} · Atendimento nº ${VEHICLE.serviceOrder}`;
$('vChips').innerHTML = VEHICLE.chips.map(c => `<span class="chip">${c}</span>`).join('') + '<span class="chip accent">Em elaboração</span>';

// Rodapé. A ordem de serviço e o checklist ficam fora do protótipo.
$('btnBack').addEventListener('click', () => toast('Volta para a ordem de serviço. Fora deste protótipo.'));
$('btnNext').addEventListener('click', () => {
  if (state.draft) {
    toast('Conclua ou cancele o dano aberto antes de seguir.');
    return;
  }
  const n = state.damages.length;
  const registered = n === 0 ? 'Sem danos' : n === 1 ? '1 dano registrado' : `${n} danos registrados`;
  toast(`${registered}. O checklist fica fora deste protótipo.`);
});

// Cena
onTap(startDamage);
onMarkerClick(selectDamage);
onFrame(updateCamera);
onFrame(updateMarkers);
startLoop();

loadModel({
  onProgress: ratio => { refs.loading.querySelector('b').textContent = `${Math.round(ratio * 100)}%`; },
  onLoad: () => {
    setPickables(pickables);
    refs.loading.hidden = true;
  },
  onError: err => {
    refs.loading.querySelector('span').textContent = 'Falha ao carregar o modelo. Sirva a pasta pelo servidor local.';
    console.error(err);
  },
});

renderDamages();

// Acesso para testes no console e nos checks automatizados.
window.__proto = { PARTS, state, addDamage: startDamage };
