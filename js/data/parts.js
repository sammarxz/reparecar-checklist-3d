// Peças do carro: id, rótulo e lado. O lado da peça preenche o campo "side" do item.
import { ITEMS } from './checklist.js';

export const PARTS = [
  { id: 'hood', label: 'Capô / motor', side: 'front' },
  { id: 'roof', label: 'Teto', side: 'center' },
  { id: 'cabin', label: 'Cabine', side: 'center' },
  { id: 'hatch', label: 'Tampa traseira', side: 'rear' },
  { id: 'bumper-f', label: 'Para-choque dianteiro', side: 'front' },
  { id: 'bumper-r', label: 'Para-choque traseiro', side: 'rear' },
  { id: 'windshield', label: 'Para-brisa', side: 'front' },
  { id: 'rear-glass', label: 'Vidro traseiro', side: 'rear' },
  { id: 'door-fl', label: 'Porta dianteira esquerda', side: 'left' },
  { id: 'door-rl', label: 'Porta traseira esquerda', side: 'left' },
  { id: 'door-fr', label: 'Porta dianteira direita', side: 'right' },
  { id: 'door-rr', label: 'Porta traseira direita', side: 'right' },
  { id: 'fender-fl', label: 'Paralama dianteiro esquerdo', side: 'left' },
  { id: 'fender-fr', label: 'Paralama dianteiro direito', side: 'right' },
  { id: 'fender-rl', label: 'Paralama traseiro esquerdo', side: 'left' },
  { id: 'fender-rr', label: 'Paralama traseiro direito', side: 'right' },
  { id: 'headlight-l', label: 'Farol esquerdo', side: 'left' },
  { id: 'headlight-r', label: 'Farol direito', side: 'right' },
  { id: 'taillight-l', label: 'Lanterna traseira esquerda', side: 'left' },
  { id: 'taillight-r', label: 'Lanterna traseira direita', side: 'right' },
  { id: 'wheel-fl', label: 'Roda dianteira esquerda', side: 'left' },
  { id: 'wheel-fr', label: 'Roda dianteira direita', side: 'right' },
  { id: 'wheel-rl', label: 'Roda traseira esquerda', side: 'left' },
  { id: 'wheel-rr', label: 'Roda traseira direita', side: 'right' },
  { id: 'chassis', label: 'Assoalho e transmissão', side: 'center' },
];

export const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]));

for (const p of PARTS) {
  p.items = ITEMS.filter(i => i.parts.includes(p.id));
  p.meshes = [];
  p.center = null;
}

// Peças que aceitam registro de dano na aba Danos: lataria, vidros e luzes.
export const BODY_PARTS = new Set([
  'door-fl', 'door-fr', 'door-rl', 'door-rr', 'fender-fl', 'fender-fr', 'fender-rl', 'fender-rr',
  'hood', 'roof', 'hatch', 'bumper-f', 'bumper-r', 'windshield', 'rear-glass',
  'headlight-l', 'headlight-r', 'taillight-l', 'taillight-r',
]);

// Peças cujo centro de câmera fica no topo ou na base, não no meio.
export const TOP_FACING = new Set(['hood', 'roof', 'windshield', 'rear-glass']);
