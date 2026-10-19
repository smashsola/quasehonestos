export const scammerPeople=[
 {id:'golpista1',emotion:'amused',speakingExpression:'happy'},
 {id:'golpista2',emotion:'suspicious',speakingExpression:'thinking'},
 {id:'golpista3',emotion:'confused',speakingExpression:'suspicious'},
 {id:'golpista4',emotion:'thinking',speakingExpression:'amused'},
 {id:'golpista5',emotion:'surprised',speakingExpression:'happy'},
 {id:'golpista6',emotion:'angry',speakingExpression:'suspicious'}
];

export const defensePeople=[
 {id:'bia',name:'Bia',color:'#e4a4bd',role:'Cuida do grupo da família',face:'•',emotion:'suspicious',replyEmotion:'thinking',scammerId:'golpista1',caseId:'whatsapp',reaction:'Ué, mudou de número e já veio com pressa? Isso me deixou na dúvida.'},
 {id:'caio',name:'Seu personagem',color:'#78b9d1',role:'Resolve tudo pelo celular',face:'⌁',emotion:'confused',replyEmotion:'thinking',scammerId:'golpista2',caseId:'bank-call',reaction:'Esse suposto banco quer um código. Eu nem pedi ajuda.'},
 {id:'luana',name:'Luana',color:'#dda96c',role:'Vende bolos por encomenda',face:'◒',emotion:'hurt',replyEmotion:'suspicious',scammerId:'golpista3',caseId:'fake-pix',reaction:'A imagem chegou, mas não apareceu nenhum Pix no meu extrato.'},
 {id:'igor',name:'Igor',color:'#8bc9a9',role:'Organiza as contas da casa',face:'▤',emotion:'thinking',replyEmotion:'suspicious',scammerId:'golpista4',caseId:'boleto',reaction:'Esse boleto veio por outro caminho e ainda estão me apressando.'},
 {id:'maya',name:'Maya',color:'#b8a3db',role:'Compra pela internet',face:'✦',emotion:'surprised',replyEmotion:'thinking',scammerId:'golpista5',caseId:'delivery',reaction:'Taxa de entrega? Eu nem estava esperando esse aviso.'},
 {id:'leo',name:'Léo',color:'#e38d78',role:'Estagiário de TI por acidente',face:'⌐',emotion:'suspicious',replyEmotion:'thinking',scammerId:'golpista6',caseId:'ransomware',reaction:'A nota pede para permitir que o arquivo faça alterações. Isso parece estranho.'},
 {id:'nina',name:'Nina',color:'#e6c47e',role:'Ajuda a mãe com as compras',face:'▣',emotion:'angry',replyEmotion:'suspicious',scammerId:'golpista1',caseId:'fake-motoboy',reaction:'O banco não avisou nada no app. E por que meu cartão iria passear de moto?'},
 {id:'duda',name:'Duda',color:'#82b6c1',role:'Está procurando um notebook usado',face:'⌕',emotion:'thinking',replyEmotion:'suspicious',scammerId:'golpista2',caseId:'fake-store',reaction:'O preço está ótimo, mas querem que eu pague fora da plataforma.'},
 {id:'rafa',name:'Rafa',color:'#b9a0cb',role:'Recebe avisos no celular',face:'!',emotion:'confused',replyEmotion:'thinking',scammerId:'golpista3',caseId:'fake-government',reaction:'O link diz ser do governo, mas chegou por mensagem e cobra uma taxa.'},
 {id:'enzo',name:'Enzo',color:'#91b9dc',role:'Ajuda nas compras do mercado',face:'▣',emotion:'surprised',replyEmotion:'angry',scammerId:'golpista4',caseId:'card-swap',reaction:'A maquininha demorou, e agora devolveram um cartão que nem é meu.'}
];

