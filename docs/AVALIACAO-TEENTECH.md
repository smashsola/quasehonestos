# Auditoria de produto e aderência ao TeenTech 2026

Revisão do repositório em 15/10/2026. A página oficial aponta para o [regulamento PDF](https://teentech.teckids.org.br/__l5e/assets-v1/9af0fb93-ab85-4e8e-bfa1-9c0442f2dbca/regulamento2026.pdf). Abaixo separo o texto oficial, o que o código demonstra e o que ainda depende de avaliação.

## Cinco fragilidades encontradas e tratadas

1. **A conversa só oferecia risco/pressão e nunca uma resposta protetiva por escolha.** O motor já tinha a ação `wait`, mas `dialogueOptions` trocava essa opção por pressão. Agora cada etapa tem uma escolha visível para pausar e buscar confirmação fora do contato. Ela não libera item ou crédito.
2. **A pausa era apresentada como conferência concluída.** `resultImpact` inferia “verificado” pelo pedido de proteção, e o replay podia afirmar que a conferência havia ocorrido. Agora o resultado diz que houve uma decisão de buscar confirmação e explicita que nenhuma consulta concluída foi registrada. Exposição anterior continua registrada.
3. **A avaliação final escondia a diferença entre ação e evidência.** A interface agora mostra separadamente cada ação e evidência escolhidas antes/depois, com princípios de leitura por competência e contagem descritiva de decisões sustentadas. Não chama isso de nota nem de efeito causado pelo jogo.
4. **O enquadramento do produto deixava o papel de “conduzir atendimentos” mais parecido com prática de golpe do que com simulação preventiva.** A abertura, o tutorial e os títulos das propostas agora apresentam uma situação fictícia para observar, com pausa protetiva em todas as etapas. A firma e o humor permanecem como moldura narrativa.
5. **Documentação misturava protótipos antigos com o comportamento atual.** README, privacidade e roteiro de apresentação agora dizem que o jogo publicado usa opções roteirizadas e que `/api/dialogue` está aposentada. Integrações antigas ainda existem no histórico do repositório; não fazem parte da partida.
6. **Um recado flutuante cobria escolhas no desktop.** Durante uma conversa ativa, o aviso agora vira um indicador acessível em Correio; o recado continua disponível ao abrir o aplicativo.

## Evidência no produto e limites

O código atual inclui seis personagens, cinco propostas, quatro escolhas por etapa, replay derivado do registro do motor, uma investigação com registros fictícios e uma atividade A/B local que pede ação e evidência. Testes de software exercitam regras e estados; não provam que adolescentes reconhecerão riscos ou transferirão o aprendizado.

O papel de simular uma firma que propõe operações continua sendo um risco de enquadramento: uma pessoa ainda pode escolher avançar na ficção para observar o desfecho. A proteção foi colocada ao lado dessas escolhas e o resultado esclarece consequências. Um piloto com educadores e estudantes deve verificar se essa balança narrativa funciona sem ensinar roteiros reutilizáveis nem culpar vítimas.

A atividade antes/depois continua com ordem fixa A→B, quatro itens por formulário, dificuldade ainda não comparada com estudantes, e duração de aula ainda provisória. Registro fica local; compartilhar o JSON é escolha de quem usa. A ausência de cadastro não prova conformidade integral com LGPD.

## Correspondência com o regulamento

O regulamento define a categoria **Prevenção à Violência** como conscientização, prevenção e redução de riscos digitais (seção 8.1, p. 10). O Quase Honestos se alinha por dramatizar pedidos de acesso, códigos, cartão fictício e exposição de conteúdo; oferecer pausa, checagem independente e apoio; e mostrar desfechos. Essa é uma interpretação de aderência, não aprovação oficial.

A seção 12 distribui 100 pontos entre Impacto Social (25), Inovação e Criatividade (25), Viabilidade Técnica (20), Escalabilidade e Sustentabilidade (15), Qualidade do Pitch (10) e Alinhamento (5). O produto oferece evidência observável para viabilidade do protótipo, originalidade narrativa e alinhamento preventivo. Impacto social/eficácia ainda precisam de piloto; escalabilidade, sustentabilidade e qualidade de apresentação dependem do plano de implementação e da demonstração da equipe. Esta revisão não calcula nota.

A seção 6.1 proíbe tratamento de dados pessoais reais sem base legal ou autorização aplicável e exige respeito a licenças; a seção 11 permite IA, mas pede transparência quando relevante. O jogo não coleta conversas no servidor e não usa IA no runtime. IA foi usada como apoio de desenvolvimento e deve ser declarada pela equipe. Ativos de código/licença e medidas formais de privacidade ainda precisam de revisão humana antes da entrega.

## Roteiro demonstrável

1. Abra um atendimento e mostre as opções contextualizadas, inclusive a pausa segura.
2. Selecione a pausa. Mostre “consulta não concluída” e estado sem item/créditos.
3. Abra a rodada de defesa e consulte uma fonte do app fictício.
4. Relacione a decisão à evidência e compare o caso legítimo com o inconclusivo.
5. Mostre o Manual: avaliação antes/depois, critérios de ação/evidência e exportação local sem conversas.

Referência oficial consultada: [regulamento TeenTech 2026](https://teentech.teckids.org.br/regulamento) e [PDF oficial](https://teentech.teckids.org.br/__l5e/assets-v1/9af0fb93-ab85-4e8e-bfa1-9c0442f2dbca/regulamento2026.pdf). O documento na página pode ser atualizado; confira a versão oficial antes de enviar os entregáveis.
