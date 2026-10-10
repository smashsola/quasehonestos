# Conversa gradual e regras da simulação

Revisão de 10/10/2026, aplicada ao projeto existente. Trambique OS, seis personagens, aplicativos, investigação, replay, tutorial, atividade antes/depois e economia continuam no mesmo projeto.

## Caminho de uma mensagem

1. `src/language.js` normaliza abreviações e pequenos erros de um vocabulário limitado, divide cláusulas e distingue pergunta, hipótese e fala relatada.
2. `src/message-interpretation.js` usa essas cláusulas, a pergunta pendente, fatos da conversa e estado da operação para produzir uma interpretação local estruturada. Reconhecimento social, dúvida e pedido de esclarecimento podem coexistir.
3. Quando a IA remota está habilitada, `src/ai-dialogue.js` pede uma análise semântica ao backend antes da decisão. O contrato de `src/semantic-contract.js` permite intenção, relevância, clareza, consistência, reconhecimento social, pressão, hostilidade, incerteza, modalidade de verificação, repetição, mudança de assunto e relação com a pergunta atual. Não permite confiança, saldo, item, permissão ou resultado.
4. `src/engine.js` combina sinais válidos com limites locais. Proteção, recusa, pergunta, contradição, pressão, ofensa, conflito com ações registradas e repetição têm precedência. Ruído e anuência curta não viram uma resposta pertinente porque o modelo declarou isso.
5. `src/dialogue-balance.js` calcula a confiança. O motor também controla etapa, compartilhamento, verificação, encerramento e execução dos aplicativos.
6. Depois dessa decisão, Qwen pode redigir uma fala compatível com os fatos permitidos e com a personalidade. A resposta precisa citar a fala atual, respeitar a intenção decidida e não inventar dados, pagamentos ou ações. A fala autoral permanece disponível quando a saída não passa pela validação.

O modelo configurado permanece centralizado em `src/dialogue-config.js`. Sua redação e interpretação não constituem um modelo treinado pela equipe.

## Confiança de 0 a 100

A porcentagem agora representa diretamente o valor numérico de confiança, limitado entre 0 e 100. Não é uma conversão visual de quatro estados. A confiança também não é uma nota de aprendizagem nem comprovação de que uma proposta é legítima.

Regras atuais, antes dos limites por personalidade e situação:

| Sinal | Cálculo local |
| --- | --- |
| Cumprimento novo | Base de 2 pontos, ponderada pela abertura a conversa casual; resultado de 0 a 3 |
| Conversa social pertinente | Base de 3; existe um orçamento total de 6 pontos sociais por conversa |
| Marcador curto, ruído ou repetição | Sem ganho |
| Proposta clara e pertinente | Base de 7, limitada a 9 |
| Resposta à pergunta atual | Base de 11 quando clara; 6 quando parcial; limite de 15 |
| Pergunta, dúvida, recusa, proteção, correção explícita ou assunto solto | Sem ganho |
| Contradição | Redução com base de 13, ponderada pela personalidade |
| Pressão | Redução com base de 18, ponderada pela personalidade |
| Ofensa dirigida | Redução com base de 24, ponderada pela personalidade |
| Afirmação de ação não realizada | Redução com base de 10, sem inventar a ação |

O cálculo usa o estágio, a pertinência da resposta e a informação realmente acrescentada. Repetir uma explicação com pequenas mudanças de palavras ou reiterar o mesmo fato não produz ganho indefinido. A confiança não sobe durante uma operação já pronta ou uma conversa encerrada.

`trustDelta` recebido de um modelo não é uma fonte de autoridade. O contrato remoto rejeita propriedades numéricas de estado e o motor calcula o delta a partir dos sinais permitidos.

## Diferenças entre personagens

Os pesos ficam em `src/personality.js`, com base nas personalidades existentes:

- Nino e Bento dão mais espaço à conversa casual.
- Olga reage com mais reserva à pressa.
- Yara continua sociável e cuidadosa com o grupo.
- Davi e Pri ganham confiança mais devagar; Pri reage mais a inconsistências.
- Davi e Pri precisam de um esclarecimento novo após a primeira resposta. Repetir quem organiza não resolve uma pergunta nova sobre o motivo do dado solicitado.

Os limiares ficcionais atuais são 16 para Nino, 17 para Bento, 18 para Yara e Olga e 24 para Davi e Pri. Ainda é necessário explicar a proposta, responder à pergunta pertinente e pedir a ação correta. Ter confiança suficiente sozinho não libera um item.

Expressão, irritação e suspeita são estados distintos da confiança acumulada. Um personagem ainda pode ter confiança alta e ficar desconfiado após uma contradição, ou rir de uma conversa casual com confiança baixa.

## Exemplos verificados