export const defenseCases={
 whatsapp:{title:'Pedido urgente de Pix no WhatsApp',technique:'Alguém usa outro número e finge ser uma pessoa conhecida para pedir dinheiro com pressa.',message:'Oi, sou eu! Troquei de número. Preciso pagar uma conta agora. Faz um Pix de R$ 480 pra mim? Depois explico.',cues:['Número novo sem confirmação por outro canal','Pedido de dinheiro com pressa','A história ainda não foi confirmada'],choices:[
  {id:'verify-person',label:'AÇÃO — ligar para o número que você já tinha salvo e confirmar com a pessoa',safe:true,feedback:'Boa. A ligação pelo contato conhecido confirma a identidade sem depender do número novo.'},
  {id:'send-pix',label:'AÇÃO — fazer o Pix agora porque a mensagem parece ser da pessoa',safe:false,feedback:'A foto e o nome podem ser copiados. Confirme por um canal conhecido antes de transferir.'},
  {id:'ask-secret',label:'AÇÃO — pedir que a pessoa envie um código recebido por SMS',safe:false,classification:'Pedido de código',feedback:'Código de acesso não confirma identidade e não deve ser compartilhado. Use uma ligação ou outro canal conhecido.'},
  {id:'pause-family',label:'AÇÃO — dizer “Pix no susto, não; vou ligar pro número salvo” e confirmar com a pessoa',safe:true,witty:true,feedback:'Boa. Você ligou para o contato salvo e deixou o susto só no pedido, não na conta.'}
 ]},
 'bank-call':{title:'Falsa central do banco',technique:'Alguém finge ser do banco, inventa um problema e pede código, acesso ao celular ou transferência para uma “conta segura”.',message:'Central de segurança: detectamos uma compra. Para cancelar, diga o código que chegou por SMS e instale nosso app de suporte remoto.',cues:['A ligação chegou sem você pedir','Pede um código do celular ou um app que dá acesso ao aparelho','Banco não precisa que você transfira dinheiro para proteger a conta'],choices:[
  {id:'hangup-official',label:'AÇÃO — dizer “código por telefone? Nem o da portaria” e chamar o banco pelo app oficial',safe:true,witty:true,feedback:'Boa. O código ficou guardado e você falou com o banco pelo app oficial.'},
  {id:'give-code',label:'AÇÃO — ditar o código para cancelar a compra',safe:false,classification:'Resposta direta',feedback:'O código pode autorizar acesso ou uma operação. Banco não precisa que você o dite.'},
  {id:'install-remote',label:'AÇÃO — instalar o aplicativo indicado pelo atendente',safe:false,feedback:'Um app de acesso remoto pode entregar o controle do aparelho. Feche a ligação e procure o banco pelo app oficial.'},
  {id:'transfer-safe',label:'AÇÃO — transferir o saldo para a conta “segura” informada',safe:false,feedback:'“Conta segura” indicada por telefone é um sinal de golpe. Não transfira; confirme diretamente com o banco.'}
 ]},
 'fake-pix':{title:'Comprovante de Pix que não caiu',technique:'A pessoa mostra uma imagem de pagamento ou diz que o Pix está marcado para depois, e apressa a entrega antes do dinheiro entrar.',message:'Já paguei! Olha o comprovante. O Pix está agendado, mas o entregador chegou. Pode mandar o bolo agora?',cues:['A imagem não prova que o dinheiro entrou','Um Pix marcado para depois pode não acontecer','A entrega está sendo apressada'],choices:[
  {id:'check-statement',label:'AÇÃO — abrir o app do banco por conta própria e conferir o saldo/extrato',safe:true,feedback:'Boa. O extrato da sua conta confirma se o dinheiro entrou de verdade.'},
  {id:'deliver-proof',label:'AÇÃO — entregar o pedido porque recebeu a imagem do comprovante',safe:false,classification:'Decisão pela imagem',feedback:'Imagem pode ser editada e agendamento não é crédito confirmado. Confira no extrato antes de entregar.'},
  {id:'refund-other',label:'AÇÃO — devolver qualquer valor para outra chave enviada no chat',safe:false,feedback:'Não devolva para uma chave diferente. Se um Pix cair por engano, fale com seu banco e use o fluxo oficial de devolução.'},
  {id:'wait-settle',label:'AÇÃO — dizer “meu forno espera o Pix cair” e conferir o extrato antes de entregar',safe:true,witty:true,feedback:'Boa. O bolo pode sair quentinho; o Pix só conta quando aparece no extrato.'}
 ]},
 boleto:{title:'Boleto ou QR Code trocado',technique:'Um boleto ou QR Code falso pode mandar o dinheiro para uma conta que não é da empresa que fez a cobrança.',message:'Segue a segunda via. O código vence hoje; paga por este QR rapidinho pra não bloquear sua conta.',cues:['Pressa para pagar por um link recebido','Confira o nome de quem vai receber o dinheiro','Dá para confirmar a cobrança por um canal conhecido'],choices:[
  {id:'check-beneficiary',label:'AÇÃO — dizer “boleto com pressa? Eu confiro duas vezes” e ver quem recebe no app',safe:true,witty:true,feedback:'Boa. Você conferiu o nome e o valor no app; QR bonito também precisa passar na vistoria.'},
  {id:'pay-qr',label:'AÇÃO — pagar o QR recebido sem abrir os detalhes',safe:false,classification:'Pagamento direto',feedback:'O QR pode enviar o valor a outra pessoa. Confira o beneficiário e confirme a cobrança com a empresa por um canal conhecido.'},
  {id:'open-known-app',label:'AÇÃO — abrir o app ou site que você já usa e localizar a cobrança',safe:true,feedback:'Boa. Acesse por um caminho conhecido e compare o beneficiário e o valor.'},
  {id:'send-doc',label:'AÇÃO — enviar foto do documento para liberarem a segunda via',safe:false,feedback:'Não envie documentos para esse contato. A cobrança pode ser verificada sem entregar seus dados.'}
 ]},
 delivery:{title:'Taxa de entrega por SMS',technique:'O SMS diz que a encomenda parou e cobra um valor pequeno num link que tenta copiar uma empresa de entregas.',message:'Sua encomenda está retida. Pague C$ 4,90 neste link para liberar hoje: entrega-rastreio.exemplo',cues:['Link chegou sem você pedir','Uma cobrança pequena também merece conferência','A mensagem pede pagamento ou dados'],choices:[
  {id:'track-official',label:'AÇÃO — abrir o app/site oficial da loja ou transportadora por conta própria',safe:true,feedback:'Boa. Consulte o pedido pelo app ou endereço que você já conhece.'},
  {id:'pay-link',label:'AÇÃO — abrir o link e preencher o cartão para liberar o pacote',safe:false,feedback:'A página pode copiar os dados do cartão. Não use o link; confira o pedido no app oficial.'},
  {id:'reply-cpf',label:'AÇÃO — responder com CPF e endereço para confirmar a entrega',safe:false,classification:'Resposta por mensagem',feedback:'Não envie dados pessoais por resposta a uma mensagem inesperada. Confirme pelo canal oficial.'},
  {id:'ask-store',label:'AÇÃO — dizer “taxa surpresa eu já tenho no condomínio” e conferir no app da loja',safe:true,witty:true,feedback:'Boa. A taxa surpresa ficou sem surpresa: você conferiu o pedido no app conhecido.'}
 ]},
 ransomware:{title:'Anexo suspeito: “nota fiscal urgente”',technique:'O arquivo pode instalar um programa que trava os documentos e cobra dinheiro para liberar. Aqui, tudo acontece só no computador do jogo.',message:'Segue a nota fiscal que faltou. Clique em “Habilitar conteúdo” para abrir. Se não pagar hoje, perde o prazo.',cues:['Anexo inesperado e pressão por prazo','Pede para liberar funções ou abrir outro arquivo','Um programa pode travar seus arquivos; pagar não garante que voltem'],choices:[
  {id:'dont-open-report',label:'AÇÃO — não abrir; confirmar a nota com quem enviou por um contato conhecido',safe:true,feedback:'Boa. Você evitou executar o anexo e confirmou a cobrança por outro canal.'},
  {id:'open-attachment',label:'AÇÃO — executar o arquivo para ver a nota agora',safe:false,ransomware:true,feedback:'O anexo fictício iniciou o ransomware de brincadeira da rodada. Ele tenta bloquear os arquivos simulados.'},
  {id:'enable-macros',label:'AÇÃO — permitir que o arquivo execute o que pediu',safe:false,classification:'Abertura do arquivo',ransomware:true,feedback:'Você permitiu que o anexo executasse um programa. Um arquivo malicioso pode bloquear os arquivos do computador.'},
  {id:'ask-it',label:'AÇÃO — dizer “se o arquivo quer clique, vai ter que marcar horário com o TI”, fechar e pedir ajuda',safe:true,witty:true,feedback:'Boa. O arquivo ficou fechado e você chamou o suporte; clique mágico só em filme.'}
 ]},
 'fake-motoboy':{title:'Falso motoboy e troca de cartão',technique:'Depois de uma ligação falsa do banco, alguém aparece para pegar o cartão e tenta descobrir a senha.',message:'Banco: detectamos uma compra. Diga sua senha para cancelar. Um motoboy vai recolher seu cartão com defeito. Corte o plástico, mas entregue o chip.',cues:['O banco não manda buscar cartão nem pede senha por telefone','A visita inesperada veio depois de uma ligação que assustou você','O cartão e a senha podem permitir compras ou saques'],choices:[
  {id:'call-bank',label:'AÇÃO — desligar, não entregar o cartão e ligar para o banco pelo app ou número oficial',safe:true,feedback:'Boa. Banco não precisa recolher seu cartão nem saber sua senha. Use o canal oficial para bloquear ou conferir.'},
  {id:'hand-card',label:'AÇÃO — entregar o cartão cortado ao motoboy e informar a senha',safe:false,classification:'Entrega de cartão e senha',feedback:'O chip pode continuar utilizável e a senha abre caminho para operações. Não entregue o cartão; contate o banco por um canal oficial.'},
  {id:'block-app',label:'AÇÃO — dizer “meu cartão não é lanche pra passear de moto” e bloquear pelo app',safe:true,witty:true,feedback:'Boa. Seu cartão ficou no seu bolso, não na garupa do motoboy; você o bloqueou pelo app.'},
  {id:'ask-id',label:'AÇÃO — pedir o crachá do motoboy e, se parecer certo, entregar o cartão',safe:false,feedback:'Um crachá pode ser copiado. Não entregue o cartão nem compartilhe senha; ligue para o banco por conta própria.'}
 ]},
 'fake-store':{title:'Loja ou leilão falso',technique:'Uma oferta boa demais e com prazo curto pode levar a uma loja inventada ou a um pedido para pagar por fora.',message:'Notebook novo por 70% menos só até hoje! Faz o Pix direto para reservar. A plataforma cobra taxa demais, mas pode confiar.',cues:['Preço muito baixo e prazo curto','Pedido para sair da plataforma de compra','Se der problema, pode ser mais difícil pedir ajuda ao banco'],choices:[
  {id:'check-platform',label:'AÇÃO — conferir a loja e o vendedor dentro da plataforma oficial antes de pagar',safe:true,feedback:'Boa. Verifique o endereço, a reputação e as condições sem sair da plataforma.'},
  {id:'pay-direct',label:'AÇÃO — fazer o Pix direto para garantir o desconto antes que acabe',safe:false,classification:'Pagamento fora da plataforma',feedback:'O desconto e a urgência podem levar a uma loja falsa. Não pague por fora; confira a oferta no canal oficial.'},
  {id:'search-official',label:'AÇÃO — dizer “se acaba enquanto eu confiro, pode ficar com o desconto” e abrir o app oficial',safe:true,witty:true,feedback:'Boa. A promoção pode até acabar; seu dinheiro não precisa ir junto. Você conferiu no app oficial.'},
  {id:'send-document',label:'AÇÃO — enviar CPF e foto do documento para reservar o produto',safe:false,feedback:'Documento não é necessário para confirmar se a oferta existe. Não envie seus dados a esse contato.'}
 ]},
 'fake-government':{title:'Mensagem falsa sobre CPF ou benefício',technique:'A mensagem finge ser de um órgão público, inventa uma pendência urgente e leva a um link que pede dados ou dinheiro.',message:'GOV.BR: seu CPF será suspenso hoje. Regularize agora nesta página e pague a taxa de liberação para evitar bloqueio.',cues:['O aviso chegou por mensagem e traz um link','A ameaça de bloqueio cria pressa','O link pede dados pessoais e pagamento'],choices:[
  {id:'official-gov',label:'AÇÃO — não abrir o link e consultar o serviço digitando o endereço oficial no navegador',safe:true,feedback:'Boa. Consulte o órgão diretamente pelo endereço oficial ou por um canal que você já conhece.'},
  {id:'pay-fee',label:'AÇÃO — pagar a taxa no link para impedir o bloqueio do CPF',safe:false,classification:'Pagamento por link recebido',feedback:'A cobrança pode levar a uma página falsa. Feche o link e consulte o serviço diretamente no portal oficial.'},
  {id:'ask-adult',label:'AÇÃO — dizer “esse link chegou com mais drama que novela das nove” e conferir com alguém de confiança',safe:true,witty:true,feedback:'Boa. O link fez drama; você conferiu o aviso com alguém antes de agir.'},
  {id:'send-cpf',label:'AÇÃO — responder com CPF e data de nascimento para confirmar o cadastro',safe:false,feedback:'Esses dados podem ser usados para fraude. Não responda à mensagem; consulte o órgão pelo canal oficial.'}
 ]},
 'card-swap':{title:'Cartão trocado na maquininha',technique:'Durante o pagamento, alguém pode distrair você, olhar sua senha e devolver um cartão parecido que não é seu.',message:'A maquininha recusou. Digita a senha de novo enquanto eu tento aqui. Pronto, pode ir — seu cartão está de volta.',cues:['Acompanhe a compra até ela terminar','Cubra o teclado ao digitar a senha','Confira o nome no cartão antes de guardá-lo'],choices:[
  {id:'watch-card',label:'AÇÃO — cobrir a senha, acompanhar o pagamento e conferir se o cartão devolvido é seu',safe:true,feedback:'Boa. Confira o valor no visor, proteja a senha e verifique o cartão antes de guardá-lo.'},
  {id:'leave-card',label:'AÇÃO — aceitar o cartão sem olhar porque a compra foi aprovada',safe:false,classification:'Cartão não conferido',feedback:'Um cartão parecido pode ser trocado durante a distração. Confira o nome e, se algo estiver errado, bloqueie o cartão pelo canal oficial.'},
  {id:'use-wallet',label:'AÇÃO — dizer “meu cartão não vai passear sozinho” e pagar por aproximação após conferir o valor',safe:true,witty:true,feedback:'Boa. O cartão ficou com você, e o valor foi conferido antes do pagamento.'},
  {id:'repeat-pin',label:'AÇÃO — digitar a senha outra vez sem cobrir o teclado para agilizar',safe:false,feedback:'Alguém pode observar a senha. Proteja o teclado e nunca aceite ajuda para digitar.'}
 ]}
};

