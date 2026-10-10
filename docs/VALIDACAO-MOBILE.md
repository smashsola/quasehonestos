# Verificação de celular e continuidade

09/10/2026 — navegador Chromium do Codex, emulação de viewport. Sem aparelho real.

### Correção visual após a publicação

O modo de celular agora exige entrada principal por toque e largura até 1000 px. O painel estreito do computador conserva desktop, ícones, barra de tarefas e janelas. O SVG de Aplicativos usa a paleta do OS; no celular o retrato tem 58 px e as propostas aparecem em uma coluna com texto maior. Crachá e bilhete da tela inicial foram preservados.

Conferência adicional em Chromium com toque emulado: 360 × 800, 390 × 844, 412 × 915, 768 × 1024 e 844 × 390, uma janela e alternador sem overflow horizontal. Sem toque: 595 × 672 com desktop e ajuste de largura por teclado (479 → 459 CSS px); 1280 × 720 com duas janelas. Isso não equivale a teste em aparelho real. A partida e suas regras não foram alteradas neste ajuste.

| Área útil em CSS px | Verificação observada |
|---|---|
| 360 × 800 | Proposta, conversa, leitura antiga com aviso de novas mensagens; sem rolagem horizontal |
| 390 × 844 | Percurso de proteção → replay → Loja/Correio → defesa → continuar; avaliação antes/depois completa |
| 412 × 915 | Compartilhar item fictício → Carteira → operação → replay; fonte em Fichas → defesa inconclusiva |
| 768 × 1024 | Uma janela por vez, alternador e propostas sem rolagem horizontal |
| 844 × 390 | Paisagem mantém navegação de celular, sem rolagem horizontal |
| 1280 × 720 | Múltiplas janelas preservadas; envio da conversa com Enter |

O teste de largura não substitui todos os percursos em cada tamanho. O percurso completo foi distribuído pelas telas de 360, 390 e 412 px; 768 e paisagem tiveram conferência de estrutura e overflow.

## Interações conferidas

- Enter móvel insere linha, sem enviar. Botão Enviar e controles móveis visíveis têm pelo menos 44 × 44 CSS px após a correção de especificidade do CSS.
- Texto digitado continua ao abrir Fichas, retornar ao Zape e recarregar. O app ativo, registro anotado, resultado e progresso são retomados.
- Uma resposta mantém a posição de leitura anterior e oferece aviso de mensagens novas; ao final, acompanha automaticamente. A mensagem longa permanece dentro da largura disponível.
- Mural, pedido e contato são consultados nos apps existentes. Fonte direta leva ao registro mesmo se o app foi lido antes.
- Resultado e replay em leitura vertical; rolagem permite alcançar o botão de continuar. Replay permanece aberto inicialmente.
- Situações legítima, fraudulenta e inconclusiva; decisão antecipada é permitida e identificada como sem evidência registrada.
- Operação cenográfica exige código correto e paga uma vez. Defesa não altera saldo. Continuação da história aparece no Correio, sem apagar consequências anteriores.
- Defesa e botões ativados por Enter; envio por Enter no desktop. Alternador inclui foco, Escape e ciclo de Tab.
- Recados inesperados ficam no Correio e no indicador do alternador no celular, sem sobrepor o envio da conversa.
- Área reduzida de **412 × 500** com campo focado acionou tratamento de teclado: campo e Enviar ficaram dentro da área útil; fonte do campo 16 px.
- As telas iniciais dos 12 apps existentes foram alternadas a 360 px, sem overflow horizontal interno. Ajustes de som e internet abriram com foco e fecharam por Escape. A sessão remota completa ainda precisa de verificação em aparelho real.
- Console da aba de teste sem erros capturados ao fim dos percursos.

## O que não foi testado

A redução da área focada é uma simulação de mudança do viewport, **não um teclado móvel real**. Ainda testar Android/iOS, IME e composição, barras do navegador, recortes físicos, zoom por pinça, leitor de tela, retorno após o sistema suspender a aba e desempenho em aparelho simples. CSS respeita áreas seguras e movimento reduzido; isso não constitui auditoria completa de acessibilidade.

A unidade de viewport distingue escala de zoom, foco e área reduzida. A lógica local e os cenários existentes permanecem; posições de janela, rascunho e leitura são preferências separadas do salvamento da partida `quase-honestos-v1`.

A suíte de regressão contém proteção em paráfrases, negação/relato, ambiguidade, contradição de preço e organização, repetição sem ganho, estados incompatíveis, hipóteses sem mutação, avaliações codificadas e salvamentos antigos. Testes do programa não provam aprendizagem.

## Arquivos alterados neste lote

- Diálogo: `engine.js`, `conversation-memory.js`, `message-interpretation.js`, `conversation-context.js`.
- Investigação e consequências: `defense-investigation.js`, `educational-replay.js`, `replay-comparison.js`, `story-continuity.js`.
- Interface existente: `game.js`, `mobile-ui.js`, `style.css`, `app-content.js`, `tutorial.js`, `audio.js`, `network.js`, `privacy.js`.
- Sala: `classroom-session.js`; README e documentos de sessão, avaliação, pitch, privacidade e atualização.
- Regressão: `investigation-continuity.test.mjs`, `mobile-classroom.test.mjs` e ajustes de expectativas em `living-dialogue.test.mjs` / `teentech-protection.test.mjs`.
