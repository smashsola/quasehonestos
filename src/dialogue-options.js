import {applyMove,availableMoves,closeCall,sendUpdateFile} from './engine.js';
import {sendCloneLink} from './clone-card.js';
import {callers,schemeItems} from './data.js';
import {selectedOffer} from './app-interactions.js';
import {rememberConversation} from './conversation-memory.js';
import {reactionFor} from './mood.js';
import {sceneHumor,jokeReaction} from './scripted-humor.js';
const proposals={prize:'É o prêmio do concurso de desenho da Batata.',support:'É suporte para o PãoOS deste computador fictício.',club:'É um convite para o Clube VIP da Colher.',update:'O pacote promete skins para o blaster da Batata.',link:'A página promete vale-lanche pelos pontos BatataPay.'};
const explanations={prize:'Diz ser do concurso. Falta confirmar por outro canal.',support:'A firma oferece suporte sem chamado. A sessão acessa o PC do jogo.',club:'A firma oferece o convite. Falta saber quem organiza.',update:'O pacote pede perfil, contato e rotina para instalar skins.',link:'A página pede cartão e código por um vale-lanche.'};
const risks={prize:'O identificador BatataPay pode movimentar créditos do jogo. O certificado não confirma quem pediu o dado.',support:'Uma sessão remota dá acesso ao computador do jogo, mas não confirma quem oferece suporte.',club:'O passe libera acesso ao clube. O convite não confirma quem está organizando.',update:'O pacote pede perfil, contato e rotina. Uma skin não precisa da sua agenda.',link:'Abrir não envia nada. Preencher e enviar expõe o cartão do jogo; o vale-lanche não confirma a origem.'};

function phase(a){return a.stage==='request'&&a.scheme==='update'&&!a.fileSent?'attachment':a.stage==='request'&&a.scheme==='link'&&!a.linkSent?'link':a.stage;}
export function dialogueOptions(a){
 if(!a?.prepared||!a.log?.length||a.outcome||a.supportPaused||!schemeItems[a.scheme])return [];
 const step=phase(a),item=schemeItems[a.scheme],offer=selectedOffer(a),main=step==='question'?'answer':step==='request'?'request':'pitch';
 const choice=(id,label,action,extra={})=>({key:`${a.caller}:${step}:${!!a.linkOpened}:${id}`,label,action,...extra});
 const humor=sceneHumor(a,step),protect=choice('protect','Pausar e confirmar em outro canal, sem enviar dados.','move',{move:'wait',protective:true});
 if(step==='ready')return [choice('open',`Abrir ${item.tool} e conferir.`,'open',{app:item.app}),choice('receipt',humor.main,'joke',{funny:true}),choice('risk','O que esse item permite fazer?','info'),protect];
 if(step==='attachment'||step==='link')return [choice('send',step==='attachment'?'Enviar o pacote de skins.':'Enviar a página de resgate.',step),choice('send-joke',humor.main,step,{funny:true}),choice('risk','O que esse pedido pode expor?','info'),protect];
 const detail=(a.guidedAnswers||0)>0;
 const normal=step==='question'?(detail?risks[a.scheme]:explanations[a.scheme]):step==='request'?a.scheme==='link'&&a.linkOpened?'Você quer preencher e enviar o cadastro fictício da página?':item.request:proposals[a.scheme]+(offer?' A oferta é “'+offer.name+'”.':'');
 if(step==='question'&&(a.guidedAnswers||0)>=2)return [choice('risk','O que continua em risco?','info'),choice('joke',humor.main,'joke',{funny:true}),choice('joke-two',humor.aside,'joke',{funny:true}),protect];

 const requestLabel=({prize:'Compartilhar o cartão do jogo?',support:'Abrir a sessão do PãoOS?',club:'Usar seu passe do clube?',update:'Instalar o pacote de skins?',link:a.linkOpened?'Enviar o cadastro do jogo?':'Abrir a página de resgate?'})[a.scheme];
 const normalLabel=step==='question'?(detail?'Vamos falar do acesso que esse item permite.':'Diz ser da proposta; ainda falta confirmar.'):step==='request'?requestLabel:proposals[a.scheme];
 const funnyLabel=humor.main;
 return [choice('main',normalLabel,'move',{move:main,speech:normal}),choice('funny-main',funnyLabel,'move',{move:main,funny:true,speech:normal+' '+funnyLabel}),step==='request'?choice('risk','O que pode acontecer se esse item for compartilhado?','info'):choice('joke',humor.aside,'joke',{funny:true}),protect];
}
export function applyDialogueOption(state,key){
 const a=state.active,option=dialogueOptions(a).find(o=>o.key===key);if(!option)return false;
 if(option.action==='open')return {app:option.app};
 const speech=option.speech||option.label;
 const before=a.trust||0,stage=a.stage,start=a.log.length,caller=callers.find(c=>c.id===a.caller);let intent='question';
 if(option.action==='close'){a.log.push({speaker:'Você',text:speech});closeCall(state);intent='exit';}
 else if(option.action==='move'){
  if(option.move==='answer'&&(a.guidedAnswers||0)>=2)return false;
  // Resume old free-text saves at their existing stage without a used-button dead end.
  if(!availableMoves(state).some(m=>m.id===option.move))a.used=(a.used||[]).filter(id=>id!==option.move);
  if(!applyMove(state,option.move))return false;
  const player=a.log.slice(start).find(m=>m.speaker==='Você');if(player)player.text=speech;
  intent=option.move;
  if(option.move==='answer')a.guidedAnswers=(a.guidedAnswers||0)+1;
 }else if(option.action==='attachment'||option.action==='link'){
  const sent=option.action==='attachment'?sendUpdateFile(state):sendCloneLink(state);if(!sent)return false;const player=a.log.slice(start).find(m=>m.speaker==='Você');if(player)player.text=speech;
  a.log.push({speaker:caller.name,text:option.action==='attachment'?'O pacote chegou. Ainda não instalei; preciso decidir sobre as permissões.':'A página chegou. Receber o endereço ainda não abriu nem enviou o cadastro.'});intent='answer';
 }else{
  a.log.push({speaker:'Você',text:speech},{speaker:caller.name,text:option.action==='joke'?jokeReaction(a,sceneHumor(a,phase(a)).phase):risks[a.scheme]});intent=option.action==='joke'?'smalltalk':'question';if(option.action==='joke'){a.guidedJokes=(a.guidedJokes||0)+1;const key=sceneHumor(a,phase(a)).phase;a.guidedHumorVisits??={};a.guidedHumorVisits[key]=(a.guidedHumorVisits[key]||0)+1;}
 }
 a.dialogueMode='choices';a.lastIntent=intent;a.expression=reactionFor(a,intent,option.label);
 const reply=a.log.slice(start).findLast(m=>m.speaker===caller.name);if(reply)reply.replyOrigin='scripted';
 a.audit??=[];a.audit.push({text:speech,reaction:reply?.text||'Contato encerrado pelo jogador.',intent,before,after:a.trust||0,trustDelta:(a.trust||0)-before,beforeStage:stage,afterStage:a.stage,trustScale:100,trustSource:'local-rules',interpretationSource:'authored-choice',choice:option.key,reason:option.protective?'A pessoa pausou a proposta para buscar confirmação independente; nenhuma consulta concluída foi registrada. Nenhum dado novo ou crédito foi liberado.':option.action==='joke'?'A brincadeira não liberou itens nem alterou confiança.':option.action==='info'?'A explicação apresentou o risco sem executar a operação.':'Uma escolha roteirizada aplicou as regras da partida.'});
 rememberConversation(a,speech,intent,stage);
 return {changed:true};
}
