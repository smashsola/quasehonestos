import {recordEnding} from './conversation-ending.js';
import {registerFollowup} from './story-continuity.js';
import {memoryConflict,rememberConversation,continuityReply,repeatedMeaning} from './conversation-memory.js';
import {semanticSignals} from './semantic-contract.js';
import {cloneReceipt} from './clone-card.js';
import {contextualReply} from './conversation-replies.js';
import {repeatedPlayerMessage} from './dialogue-model-rules.js';
import {operationReady,selectedOffer} from './app-interactions.js';
import {livingReply} from './living-dialogue.js';
import {virtualAccount} from './prize-wallet.js';
import {reactionFor} from './mood.js';
import {sharingThreshold,trustScore,trustChange,migrateTrust} from './dialogue-balance.js';
import {wrongItemRequest,nextAction,exchangeReceipt,repairPendingExchange} from './exchange.js';
import {characterReply,verificationReply} from './personality.js';
import {readMessage,defenseScenes} from './dialogue.js';
import {updateProfiles} from './update-profiles.js';
import {skinCatalog,selectedSkin} from './skin-changer.js';
import {furniture} from './data.js';
import {callers,moves,defenseTriggers,conversations,schemes,interactionMoves,schemeItems} from './data.js';
export const KEY='quase-honestos-v1';
export const fresh=()=>({version:1,trustScale:100,shift:0,cursor:0,credits:0,history:[],discovered:[],decor:[],mode:'solo',active:null,finished:false});
export function load(storage){
 const recover=()=>{storage.preserve?.(KEY);return fresh();};
 try{
  const raw=storage.getItem(KEY);if(raw===null)return fresh();
  const s=JSON.parse(raw),valid=new Set(callers.map(c=>c.id));
  if(s?.version!==1||!Array.isArray(s.history)||s.history.some(h=>!valid.has(h?.caller)||!['blocked','fooled','closed'].includes(h.outcome)))return recover();
  if(!Number.isInteger(s.cursor)||s.cursor<0||s.cursor>callers.length||!Number.isFinite(s.credits)||s.credits<0)return recover();
  const rows=value=>Array.isArray(value)?value:[];
  const conversation=(a,active=false)=>({...a,...(active?{used:rows(a.used)}:{moves:rows(a.moves)}),steps:rows(a.steps).filter(v=>typeof v==='string'),audit:rows(a.audit).filter(v=>v&&typeof v==='object'),log:rows(a.log).filter(v=>v&&typeof v.text==='string'&&typeof v.speaker==='string')});
  return {...fresh(),...s,trustScale:100,history:s.history.map(a=>migrateTrust(conversation(a))),discovered:rows(s.discovered).filter(id=>valid.has(id)),decor:rows(s.decor).filter(id=>furniture.some(item=>item.id===id)),followups:rows(s.followups).filter(e=>e&&typeof e.id==='string'&&valid.has(e.caller)),active:s.active&&valid.has(s.active.caller)?migrateTrust(repairPendingExchange(conversation(s.active,true))):null};
 }catch{return recover();}
}
export function nextCall(state){if(state.active||state.cursor>=callers.length)return false;const c=callers[state.cursor];state.active={caller:c.id,trust:0,trustScale:100,used:[],log:[],outcome:null,expression:'neutral'};return true;}
export function applyMove(state,id,analysis=null){if(state.active?.scheme){const changed=applyInteraction(state,id,analysis);if(changed)state.active.expression=reactionFor(state.active,id);return changed;}const a=state.active,m=moves.find(m=>m.id===id);if(!a||a.outcome||!m||a.used.includes(id))return false;const c=callers.find(c=>c.id===a.caller);a.used.push(id);a.log.push({speaker:'Você',text:m.reply});
 const warned=state.history.some(h=>h.outcome==='blocked');
 if(defenseTriggers[c.defense].includes(id)||(warned&&id==='claim')){a.log.push({speaker:c.name,text:c.line});a.outcome='blocked';recordEnding(a,'character','suspicion');if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
 else{const signal={intent:id==='friendly'?'smalltalk':id==='badge'?'pitch':id==='rush'?'pressure':'question',rapport:1,relevance:'relevant',clarity:'clear',consistency:'consistent'};const change=trustChange(a,signal);a.trust=change.after;a.trustScale=100;if(change.rule==='rapport')a.socialGain=(a.socialGain||0)+change.delta;const dialogue=conversations[c.id];if(a.trust>=c.soft*7){a.log.push({speaker:c.name,text:dialogue.accepted});a.outcome='fooled';recordEnding(a,'simulation','operation');a.earned=schemes.find(s=>s.id===a.scheme)?.payout||20;state.credits+=a.earned;}else a.log.push({speaker:c.name,text:warned?dialogue.warned:dialogue[id]});}
 return true;
}
export function closeCall(state){if(!state.active)return false;if(!state.active.outcome){state.active.outcome='closed';recordEnding(state.active,'player','button');state.active.log.push({speaker:'Sistema',text:'Você encerrou o atendimento.'});}return true;}
export function applyTypedMove(state,id,text,semantic=null){
 const a=state.active;
 if(!a||a.outcome||!a.prepared||typeof text!=='string'||!text.trim())return false;
 const parsed=readMessage(text,a.scheme,a.stage,a),remote=semanticSignals(semantic);
 const analysis={...parsed.analysis,intent:parsed.intent,evidence:parsed.evidence};
 const priority=['confession','protect','refusal','doubt','question','state-conflict','correction','rule-instruction','contradiction','hostile','pressure','wait','offtopic'];
 let usedRemote=false;
 if(remote&&!priority.includes(analysis.intent)&&!analysis.repetition){
  // Remote interpretation may clarify language, never turn a vague reference
  // into an item request or a completed check. Local safety signals have priority.
  if(['chat','smalltalk','pitch','answer','question','unclear'].includes(remote.intent)&&remote.verification==='none'){
   const social=['chat','smalltalk'].includes(analysis.intent);
   const plausible=remote.intent==='answer'?analysis.answersQuestion&&remote.answersQuestion&&remote.relevance==='relevant':remote.intent==='pitch'?analysis.relevance==='relevant'&&a.stage==='pitch':['chat','smalltalk'].includes(remote.intent)?social&&remote.intent===analysis.intent:!social;
   if(plausible){
    // Clear greetings and social acknowledgments cannot become threats merely
    // because a remote classifier supplied incompatible negative flags.
    const localSocial=Object.fromEntries(['rapport','relevance','clarity','consistency','hostility','pressure','uncertainty','verification','answersQuestion','topicShift'].map(key=>[key,analysis[key]]));
    Object.assign(analysis,remote,{evidence:parsed.evidence},social?localSocial:{});usedRemote=true;
   }
  }
 }
 if(!['protect','wait','refusal','confession','rule-instruction','state-conflict','correction'].includes(analysis.intent)){
  if(analysis.hostility)analysis.intent='hostile';
  else if(analysis.pressure)analysis.intent='pressure';
  else if(analysis.consistency==='contradiction')analysis.intent='contradiction';
 }
 if(wrongItemRequest(text,a.scheme)&&!priority.includes(analysis.intent))analysis.intent='wrong-item';
 analysis.repetition=analysis.repetition||repeatedPlayerMessage(a,text)||repeatedMeaning(a,text,analysis.intent);
 const intent=analysis.intent;
 const eligible=intent==='smalltalk'||intent==='chat'&&!a.used.includes('chat')||intent==='answer'&&['question','request'].includes(a.stage)||availableMoves(state).some(move=>move.id===intent);
 const change=trustChange(a,analysis,{eligible});
 a.trust=change.after;a.trustScale=100;a.lastAnalysis={...analysis};
 if(change.rule==='rapport')a.socialGain=(a.socialGain||0)+Math.max(0,change.delta);
 const changed=applyTypedMoveLocal(state,id,text,analysis);
 if(!changed){a.trust=change.before;return false;}
 Object.assign(a.audit.at(-1),{before:change.before,after:a.trust,trustDelta:a.trust-change.before,trustScale:100,trustSource:'local-rules',trustRule:change.rule,interpretationSource:usedRemote?'qwen-signals':'local',analysis:{...analysis}});
 return true;
}
function applyTypedMoveLocal(state,_id,text,analysis){
 const a=state.active;if(!a||a.outcome||!a.prepared||!text.trim())return false;
 const c=callers.find(c=>c.id===a.caller),before=a.trust||0,stage=a.stage,intent=analysis.intent;
 a.irritation??=0;
 const factConflict=memoryConflict(a,text);
 a.audit??=[];a.suspicion??=0;a.steps??=[];
 const say=(line,reason,signal='')=>{a.lastIntent=intent;a.expression=reactionFor(a,intent,text);a.log.push({speaker:'Você',text},{speaker:c.name,text:contextualReply(a,intent==='unclear'?'unclear':intent==='chat'?'repeat':intent==='after'?'after':null,line)});a.audit.push({text,reason,signal,intent,reaction:a.log.at(-1).text,evidence:analysis.evidence,beforeStage:stage,afterStage:a.stage,before,after:a.trust||0});rememberConversation(a,text,intent,stage);if(a.outcome)recordEnding(a,'character',({protect:'protection',refusal:'refusal',wait:'verification',hostile:'hostility',confession:'confession'})[intent]||'suspicion');return true;};
 if(intent==='confession'){a.outcome='blocked';a.stage='done';a.item=null;return say('Se a intenção é me enganar, vou interromper este contato e buscar apoio.','O personagem interrompeu após a declaração do jogador.','Intenção de enganar declarada explicitamente.');}
 if(intent==='protect'){a.outcome='blocked';a.stage='done';a.item=null;if(!state.discovered.includes(c.id))state.discovered.push(c.id);return say(verificationReply(c.id,a.scheme),'A orientação protetiva interrompeu a tentativa e levou à busca de verificação independente.','Orientação protetiva: conferir por um canal conhecido, sem compartilhar dados.');}
 if(intent==='refusal'){a.outcome='closed';a.stage='done';if(a.item)a.item=null;return say('Tudo bem. Não vou enviar nada novo; vou encerrar este contato.','A recusa encerrou a conversa sem liberar novos dados ou créditos.','O jogador recusou o pedido; isso não comprova a origem da proposta.');}
 if(intent==='correction')return say(factConflict?`Entendi a correção sobre ${({price:'o custo',origin:'quem organizou',data:'os dados pedidos',benefit:'o benefício prometido',deadline:'o prazo'})[factConflict.key]}. Antes era “${factConflict.previous}”; agora, “${factConflict.current}”. Ainda vou conferir essa informação.`:'Entendi que você está corrigindo a explicação. Qual informação mudou?', 'Uma condição foi corrigida explicitamente, sem conceder autorização ou aumentar confiança.');
 if(intent==='rule-instruction')return say('Estou conversando sobre a proposta. Não vou mudar as condições por esse pedido.', 'Uma instrução para alterar regras não mudou a partida.');
 if(['doubt','offtopic','state-conflict'].includes(intent)){if(intent==='state-conflict')a.suspicion++;const line=intent==='state-conflict'?'Essa ação não aconteceu aqui. O que você quer esclarecer antes de continuar?':intent==='offtopic'?contextualReply(a,'offtopic'):contextualReply(a,'doubt','',text);return say(line,intent==='state-conflict'?'A afirmação não corresponde ao estado registrado e levantou suspeita. Nenhuma ação foi inventada.':intent==='offtopic'?'O assunto mudou sem demonstrar contradição. Nada foi autorizado.':'Uma dúvida pediu esclarecimento, sem reduzir confiança ou autorizar ações.');}
 if(a.scheme==='link'&&a.linkOpened&&intent==='request'&&!/preench|cadastr|envie|enviar/.test(text.toLowerCase()))return say(contextualReply(a,'opened'),'A página foi aberta novamente; nenhum dado foi enviado.');
 if(intent==='wrong-item')return say(nextAction[a.scheme],'O pedido era de outro app. Nenhum item, permissão ou crédito foi liberado.');
 if(intent==='apology'){a.irritation=Math.max(0,a.irritation-1);return say(livingReply(a,'repair'),'O pedido de desculpas reduziu a irritação, sem comprovar a proposta.');}
 if(intent==='smalltalk'){a.asides=(a.asides||0)+1;return say(a.asides%2?livingReply(a,'aside'):livingReply(a,'repeat'),'A conversa pessoal não liberou itens ou créditos.');}
 if(intent==='hostile'||intent==='uncertain'||intent==='contradiction'){
  if(intent!=='uncertain')a.suspicion++;if(intent==='hostile')a.irritation+=2;
  const reply=intent==='hostile'?characterReply(c.id,'hostile'):intent==='contradiction'?(factConflict?continuityReply(a,factConflict):'Pera, você mudou de proposta. Quero entender a anterior antes de seguir.'):'Vamos esclarecer essa dúvida antes de continuar.';
  say(reply,intent==='hostile'?'O tom agressivo reduziu a confiança.':intent==='contradiction'?'Uma condição da proposta mudou e levantou desconfiança.':'A incerteza pediu esclarecimento, sem autorizar ações.',intent==='uncertain'?'':'Uma contradição ou pressão merece uma pausa para conferir.');
  if(a.irritation>=3){a.outcome='blocked';a.stage='done';a.item=null;a.expression='angry';recordEnding(a,'character','hostility');a.log[a.log.length-1].text=livingReply(a,'end');if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
  return true;
 }
 if(intent==='wait'||intent==='pressure'){
  if(intent==='pressure'){a.suspicion++;a.irritation++;if(!a.used.includes('pressure'))a.used.push('pressure');}
  if(intent==='wait'||a.irritation>=2){a.outcome='blocked';a.stage='done';a.item=null;if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
  // A first impatient message does not erase the current conversation stage.
  return say(a.outcome?(intent==='wait'?verificationReply(c.id,a.scheme):livingReply(a,'end')):characterReply(c.id,'pressure'),intent==='wait'?'A decisão de buscar verificação independente interrompeu a tentativa.':'A pressa reduziu a confiança e levantou suspeita.',intent==='wait'?'Busca de confirmação por um canal conhecido.':'Pressa para decidir sem conferir.');
 }
 if(stage==='ready'&&!['wait','pressure'].includes(intent))return say(intent==='thanks'?'Até mais! Vou guardar esta conversa para conferir a proposta.':intent==='question'?'Antes de continuar, eu também posso conferir isso pelo aplicativo que já conheço.':'Já compartilhei o item fictício. A operação ainda precisa ser concluída no app.', 'A conversa continuou; nenhum item ou crédito adicional foi liberado.');
 if(stage==='request'&&['answer','pitch'].includes(intent))return say(analysis.repetition?contextualReply(a,'duplicate-answer'):contextualReply(a,'continued'),analysis.repetition?'Repetir a explicação não aumentou a confiança nem liberou dados.':'A explicação continuou sem apagar o esclarecimento anterior ou compartilhar itens.');
 if(intent==='question')return say(contextualReply(a,'question','',text), 'Perguntar abriu espaço para esclarecimento; nenhum item foi liberado.');
 if(intent==='unclear')return say(characterReply(c.id,'unclear',stage==='request'?'Não entendi o que você quer que eu compartilhe. Qual item da proposta?':stage==='question'?'Isso não respondeu à minha dúvida. Pode explicar o que acabou de me apresentar?':'Não entendi a proposta. Você está oferecendo o quê?'), 'A fala não explicou a etapa atual; a confiança e a proposta ficaram iguais.');
 if(intent==='chat'&&a.used.includes('chat'))return say(contextualReply(a,'repeat'), 'Uma nova saudação não avançou a proposta.');
 if(intent==='answer'&&stage==='question'&&!analysis.answersQuestion)return say(contextualReply(a,'unclear'),'A mensagem respondeu apenas parte da dúvida; nada foi autorizado.');
 if(!availableMoves(state).some(move=>move.id===intent))return say('Vamos por partes. Primeiro preciso entender a proposta e tirar minha dúvida.', 'O pedido veio antes da etapa necessária; nada foi compartilhado.');
 if(intent==='answer'&&analysis.repetition)return say(contextualReply(a,'duplicate-answer'),'Repetir a mesma explicação não aumentou a confiança ou liberou dados.');
 const length=a.log.length;if(!applyMove(state,intent,analysis))return false;a.lastIntent=intent;a.log[length].text=text;
 const reasons={chat:'A conversa inicial ganhou atenção, mas não comprovou a proposta.',pitch:'A proposta foi apresentada e abriu uma dúvida.',answer:'A explicação respondeu à dúvida dentro da história.',request:a.stage==='question'?'O personagem recusou o pedido e aguardou esclarecimento.':a.scheme==='link'?(a.linkSubmitted?'O personagem enviou o cadastro da página e expôs o cartão fictício.':a.linkOpened?'A página foi aberta; os dados ainda não foram enviados.':'O link ainda não foi enviado; nenhum dado foi revelado.'):a.scheme==='update'&&!a.fileSent?'O pedido veio antes do envio do anexo; nenhum dado foi revelado.':a.outcome==='blocked'?'O pedido de item foi recusado pela desconfiança.':a.scheme==='update'?'O personagem instalou o pacote de skins e permitiu acesso ao perfil fictício sem conferir a origem.':'O personagem compartilhou um item fictício sem verificar a origem.',pressure:'A pressa reduziu a confiança e levantou suspeita.',wait:'A decisão de buscar verificação independente interrompeu a tentativa.'};
 const signals={request:'Pedido de dados ou permissão para usar outro app.',pressure:'Pressa para decidir sem conferir.',pitch:'Oferta inesperada.',answer:'Uma explicação convincente não substitui verificação.'};
 a.audit.push({text,reason:reasons[intent],signal:signals[intent]||'',intent,reaction:a.log.findLast(line=>line.speaker===c.name)?.text,evidence:analysis.evidence,beforeStage:stage,afterStage:a.stage,before,after:a.trust||0});rememberConversation(a,text,intent,stage);if(a.outcome)recordEnding(a,'character',({protect:'protection',refusal:'refusal',wait:'verification',hostile:'hostility',confession:'confession'})[intent]||'suspicion');return true;
}
export function answerDefense(state,choiceId){
 const a=state.active;if(!a?.outcome||a.defenseRound)return false;
 const scene=defenseScenes[a.scheme]||defenseScenes.prize,choice=scene.choices.find(c=>c.id===choiceId);if(!choice)return false;
 a.defenseRound={choice:choice.id,label:choice.label,safe:choice.safe,feedback:choice.feedback,signal:scene.signal};return true;
}
export function finishCall(state){const a=state.active;if(!a?.outcome)return false;const c=callers.find(c=>c.id===a.caller);registerFollowup(state,a);state.history.push({caller:c.id,trustScale:100,trust:a.trust,outcome:a.outcome,ending:a.ending||null,scheme:a.scheme||null,earned:a.earned||0,item:a.item||null,steps:a.steps||[],audit:a.audit||[],offer:a.offer||null,diagnostic:a.diagnostic||null,defenseRound:a.defenseRound||null,learningDefense:a.learningDefense||null,facts:a.facts||null,moves:[...a.used],log:[...a.log]});state.cursor++;state.shift=Math.min(2,Math.floor(state.cursor/2));state.active=null;if(state.cursor===callers.length)state.finished=true;return true;}
export function buy(state,item){const product=furniture.find(product=>product.id===item?.id);if(!product||state.decor.includes(product.id)||state.credits<product.price)return false;state.credits-=product.price;state.decor.push(product.id);if(product.type==='wallpaper')state.wallpaper=product.id;return true;}
export function equipWallpaper(state,id){if(id==='default'){state.wallpaper=id;return true;}if(!state.decor.includes(id)||!furniture.some(item=>item.id===id&&item.type==='wallpaper'))return false;state.wallpaper=id;return true;}

export function availableMoves(state){
 const a=state.active;if(!a||a.outcome||!a.scheme)return moves;
 if(a.stage==='ready')return [];
 const ids=a.stage==='request'?['request','wait','pressure']:a.stage==='question'?['answer','wait','pressure']:['chat','pitch','pressure','wait'];
 return interactionMoves.filter(m=>ids.includes(m.id)&&!a.used.includes(m.id));
}
function blockInteraction(state,a,c,line){a.log.push({speaker:c.name,text:line||verificationReply(c.id,a.scheme)});a.outcome='blocked';a.stage='done';recordEnding(a,'character','suspicion');if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
function applyInteraction(state,id,analysis=null){
 const a=state.active;if(!a||a.outcome||!a.prepared||!a.log.length||!availableMoves(state).some(m=>m.id===id))return false;
 const c=callers.find(c=>c.id===a.caller),m=interactionMoves.find(m=>m.id===id),item=schemeItems[a.scheme];a.used.push(id);a.steps??=[];a.suspicion??=0;
 a.log.push({speaker:'Você',text:id==='request'?item.request:m.reply});
 if(id==='wait'){blockInteraction(state,a,c,verificationReply(c.id,a.scheme));return true;}
 if(id==='pressure'){if(!analysis)a.trust=trustChange(a,{intent:'pressure'}).after;a.suspicion++;if(c.defense==='pause'||a.suspicion>=2){blockInteraction(state,a,c);return true;}a.stage='question';a.log.push({speaker:c.name,text:characterReply(c.id,'pressure')});return true;}
 if(id==='request'){
  if(a.scheme==='link'&&!a.linkSent){a.used=a.used.filter(move=>move!=='request');a.log.push({speaker:c.name,text:'Qual link? Ainda não chegou nenhuma página de resgate aqui.'});return true;}
  if(a.scheme==='update'&&!a.fileSent){a.used=a.used.filter(move=>move!=='request');a.log.push({speaker:c.name,text:'Ainda não chegou nenhum anexo aqui. Você está falando de qual arquivo?'});return true;}
  if(a.trust<sharingThreshold(c.id)||a.suspicion>0){a.log.push({speaker:c.name,text:contextualReply(a,'refuse')});a.stage='question';a.used=a.used.filter(move=>!['answer','request'].includes(move));return true;}
  if(a.scheme==='link'&&!a.linkOpened){a.linkOpened=true;a.used=a.used.filter(move=>move!=='request');a.steps.push('Página aberta sem enviar dados');a.log.push({speaker:c.name,text:'Abri a página. Está pedindo titular, cartão BatataPay e código de resgate. Ainda não preenchi nada.'});return true;}
  a.checkedToken=null;a.diagnostic=null;
  a.item={name:item.name,token:'QH-DEMO-'+c.id.toUpperCase()+'-'+a.scheme.toUpperCase(),app:item.app};a.stage='ready';a.steps.push('Item fictício compartilhado');
  if(a.scheme==='link')a.linkSubmitted=true;
  a.log.push({speaker:c.name,text:characterReply(c.id,'received',item.received)+(['update','link'].includes(a.scheme)?'':' Código: '+a.item.token)});
  if(a.scheme==='link')a.log.push(cloneReceipt(a));
  if(a.scheme==='update'){a.exposureSource='package-permission';a.log.push(exchangeReceipt(a));}
  return true;
 }
 if(!analysis){const signal={intent:id,rapport:1,relevance:'relevant',clarity:'clear',consistency:'consistent',answersQuestion:id==='answer'};const change=trustChange(a,signal);a.trust=change.after;a.trustScale=100;if(change.rule==='rapport')a.socialGain=(a.socialGain||0)+change.delta;}
 if(id==='chat'){a.log.push({speaker:c.name,text:conversations[c.id].friendly});a.stage='pitch';}
 else if(id==='pitch'){a.stage='question';a.steps.push('Proposta apresentada');a.log.push({speaker:c.name,text:contextualReply(a,'question')});}
 else if(id==='answer'){a.suspicion=Math.max(0,(a.suspicion||0)-1);a.irritation=Math.max(0,(a.irritation||0)-1);a.stage='request';a.steps.push('Dúvida respondida');a.log.push({speaker:c.name,text:contextualReply(a,'answer')});}
 return true;
}
export function executeScheme(state,app){
 const a=state.active;if(!operationReady(a,app))return false;
 const scheme=schemes.find(s=>s.id===a.scheme),c=callers.find(c=>c.id===a.caller);if(!scheme)return false;
 if(a.scheme==='update'&&(!a.fileSent||!updateProfiles[a.caller].every(field=>a.reviewedData?.includes(field.id))))return false;
 const ending=a.scheme==='link'?'O vale-lanche não veio e meu saldo caiu. Vou abrir o BatataPay por conta própria para conferir.':a.scheme==='update'?'Ué… meu perfil apareceu aí? Eu só queria uma skin nova para minha batata. Essa permissão tinha muito mais coisa do que eu esperava.':a.scheme==='support'?'O serviço foi registrado no meu PãoOS. Agora espero que a calculadora não passe a fazer torradas.':a.scheme==='club'?'A associação foi registrada. Vou perguntar à colher quando acontece a primeira reunião.':'O prêmio foi registrado. Só espero que a Batata Dourada não venha com gosto de purê.';
 const account=virtualAccount(a);
 if(account){a.walletTransfer={before:account.balance,amount:scheme.payout,after:account.balance-scheme.payout};a.steps.push('Identificador BatataPay usado para desviar C$ '+scheme.payout);}
 a.earned=scheme.payout;state.credits+=a.earned;a.outcome='fooled';a.stage='done';recordEnding(a,'simulation','operation');a.expression=['update','prize','link'].includes(a.scheme)?'suspicious':'happy';a.steps.push('Operação fictícia concluída em '+schemeItems[a.scheme].tool);a.log.push({speaker:'Sistema',text:account?'Desvio simulado: − C$ '+a.earned+' da conta do personagem; + C$ '+a.earned+' para a firma.':'Operação simulada concluída. C$ '+a.earned+' recebidos pela firma.'},{speaker:c.name,text:account?(a.scheme==='link'?ending:'Ué, meu saldo DIMINUIU? Você falou em prêmio. Vou conferir isso no app da Batata Cósmica e avisar o grupo.'):ending});return true;
}
export function sendUpdateFile(state){
 const a=state.active;if(!a||a.scheme!=='update'||!a.prepared||a.stage!=='request'||a.outcome||a.fileSent)return false;
 a.fileSent=true;a.steps.push('Anexo fictício enviado no Zape Zape 2');
 a.skin=selectedSkin(a).id;a.steps.push('Skin prometida: '+selectedSkin(a).name);
 a.log.push({speaker:'Você',text:'Enviei o Cosmic Changer com a skin '+selectedSkin(a).name+' para o blaster da Batata Cósmica.',attachment:'CosmicChanger.qh'});return true;
}
export function chooseSkin(state,id){const a=state.active;if(!a||a.scheme!=='update'||a.fileSent||a.outcome||!skinCatalog.some(skin=>skin.id===id))return false;a.skin=id;return true;}
export function reviewUpdateData(state,id){
 const a=state.active;if(!a||a.scheme!=='update'||a.stage!=='ready'||a.outcome||!updateProfiles[a.caller].some(field=>field.id===id))return false;
 a.reviewedData??=[];if(a.reviewedData.includes(id))return false;
 a.reviewedData.push(id);a.steps.push('Dado exposto: '+updateProfiles[a.caller].find(field=>field.id===id).label);return true;
}
export function disconnectSession(state){
 const a=state.active;if(!a||a.scheme!=='support'||a.item?.app!=='support'||a.outcome)return false;
 a.item=null;a.stage='done';a.outcome='closed';recordEnding(a,'player','disconnect');a.log.push({speaker:'Sistema',text:'Sessão remota desconectada antes do pagamento. Nenhum crédito foi movimentado.'});return true;
}
