import {schemeItems} from './data.js';

export const tutorialStory='No Trambique OS, você acompanha propostas suspeitas e pratica como se proteger. O Supervisor acompanha seu primeiro caso na Quase Honestos.';

const examples={
 link:{pitch:'Seus pontos do BatataPay renderam um vale-lanche.',answer:'O cadastro da página pede o titular e o cartão do jogo para registrar o resgate.',request:'Pode abrir a página de resgate?'},
 prize:{pitch:'Estou falando sobre o prêmio do concurso de desenho de batatas.',answer:'O pessoal do concurso de desenho organizou esse prêmio.',request:'Pode me passar o identificador do cartão BatataPay?'},
 support:{pitch:'É uma proposta de assistência para o seu PãoOS.',answer:'A assistência da firma está oferecendo esse serviço para o PãoOS.',request:'Pode abrir a sessão do PãoOS?'},
 club:{pitch:'Tenho um convite para o Clube VIP da Colher.',answer:'A organização do clube preparou esse convite para o evento.',request:'Pode compartilhar seu passe do clube?'},
 update:{pitch:'Esse pacote promete skins para o blaster da Batata Cósmica.',answer:'O pacote pede perfil e contato para registrar as skins.',request:'Pode instalar o pacote de skins que enviei?'}
};
export function tutorialStep(state){
 const a=state.active;
 if(state.mode==='defense'){
  if(state.finished||state.cursor!==0||['skipped','completed'].includes(state.tutorial))return null;
  if(!a)return {number:1,total:3,title:'Bata o ponto no Zape',text:'Abra o Zape Zape para receber o primeiro recado. O contorno verde-água mostra onde clicar. Este guia acompanha só esta primeira conversa.',app:'calls',target:'.desktop-icons [data-icon="calls"],.mobile-dock [data-app="calls"]'};
  if(a.outcome)return {number:3,total:3,title:'Você está no rumo!',text:'Leia o resultado: ele explica o risco e como confirmar por um canal conhecido. Você está no rumo, boa sorte no restante do expediente!',app:'calls',target:a.reactionTier==='success'?'.defense-feedback.is-success .defense-reaction-feedback':'.defense-feedback-actions .primary'};
  if(a.chatStage==='typing')return {number:1,total:3,title:'Uma mensagem nova chegou',text:'Os três pontos mostram que o contato está digitando. Espere a mensagem aparecer e observe o que ele está pedindo.',app:'calls'};
  if(a.chatStage==='speaking')return {number:2,total:3,title:'Observe o jeito de falar',text:'O personagem do outro lado murmura sozinho e a boca se mexe. Repare na urgência e no pedido enquanto a mensagem aparece.',app:'calls'};
  if(!a.murmurHeard)return {number:2,total:3,title:'Vamos entender os sinais',text:'O contorno verde-água indica onde tocar: abra “O que observar”. Cada pista explica o que chama atenção na mensagem.',app:'calls',action:'clues',target:'details.defense-clues > summary'};
  return {number:2,total:3,title:'Confira as pistas antes de agir',text:'Toque no bloco destacado “O que observar”. Compare as pistas com a mensagem para entender a lógica do risco e depois escolha uma ação segura.',app:'calls',action:'clues',target:'details.defense-clues > summary'};
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
export function tutorialPanel(state,esc,mobile=false){
 const step=tutorialStep(state);if(!step||['skipped','completed'].includes(state.tutorial))return '';
 const mentor='<div class="guide-mentor"><img src="/src/portraits/supervisor.svg" width="40" height="40" alt="" draggable="false"><div><small>SUPERVISÃO</small><span>Supervisor</span></div><span class="guide-file-number" aria-hidden="true">TREINO / 1</span></div>';
 const total=step.total||8;
 const progress=`<div class="guide-progress" aria-label="Etapa ${step.number} de ${total}">${Array.from({length:total},(_,i)=>`<span class="${i+1<step.number?'done':i+1===step.number?'current':''}"></span>`).join('')}</div>`;
 const started=state.mode==='defense'?state.tutorial==='defense':state.tutorial==='active';
 if(!started)return `<aside class="first-call-guide guide-invite" aria-label="Tutorial da primeira conversa">${mentor}<div class="guide-body"><small class="guide-eyebrow">SEU PRIMEIRO DIA</small><h2>Primeiro atendimento?</h2><p>${esc(tutorialStory)}</p><p>Eu mostro onde clicar e o objetivo de cada etapa. O papo com o personagem continua sendo seu.</p><p>${mobile?'Use Aplicativos na barra inferior para trocar de app. Toque em uma das quatro falas para responder.':'Use a barra para trocar de janela. Navegue pelas quatro falas com Tab e escolha com Enter.'}</p><div class="guide-actions"><button data-tutorial="start">Começar tutorial</button><button data-tutorial="skip">Jogar sem dicas</button></div><small class="guide-aside">O Supervisor acompanha só este primeiro caso.</small></div></aside>`;
 const appLabel=step.app==='calls'?'Zape Zape 2':step.app==='prize'?'Premia Fácil':schemeItems[state.active?.scheme]?.tool||step.app;
 return `<aside class="first-call-guide ${state.tutorialCollapsed?'guide-collapsed':''}" aria-label="Tutorial da primeira conversa">${mentor}<div class="guide-body"><div class="guide-heading"><small>ATENDIMENTO <b>${step.number} / ${total}</b></small><button data-tutorial="collapse" aria-expanded="${!state.tutorialCollapsed}">${state.tutorialCollapsed?'Mostrar dicas':'Recolher'}</button></div>${progress}<h2>${esc(step.title)}</h2>${state.tutorialCollapsed?'':`<p>${esc(step.text)}</p>${step.target?'<div class="guide-pointing"><span aria-hidden="true"></span> O contorno verde-água mostra onde tocar ou clicar.</div>':''}${step.example?`<details class="guide-example"><summary>Ver um exemplo de fala</summary><p>“${esc(step.example)}”</p><small>Procure uma opção que responda à dúvida. Não é preciso digitar.</small></details>`:''}<div class="guide-actions">${step.action==='clues'?'<button data-tutorial-clues>Clique aqui: ver as pistas</button>':step.number===3?'<button data-tutorial="skip">Concluir tutorial</button>':`<button data-app="${step.app}">Abrir ${esc(appLabel)}</button>`}${step.number===3?'':'<button data-tutorial="skip">Pular tutorial</button>'}</div><small class="guide-footnote">Use só os dados inventados do jogo. A confiança é um indicador da simulação, não uma nota de segurança nem de aprendizagem.</small>`}</div></aside>`;
}
export function tutorialTarget(state){return tutorialStep(state)?.target||null;}
export function tutorialAction(state,action){
 if(!tutorialStep(state))return false;
 if(action==='start'){state.tutorial='active';state.tutorialCollapsed=false;}
 else if(action==='skip')state.tutorial='skipped';
 else if(action==='collapse'&&['active','defense'].includes(state.tutorial))state.tutorialCollapsed=!state.tutorialCollapsed;
 else return false;
 return true;
}
