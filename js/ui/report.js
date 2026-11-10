// Relatório de danos para impressão: o carro em cinco vistas, com o número de cada dano no ponto tocado,
// e a lista dos danos. As vistas saem do mesmo modelo 3D, então o número cai onde o mecânico marcou.
import * as THREE from 'three';
import { car, snapshot } from '../scene/renderer.js';
import { setSelected, setHover } from '../scene/paint.js';
import { state } from '../state.js';
import { PART_BY_ID, SIDE_LABEL } from '../data/parts.js';
import { VEHICLE } from '../config.js';
import { $, esc, pad2 } from './dom.js';

const SCREEN_PX_PER_M = 64; // tamanho do carro na página
const RENDER_SCALE = 3; // a imagem sai 3 vezes maior, para a impressão ficar nítida

// dir: de onde a câmera olha o carro. up: o que fica para cima na imagem.
// Nas vistas de cima e de lado a frente fica para cima, como no checklist de papel; os tetos ficam virados para o centro.
const VIEWS = [
  { id: 'left', label: 'Lado esquerdo', dir: [0, 0, -1], up: [1, 0, 0] },
  { id: 'top', label: 'Vista de cima', dir: [0, 1, 0], up: [1, 0, 0] },
  { id: 'right', label: 'Lado direito', dir: [0, 0, 1], up: [1, 0, 0] },
  { id: 'front', label: 'Frente', dir: [1, 0, 0], up: [0, 1, 0] },
  { id: 'rear', label: 'Traseira', dir: [-1, 0, 0], up: [0, 1, 0] },
].map(v => ({ ...v, dir: new THREE.Vector3(...v.dir), up: new THREE.Vector3(...v.up) }));

const root = $('report');
const v3 = new THREE.Vector3();

// Largura e altura do carro vistas por esta câmera, em metros.
function extent(size, axis) {
  return Math.abs(axis.x) * size.x + Math.abs(axis.y) * size.y + Math.abs(axis.z) * size.z;
}

// Uma câmera ortográfica por vista, enquadrando o carro com folga, e a foto dela.
function shootViews() {
  const box = new THREE.Box3().setFromObject(car);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return VIEWS.map(view => {
    const right = new THREE.Vector3().crossVectors(view.up, view.dir);
    const w = extent(size, right) * 1.06;
    const h = extent(size, view.up) * 1.06;
    const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 50);
    cam.up.copy(view.up);
    cam.position.copy(center).addScaledVector(view.dir, 20);
    cam.lookAt(center);
    cam.updateMatrixWorld();
    const px = SCREEN_PX_PER_M * RENDER_SCALE;
    const image = snapshot(cam, Math.round(w * px), Math.round(h * px));
    return { ...view, cam, image, width: Math.round(w * SCREEN_PX_PER_M), height: Math.round(h * SCREEN_PX_PER_M) };
  });
}

// Cada dano aparece numa vista só: a mais de frente para a face tocada. Sem a normal, vale o lado da peça.
function bestView(d, views) {
  if (!d.normal) return views.find(v => v.id === PART_BY_ID[d.partId].side) ?? views[1];
  return views.reduce((best, v) => (d.normal.dot(v.dir) > d.normal.dot(best.dir) ? v : best));
}

function pinsFor(view, damages) {
  return damages
    .filter(({ view: v }) => v === view)
    .map(({ d, n }) => {
      v3.copy(d.point).project(view.cam);
      const left = ((v3.x + 1) / 2) * 100;
      const top = ((1 - v3.y) / 2) * 100;
      return `<span class="report-pin" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%">${n}</span>`;
    })
    .join('');
}

function viewFigure(view, placed) {
  return `
    <figure class="report-view report-view-${view.id}">
      <div class="report-shot" style="width:${view.width}px;height:${view.height}px">
        <img src="${view.image}" alt="${view.label}">
        ${pinsFor(view, placed)}
      </div>
      <figcaption>${view.label}</figcaption>
    </figure>`;
}

function damageRows() {
  if (!state.damages.length) return '<tr><td colspan="5" class="report-none">Nenhum dano registrado na entrada.</td></tr>';
  return state.damages.map((d, i) => {
    const part = PART_BY_ID[d.partId];
    return `<tr><td class="num">${pad2(i + 1)}</td><td>${esc(d.type)}</td><td>${esc(part.label)}</td><td>${SIDE_LABEL[part.side]}</td><td>${esc(d.desc) || '—'}</td></tr>`;
  }).join('');
}

function reportHtml(views) {
  const placed = state.damages.map((d, i) => ({ d, n: pad2(i + 1), view: bestView(d, views) }));
  const [left, top, right, front, rear] = views;
  const today = new Date().toLocaleDateString('pt-BR');
  return `
    <div class="report-bar">
      <button class="btn" type="button" data-report="close">Voltar</button>
      <button class="btn primary" type="button" data-report="print">Imprimir</button>
    </div>
    <article class="report-page">
      <header class="report-head">
        <div>
          <h1 id="reportTitle">Relatório de danos na carroceria</h1>
          <p>OS nº ${VEHICLE.serviceOrder} · ${today}</p>
        </div>
        <img src="assets/logo.webp" alt="RepareCar" width="40" height="40">
      </header>
      <dl class="report-vehicle">
        <div><dt>Placa</dt><dd>${esc(VEHICLE.plate)}</dd></div>
        <div><dt>Veículo</dt><dd>${esc(VEHICLE.name)} (${VEHICLE.year})</dd></div>
        <div><dt>Cor</dt><dd>${esc(VEHICLE.color)}</dd></div>
        <div><dt>Quilometragem</dt><dd>${esc(VEHICLE.mileage)}</dd></div>
        <div><dt>Cliente</dt><dd>${esc(VEHICLE.owner)}</dd></div>
      </dl>
      <section>
        <h2>Marcas na carroceria</h2>
        <div class="report-views">
          <div class="report-plan">${viewFigure(left, placed)}${viewFigure(top, placed)}${viewFigure(right, placed)}</div>
          <div class="report-ends">${viewFigure(front, placed)}${viewFigure(rear, placed)}</div>
        </div>
      </section>
      <section>
        <h2>Danos registrados</h2>
        <table class="report-table">
          <thead><tr><th>Nº</th><th>Avaria</th><th>Peça</th><th>Lado</th><th>Observação</th></tr></thead>
          <tbody>${damageRows()}</tbody>
        </table>
      </section>
      <footer class="report-sign">
        <div><span></span>Cliente</div>
        <div><span></span>Responsável pela entrada</div>
      </footer>
    </article>`;
}

export function openReport() {
  // As fotos saem sem o destaque laranja de peça selecionada ou sob o ponteiro.
  const selected = state.selected;
  setHover(null);
  setSelected(null);
  const views = shootViews();
  setSelected(selected);

  root.innerHTML = reportHtml(views);
  root.hidden = false;
  document.body.classList.add('reporting');
  root.querySelector('[data-report="close"]').focus();
}

function closeReport() {
  root.hidden = true;
  root.innerHTML = '';
  document.body.classList.remove('reporting');
}

root.addEventListener('click', e => {
  const action = e.target.closest('[data-report]')?.dataset.report;
  if (action === 'close') closeReport();
  if (action === 'print') window.print();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !root.hidden) closeReport();
});
