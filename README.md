# Protótipo: checklist com registro de danos 3D

Protótipo do checklist do RepareCar com uma etapa nova de danos na carroceria. O fluxo começa na ordem de serviço,
passa por Danos e Checklist e volta para a OS com o checklist pronto para imprimir. Na etapa de danos o
mecânico toca na lataria do carro 3D no ponto do dano. Página estática, sem build. O modelo fica em
`assets/models/golf-gti-2025.glb` (19 MB).

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
  assets/steps/           imagens das etapas: reparo.webp, ilustração nova, e checklist.webp, image-d7.webp do frontend
  css/
    tokens.css            variáveis do produto, reset e base
    layout.css            trilho lateral, página, cabeçalho, grade
    components.css        botão, campos, caixa de upload, toast
    viewer.css            palco 3D, cabeçalho do veículo, pinos, carregamento
    panel.css             painel da direita: corpo com rolagem e rodapé fixo
    damages.css           estado vazio, lista de danos em acordeão, drawer
    os.css                cabeçalho da etapa, ordem de serviço e abas
    checklist.css         checklist como o do produto, painel de resumo e modais
    report.css            relatório na tela e folha A4 na impressão
  js/
    main.js               entrada: liga cena e rodapé, carrega o modelo e abre a OS
    config.js             URL do modelo, cor da pintura, quebra de layout, dados do veículo
    data/parts.js         peças que aceitam dano, lado de cada uma, tipos de avaria
    data/checklist.js     os 45 itens do seed do produto, lados, tempos e imagens
    state.js              estado: vista atual, danos, rascunho e itens do checklist
    scene/renderer.js     renderer, cena, luzes, piso, loop de quadros
    scene/model.js        carga do GLB e fatiamento da carroceria por região
    scene/camera.js       órbita, vista padrão, foco num ponto
    scene/paint.js        destaque da peça: seleção e ponteiro
    scene/interaction.js  ponteiro no canvas: arrastar, zoom, toque
    scene/markers.js      pinos de dano projetados sobre o carro
    ui/dom.js             referências de DOM, escape, ícones, toast, diagnóstico
    ui/actions.js         ações: tocar na lataria, abrir, concluir e remover dano
    ui/damages-panel.js   painel de danos e drawer
    ui/report.js          relatório: cinco vistas do carro, danos, itens com problema e assinaturas
    ui/flow.js            troca de vista, cabeçalho da etapa e título
    ui/os-page.js         ordem de serviço: cartão do veículo, abas e aba Checklist
    ui/checklist-items.js passo Checklist como o do produto: Ok e Problema, validação, itens não verificados
