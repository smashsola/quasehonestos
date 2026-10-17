export const defensePeople=[
 {id:'bia',name:'Bia',color:'#e4a4bd',role:'Cuida do grupo da família',face:'•',caseId:'whatsapp',reaction:'Ué, mudou de número e já veio com pressa? Isso me deixou na dúvida.'},
 {id:'caio',name:'Caio',color:'#78b9d1',role:'Resolve tudo pelo celular',face:'⌁',caseId:'bank-call',reaction:'Esse suposto banco quer um código. Eu nem pedi ajuda.'},
 {id:'luana',name:'Luana',color:'#dda96c',role:'Vende bolos por encomenda',face:'◒',caseId:'fake-pix',reaction:'A imagem chegou, mas não apareceu nenhum Pix no meu extrato.'},
 {id:'igor',name:'Igor',color:'#8bc9a9',role:'Organiza as contas da casa',face:'▤',caseId:'boleto',reaction:'Esse boleto veio por outro caminho e ainda estão me apressando.'},
 {id:'maya',name:'Maya',color:'#b8a3db',role:'Compra pela internet',face:'✦',caseId:'delivery',reaction:'Taxa de entrega? Eu nem estava esperando esse aviso.'},
 {id:'leo',name:'Léo',color:'#e38d78',role:'Estagiário de TI por acidente',face:'⌐',caseId:'ransomware',reaction:'A nota pede para ativar macros. Isso parece estranho.'}
];

