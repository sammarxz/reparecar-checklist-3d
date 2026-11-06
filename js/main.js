// Ponto de entrada: monta a cena, liga os eventos e carrega o modelo.
import { VEHICLE } from './config.js';
import { state, seed, summary } from './state.js';
import { TOTAL_ITEMS, ITEMS } from './data/checklist.js';
import { PARTS } from './data/parts.js';
import { onFrame, startLoop } from './scene/renderer.js';
import { updateCamera } from './scene/camera.js';
import { loadModel, pickSets } from './scene/model.js';
import { onTap, setPickables } from './scene/interaction.js';
import { initMarkers, updateMarkers } from './scene/markers.js';
import { paintPart } from './scene/paint.js';
import { $, refs, toast } from './ui/dom.js';
import { render } from './ui/panel.js';
import { handleTap, selectZone, selectDamage, setTab, focusItem, startDamage } from './ui/actions.js';

// Cabeçalho do veículo
$('vName').textContent = VEHICLE.name;
$('vMeta').textContent = `${VEHICLE.owner} · Atendimento nº ${VEHICLE.serviceOrder}`;
$('vChips').innerHTML = VEHICLE.chips.map(c => `<span class="chip">${c}</span>`).join('') + '<span class="chip accent">Em elaboração</span>';
document.querySelectorAll('.plate, #title').forEach(el => { el.textContent = el.id === 'title' ? `Checklist · ${VEHICLE.plate}` : VEHICLE.plate; });

// Abas e rodapé
document.body.dataset.tab = state.tab;
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
$('btnBack').addEventListener('click', () => selectZone(null));
$('btnSave').addEventListener('click', () => {
  const s = summary();
  if (s.missing) toast(`${s.missing} problema(s) incompleto(s). O produto bloqueia o avanço.`);
  else toast(`Protótipo: ${s.evaluated} de ${TOTAL_ITEMS} itens, ${s.problems} problemas, ${state.damages.length} danos. Nada é salvo.`);
});

// Cena
onTap(handleTap);
initMarkers({ onZone: selectZone, onDamage: selectDamage });
onFrame(updateCamera);
onFrame(updateMarkers);
startLoop();

loadModel({
  onProgress: ratio => { refs.loading.querySelector('b').textContent = `${Math.round(ratio * 100)}%`; },
  onLoad: () => {
    for (const p of PARTS) paintPart(p);
    setPickables(pickSets.zone);
    refs.loading.hidden = true;
    seed();
    render();
  },
  onError: err => {
    refs.loading.querySelector('span').textContent = 'Falha ao carregar o modelo. Sirva a pasta pelo servidor local.';
    console.error(err);
  },
});

render();

// Acesso para testes no console e nos checks automatizados.
window.__proto = { PARTS, ITEMS, state, select: selectZone, focusItem, setTab, addDamage: startDamage };
