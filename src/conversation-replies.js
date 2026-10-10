// Authored, local replies selected from the actual conversation state.
// Variation changes the wording only; it cannot grant access or create data.
const questions={
 prize:['Quem organizou esse concurso?','Esse prêmio veio de qual concurso?','Quero entender quem anunciou o prêmio.'],
 support:['Não pedi suporte. De onde veio esse atendimento?','Qual problema vocês encontraram no meu computador?','Quem abriu esse chamado? Aqui está funcionando.'],
 club:['Quem organiza esse clube?','Esse convite é de qual grupo?','O que vem na associação e quem é o responsável?'],
 update:['Por que trocar a skin pede meu perfil e contato?','O que minha rotina tem a ver com a aparência do blaster?','Que dados esse pacote acessa além das skins?'],
 link:['Para resgatar pontos, por que preciso cadastrar o cartão?','O que essa página pede no cadastro?','Esse resgate é de qual programa de pontos?']
};
const items={prize:'o identificador BatataPay',support:'a sessão do PãoOS',club:'o passe do clube',update:'a instalação do pacote',link:'o cadastro da página'};
export function variedReply(a,key,options){
 a.replyTurns??={};const turn=a.replyTurns[key]||0;a.replyTurns[key]=turn+1;
 const recent=a.log.filter(l=>l.speaker!=='Você'&&l.speaker!=='Sistema').slice(-4).map(l=>l.text);
 for(let i=0;i<options.length;i++){const option=options[(turn+i)%options.length];if(!recent.includes(option))return option;}
 return options[turn%options.length];
}
export function contextualReply(a,event,fallback='',message=''){
 const item=items[a.scheme]||'a proposta';
 if(event==='question'){
  const t=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/onde.*mora|endereco|telefone pessoal|sua senha/.test(t))return variedReply(a,'private-question',['Não vou passar meus dados pessoais nessa conversa. Qual é a relação disso com a proposta?','Esse dado fica comigo. Podemos falar das condições da oferta?']);
  if(/quem (?:e|organizou)|de onde/.test(t)&&a.facts?.claims?.origin)return `Você disse que foi ${a.facts.claims.origin}. Ainda não confirmei essa informação por outro canal.`;
  if(/como funciona|por que|porque voce/.test(t))return `É isso que quero entender com você: ${questions[a.scheme]?.[0]||'como funciona a proposta?'}`;
  return variedReply(a,'question-'+a.scheme,questions[a.scheme]||[fallback]);
 }
 if(event==='answer'){
  const next=a.scheme==='link'?'Pode mandar a página para eu olhar.':a.scheme==='update'?'Vou olhar o pacote quando ele chegar.':'Qual seria a próxima etapa?';
  const byCaller={nino:['Ah, agora entendi. '+next,'Beleza, acompanhei essa parte. '+next],olga:['Certo, meu bem. '+next,'Entendi sua explicação. '+next],bento:['Ah, saquei. '+next,'Tá, agora fez sentido. '+next],yara:['Entendi. '+next,'Beleza, essa parte ficou clara. '+next],davi:['Entendi a explicação. Ainda quero conferir a origem.','A proposta ficou clara. Isso ainda não confirma quem está oferecendo.'],pri:['Anotei essa condição. Quero comparar com o que você disse antes.','Essa parte ficou clara. Vou acompanhar se as condições mudam.']};
  return variedReply(a,'answer',byCaller[a.caller]||[next]);
 }
 if(event==='refuse')return variedReply(a,'refuse',[
  `Ainda não vou liberar ${item}. Falta esclarecer a origem da proposta.`,
  `Antes de decidir sobre ${item}, preciso entender quem oferece isso.`,
  `Segura um pouco. Entendi a oferta, mas ainda tenho dúvida sobre ${item}.`
 ]);
 if(event==='unclear'){
  let missing='Qual é a oferta que você está trazendo?';
  if(a.stage==='question')missing=questions[a.scheme]?.[0]||'De onde veio a proposta?';
  if(a.stage==='request'){
   missing=a.scheme==='update'?'Você está pedindo para eu instalar o arquivo?':`Você está pedindo ${item}?`;
   if(a.scheme==='link')missing=!a.linkSent?'Qual página? Ainda não recebi o link.':a.linkOpened?'A página abriu. Você está pedindo que eu envie o cadastro?':'Você quer que eu abra a página que mandou?';
  }
  return variedReply(a,'unclear-'+a.stage,[`Me perdi nessa parte. ${missing}`,`Não consegui ligar isso ao que estamos conversando. ${missing}`,`Explica só essa parte para mim: ${missing}`]);
 }
 if(event==='repeat')return variedReply(a,'repeat',['Oi de novo! Pode continuar de onde parou.','Estou aqui. Qual parte da proposta você queria explicar?','Já estamos conversando. Pode ir para o que você queria falar.']);
 if(event==='after'){
  const facts=a.scheme==='link'?'Eu já enviei o cadastro da página.':a.scheme==='update'?'Eu já instalei o pacote de skins.':a.scheme==='support'?'A sessão do PãoOS já está aberta.':a.scheme==='club'?'Eu já enviei o passe do clube.':'Eu já enviei o identificador BatataPay.';
  return variedReply(a,'after',[facts+' Ainda não recebi a confirmação da operação.',facts+' Não enviei nenhum dado novo nessa mensagem.',facts+' O restante precisa ser concluído no app.']);
 }
 if(event==='continued')return variedReply(a,'continued',[`Entendi essa explicação. O que você quer fazer com ${item}?`,`Essa parte ficou clara. Falta o pedido sobre ${item}.`,`Certo. Você já explicou a oferta; qual ação está pedindo?`]);
 if(event==='opened')return variedReply(a,'opened',['A página já abriu. Não preenchi nem enviei o cadastro.','Estou vendo a página, mas os campos continuam vazios.','Abrir eu já abri. Ainda não mandei meu cartão por esse cadastro.']);
 if(event==='duplicate-answer'&&a.facts?.question?.status==='explained')return variedReply(a,'duplicate-explained',['Essa condição já ficou clara. Repetir não confirma a origem.',`Você já explicou essa parte. Ainda não autorizei ${item}.`]);
 if(event==='duplicate-answer')return variedReply(a,'duplicate-answer',['Essa explicação já chegou. O que faltou foi esclarecer a origem.','Você repetiu o que já contou. Preciso de um detalhe que ainda não explicou.','Li essa parte antes. Repetir não resolve a dúvida que ficou.']);
 if(event==='offtopic'){
  const byCaller={nino:['Me perdi nessa mudança de assunto. Você ia explicar o concurso, né?','Podemos voltar à oferta? Não entendi a ligação entre as duas coisas.'],olga:['Meu bem, isso é outra conversa. Vamos terminar de entender a oferta?','Podemos falar disso depois. Quero entender o que você veio oferecer.'],davi:['Esse assunto não explica a proposta. Qual é a relação entre eles?','Vamos retomar a condição que ficou pendente.'],yara:['Isso é assunto para outra reunião do clube. Qual era a proposta?','Mudamos de assunto. Vamos retomar o convite?'],pri:['São assuntos diferentes. Como isso se relaciona à oferta?','Ainda estou comparando as condições que você apresentou.'],bento:['Mudamos de roteiro? Volta na proposta que eu me perdi.','Esse assunto pode esperar. O que você queria oferecer?']};
  return variedReply(a,'offtopic',byCaller[a.caller]);
 }
 return fallback;
}