```

Dependências entre camadas: `data` não importa nada; `state` não importa nada; `scene` importa `data` e `state`;
`ui` importa tudo. `ui/actions.js` é o único lugar que combina cena e painel. `ui/report.js` só lê a cena
para fotografar o carro.

## Fluxo

1. **Ordem de serviço.** Cartão do veículo e as abas do modal da OS: Geral, Checklist, Orç., Notas e Histórico.
   Só a aba Checklist funciona. Sem checklist, ela mostra "Criar checklist", como o produto.
   "Criar checklist" pergunta "Existe dano de funilaria que você gostaria de reparar?". "Sim" abre a etapa de danos;
   "Não" vai direto para o passo 2.
2. **Danos.** O carro 3D e o painel de danos. "Voltar" leva para a OS; "Ir para checklist" segue. Os dois pedem para
   concluir ou cancelar um dano aberto.
3. **Checklist.** O cartão é igual a `components/pages/checklist` do produto: os 45 itens do seed por
   categoria, Ok e Problema, e o formulário do problema. O painel ao lado mostra o progresso, as categorias, que
   levam até o trecho da lista, e os danos da etapa 1. Lado, tempo e descrição são obrigatórios, com as mensagens
   do produto. Ao salvar com itens sem resposta, abre "Confirmar itens não verificados", que só libera o "Sim"
   depois de rolar a lista. "Voltar" leva para Danos, ou para a OS quando não há dano de funilaria.
   No produto, o primeiro salvamento cria o orçamento e abre a tela dele. Aqui ele volta para a OS com um aviso.
4. **OS com o checklist pronto.** A aba Checklist mostra as cinco vistas com os números, a lista de danos e os itens
   com problema por categoria. "Editar checklist" volta para Danos; salvar de novo volta para a OS, como a edição do
   produto. A impressora abre o checklist para impressão.

Cada etapa abre com o cabeçalho de `components/pages/process-step-header.tsx`, usado na criação de OS: anel de
progresso, "Passo X de 2", título e imagem. A seta do cabeçalho da página volta para a OS.

As duas etapas usam a mesma grade: área principal à esquerda e painel de 460 px à direita, com as ações no rodapé
do painel. A página vai até 1.200 px, então a área principal fica em até 724 px em todas as etapas: larga o
bastante para o carro e perto dos 668 px do checklist do produto. Em tela empilhada, o resumo sobe para cima da
lista e o rodapé fica preso no fim da tela durante a etapa toda.

## Etapa de danos

- Sobre o carro, o topo segue o cartão de OS do mecânico: modelo e ano, selo de status, cliente, OS, cor e
  quilometragem. No celular ficam só modelo, status e cliente.
- Registro livre e opcional. Sem dano, o estado vazio explica como registrar.
- Só lataria, vidros, faróis e lanternas respondem ao toque. O toque cria um rascunho com pino tracejado e abre o
  formulário: avaria em select, caixa de upload e observação. O dano só entra na lista em "Concluir dano";
  "Cancelar" descarta. Avaria é obrigatória.
- Cada dano é um card que expande no lugar com o formulário, um card aberto por vez. Abrir um card gira o carro até o
  pino. A lixeira remove.
- No desktop o dano novo entra como último card, já aberto. No celular e em tela empilhada até 1100 px, ele abre num
  drawer de baixo, com a base do `responsive-modal.ts` do produto. No celular o card de danos tem a altura do
  conteúdo, quem rola é a página, e o rodapé fica preso no fim da tela.
- O pino some quando o ponto marcado fica do outro lado do carro.
- "Ver relatório", ao lado de "Danos registrados", e a impressora da OS abrem o checklist para impressão: dados da
  OS e do veículo, o carro de cima, dos dois lados, de frente e de trás, a lista de danos, os itens com problema
  depois de salvo e as linhas de assinatura. "Imprimir" usa a impressão do navegador, que salva em PDF.

## Como o relatório desenha o carro

As cinco vistas saem do mesmo GLB, por câmeras ortográficas, em `js/ui/report.js`. Não há ilustração separada.
Cada dano aparece numa vista só: a mais de frente para a face tocada, pela normal guardada no toque. O ponto 3D é
projetado pela câmera dessa vista, então o número cai onde o mecânico tocou. A imagem sai 3 vezes maior que na
tela, para a impressão ficar nítida. As vistas não mudam com os danos: saem uma vez e ficam guardadas.

## Peças do modelo

Portas, tampa, luzes e vidros vêm separados no GLB. Capô, teto, paralamas e para-choques são fatias da malha
`Ext_Body#Car_Paint`, por região, em `bodyRegion` em `js/scene/model.js`.

## O que o produto precisaria

- Uma entidade `checklistDamages` com `checklistId`, peça, ponto no modelo, tipo, observação e mídia. A tabela
  `checklistItems` não serve: ela tem uma linha por item de template.
- Uma etapa de danos antes do formulário atual em `/checklists/<id>`, sem mudar o envio que cria o orçamento.
- Um GLB por modelo ou por tipo de carroceria, com o mapa de peças.
- Guardar no dano o ponto e a normal, para o relatório redesenhar o carro depois.
- Gerar o PDF no produto, como o orçamento faz com `@react-pdf/renderer`, para guardar na OS e enviar ao cliente.
