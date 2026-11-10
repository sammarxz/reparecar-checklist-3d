// Renderer, cena, luzes, piso e loop de render. Expõe os objetos que os outros módulos da cena usam.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('stage');
export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
stage.appendChild(renderer.domElement);

export const canvas = renderer.domElement;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
export const car = new THREE.Group();
scene.add(car);

scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c2cc, 0.45));

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(4, 8, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -4;
sun.shadow.camera.right = sun.shadow.camera.top = 4;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const fill = new THREE.DirectionalLight(0xffffff, 0.6);
fill.position.set(-6, 3, -4);
scene.add(fill);

const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshStandardMaterial({ color: 0xd3d8df, roughness: 1 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ring = new THREE.Mesh(new THREE.RingGeometry(4.15, 4.22, 96), new THREE.MeshBasicMaterial({ color: 0xffb08a, side: THREE.DoubleSide }));
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.002;
scene.add(ring);

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

// Renderiza só o carro, por outra câmera e noutro tamanho, e devolve a imagem em PNG com fundo transparente.
// Roda tudo na mesma tarefa: a tela volta ao normal antes do próximo quadro, sem piscar.
export function snapshot(cam, width, height) {
  const ratio = renderer.getPixelRatio();
  floor.visible = ring.visible = false;
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.render(scene, cam);
  const url = canvas.toDataURL('image/png');
  floor.visible = ring.visible = true;
  renderer.setPixelRatio(ratio);
  resize();
  return url;
}

// Cada módulo registra o que precisa rodar a cada quadro.
const frameTasks = [];
export function onFrame(fn) { frameTasks.push(fn); }
export function startLoop() {
  (function loop() {
    for (const fn of frameTasks) fn();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();
}