| Fala e contexto | Comportamento desta revisão |
| --- | --- |
| “pdp mano mas me explica melhor isso ai pq ta estranho” | Reconhecimento social e incerteza coexistem com o pedido de esclarecimento. Nenhuma operação é liberada. |
| Pergunta anterior: “Quem organizou?”; resposta: “É gratuito.” | O custo foi mencionado; a pergunta sobre origem ainda está pendente. |
| “A equipe do concurso organizou a premiação.” | Pode responder à pergunta de origem, mas permanece uma afirmação do jogador, sem verificação independente. |
| “Eu verificaria no contato salvo.” | Hipótese; não é uma verificação concluída nem um encerramento automático. |
| “Meu amigo disse que conferiu no app oficial.” | Relato de terceiro; não comprova a origem nem autoriza a ação. |
| “Não vou verificar no aplicativo oficial.” | Verificação negada, sem converter a palavra “verificar” em proteção. |
| “Já te paguei.” sem pagamento registrado | Conflito com o estado; não cria pagamento nem créditos. |
| Uma explicação boa repetida várias vezes | A primeira pode ajudar; as repetições não acumulam confiança. |

## Salvamento e continuidade

O identificador de armazenamento e a versão do salvamento foram preservados. A migração adiciona `trustScale: 100` e converte valores antigos de 0–3, inclusive registros numéricos do replay, uma única vez. Um valor novo de 1 ou 2 pontos não é interpretado como 33% ou 67% depois da retomada.

Itens, saldo, rascunho, texto da conversa e histórico continuam preservados. A reparação de comprovantes de compartilhamento já existente permanece ativa em salvamentos antigos incompletos; isso não é uma nova ação do jogador.

## Verificação realizada

Comando direcionado executado nesta revisão:

```text
node --test tests/granular-conversation.test.mjs tests/learning.test.mjs tests/typed.test.mjs tests/mood.test.mjs tests/personality.test.mjs tests/teentech-protection.test.mjs tests/natural-language-stress.test.mjs tests/review-nine.test.mjs
```

Resultado real: **157 testes passaram; nenhum falhou**. Desses, 116 estão no novo arquivo de regressões. Os casos abrangem formalidade, abreviação, erros de escrita, perguntas, mensagens curtas e longas, resposta parcial, boato, correção, contradição, pressão, hostilidade, desculpa, recusa, dúvida, ironia simples, modalidades de verificação, ação inexistente, mudança de assunto e referência vaga.

Também foram executados percursos completos com os seis personagens, incluindo esclarecimento adicional para Davi e Pri, execução no aplicativo correto e impedimento de pagamento duplicado. As matrizes verificam limites numéricos, efeitos distintos por personalidade, repetição, separação entre humor e confiança e preservação de salvamentos. Saídas remotas simuladas com números proibidos e interpretações permissivas de ruído não controlaram estados.

Verificação final executada após a revisão adicional:

- `npm test`: **414 testes passaram, zero falhas**.
- `npm run build`: concluído, artefatos em `dist/`.
- `npm audit --audit-level=high`: **zero vulnerabilidades**.
- `git diff --check`: sem erros de whitespace.
- Seleção final de confiança, semântica remota e regressões: **134/134**. Inclui análise remota incorreta que tenta tratar “Oi”, “Olá”, “pdp” e “aham” como ofensa; os cumprimentos não causaram irritação ou encerramento.
- `node scripts/verify-semantic-api.mjs http://127.0.0.1:4196`: chamada real à prévia Wrangler com binding Workers AI. Interpretação e redação retornaram HTTP 200, identificadas como `@cf/qwen/qwen3-30b-a3b-fp8`. A mensagem problemática de Olga permaneceu pergunta, confiança 20, saldo 0, sem item e sem encerramento. Os metadados sem conversa estão em [CONVERSA-GRADUAL-API.json](CONVERSA-GRADUAL-API.json).

A checagem real usa ficção sintética e consome a cota já existente. Não contrata plano, não publica e não registra texto. Para repetir, forneça explicitamente a URL da prévia ou do site ao script. Há até duas chamadas de 512 tokens por mensagem, com timeout de 5 segundos para interpretação e 7 para redação no cliente; indisponibilidade mantém o diálogo local.

A tentativa de abrir a prévia no navegador foi bloqueada por permissão recusada. Não foi feito percurso visual nesta revisão. Os testes automatizados de navegação, rascunho, geometria de janelas e salvamento passaram; isso não substitui testar toque, rotação ou teclado virtual em um aparelho.

## Limitações

- A interpretação local continua conservadora e usa estruturas da língua e um vocabulário limitado. Ironia complexa, referências ambíguas e erros muito diferentes podem exigir esclarecimento.
- A interpretação remota também pode errar. Os limites locais e a validação reduzem consequências indevidas, mas não garantem compreensão perfeita de qualquer frase.
- Há limites de tempo distintos para interpretação e redação; falha ou indisponibilidade utiliza o caminho local. A latência real do provedor depende de sua disponibilidade.
- Esses testes verificam comportamento do software. Não medem eficácia educativa, compreensão de estudantes, duração real de uma aula nem desempenho em teclado físico de celular. Esses pontos exigem aplicação e observação próprias.
- Créditos e confiança continuam ficcionais. A investigação, a justificativa das decisões e a atividade antes/depois são os instrumentos separados para avaliar aprendizagem, sem inventar resultados com alunos.
