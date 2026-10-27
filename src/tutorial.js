import {defenseCaseFor} from './defense-round.js';
import {schemeItems} from './data.js';
import {defenseCases} from './defense-round.js';

export const tutorialStory='No Trambique OS, você entrou na Quase Honestos para conferir pedidos suspeitos antes de agir. A Lia acompanha o primeiro caso. Depois do resultado, a vingança opcional traz desafios de proteção e uma cena fictícia.';

const examples={
 link:{pitch:'Seus pontos do BatataPay renderam um vale-lanche.',answer:'O cadastro da página pede o titular e o cartão do jogo para registrar o resgate.',request:'Pode abrir a página de resgate?'},
 prize:{pitch:'Estou falando sobre o prêmio do concurso de desenho de batatas.',answer:'O pessoal do concurso de desenho organizou esse prêmio.',request:'Pode me passar o identificador do cartão BatataPay?'},
 support:{pitch:'É uma proposta de assistência para o seu PãoOS.',answer:'A assistência da firma está oferecendo esse serviço para o PãoOS.',request:'Pode abrir a sessão do PãoOS?'},
 club:{pitch:'Tenho um convite para o Clube VIP da Colher.',answer:'A organização do clube preparou esse convite para o evento.',request:'Pode compartilhar seu passe do clube?'},
 update:{pitch:'Esse pacote promete skins para o blaster da Batata Cósmica.',answer:'O pacote pede perfil e contato para registrar as skins.',request:'Pode instalar o pacote de skins que enviei?'}
};
export function tutorialStep(state,ui={}){
 const a=state.active;
 if(state.mode==='defense'){
  if(state.finished||state.cursor!==0||['skipped','completed'].includes(state.tutorial))return null;
  if(!a)return {number:1,total:5,title:ui.callsVisible?'Vamos bater o ponto?':'Abra o Zape Zape 2',text:ui.callsVisible?'Clique em “Começar expediente” para receber a primeira mensagem. O contorno verde-água mostra onde clicar. Vou acompanhar só este primeiro caso.':'Abra o Zape Zape 2 pelo ícone destacado. Depois, clique em “Começar expediente” para começar o primeiro caso.',app:'calls',action:ui.callsVisible?'begin':'open',target:'.desktop-icons [data-icon="calls"],.mobile-dock [data-app="calls"],.start-shift'};
  if(ui.callsVisible===false)return {number:a.outcome?5:2,total:5,title:'Volte ao Zape para continuar',text:'Sua conversa continua lá. Abra o Zape Zape 2 pelo ícone destacado ou pelo botão abaixo para retomar o tutorial.',app:'calls',action:'open',target:'.desktop-icons [data-icon="calls"],.mobile-dock [data-app="calls"]'};
  if(a.outcome)return {number:5,total:5,title:'Tutorial concluído!',text:'Leia o que sua escolha causou. Você pode seguir em “Próxima situação” ou abrir “Vingança” para os desafios e a cena fictícia. A revanche tem um guia próprio; só pausar a conversa não a libera.',app:'calls',action:'finish',target:'.defense-feedback-actions .primary'};
  if(a.actionPending)return {number:4,total:5,title:'Veja sua escolha acontecer',text:'Acompanhe a ação até o fim. Em seguida, vamos conferir o resultado.',app:'calls',action:'wait'};
  if(a.chatStage==='typing')return {number:2,total:5,title:'Uma mensagem nova chegou',text:'Os três pontos mostram que o contato está digitando. Espere a mensagem aparecer e observe o que ele está pedindo.',app:'calls',action:'wait'};
  if(a.chatStage==='speaking')return {number:2,total:5,title:'Leia a mensagem com calma',text:'O contato está falando. Repare no pedido e na pressa. Depois, confira a dica e as pistas antes de responder.',app:'calls',action:'wait'};
  if(!a.mechanicUsed)return {number:2,total:5,title:'Comece pela dica rápida',text:'Clique na dica logo abaixo da conversa. Ela explica o que conferir neste caso. A dica ajuda, mas não decide por você.',app:'calls',action:'hint',target:'[data-defense-mechanic]'};
  if(!a.tutorialCluesSeen)return {number:3,total:5,title:'Agora confira as pistas',text:'Abra “O que observar nesta mensagem”. Compare as três pistas com o pedido do contato para entender a lógica do risco.',app:'calls',action:'clues',target:'details.defense-clues > summary'};
  const safe=defenseCaseFor(a)?.choices.find(choice=>choice.safe&&!choice.witty);
  return {number:4,total:5,title:'Sua primeira escolha',text:'Só neste primeiro caso, destaquei uma resposta segura: confirmar pelo número que você já tinha salvo. Leia as outras opções e escolha como reagir.',app:'calls',action:'choice',target:safe?`[data-defense-choice="${safe.id}"]`:null};
 }
 if(state.finished||state.cursor!==0||(state.history?.length||0)>0)return null;
 if(!a)return {number:1,title:'Pode bater o ponto',text:'Abra o Zape Zape 2 e comece o expediente. Este tutorial acompanha só o primeiro atendimento e mostra onde clicar sem decidir por você.',app:'calls'};
 if(a.outcome)return {number:8,title:'Leia o que aconteceu',text:'O resultado explica o que foi exposto e qual defesa poderia interromper a tentativa. Mesmo uma recusa faz parte do jogo. Depois, continue para o próximo atendimento.',app:'calls'};
 if(!a.scheme)return {number:2,title:'Qual vai ser a proposta?',text:'Escolha uma situação fictícia no Zape. Observe o pedido de dados ou acesso e as alternativas. Depois, o jogo mostra as consequências e você pode praticar a defesa.',app:'calls'};
 if(!a.prepared)return {number:3,title:'Prepare o app da proposta',text:'Escolha a oferta e clique no botão de preparar. Isso começa o papo; não dá dinheiro nem libera os dados do personagem.',app:a.scheme==='prize'?'prize':schemeItems[a.scheme].app};
 if(a.scheme==='link'&&a.prepared&&a.stage==='request')return {number:6,title:!a.linkSent?'Envie a página':!a.linkOpened?'A página chegou':'Abrir não é preencher',text:!a.linkSent?'Escolha Enviar a página de resgate no Zape.':!a.linkOpened?'Escolha a fala sobre abrir a página. O personagem ainda pode recusar.':'O cadastro está vazio. O personagem precisa decidir se preenche e envia os dados fictícios.',example:a.linkSent?(a.linkOpened?'Pode preencher e enviar o cadastro do resgate?':'Pode abrir a página de resgate?'):null,app:'calls'};
 if(a.stage==='ready'&&a.scheme==='link')return {number:7,title:'Confira o cadastro recebido',text:'O retorno da página está no chat. Abra Clona Cartão, confira o cadastro e veja o débito antes de confirmar.',app:'link'};
 if(a.stage==='ready'){
  const app=schemeItems[a.scheme].app;
  const text=a.scheme==='update'?`A instalação revelou os dados pelo pacote. Revise os ${Math.max(0,3-(a.reviewedData?.length||0))} dados restantes no Pacote Surpresa e registre a operação.`:a.scheme==='support'?(a.diagnostic?'Abra Banco do Pão no PC fictício e confira a cobrança antes de concluir.':'Abra Diagnóstico dentro da Torradeira Remota e verifique a sessão fictícia.'):a.checkedToken===a.item?.token?'Código conferido. Leia o valor e confirme a operação no app. Os créditos só entram nessa etapa.':'Copie o código QH-DEMO da conversa, digite no app e use Conferir. Só aceitar a proposta não movimenta créditos.';
  return {number:7,title:'Use o item no app correto',text,app};
 }
 if(a.stage==='request'&&a.scheme==='update'&&!a.fileSent)return {number:6,title:'Envie o arquivo da história',text:'Escolha Enviar o pacote fictício no Zape. Enviar não significa instalar: depois, o personagem ainda precisa concordar.',app:'calls'};
 const phase=a.stage==='question'?'answer':a.stage==='request'?'request':'pitch';
 return {number:phase==='pitch'?4:phase==='answer'?5:6,title:phase==='pitch'?'Explique sua proposta':phase==='answer'?'Responda à dúvida':'Peça a ação certa',text:phase==='pitch'?'Escolha entre avançar na simulação, perguntar sobre o risco, brincar ou pausar para buscar confirmação por outro canal. Uma ou duas opções trazem o humor da firma.':phase==='answer'?'Leia a última pergunta e escolha uma resposta. A opção muda conforme a etapa; uma brincadeira sozinha não libera dados.':'Você pode interromper e buscar confirmação por outro canal. Receber um item não conclui uma operação; cada app tem uma etapa separada.',example:examples[a.scheme]?.[phase],app:'calls'};
}
export function tutorialPanel(state,esc,mobile=false,ui={}){
 const step=tutorialStep(state,ui);if(!step||['skipped','completed'].includes(state.tutorial))return '';
 const mentor='<div class="guide-mentor"><img src="/src/portraits/supervisor-lia.svg" width="40" height="40" alt="" draggable="false"><div><small>SUPERVISÃO</small><span>Lia · Supervisão</span></div><span class="guide-file-number" aria-hidden="true">TREINO / 1</span></div>';
 const total=step.total||8;
 const progress=`<div class="guide-progress" aria-label="Etapa ${step.number} de ${total}">${Array.from({length:total},(_,i)=>`<span class="${i+1<step.number?'done':i+1===step.number?'current':''}"></span>`).join('')}</div>`;
 const started=state.mode==='defense'?state.tutorial==='defense':state.tutorial==='active';
 if(!started)return `<aside class="first-call-guide guide-invite" aria-label="Tutorial da primeira conversa">${mentor}<div class="guide-body"><small class="guide-eyebrow">SEU PRIMEIRO DIA</small><h2>Primeiro atendimento?</h2><p>${esc(tutorialStory)}</p><p>Eu mostro onde clicar e o objetivo de cada etapa. O papo com o personagem continua sendo seu.</p><p>${mobile?'Use Aplicativos na barra inferior para trocar de app. Toque em uma das quatro falas para responder.':'Use a barra para trocar de janela. Navegue pelas quatro falas com Tab e escolha com Enter.'}</p><div class="guide-actions"><button data-tutorial="start">Começar tutorial</button><button data-tutorial="skip">Jogar sem dicas</button></div><small class="guide-aside">A Lia acompanha só este primeiro caso.</small></div></aside>`;
 const appLabel=step.app==='calls'?'Zape Zape 2':step.app==='prize'?'Premia Fácil':schemeItems[state.active?.scheme]?.tool||step.app;
 const controls={begin:'<button data-tutorial-begin>Começar expediente</button>',hint:'<button data-tutorial-hint>Ver a dica rápida</button>',clues:'<button data-tutorial-clues>Conferir as três pistas</button>',choice:'<button data-tutorial-choice>Ir para as respostas</button>',finish:'<button data-tutorial-finish>Próxima situação</button>',wait:'<div class="guide-wait" role="status">Acompanhe a conversa…</div>'};
 const primary=controls[step.action]||`<button data-app="${step.app}">Abrir ${esc(appLabel)}</button>`;
 return `<aside class="first-call-guide ${state.tutorialCollapsed?'guide-collapsed':''}" data-guide-step="${step.number}" aria-label="Tutorial da primeira conversa">${mentor}<div class="guide-body"><div class="guide-heading"><small>PRIMEIRO CASO <b>${step.number} / ${total}</b></small><button data-tutorial="collapse" aria-expanded="${!state.tutorialCollapsed}">${state.tutorialCollapsed?'Mostrar dicas':'Recolher'}</button></div>${progress}<h2>${esc(step.title)}</h2>${state.tutorialCollapsed?'':`<p>${esc(step.text)}</p>${step.target?'<div class="guide-pointing"><span aria-hidden="true"></span> Siga o contorno verde-água. Ele marca o próximo clique.</div>':''}${step.example?`<details class="guide-example"><summary>Ver um exemplo de fala</summary><p>“${esc(step.example)}”</p><small>Procure uma opção que responda à dúvida. Não é preciso digitar.</small></details>`:''}<div class="guide-actions">${primary}<button data-tutorial="skip">${step.action==='finish'?'Fechar guia':'Pular tutorial'}</button></div><small class="guide-footnote">Treino com dados inventados. Depois deste caso, você segue sem respostas destacadas.</small>`}</div></aside>`;
}
export function tutorialTarget(state,ui={}){
 const step=tutorialStep(state,ui);if(!step)return null;
 const a=state.active;
 const firstChoice=state.mode==='defense'&&state.cursor===0&&state.tutorial==='defense'&&['ready','speaking'].includes(a?.chatStage)&&!a.outcome&&!a.actionPending?defenseCaseFor(a)?.choices.find(choice=>choice.safe&&!choice.witty):null;
 return [step.target,firstChoice?`[data-defense-choice="${firstChoice.id}"]`:null].filter(Boolean).join(',')||null;
}

