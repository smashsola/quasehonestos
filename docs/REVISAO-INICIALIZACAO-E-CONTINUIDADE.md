# Inicialização, memória e continuidade

Revisão local de 10/10/2026, baseada no commit `2fe6526`. Este lote não foi enviado ao GitHub nem implantado em produção. A prévia temporária do Worker usada para verificar a IA foi encerrada.

## Alterações

- As cinco frases de pular o boot agora têm aparência de botão, sublinhado, contraste, foco visível, área mínima de toque de 44 px e rótulo acessível. O clique é instalado antes de consultar armazenamento. Pular cancela a sequência; concluir duas vezes não dispara duas inicializações.
- O Supervisor atualiza texto somente quando ele mudou. Antes, seu MutationObserver reescrevia o mesmo conteúdo e observava a própria alteração, alimentando uma fila de microtarefas.
- `safe-storage.js` protege acesso negado, escrita sem espaço e progresso ilegível. A sessão pode continuar temporariamente em memória, com aviso, sem sobrescrever o salvamento original ilegível. Não há exclusão automática de progresso. Uma sessão temporária não promete persistir após fechar a página.
- O boot libera a interface sem aguardar IA. Se o módulo principal não tiver montado os aplicativos, mostra uma recuperação com botão de tentar novamente. O aviso de privacidade também funciona quando seu módulo chega depois do fim do boot.
- A memória adiciona benefício, prazo e tipos de dados fictícios pedidos. Continua separando alegação de confirmação independente. Condições novas não contradizem condições ausentes; mudanças de condição já declarada recebem pergunta contextual. Pedidos negados, relatos, hipóteses e perguntas não viram promessas afirmativas. Extração local permanece limitada, não é compreensão universal de português.
- As continuações do Correio têm nova decisão: consultar o registro anterior, relacioná-lo ao contato novo e procurar confirmação, buscar apoio ou continuar. Só um item fictício realmente presente naquele atendimento pode reaparecer. A ação não dá créditos, não confirma automaticamente identidade e só pode ser concluída uma vez. Consulta e relação escolhida retomam após recarregar.
- A exportação escolar inclui apenas os códigos de ação, relação e qualidade dessa continuação. Não inclui nome do personagem, token, conteúdo do recado ou conversa. A avaliação antes/depois e os casos legítimos, fraudulentos e inconclusivos existentes foram preservados.

## Reprodução antes e depois

O teste do Supervisor executa o módulo real com um DOM simulado que enfileira callbacks de MutationObserver a cada escrita em textContent. **Antes da alteração**, após drenar 30 callbacks, ainda havia 94 callbacks pendentes e o teste falhou. **Depois**, a fila termina e a segunda aplicação não reescreve conteúdo igual; no máximo quatro escritas no cenário. Isso demonstra uma falha do projeto, mas não prova que era a causa específica do timeout de Page.getFrameTree relatado por outro navegador.

## Site publicado: o que foi confirmado

- O endereço oficial abriu e mostrou o desktop durante esta revisão. Não reproduzi o timeout de navegação ou de Page.getFrameTree nessa abertura. Não observei erros ou avisos de console nessa consulta.
- `node scripts/verify-semantic-api.mjs https://quasehonestos.betaniaaa.workers.dev/` fez duas chamadas reais, com ficção sintética: interpretação e redação retornaram HTTP 200 e foram aceitas pelo cliente.
- Para a mensagem de Olga citada no pedido, o motor manteve intenção `question`, confiança 20, créditos 0, sem encerrar e sem liberar item.
- A produção não habilitou cabeçalhos de diagnóstico: os campos de modelo e origem da API vieram nulos. O teste confirma uma resposta real da API; esses cabeçalhos, isoladamente, não identificam o modelo da produção.
- As correções novas deste documento não foram testadas como implantadas no endereço público, porque não foram publicadas.

## Versão em desenvolvimento: o que foi confirmado

- `npm test`: **427 testes aprovados, zero falhas**. Inclui pergunta de Olga, orientação protetiva e paráfrases, negação, contexto e memória, contradições, repetição, encerramento por botão/personagem, estados incompatíveis, IA indisponível/cota, defesa legítima/inconclusiva, operação completa, migrações, salvamento e atividade antes/depois.
- `npm run build`: sucesso. `npm audit --omit=dev`: zero vulnerabilidades de dependências de produção. `git diff --check`: sem erro de whitespace.
- No navegador local `http://127.0.0.1:4197/`, com sessão nova: clicar na frase pulou o boot, o desktop e onboarding abriram, e foi possível escolher a proposta e preparar o app. Esse servidor estático não oferece `/api/dialogue`; o fallback manteve o atendimento utilizável.
- Percurso desktop realizado: prêmio preparado → orientação protetiva digitada → replay que atribui a interrupção ao personagem → consulta ao pedido na Loja → relação entre registro e decisão → defesa → próximo atendimento → Correio → consulta ao atendimento anterior → relação selecionada → recarregar → seleção/registro restaurados → procurar canal conhecido. Saldo permaneceu C$ 0. Esses são testes técnicos com dados fictícios; não resultados de estudantes.
- No atendimento seguinte, abrir Fichas e voltar ao Zape preservou integralmente o rascunho da pergunta de Olga. Enter no teclado desktop enviou a mensagem. A resposta local reconheceu a incerteza, propôs procurar contato conhecido fora da conversa e manteve o compositor disponível, sem liberar passe nem encerrar. Não houve erros ou avisos de console observados no percurso.
- A prévia de desenvolvimento do Worker fez duas chamadas reais ao binding Workers AI com diagnóstico habilitado: **HTTP 200, source `api`, modelo `@cf/qwen/qwen3-30b-a3b-fp8`** em interpretação e redação. A pergunta permaneceu aberta, sem item ou créditos. O primeiro acesso à prévia respondeu 403 por divergência de origem; ajustar somente a origem localhost permitida naquela prévia resolveu, sem retirar a proteção de origem da produção.
- Configuração pública segue `workers-ai`, binding `Workers_AI`, modelo central em `src/dialogue-config.js`. Os adaptadores experimentais Gemini/Claude permanecem no código, bloqueados sem habilitação explícita; não são fallback automático. A reserva padrão é o motor local. Não foi adicionada cobrança, assinatura, dependência paga ou repetição automática de chamadas.

## Limites e próximos testes

As funções de layout foram testadas com larguras **360, 390 e 430 px**, redução do viewport por teclado, zoom e orientação. Os testes de leitura, alternância e avaliação existentes também passaram. Isso não substitui renderização emulada nem teclado real: a emulação por CDP foi bloqueada por permissão recusada nesta revisão e nenhum aparelho físico foi utilizado. Não contornei essa restrição. Ainda faltam conferir visualmente essas três larguras, teclado aberto, alvos de toque e o percurso completo em um aparelho.

Os filtros de dados pessoais não detectam todas as formas de identificação. Não escreva relatos pessoais na simulação. O Qwen tem limites de cota, timeout e variabilidade; duas respostas reais não comprovam qualidade em todo diálogo. O parser local de benefício/prazo cobre construções diretas e não toda paráfrase.

O instrumento antes/depois, sua equivalência de dificuldade e a duração com estudantes ainda dependem de piloto. Preserve a sessão descrita em `SESSOES-EM-SALA.md`; a nova continuação é uma discussão opcional após o atendimento. Nenhum participante, percentual de eficácia, nota ou resultado educacional foi inventado.
