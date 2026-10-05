# Quase Honestos

Uma firma quase confiável. Um estagiário sem referências. Seis personagens que têm bons motivos para desconfiar.

Jogo educativo de comédia sobre manipulação e proteção digital, desenvolvido para o desafio TeenTech 2026. Explore o Trambique OS, converse com personagens e acompanhe as consequências de suas decisões em um universo fictício.

**[Jogar agora](https://quasehonestos.pages.dev/)**

O código atualizado está nas pastas `src/`, `functions/`, `scripts/` e `tests/`. Inclui piadas variadas por personagem e explicações abríveis de proteção para cada proposta. A suíte atual tem 43 testes. O ZIP mantido neste repositório é um pacote de uma versão anterior; use os arquivos da branch `main` para continuar o desenvolvimento. A publicação no GitHub não atualiza automaticamente o upload direto do Cloudflare.

## O que já funciona

- Desktop com aplicativos, janelas móveis, fichas, correio e loja de decoração.
- Seis personagens: Nino, Olga, Davi, Yara, Pri e Bento.
- Quatro propostas fictícias: prêmio, suporte remoto, clube e pacote de skins.
- Conversas digitadas, reações próprias, expressões e memória de promessas sobre gratuidade.
- Recusa e desconfiança permitem continuar conversando; pressão e agressão repetidas podem encerrar o contato.
- Mensagens inesperadas com escolhas de defesa e explicações sobre riscos.
- Progresso salvo no navegador e relatório de partida.
- Respostas locais de reserva: o jogo funciona sem IA.

## IA de personagens

A integração opcional usa Gemini por uma **Cloudflare Pages Function** em `/api/dialogue`. A IA reescreve as falas com personalidade e contexto. O motor local continua responsável por emoções, etapas, itens, dinheiro e encerramento. Sem chave, sem conexão ou em caso de erro, permanece a resposta local.

**Estado:** integração publicada no Cloudflare; respostas reais dependem de configurar a chave e validar a API. A chave nunca fica no navegador ou no repositório.

Ao usar IA, as últimas mensagens e o contexto fictício são enviados ao Google. Não escreva dados pessoais reais. A função não mantém um banco de conversas; o progresso fica no navegador.

## Configurar a chave no Cloudflare

1. Abra **Workers & Pages**, selecione `quasehonestos` e entre nas configurações de variáveis e segredos.
2. Crie um **segredo** chamado `GEMINI_API_KEY` e cole a chave Gemini somente nesse campo.
3. Opcionalmente, defina `GEMINI_MODEL`. O padrão é `gemini-3.5-flash-lite`; escolha um modelo disponível na sua conta.
4. Publique novamente e teste uma conversa. Sem segredo, o jogo usa as falas locais.

Configure quotas no projeto Google e proteção de tráfego no Cloudflare antes de divulgação ampla. A validação de origem não substitui autenticação ou limite global de gastos.

## Executar e verificar

Requer Node.js 20 ou mais recente.

```sh
npm run dev
npm test
npm run build
```

O build gera `dist/`. Para testar a função localmente, use `npx wrangler pages dev dist` após o build e configure a chave em `.dev.vars`, ignorado pelo Git. O servidor local simples usa as falas offline.

## Publicar como Worker pelo GitHub

O `wrangler.jsonc` padrão aponta para `worker/index.js` e serve os arquivos de `dist/`. A rota `/api/dialogue` reutiliza a integração Gemini no servidor. O build é executado automaticamente pelo Wrangler antes do deploy.

No Cloudflare Workers Builds, use a raiz do repositório, comando de build `npm run build` e comando de deploy `npm run deploy:worker` (ou `npx wrangler deploy`). As dependências estão declaradas em `package.json` e fixadas em `package-lock.json`; a instalação pode usar `npm ci`.

O segredo `GEMINI_API_KEY` precisa ser configurado no Worker também; segredos do projeto Pages não são transferidos automaticamente. Sem ele, as falas locais continuam funcionando.

## Publicação Pages existente

Para atualizar o Pages manualmente, execute `npm run deploy:pages`. Para desenvolvimento Pages, use `npx wrangler pages dev dist --config wrangler.pages.jsonc`. A configuração Pages está separada em `wrangler.pages.jsonc` para preservar a publicação existente.

O jogo está publicado no Cloudflare Pages por upload direto. Para usar integração Git em outro projeto Pages: framework nenhum, comando `npm run build`, saída `dist` e raiz do repositório. A pasta `functions/` deve permanecer na raiz.

## Referências e autoria

Inspirado na ideia de conversas e aplicativos fictícios de **Scam With Your Friends**, com personagens, humor e conteúdo educativo próprios, sem vínculo com os criadores da referência.

Tema TeenTech: **Conexão Segura: Transformando inovação em proteção**. IA generativa foi utilizada como apoio à análise, programação e revisão; a equipe deve revisar os resultados e registrar esse uso na documentação da competição.

Todas as ligações, anexos, contas e operações são cenográficas. O jogo não realiza acesso remoto ou transações reais. Seu placar descreve decisões na simulação, não certifica segurança na vida real.

- [Regulamento TeenTech](https://teentech.teckids.org.br/regulamento)
- [Gemini API](https://ai.google.dev/api/generate-content)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
