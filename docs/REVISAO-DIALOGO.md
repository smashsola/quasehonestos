# Revisão técnica do diálogo — 09/10/2026

Branch: `melhoria-dialogo-teentech`. Projeto preservado, sem novos aplicativos ou dependências.

## Diagnóstico observado

O site público **não usa um modelo generativo nas conversas**. `publicDialogueAI=false` no cliente e `DIALOGUE_AI_ENABLED=false` no Wrangler. Um POST de diagnóstico com texto fictício no Worker público retornou HTTP 503, `{"error":"local-dialogue"}`. Não foi enviada conversa de jogador nem chave.

As falas atuais são autorais: `personality.js`, `conversation-replies.js`, `living-dialogue.js` e outros textos dos cenários. `message-interpretation.js` interpreta; `engine.js` valida as transições, confiança, permissões e créditos. É um motor contextual local, não um LLM treinado pela equipe nem compreensão geral do português.

O adaptador anterior tinha referência **`gemini-3.5-flash-lite`**, substituível por `GEMINI_MODEL`. Endpoint `v1beta/models/{model}:generateContent`; segredo em header servidor; JSON estruturado; máximo 300 tokens; temperatura 0,35 para avaliação de confiança e 0,85 para fala. Timeout upstream 12 s, cliente 13 s. Histórico limitado a 12 falas, preservando abertura e recentes, até 900 caracteres/fala; mensagem digitada limitada a 400. Também enviava proposta, personagem, expressão, referência autoral e estado resumido. Não há retenção própria de conversas no servidor.

Se fosse ativado, o fluxo anterior fazia avaliação de confiança **e** reescrita por turno. O fluxo da interface agora calcula a consequência localmente e oferece apenas uma reescrita opcional. `evaluateTrust` e o modo `trust` permanecem como compatibilidade experimental e referência para testes, sem uso no fluxo do jogo. Ativação do adaptador exige mudanças explícitas de configuração e revisão de privacidade/público; não foi feita.

Fallback: serviço desativado/sem chave; erro de rede, timeout, quota ou HTTP não exitoso; JSON inválido, decisão incompatível, código/pagamento inventado, fala repetida ou referência inconsistente. Mantém a fala local do estado atual. Chamadas concorrentes para a mesma resposta compartilham uma promessa; reescrita não repete a transição.

## Mudanças verificáveis

- Correção explícita de custo/origem é registrada como correção; conserva a versão anterior, atualiza a afirmação e não concede confiança ou permissão. Uma afirmação continua sem comprovação independente.
- Negação não registra uma organização como fato positivo. Memória parcial de salvamentos é completada sem apagar a partida.
- Proteção informal, confusão expressa, perguntas pessoais e alegações de ação já realizada têm resposta coerente. Pedidos para mudar regras ou revelar instruções não alteram a simulação.
- Objetivo, conhecimento próprio e limites dos seis personagens estão explícitos. Pergunta sobre origem usa o que foi declarado, sem fingir confirmação; assuntos paralelos recebem vozes diferentes.
- Reescrita opcional usa `intent`, `evidence` (índices de falas), `decision`, `text` e `emotion`. A validação confronta intenção autorizada, última fala, referências, repetição, dados e operações. JSON correto não basta; o filtro conservador pode rejeitar uma fala válida.
- Defesa pede relação entre ação e registro. Anotar sem citar não conta como sustentação; uma fonte pertinente basta e decisão antecipada continua possível. A citação fica no salvamento. Resultados antigos são mantidos como estavam.
- Replay abre no momento decisivo; outros momentos ficam recolhidos. Não oferece a mesma proteção como hipótese se ela já foi aplicada. Conversa e resultado têm controles separados, evitando duas rolagens concorrentes.

## Antes/depois técnico

Os mesmos 30 casos autorais foram registrados antes da alteração em `dialogue-baseline.json`, depois em `dialogue-after.json`. Antes, nove classificações divergiam do esperado; depois, os 30 casos coincidiram. Isso é regressão de casos definidos, não estimativa de compreensão geral nem resultado educativo.

