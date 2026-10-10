# Quase Honestos

Jogo educativo de comédia para o TeenTech 2026, categoria **Prevenção à Violência**. O Trambique OS preserva desktop, aplicativos, personagens e salvamentos. O diferencial é relacionar a conversa às consequências registradas e praticar proteção numa situação nova, incluindo exposição e constrangimento num grupo.

## Funcionamento atual

- Seis personagens e cinco propostas cenográficas; conversa digitada, expressões e humor brasileiro.
- Interpretação separada das regras da partida e da redação da resposta. Proteção, recusa, dúvida, assunto solto e conflito com o estado têm tratamento próprio.
- Receber link, abrir página, enviar cadastro e executar o app são eventos distintos. O modelo não cria itens, permissões ou pagamentos.
- Replay: fala relevante, reação, consequência registrada, risco e proteção. Registros antigos continuam acessíveis.
- Investigação pelos registros de Loja, Fichas, Correio e Resultados: situações fraudulentas, legítimas e inconclusivas. Decidir cedo é permitido; fonte pertinente distingue decisão sustentada de palpite. Não paga créditos.
- Memória de condições declaradas, perguntas, correções, promessas, recusas e contradições; repetir explicações equivalentes não aumenta confiança. Confiança usa pontos de 0–100 e pesos próprios para os personagens, separados da expressão atual.
- Consequências reaparecem no Correio e replay compara o ocorrido com uma hipótese calculada pelas regras, sem apagar exposição.
- Atividade curta no Manual: avaliação antes/depois, um atendimento e defesa; relatório local codificado, sem nomes ou conversas por padrão.
- Objetivo visível, esperas menores, redimensionamento por teclado e uma janela por vez no celular, com alternador ao alcance do toque, rascunho e leitura preservados. Teclado móvel usa botão Enviar; Enter insere linha.

Créditos mostram desempenho na ficção, **não conhecimento de segurança**. Dados QH-DEMO, anexos, computadores e transações não têm valor fora do jogo. Não há captura de dados reais ou acesso remoto externo.

## Executar e testar

Node.js 22 ou mais recente:

```sh
npm ci
npm run dev
npm test
npm run build
```

O servidor usa a porta 4180; `PORT` define outra. O build gera `dist/`. O código atual está em `src/`, `functions/`, `worker/`, `scripts/` e `tests/`; o ZIP antigo do repositório não é a fonte atual. A cópia local pode conter mudanças ainda não publicadas.

## IA e privacidade

O Cloudflare Workers AI (Qwen3 30B A3B) pode interpretar a fala com um contrato semântico e redigir a reação após a decisão. O motor local mantém autoridade sobre confiança, permissões, itens, créditos e encerramento. Proteção, repetição, fatos registrados e sinais locais inequívocos têm precedência sobre análises remotas incompatíveis. Existe interpretação e resposta autoral de reserva para falhas ou saídas rejeitadas. **Não é um LLM treinado pela equipe.** IA generativa foi usada como apoio ao desenvolvimento, pesquisa e revisão; a equipe deve documentar esse uso.

