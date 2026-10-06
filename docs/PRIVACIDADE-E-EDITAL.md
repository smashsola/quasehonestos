# Privacidade, dados e uso de IA — Quase Honestos

Revisão: 05/10/2026. Protótipo educativo; este documento não é uma certificação jurídica.

## Requisitos lidos no regulamento TeenTech 2026

- Seção 6.1, página 8: observar a LGPD; não usar, coletar ou compartilhar dados pessoais reais sem base legal ou autorização aplicável; respeitar direitos autorais, licenças e condições de uso de recursos.
- Seção 11, página 13: informar o uso relevante de IA na documentação, suas ferramentas e finalidade; a equipe continua responsável pela originalidade, veracidade, qualidade e legalidade.
- Páginas 14–15: proteção de crianças e adolescentes, impacto social, originalidade e viabilidade. O regulamento não fornece um texto pronto de termos de uso.

## Funcionamento implementado

Não há cadastro nem exigência de idade, documento, contato ou nome real. As pessoas e informações nos cenários são inventadas. Os apps simulados não acessam computadores de terceiros, instalam arquivos, capturam imagens ou realizam pagamentos.

Partida, histórico de falas, anotações e preferências são guardados no armazenamento deste navegador, sem expiração automática. Rascunhos usam armazenamento da sessão. Os controles no aviso permitem exportar os dados persistentes e apagar tanto esses dados quanto os rascunhos. A exclusão não apaga dados de outros sites, arquivos exportados nem registros da infraestrutura. Exportar é uma ação local, sem envio a terceiros.

O aviso é acessível antes da primeira partida, na tela inicial e pelo ícone de escudo na barra. Não pede consentimento genérico obrigatório: informa o tratamento local necessário para a partida. Formatos comuns de contato, CPF e cartão são bloqueados nos campos de mensagem/anotação; isso reduz erros, mas não identifica todos os dados pessoais possíveis. O aviso instrui a usar apenas dados fictícios.

A Cloudflare entrega o site e pode processar metadados técnicos de conexão conforme sua política e os serviços contratados. O projeto não configura analytics próprios, anúncios ou banco de conversas. Não foi auditada a retenção operacional da conta Cloudflare; não afirmar ausência de todo processamento ou de todos os logs.

## Inteligência artificial

- OpenAI Codex: apoio ao desenvolvimento do código, pesquisa, redação e testes. Alterações são revisadas e verificadas pela equipe com testes do projeto.
- Google Gemini: integração experimental existente para fala/avaliação de personagens. **Desativada no site educativo público**, tanto no cliente quanto no Worker (`DIALOGUE_AI_ENABLED=false`), porque os termos vigentes restringem apps destinados ou provavelmente acessados por menores de 18 anos. Não ativar para este público só acrescentando uma caixa de consentimento ou usando outra conta.
- Diálogo público atual: motor local de interpretação, respostas autorais e regras de progresso. Sem envio das mensagens a um provedor de IA. Não descrever como um LLM generativo funcionando no navegador.

Testes de Gemini usam respostas simuladas e ativação explícita apenas no processo de teste; nenhuma chave real é necessária. Uma futura integração exige provedor adequado ao público, avaliação do tratamento, minimização, retenção e informação prévia.

## Originalidade e referências

Scam With Your Friends foi consultado como referência de organização do desktop, conversas, acesso remoto cenográfico e apps de distração. Não foram incorporados arquivos, imagens, áudio, logos ou código do jogo. Rabisca e Discórdia são funções e interfaces próprias, com cenário visual criado em HTML/CSS/SVG e textos fictícios. A Discórdia não se conecta ao Discord real.

## Pontos que a equipe deve completar antes da entrega formal

Identificar o responsável/controlador por nome e canal de atendimento adequado; o protótipo informa por enquanto a equipe e o repositório público `smashsola/quasehonestos`. Confirmar condições, retenção e instrumentos aplicáveis da hospedagem. Revisar o aviso com o responsável/mentor e documentar qualquer teste de aprendizagem sem coletar dados identificáveis desnecessários. Não publicar dados pessoais em issues do GitHub. As proteções implementadas não substituem essa validação.

## Fontes

- Regulamento_Hackathon_TeenTech_2026.pdf fornecido pela equipe, seções 6.1 e 11.
- LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- ANPD: https://www.gov.br/anpd/pt-br
- Gemini — termos: https://ai.google.dev/gemini-api/terms
- Cloudflare — privacidade: https://www.cloudflare.com/privacypolicy/
- Referência oficial de gameplay e apps: https://store.steampowered.com/app/4954910/ e https://jataterworldwide.com/scam-with-your-friends/