// Reserve an actual column for the guide, including saved/maximized windows.
export function tutorialWindowRect(rect,viewport,guideWidth=330){
 const right=viewport.width-guideWidth-42;
 const x=Math.max(8,Math.min(rect.x,252,right-Math.min(rect.width,360)));
 const width=Math.min(rect.width,Math.max(1,right-x));
 return {x,width};
}
const highlightEffects=new Map();
export function applyTutorialHighlights(root,state,ui={}){
 for(const [node,effect] of highlightEffects){effect?.cancel();node.classList.remove('tutorial-spotlight');node.removeAttribute('data-tutorial-spotlight');}
 highlightEffects.clear();
 const selector=tutorialTarget(state,ui);
 if(!selector||['skipped','completed'].includes(state.tutorial))return;
 const targets=new Set(root.querySelectorAll(selector));
 const guideButton=root.querySelector('.first-call-guide .guide-actions button:not([data-tutorial="skip"])');
 if(guideButton)targets.add(guideButton);
 for(const target of targets){
  if(target.closest('.defense-chat')||target.disabled)continue;
  target.classList.add('tutorial-spotlight');target.setAttribute('data-tutorial-spotlight','true');
  // Animate only the ring: never opacity, fill, position, or the button text.
  // Web Animations keeps the cue running even when CSS motion is disabled.
  const effect=target.animate?.([
   {boxShadow:'0 0 0 3px #62e4b970, 0 0 12px #62e4b950'},
   {boxShadow:'0 0 0 7px #62e4b93d, 0 0 26px #62e4b9b0'},
   {boxShadow:'0 0 0 3px #62e4b970, 0 0 12px #62e4b950'}
  ],{duration:1800,iterations:Infinity,easing:'ease-in-out'});
  highlightEffects.set(target,effect);
 }
}
export function tutorialAction(state,action){
 if(!tutorialStep(state))return false;
 if(action==='start'){state.tutorial=state.mode==='defense'?'defense':'active';state.tutorialCollapsed=false;}
 else if(action==='skip')state.tutorial='skipped';
 else if(action==='collapse'&&['active','defense'].includes(state.tutorial))state.tutorialCollapsed=!state.tutorialCollapsed;
 else return false;
 return true;
}

export const tutorialGrantLine='Tutorial concluído! Toma C$ 100 de boas-vindas. O RH chamou de salário; eu chamo de milagre. Não gasta tudo em pato!';
export function settleTutorialGrant(state){
 if(state.tutorialGrant||state.mode!=='defense'||state.cursor!==0||!['active','defense'].includes(state.tutorial)||!state.active?.outcome||state.active.gameOver)return false;
 const before=state.credits;state.credits+=100;state.tutorialGrant={amount:100,before,after:state.credits};return true;
}
