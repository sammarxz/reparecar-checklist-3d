// O checklist do produto: template padrão com 6 categorias e 45 itens.
// Cada item aponta para as zonas do carro onde ele fica (ids em parts.js).
const W4 = ['wheel-fl', 'wheel-fr', 'wheel-rl', 'wheel-rr'];
const WF = ['wheel-fl', 'wheel-fr'];
const WR = ['wheel-rl', 'wheel-rr'];
const LF = ['headlight-l', 'headlight-r'];
const LR = ['taillight-l', 'taillight-r'];

export const CATEGORIES = [
  {
    id: 'suspension_wheels',
    label: 'Suspensão e Rodas',
    zone: 'wheel-fl',
    items: [
      ['Terminais de Direção', WF], ['Barras Axiais', WF], ['Pivôs', WF], ['Bieletas', W4],
      ['Buchas de Bandeja', WF], ['Buchas Barra Estabilizadora', W4], ['Amortecedor', W4],
      ['Coxim Superior', WF], ['Kit Batente e Coifa', W4], ['Junta Homocinética', WF],
      ['Coifa do Câmbio', ['chassis']], ['Coifa BarrasAxiais', WF], ['Geometria e Balanceamento', W4],
      ['Pressão dos Pneus', W4],
    ],
  },
  {
    id: 'light_system',
    label: 'Sistema de Iluminação',
    zone: 'headlight-l',
    items: [
      ['Freio/Brake Light', LR], ['Luz de Ré', LR], ['Pisca', [...LF, ...LR]], ['Luz Alta', LF],
      ['Luz Baixa', LF], ['Meia Luz', LF], ['Farol de Neblina', ['bumper-f']],
    ],
  },
  {
    id: 'fluids_filters',
    label: 'Fluidos & Filtros',
    zone: 'hood',
    items: [
      ['Óleo de Motor', ['hood']], ['Filtro de óleo', ['hood']], ['Líquido arrefecimento', ['hood']],
      ['Flúido de freio', ['hood']], ['Filtro de cabine', ['cabin']], ['Filtro de combustível', ['chassis']],
    ],
  },
  {
    id: 'engine',
    label: 'Motor',
    zone: 'hood',
    items: [
      ['Velas', ['hood']], ['Cabos de Velas', ['hood']], ['Bobina', ['hood']], ['Junta tampa de válvulas', ['hood']],
      ['Kit Correia dentada / Corrente', ['hood']], ['Correia auxiliar', ['hood']], ['Limpeza de bicos', ['hood']],
      ['Limpeza de TBI', ['hood']], ['Kit Embreagem', ['chassis']], ['Coxim Motor', ['hood']],
      ['Coxim Câmbio', ['chassis']], ['Coxim Inferior', ['chassis']],
    ],
  },
  {
    id: 'brakes',
    label: 'Freios',
    zone: 'wheel-fl',
    items: [
      ['Pastilhas', W4], ['Discos (Troca ou Retifica)', W4], ['Limpeza Freio Traseiro', WR],
      ['Regulagem freio de mão', WR],
    ],
  },
  {
    id: 'comfort_accessories',
    label: 'Conforto e Acessórios',
    zone: 'windshield',
    items: [['Higienização do A/C', ['cabin']], ['Palhetas', ['windshield']]],
  },
];

export const ITEMS = CATEGORIES.flatMap(c => c.items.map(([name, parts]) => ({ name, cat: c.id, parts })));
export const ITEM_BY_NAME = Object.fromEntries(ITEMS.map(i => [i.name, i]));
export const TOTAL_ITEMS = ITEMS.length;

// Categorias vistas por baixo ou por cima: ajustam o ângulo da câmera.
export const LOW_ANGLE_CATEGORIES = new Set(['suspension_wheels', 'brakes']);
export const HIGH_ANGLE_CATEGORIES = new Set(['engine', 'fluids_filters']);

// Rótulos do campo "side" do produto.
export const SIDE_LABEL = {
  left: 'Esquerdo', right: 'Direito', front: 'Dianteiro', rear: 'Traseiro',
  center: 'Centro', all: 'Todos', not_applicable: 'Não aplicado',
};

// Opções de tempo estimado, em minutos, como no formulário do produto.
export const TIME_OPTIONS = [
  [15, '15 minutos'], [30, '30 minutos'], [60, '1 hora'], [120, '2 horas'], [240, '4 horas'],
  [480, '8 horas'], [1440, '1 dia'], [2880, '2 dias'], [10080, '1 semana'],
];

export const DAMAGE_TYPES = ['Amassado', 'Risco', 'Trinca', 'Quebra', 'Corrosão', 'Pintura danificada'];

// Slug da imagem de cada item, igual a packages/web-shared/src/checklist-images.ts.
export const IMAGE_SLUG = {
  'Terminais de Direção': 'terminais-de-direcao', 'Barras Axiais': 'barras-axiais', 'Pivôs': 'pivos',
  'Bieletas': 'bieletas', 'Buchas de Bandeja': 'buchas-de-bandeja', 'Buchas Barra Estabilizadora': 'buchas-barra-estabilizadora',
  'Amortecedor': 'amortecedor', 'Coxim Superior': 'coxim-superior', 'Kit Batente e Coifa': 'kit-batente-e-coifa',
  'Junta Homocinética': 'junta-homocinetica', 'Coifa do Câmbio': 'coifa-do-cambio', 'Coifa BarrasAxiais': 'coifa-barras-axiais',
  'Geometria e Balanceamento': 'geometria-e-balanceamento', 'Pressão dos Pneus': 'pressao-dos-pneus',
  'Freio/Brake Light': 'freio-brake-light', 'Luz de Ré': 'luz-de-re', 'Pisca': 'pisca', 'Luz Alta': 'luz-alta',
  'Luz Baixa': 'luz-baixa', 'Meia Luz': 'meia-luz', 'Farol de Neblina': 'farol-de-neblina',
  'Óleo de Motor': 'oleo-de-motor', 'Filtro de óleo': 'filtro-de-oleo', 'Líquido arrefecimento': 'liquido-arrefecimento',
  'Flúido de freio': 'fluido-de-freio', 'Filtro de cabine': 'filtro-de-cabine', 'Filtro de combustível': 'filtro-de-combustivel',
  'Velas': 'velas', 'Cabos de Velas': 'cabos-de-velas', 'Bobina': 'bobina', 'Junta tampa de válvulas': 'junta-tampa-de-valvulas',
  'Kit Correia dentada / Corrente': 'kit-correia-dentada-corrente', 'Correia auxiliar': 'correia-auxiliar',
  'Limpeza de bicos': 'limpeza-de-bicos', 'Limpeza de TBI': 'limpeza-de-tbi', 'Kit Embreagem': 'kit-embreagem',
  'Coxim Motor': 'coxim-motor', 'Coxim Câmbio': 'coxim-cambio', 'Coxim Inferior': 'coxim-inferior',
  'Pastilhas': 'pastilhas', 'Discos (Troca ou Retifica)': 'discos-troca-ou-retifica',
  'Limpeza Freio Traseiro': 'limpeza-freio-traseiro', 'Regulagem freio de mão': 'regulagem-freio-de-mao',
  'Higienização do A/C': 'higienizacao-do-ac', 'Palhetas': 'palhetas',
};