export const defenseMechanics={
 whatsapp:{icon:'☎',title:'Número novo',button:'Conferir o contato',result:'Este número não está salvo. Para confirmar a pessoa, use o contato antigo.'},
 'bank-call':{icon:'📵',title:'Ligação inesperada',button:'Recusar a chamada',result:'A ligação foi encerrada. Se precisar, abra você mesmo o app oficial do banco.'},
 'fake-pix':{icon:'🧾',title:'Comprovante recebido',button:'Conferir o extrato',result:'Comprovante não confirma crédito. Só entregue quando o Pix aparecer no seu extrato.'},
 boleto:{icon:'▦',title:'QR Code no chat',button:'Conferir os dados',result:'Confira o nome de quem recebe e o valor dentro do app do banco antes de pagar.'},
 delivery:{icon:'📦',title:'Pacote “retido”',button:'Checar no app da loja',result:'Link inesperado não confirma entrega. Consulte o pedido pelo app ou site que você já conhece.'},
 'fake-motoboy':{icon:'🚪',title:'Visita inesperada',button:'Recusar a retirada',result:'Banco não manda buscar cartão. Não entregue cartão ou senha; fale com o banco pelo app oficial.'},
 'fake-store':{icon:'🏷️',title:'Oferta com pressa',button:'Deixar a oferta passar',result:'A promoção fictícia expirou. Uma oferta confiável pode esperar enquanto você confere a loja.'},
 'fake-government':{icon:'🏛️',title:'Aviso de bloqueio',button:'Fechar o aviso',result:'Não pague taxa nem envie documentos pelo link. Consulte o serviço pelo app ou endereço oficial.'},
 'card-swap':{icon:'💳',title:'Cartão devolvido',button:'Conferir o nome',result:'Confira o nome antes de guardar. Se não for seu cartão, não use: bloqueie e avise o banco.'}
};

