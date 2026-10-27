import {standaloneJokes} from './case-copy.js';
// Sixteen playable additions. Sources are recorded in docs/scenario-sources.md.
export const expandedScams=[
 {
  "id": "pix-return",
  "title": "Pix recebido por engano",
  "icon": "wallet",
  "app": "Extrato e devolução",
  "message": "Recebi C$ 200 por engano na sua conta. Me devolve por esta outra chave? É da minha esposa.",
  "technique": "Um valor recebido de verdade pode ser usado como isca para pedir uma nova transferência a outro destinatário.",
  "evidence": [
   "Pix recebido: C$ 200 · origem: Conta A",
   "Chave pedida no chat: Conta B",
   "Na transação original existe a opção Devolver"
  ],
  "checks": [
   "Abrir os detalhes do Pix recebido",
   "Comparar a origem com a chave do chat"
  ],
  "safeLabel": "Devolver pela própria transação",
  "unsafeLabel": "Fazer outro Pix para a chave do chat",
  "safeResult": "A devolução voltou à origem usando o controle da transação.",
  "unsafeResult": "Um novo Pix saiu para outra conta; não foi uma devolução da transação original.",
  "lesson": "Devolver pela transação original preserva o vínculo com o pagamento recebido. Se houver dúvida, peça orientação ao banco.",
  "loss": 200,
  "revengeTitle": "Devolução de devolução",
  "villain": "Ué, a taxa voltou pra mim?",
  "reply": "Devolveu a taxa da taxa. Agora guarda esse recibo.",
  "kind": "bank"
 },
 {
  "id": "task-income",
  "title": "Renda extra por tarefas",
  "icon": "ledger",
  "app": "Painel de tarefas",
  "message": "Ganhe dinheiro curtindo vídeos! Você já tem C$ 30. Deposite C$ 100 para desbloquear tarefas VIP e sacar.",
  "technique": "Um pequeno ganho inicial dá confiança; depois, a plataforma exige depósitos crescentes para liberar tarefas ou saques.",
  "evidence": [
   "Curtida de teste: + C$ 5 exibidos",
   "Saldo do painel: C$ 30 · ainda não sacado",
   "Saque condicionado a um depósito de C$ 100"
  ],
  "checks": [
   "Concluir a tarefa de demonstração",
   "Abrir as condições de saque"
  ],
  "safeLabel": "Sair sem pagar para trabalhar",
  "unsafeLabel": "Depositar para desbloquear o saque",
  "safeResult": "Você saiu antes de financiar as tarefas. O saldo mostrado no site não era dinheiro confirmado no banco.",
  "unsafeResult": "O depósito fictício foi cobrado e o saque continuou bloqueado.",
  "lesson": "Saldo numa tela não garante saque. Não deposite dinheiro para liberar trabalho ou ganhos prometidos.",
  "loss": 100,
  "revengeTitle": "Chefe de tarefas inúteis",
  "villain": "Já curti trezentas fotos de cadeira. Cadê o saque?",
  "reply": "Você trabalhou e não recebeu? Pagar para trabalhar não ficou tão bom agora, né?",
  "kind": "tasks"
 },
 {
  "id": "fake-job",
  "title": "Vaga de emprego com taxa",
  "icon": "files",
  "app": "Seleção da firma",
  "message": "Parabéns, sua vaga está garantida! Pague C$ 90 pelo curso de integração neste link hoje e envie documento e selfie.",
  "technique": "Uma vaga falsa usa a vontade de trabalhar para cobrar cursos, exames ou cadastros e recolher dados antes de uma contratação verificada.",
  "evidence": [
   "Vaga recebida por mensagem sem entrevista",
   "Curso obrigatório: C$ 90 para garantir contratação",
   "Página oficial da empresa: vaga não localizada"
  ],
  "checks": [
   "Abrir a página da empresa por outro caminho",
   "Comparar a vaga com o anúncio recebido"
  ],
  "safeLabel": "Encerrar a candidatura não confirmada",
  "unsafeLabel": "Pagar o curso para garantir a vaga",
  "safeResult": "Você verificou a vaga antes de pagar ou enviar dados.",
  "unsafeResult": "A taxa foi enviada para uma contratação que não foi confirmada.",
  "lesson": "Confirme a vaga com a empresa por canais oficiais antes de pagar qualquer cobrança ou enviar documentos.",
  "loss": 90,
  "revengeTitle": "Seleção para ser selecionado",
  "villain": "Fui contratado?",
  "reply": "Foi. Para aguardar o resultado da seleção.",
  "kind": "job"
 },
 {
  "id": "loan-fee",
  "title": "Empréstimo com depósito antecipado",
  "icon": "wallet",
  "app": "Proposta de crédito",
  "message": "Seu empréstimo de C$ 5.000 foi aprovado! Falta pagar C$ 150 de seguro por Pix para liberar o valor.",
  "technique": "Uma oferta de crédito exige pagamento antecipado a um contato para liberar um dinheiro que pode nunca chegar.",
  "evidence": [
   "Crédito prometido: C$ 5.000",
   "Seguro antes da liberação: C$ 150 via Pix",
   "Instituição e contrato ainda não verificados"
  ],
  "checks": [
   "Abrir o custo total da proposta",
   "Conferir a instituição fora da conversa"
  ],
  "safeLabel": "Recusar a cobrança e consultar o banco",
  "unsafeLabel": "Pagar o seguro antecipado",
  "safeResult": "Você interrompeu a cobrança e buscou a instituição por um caminho conhecido.",
  "unsafeResult": "O seguro foi pago no jogo, mas o empréstimo prometido não entrou.",
  "lesson": "Desconfie de depósito antecipado para liberar empréstimo. Verifique a instituição e as condições no canal oficial.",
  "loss": 150,
  "revengeTitle": "Seguro para segurar o seguro",
  "villain": "Esse seguro cobre o quê?",
  "reply": "Cobre a vontade de pagar outro seguro.",
  "kind": "loan"
 },
 {
  "id": "fake-investment",
  "title": "Investimento de lucro garantido",
  "icon": "ledger",
  "app": "Carteira de investimento",
  "message": "Invista C$ 250 e receba o dobro amanhã, sem risco! Meu painel mostra tudo. Para sacar, pague a taxa de validação.",
  "technique": "Um painel pode inventar rentabilidade e usar promessas de retorno rápido para incentivar mais depósitos.",
  "evidence": [
   "Aporte solicitado: C$ 250",
   "Gráfico exibido: +100% em um dia",
   "Saque bloqueado por mais uma taxa"
  ],
  "checks": [
   "Abrir o histórico por trás do gráfico",
   "Consultar quem oferece o investimento"
  ],
  "safeLabel": "Fechar a oferta sem novo depósito",
  "unsafeLabel": "Depositar na promessa de lucro garantido",
  "safeResult": "Você não confundiu um gráfico com a comprovação de um investimento.",
  "unsafeResult": "O painel subiu, mas o dinheiro saiu e o saque continuou bloqueado.",
  "lesson": "Promessas de lucro alto, rápido e garantido são sinais de risco. Verifique o ofertante e não pague novas taxas ao contato.",
  "loss": 250,
  "revengeTitle": "Fundo do poço garantido",
  "villain": "Meu rendimento foi pra onde?",
  "reply": "Pro gráfico. Ele tá ótimo; você que não.",
  "kind": "investment"
 },
 {
  "id": "prize-fee",
  "title": "Prêmio que pede pagamento",
  "icon": "prize",
  "app": "Central de premiação",
  "message": "Você ganhou um console! Para retirar, pague C$ 60 de liberação e confirme os dados do cartão. Você tem cinco minutos.",
  "technique": "Um prêmio inesperado é usado para cobrar taxas e recolher dados sob pressão de um prazo.",
  "evidence": [
   "Participação em sorteio: não encontrada",
   "Prêmio anunciado: console",
   "Taxa antes da entrega: C$ 60"
  ],
  "checks": [
   "Revelar os detalhes do cupom",
   "Conferir o regulamento pelo organizador"
  ],
  "safeLabel": "Fechar a premiação não confirmada",
  "unsafeLabel": "Pagar a taxa para receber o prêmio",
  "safeResult": "Você conferiu a origem do sorteio e não entregou dinheiro nem dados.",
  "unsafeResult": "O prêmio continuou só na tela, enquanto a taxa fictícia saiu do saldo.",
  "lesson": "Verifique a existência e as regras do sorteio por um canal independente. Não pague a um contato para receber um prêmio não confirmado.",
  "loss": 60,
  "revengeTitle": "Troféu de quase vencedor",
  "villain": "Ganhei alguma coisa?",
  "reply": "Ganhou. Experiência pra não pagar retirada.",
  "kind": "prize"
 },
 {
  "id": "marketplace-sale",
  "title": "Taxa para liberar uma venda",
  "icon": "shop",
  "app": "Minhas vendas",
  "message": "Sua venda foi aprovada! Pague C$ 80 para ativar o seguro e liberar o pagamento. Não abra o app, nosso suporte resolve por aqui.",
  "technique": "Um falso comprador ou suporte inventa uma venda e cobra uma taxa para liberar um pagamento que não consta na plataforma.",
  "evidence": [
   "E-mail recebido: venda aprovada",
   "Aplicativo da plataforma: nenhum pedido",
   "Taxa para liberar saldo: C$ 80"
  ],
  "checks": [
   "Abrir Minhas vendas no app conhecido",
   "Conferir o status real do pedido"
  ],
  "safeLabel": "Manter o produto sem pagar taxa pelo chat",
  "unsafeLabel": "Pagar a taxa e liberar a entrega",
  "safeResult": "Você ficou com o produto e consultou a venda dentro do aplicativo conhecido.",
  "unsafeResult": "A taxa foi cobrada e o produto foi separado sem uma venda confirmada.",
  "lesson": "Confirme venda e pagamento no próprio app. Mensagens e e-mails não substituem o registro dentro da plataforma.",
  "loss": 80,
  "revengeTitle": "Venda do frete do nada",
  "villain": "Comprei o quê mesmo?",
  "reply": "O direito de olhar o anúncio.",
  "kind": "market"
 },
 {
  "id": "account-takeover",
  "title": "Roubo da conta por código ou QR",
  "icon": "calls",
  "app": "Dispositivos conectados",
  "message": "Sou do suporte do Zape. Escaneie este QR e envie o código de SMS para não perder sua conta.",
  "technique": "Um código de confirmação ou QR de vinculação pode autorizar outra sessão. Ele não deve ser entregue a um suporte inesperado.",
  "evidence": [
   "Sessão atual: seu computador",
   "Sessão solicitada: aparelho desconhecido",
   "Código de confirmação: uso pessoal"
  ],
  "checks": [
   "Abrir os dispositivos conectados",
   "Selecionar o aparelho desconhecido"
  ],
  "safeLabel": "Revogar a sessão e guardar o código",
  "unsafeLabel": "Autorizar a sessão desconhecida",
  "safeResult": "A sessão desconhecida foi revogada e o código continuou com você.",
  "unsafeResult": "Um aparelho desconhecido ganhou acesso à conta fictícia.",
  "lesson": "Não compartilhe códigos nem vincule sessões por pedidos inesperados. Revise dispositivos e ative a verificação em duas etapas.",
  "loss": 120,
  "revengeTitle": "Sessão da sessão expirada",
  "villain": "Meu acesso caiu!",
  "reply": "É a autenticação em duas etapas: você sai e fica fora.",
  "kind": "sessions"
 },
 {
  "id": "fake-lawyer",
  "title": "Falso advogado e liberação de valores",
  "icon": "files",
  "app": "Consulta de processo",
  "message": "Ganhamos seu processo! Sou do escritório. Para receber C$ 12.000, envie C$ 180 de custas nesta chave Pix ainda hoje.",
  "technique": "O contato usa dados reais de um processo para imitar um advogado e pedir um pagamento não confirmado para liberar valores.",
  "evidence": [
   "Número do processo citado: informação pública",
   "Contato recebido: número diferente do escritório",
   "Cobrança: Pix para liberar valores"
  ],
  "checks": [
   "Comparar o número com o contato já salvo",
   "Consultar o escritório pelo canal conhecido"
  ],
  "safeLabel": "Interromper a cobrança não confirmada",
  "unsafeLabel": "Pagar as custas pela chave da mensagem",
  "safeResult": "Você confirmou a identidade por um canal independente antes de pagar.",
  "unsafeResult": "As custas fictícias foram para a chave do contato; o valor prometido não chegou.",
  "lesson": "Dados de um processo não provam a identidade do remetente. Confirme a cobrança com o profissional por um contato conhecido.",
  "loss": 180,
  "revengeTitle": "Honorários para honorar nada",
  "villain": "E o meu processo?",
  "reply": "Foi arquivado na pasta chamada conversa fiada.",
  "kind": "dossier"
 },
 {
  "id": "fake-voice",
  "title": "Voz conhecida pedindo Pix",
  "icon": "calls",
  "app": "Ligação de confirmação",
  "message": "Filho, sou eu! Tô sem acesso ao meu banco. Faz C$ 220 agora e não liga, tô numa reunião.",
  "technique": "Uma voz parecida, inclusive produzida por IA, não confirma identidade. O pedido tenta impedir a verificação por outro canal.",
  "evidence": [
   "Áudio: voz parecida com pessoa conhecida",
   "Número que enviou: não confirmado",
   "Pedido: pagar e não ligar de volta"
  ],
  "checks": [
   "Ouvir o pedido sem autorizar pagamento",
   "Abrir o contato que já estava salvo"
  ],
  "safeLabel": "Ligar por outro canal antes de pagar",
  "unsafeLabel": "Confiar só na voz e mandar o Pix",
  "safeResult": "Você confirmou a história por um contato conhecido, sem depender do áudio.",
  "unsafeResult": "O Pix foi enviado com base apenas na voz do áudio.",
  "lesson": "Áudio e vídeo podem ser manipulados. Confirme pedidos de dinheiro por um canal independente, mesmo reconhecendo a voz.",
  "loss": 220,
  "revengeTitle": "Correio de voz do nada",
  "villain": "Minha voz não convenceu?",
  "reply": "Convenceu a cair na caixa postal.",
  "kind": "voice"
 },
 {
  "id": "romance-money",
  "title": "Relacionamento virtual com pedido de dinheiro",
  "icon": "calls",
  "app": "Conversa e limites",
  "message": "A gente nunca se encontrou, mas eu confio em você. Preciso de C$ 130 pra uma emergência. Não conta pra ninguém, é nosso segredo.",
  "technique": "Um vínculo afetivo pode ser usado para criar confiança, pedir sigilo e obter transferências sem uma história verificada.",
  "evidence": [
   "Contato conhecido só pela internet",
   "Emergência acompanhada de pedido de dinheiro",
   "Pressão para guardar segredo"
  ],
  "checks": [
   "Rever o histórico de pedidos",
   "Abrir um contato de confiança para pedir ajuda"
  ],
  "safeLabel": "Definir um limite e não transferir",
  "unsafeLabel": "Transferir para provar confiança",
  "safeResult": "Você pediu ajuda e colocou um limite sem financiar a história.",
  "unsafeResult": "O pedido de afeto virou uma transferência que não verificou a emergência.",
  "lesson": "Afeto não deve depender de dinheiro nem de segredo. Converse com alguém de confiança e interrompa cobranças e pressão.",
  "loss": 130,
  "revengeTitle": "Cupido de boleto vencido",
  "villain": "Nem um Pix por amor?",
  "reply": "Meu coração é mole. Meu banco tem senha.",
  "kind": "chat"
 },
 {
  "id": "fake-rental",
  "title": "Aluguel de temporada falso",
  "icon": "shop",
  "app": "Reserva de hospedagem",
  "message": "Casa na praia pela metade do preço! Transfira C$ 300 de sinal agora. Não dá pra visitar nem falar com a imobiliária, tenho outro interessado.",
  "technique": "Fotos copiadas e urgência para pagar um sinal podem esconder um imóvel ou anunciante que não foi verificado.",
  "evidence": [
   "Fotos bonitas: não comprovam propriedade",
   "Visita e confirmação por outro canal: recusadas",
   "Sinal urgente fora da plataforma: C$ 300"
  ],
  "checks": [
   "Comparar endereço e dados do anúncio",
   "Consultar a reserva por um canal independente"
  ],
  "safeLabel": "Sair sem pagar o sinal não confirmado",
  "unsafeLabel": "Pagar o sinal para segurar a casa",
  "safeResult": "Você não pagou antes de verificar o imóvel e o responsável pelo anúncio.",
  "unsafeResult": "O sinal foi enviado, mas a reserva não foi confirmada no canal consultado.",
  "lesson": "Verifique imóvel, anunciante e condições por outros meios antes de pagar. Preserve registros se houver fraude.",
  "loss": 300,
  "revengeTitle": "Reserva da varanda imaginária",
  "villain": "Cadê a vista pro mar?",
  "reply": "Fecha os olhos. É a única parte inclusa.",
  "kind": "rental"
 },
 {
  "id": "fake-ticket",
  "title": "Ingresso falso ou duplicado",
  "icon": "prize",
  "app": "Carteira de ingressos",
  "message": "Tenho o último ingresso! Só C$ 100 no Pix. Esse print do QR comprova. Não transfiro pelo app porque cobra taxa.",
  "technique": "Um print de ingresso pode ser copiado e vendido mais de uma vez; aparência ou leitura do QR não comprovam validade e titularidade.",
  "evidence": [
   "Arquivo recebido: imagem de um QR",
   "Transferência oficial de titularidade: recusada",
   "Pagamento pedido fora do canal de venda"
  ],
  "checks": [
   "Abrir as regras do evento no canal oficial",
   "Conferir a transferência na carteira do evento"
  ],
  "safeLabel": "Recusar o print sem transferência válida",
  "unsafeLabel": "Pagar pelo print do ingresso",
  "safeResult": "Você conferiu o caminho de transferência aceito pelo evento e recusou a imagem.",
  "unsafeResult": "A imagem foi comprada, mas não criou um ingresso válido na carteira fictícia.",
  "lesson": "Consulte os canais autorizados do evento. Um QR ou print sozinho não comprova autenticidade nem transferência de titularidade.",
  "loss": 100,
  "revengeTitle": "Camarote de ouvir do lado de fora",
  "villain": "Esse ingresso dá acesso a onde?",
  "reply": "À fila. A fila é de graça.",
  "kind": "ticket"
 },
 {
  "id": "gift-selfie",
  "title": "Presente inesperado com selfie",
  "icon": "shop",
  "app": "Comprovante de entrega",
  "message": "Chegou um presente pra você! Não sei de quem é. Olha pra câmera e segura este documento, é só pra comprovar a entrega.",
  "technique": "Um falso presente pode ser usado para coletar uma imagem facial e documentos sob o pretexto de confirmar a entrega.",
  "evidence": [
   "Remetente do presente: não identificado",
   "Pedido: selfie e documento juntos",
   "Finalidade e uso da imagem: não explicados"
  ],
  "checks": [
   "Conferir quem enviou o presente",
   "Ler para que a foto seria usada"
  ],
  "safeLabel": "Recusar a foto e a entrega não confirmada",
  "unsafeLabel": "Enviar a selfie fictícia com documento",
  "safeResult": "Você recusou a coleta de imagem sem uma entrega e finalidade confirmadas.",
  "unsafeResult": "Uma imagem de demonstração foi enviada ao contato, que pode tentar usá-la indevidamente.",
  "lesson": "Não entregue selfie ou documento a uma visita inesperada. Se houve uso indevido, procure os serviços envolvidos e ajuda de confiança.",
  "loss": 150,
  "revengeTitle": "Presente de grego com recibo",
  "villain": "Nem a selfie você manda?",
  "reply": "Mando um desenho. Tem reconhecimento de palito?",
  "kind": "camera"
 },
 {
  "id": "fake-update",
  "title": "Alerta falso de vírus e atualização",
  "icon": "support",
  "app": "Central de notificações",
  "message": "Seu PC tem 37 vírus! Clique em permitir notificações e instale a atualização de segurança aqui para limpar agora.",
  "technique": "Uma página simula avisos do sistema para convencer você a conceder permissões, instalar programas ou pagar por uma falsa limpeza.",
  "evidence": [
   "Aviso apareceu dentro de uma página",
   "Contagem de vírus sem verificação do sistema",
   "Pede instalação e permissão para enviar avisos"
  ],
  "checks": [
   "Abrir a origem do aviso",
   "Conferir atualizações pelas configurações do sistema"
  ],
  "safeLabel": "Fechar a página e negar as notificações",
  "unsafeLabel": "Permitir o alerta e instalar pelo anúncio",
  "safeResult": "Você fechou a página e consultou as configurações reais da simulação.",
  "unsafeResult": "A permissão ativou uma enxurrada de avisos falsos no computador do jogo.",
  "lesson": "Não instale programas nem conceda permissões a um alerta inesperado. Use as atualizações do sistema ou do fabricante.",
  "loss": 100,
  "revengeTitle": "Atualização de atualizar atualizações",
  "villain": "E os 37 vírus?",
  "reply": "Atualizei a contagem. Agora são 37 boletos.",
  "kind": "updates"
 },
 {
  "id": "terms-permissions",
  "title": "Termos e permissões que escondem uma armadilha",
  "icon": "help",
  "app": "Termos do aplicativo",
  "message": "Este app promete organizar seus wallpapers. Marque Aceito tudo: contatos, mensagens e renovação de C$ 40 por semana já vêm selecionados.",
  "technique": "Aceitar sem revisar pode autorizar acessos desnecessários e uma assinatura. Nem todo termo ruim é golpe: aqui, a cobrança foi escondida de propósito.",
  "evidence": [
   "Função prometida: escolher papel de parede",
   "Acesso a mensagens e contatos: desnecessário",
   "Renovação paga: veio pré-selecionada"
  ],
  "checks": [
   "Abrir a cláusula de renovação",
   "Revisar os acessos pedidos pelo aplicativo"
  ],
  "safeLabel": "Recusar o pacote e sair sem assinar",
  "unsafeLabel": "Aceitar todas as permissões e a assinatura",
  "safeResult": "Você revisou os termos e recusou os acessos e a assinatura escondidos.",
  "unsafeResult": "A assinatura fictícia foi aceita junto com acessos que o app não precisava.",
  "lesson": "Leia finalidade, permissões e renovação. Negue acessos desnecessários e não aceite um serviço que impede uma escolha informada.",
  "loss": 40,
  "revengeTitle": "Termos de quase concordância",
  "villain": "Você leu tudo mesmo?",
  "reply": "Li até a parte que você torceu pra eu pular.",
  "kind": "terms"
 },
{
 "id": "fake-middleman",
 "title": "Falso intermediário na compra e venda",
 "icon": "shop",
 "app": "Negociação entre comprador e vendedor",
 "message": "O carro é do meu primo. Não falem de preço entre vocês: ele me deve dinheiro. Pague C$ 450 na minha conta e retire com ele.",
 "technique": "Um intermediário copia um anúncio e conta histórias diferentes ao comprador e ao vendedor para desviar o pagamento a uma terceira conta.",
 "evidence": [
  "Comprador: anúncio com preço menor e pagamento ao intermediário",
  "Proprietário: não autorizou receber por outra pessoa",
  "As duas partes foram orientadas a não conversar sobre o valor"
 ],
 "checks": [
  "Abrir a conversa do comprador",
  "Abrir a conversa do proprietário"
 ],
 "safeLabel": "Comparar as histórias e falar diretamente com o proprietário",
 "unsafeLabel": "Pagar ao intermediário sem comparar os relatos",
 "safeResult": "As versões não combinaram. Você interrompeu o pagamento à terceira conta.",
 "unsafeResult": "O pagamento fictício foi para o intermediário; o proprietário não recebeu pela venda.",
 "lesson": "Confirme preço, identidade e destino do pagamento diretamente entre as partes. Não aceite segredo imposto por um intermediário.",
 "loss": 450,
 "revengeTitle": "Intermediário do intermediário",
 "villain": "Quem é o dono desse negócio?",
 "reply": "Depende de qual das suas histórias você tá contando.",
 "kind": "middleman"
},
{
 "id": "fake-donation",
 "title": "Vaquinha e pedido de doação falsos",
 "icon": "wallet",
 "app": "Conferência da campanha solidária",
 "message": "Essa campanha precisa da sua ajuda agora! Copiei a foto pra facilitar. Doe C$ 50 nesta chave nova, sem abrir o site original, que é mais rápido.",
 "technique": "Imagens e histórias verdadeiras podem ser copiadas para desviar doações a uma chave ou página que não pertence à campanha original.",
 "evidence": [
  "Publicação recebida: foto copiada e chave substituída",
  "Canal do organizador: campanha com outro destino",
  "O pedido tenta impedir que você consulte a fonte"
 ],
 "checks": [
  "Abrir a página do organizador por um caminho conhecido",
  "Comparar o destino da doação com o post"
 ],
 "safeLabel": "Usar somente o canal confirmado da campanha",
 "unsafeLabel": "Doar pela chave nova do post encaminhado",
 "safeResult": "Você conferiu organizador e destino antes de decidir pela doação.",
 "unsafeResult": "Os créditos foram para o destino do post copiado, sem confirmação da campanha.",
 "lesson": "Verifique o organizador e o destino por um canal independente. Uma foto emocionante não autentica uma chave de pagamento.",
 "loss": 50,
 "revengeTitle": "Vaquinha para o bom senso",
 "villain": "Essa campanha arrecada pra quem?",
 "reply": "Pro seu senso de vergonha. A meta ainda tá longe.",
 "kind": "donation"
},
{
 "id": "fake-mei",
 "title": "Taxa ou guia de MEI falsa",
 "icon": "files",
 "app": "Guia da pequena empresa",
 "message": "CNPJ recém-aberto: pague C$ 110 de regularização obrigatória pelo boleto anexado. Temos seus dados, então a cobrança é oficial.",
 "technique": "Dados públicos de uma empresa são usados numa cobrança que imita obrigação fiscal ou vende uma associação como se fosse obrigatória.",
 "evidence": [
  "Mensagem: cobrança não solicitada com dados públicos do CNPJ",
  "Guia recebida: destinatário diferente do canal consultado",
  "Portal consultado por você: não confirma essa taxa de regularização"
 ],
 "checks": [
  "Consultar as obrigações pelo portal conhecido",
  "Comparar a cobrança recebida com a consulta"
 ],
 "safeLabel": "Descartar a taxa não confirmada e usar o canal oficial",
 "unsafeLabel": "Pagar a taxa porque o boleto tem os dados da empresa",
 "safeResult": "Você separou uma cobrança recebida da obrigação consultada no canal conhecido.",
 "unsafeResult": "A taxa foi paga a um destinatário que não foi confirmado no portal consultado.",
 "lesson": "Dados do CNPJ não comprovam a cobrança. Consulte as obrigações do MEI pelo portal ou aplicativo oficial; contribuição de associação não é automaticamente obrigatória.",
 "loss": 110,
 "revengeTitle": "Alvará de quase empreendedor",
 "villain": "Pra receber a licença tem mais alguma taxa?",
 "reply": "Tem a taxa de perguntar se tem mais taxa.",
 "kind": "mei"
},
{
 "id": "free-skins",
 "title": "Skin e moedas grátis em site falso",
 "icon": "prize",
 "app": "Inventário e autorizações do jogo",
 "message": "Você ganhou uma skin lendária! Entre nesta página parecida com a do jogo e autorize a troca automática dos itens para resgatar. É por tempo limitado.",
 "technique": "Uma recompensa de jogo é usada para levar a um login falso ou a uma autorização que pode comprometer a conta e os itens do inventário.",
 "evidence": [
  "Inventário: skin escolhida como isca de recompensa",
  "Página externa: pede uma autorização de troca de todos os itens",
  "Loja oficial aberta por você: não confirma esse resgate"
 ],
 "checks": [
  "Abrir a oferta e ler o alcance da autorização",
  "Conferir a recompensa dentro do jogo conhecido"
 ],
 "safeLabel": "Cancelar a autorização externa e preservar o inventário",
 "unsafeLabel": "Autorizar a troca automática para resgatar a skin",
 "safeResult": "Você cancelou a autorização externa; os itens fictícios ficaram no inventário.",
 "unsafeResult": "A autorização abriu uma troca dos itens para outra conta no jogo fictício.",
 "lesson": "Confira ofertas no próprio jogo e leia o alcance de cada autorização. Não informe senha nem aprove trocas num site enviado por um contato.",
 "loss": 160,
 "revengeTitle": "Skin invisível de edição limitada",
 "villain": "Não tô vendo minha skin lendária!",
 "reply": "É camuflagem. Escondeu até o que você pagou.",
 "kind": "inventory"
}
];

