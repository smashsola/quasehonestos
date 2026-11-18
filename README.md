# Quase Honestos

[Jogar a versão pública](https://quasehonestos.betaniaaa.workers.dev/) · Campanha de 30 casos · Trambique OS

> **Direitos autorais:** © 2026 Paulo Henrique Ribeiro da Silva. Todos os direitos reservados. A publicação deste repositório e do site não concede licença para copiar, adaptar, redistribuir, republicar ou usar o projeto para treinamento de sistemas de IA sem autorização prévia por escrito. Consulte [NOTICE.md](NOTICE.md). Componentes de terceiros permanecem sujeitos às respectivas licenças.

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
- O Manual oferece uma atividade opcional com situações A/B, cada uma pedindo ação e evidência. O registro é um arquivo JSON local com códigos de decisão/evidência; não inclui conversas. **Ainda não foi aplicada nem validada com estudantes.**
- O quiz do Manual usa cartões com seleção por teclado e barra de progresso. Na primeira entrada do computador, aparece um convite opcional para fazer a atividade; a escolha é lembrada neste navegador.
- Acessibilidade inclui leitura em voz alta, tamanho e espaçamento do texto, contraste, foco reforçado, menos movimento e opções de cores para daltonismo. As preferências continuam salvas neste navegador.
- Os apps **Acessibilidade** e **Salvamento** podem ser arrastados entre a área de trabalho e a barra. O relógio mostra a data e o menu do Trambique OS usa a foto e o nome do perfil.
- Salvamentos para outro aparelho são arquivos locais: levam progresso e preferências, mas omitem nome, conversas e anotações; uma situação em andamento recomeça ao carregar. A importação substitui o progresso deste navegador após confirmação.
- A campanha tem conquistas e segredos diários; o saldo muito negativo pode exibir aviso ou oferecer o recomeço do dia.
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

A partida, o nome ou apelido, o personagem, a faixa etária, o saldo, as compras e as preferências ficam no armazenamento do navegador. Não pedimos idade exata: a faixa adapta textos, humor e alternativas. Não há conta remota nem sincronização automática; a cópia para outro aparelho é um arquivo local que omite nome, conversas e anotações. A atividade em sala exporta apenas códigos de decisões/evidências e tempo da sessão; não envia resultados ao servidor. A hospedagem Cloudflare pode processar metadados técnicos de conexão conforme sua política. O filtro local reduz formatos comuns de dados pessoais, mas não detecta todas as informações identificáveis.

## Verificação e pendências

Os testes automatizados cobrem regras, alternativas por idade, salvamento, créditos, campanhas, Correio, compras e regressões. A [auditoria de 27/10/2026](docs/AUDITORIA-2026-10-27.md) documenta a campanha completa por testes de integração, a matriz de telas no navegador, os cliques exercitados e os problemas corrigidos. Testes de software não garantem ausência de bugs nem comprovam impacto educativo.

A matriz de revisão usa 360×800 e 390×844 (celulares), 768×1024 (tablet), 1366×768 e 1920×1080 (computadores). São tamanhos representativos para cobrir diferentes layouts, não uma promessa de que todo aparelho terá o mesmo comportamento. O roteiro inclui primeiro cadastro, retorno, termos, tutorial, seis dias de campanha, respostas das duas faixas etárias, vinganças, Correio, loja, resultados e recarregamento.

Para repetir estados visuais isolados: `npm run build` e `node scripts/qa-server.mjs`. O servidor de QA escuta somente em `127.0.0.1:4183` (ou `QA_PORT`). As rotas `/__qa` criam perfis e partidas fictícios e substituem o salvamento daquela origem local; use uma origem/perfil descartável. Exemplos e limites estão no relatório. Esse servidor não integra a publicação Cloudflare.

O aviso não constitui certificação jurídica nem afirma conformidade integral com a LGPD. Antes de uso em sala, a equipe e a escola devem revisar a atividade, combinar o tratamento dos arquivos locais e testar com estudantes voluntários sem recolher nomes ou relatos pessoais.

## Avaliação do projeto

O [diagnóstico TeenTech](docs/AVALIACAO-TEENTECH.md) compara evidências implementadas com as categorias e a rubrica do regulamento oficial. O [protocolo da atividade piloto](docs/AVALIACAO-APRENDIZAGEM.md) explica as versões antes/depois e as limitações. O [roteiro de demonstração](docs/PITCH-3-MINUTOS.md) usa funcionalidades existentes. Resultados de testes de software não são evidência de impacto educacional.

## Apresentação TeenTech

### Resumo do projeto

**Quase Honestos** é um jogo educativo de prevenção à violência e aos golpes digitais apresentado como um computador de escritório fictício. A pessoa joga como estagiária de uma firma suspeita, recebe conversas e recados que simulam pressão, fraude e abuso de confiança e precisa decidir como agir. Cada escolha abre uma demonstração visual da consequência, seguida de uma explicação sobre o risco e sobre o que ainda precisa ser confirmado.

O projeto transforma orientações que costumam aparecer em listas de dicas em uma experiência de decisão: ler o pedido, procurar pistas, interromper a urgência e conferir a informação por um canal conhecido. Seu foco é a prática guiada de estratégias seguras; o jogo não afirma que uma pessoa está imune a golpes depois de jogar.

### Problema e público

Mensagens fraudulentas podem imitar bancos, lojas, familiares, órgãos públicos, oportunidades de trabalho e serviços conhecidos. Elas pressionam por Pix, códigos, senhas, documentos, instalação de programas ou permissões. Uma orientação genérica pode ser difícil de aplicar no momento em que alguém está com pressa ou inseguro.

O jogo foi pensado para adolescentes e também oferece uma versão de leitura mais curta para crianças de 6 a 10 anos. A faixa escolhida altera o vocabulário e o formato das alternativas; não se pede data de nascimento. A interface funciona em celular, tablet e computador. Em sala, pode servir como ponto de partida para conversa orientada por uma pessoa educadora, sem solicitar relatos reais ou dados pessoais dos estudantes.

### Como se joga

1. A pessoa escolhe um apelido, um personagem e uma faixa de linguagem. O perfil é local e não exige senha.
2. No Trambique OS, abre o Zape Zape 2, lê o pedido e observa as pistas do caso.
3. Escolhe uma ação concreta: conferir por um canal conhecido, pausar, procurar ajuda ou seguir o pedido recebido.
4. A cena mostra a ação dentro de um aplicativo fictício. O resultado explica o que aconteceu e qual verificação ficou faltando.
5. Em alguns casos, é possível consultar fichas e registros de outros aplicativos fictícios para comparar informações.
6. A vingança é uma cena opcional da história, liberada depois da resolução do caso. Antes dela, há perguntas de proteção digital; a brincadeira não recomenda retaliação fora do jogo.
7. O Correio apresenta situações extras. Conferir corretamente pode render créditos fictícios, que podem ser usados para personalizar a mesa na Loja da firma.
8. Resultados e resumos permitem rever escolhas, consequências e os casos da campanha.

### Conteúdo e aprendizagem pretendida

A campanha tem 30 situações organizadas em seis dias de cinco casos. Os temas incluem pedido urgente de dinheiro, falsa central bancária, comprovante falso, boleto ou QR trocado, taxa de entrega, arquivo suspeito, troca de cartão, emprego com cobrança, renda por tarefas, empréstimo com depósito antecipado, investimento, prêmio falso, aluguel, ingresso, voz clonada, relacionamento virtual, captura de conta por QR ou código, coleta de selfie e documento, permissões escondidas, falso intermediário, doação desviada, cobrança falsa de MEI e oferta de itens de jogo.

As respostas ensinam hábitos transferíveis: comparar o pedido com uma fonte independente, abrir o aplicativo por um caminho que a pessoa já conhece, desconfiar de códigos de acesso, revisar permissões, não pagar para liberar um ganho e buscar ajuda quando houver dúvida. Algumas situações são inconclusivas ou podem envolver relações e cobranças legítimas; identidade não é medida por uma porcentagem de confiança.

O humor aparece nas conversas e nas respostas engraçadinhas, mas as explicações de segurança permanecem diretas. Para crianças, textos e alternativas são simplificados. O glossário explica termos como Pix, QR, CPF e skin no contexto em que aparecem.

### O que diferencia o protótipo

- **Ação com consequência visível:** a escolha não termina em “certo” ou “errado”; uma cena demonstra o que seria enviado, conferido, instalado ou bloqueado.
- **História e humor próprios:** a firma, seus aplicativos, personagens, créditos e a vingança fictícia criam continuidade sem reproduzir transações reais.
- **Casos variados e conectados:** conversas, Correio, fichas e registros podem se complementar, para a pessoa comparar evidências em vez de julgar apenas uma mensagem isolada.
- **Duas faixas de linguagem:** o modo infantil encurta textos e reduz o número de alternativas enganosas; o modo adolescente traz mais detalhes e opções.
- **Uso sem conta e sem serviço externo de IA:** decisões e progresso ficam no navegador. O fluxo de jogo é controlado por regras locais e não envia conversas a um modelo de IA.
- **Possibilidade de uso acompanhado:** o Manual contém uma atividade opcional com decisões e evidências para discussão. É um recurso de protótipo, ainda sem validação em sala.

### Pitch de aproximadamente três minutos

> Uma mensagem chega no celular dizendo que alguém conhecido trocou de número e precisa de dinheiro com urgência. Outra parece ser do banco e pede um código. Na hora, não basta saber que golpes existem: é preciso conseguir parar, conferir e escolher o próximo passo.
>
> O Quase Honestos transforma esse momento em um jogo. A pessoa entra como estagiária de uma firma fictícia e recebe situações inspiradas em golpes e pressões digitais do dia a dia. Ela lê a conversa, procura pistas e decide o que fazer. Em vez de mostrar só um sinal verde ou vermelho, o jogo abre uma cena do aplicativo envolvido e mostra a consequência daquela ação. Depois, explica o que aconteceu e como conferir por um canal conhecido.
>
> São 30 casos em seis dias. Eles passam por Pix, falsa central, compras, emprego, QR e códigos de acesso, voz falsa, cobrança escondida, doações e outras situações. Conversas e registros de aplicativos fictícios podem se conectar, então o jogador aprende a comparar fontes. Há uma linguagem mais curta para crianças e outra para adolescentes, sem pedir idade exata. O Correio traz desafios extras e a Loja permite personalizar a mesa com créditos que só existem no jogo.
>
> A firma também é uma comédia. O humor aproxima a experiência, mas não muda a orientação: fora do jogo, a resposta segura é interromper o contato, confirmar a informação por um meio confiável e pedir ajuda quando necessário. A “vingança” é apenas um momento opcional de ficção, depois de perguntas de proteção digital; não é uma sugestão de retaliação real.
>
> O jogo roda no navegador em celular e computador, não precisa de conta e mantém o progresso no próprio dispositivo. As mensagens e transações são inventadas, e as decisões são executadas por regras locais. O próximo passo é testar a clareza e a experiência com estudantes voluntários e educadores, com consentimento e sem recolher histórias pessoais. Queremos descobrir se as cenas ajudam a conversar sobre como verificar antes de agir — e melhorar o jogo com esse retorno.

### Roteiro de demonstração para banca

1. Abra o Zape e apresente um caso de urgência de Pix. Mostre o pedido, a pista e as ações possíveis.
2. Escolha a conferência pelo contato conhecido e deixe a demonstração animada chegar ao resultado. Explique como a ação reduz a pressão sem prometer proteção perfeita.
3. Abra o resumo do caso e mostre a explicação. Se houver tempo, compare com uma opção insegura para visualizar a consequência fictícia.
4. Mostre um caso que cruza informações entre aplicativos ou fichas para demonstrar a checagem independente.
5. Apresente a versão infantil, o Correio e a atividade do Manual como recursos complementares, deixando claro que o material ainda precisa de avaliação com público real.
6. Encerre com o limite e a próxima etapa: o protótipo ensina e registra escolhas no próprio navegador; testes de software não medem mudança de comportamento.

### Evidências e próximos passos

O repositório contém **938 testes automatizados**, além de roteiros de revisão funcional e visual. Esses testes verificam regras, campanhas, conteúdo, salvamento e interface automatizável. Eles demonstram que partes do software se comportam como especificado; não medem compreensão, confiança, retenção nem prevenção real de golpes.

Para avançar no TeenTech, a equipe pode organizar uma revisão de linguagem com educadores, realizar um teste de usabilidade voluntário com atividades fictícias, observar onde as pessoas hesitam e revisar os casos com base nesse retorno. Qualquer avaliação de aprendizagem deve ser planejada com consentimento, coleta mínima e autorização da escola ou responsáveis, conforme a idade e o contexto. Não se deve pedir que participantes compartilhem golpes, senhas, conversas ou situações pessoais.

**Resumo para o formulário:** jogo de navegador sobre prevenção a golpes e violência digital; público de crianças mais velhas e adolescentes; 30 casos com cenas de consequência, duas faixas de linguagem e progresso local; tecnologia sem IA em tempo de execução; contribuição pretendida: praticar pausa, checagem independente e busca de apoio; estado da evidência: protótipo funcional com testes de software, ainda sem estudo de impacto educativo.

## Publicar

O Worker de produção é publicado com `npm run deploy:worker`, usando o projeto Cloudflare configurado em `wrangler.jsonc`. A publicação de Pages é separada e usa `npm run deploy:pages`.

## Referências

- [Regulamento oficial TeenTech 2026](https://teentech.teckids.org.br/regulamento) — PDF com critérios de avaliação, seções 6.1, 8 e 12.
- [CERT.br — dicas rápidas](https://cartilha.cert.br/dicas-rapidas/).
- [FEBRABAN — golpes e tentativas mais citados no RADAR de junho de 2025](https://portal.febraban.org.br/noticia/4324/pt-br/www.febraban.org.br/paginas/).
- [Privacidade da Cloudflare](https://www.cloudflare.com/privacypolicy/).

Conteúdo, personagens e assets são próprios. A referência de gênero e interface não implica vínculo com outros jogos.
