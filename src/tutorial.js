import {schemeItems} from './data.js';

const examples={
 link:{pitch:'Seus pontos do BatataPay renderam um vale-lanche.',answer:'O cadastro da página pede o titular e o cartão do jogo para registrar o resgate.',request:'Pode abrir a página de resgate?'},
 prize:{pitch:'Estou falando sobre o prêmio do concurso de desenho de batatas.',answer:'O pessoal do concurso de desenho organizou esse prêmio.',request:'Pode me passar o identificador do cartão BatataPay?'},
 support:{pitch:'É uma proposta de assistência para o seu PãoOS.',answer:'A assistência da firma está oferecendo esse serviço para o PãoOS.',request:'Pode abrir a sessão do PãoOS?'},
 club:{pitch:'Tenho um convite para o Clube VIP da Colher.',answer:'A organização do clube preparou esse convite para o evento.',request:'Pode compartilhar seu passe do clube?'},
 update:{pitch:'Esse pacote promete skins para o blaster da Batata Cósmica.',answer:'O pacote pede perfil e contato para registrar as skins.',request:'Pode instalar o pacote de skins que enviei?'}
};
export function tutorialStep(state){
 const a=state.active;
 if(state.finished||state.cursor!==0||(state.history?.length||0)>0)return null;
 if(!a)return {number:1,title:'Pode bater o ponto',text:'Abra o Zape Zape 2 e comece o expediente. No primeiro atendimento, deixei umas dicas aqui do lado.',app:'calls'};
 if(a.outcome)return {number:8,title:'Leia o que aconteceu',text:'O resultado explica o que foi exposto e qual defesa poderia interromper a tentativa. Mesmo uma recusa faz parte do jogo. Depois, continue para o próximo atendimento.',app:'calls'};
 if(!a.scheme)return {number:2,title:'Qual vai ser a proposta?',text:'Escolha uma proposta no Zape. No prêmio, você conversa, pede o cartão fictício e usa a Carteira. As outras propostas usam outros apps.',app:'calls'};
 if(!a.prepared)return {number:3,title:'Prepare o app da proposta',text:'Escolha a oferta e clique no botão de preparar. Isso começa o papo; não dá dinheiro nem libera os dados do personagem.',app:a.scheme==='prize'?'prize':schemeItems[a.scheme].app};
 if(a.scheme==='link'&&a.prepared&&a.stage==='request')return {number:6,title:!a.linkSent?'Envie a página':!a.linkOpened?'A página chegou':'Abrir não é preencher',text:!a.linkSent?'Use Enviar página de resgate no Zape.':!a.linkOpened?'Converse sobre abrir a página. O personagem ainda pode recusar.':'O cadastro está vazio. O personagem precisa decidir se preenche e envia os dados fictícios.',example:a.linkSent?(a.linkOpened?'Pode preencher e enviar o cadastro do resgate?':'Pode abrir a página de resgate?'):null,app:'calls'};
 if(a.stage==='ready'&&a.scheme==='link')return {number:7,title:'Confira o cadastro recebido',text:'O retorno da página está no chat. Abra Clona Cartão, confira o cadastro e veja o débito antes de confirmar.',app:'link'};
 if(a.stage==='ready'){
  const app=schemeItems[a.scheme].app;
  const text=a.scheme==='update'?`A instalação revelou os dados pelo pacote. Revise os ${Math.max(0,3-(a.reviewedData?.length||0))} dados restantes no Pacote Surpresa e registre a operação.`:a.scheme==='support'?(a.diagnostic?'Abra Banco do Pão no PC fictício e confira a cobrança antes de concluir.':'Abra Diagnóstico dentro da Torradeira Remota e verifique a sessão fictícia.'):a.checkedToken===a.item?.token?'Código conferido. Leia o valor e confirme a operação no app. Os créditos só entram nessa etapa.':'Copie o código QH-DEMO da conversa, digite no app e use Conferir. Só aceitar a proposta não movimenta créditos.';
  return {number:7,title:'Use o item no app correto',text,app};
 }
 if(a.stage==='request'&&a.scheme==='update'&&!a.fileSent)return {number:6,title:'Envie o arquivo da história',text:'Use Enviar CosmicChanger.qh no Zape. Enviar não significa instalar: depois, o personagem ainda precisa concordar.',app:'calls'};
 const phase=a.stage==='question'?'answer':a.stage==='request'?'request':'pitch';
 return {number:phase==='pitch'?4:phase==='answer'?5:6,title:phase==='pitch'?'Explique sua proposta':phase==='answer'?'Responda à dúvida':'Peça a ação certa',text:phase==='pitch'?'Escreva o que você está oferecendo. A reação depende do conteúdo da fala; cumprimentar não substitui a proposta.':phase==='answer'?'Leia a última pergunta e responda a ela. Repetir a oferta não resolve toda dúvida; uma resposta pode ser recusada.':'Peça somente o item ou a permissão dessa proposta. Cartão não instala arquivo, e passe do clube não abre computador.',example:examples[a.scheme]?.[phase],app:'calls'};
}
export function tutorialPanel(state,esc,mobile=false){
 const step=tutorialStep(state);if(!step||['skipped','completed'].includes(state.tutorial))return '';
 const mentor='<div class="guide-mentor"><img src="/src/portraits/boss.svg" width="40" height="40" alt="" draggable="false"><div><small>RECADO INTERNO</small><span>Chefia</span></div><span class="guide-file-number" aria-hidden="true">RH / 01</span></div>';
 const progress=`<div class="guide-progress" aria-label="Etapa ${step.number} de 8">${Array.from({length:8},(_,i)=>`<span class="${i+1<step.number?'done':i+1===step.number?'current':''}"></span>`).join('')}</div>`;
 if(state.tutorial!=='active')return `<aside class="first-call-guide guide-invite" aria-label="Tutorial da primeira conversa">${mentor}<div class="guide-body"><small class="guide-eyebrow">SEU PRIMEIRO DIA</small><h2>Já trabalhou com isso?</h2><p>Deixei o passo a passo do primeiro atendimento aqui. Quando precisar trocar de app, eu aviso. O papo com o cliente é com você.</p><p>${mobile?'Use Aplicativos na barra inferior para trocar de app. Enter pula linha; toque em Enviar.':'Use a barra para trocar de janela. Enter envia; Shift + Enter pula linha.'}</p><div class="guide-actions"><button data-tutorial="start">Começar tutorial</button><button data-tutorial="skip">Jogar sem dicas</button></div><small class="guide-aside">Depois assina o treinamento. A caneta sumiu.</small></div></aside>`;
 return `<aside class="first-call-guide ${state.tutorialCollapsed?'guide-collapsed':''}" aria-label="Tutorial da primeira conversa">${mentor}<div class="guide-body"><div class="guide-heading"><small>ATENDIMENTO <b>${step.number} / 8</b></small><button data-tutorial="collapse" aria-expanded="${!state.tutorialCollapsed}">${state.tutorialCollapsed?'Mostrar dicas':'Recolher'}</button></div>${progress}<h2>${esc(step.title)}</h2>${state.tutorialCollapsed?'':`<p>${esc(step.text)}</p>${step.example?`<details class="guide-example"><summary>Ver um exemplo de fala</summary><p>“${esc(step.example)}”</p><small>Pode escrever do seu jeito. Isso é só um exemplo.</small></details>`:''}<div class="guide-actions"><button data-app="${step.app}">Abrir ${esc(step.app==='calls'?'Zape Zape 2':step.app==='prize'?'Premia Fácil':schemeItems[state.active.scheme].tool)}</button><button data-tutorial="skip">Pular tutorial</button></div><small class="guide-footnote">Use só os dados inventados do jogo. Confiança não garante segurança.</small>`}</div></aside>`;
}
export function tutorialAction(state,action){
 if(!tutorialStep(state))return false;
 if(action==='start'){state.tutorial='active';state.tutorialCollapsed=false;}
 else if(action==='skip')state.tutorial='skipped';
 else if(action==='collapse'&&state.tutorial==='active')state.tutorialCollapsed=!state.tutorialCollapsed;
 else return false;
 return true;
}