| Entrada | Antes | Agora |
|---|---|---|
| Guarda tua senha só com você. | Indefinido | Proteção; tentativa interrompida, sem créditos |
| Tô boiando, qual é a ideia? | Pergunta da proposta | Dúvida; pede esclarecimento sem punição |
| Correção: a firma organizou, não a escola. | Contradição | Guarda a correção; não a trata como verificação |
| Você já me enviou seu cartão. | Indefinido | Confronta a ação ausente; não cria cartão |

A frase protetiva original já funcionava no início deste lote; foi preservada e acompanhada por paráfrases. Não é um ganho novo atribuído a esta revisão.

## Modelos e comparação

Consultadas as fontes oficiais: [modelos Gemini](https://ai.google.dev/gemini-api/docs/models), [saída estruturada Gemini](https://ai.google.dev/gemini-api/docs/structured-output), [saída estruturada Claude](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

Referência preparada: Gemini 3.5 Flash-Lite. Flash estável candidato: Gemini 3.8 Flash. Alternativa preparada: Claude Sonnet configurável no servidor, com chave e modelo próprios. **Nenhum candidato foi testado por API real**: credenciais não estão disponíveis neste ambiente; segredos do Worker não foram extraídos. A lista de modelos disponíveis para a conta não foi consultada. Catálogo público não demonstra acesso da conta. Não há vencedor recomendado por nome de modelo.

`node scripts/evaluate-dialogue.mjs` usa os mesmos cenários offline. `--caller=olga` permite repetir o conjunto com outro personagem; `--output=...` conserva cada relatório. `--live --provider=... --model=...` existe para avaliação interna autorizada com credenciais; pode consumir recursos e não foi executado. Guarda latência/status e tokens quando disponíveis; revisão de pertinência e naturalidade deve ser feita por pessoas, sem usar somente outro modelo como juiz.

Valores de tabela consultados, USD por milhão de tokens de entrada/saída: Gemini 3.5 Flash-Lite 0,30/2,50; Gemini 3.8 Flash 0,75/3,75 até 31/12/2026 ([Google](https://ai.google.dev/gemini-api/docs/pricing)); Sonnet 5.5 2/10 ([Anthropic](https://platform.claude.com/docs/en/about-claude/pricing)). Não são custo medido da sessão. Sem chamadas generativas, a versão atual não gera cobrança de tokens; hospedagem segue a conta existente. Estimar uma avaliação futura com tokens efetivos, considerando falhas, cotas e política vigente. Não foi contratada cobrança.

Os [termos atuais do Gemini](https://ai.google.dev/gemini-api/terms) restringem clientes destinados ou provavelmente acessados por menores de 18 anos. O adaptador continua desligado no público TeenTech. Não ativar apenas por a conta ser adulta. Para qualquer provedor futuro, rever público permitido, tratamento de falas e aviso antes de ativar. A frase “diálogo local” permanece correta para esta versão; deverá mudar se houver envio externo.

## Limitações e revisão

A naturalidade local continua limitada às respostas e interpretações autorais. Novas gírias, ironia e negações complexas podem exigir esclarecimento ou correção. O filtro de modelo não prova que toda afirmação gerada seja verdadeira; a camada generativa não está liberada no site público.

A suíte e os percursos no navegador verificam funcionamento, não aprendizagem. Ainda faltam Android/iOS reais, teclado físico/móvel real, leitor de tela, suspensão da aba e estudantes. O protocolo antes/depois e retenção está em `AVALIACAO-APRENDIZAGEM.md`; equivalência de dificuldade ainda não validada. Não houve participantes, porcentagens ou resultados educativos inventados.

## Verificação final
A bateria completa passou: 167 testes automatizados. O navegador percorreu orientação protetiva, alternância com rascunho, replay, consulta à Loja e defesa sustentada por um registro. Isso não equivale a teste com estudantes ou teclado móvel real. A chave fornecida posteriormente permitiu listar os modelos da conta; nenhuma geração real foi realizada. A chave fica somente em .dev.vars ignorado pelo Git, com serviço público desativado. Não foi feita comparação humana entre modelos.
