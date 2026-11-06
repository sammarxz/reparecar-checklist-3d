// Peças da carroceria que aceitam registro de dano: lataria, vidros e luzes.
// O lado da peça aparece no formulário e na lista de danos.
export const PARTS = [
  { id: 'hood', label: 'Capô', side: 'front' },
  { id: 'roof', label: 'Teto', side: 'center' },
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
];

export const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]));
for (const p of PARTS) p.meshes = [];

export const SIDE_LABEL = { left: 'Esquerdo', right: 'Direito', front: 'Dianteiro', rear: 'Traseiro', center: 'Centro' };

export const DAMAGE_TYPES = ['Amassado', 'Risco', 'Trinca', 'Quebra', 'Corrosão', 'Pintura danificada'];
