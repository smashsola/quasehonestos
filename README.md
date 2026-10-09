# Quase Honestos

Jogo educativo de comédia para o TeenTech 2026, categoria **Prevenção à Violência**. O Trambique OS preserva desktop, aplicativos, personagens e salvamentos. O diferencial é relacionar a conversa às consequências registradas e praticar proteção numa situação nova, incluindo exposição e constrangimento num grupo.

## Funcionamento atual

- Seis personagens e cinco propostas cenográficas; conversa digitada, expressões e humor brasileiro.
- Interpretação separada das regras da partida e da redação da resposta. Proteção, recusa, dúvida, assunto solto e conflito com o estado têm tratamento próprio.
- Receber link, abrir página, enviar cadastro e executar o app são eventos distintos. O modelo não cria itens, permissões ou pagamentos.
- Replay: fala relevante, reação, consequência registrada, risco e proteção. Registros antigos continuam acessíveis.
- Defesa curta com consulta de evidências: cobrança falsa, aviso legítimo e exposição de um colega. Essa atividade não paga créditos.
- Objetivo visível, esperas menores, redimensionamento por teclado e uma janela por vez no celular, com navegação pela barra/menu.

Créditos mostram desempenho na ficção, **não conhecimento de segurança**. Dados QH-DEMO, anexos, computadores e transações não têm valor fora do jogo. Não há captura de dados reais ou acesso remoto externo.

## Executar e testar

Node.js 20 ou mais recente:

```sh
npm ci
npm run dev
npm test
npm run build
```

O servidor usa a porta 4180; `PORT` define outra. O build gera `dist/`. O código atual está em `src/`, `functions/`, `worker/`, `scripts/` e `tests/`; o ZIP antigo do repositório não é a fonte atual. A cópia local pode conter mudanças ainda não publicadas.

## IA e privacidade

O diálogo público usa interpretação local, respostas autorais e regras de progresso. **Não é um LLM treinado pela equipe.** IA generativa foi usada como apoio ao desenvolvimento, pesquisa e revisão; a equipe deve documentar esse uso.

O adaptador experimental Gemini em `/api/dialogue` permanece desativado no cliente (`publicDialogueAI=false`) e Worker (`DIALOGUE_AI_ENABLED=false`). Os [termos do Gemini](https://ai.google.dev/gemini-api/terms) restringem apps destinados ou provavelmente acessados por menores de 18 anos. A idade da conta não resolve essa restrição sobre o público. Não ativar no TeenTech apenas configurando uma chave.

O adaptador protege segredo no servidor, limita contexto, valida respostas e usa timeout/fallback. Sua lógica foi testada com respostas simuladas; isso não comprova a qualidade do modelo em produção. Nenhuma dependência paga foi adicionada. Uma alternativa futura exige melhora demonstrada, revisão do público permitido, tratamento de dados, retenção, custos e limites. Segredos nunca devem ir para `vars`, HTML ou Git.

O jogo mantém aviso de privacidade e bloqueio de formatos comuns de dados reais. O bloqueio não detecta toda informação pessoal. Instrua estudantes a escrever somente sobre a ficção, sem relatos identificáveis.

## Material da apresentação

- [Avaliação antes/depois](docs/AVALIACAO-APRENDIZAGEM.md): situações distintas, gabarito e registro agregado sem identificação. **Ainda não aplicada.**
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