export const defenseFailures={
 whatsapp:{icon:'💸',title:'O Pix foi para o número novo',result:'A pessoa por trás desse número recebeu o dinheiro. Na vida real, avise o banco pelo canal oficial e tente pedir o bloqueio da transferência.'},
 'bank-call':{icon:'🔐',title:'O código abriu caminho para o golpista',result:'O código ou aplicativo pode dar acesso à conta. Na vida real, encerre a ligação, avise o banco pelo app oficial e troque suas senhas em um aparelho seguro.'},
 'fake-pix':{icon:'🧁',title:'O pedido saiu antes do Pix cair',result:'A imagem não confirmou o pagamento e o dinheiro não entrou. Na vida real, confira o extrato e, se já entregou o pedido, fale com seu banco.'},
 boleto:{icon:'🧾',title:'O pagamento foi para outra conta',result:'O QR ou boleto pode ter enviado o dinheiro a um golpista. Na vida real, avise o banco e peça orientação para contestar a transferência.'},
 delivery:{icon:'📦',title:'O link ficou com seus dados',result:'A página falsa pode usar os dados do cartão ou pessoais que você informou. Na vida real, bloqueie o cartão pelo app oficial e avise a loja ou o banco.'},
 'fake-motoboy':{icon:'💳',title:'O cartão e a senha ficaram expostos',result:'Alguém pode usar o cartão ou a senha. Na vida real, bloqueie o cartão pelo app oficial, ligue para o banco e conteste compras que não reconhece.'},
 'fake-store':{icon:'🛍️',title:'O Pix foi pago fora da plataforma',result:'A loja pode não existir e o pagamento fica sem a proteção da plataforma. Na vida real, avise o banco e denuncie a oferta no serviço onde a encontrou.'},
 'fake-government':{icon:'🪪',title:'Seus dados ou o pagamento foram para uma página falsa',result:'O link pode usar os dados enviados ou ficar com a taxa. Na vida real, avise o banco se pagou e procure o órgão pelo site oficial se compartilhou dados.'},
 'card-swap':{icon:'💳',title:'A senha foi vista e o cartão pode ter sido trocado',result:'O cartão que ficou com você pode pertencer a outra pessoa. Na vida real, bloqueie seu cartão pelo app do banco e confira as compras recentes.'}
};

