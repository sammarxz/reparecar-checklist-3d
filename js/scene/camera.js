// Câmera em órbita: arrastar gira, roda aproxima, e um alvo animado leva a câmera à vista padrão ou a um ponto.
import * as THREE from 'three';
import { camera } from './renderer.js';

const ISO_VIEW = [-0.75, 1.12]; // 3/4 dianteiro esquerdo
const DEFAULT_R = 10;
const HOME_TARGET = new THREE.Vector3(0, 0.55, 0);
const orbit = { theta: ISO_VIEW[0], phi: ISO_VIEW[1], r: DEFAULT_R, target: HOME_TARGET.clone() };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp1 = v => Math.max(-1, Math.min(1, v));
let goal = null;

function setGoal(theta, phi, r, target) {
  const d = ((theta - orbit.theta) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; // caminho mais curto
  goal = { theta: orbit.theta + d, phi, r, target };
}

export function resetView() {
  const [theta, phi] = ISO_VIEW;
  setGoal(theta, phi, DEFAULT_R, HOME_TARGET.clone());
}

// Enquadra um ponto da lataria, usado pelos pinos de dano.
export function focusPoint(c) {
  // Ponto no meio do carro (capô, teto, para-choques): vista 3/4 de frente ou de trás. Nas laterais: de lado.
  const theta = Math.abs(c.z) < 0.35
    ? (c.x > 0 ? -0.5 : Math.PI + 0.5)
    : Math.sign(c.z) * (Math.PI / 2 - clamp1(c.x) * 0.5);
  const phi = c.y > 1.2 ? 0.7 : 1.05;
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
    const k = reducedMotion.matches ? 1 : 0.1;
    orbit.theta += (goal.theta - orbit.theta) * k;
    orbit.phi += (goal.phi - orbit.phi) * k;
    orbit.r += (goal.r - orbit.r) * k;
    orbit.target.lerp(goal.target, k);
    if (Math.abs(goal.theta - orbit.theta) < 0.002 && Math.abs(goal.phi - orbit.phi) < 0.002 && Math.abs(goal.r - orbit.r) < 0.01) goal = null;
  }
  const sp = Math.sin(orbit.phi);
  camera.position.set(orbit.r * sp * Math.cos(orbit.theta), orbit.r * Math.cos(orbit.phi), orbit.r * sp * Math.sin(orbit.theta)).add(orbit.target);
  camera.lookAt(orbit.target);
  // Atualiza a matriz já neste quadro: os pinos são projetados antes do render e ficariam um quadro atrás.
  camera.updateMatrixWorld();
}