export const defenseCases={
 whatsapp:{title:'Pedido urgente de Pix no WhatsApp',technique:'Impersonação de conhecido: alguém usa uma conta ou número novo e inventa uma urgência para pedir dinheiro.',message:'Oi, sou eu! Troquei de número. Preciso pagar uma conta agora. Faz um Pix de R$ 480 pra mim? Depois explico.',cues:['Número novo sem confirmação por outro canal','Urgência e pedido de transferência','A história ainda não foi confirmada'],choices:[
  {id:'verify-person',label:'AÇÃO — ligar para o número que você já tinha salvo e confirmar com a pessoa',safe:true,feedback:'Boa. A ligação pelo contato conhecido confirma a identidade sem depender do número novo.'},
  {id:'send-pix',label:'AÇÃO — fazer o Pix agora porque a mensagem parece ser da pessoa',safe:false,feedback:'A foto e o nome podem ser copiados. Confirme por um canal conhecido antes de transferir.'},
  {id:'ask-secret',label:'AÇÃO — pedir que a pessoa envie um código recebido por SMS',safe:false,feedback:'Código de acesso não confirma identidade e não deve ser compartilhado. Use uma ligação ou outro canal conhecido.'},
  {id:'pause-family',label:'AÇÃO — responder “Pix só com ata e café” e confirmar pelo número que você já salvou',safe:true,witty:true,feedback:'Boa. Uma segunda confirmação ajuda, desde que venha por um contato que vocês já conhecem.'}
 ]},
 'bank-call':{title:'Falsa central do banco',technique:'Falso atendente cria alarme e pede código, instalação de aplicativo ou transferência para uma “conta segura”.',message:'Central de segurança: detectamos uma compra. Para cancelar, diga o código que chegou por SMS e instale nosso app de suporte remoto.',cues:['A ligação chegou sem você pedir','Pede código de uso único e app remoto','Banco não precisa que você transfira dinheiro para proteger a conta'],choices:[
  {id:'hangup-official',label:'AÇÃO — dizer “meu código SMS está de férias”, desligar e ligar pelo app oficial do banco',safe:true,witty:true,feedback:'Boa. Você encerrou a ligação e procurou o banco usando um canal que já conhecia.'},
  {id:'give-code',label:'AÇÃO — ditar o código para cancelar a compra',safe:false,feedback:'O código pode autorizar acesso ou uma operação. Banco não precisa que você o dite.'},
  {id:'install-remote',label:'AÇÃO — instalar o aplicativo indicado pelo atendente',safe:false,feedback:'Um app de acesso remoto pode entregar o controle do aparelho. Feche a ligação e procure o banco pelo app oficial.'},
  {id:'transfer-safe',label:'AÇÃO — transferir o saldo para a conta “segura” informada',safe:false,feedback:'“Conta segura” indicada por telefone é um sinal de golpe. Não transfira; confirme diretamente com o banco.'}
 ]},
 'fake-pix':{title:'Comprovante de Pix que não caiu',technique:'Comprovante falso ou transferência agendada é usado para pressionar a entrega antes do dinheiro aparecer na conta.',message:'Já paguei! Olha o comprovante. O Pix está agendado, mas o entregador chegou. Pode mandar o bolo agora?',cues:['O comprovante não prova que o valor entrou','Agendamento pode ser cancelado ou não se concluir','A entrega está sendo apressada'],choices:[
  {id:'check-statement',label:'AÇÃO — abrir o app do banco por conta própria e conferir o saldo/extrato',safe:true,feedback:'Boa. O extrato da sua conta confirma se o dinheiro entrou de verdade.'},
  {id:'deliver-proof',label:'AÇÃO — entregar o pedido porque recebeu a imagem do comprovante',safe:false,feedback:'Imagem pode ser editada e agendamento não é crédito confirmado. Confira no extrato antes de entregar.'},
  {id:'refund-other',label:'AÇÃO — devolver qualquer valor para outra chave enviada no chat',safe:false,feedback:'Não devolva para uma chave diferente. Se um Pix cair por engano, fale com seu banco e use o fluxo oficial de devolução.'},
  {id:'wait-settle',label:'AÇÃO — responder “o bolo só sai com extrato aprovado” e esperar o crédito cair',safe:true,witty:true,feedback:'Boa. Só libere depois de confirmar o crédito no aplicativo do banco.'}
 ]},
 boleto:{title:'Boleto ou QR Code trocado',technique:'Um boleto adulterado ou QR Code falso direciona o pagamento para um beneficiário diferente.',message:'Segue a segunda via. O código vence hoje; paga por este QR rapidinho pra não bloquear sua conta.',cues:['Pressa para pagar por um link recebido','Beneficiário pode não ser a empresa esperada','Dá para confirmar a cobrança em canal oficial'],choices:[
  {id:'check-beneficiary',label:'AÇÃO — avisar “esse QR vai passar pela auditoria” e conferir o beneficiário no app do banco',safe:true,witty:true,feedback:'Boa. Confira os dados dentro do app do banco antes de autorizar.'},
  {id:'pay-qr',label:'AÇÃO — pagar o QR recebido sem abrir os detalhes',safe:false,feedback:'O QR pode enviar o valor a outra pessoa. Confira o beneficiário e confirme a cobrança com a empresa por um canal conhecido.'},
  {id:'open-known-app',label:'AÇÃO — abrir o app ou site que você já usa e localizar a cobrança',safe:true,feedback:'Boa. Acesse por um caminho conhecido e compare o beneficiário e o valor.'},
  {id:'send-doc',label:'AÇÃO — enviar foto do documento para liberarem a segunda via',safe:false,feedback:'Não envie documentos para esse contato. A cobrança pode ser verificada sem entregar seus dados.'}
 ]},
 delivery:{title:'Taxa de entrega por SMS',technique:'Mensagem falsa de entrega leva a uma página que imita uma transportadora e pede cartão ou dados pessoais.',message:'Sua encomenda está retida. Pague C$ 4,90 neste link para liberar hoje: entrega-rastreio.exemplo',cues:['Link chegou sem você pedir','Taxa pequena para fazer você agir sem pensar','A mensagem pede pagamento ou dados'],choices:[
  {id:'track-official',label:'AÇÃO — abrir o app/site oficial da loja ou transportadora por conta própria',safe:true,feedback:'Boa. Consulte o pedido pelo app ou endereço que você já conhece.'},
  {id:'pay-link',label:'AÇÃO — abrir o link e preencher o cartão para liberar o pacote',safe:false,feedback:'A página pode copiar os dados do cartão. Não use o link; confira o pedido no app oficial.'},
  {id:'reply-cpf',label:'AÇÃO — responder com CPF e endereço para confirmar a entrega',safe:false,feedback:'Não envie dados pessoais por resposta a uma mensagem inesperada. Confirme pelo canal oficial.'},
  {id:'ask-store',label:'AÇÃO — dizer “taxa surpresa não veio no carrinho” e consultar o pedido no app oficial',safe:true,witty:true,feedback:'Boa. O contato original da loja ajuda a confirmar se existe alguma taxa.'}
 ]},
 ransomware:{title:'Anexo suspeito: “nota fiscal urgente”',technique:'Anexo ou link malicioso pode instalar ransomware: um programa que bloqueia arquivos e tenta cobrar resgate. No jogo, a máquina é simulada.',message:'Segue a nota fiscal que faltou. Ative macros ou execute “Visualizar documento” para abrir. Se não pagar hoje, perde o prazo.',cues:['Anexo inesperado e pressão por prazo','Pede para executar arquivo ou ativar macros','Ransomware pode bloquear arquivos; pagar não garante recuperação'],choices:[
  {id:'dont-open-report',label:'AÇÃO — não abrir; confirmar a nota com quem enviou por um contato conhecido',safe:true,feedback:'Boa. Você evitou executar o anexo e confirmou a cobrança por outro canal.'},
  {id:'open-attachment',label:'AÇÃO — executar o arquivo para ver a nota agora',safe:false,ransomware:true,feedback:'O anexo fictício iniciou o ransomware de brincadeira da rodada. Ele tenta bloquear os arquivos simulados.'},
  {id:'enable-macros',label:'AÇÃO — ativar macros porque o documento pediu',safe:false,ransomware:true,feedback:'Ativar macros executou o arquivo suspeito na simulação. Um anexo malicioso pode iniciar ransomware.'},
  {id:'ask-it',label:'AÇÃO — manter fechado e pedir ao TI: “essa macro tá querendo ser protagonista”',safe:true,witty:true,feedback:'Boa. Você deixou o arquivo fechado e acionou um canal de suporte conhecido.'}
 ]}
};

