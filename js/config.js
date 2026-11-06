// Configuração do protótipo. Tudo que muda por ambiente ou por veículo fica aqui.
export const MODEL_URL = 'assets/models/golf-gti-2025.glb';
export const PAINT_COLOR = 0xf4f4f5;
export const PAINT_MATERIAL_NAME = /Rojo Kings/;
export const STACKED_LAYOUT = '(max-width: 1100px)';
export const DEBUG = /[?&]debug=1/.test(location.search);

export const VEHICLE = {
  plate: 'TXK4J56',
  name: 'Volkswagen Golf GTI',
  year: 2025,
  owner: 'André Figueiredo',
  status: 'Diagnóstico',
  serviceOrder: 177,
  color: 'Branco',
  mileage: '12.480 km',
};
