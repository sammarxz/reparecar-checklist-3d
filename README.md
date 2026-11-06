# Protótipo: registro de danos 3D com o Golf GTI

Protótipo da etapa de danos do RepareCar, antes do checklist do mecânico: o mecânico toca na lataria do carro 3D no
ponto do dano e registra a avaria. Página estática, sem build. O modelo fica em `assets/models/golf-gti-2025.glb` (19 MB).

Publicado pelo GitHub Pages a partir da raiz da branch `main`: https://sammarxz.github.io/reparecar-checklist-3d/
`.nojekyll` desliga o build do Jekyll. O `netlify.toml` continua no repositório para quem publica pelo Netlify.

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
    layout.css            trilho lateral, página, cabeçalho, grade
    components.css        botão, campos, caixa de upload, toast
    viewer.css            palco 3D, cabeçalho do veículo, pinos, carregamento
    panel.css             painel da direita: corpo com rolagem e rodapé fixo
    damages.css           estado vazio, lista de danos em acordeão, drawer
  js/
    main.js               entrada: liga cena, painel e rodapé; carrega o modelo
    config.js             URL do modelo, cor da pintura, quebra de layout, dados do veículo
    data/parts.js         peças que aceitam dano, lado de cada uma, tipos de avaria
    state.js              estado: danos registrados, dano aberto, rascunho
    scene/renderer.js     renderer, cena, luzes, piso, loop de quadros
    scene/model.js        carga do GLB e fatiamento da carroceria por região
    scene/camera.js       órbita, vista padrão, foco num ponto
    scene/paint.js        destaque da peça: seleção e ponteiro
    scene/interaction.js  ponteiro no canvas: arrastar, zoom, toque
    scene/markers.js      pinos de dano projetados sobre o carro
    ui/dom.js             referências de DOM, escape, ícones, toast, diagnóstico
    ui/actions.js         ações: tocar na lataria, abrir, concluir e remover dano
    ui/damages-panel.js   painel de danos e drawer
```

Dependências entre camadas: `data` não importa nada; `state` não importa nada; `scene` importa `data` e `state`;
`ui` importa tudo. `ui/actions.js` é o único lugar que combina cena e painel.

## O que a página faz

- Sidebar e logo do produto. Rodapé com "Voltar" e "Ir para checklist"; os dois só avisam, porque a ordem de serviço e
  o checklist ficam fora do protótipo. "Ir para checklist" pede para concluir ou cancelar um dano aberto.
- Sobre o carro, o topo segue o cartão de OS do mecânico: modelo e ano, selo de status, cliente, OS, cor e
  quilometragem. No celular ficam só modelo, status e cliente.
- Registro livre e opcional. Sem dano, o estado vazio explica como registrar.
- Só lataria, vidros, faróis e lanternas respondem ao toque. O toque cria um rascunho com pino tracejado e abre o
  formulário: avaria em select, caixa de upload e observação. O dano só entra na lista em "Concluir dano";
  "Cancelar" descarta. Avaria é obrigatória.
- Cada dano é um card que expande no lugar com o formulário, um card aberto por vez. Abrir um card gira o carro até o
  pino. A lixeira remove.
- No desktop o dano novo entra como último card, já aberto. No celular e em tela empilhada até 1100 px, ele abre num
  drawer de baixo, com a base do `responsive-modal.ts` do produto. No celular a página tem a altura da tela e o
  rodapé fica sempre visível.
- O pino some quando o ponto marcado fica do outro lado do carro.

## Peças do modelo

Portas, tampa, luzes e vidros vêm separados no GLB. Capô, teto, paralamas e para-choques são fatias da malha
`Ext_Body#Car_Paint`, por região, em `bodyRegion` em `js/scene/model.js`.

## O que o produto precisaria

- Uma entidade `checklistDamages` com `checklistId`, peça, ponto no modelo, tipo, observação e mídia.
- Um GLB por modelo ou por tipo de carroceria, com o mapa de peças.
