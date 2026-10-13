# IA de uma chamada — histórico e verificação remota

## Diagnóstico inicial (antes da virada de período)

Consulta de métricas da conta em 12/10/2026 às 02:30 UTC (11/10 à noite no Brasil): grupos adaptativos de Workers AI mostravam erros 4006. Um único teste real controlado do Qwen recebeu HTTP 429, código 4006 e mensagem explícita de esgotamento da alocação diária de 10.000 neurons. Duração: 4.258 ms. O parser anterior conhecia 3036, mas não reconhecia esse texto; por isso exibia provider-unavailable. Não foram realizadas novas inferências depois dessa confirmação.

Os agregados do período UTC anterior continham aproximadamente 38.855,86 neurons, 7.308.744 tokens de entrada e 165.907 de saída; o período UTC novo mostrava zero tokens e somente falhas na consulta. São grupos adaptativos da conta, sem atribuição garantida ao jogo ou a uma etapa; não são uma fatura. A divergência com a recusa após a virada UTC permanece sem explicação comprovada. Os códigos 5026/8007 históricos não foram atribuídos a cota ou timeout sem evidência específica. Naquela tentativa a API não respondeu. A seção seguinte registra a retomada real após a virada UTC.

## Fluxo novo

Mensagem → filtros de segurança e casos locais inequívocos → uma chamada Qwen com análise e fala candidata → motor aplica regras → validação da candidata contra o estado efetivo → fala validada ou reserva local contextual. Não há segunda chamada nem retry automático. Confiança, encerramento, itens e créditos continuam no motor. A candidata prevê uma decisão; uma previsão diferente da decisão calculada é descartada.

A memória enviada retém alegações com fonte/turno, última divergência, dúvida pendente, oferta inicial e eventos calculados. Elimina ledger, reparos e eventos duplicados. Histórico limitado a oito falas, preservando abertura e recentes; mensagem atual uma vez. Alegação de origem ou preço nunca vira confirmação independente. Clientes antigos continuam nos endpoints de interpretação/redação por compatibilidade, com métricas por etapa.

Saudações inteiras podem ser locais; “oi, como verificaria?” não é caso simples. Duplicatas concorrentes reutilizam a mesma promessa; respostas obsoletas são rejeitadas. O fallback reconhece “de graça”, retomadas como “Voltando:”, custos antigos/atuais e comentários de clima sem trocar a pergunta por um bordão.

## Comparação mensurável

Captura de payload com binding simulado, em três conversas de Nino, Olga e Davi contendo memória e perguntas compostas:

| Medida | Antes | Novo |
|---|---:|---:|
| Chamadas possíveis por turno complexo | 2 | 1 |
| Caracteres enviados somando etapas | 28.874–29.021 | 4.245–4.331 |
| Limite de saída somando etapas | 1.024 tokens | 384 tokens |

Redução aproximada de 85% dos caracteres nesses casos. Caracteres e limites não são tokens faturados; economia real e qualidade remota não foram medidas porque a conta recusou a inferência. Também não há comparação de latência remota antes/depois.