export const defenseActionSounds={
 'verify-person':'call','pause-family':'call','call-bank':'call','ask-adult':'call',
 'hangup-official':'hangup',
 'ask-secret':'message','send-doc':'message','reply-cpf':'message','ask-it':'message','send-document':'message','send-cpf':'message',
 'give-code':'keypad','repeat-pin':'keypad',
 'send-pix':'payment','transfer-safe':'payment','refund-other':'payment','pay-qr':'payment','pay-link':'payment','pay-direct':'payment','pay-fee':'payment',
 'install-remote':'connect','block-app':'connect','open-attachment':'file','enable-macros':'file','dont-open-report':'file',
 'deliver-proof':'delivery','track-official':'delivery','search-official':'click','open-known-app':'click','check-statement':'click','check-beneficiary':'click','watch-card':'terminal','leave-card':'terminal','hand-card':'terminal','use-wallet':'terminal','ask-id':'click'
};

export const defenseActionScenes={
 'verify-person':{icon:'📞',title:'Ligando para o contato salvo',detail:'A chamada vai para o número que já estava na agenda.',motion:'call',target:'AGENDA'},
 'send-pix':{icon:'💸',title:'Enviando o Pix',detail:'A transferência fictícia segue para a chave enviada na mensagem.',motion:'send',target:'CHAVE NOVA'},
 'ask-secret':{icon:'🔐',title:'Pedindo um código',detail:'Um código recebido por SMS é solicitado no chat.',motion:'warn',target:'CÓDIGO SMS'},
 'pause-family':{icon:'📲',title:'Ligando para a pessoa',detail:'A chamada começa pelo contato que você já conhecia.',motion:'call',target:'PESSOA CONHECIDA'},
 'hangup-official':{icon:'📵',title:'Encerrando a ligação',detail:'A chamada suspeita é fechada antes de compartilhar qualquer dado.',motion:'close',target:'LIGAÇÃO SUSPEITA'},
 'give-code':{icon:'🔢',title:'Informando o código',detail:'O código recebido por SMS é dito durante a chamada.',motion:'send',target:'CÓDIGO SMS'},
 'install-remote':{icon:'🖥️',title:'Instalando o aplicativo',detail:'O acesso remoto indicado por quem ligou é iniciado.',motion:'open',target:'APP DE ACESSO'},
 'transfer-safe':{icon:'🏦',title:'Transferindo o saldo',detail:'O dinheiro está sendo enviado para a “conta segura” indicada.',motion:'send',target:'CONTA INDICADA'},
 'check-statement':{icon:'📱',title:'Abrindo o extrato',detail:'O app do banco mostra se o Pix entrou na conta.',motion:'check',target:'EXTRATO'},
 'deliver-proof':{icon:'🧁',title:'Entregando o pedido',detail:'O bolo sai antes de confirmar o crédito no extrato.',motion:'send',target:'PEDIDO'},
 'refund-other':{icon:'↩️',title:'Devolvendo o valor',detail:'Uma transferência é preparada para a chave enviada no chat.',motion:'send',target:'OUTRA CHAVE'},
 'wait-settle':{icon:'🏦',title:'Conferindo se o Pix caiu',detail:'O extrato do banco é aberto antes de liberar o pedido.',motion:'check',target:'EXTRATO'},
 'check-beneficiary':{icon:'🧾',title:'Conferindo quem recebe',detail:'Os dados do boleto são revisados dentro do app do banco.',motion:'check',target:'BENEFICIÁRIO'},
 'pay-qr':{icon:'📲',title:'Pagando o QR Code',detail:'O pagamento é confirmado sem revisar o destinatário.',motion:'send',target:'QR CODE'},
 'open-known-app':{icon:'🏦',title:'Abrindo o app conhecido',detail:'A cobrança é localizada sem usar o link da mensagem.',motion:'open',target:'APP DO BANCO'},
 'send-doc':{icon:'🪪',title:'Enviando o documento',detail:'Uma foto do documento é anexada e enviada no chat.',motion:'send',target:'DOCUMENTO'},
 'track-official':{icon:'📦',title:'Consultando o pedido',detail:'A loja ou transportadora é aberta pelo app oficial.',motion:'check',target:'LOJA OFICIAL'},
 'pay-link':{icon:'💳',title:'Preenchendo o cartão',detail:'Os dados do cartão são digitados no link recebido.',motion:'warn',target:'LINK RECEBIDO'},
 'reply-cpf':{icon:'🪪',title:'Respondendo com seus dados',detail:'CPF e endereço são enviados por mensagem.',motion:'send',target:'SEUS DADOS'},
 'ask-store':{icon:'🛍️',title:'Conferindo no app da loja',detail:'O pedido é localizado pelo aplicativo que você já conhece.',motion:'check',target:'APP DA LOJA'},
 'dont-open-report':{icon:'🛡️',title:'Fechando o anexo',detail:'O arquivo fica fechado enquanto a cobrança é confirmada por outro canal.',motion:'close',target:'ANEXO FECHADO'},
 'open-attachment':{icon:'📎',title:'Abrindo o arquivo',detail:'O anexo inesperado é executado na simulação.',motion:'open',target:'ANEXO'},
 'enable-macros':{icon:'⚙️',title:'Permitindo que o arquivo rode',detail:'O documento suspeito recebe permissão para executar um programa na simulação.',motion:'warn',target:'ARQUIVO'},
 'ask-it':{icon:'🧑‍💻',title:'Chamando o suporte',detail:'O arquivo fica fechado enquanto o suporte é acionado.',motion:'call',target:'SUPORTE'},
 'call-bank':{icon:'🏦',title:'Ligando para o banco',detail:'O contato é feito pelo app ou número oficial do cartão.',motion:'call',target:'BANCO'},
 'hand-card':{icon:'💳',title:'Entregando o cartão',detail:'O cartão e a senha são passados para a pessoa na porta.',motion:'send',target:'MOTOBOY'},
 'block-app':{icon:'📱',title:'Bloqueando pelo app',detail:'O cartão é bloqueado e alguém de confiança é avisado.',motion:'check',target:'CARTÃO BLOQUEADO'},
 'ask-id':{icon:'🪪',title:'Conferindo o crachá',detail:'A visita mostra um crachá antes de pedir o cartão.',motion:'check',target:'CRACHÁ'},
 'check-platform':{icon:'🛍️',title:'Conferindo o vendedor',detail:'A loja e a oferta são revisadas dentro da plataforma.',motion:'check',target:'PLATAFORMA'},
 'pay-direct':{icon:'💸',title:'Fazendo o Pix direto',detail:'O pagamento é enviado para fora da plataforma de compra.',motion:'send',target:'CHAVE PIX'},
 'search-official':{icon:'🔎',title:'Procurando a loja oficial',detail:'A oferta é buscada pelo app que você já conhece.',motion:'check',target:'APP OFICIAL'},
 'send-document':{icon:'🪪',title:'Enviando seus documentos',detail:'CPF e foto são enviados para reservar o produto.',motion:'send',target:'DOCUMENTO'},
 'official-gov':{icon:'🏛️',title:'Consultando o portal oficial',detail:'O serviço é aberto pelo endereço digitado no navegador.',motion:'check',target:'PORTAL OFICIAL'},
 'pay-fee':{icon:'💸',title:'Pagando a taxa',detail:'O pagamento é iniciado pelo link da mensagem.',motion:'send',target:'LINK DA MENSAGEM'},
 'ask-adult':{icon:'🗣️',title:'Pedindo outra opinião',detail:'O aviso é conferido com alguém de confiança.',motion:'call',target:'PESSOA DE CONFIANÇA'},
 'send-cpf':{icon:'🪪',title:'Enviando dados pessoais',detail:'CPF e data de nascimento são respondidos pelo chat.',motion:'send',target:'DADOS PESSOAIS'},
 'watch-card':{icon:'👀',title:'Acompanhando o pagamento',detail:'O valor é conferido e o cartão continua com você.',motion:'check',target:'VALOR + CARTÃO'},
 'leave-card':{icon:'💳',title:'Guardando sem conferir',detail:'O cartão devolvido é aceito sem olhar o nome.',motion:'send',target:'CARTÃO'},
 'use-wallet':{icon:'📲',title:'Pagando por aproximação',detail:'O valor é conferido antes de aproximar o celular.',motion:'check',target:'APROXIMAÇÃO'},
 'repeat-pin':{icon:'🔢',title:'Digitando a senha de novo',detail:'A senha é colocada sem cobrir o teclado.',motion:'warn',target:'SENHA'}
};