export const expandedById=Object.fromEntries(expandedScams.map(s=>[s.id,s]));
export const expandedAction=(id)=>expandedScams.find(s=>id?.startsWith(s.id+'--'));
export function expandedChoices(s){return [
 {id:s.id+'--verify',label:'AÇÃO — '+s.safeLabel,safe:true,feedback:s.safeResult+' '+s.lesson},
 {id:s.id+'--accept',label:'AÇÃO — '+s.unsafeLabel,safe:false,classification:'Autorização pelo contato',feedback:s.unsafeResult+' '+s.lesson},
 {id:s.id+'--trust',label:'AÇÃO — '+({bank:'copiar a chave alternativa enviada no chat',tasks:'aumentar os depósitos depois do primeiro ganho',job:'enviar documentos para a vaga não confirmada',loan:'pagar uma nova taxa para acelerar a liberação',investment:'reinvestir porque o gráfico continua subindo',prize:'informar o cartão para validar o sorteio',market:'entregar o produto confiando só no e-mail',sessions:'enviar o código de vinculação ao suporte do chat',dossier:'aceitar os dados do processo como prova de identidade',voice:'pagar sem ligar porque reconheceu o áudio',chat:'mandar dinheiro e esconder o pedido de todo mundo',rental:'reservar sem conferir o imóvel porque tem fotos',ticket:'aceitar o QR em imagem como prova de ingresso',camera:'deixar a visita fotografar o documento',updates:'instalar o programa indicado pelo aviso',terms:'aceitar sem ler porque o botão promete ser grátis',middleman:'manter o preço em segredo e confiar na história do intermediário',donation:'doar porque a foto da campanha parece conhecida',mei:'pagar sem consultar porque o CNPJ está correto',inventory:'aprovar a troca porque a skin parece rara'}[s.kind]),safe:false,feedback:s.unsafeResult+' '+s.lesson},
 {id:s.id+'--joke',label:'AÇÃO — dizer “'+standaloneJokes[s.id]+'” e '+s.safeLabel.charAt(0).toLowerCase()+s.safeLabel.slice(1),safe:true,witty:true,feedback:s.safeResult+' '+s.lesson}
];}

const basePortraits=['bia','caio','luana','igor','maya','leo','nina','duda','rafa','enzo'];
export function expandedPortraitId(id){const index=expandedScams.findIndex(s=>'visit-'+s.id===id);return index<0?id:basePortraits[index%10];}
export function expandedDemo(s,suffix){const names={verify:'Conferência independente',accept:'Pedido autorizado',trust:'Aparência aceita como prova',joke:'Conferência antes da resposta'},safe=['verify','joke'].includes(suffix);return {context:s.app+' · '+names[suffix],button:{verify:'Conferir',accept:'Autorizar',trust:'Continuar',joke:'Conferir e responder'}[suffix]+' · '+s.app,result:(safe?s.safeResult:s.unsafeResult)+(suffix==='trust'?' A aparência não confirmou a origem.':suffix==='joke'?' Você conferiu antes de responder à provocação.':'')};}
