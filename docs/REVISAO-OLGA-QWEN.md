# Revisão local: interpretação, encerramento e Qwen

Não publicada. A produção continua com a configuração anterior de Llama 3.3. A prévia de desenvolvimento usa Workers AI remoto, sem substituir o Worker público.

## Caso da Olga

Antes, `negatedRequest` aceitava qualquer ocorrência de “não quero”. Assim, “não quero inventar” virava recusa. A interpretação agora distingue o objeto da negação e reconhece perguntas sobre verificação, inclusive formas como “verificaria”, “conferir” e “buscar confirmação”. Incerteza não é autorização nem punição automática. A mensagem original e paráfrases mantêm a conversa aberta, confiança e dinheiro intactos.

A resposta reconhece a ausência de origem confirmada e propõe procurar um contato conhecido fora da conversa, sem inventar um organizador ou afirmar que a consulta ocorreu. A memória distingue afirmações anteriores de confirmação independente. A implementação é um motor local com regras, não compreensão irrestrita de toda linguagem possível.

## Causa do encerramento

`ending` guarda ator, causa e turno: botão, recusa explícita, proteção, verificação, suspeita, agressão, confissão, desconexão ou conclusão. Resultado e replay usam esse registro. O botão produz “Você usou Encerrar conversa”; a recusa explícita diz que o jogador recusou e o personagem encerrou. Suspeita e confissão atribuem a interrupção ao personagem. Salvamentos antigos sem causa detalhada recebem descrição neutra, sem inventar autoria. Classificações incorretas já gravadas em replays antigos não são reescritas retroativamente.

## Modelo e privacidade

`src/dialogue-config.js` centraliza `@cf/qwen/qwen3-30b-a3b-fp8`, rótulo e autoria. O backend usa `Workers_AI.run`; o aviso de privacidade usa a mesma identidade. O Qwen retorna um envelope com `choices`, diferente do formato original de Llama. O adaptador lê os dois, remove blocos de raciocínio e valida o JSON antes de mostrar a fala. O orçamento de saída é 768 tokens e a espera é limitada a 12 segundos. O limite de espera do binding não garante cancelamento da inferência remota já iniciada.

IA redige a reação após a decisão do motor. Permissões, confiança, encerramento e créditos permanecem nas regras locais. JSON inválido, divergência de estado, falha ou quota usam a fala autoral de reserva. Gemini e Claude continuam disponíveis como adaptadores experimentais selecionados explicitamente; não há fallback automático para eles. Não foram removidos do repositório.

Diagnósticos de desenvolvimento mostram API/fallback, status, modelo e tamanho/formato, sem falas ou credenciais. Ficam fora do salvamento e da exportação de aprendizagem. A detecção de dados pessoais é limitada a formatos comuns e não garante detectar todo dado real; o aviso pede apenas conteúdo fictício.

Documentação consultada: [Qwen na Cloudflare](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/), [JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/), [tratamento de dados](https://developers.cloudflare.com/workers-ai/platform/data-usage/). Não foi contratado plano ou ampliada cobrança.

## Investigação e avaliação

A defesa mantém situações legítimas, fraudulentas e inconclusivas nos apps existentes. Além do registro consultado, exige relacioná-lo ao recado: confirma condições, diverge do pedido, falta confirmação atual ou mostra ausência de autorização. Uma fonte pertinente basta. Só anotar ou citar sem relacionar permanece não sustentado. A relação é guardada por código; não há campo de relato pessoal.

A atividade opcional antes/depois já existente usa formulários A/B diferentes sobre verificação, solicitação legítima, inconclusão e apoio. Exporta decisões e evidências sem nomes, créditos ou conversas. [Protocolo](AVALIACAO-APRENDIZAGEM.md) atualizado: comparabilidade pretendida ainda precisa de revisão com educadores e piloto. Escolhas corretas podem ser palpite; nenhuma eficácia foi medida com alunos.

## Verificação realizada

- 176 testes automatizados passaram; build e `git diff --check` passaram.
- Caso original de Olga/Clube, paráfrases, pergunta com memória, recusa explícita, botão, interrupção do personagem e salvamento da causa testados.
- Indisponibilidade, saída inconsistente e dados pessoais bloqueados testados com transportes controlados; reserva preserva estado. As primeiras tentativas reais incompatíveis também retornaram fallback, antes do ajuste do envelope Qwen.
- Caso original retornou HTTP 200 na prévia remota com modelo Qwen confirmado no diagnóstico. Três turnos adicionais — esclarecimento, pergunta contextual e recusa — retornaram HTTP 200 com estado intacto. [Registro sem falas](QWEN-VALIDACAO.json). Não é teste estatístico nem garante todas as respostas futuras.
- Navegador: percurso inicial até Olga, proposta do Clube, mensagem original, troca para Fichas e retorno com rascunho, recusa, replay, consulta ao mural, relação da evidência, retomada após reload, defesa legítima sustentada e continuação até Davi. Desktop também enviou por Enter.
- Emulação de toque em 360, 390 e 430 px: um app visível, sem rolagem horizontal no chat/replay/defesa. A leitura do histórico manteve scrollTop 95 após trocar de app. Enter móvel inseriu nova linha sem enviar.
- Altura reduzida para 440 px com campo focado ativou o layout de teclado: campo e Enviar ficaram dentro da área útil. Isso é simulação, não teclado virtual real. Nenhum aparelho físico foi testado.
- Cabeçalho e compositor compactados; ajuda começa recolhida, e preferências de abertura anteriores são preservadas. Janelas múltiplas mantidas no desktop. Na emulação de 390 px, ajuda recolhida deixou 255 px de chat no estado testado, contra 193 px com ajuda aberta; esses valores dependem da tela e estado.

Limitações: regras linguísticas ainda podem errar frases complexas; validação semântica é conservadora e pode preferir fallback; dificuldade comparável e transferência precisam de estudantes; teclado real e aparelhos com recortes precisam de validação física. Progresso existente não foi apagado. A rodada inconclusiva e suas relações foram verificadas em testes automatizados, não percorridas novamente no navegador nesta revisão.