O Worker usa DIALOGUE_PROVIDER=workers-ai, DIALOGUE_AI_ENABLED=true e o binding Workers_AI. O Gemini permanece fora do fluxo público. Os [termos do Gemini](https://ai.google.dev/gemini-api/terms) restringem apps destinados ou provavelmente acessados por menores de 18 anos. A idade da conta não resolve essa restrição sobre o público. Não ativar no TeenTech apenas configurando uma chave.

O adaptador usa o binding no servidor, limita contexto, valida respostas e usa timeout/fallback. Há testes com respostas simuladas e uma verificação real de interpretação e redação, detalhada em [Conversa gradual](docs/CONVERSA-GRADUAL.md). Isso não comprova a qualidade de toda conversa em produção. Nenhuma dependência paga foi adicionada. Uma alternativa futura exige melhora demonstrada, revisão do público permitido, tratamento de dados, retenção, custos e limites. Segredos nunca devem ir para `vars`, HTML ou Git.

O jogo mantém aviso de privacidade e bloqueio de formatos comuns de dados reais. O bloqueio não detecta toda informação pessoal. Instrua estudantes a escrever somente sobre a ficção, sem relatos identificáveis.

## Material da apresentação

- [Avaliação antes/depois](docs/AVALIACAO-APRENDIZAGEM.md): situações distintas, gabarito e registro agregado sem identificação. **Ainda não aplicada.**
- [Sessão curta em sala](docs/SESSOES-EM-SALA.md): começo, fim e estimativa provisória baseada no percurso técnico.
- [Validação de celular](docs/VALIDACAO-MOBILE.md): telas verificadas, percurso e limites do teste sem aparelho real.
- [Pitch de 3 minutos](docs/PITCH-3-MINUTOS.md): roteiro do diferencial educativo.
- [Privacidade e edital](docs/PRIVACIDADE-E-EDITAL.md): funcionamento e pendências formais.
- [Próxima atualização](docs/PROXIMA-ATUALIZACAO.md): lote local e histórico das mudanças.

Testes do programa não comprovam eficácia educacional. O instrumento piloto é autoral, ainda sem validação com estudantes.

## Publicar

`wrangler.jsonc` serve `dist/` por `worker/index.js`; `npm run deploy:worker` executa o build e implanta. A configuração Pages está separada em `wrangler.pages.jsonc`; `npm run deploy:pages` usa o projeto Pages existente. Instalação reproduzível: `npm ci`.

Publicação é uma ação separada. O pedido de melhoria não implica push ou deploy.

## Referências

Inspirado na organização de conversas e apps fictícios de Scam With Your Friends, com conteúdo, personagens e assets próprios, sem vínculo com os criadores.

- [CERT.br — fascículos](https://cartilha.cert.br/fasciculos/)
- [Regulamento TeenTech](https://teentech.teckids.org.br/regulamento)
- [Gemini — termos](https://ai.google.dev/gemini-api/terms)

## Revisão de diálogo e investigação
Veja [a revisão técnica anterior](docs/REVISAO-DIALOGO.md) e [a conversa gradual de 10/10/2026](docs/CONVERSA-GRADUAL.md). O motor local reconhece correções e mantém memória das declarações; declarações não equivalem a verificação. A defesa relaciona a decisão a um registro consultado, sem exigir todas as fontes. Replay e conversa têm visualizações separadas. O adaptador opcional fornece sinais semânticos limitados e redige a reação após as regras; não calcula créditos. Rode node scripts/evaluate-dialogue.mjs para a bateria local. O modo --live exige configuração e pode consumir cota; não é executado por padrão.

### Workers AI em produção
Modelo configurado: `@cf/qwen/qwen3-30b-a3b-fp8`, da Qwen, centralizado em `src/dialogue-config.js`. Até duas chamadas por mensagem: interpretação antes das regras e redação após a decisão. Cada chamada tem limite de 512 tokens de saída; o cliente espera até 5 segundos pela interpretação e 7 pela redação. Falhas mantêm o caminho local. Não há gravação de conversas no servidor deste projeto. O aviso de privacidade informa o envio de até 12 falas e estado da simulação; filtros de dados pessoais não identificam todos os casos.

Verificação desta revisão: **414 testes aprovados**, build concluído e auditoria sem vulnerabilidades. A prévia do binding remoto retornou HTTP 200 para interpretação e redação no caso de Olga: a pergunta não encerrou a conversa, não liberou item e não mudou créditos ou confiança. Os diagnósticos agregados ficam em `docs/CONVERSA-GRADUAL-API.json`, sem falas. Não houve teste com alunos ou comparação de eficácia.

Não foi contratado plano nem ativada cobrança. A Cloudflare oferece franquia diária de 10.000 Neurons; no Workers Paid excedentes são cobrados, portanto acompanhe o painel da conta. Quota ou indisponibilidade acionam a reserva local. Referências: https://developers.cloudflare.com/workers-ai/platform/pricing/ e https://developers.cloudflare.com/workers-ai/platform/data-usage/ . O servidor estático local de desenvolvimento não executa o binding: teste IA no site publicado ou via Wrangler.

## Histórico — Olga, Qwen e investigação
Os documentos da revisão de Olga registram verificações anteriores. A configuração atual usa Qwen e o contrato de conversa gradual descrito acima. Gemini e Claude continuam como adaptadores experimentais selecionáveis explicitamente com autorização de configuração adicional; não são fallbacks automáticos. O fallback atual é o diálogo autoral local.

Veja docs/REVISAO-OLGA-QWEN.md e docs/QWEN-VALIDACAO.json. Diagnósticos em desenvolvimento registram somente origem API/fallback, status, identificador do modelo e tamanho/formato da resposta, sem textos ou chaves. A prévia Wrangler usa o binding remoto e não modifica a implantação pública.