export function useDefenseMechanic(a){
 const mechanic=defenseMechanics[a?.caseId];
 if(a?.mode!=='defense'||a.outcome||!a.chatVisible||a.ransomwareDeadline||!mechanic||a.mechanicUsed)return false;
 a.mechanicUsed=true;a.mechanicFeedback=mechanic.result;return true;
}

export function startDefenseCall(cursor){
 const person=defensePeople[cursor],scenario=person&&defenseCases[person.caseId];
 if(!person||!scenario)return null;
 const scammer=scammerPeople.find(contact=>contact.id===person.scammerId);
 return {mode:'defense',caller:person.id,scammerId:scammer?.id,caseId:person.caseId,trust:0,used:[],log:[],outcome:null,expression:person.emotion||'confused',scammerExpression:scammer?.emotion||'confused',scammerSpeakingExpression:scammer?.speakingExpression||scammer?.emotion||'confused',chatVisible:0,chatStage:'typing',unread:true};
}
export function resumeDefenseCall(a){
 if(a?.mode!=='defense'||a.outcome)return false;
 a.actionPending=null;
 if(a.ransomwareDeadline){a.chatStage='ready';a.chatVisible=2;return true;}
 a.chatStage='typing';a.chatVisible=1;a.unread=true;a.murmurHeard=false;return true;
}
export function decideDefense(a,choiceId,now=Date.now()){
 if(a?.mode!=='defense'||a.outcome)return false;
 const scenario=defenseCases[a.caseId],choice=scenario?.choices.find(c=>c.id===choiceId);
 if(!choice||a.used.includes(choice.id))return false;
 a.used.push(choice.id);a.choice=choice.id;a.log.push({speaker:'Sistema',text:choice.label,action:true});
 if(choice.ransomware){a.ransomwareDeadline=now+10_000;a.ransomwareTriggeredAt=now;a.outcome=null;a.expression='surprised';a.log.push({speaker:'Sistema',text:'ALERTA: a máquina fictícia começou a bloquear arquivos. Você tem 10 segundos para desconectá-la da rede e acionar o suporte. Nada será alterado neste computador.'});}
 else {a.outcome=choice.safe?'blocked':'fooled';a.reactionTier=choice.safe?'success':'miss';a.feedback=choice.feedback;a.consequence=choice.safe?null:defenseFailures[a.caseId]||null;a.expression=choice.safe?'thinking':'hurt';a.log.push({speaker:'Sistema',text:choice.feedback});}
 return true;
}
export function stopRansomware(a){
 if(a?.mode!=='defense'||!a.ransomwareDeadline||a.outcome)return false;
 a.ransomwareDeadline=null;a.ransomwareStopped=true;a.outcome='blocked';a.reactionTier='success';a.feedback='Você desconectou a máquina simulada e chamou o suporte. O ransomware ficou restrito ao cenário fictício.';a.expression='happy';a.log.push({speaker:'Sistema',text:a.feedback});return true;
}
export function endDefenseContact(a){
 if(a?.mode!=='defense'||a.outcome||a.ransomwareDeadline)return false;
 const nextStep={whatsapp:'Ligue para a pessoa no número que você já tinha salvo antes de fazer qualquer Pix.', 'bank-call':'Feche a ligação e abra o app do banco por conta própria. Se compartilhou código ou instalou um app, avise o banco pelo canal oficial.', 'fake-pix':'Confira o extrato pelo app do banco. Se o dinheiro não entrou, não entregue o pedido; se já entregou, fale com o banco.', boleto:'Não pague pelo QR recebido. Localize a cobrança no app ou site que você já conhece e confira quem vai receber.', delivery:'Apague o link sem preencher dados. Consulte o pedido no app ou site oficial da loja.', ransomware:'Não abra o anexo. Se já executou o arquivo, desconecte o aparelho da rede e chame o suporte de confiança.', 'fake-motoboy':'Não entregue cartão nem senha. Ligue para o banco pelo número do cartão ou pelo app e peça orientação.', 'fake-store':'Não faça Pix por fora da plataforma. Confira a loja e o vendedor dentro do app oficial.', 'fake-government':'Não pague nem envie documentos pelo link. Consulte o serviço digitando o endereço oficial ou usando o app do órgão.', 'card-swap':'Confira o cartão e cubra a senha ao digitar. Se o cartão foi trocado, bloqueie-o pelo app oficial e fale com o banco.'}[a.caseId]||'Se já enviou dinheiro ou dados, procure o banco ou o suporte pelo canal oficial.';
 a.outcome='blocked';a.choice='end-contact';a.reactionTier='almost';a.expression='thinking';a.feedback=`Você pausou a conversa. ${nextStep} Confirme qualquer dúvida por um canal oficial; se já houve prejuízo, contate o banco ou o suporte o quanto antes.`;a.log.push({speaker:'Sistema',text:'AÇÃO — encerrar contato e buscar confirmação por um canal oficial.'},{speaker:'Sistema',text:a.feedback});return true;
}
export function expireRansomware(a,now=Date.now()){
 if(a?.mode!=='defense'||!a.ransomwareDeadline||now<a.ransomwareDeadline||a.outcome)return false;
 a.ransomwareDeadline=null;a.outcome='fooled';a.reactionTier='miss';a.gameOver=true;a.expression='hurt';a.feedback='O tempo acabou e os arquivos simulados foram bloqueados. Isso só aconteceu dentro do jogo: nada mudou no seu computador. Na vida real, desconecte o aparelho da rede e procure o suporte de segurança; não pague o resgate.';a.log.push({speaker:'Sistema',text:a.feedback});return true;
}

export function finishDefenseMurmur(a){if(!a||a.chatStage!=='speaking')return false;a.chatStage='ready';return true;}
