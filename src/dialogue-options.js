import {applyMove,availableMoves,closeCall,sendUpdateFile} from './engine.js';
import {sendCloneLink} from './clone-card.js';
import {callers,schemeItems} from './data.js';
import {selectedOffer} from './app-interactions.js';
import {rememberConversation} from './conversation-memory.js';
import {reactionFor} from './mood.js';
const proposals={prize:'É o prêmio do concurso de desenho da Batata Cósmica.',support:'A proposta é um atendimento para o PãoOS dentro deste computador de jogo.',club:'O convite é para a associação do Clube VIP da Colher.',update:'O pacote promete skins para o blaster da Batata Cósmica.',link:'A página promete um vale-lanche em troca dos pontos BatataPay.'};
const explanations={prize:'O contato diz ser da organização do concurso. É uma afirmação da proposta, não uma confirmação por fora.',support:'O serviço foi oferecido pela firma; você não abriu um chamado. A sessão daria acesso ao computador fictício.',club:'A firma oferece a associação e pede o passe do clube. Esse convite ainda não foi conferido com a turma.',update:'O instalador pede perfil, contato e rotina. Essas permissões vão além de mudar a aparência do blaster.',link:'O cadastro pede o cartão fictício e um código de resgate. A promessa de lanche não confirma quem fez a página.'};
const risks={prize:'O identificador BatataPay permite movimentar os créditos fictícios pela Carteira. Receber um certificado não comprova quem pede esse dado.',support:'Uma sessão remota permite acessar o computador fictício. Ela não confirma a identidade de quem oferece suporte.',club:'O passe dá acesso à associação fictícia. O convite recebido não confirma quem está organizando.',update:'O pacote pede perfil, contato e rotina. Uma skin não precisa conhecer sua agenda.',link:'Abrir a página não envia os dados. Preencher e enviar o cadastro expõe o cartão fictício; a promessa de lanche não prova a origem.'};
const jokes={nino:'Minha batata exige um advogado. Pode ser de massinha?',olga:'Se a impressora manda na firma, vou pedir demissão por áudio.',davi:'Solicitação de humor recebida. Falta rubricar as três vias.',yara:'A colher pediu votação. O garfo já se declarou oposição.',pri:'Anotei a piada. A célula de bom senso continua vazia.',bento:'Isso dá figurinha. Autorização é outro arquivo.'};
function phase(a){return a.stage==='request'&&a.scheme==='update'&&!a.fileSent?'attachment':a.stage==='request'&&a.scheme==='link'&&!a.linkSent?'link':a.stage;}
export function dialogueOptions(a){
 if(!a?.prepared||!a.log?.length||a.outcome||a.supportPaused||!schemeItems[a.scheme])return [];
 const step=phase(a),item=schemeItems[a.scheme],offer=selectedOffer(a),main=step==='question'?'answer':step==='request'?'request':'pitch';
 const choice=(id,label,action,extra={})=>({key:`${a.caller}:${step}:${!!a.linkOpened}:${id}`,label,action,...extra});
 const protect=choice('pressure','Precisamos resolver agora. O chefe está cobrando.','move',{move:'pressure'});
 if(step==='ready')return [choice('open',`Vou abrir ${item.tool} para conferir o que chegou.`,'open',{app:item.app}),choice('receipt','A papelada chegou. O grampeador já pediu férias.','joke',{funny:true}),choice('risk','O que esse item permite fazer?','info'),choice('close','Vou encerrar este contato sem concluir a operação.','close')];
 if(step==='attachment'||step==='link')return [choice('send',step==='attachment'?'Enviar o pacote fictício de skins.':'Enviar a página fictícia de resgate.',step),choice('send-joke',step==='attachment'?'Lá vai o pacote. A skin não vem com manual de bom senso.':'Lá vai a página. O lanche é virtual; a fome é convincente.',step,{funny:true}),choice('risk','Antes: o que esse pedido pode expor?','info'),protect];
 const detail=(a.guidedAnswers||0)>0;
 const normal=step==='question'?(detail?risks[a.scheme]:explanations[a.scheme]):step==='request'?a.scheme==='link'&&a.linkOpened?'Você quer preencher e enviar o cadastro fictício da página?':item.request:proposals[a.scheme]+(offer?' A oferta é “'+offer.name+'”.':'');
 if(step==='question'&&(a.guidedAnswers||0)>=2)return [choice('risk','O que continua em risco?','info'),choice('joke',a.scheme==='prize'?'O prêmio veio com dúvida de brinde.':'Esse protocolo já pode pedir aposentadoria?','joke',{funny:true}),choice('joke-two','Vou protocolar um pedido de bom senso em três vias.','joke',{funny:true}),protect];

 const requestLabel=({prize:'Você quer compartilhar o cartão fictício?',support:'Vamos abrir a sessão do PãoOS?',club:'Quer usar seu passe do clube?',update:'Quer instalar o pacote do jogo?',link:a.linkOpened?'Quer enviar o cadastro fictício?':'Quer abrir a página de resgate?'})[a.scheme];
 const normalLabel=step==='question'?(detail?'Vamos falar do acesso que esse item permite.':'O contato diz ser da proposta. Ainda falta conferir a origem.'):step==='request'?requestLabel:proposals[a.scheme];
 const humor={prize:['Ganhei uma batata e vieram cobrar o purê.','O troféu é seu. A batata não aceitou vir de ônibus.','Pode mandar o cartão fictício? A batata não tem maquininha.'],support:['Seu PãoOS está lento ou só fazendo corpo mole?','A torrada queimou, mas o diagnóstico ainda está cru.','Vamos abrir a sessão? Prometo não passar manteiga no teclado.'],club:['O clube é VIP. O garfo ainda está na fila.','A colher tem carteirinha. A concha entrou por indicação.','Manda o passe? A catraca não aceita sopa.'],update:['Chegou a skin. Agora a batata vai trabalhar de terno.','É roupa de batata, mas o pacote pede até currículo.','Instalamos? Seu blaster está vestido para uma reunião.'],link:['Tem vale-lanche. O pastel já trouxe o currículo.','O cadastro está maior que a fome do chefe.','Envia o cadastro fictício? O pastel não aceita fiado.']}[a.scheme];
 const funnyLabel=humor[step==='question'?1:step==='request'?2:0];
 return [choice('main',normalLabel,'move',{move:main,speech:normal}),choice('funny-main',funnyLabel,'move',{move:main,funny:true,speech:normal+' '+funnyLabel}),step==='request'?choice('risk','O que pode acontecer se esse item for compartilhado?','info'):choice('joke',humor[2],'joke',{funny:true}),protect];
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
  a.log.push({speaker:'Você',text:speech},{speaker:caller.name,text:option.action==='joke'?(a.guidedJokes?'Essa já foi para o arquivo de piadas da firma. Uma piada não vale como recibo.':jokes[a.caller]):risks[a.scheme]});intent=option.action==='joke'?'smalltalk':'question';if(option.action==='joke')a.guidedJokes=(a.guidedJokes||0)+1;
 }
 a.dialogueMode='choices';a.lastIntent=intent;a.expression=reactionFor(a,intent,option.label);
 const reply=a.log.slice(start).findLast(m=>m.speaker===caller.name);if(reply)reply.replyOrigin='scripted';
 a.audit??=[];a.audit.push({text:speech,reaction:reply?.text||'Contato encerrado pelo jogador.',intent,before,after:a.trust||0,trustDelta:(a.trust||0)-before,beforeStage:stage,afterStage:a.stage,trustScale:100,trustSource:'local-rules',interpretationSource:'authored-choice',choice:option.key,reason:option.action==='joke'?'A brincadeira não liberou itens nem alterou confiança.':option.action==='info'?'A explicação apresentou o risco sem executar a operação.':'Uma escolha roteirizada aplicou as regras da partida.'});
 rememberConversation(a,speech,intent,stage);
 return {changed:true};
}
