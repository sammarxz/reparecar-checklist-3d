// Checklist mecânico do produto: os 45 itens globais do seed, em 6 categorias.
// Fonte: migration 20260206142107_seed_checklist_template_items. Todos permitem escolher o lado.
export const CATEGORIES = [
  {
    id: 'suspension_wheels',
    label: 'Suspensão e Rodas',
    items: ['Terminais de Direção', 'Barras Axiais', 'Pivôs', 'Bieletas', 'Buchas de Bandeja', 'Buchas Barra Estabilizadora',
      'Amortecedor', 'Coxim Superior', 'Kit Batente e Coifa', 'Junta Homocinética', 'Coifa do Câmbio', 'Coifa BarrasAxiais',
      'Geometria e Balanceamento', 'Pressão dos Pneus'],
  },
  {
    id: 'light_system',
    label: 'Sistema de Iluminação',
    items: ['Freio/Brake Light', 'Luz de Ré', 'Pisca', 'Luz Alta', 'Luz Baixa', 'Meia Luz', 'Farol de Neblina'],
  },
  {
    id: 'fluids_filters',
    label: 'Fluidos & Filtros',
    items: ['Óleo de Motor', 'Filtro de óleo', 'Líquido arrefecimento', 'Flúido de freio', 'Filtro de cabine', 'Filtro de combustível'],
  },
  {
    id: 'engine',
    label: 'Motor',
    items: ['Velas', 'Cabos de Velas', 'Bobina', 'Junta tampa de válvulas', 'Kit Correia dentada / Corrente', 'Correia auxiliar',
      'Limpeza de bicos', 'Limpeza de TBI', 'Kit Embreagem', 'Coxim Motor', 'Coxim Câmbio', 'Coxim Inferior'],
  },
  {
    id: 'brakes',
    label: 'Freios',
    items: ['Pastilhas', 'Discos (Troca ou Retifica)', 'Limpeza Freio Traseiro', 'Regulagem freio de mão'],
  },
  {
    id: 'comfort_accessories',
    label: 'Conforto e Acessórios',
    items: ['Higienização do A/C', 'Palhetas'],
  },
];

export const ITEM_NAMES = CATEGORIES.flatMap(c => c.items);
export const CATEGORY_OF = Object.fromEntries(CATEGORIES.flatMap(c => c.items.map(name => [name, c])));

// Opções do select "Lado (se aplicável)" em checklist-form.tsx.
export const SIDE_OPTIONS = [
  ['left', 'Esquerdo'], ['right', 'Direito'], ['front', 'Frente'], ['rear', 'Traseira'],
  ['all', 'Todos'], ['center', 'Centro'], ['not_applicable', 'Não aplicado'],
];

// Lado na leitura do checklist, como sideLabels em modal-os/checklist.tsx.
export const ITEM_SIDE_LABEL = {
  left: 'Esquerdo', right: 'Direito', front: 'Dianteiro', rear: 'Traseiro',
  all: 'Todos', center: 'Centro', not_applicable: 'Não aplicado',
};

// Opções de tempo estimado, em minutos, como lib/time-utils.ts do frontend.
export const TIME_OPTIONS = [
  [15, '15 minutos'], [30, '30 minutos'], [60, '1 hora'], [120, '2 horas'], [240, '4 horas'],
  [480, '8 horas'], [1440, '1 dia'], [2880, '2 dias'], [10080, '1 semana'],
];

// Tempo em minutos por extenso: "3 h 45 min". O produto hoje imprime só as horas inteiras.
export function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(' ') || '0 min';
}

// Imagem de cada item, no mesmo endereço do produto (packages/web-shared/src/checklist-images.ts).
const IMAGE_BASE_URL = 'https://r2.reparecar.com.br/checklist/';
const slug = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace('barrasaxiais', 'barras-axiais').replace('a/c', 'ac').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const itemImage = name => `${IMAGE_BASE_URL}${slug(name)}.webp`;