[Preço oficial](https://developers.cloudflare.com/workers-ai/platform/pricing/): Qwen cobra 4.625 neurons por milhão de tokens de entrada e 30.475 por milhão de saída. Estimativa a partir de usage real: `(inputTokens * 4625 + outputTokens * 30475) / 1e6`. Não calcular a partir de caracteres. Campos usage ausentes são null; métricas da sessão indicam quantas amostras têm tokens disponíveis.

[Clef Flash](https://developers.cloudflare.com/workers-ai/models/clef-flash/) é modelo de decisão, não redator. Seu preço atual de classificação é 3.455 neurons/milhão de tokens de entrada, sem cobrança de saída. Não foi adotado: qualidade em português não foi verificada e acrescentar classificação separada mantém duas chamadas. Não há troca de plano ou provedor.

## Falhas e privacidade

3036 ou mensagem explícita de alocação esgotada → quota; 3040 → capacidade; deadline/3007/3008 → timeout; parsing, vazio, truncamento, contrato inválido e rejeição pós-motor têm causas próprias. 4006 sozinho não prova cota.

Navegador guarda apenas modelo e fim do período UTC após cota confirmada. Bloqueio compartilhado do isolate exige duas falhas explícitas independentes; timeout ou erro genérico não bloqueiam outros jogadores. Esse bloqueio é best effort por isolate, não trava distribuída durável entre todos os isolates. A expiração segue o reset oficial 00:00 UTC; a inconsistência observada do provedor pode exigir nova confirmação no período seguinte.

Logs do servidor contêm somente fase, modelo, chamadas, duração, caracteres, tokens disponíveis, código e motivo. O servidor sabe que o provedor retornou; a origem final exibida é registrada separadamente na sessão do navegador após o validador. Nenhuma fala, credencial ou nome é incluído nas métricas de produção. O script de teste usa dados fictícios.

## Verificação e retomada remota

- Suite completa e casos novos em `tests/single-turn.test.mjs`: binding simulado testa o transporte/contrato, não comprova Qwen.
- Benchmark local: 99 turnos, 135/135 verificações, zero repetições detectadas pelo critério sintético. Sem alegação de aprendizagem ou naturalidade universal.
- Novas conversas de seis mensagens para Nino, Olga e Davi: apresentação, incerteza, pergunta composta, correção, comentário social, retomada e recusa; motor não concede créditos por texto.
- Nenhuma alteração de layout, progressão, Supervisor ou avaliação de fim de expediente.

Quando houver disponibilidade, executar `scripts/check-remote-turn.mjs` com `CLOUDFLARE_ACCOUNT_ID` da conta autorizada e login Wrangler existente. Máximo três chamadas, interrompe na primeira cota, salva somente metadados, sai com erro se não houver três respostas remotas aceitas. Não executado novamente durante a cota confirmada. Antes de publicar, revisar falas e consumo com conversas remotas completas; esse probe curto não substitui o teste de qualidade extenso.

[Qwen e parâmetros suportados](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/) · [Erros Cloudflare](https://developers.cloudflare.com/workers-ai/platform/errors/)

## Retomada real — 12/10/2026 após 21h de Brasília

O Qwen voltou a responder. Probe inicial: três chamadas reais, uma fala aceita; falhas de contrato e cobertura motivaram as correções. Rodada inicial completa com Nino/Olga/Davi: 21 chamadas, zero candidatas aceitas, 25.244 tokens de entrada e 3.647 de saída, 227,90 neurons estimados. O backend removia minimum/maximum de rapport; o modelo também confundia intenção do jogador com a reação do personagem e citava índices inválidos.

O contrato agora define os campos, usa enum para rapport e ancora evidence na mensagem atual. Uma prévia descartável do motor fornece intenção, decisão e reação contextual para a redação; a partida real permanece intacta até aplicar o motor após a análise. A candidata continua validada contra esse resultado, não contra a prévia. Não há retry nem segunda inferência. /no_think fica na última mensagem user. O teto de saída passou de 384 para 448 tokens após truncamentos observados; não é uma cobrança fixa.

Corrigimos falso positivo de “compartilhou” como “comparar”, papel do nome apresentado, citações históricas de preço, comentários fora do assunto, falta de confirmação e marcadores sociais que escondiam a primeira pergunta. Falas com instruções do prompt visíveis são rejeitadas. A correção de condição deixa de pedir a mesma correção novamente.

Rodada inédita candidata à publicação: 21 inferências reais, 19 falas aceitas e duas reservas locais (pergunta incompleta/repetição), 33.793 tokens de entrada, 3.494 de saída, 262,77 neurons estimados. Os diálogos incluíram apresentações diferentes, perguntas compostas com gírias, correção de gratuidade para C$19, chuva, origem desconhecida, lembrança de valor antigo e recusa. A inspeção mostrou recuperação dos nomes, comparação de condições e explicações do risco sem inventar pagamento. Nino relacionou ao desenho, Olga ao café e Davi ao registro. Algumas falas ainda reproduzem a referência local quase literalmente; aceitação não é uma medida universal de naturalidade. As rejeições permanecem contextuais e sem segunda chamada.

Consumo estimado usa tokens reais de usage e a tabela oficial; não substitui a fatura/agregados da conta. Os arquivos de QA contêm somente diálogos sintéticos, ficam ignorados pelo Git e não integram métricas de produção. `scripts/check-remote-conversations.mjs --public` permite repetir o percurso no endpoint publicado com limite de 24 chamadas e parada imediata na primeira cota explícita.

Desktop: soltura encaixa em células de 110 × 102 px, evita célula ocupada e mantém posição após reload; arraste permanece livre somente durante o movimento. Saves anteriores são alinhados sem apagar progresso.

### Conferência no site publicado

Em 12/10/2026, às 21:35 de Brasília, o endpoint público respondeu com Qwen real: 21 chamadas, 20 candidatas aceitas e uma reserva local por repetição. Usage: 33.799 tokens de entrada e 3.490 de saída; estimativa de 262,68 neurons pela tabela oficial. Duração da mensagem completa: mediana 1.445 ms, p95 2.187 ms. Nenhum item ou crédito foi fabricado; as três conversas terminaram na recusa. Todos os arquivos e o desktop publicado foram conferidos; arraste/encaixe/persistência também foram verificados localmente.

Esse conjunto usa situações sintéticas específicas, não demonstra qualidade universal, eficácia com alunos ou garantia de disponibilidade diária. A naturalidade continua limitada: várias respostas seguem a referência local de perto. O único fallback publicado manteve uma resposta pertinente, sem retry. A nova referência aumenta um pouco o contexto comparado à primeira versão de uma chamada (227,90 → 262,68 neurons nas rodadas de 21 turnos); essa troca foi medida e mantém uma chamada por turno, com redução forte em relação aos payloads antigos de duas etapas.
