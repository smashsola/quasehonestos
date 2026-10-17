# Quase Honestos

Quase Honestos é uma comédia interativa no Trambique OS sobre golpes, pressão e exposição no ambiente digital. O projeto se relaciona à categoria oficial **Prevenção à Violência** ao dar prática de pausa, checagem independente, proteção de dados e busca de apoio — sem alegar que o jogo já provou eficácia com estudantes.

## Versão atual

- Dez personagens e dez situações fictícias de defesa, com quatro ações concretas por situação. Há alternativas para confirmar por canais conhecidos, interromper o contato ou chamar suporte; cada situação também tem uma resposta engraçada e uma ação de risco classificada.
- O motor local controla confiança, encerramento, permissões, itens, créditos e progresso. Falas geradas não tomam decisões porque o fluxo principal não usa um modelo de IA.
- Pausar para buscar confirmação fica registrado como intenção protetiva; o jogo não afirma que uma fonte foi consultada quando isso não aconteceu.
- Resultados e replay distinguem o que ocorreu, o risco observado e uma hipótese de proteção. Compartilhamentos anteriores continuam visíveis.
- A rodada de defesa integra fichas, correio, pedidos e outros registros do próprio jogo. Casos podem ser legítimos, fraudulentos ou inconclusivos.
- As situações de defesa cobrem pedido urgente por WhatsApp, falsa central, comprovante de Pix, boleto/QR adulterado, taxa falsa de entrega, ransomware, falso motoboy, loja/leilão falso, mensagem falsa sobre CPF/benefício e troca de cartão na maquininha. A seleção cobre as modalidades mais citadas no RADAR FEBRABAN de junho de 2025, além de outros exemplos educativos.
- O Manual oferece uma atividade opcional com situações A/B, cada uma pedindo ação e evidência. A exportação é local, codificada e não inclui conversas por padrão. **Ainda não foi aplicada nem validada com estudantes.**
- O progresso fica neste navegador. No celular, a navegação mostra um app por vez; no desktop, o Trambique OS mantém suas janelas.

Todos os nomes, códigos, itens e créditos da simulação são inventados. Não use informações pessoais reais. A hospedagem pública ainda depende da disponibilidade do serviço Cloudflare; a partida não chama um provedor de IA.

## Executar e verificar

Requer Node.js 22 ou mais recente:

```sh
npm ci
npm run dev
npm test
npm run build
```

O servidor local abre em `http://127.0.0.1:4180` (`PORT` permite escolher outra porta). O build gera `dist/`. Código principal: `src/`, Worker estático: `worker/`, testes: `tests/`.

O endpoint legado `/api/dialogue` responde HTTP 410. Há arquivos de protótipos anteriores no histórico do repositório, mas eles não estão no fluxo do jogo. Não configure chaves ou bindings de IA para jogar.

## Privacidade e limites

A partida, o histórico e as preferências ficam no armazenamento do navegador. A atividade em sala exporta apenas códigos de decisões/evidências e tempo da sessão; não envia resultados ao servidor. A hospedagem Cloudflare pode processar metadados técnicos de conexão conforme sua política. O filtro local reduz formatos comuns de dados pessoais, mas não detecta todas as informações identificáveis.

O aviso não constitui certificação jurídica nem afirma conformidade integral com a LGPD. Antes de uso em sala, a equipe e a escola devem revisar a atividade, combinar o tratamento dos arquivos locais e testar com estudantes voluntários sem recolher nomes ou relatos pessoais.

## Avaliação do projeto

O [diagnóstico TeenTech](docs/AVALIACAO-TEENTECH.md) compara evidências implementadas com as categorias e a rubrica do regulamento oficial. O [protocolo da atividade piloto](docs/AVALIACAO-APRENDIZAGEM.md) explica as versões antes/depois e as limitações. O [roteiro de demonstração](docs/PITCH-3-MINUTOS.md) usa funcionalidades existentes. Resultados de testes de software não são evidência de impacto educacional.

## Publicar

O Worker de produção é publicado com `npm run deploy:worker`, usando o projeto Cloudflare configurado em `wrangler.jsonc`. A publicação de Pages é separada e usa `npm run deploy:pages`.

## Referências

- [Regulamento oficial TeenTech 2026](https://teentech.teckids.org.br/regulamento) — PDF com critérios de avaliação, seções 6.1, 8 e 12.
- [CERT.br — dicas rápidas](https://cartilha.cert.br/dicas-rapidas/).
- [FEBRABAN — golpes e tentativas mais citados no RADAR de junho de 2025](https://portal.febraban.org.br/noticia/4324/pt-br/www.febraban.org.br/paginas/).
- [Privacidade da Cloudflare](https://www.cloudflare.com/privacypolicy/).

Conteúdo, personagens e assets são próprios. A referência de gênero e interface não implica vínculo com outros jogos.
