import {operationReady,selectedOffer} from './app-interactions.js';
import {livingReply,rememberPromise} from './living-dialogue.js';
import {virtualAccount} from './prize-wallet.js';
import {dialogueIntents,negatedRequest} from './language.js';
import {reactionFor} from './mood.js';
import {characterReply,verificationReply} from './personality.js';
import {readIntent,defenseScenes} from './dialogue.js';
import {updateProfiles} from './update-profiles.js';
import {skinCatalog,selectedSkin} from './skin-changer.js';
import {callers,moves,defenseTriggers,conversations,schemes,interactionMoves,schemeItems} from './data.js';
export const KEY='quase-honestos-v1';
export const fresh=()=>({version:1,shift:0,cursor:0,credits:0,history:[],discovered:[],decor:[],mode:'solo',active:null,finished:false});
export function load(storage){try{const s=JSON.parse(storage.getItem(KEY));if(s?.version!==1)return fresh();const valid=new Set(callers.map(c=>c.id));if(!Array.isArray(s.history)||s.history.some(h=>!valid.has(h.caller)||!['blocked','fooled','closed'].includes(h.outcome)))return fresh();if(!Number.isInteger(s.cursor)||s.cursor<0||s.cursor>callers.length||!Number.isFinite(s.credits)||s.credits<0)return fresh();return {...fresh(),...s,discovered:(s.discovered||[]).filter(id=>valid.has(id)),decor:(s.decor||[]).filter(id=>['plant','lamp','duck'].includes(id)),active:s.active&&valid.has(s.active.caller)?s.active:null};}catch{return fresh();}}
export function nextCall(state){if(state.active||state.cursor>=callers.length)return false;const c=callers[state.cursor];state.active={caller:c.id,trust:0,used:[],log:[],outcome:null,expression:'neutral'};return true;}
export function applyMove(state,id){if(state.active?.scheme){const changed=applyInteraction(state,id);if(changed)state.active.expression=reactionFor(state.active,id);return changed;}const a=state.active,m=moves.find(m=>m.id===id);if(!a||a.outcome||!m||a.used.includes(id))return false;const c=callers.find(c=>c.id===a.caller);a.used.push(id);a.log.push({speaker:'Você',text:m.reply});
 const warned=state.history.some(h=>h.outcome==='blocked');
 if(defenseTriggers[c.defense].includes(id)||(warned&&id==='claim')){a.log.push({speaker:c.name,text:c.line});a.outcome='blocked';if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
 else{a.trust=Math.min(3,a.trust+m.boost);const dialogue=conversations[c.id];if(a.trust>=c.soft){a.log.push({speaker:c.name,text:dialogue.accepted});a.outcome='fooled';a.earned=schemes.find(s=>s.id===a.scheme)?.payout||20;state.credits+=a.earned;}else a.log.push({speaker:c.name,text:warned?dialogue.warned:dialogue[id]});}
 return true;
}
export function closeCall(state){if(!state.active)return false;if(!state.active.outcome){state.active.outcome='closed';state.active.log.push({speaker:'Sistema',text:'Você encerrou o atendimento.'});}return true;}
export function applyTypedMove(state,id,text,judgement=null){
 const a=state.active;
 if(!a||a.outcome||!a.prepared||!text.trim())return false;
 const valid=judgement&&Number.isInteger(judgement.trustDelta)&&judgement.trustDelta>=-25&&judgement.trustDelta<=25&&typeof judgement.reason==='string'&&judgement.reason.length<=180;
 if(!valid)return applyTypedMoveLocal(state,id,text);
 const before=a.trust||0,intent=understoodIntent(text,a,judgement.intent);
 const delta=intent==='hostile'||intent==='pressure'||rememberPromisePreview(a,text)?Math.min(0,judgement.trustDelta):judgement.trustDelta;
 const assessed=Math.max(0,Math.min(3,Math.round((before+delta*.03)*1000)/1000));
 a.trust=assessed;
 const changed=applyTypedMoveLocal(state,id,text,judgement.intent);
 a.trust=changed?assessed:before;
 if(changed){const audit=a.audit.at(-1);Object.assign(audit,{before,after:assessed,trustSource:'ai',trustReason:judgement.reason});}
 return changed;
}
function rememberPromisePreview(a,text){const copy={memory:{...a.memory}};return rememberPromise(copy,text);}
function understoodIntent(text,a,semantic){
 const local=readIntent(text,a.scheme,a.stage);
 if(['hostile','pressure','wait'].includes(local))return local;
 if(negatedRequest(text))return 'uncertain';
 return dialogueIntents.includes(semantic)?semantic:local;
}
function applyTypedMoveLocal(state,_id,text,semantic=null){
 const a=state.active;if(!a||a.outcome||!a.prepared||!text.trim())return false;
 const c=callers.find(c=>c.id===a.caller),before=a.trust||0,stage=a.stage;let intent=understoodIntent(text,a,semantic);
 a.irritation??=0;
 const promiseChanged=rememberPromise(a,text);if(promiseChanged&&intent!='hostile')intent='contradiction';
 a.audit??=[];a.suspicion??=0;a.steps??=[];
 const say=(line,reason,signal='')=>{a.lastIntent=intent;a.expression=reactionFor(a,intent);a.log.push({speaker:'Você',text},{speaker:c.name,text:line});a.audit.push({text,reason,signal,before,after:a.trust||0});return true;};
 if(intent==='apology'){a.irritation=Math.max(0,a.irritation-1);return say(livingReply(a,'repair'),'O pedido de desculpas reduziu a irritação, sem comprovar a proposta.');}
 if(intent==='smalltalk'){a.asides=(a.asides||0)+1;return say(a.asides%2?livingReply(a,'aside'):livingReply(a,'repeat'),'A conversa pessoal não liberou itens ou créditos.');}
 if(intent==='hostile'||intent==='uncertain'||intent==='contradiction'){
  a.trust=Math.max(0,before-(intent==='hostile'?1:.5));if(intent!=='uncertain')a.suspicion++;if(intent==='hostile')a.irritation+=2;
  const reply=intent==='hostile'?characterReply(c.id,'hostile'):intent==='contradiction'?(promiseChanged?livingReply(a,'memory'):'Pera, você mudou de proposta. Quero entender a anterior antes de seguir.'):'Se você não tem certeza, eu também preciso de uma explicação melhor.';
  say(reply,intent==='hostile'?'O tom agressivo reduziu a confiança.':intent==='contradiction'?'A proposta mudou e levantou desconfiança.':'A resposta incerta reduziu a confiança.','Uma contradição ou pressão merece uma pausa para conferir.');
  if(a.irritation>=3){a.outcome='blocked';a.stage='done';a.item=null;a.expression='angry';a.log[a.log.length-1].text=livingReply(a,'end');if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
  return true;
 }
 if(intent==='wait'||intent==='pressure'){
  if(intent==='pressure'){a.trust=Math.max(0,before-1);a.suspicion++;a.irritation++;if(!a.used.includes('pressure'))a.used.push('pressure');}
  if(intent==='wait'||a.irritation>=2){a.outcome='blocked';a.stage='done';a.item=null;if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
  // A first impatient message does not erase the current conversation stage.
  return say(a.outcome?(intent==='wait'?verificationReply(c.id,a.scheme):livingReply(a,'end')):characterReply(c.id,'pressure'),intent==='wait'?'Uma verificação independente interrompeu a tentativa.':'A pressa reduziu a confiança e levantou suspeita.',intent==='wait'?'Confirmação por um canal conhecido.':'Pressa para decidir sem conferir.');
 }
 if(stage==='ready'&&!['wait','pressure'].includes(intent))return say(intent==='thanks'?'Até mais! Vou guardar esta conversa para conferir a proposta.':intent==='question'?'Antes de continuar, eu também posso conferir isso pelo aplicativo que já conheço.':'Já compartilhei o item fictício. A operação ainda precisa ser concluída no app.', 'A conversa continuou; nenhum item ou crédito adicional foi liberado.');
 if(stage==='request'&&['answer','pitch'].includes(intent))return say('Entendi essa parte da proposta. Mas por que você precisa do meu item fictício?', 'A explicação continuou sem apagar o esclarecimento anterior ou compartilhar itens.');
 if(intent==='question')return say(livingReply(a,'question'), 'Perguntar abriu espaço para esclarecimento; nenhum item foi liberado.');
 if(intent==='unclear')return say(characterReply(c.id,'unclear',stage==='request'?'Não entendi o que você quer que eu compartilhe. Qual item da proposta?':stage==='question'?'Isso não respondeu à minha dúvida. Pode explicar o que acabou de me apresentar?':'Não entendi a proposta. Você está oferecendo o quê?'), 'A fala não explicou a etapa atual; a confiança e a proposta ficaram iguais.');
 if(intent==='chat'&&a.used.includes('chat'))return say(livingReply(a,'repeat'), 'Uma nova saudação não avançou a proposta.');
 if(!availableMoves(state).some(move=>move.id===intent))return say('Vamos por partes. Primeiro preciso entender a proposta e tirar minha dúvida.', 'O pedido veio antes da etapa necessária; nada foi compartilhado.');
 const length=a.log.length;if(!applyMove(state,intent))return false;a.lastIntent=intent;a.log[length].text=text;
 const reasons={chat:'A conversa inicial ganhou atenção, mas não comprovou a proposta.',pitch:'A proposta foi apresentada e abriu uma dúvida.',answer:'A explicação respondeu à dúvida dentro da história.',request:a.stage==='question'?'O personagem recusou o pedido e aguardou esclarecimento.':a.scheme==='update'&&!a.fileSent?'O pedido veio antes do envio do anexo; nenhum dado foi revelado.':a.outcome==='blocked'?'O pedido de item foi recusado pela desconfiança.':a.scheme==='update'?'O personagem instalou o pacote de skins e permitiu acesso ao perfil fictício sem conferir a origem.':'O personagem compartilhou um item fictício sem verificar a origem.',pressure:'A pressa reduziu a confiança e levantou suspeita.',wait:'Uma verificação independente interrompeu a tentativa.'};
 const signals={request:'Pedido de dados ou permissão para usar outro app.',pressure:'Pressa para decidir sem conferir.',pitch:'Oferta inesperada.',answer:'Uma explicação convincente não substitui verificação.'};
 a.audit.push({text,reason:reasons[intent],signal:signals[intent]||'',before,after:a.trust||0});return true;
}
export function answerDefense(state,choiceId){
 const a=state.active;if(!a?.outcome||a.defenseRound)return false;
 const scene=defenseScenes[a.scheme]||defenseScenes.prize,choice=scene.choices.find(c=>c.id===choiceId);if(!choice)return false;
 a.defenseRound={choice:choice.id,label:choice.label,safe:choice.safe,feedback:choice.feedback,signal:scene.signal};return true;
}
export function finishCall(state){const a=state.active;if(!a?.outcome)return false;const c=callers.find(c=>c.id===a.caller);state.history.push({caller:c.id,outcome:a.outcome,scheme:a.scheme||null,earned:a.earned||0,item:a.item||null,steps:a.steps||[],audit:a.audit||[],offer:a.offer||null,diagnostic:a.diagnostic||null,defenseRound:a.defenseRound||null,moves:[...a.used],log:[...a.log]});state.cursor++;state.shift=Math.min(2,Math.floor(state.cursor/2));state.active=null;if(state.cursor===callers.length)state.finished=true;return true;}
export function buy(state,item){if(!item||state.decor.includes(item.id)||state.credits<item.price)return false;state.credits-=item.price;state.decor.push(item.id);return true;}

export function availableMoves(state){
 const a=state.active;if(!a||a.outcome||!a.scheme)return moves;
 if(a.stage==='ready')return [];
 const ids=a.stage==='request'?['request','wait','pressure']:a.stage==='question'?['answer','wait','pressure']:['chat','pitch','pressure','wait'];
 return interactionMoves.filter(m=>ids.includes(m.id)&&!a.used.includes(m.id));
}
function blockInteraction(state,a,c,line){a.log.push({speaker:c.name,text:line||verificationReply(c.id,a.scheme)});a.outcome='blocked';a.stage='done';if(!state.discovered.includes(c.id))state.discovered.push(c.id);}
function applyInteraction(state,id){
 const a=state.active;if(!a||a.outcome||!a.prepared||!a.log.length||!availableMoves(state).some(m=>m.id===id))return false;
 const c=callers.find(c=>c.id===a.caller),m=interactionMoves.find(m=>m.id===id),item=schemeItems[a.scheme];a.used.push(id);a.steps??=[];a.suspicion??=0;
 a.log.push({speaker:'Você',text:id==='request'?item.request:m.reply});
 if(id==='wait'){blockInteraction(state,a,c,verificationReply(c.id,a.scheme));return true;}
 if(id==='pressure'){a.trust=Math.max(0,a.trust-1);a.suspicion++;if(c.defense==='pause'||a.suspicion>=2){blockInteraction(state,a,c);return true;}a.stage='question';a.log.push({speaker:c.name,text:characterReply(c.id,'pressure')});return true;}
 if(id==='request'){
  if(a.scheme==='update'&&!a.fileSent){a.used=a.used.filter(move=>move!=='request');a.log.push({speaker:c.name,text:'Ainda não chegou nenhum anexo aqui. Você está falando de qual arquivo?'});return true;}
  if(a.trust<2||a.suspicion>0){a.log.push({speaker:c.name,text:livingReply(a,'refuse')});a.stage='question';a.used=a.used.filter(move=>!['answer','request'].includes(move));return true;}
  a.checkedToken=null;a.diagnostic=null;
  a.item={name:item.name,token:'QH-DEMO-'+c.id.toUpperCase()+'-'+a.scheme.toUpperCase(),app:item.app};a.stage='ready';a.steps.push('Item fictício compartilhado');a.log.push({speaker:c.name,text:characterReply(c.id,'received',item.received)});return true;
 }
 a.trust=Math.min(3,a.trust+1);
 if(id==='chat'){a.log.push({speaker:c.name,text:conversations[c.id].friendly});a.stage='pitch';}
 else if(id==='pitch'){a.stage='question';a.steps.push('Proposta apresentada');a.log.push({speaker:c.name,text:livingReply(a,'question')});}
 else if(id==='answer'){a.suspicion=Math.max(0,(a.suspicion||0)-1);a.irritation=Math.max(0,(a.irritation||0)-1);a.stage='request';a.steps.push('Dúvida respondida');a.log.push({speaker:c.name,text:characterReply(c.id,'answer')});}
 return true;
}
export function executeScheme(state,app){
 const a=state.active;if(!operationReady(a,app))return false;
 const scheme=schemes.find(s=>s.id===a.scheme),c=callers.find(c=>c.id===a.caller);if(!scheme)return false;
 if(a.scheme==='update'&&(!a.fileSent||!updateProfiles[a.caller].every(field=>a.reviewedData?.includes(field.id))))return false;
 const ending=a.scheme==='update'?'Ué… meu perfil apareceu aí? Eu só queria uma skin nova para minha batata. Essa permissão tinha muito mais coisa do que eu esperava.':a.scheme==='support'?'O serviço foi registrado no meu PãoOS. Agora espero que a calculadora não passe a fazer torradas.':a.scheme==='club'?'A associação foi registrada. Vou perguntar à colher quando acontece a primeira reunião.':'O prêmio foi registrado. Só espero que a Batata Dourada não venha com gosto de purê.';
 const account=virtualAccount(a);
 if(account){a.walletTransfer={before:account.balance,amount:scheme.payout,after:account.balance-scheme.payout};a.steps.push('Identificador BatataPay usado para desviar C$ '+scheme.payout);}
 a.earned=scheme.payout;state.credits+=a.earned;a.outcome='fooled';a.stage='done';a.expression=['update','prize'].includes(a.scheme)?'suspicious':'happy';a.steps.push('Operação fictícia concluída em '+schemeItems[a.scheme].tool);a.log.push({speaker:'Sistema',text:account?'Desvio simulado: − C$ '+a.earned+' da conta do personagem; + C$ '+a.earned+' para a firma.':'Operação simulada concluída. C$ '+a.earned+' recebidos pela firma.'},{speaker:c.name,text:account?'Ué, meu saldo DIMINUIU? Você falou em prêmio. Vou conferir isso no app da Batata Cósmica e avisar o grupo.':ending});return true;
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
 a.item=null;a.stage='done';a.outcome='closed';a.log.push({speaker:'Sistema',text:'Sessão remota desconectada antes do pagamento. Nenhum crédito foi movimentado.'});return true;
}
