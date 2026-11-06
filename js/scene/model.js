// Carrega o GLB e liga cada malha a uma peça do catálogo.
// O arquivo traz portas, tampa, rodas, freios, luzes e vidros separados. Capô, teto, paralamas,
// para-choques e assoalho vêm numa malha só e são fatiados por região.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MODEL_URL, PAINT_COLOR, PAINT_MATERIAL_NAME } from '../config.js';
import { PARTS, PART_BY_ID, BODY_PARTS, TOP_FACING } from '../data/parts.js';
import { car } from './renderer.js';

// Malhas que respondem ao toque em cada aba.
export const pickSets = { zone: [], body: [] };

// Região da carroceria pintada, em coordenadas do carro: x frente, y cima, z direita.
function bodyRegion(p) {
  const x = p.x, y = p.y, az = Math.abs(p.z);
  if (x > 1.72 && y < 0.62) return 'bumper-f';
  if (x < -1.7 && y < 0.66) return 'bumper-r';
  if (y < 0.42) return 'chassis';
  if (x > 0.72) { if (y > 0.8 && az < 0.7) return 'hood'; return p.z < 0 ? 'fender-fl' : 'fender-fr'; }
  if (x < -1.28) { if (y > 1.25) return 'roof'; return p.z < 0 ? 'fender-rl' : 'fender-rr'; }
  if (y > 1.28 && az < 0.72) return 'roof';
  return 'cabin';
}
const leftRight = (l, r) => p => (p.z < 0 ? l : r);

// Decide a peça de uma malha pelo nome dela e dos grupos acima: um id, uma função por região, ou descarte.
function partForMesh(m) {
  const n = m.name;
  const ancestors = [];
  for (let o = m.parent; o; o = o.parent) ancestors.push(o.name || '');
  const under = s => ancestors.some(a => a.startsWith(s));
  if (n.includes('Shadowcap') || n.startsWith('Ext_Door_Limiter')) return { drop: true };
  for (const s of ['FL', 'FR', 'RL', 'RR']) {
    if (n.startsWith(`Rim_${s}`) || n.startsWith(`Tire_${s}`) || under(`BRAKE_${s}`)) return `wheel-${s.toLowerCase()}`;
    if (under(`EXT_DOOR_${s}`) || under(`INT_DOOR_${s}`)) return `door-${s.toLowerCase()}`;
  }
  if (under('BRAKE_REAR')) return { region: leftRight('wheel-rl', 'wheel-rr') };
  if (n.startsWith('Ext_Window_Rear')) return 'rear-glass';
  if (under('EXT_TRUNK_LID') || under('INT_TRUNK_LID') || n.startsWith('Ext_Trunk_Lid_Hyd')) return 'hatch';
  if (n.startsWith('Ext_Window_Windshield') || n.startsWith('Ext_Body_Window')) return 'windshield';
  if (n.startsWith('Ext_Lights')) return { region: leftRight('headlight-l', 'headlight-r') };
  if (n.startsWith('Ext_Taillight')) return { region: leftRight('taillight-l', 'taillight-r') };
  if (n.startsWith('Ext_Sunroof')) return 'roof';
  if (n.startsWith('Ext_Body#')) return { region: bodyRegion };
  if (n.startsWith('Ext_Body_Grille') || n.startsWith('Ext_Body_Front')) return 'bumper-f';
  if (n.startsWith('Ext_Body_Exhaust')) return 'bumper-r';
  if (under('INTERIOR') || /^(Int|seat)/.test(n)) return 'cabin';
  return null;
}

// Fatia uma malha por triângulo, pelo centroide em coordenadas do carro.
function splitMesh(mesh, regionOf) {
  const g = (mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);
  const pos = g.attributes.position, buckets = {}, c = new THREE.Vector3(), t = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(t.fromBufferAttribute(pos, i + k));
    c.multiplyScalar(1 / 3);
    (buckets[regionOf(c)] ||= []).push(i);
  }
  const out = [];
  for (const [id, tris] of Object.entries(buckets)) {
    const sub = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(g.attributes)) {
      const arr = new Float32Array(tris.length * 3 * attr.itemSize);
      tris.forEach((i, n) => {
        for (let k = 0; k < 3; k++) for (let j = 0; j < attr.itemSize; j++) arr[(n * 3 + k) * attr.itemSize + j] = attr.array[(i + k) * attr.itemSize + j];
      });
      sub.setAttribute(name, new THREE.BufferAttribute(arr, attr.itemSize));
    }
    const m = new THREE.Mesh(sub, mesh.material);
    m.name = `${mesh.name}@${id}`;
    out.push([id, m]);
  }
  mesh.removeFromParent();
  return out;
}

function register(mesh, id) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.material = mesh.material.clone(); // cada peça tem o próprio material para destacar sozinha
  mesh.material.userData.base = mesh.material.color.getHex();
  const part = PART_BY_ID[id];
  if (!part) return;
  mesh.userData.part = part;
  part.meshes.push(mesh);
  if (part.items.length) pickSets.zone.push(mesh); // aba Checklist: só zonas com itens
  if (BODY_PARTS.has(id)) pickSets.body.push(mesh); // aba Danos: lataria, vidros e luzes
}

// Centro de cada peça, usado pela câmera e pelos marcadores.
function computeCenters() {
  const box = new THREE.Box3();
  for (const p of PARTS) {
    if (!p.meshes.length) continue;
    box.makeEmpty();
    for (const m of p.meshes) box.expandByObject(m);
    const c = box.getCenter(new THREE.Vector3());
    if (p.side === 'left') c.z = box.min.z;
    if (p.side === 'right') c.z = box.max.z;
    if (TOP_FACING.has(p.id)) c.y = box.max.y;
    if (p.id === 'chassis') c.y = box.min.y;
    p.center = c;
  }
}

export function loadModel({ onProgress, onLoad, onError }) {
  new GLTFLoader().load(MODEL_URL, gltf => {
    const root = gltf.scene;
    car.add(root);
    root.rotation.y = -Math.PI / 2; // o arquivo tem a frente em -z; o protótipo usa +x
    root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root);
    root.position.y -= bb.min.y; // pneus no chão
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if (o.isMesh && o.material && PAINT_MATERIAL_NAME.test(o.material.name)) {
        o.material.color.setHex(PAINT_COLOR);
        o.material.metalness = 0.1;
        o.material.roughness = 0.3;
      }
    });
    const meshes = [];
    root.traverse(o => { if (o.isMesh) meshes.push(o); });
    for (const m of meshes) {
      const r = partForMesh(m);
      if (r && r.drop) { m.removeFromParent(); continue; }
      if (r && r.region) {
        for (const [id, sub] of splitMesh(m, r.region)) { car.add(sub); register(sub, id); }
        continue;
      }
      m.castShadow = true;
      m.receiveShadow = true;
      if (r) register(m, r);
    }
    computeCenters();
    onLoad();
  }, ev => { if (ev.total) onProgress(ev.loaded / ev.total); }, onError);
}
