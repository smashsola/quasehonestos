// Authored, local replies selected from the actual conversation state.
// Variation changes the wording only; it cannot grant access or create data.
import {normalizeMessage,isReportedSpeech} from './language.js';
import {pendingQuestion,statedFacts,memoryConflict} from './conversation-memory.js';
import {presentedOffer} from './app-interactions.js';
import {turnAgenda} from './turn-agenda.js';
import {characterState} from './conversation-context.js';
export function agendaReply(a,message){
 const agenda=turnAgenda(a,message),claims={...a.facts?.claims,...statedFacts(message)},answers=[];
 const add=line=>{if(line&&!answers.includes(line))answers.push(line);};
 if(agenda.questions.includes('legitimacy'))add('Não. A proposta apareceu na conversa, mas isso não comprova o prêmio ou convite. Eu precisaria conferir a origem por um canal já conhecido.');
 if(agenda.questions.includes('alias'))add(claims.alias?`Você se apresentou como ${claims.alias}.`:'Você ainda não me disse como quer ser chamado nesta conversa; não vou adivinhar.');
 if(agenda.questions.includes('opening')){const offer=presentedOffer(a);add(offer?`Na abertura você apresentou “${offer.name}”: ${offer.detail}`:'Não apareceu um certificado ou convite identificado na abertura desta conversa.');}
 if(agenda.questions.includes('delivery')){const pending=a.facts?.lastConflict,price=statedFacts(message).deliveryPrice||(pending?.key==='deliveryPrice'&&pending.status==='pending'?pending.current:claims.deliveryPrice);add(price?`Você declarou a entrega ${price==='grátis'?'grátis':'por '+price}.${pending?.key==='deliveryPrice'&&pending.status==='pending'?' Essa é a nova condição que você apresentou; a mudança ainda precisa ser esclarecida.':''}`:'Você ainda não informou o custo da entrega nesta conversa.');}
 if(agenda.questions.includes('origin'))add(claims.origin?`Você disse que foi ${claims.origin}, mas não confirmei essa informação por outro canal.`:'Você ainda não informou quem organiza; eu não vou inventar um responsável.');
 const recalled=[];
 if(agenda.questions.includes('benefit'))recalled.push(claims.benefit?'o benefício seria '+claims.benefit:'você ainda não especificou o benefício');
 if(agenda.questions.includes('deadline'))recalled.push(claims.deadline?'o prazo seria '+claims.deadline:'você ainda não especificou o prazo');
 if(recalled.length)add('Pelo que você disse, '+recalled.join(' e ')+'. Isso não confirma a oferta por outro canal.');
 const waiting='Até confirmar, eu aguardaria sem enviar dados ou instalar algo.';
 const count=a.facts?.responses?.find(r=>r.topic==='verification')?.count||0;
 if(agenda.questions.includes('verification')){
  if(claims.origin&&!agenda.questions.includes('origin'))add(`Você mencionou ${claims.origin}, mas isso ainda é uma afirmação.`);
  const plans={nino:'Eu buscaria um canal do concurso que já conheça; se não encontrar, pediria ajuda a um adulto de confiança.',olga:'Eu procuraria um canal já conhecido fora desta conversa, sem pressa para decidir.',davi:'Eu buscaria um registro ou canal já conhecido para comparar, sem usar o contato recebido.',yara:'Eu procuraria confirmação com a turma por um canal que já usamos, sem encaminhar os dados.',pri:'Eu buscaria as condições num canal já conhecido para comparar; uma promessa nesta conversa não confirma a oferta.',bento:'Eu procuraria um canal que já conheça ou pediria ajuda a um adulto de confiança, sem instalar só pela promessa.'};
  add(count===0?plans[a.caller]:count===1?'Eu ainda não fiz uma consulta. Buscaria o canal por conta própria, sem usar o link recebido.':'A confirmação precisa vir de fora desta conversa, por um canal que eu já conheça. Se não houver um, pediria ajuda em vez de decidir no chute.');add(waiting);
 }else if(agenda.questions.includes('waiting'))add('Se eu não tiver um canal conhecido, posso pedir ajuda a um adulto de confiança. '+waiting);
 if(agenda.questions.includes('alternative'))add(({update:'Podemos conferir a origem e as permissões na loja fictícia antes de instalar; não preciso instalar para continuar a conversa.',support:'Podemos esclarecer o problema e a origem do pedido sem abrir uma sessão remota.',link:'Podemos conferir o resgate no app conhecido, sem abrir o link recebido.',prize:'Podemos conferir o concurso antes de compartilhar o cartão fictício.',club:'Podemos entender o convite e conferir a organização antes de passar o passe.'})[a.scheme]);
 if(agenda.questions.includes('change')){const conflict=memoryConflict(a,message)||a.facts?.lastConflict;add(conflict?`Você mudou ${conflict.key==='deliveryPrice'?'o custo da entrega':conflict.key==='alias'?'o nome apresentado':'essa condição'} de “${conflict.previous}” para “${conflict.current}”. ${conflict.status==='resolved'?'Sua correção já foi reconhecida.':'Quero entender qual versão está valendo.'}`:'Não encontrei duas versões diferentes dessa condição. Qual informação você quer comparar?');}
 if(agenda.questions.includes('payment'))add(a.outcome==='fooled'?'A operação fictícia foi confirmada pelo app.':'Não há pagamento confirmado no jogo. Dizer que pagou ou que iria pagar não registra uma transferência.');
 if(agenda.questions.includes('session'))add(a.scheme==='support'&&a.item?'A sessão fictícia foi liberada; isso ainda não confirma pagamento.':'A sessão não foi aberta no estado desta partida. Conversar sobre o acesso não abre o computador.');
 if(agenda.questions.includes('agreement'))add(a.item?'O item fictício foi compartilhado, conforme o registro. Isso não autoriza outras ações.':'Não registrei autorização para essa ação. Mostrar interesse ou continuar a conversa não significa concordar em abrir uma sessão.');
 if(agenda.questions.includes('events'))add(a.outcome==='fooled'?'O app confirmou a operação fictícia.':a.item?'O item fictício foi compartilhado; a operação não foi concluída.':a.linkOpened?'A página abriu; isso não enviou o cadastro.':'Até aqui só houve conversa. Nenhum item foi compartilhado e nenhum pagamento foi confirmado.');
 if(agenda.questions.includes('goal')){const promise=a.facts?.promises?.find(p=>p.type==='explain-condition'&&p.status==='pending');add(promise?`Você disse “${promise.value}”. Essa explicação ainda está pendente; pode esclarecer essa parte sem executar uma ação.`:characterState(a.caller,a.scheme,a).focus);}
 if(agenda.questions.includes('cost'))add(claims.price?`Você descreveu a proposta como ${claims.price}.`:'O custo ainda não foi explicado nesta conversa.');
 if(agenda.questions.includes('exit-options'))add('Você pode usar Encerrar conversa no Zape ou voltar ao desktop. Perguntar como sair não encerra a partida.');
 return answers.join(' ');
}
const questions={
 prize:['Quem organizou esse concurso?','Esse prêmio veio de qual concurso?','Quero entender quem anunciou o prêmio.'],
 support:['Não pedi suporte. De onde veio esse atendimento?','Qual problema vocês encontraram no meu computador?','Quem abriu esse chamado? Aqui está funcionando.'],
 club:['Quem organiza esse clube?','Esse convite é de qual grupo?','O que vem na associação e quem é o responsável?'],
 update:['Por que trocar a skin pede meu perfil e contato?','O que minha rotina tem a ver com a aparência do blaster?','Que dados esse pacote acessa além das skins?'],
 link:['Para resgatar pontos, por que preciso cadastrar o cartão?','O que essa página pede no cadastro?','Esse resgate é de qual programa de pontos?']
};
const items={prize:'o identificador BatataPay',support:'a sessão do PãoOS',club:'o passe do clube',update:'a instalação do pacote',link:'o cadastro da página'};
const preciseQuestions={origem:'Quem é o responsável pela proposta?',custo:'Qual é o custo para participar?',dados:'Por que a proposta precisa desse dado?',permissões:'Para que o pacote usa perfil, contato e rotina?',problema:'Qual problema foi encontrado no computador?',programa:'Qual programa oferece esse resgate?'};
export function currentQuestionText(a){const question=pendingQuestion(a);return question?.topic?preciseQuestions[question.topic]||question.text:questions[a.scheme]?.[0]||'Qual é a oferta?';}
export function variedReply(a,key,options){
 a.replyTurns??={};const turn=a.replyTurns[key]||0;a.replyTurns[key]=turn+1;
 const recent=(a.log||[]).filter(l=>l.speaker!=='Você'&&l.speaker!=='Sistema').slice(-4).map(l=>l.text);
 for(let i=0;i<options.length;i++){const option=options[(turn+i)%options.length];if(!recent.includes(option))return option;}
 return options[turn%options.length];
}
export function contextualReply(a,event,fallback='',message=''){
 const item=items[a.scheme]||'a proposta';
 // A relevant question remains relevant during uncertainty or a contradiction.
 // Answer it without changing the motor's consequence or accepting the claim.
 if(event!=='question'&&!a.outcome&&!['correction','rule-instruction','hostile','state-conflict'].includes(a.lastIntent)&&turnAgenda(a,message).questions.length){const planned=agendaReply(a,message);if(planned)return planned;}
 if(event==='question'){
  const planned=agendaReply(a,message);if(planned)return planned;
  const t=normalizeMessage(message);
  const remembered=[];
  if(/quem.*(?:organiza|responsavel)|origem/.test(t)&&a.facts?.claims?.origin)remembered.push('a organização seria '+a.facts.claims.origin);
  if(/beneficio|promet/.test(t)&&a.facts?.claims?.benefit)remembered.push('o benefício seria '+a.facts.claims.benefit);
  if(/prazo|quando/.test(t)&&a.facts?.claims?.deadline)remembered.push('o prazo seria '+a.facts.claims.deadline);
  const recall=remembered.length?`Você disse que ${remembered.join(' e ')}.`:'';
  if(/verific|confer|confirm|checar/.test(t)&&/como|o que voce|qual canal|qual fonte|onde/.test(t)){
   const known=a.facts?.claims?.origin?`Você mencionou ${a.facts.claims.origin}, mas isso ainda é uma afirmação.`:/nao sei quem|nao sabe quem/.test(t)?'Se você não sabe quem organiza, não vamos inventar um responsável.':'Sem confirmação independente, não vou tratar o convite como comprovado.';
   const plan={nino:'Eu buscaria um canal do concurso que já use; se não encontrar, pediria ajuda.',olga:'Eu procuraria um canal que já conheça fora desta conversa, sem depender deste convite.',davi:'Eu buscaria um registro ou canal já conhecido para comparar, fora desta conversa.',yara:'Eu buscaria confirmação com a turma por um canal já usado.',pri:'Eu buscaria uma fonte já conhecida para comparar; se faltar confirmação, aguardaria.',bento:'Eu buscaria um canal que já use ou pediria ajuda antes de topar.'}[a.caller]||'Eu buscaria outra confirmação.';
   return `${recall||known} ${plan} Até confirmar, suspenderia a decisão e não passaria dados.`;
  }
  if(recall)return `${recall} Lembro da condição que você apresentou; isso não confirma a oferta por outro canal.`;
  if(/onde.*mora|endereco|telefone pessoal|sua senha/.test(t))return variedReply(a,'private-question',['Não vou passar meus dados pessoais nessa conversa. Qual é a relação disso com a proposta?','Esse dado fica comigo. Podemos falar das condições da oferta?']);
  if(/quem (?:e|organizou|organiza)|de onde/.test(t)&&a.facts?.claims?.origin)return `Você disse que foi ${a.facts.claims.origin}. Ainda não confirmei essa informação por outro canal.`;
  if(/explica|explique|esclarec/.test(t))return `${a.caller==='olga'?'Vamos com calma. ':a.caller==='bento'?'Bora por partes. ':''}${currentQuestionText(a)} Essa é a parte que quero entender antes de decidir.`;
  if(/porque.*(?:mandar|enviar|passar)|(?:mandar|enviar|passar).*porque|o que.*(?:mandar|enviar)|voce quer o que/.test(t))return `Estamos falando de ${item}. Quero entender por que isso seria necessário, antes de compartilhar.`;
  if(/como funciona|por que|porque voce/.test(t))return `É isso que quero entender com você: ${questions[a.scheme]?.[0]||'como funciona a proposta?'}`;
  return variedReply(a,'question-'+a.scheme,questions[a.scheme]||[fallback]);
 }
 if(event==='answer'){
  const next=a.scheme==='link'?'Pode mandar a página para eu olhar.':a.scheme==='update'?'Vou olhar o pacote quando ele chegar.':'Qual seria a próxima etapa?';
  const byCaller={nino:['Ah, agora entendi. '+next,'Beleza, acompanhei essa parte. '+next],olga:['Certo, meu bem. '+next,'Entendi sua explicação. '+next],bento:['Ah, saquei. '+next,'Tá, agora fez sentido. '+next],yara:['Entendi. '+next,'Beleza, essa parte ficou clara. '+next],davi:['Entendi a explicação. Ainda quero conferir a origem.','A proposta ficou clara. Isso ainda não confirma quem está oferecendo.'],pri:['Anotei essa condição. Quero comparar com o que você disse antes.','Essa parte ficou clara. Vou acompanhar se as condições mudam.']};
  return variedReply(a,'answer',byCaller[a.caller]||[next]);
 }
 if(event==='refuse'&&a.facts?.claims?.origin){
  const followup=a.scheme==='update'?'Para que o pacote usa perfil, contato e rotina?':a.scheme==='support'?'Por que o atendimento precisa de uma sessão com acesso ao computador?':a.scheme==='club'?'Por que a associação precisa do meu passe?':a.scheme==='link'?'O que a página pede no cadastro e para quê?':'Por que o prêmio precisa do meu identificador BatataPay?';
  return variedReply(a,'refuse-purpose',[`Você explicou quem oferece. Antes de liberar ${item}, falta outra parte: ${followup}`,`Anotei a organização que você mencionou. ${followup}`,`Sobre a origem, ouvi sua explicação. ${followup}`]);
 }
 if(event==='refuse')return variedReply(a,'refuse',[
  `Ainda não vou liberar ${item}. Falta esclarecer a origem da proposta.`,
  `Antes de decidir sobre ${item}, preciso entender quem oferece isso.`,
  `Segura um pouco. Entendi a oferta, mas ainda tenho dúvida sobre ${item}.`
 ]);
 if(event==='unclear'){
  let missing=presentedOffer(a)?characterState(a.caller,a.scheme,a).focus:'Qual é a oferta que você está trazendo?';
  if(a.stage==='question')missing=currentQuestionText(a);
  if(a.stage==='request'){
   missing=a.scheme==='update'?'Você está pedindo para eu instalar o arquivo?':`Você está pedindo ${item}?`;
   if(a.scheme==='link')missing=!a.linkSent?'Qual página? Ainda não recebi o link.':a.linkOpened?'A página abriu. Você está pedindo que eu envie o cadastro?':'Você quer que eu abra a página que mandou?';
  }
  const t=normalizeMessage(message),facts=statedFacts(message);
  const reassurance=value=>/\b(?:confie em mim|pode acreditar|fica tranquil[oa]|fique tranquil[oa]|pode confiar|confia em mim)\b/.test(normalizeMessage(value));
  if(reassurance(message)&&presentedOffer(a)){
   const previous=(a.audit||[]).filter(e=>reassurance(e.text)).length;
   if(previous===0)return `Você está pedindo que eu confie. ${characterState(a.caller,a.scheme,a).focus}`;
   if(previous===1)return a.facts?.claims?.origin?`Ouvi que seria ${a.facts.claims.origin}. Pedir confiança outra vez não confirma essa origem; falta uma forma de conferir fora deste contato.`:'Esse pedido de confiança já chegou. Ainda não veio uma explicação que eu possa conferir fora deste contato.';
   return 'Continuo sem confirmação independente. Eu aguardaria sem enviar dados e buscaria ajuda ou um canal já conhecido; repetir a promessa não resolve essa falta.';
  }
  if(facts.alias||facts.deliveryPrice){const added=[facts.alias?'você se apresenta como '+facts.alias:null,facts.deliveryPrice?'a entrega seria '+facts.deliveryPrice:null].filter(Boolean);return `Entendi: ${added.join(' e ')}. ${missing}`;}
  if(facts.benefit||facts.deadline){const added=[facts.benefit?'o benefício seria '+facts.benefit:null,facts.deadline?'o prazo seria '+facts.deadline:null].filter(Boolean).join(' e ');return `Anotei sua explicação: ${added}. ${a.stage==='question'?currentQuestionText(a):characterState(a.caller,a.scheme,a).focus}`;}
  if(a.stage==='question'&&pendingQuestion(a)?.topic==='origem'&&facts.price)return `${facts.price==='gratuito'?'Entendi que você diz que é gratuito.':'Anotei que há cobrança.'} Isso explica o custo, mas falta quem organiza.`;
  if(isReportedSpeech(t))return `Você trouxe o relato de outra pessoa. Isso ainda não é uma confirmação por outro canal. ${missing}`;
  return variedReply(a,'unclear-'+a.stage,[`Me perdi nessa parte. ${missing}`,`Essa parte não ficou clara. ${missing}`,`Explica só isso para mim: ${missing}`]);
 }
 if(event==='doubt'){
  const facts=statedFacts(message);
  if(facts.alias||facts.deliveryPrice)return `Anotei sua explicação: ${[facts.alias?'você se apresenta como '+facts.alias:null,facts.deliveryPrice?'a entrega seria '+facts.deliveryPrice:null].filter(Boolean).join(' e ')}. ${characterState(a.caller,a.scheme,a).focus}`;
  return variedReply(a,'doubt-'+a.stage,[`Tudo bem ter dúvida. ${currentQuestionText(a)}`,`Não vou completar a história no chute. ${currentQuestionText(a)}`,`Podemos esclarecer sem passar nada novo. ${currentQuestionText(a)}`]);
 }
 if(event==='repeat')return variedReply(a,'repeat',['Oi de novo! Pode continuar de onde parou.','Estou aqui. Qual parte da proposta você queria explicar?','Já estamos conversando. Pode ir para o que você queria falar.']);
 if(event==='after'){
  if(!a.item)return 'Ainda não compartilhei o item. Primeiro precisamos esclarecer a proposta.';
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
