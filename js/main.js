// Ponto de entrada: monta a cena, liga os eventos, carrega o modelo e abre a ordem de serviço.
import { VEHICLE } from './config.js';
import { onFrame, startLoop } from './scene/renderer.js';
import { updateCamera } from './scene/camera.js';
import { loadModel, pickables } from './scene/model.js';
import { onTap, setPickables } from './scene/interaction.js';
import { onMarkerClick, updateMarkers } from './scene/markers.js';
import { $, refs, ICONS } from './ui/dom.js';
import { startDamage, selectDamage } from './ui/actions.js';
import { go, leaveDamages } from './ui/flow.js';

// Cabeçalho do veículo sobre o carro
$('vName').textContent = `${VEHICLE.name} (${VEHICLE.year})`;
$('vStatus').textContent = VEHICLE.status;
$('vOwner').textContent = VEHICLE.owner;
$('vMeta').innerHTML = [
  [ICONS.receipt, `OS nº ${VEHICLE.serviceOrder}`],
  ['<span class="swatch" aria-hidden="true"></span>', VEHICLE.color],
  [ICONS.gauge, VEHICLE.mileage],
].map(([icon, text]) => `<li>${icon}${text}</li>`).join('');

// Rodapé do passo de danos
$('btnBack').addEventListener('click', () => leaveDamages('os'));
$('btnNext').addEventListener('click', () => leaveDamages('items'));

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

go('os');
