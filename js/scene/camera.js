// Câmera em órbita: arrastar gira, roda aproxima, e um alvo animado leva a câmera a uma vista, peça ou ponto.
import * as THREE from 'three';
import { camera } from './renderer.js';
import { LOW_ANGLE_CATEGORIES, HIGH_ANGLE_CATEGORIES } from '../data/checklist.js';
import { TOP_FACING } from '../data/parts.js';

export const orbit = { theta: -0.75, phi: 1.12, r: 10, target: new THREE.Vector3(0, 0.55, 0) };
const VIEWS = { iso: [-0.75, 1.12], front: [0, 1.25], left: [-Math.PI / 2, 1.3], right: [Math.PI / 2, 1.3], rear: [Math.PI, 1.25], top: [-0.75, 0.08] };
const DEFAULT_R = 10;
const clamp1 = v => Math.max(-1, Math.min(1, v));
let goal = null;

function setGoal(theta, phi, r, target) {
  const d = ((theta - orbit.theta) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; // caminho mais curto
  goal = { theta: orbit.theta + d, phi, r, target };
}

export function applyView(name) {
  const [theta, phi] = VIEWS[name];
  setGoal(theta, phi, DEFAULT_R, new THREE.Vector3(0, 0.55, 0));
}

// Enquadra a peça. A categoria do item ajusta o ângulo: suspensão e freio por baixo, motor por cima.
export function focusPart(part, cat) {
  const c = part.center;
  if (!c) return;
  let theta = Math.atan2(c.z, c.x), phi = 1.15, r = DEFAULT_R * 0.62;
  const centered = Math.hypot(c.x, c.z) < 0.5;
  if (part.id === 'roof' || part.id === 'cabin' || centered) { theta = -0.75; phi = 0.55; }
  else if (Math.abs(c.z) < 0.3) { theta = c.x > 0 ? -0.55 : Math.PI + 0.55; phi = TOP_FACING.has(part.id) ? 0.78 : 1.1; }
  else theta = Math.sign(c.z) * (Math.PI / 2 - clamp1(c.x) * 0.55); // de lado, puxado para a ponta da peça
  if (part.id === 'chassis') { theta = -1.15; phi = 1.42; r = DEFAULT_R * 0.75; }
  if (LOW_ANGLE_CATEGORIES.has(cat)) { phi = 1.38; r = DEFAULT_R * 0.45; }
  if (HIGH_ANGLE_CATEGORIES.has(cat)) { phi = 0.7; r = DEFAULT_R * 0.55; }
  setGoal(theta, phi, r, new THREE.Vector3(c.x * 0.6, Math.min(c.y, 1) * 0.7 + 0.2, c.z * 0.5));
}

// Enquadra um ponto da lataria, usado pelos pinos de dano.
export function focusPoint(c) {
  let theta = Math.atan2(c.z, c.x), phi = 1.05;
  if (Math.abs(c.z) < 0.35) theta = c.x > 0 ? -0.5 : Math.PI + 0.5;
  else theta = Math.sign(c.z) * (Math.PI / 2 - clamp1(c.x) * 0.5);
  if (c.y > 1.2) phi = 0.7;
  setGoal(theta, phi, DEFAULT_R * 0.5, new THREE.Vector3(c.x * 0.7, c.y * 0.75 + 0.15, c.z * 0.6));
}

// Chamados pela interação: o arrasto cancela a animação; a roda muda o raio.
export function rotateBy(dx, dy) {
  orbit.theta += dx * 0.008;
  orbit.phi = Math.min(1.5, Math.max(0.08, orbit.phi - dy * 0.006));
  goal = null;
}
export function zoomBy(delta) {
  orbit.r = Math.min(18, Math.max(3, orbit.r + delta * 0.01));
  if (goal) goal.r = orbit.r;
}

export function updateCamera() {
  if (goal) {
    const k = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.1;
    orbit.theta += (goal.theta - orbit.theta) * k;
    orbit.phi += (goal.phi - orbit.phi) * k;
    orbit.r += (goal.r - orbit.r) * k;
    orbit.target.lerp(goal.target, k);
    if (Math.abs(goal.theta - orbit.theta) < 0.002 && Math.abs(goal.phi - orbit.phi) < 0.002 && Math.abs(goal.r - orbit.r) < 0.01) goal = null;
  }
  const sp = Math.sin(orbit.phi);
  camera.position.set(orbit.r * sp * Math.cos(orbit.theta), orbit.r * Math.cos(orbit.phi), orbit.r * sp * Math.sin(orbit.theta)).add(orbit.target);
  camera.lookAt(orbit.target);
}
