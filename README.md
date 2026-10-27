# Quase Honestos

[Jogar a versão pública](https://quasehonestos.betaniaaa.workers.dev/) · Campanha de 30 casos · Trambique OS

Quase Honestos é uma comédia interativa no Trambique OS sobre golpes, pressão e exposição no ambiente digital. O projeto se relaciona à categoria oficial **Prevenção à Violência** ao dar prática de pausa, checagem independente, proteção de dados e busca de apoio — sem alegar que o jogo já provou eficácia com estudantes.

## Versão atual

- Campanha com **30 situações em seis dias**, cinco por dia: mensagens e identidade; Pix e cobranças; compras e entregas; contas e dispositivos; trabalho e oportunidades; pressão e falsa autoridade. Campanhas antigas preservam sua ordem salva.
- Perfil local com nome ou apelido e escolha entre dez personagens. A faixa etária é pedida uma vez: **6–10 anos** recebe textos curtos, glossário e duas respostas corretas, uma parcial e uma errada; **11 anos ou mais** recebe uma correta, uma parcial e duas erradas. As duas versões têm humor e a identificação **Resposta engraçadinha**. A ordem das alternativas varia.
- As ações mostram o que a escolha provoca em uma demonstração animada. O tutorial de Lia acompanha o primeiro caso e indica onde clicar; sua conclusão concede C$ 100 uma única vez. A consequência, o aprendizado e a movimentação de créditos aparecem no resultado.
- **Vingança** opcional após resolver o caso: três perguntas educativas e uma cena fictícia de virada. Apenas pausar a conversa não libera a revanche. Ela pode render créditos fictícios uma única vez e não apaga o prejuízo anterior. Cada dia tem uma trilha própria de vingança.
- **Correio** com 18 tipos de recado, chegadas em intervalos aleatórios, tutorial próprio e bônus de C$ 15–25 por conferência correta. As respostas entram no resumo do dia; abrir a mensagem sozinho não dá recompensa.
- **Loja da firma** com 26 compras entre objetos de mesa e papéis de parede. A coleção registra o que foi comprado, equipado ou guardado. O saldo pode ficar negativo ao cair em golpes; compras exigem saldo suficiente.
- O motor local controla confiança, encerramento, permissões, itens, créditos e progresso. Falas geradas não tomam decisões porque o fluxo principal não usa um modelo de IA.
- Pausar para buscar confirmação fica registrado como intenção protetiva; o jogo não afirma que uma fonte foi consultada quando isso não aconteceu.
- Resultados e replay distinguem o que ocorreu, o risco observado e uma hipótese de proteção. Compartilhamentos anteriores continuam visíveis.
- A rodada de defesa integra fichas, correio, pedidos e outros registros do próprio jogo. Casos podem ser legítimos, fraudulentos ou inconclusivos.
- Os casos incluem falsa central, WhatsApp clonado, voz falsa, Pix, boletos, ransomware, permissões abusivas, skins falsas, anúncios de emprego, investimentos, aluguel, ingressos, doações e outras armadilhas. O catálogo e as categorias estão em `src/defense-round.js`, `src/expanded-scams.js` e `src/case-categories.js`.
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

A partida, o nome ou apelido, o personagem, a faixa etária, o saldo, as compras e as preferências ficam no armazenamento do navegador. Não pedimos idade exata: a faixa adapta textos, humor e alternativas. Não há conta remota nem sincronização entre dispositivos. A atividade em sala exporta apenas códigos de decisões/evidências e tempo da sessão; não envia resultados ao servidor. A hospedagem Cloudflare pode processar metadados técnicos de conexão conforme sua política. O filtro local reduz formatos comuns de dados pessoais, mas não detecta todas as informações identificáveis.

## Verificação e pendências

Os testes automatizados cobrem regras, alternativas por idade, salvamento, créditos, campanhas, Correio, compras e regressões. A [auditoria de 27/10/2026](docs/AUDITORIA-2026-10-27.md) documenta a campanha completa por testes de integração, a matriz de telas no navegador, os cliques exercitados e os problemas corrigidos. Testes de software não garantem ausência de bugs nem comprovam impacto educativo.

A matriz de revisão usa 360×800 e 390×844 (celulares), 768×1024 (tablet), 1366×768 e 1920×1080 (computadores). São tamanhos representativos para cobrir diferentes layouts, não uma promessa de que todo aparelho terá o mesmo comportamento. O roteiro inclui primeiro cadastro, retorno, termos, tutorial, seis dias de campanha, respostas das duas faixas etárias, vinganças, Correio, loja, resultados e recarregamento.

Para repetir estados visuais isolados: `npm run build` e `node scripts/qa-server.mjs`. O servidor de QA escuta somente em `127.0.0.1:4183` (ou `QA_PORT`). As rotas `/__qa` criam perfis e partidas fictícios e substituem o salvamento daquela origem local; use uma origem/perfil descartável. Exemplos e limites estão no relatório. Esse servidor não integra a publicação Cloudflare.

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
