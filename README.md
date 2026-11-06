# Protótipo: checklist 3D com o Golf GTI

Protótipo do checklist do mecânico do RepareCar com um carro 3D: abas Danos e Checklist, zonas clicáveis e foco de câmera
por item. Página estática, sem build. O modelo fica em `assets/models/golf-gti-2025.glb` (19 MB).

Publicado pelo GitHub Pages a partir da branch `main`.

## Rodar local

Módulos ES e o GLB não abrem por `file://`. Sirva a pasta:

```bash
python -m http.server 5204 --bind 127.0.0.1
```

Abra http://127.0.0.1:5204/

No celular, na mesma rede Wi-Fi, suba com `--bind 0.0.0.0` e abra `http://<IPv4 do PC>:5204/`.
O IPv4 aparece em `ipconfig`, no adaptador Wi-Fi. `?debug=1` mostra no canto do carro o que o toque detectou.

## Estrutura

```
./
  index.html              marcação; nada de estilo ou script inline
  assets/logo.webp        logo oficial, copiado de apps/frontend/public/images
  assets/search.webp      ilustração do estado vazio, copiada do mesmo lugar
  assets/models/          modelo 3D do Golf GTI 2025
  css/
    tokens.css            variáveis do produto, reset e base
    layout.css            trilho lateral, página, cabeçalho, seletor de abas, grade
    components.css        botão, chip, campos, caixa de upload, toast
    viewer.css            palco 3D, cabeçalho do veículo, marcadores, carregamento
    checklist.css         painel, resumo, categorias, itens, formulário de problema
    damages.css           formulário de dano, lista de danos, drawer
  js/
    main.js               entrada: liga cena, painel e eventos; carrega o modelo
    config.js             URL do modelo, cor da pintura, bucket de imagens, veículo
    data/checklist.js     categorias e itens do template do produto, mapa item → zonas
    data/parts.js         peças do carro, lado de cada uma, quais aceitam dano
    state.js              estado e regras: status por item, lado, resumo, rascunho de dano
    scene/renderer.js     renderer, cena, luzes, piso, loop de quadros
    scene/model.js        carga do GLB, fatiamento da carroceria por região, centros
    scene/camera.js       órbita, vistas, foco em peça e em ponto
    scene/paint.js        destaque das peças: seleção, foco, ponteiro
    scene/interaction.js  ponteiro no canvas: arrastar, zoom, toque
    scene/markers.js      marcadores HTML projetados sobre o carro
    ui/dom.js             referências de DOM, escape, ícones, toast, diagnóstico
    ui/actions.js         ações da tela: zona, categoria, item, dano, aba
    ui/panel.js           despacho do painel pela aba ativa
    ui/tabs.js            posição do seletor: no painel no desktop, após o cabeçalho no celular
    ui/checklist-panel.js aba Checklist
    ui/damages-panel.js   aba Danos e drawer
```

Dependências entre camadas: `data` não importa nada; `state` importa `data`; `scene` importa `data` e `state`;
`ui` importa tudo. `ui/actions.js` é o único lugar que combina cena e painel.

## O que a página faz

- Sidebar e logo do produto. Seletor Danos e Checklist em largura total, no estilo do `Tab` do produto. No desktop fica
  dentro do painel, depois do cabeçalho de cada aba; no celular, logo após o cabeçalho da página.
- O painel é o checklist do produto: 6 categorias e 45 itens do template padrão, um status por item (Ok, Problema),
  lado, tempo estimado, descrição e envio de mídia. Problema exige lado, tempo e descrição, como no produto.
- Categorias recolhidas, com marcados/total. Abrir uma categoria leva a câmera à zona dela e acende as peças.
  Cards e formulário animam com `cubic-bezier(.2,.8,.2,1)`.
- Os cards "itens avaliados" e "problemas" do resumo são toggles que filtram a lista.
- Cada item aponta para as zonas do carro onde ele fica. Tocar no nome do item acende as zonas e leva a câmera.
- Tocar numa zona do carro filtra o checklist para os itens dela e preenche o lado.
- Zona com problema ganha marcador numerado. O carro não muda de cor por estado.

## Aba Danos

- Registro livre e opcional. Sem dano, o card "Carro sem danos?" leva direto ao checklist.
- Só lataria, vidros, faróis e lanternas respondem ao toque. O toque cria um rascunho com pino provisório e abre o
  formulário: peça e lado já preenchidos, avaria em select, caixa de upload e observação. O dano só entra na lista em
  "Concluir dano"; "Cancelar" descarta. Avaria é obrigatória.
- No celular e em tela empilhada até 1100 px, o formulário abre num drawer de baixo, com a base do
  `responsive-modal.ts` do produto. A aba Checklist esconde o carro no celular.
- A lista "Danos registrados" mostra 01, 02... Tocar na linha gira o carro até o pino. A lixeira remove.

## Peças do modelo

Portas, tampa, rodas, freios, luzes, vidros e interior vêm separados no GLB. Capô, teto, paralamas, para-choques e
assoalho são fatias da malha `Ext_Body#Car_Paint`, por região, em `bodyRegion` em `js/scene/model.js`.

## O que o produto precisaria

- Guardar a peça (`partId`) junto do `side` em `checklistItems`, para o 3D saber qual roda ou farol.
- Uma entidade `checklistDamages` com `checklistId`, peça, ponto no modelo, tipo, observação e mídia.
- Um GLB por modelo ou por tipo de carroceria, com o mapa de peças.
