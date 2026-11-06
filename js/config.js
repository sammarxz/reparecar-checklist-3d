// Configuração do protótipo. Tudo que muda por ambiente ou por veículo fica aqui.
export const MODEL_URL = 'assets/models/golf-gti-2025.glb';
export const PAINT_COLOR = 0xf4f4f5;
export const PAINT_MATERIAL_NAME = /Rojo Kings/;
export const IMAGE_BASE_URL = 'https://r2.reparecar.com.br/checklist/';
export const STACKED_LAYOUT = '(max-width: 1100px)';
export const MOBILE_LAYOUT = '(max-width: 760px)';
export const DEBUG = /[?&]debug=1/.test(location.search);

export const VEHICLE = {
  plate: 'TXK4J56',
  name: 'Volkswagen Golf GTI',
  owner: 'André Figueiredo',
  serviceOrder: 177,
  chips: ['Hatch · 2025', 'Branco', '12.480 km'],
};