export function startDefenseCall(cursor){
 const person=defensePeople[cursor],scenario=person&&defenseCases[person.caseId];
 if(!person||!scenario)return null;
 return {mode:'defense',caller:person.id,caseId:person.caseId,trust:0,used:[],log:[{speaker:'Contato não salvo',text:scenario.message}],outcome:null,expression:'confused',chatVisible:2,chatStage:'ready'};
}
export function decideDefense(a,choiceId,now=Date.now()){
 if(a?.mode!=='defense'||a.outcome)return false;
 const scenario=defenseCases[a.caseId],choice=scenario?.choices.find(c=>c.id===choiceId);
 if(!choice||a.used.includes(choice.id))return false;
 a.used.push(choice.id);a.choice=choice.id;a.log.push({speaker:'Sistema',text:choice.label,action:true});
 if(choice.ransomware){a.ransomwareDeadline=now+45_000;a.ransomwareTriggeredAt=now;a.outcome=null;a.expression='surprised';a.log.push({speaker:'Sistema',text:'ALERTA: a máquina fictícia começou a bloquear arquivos. Você tem 45 segundos para desconectá-la da rede e acionar o suporte. Nada será alterado neste computador.'});}
 else {a.outcome=choice.safe?'blocked':'fooled';a.feedback=choice.feedback;a.expression=choice.safe?'thinking':'hurt';a.log.push({speaker:'Sistema',text:choice.feedback});}
 return true;
}
export function stopRansomware(a){
 if(a?.mode!=='defense'||!a.ransomwareDeadline||a.outcome)return false;
 a.ransomwareDeadline=null;a.ransomwareStopped=true;a.outcome='blocked';a.feedback='Você desconectou a máquina simulada e chamou o suporte. O ransomware ficou restrito ao cenário fictício.';a.expression='happy';a.log.push({speaker:'Sistema',text:a.feedback});return true;
}
export function endDefenseContact(a){
 if(a?.mode!=='defense'||a.outcome||a.ransomwareDeadline)return false;
 a.outcome='blocked';a.choice='end-contact';a.expression='thinking';a.feedback='Você encerrou o contato. Se já houve pagamento, código compartilhado ou arquivo aberto, procure o banco ou o suporte pelo canal oficial. Só bloquear a conversa não cancela uma transferência.';a.log.push({speaker:'Sistema',text:'AÇÃO — encerrar contato e buscar confirmação por um canal oficial.'},{speaker:'Sistema',text:a.feedback});return true;
}
export function expireRansomware(a,now=Date.now()){
 if(a?.mode!=='defense'||!a.ransomwareDeadline||now<a.ransomwareDeadline||a.outcome)return false;
 a.ransomwareDeadline=null;a.outcome='fooled';a.gameOver=true;a.expression='hurt';a.feedback='Os arquivos de brincadeira foram bloqueados. Na vida real, isole o dispositivo da rede e contate o suporte de segurança; não pague nem apague evidências sem orientação. O resgate não garante recuperação. Game over: o chefe vai com certeza descontar do seu salário inexistente de estagiário.';a.log.push({speaker:'Sistema',text:a.feedback});return true;
}
