# Privacidade, dados e uso de IA — Quase Honestos

Revisado em 15/10/2026 com base na implementação local. Este material descreve o protótipo e não é parecer jurídico nem certificação de conformidade.

## Regulamento TeenTech consultado

O [regulamento oficial 2026](https://teentech.teckids.org.br/regulamento) admite jogos educativos entre os formatos de solução (seção 6) e exige cuidado com dados reais e licenças de recursos (seção 6.1). A seção 11 pede transparência sobre uso relevante de IA no desenvolvimento; a equipe continua responsável pelo resultado. A categoria Prevenção à Violência trata de conscientização, prevenção e redução de riscos digitais (seção 8.1); a rubrica considera impacto, inovação, viabilidade, escalabilidade, pitch e alinhamento (seção 12).

## Funcionamento atual

Não há cadastro nem exigência de idade, nome, contato ou documento real para jogar. Personagens, propostas, códigos, dados expostos e pagamentos são fictícios. Os apps não acessam computadores de terceiros, instalam arquivos reais nem fazem transações.

A aplicação guarda partida, histórico e preferências no armazenamento deste navegador, sem expiração automática. O aviso de privacidade permite exportar ou apagar os dados locais; exportar é uma ação local. A atividade opcional em sala tem um exportador distinto que guarda somente escolhas codificadas, evidências relacionadas, resultados da defesa e tempo decorrido, sem conversas ou nomes.

O filtro bloqueia alguns formatos comuns de contato, CPF e cartão nos campos do jogo, mas não detecta toda informação pessoal. Use apenas dados inventados e não relate situações identificáveis. A hospedagem Cloudflare pode processar metadados técnicos de conexão; retenção e processamento operacional do provedor não foram auditados por esta equipe.

## Inteligência artificial

**O fluxo atual do jogo não usa IA generativa nem envia falas para um modelo.** As quatro escolhas, reações e consequências são roteirizadas e controladas pelo motor local. A rota pública `/api/dialogue` retorna HTTP 410 (`retired`, `scripted-choices`). Arquivos de integrações e relatórios antigos permanecem como histórico técnico no repositório, não como dependência da partida publicada.

IA generativa foi usada como apoio ao desenvolvimento e revisão do código. A equipe deve descrever esse uso na documentação do TeenTech e revisar a autoria dos materiais. O projeto não afirma ter treinado um modelo de terceiros.

## Pontos ainda pendentes

A equipe precisa indicar o responsável pelo projeto e um canal adequado de atendimento; revisar o aviso com a escola/mentor; confirmar retenção e condições da conta de hospedagem; e definir como descartar saves e exportações em aparelhos compartilhados. Não alegar conformidade integral com a LGPD sem essa análise.

A atividade de aprendizagem ainda não foi aplicada com alunos. O instrumento e a comparabilidade entre versões A/B precisam de revisão por educadores e teste voluntário, sem coleta de identificadores.

## Fontes

- [Regulamento oficial TeenTech 2026](https://teentech.teckids.org.br/regulamento), PDF, seções 6.1, 8 e 12.
- [Lei nº 13.709/2018 — LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).
- [ANPD](https://www.gov.br/anpd/pt-br).
- [Política de privacidade da Cloudflare](https://www.cloudflare.com/privacypolicy/).