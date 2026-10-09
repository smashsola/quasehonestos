import {callers} from './data.js';

// This address is a prop. It is never navigated to or submitted to a server.
export const cloneAddress='resgate-batatapay.example.invalid';
export function clonedFields(a){
 const person=callers.find(c=>c.id===a?.caller);
 if(!person||a.scheme!=='link'||!a.linkSubmitted||!a.item)return [];
 return [{label:'Titular no jogo',value:person.name},{label:'Cartão BatataPay',value:a.item.token},{label:'Código de resgate fictício',value:'QH-DEMO-RESGATE-'+person.id.toUpperCase()}];
}
export function sendCloneLink(state){
 const a=state.active;
 if(!a||a.scheme!=='link'||!a.prepared||a.stage!=='request'||a.outcome||a.linkSent)return false;
 a.linkSent=true;a.steps??=[];a.steps.push('Link cenográfico enviado');
 a.log.push({speaker:'Você',text:'Segue a página de resgate dos pontos do BatataPay.',linkPreview:cloneAddress});return true;
}
export function reviewClonedCard(state){
 const a=state.active;
 if(!a||a.scheme!=='link'||a.stage!=='ready'||a.outcome||!a.linkSubmitted||!a.item||a.cardReviewed)return false;
 a.cardReviewed=true;a.steps.push('Cadastro fictício conferido no Clona Cartão');return true;
}
export function cloneReceipt(a){return {speaker:'Sistema',source:'link-form',text:'Cadastro enviado pelo personagem na página de resgate: '+clonedFields(a).map(f=>f.label+': '+f.value).join(' · ')+'. A página repassou estes dados à firma.'};}
export function cloneContent(state,esc,busy=false){
 const a=state.active,selected=a?.scheme==='link',received=selected&&a.linkSubmitted&&a.item&&!busy;
 const step=!selected||!a.prepared?0:!a.linkSent?1:!a.linkOpened?2:!received?3:4;
 const labels=['Preparar página','Enviar link','Abrir página','Preencher cadastro','Receber cartão'];
 return `<section class="welcome clone-app"><small>CLONA CARTÃO · BATATAPAY DE MENTIRINHA</small><h1>Central de resgates</h1><p>Prometa um resgate de pontos. O cartão só aparece aqui se o personagem preencher e enviar o cadastro da história.</p><ol class="app-flow">${labels.map((label,i)=>`<li class="${i<step?'complete':i===step?'current':''}"><b>${i+1}</b>${label}</li>`).join('')}</ol><section class="clone-browser" aria-label="Página fictícia de resgate"><div class="clone-address"><span>Página do jogo</span><code>${cloneAddress}</code></div><div class="clone-page"><small>BATATAPAY · RESGATE DE PONTOS</small><h2>Seus pontos renderam!</h2><p>Troque seus pontos por um vale-lanche na Lanchonete da Batata.</p><dl>${['Titular no jogo','Cartão BatataPay','Código de resgate fictício'].map(label=>`<div><dt>${label}</dt><dd>${received?esc(clonedFields(a).find(f=>f.label===label).value):'Aguardando o personagem'}</dd></div>`).join('')}</dl><span class="clone-preview-note">Prévia cenográfica. Quem preenche é o personagem; não há campos para dados reais.</span></div></section>${!selected?'<button data-app="calls">Escolher proposta no Zape</button>':!a.prepared?'<button class="primary" data-prepare="link">Preparar página e conversar</button>':a.outcome?`<p class="app-step-note">${a.outcome==='fooled'?'Operação registrada. O vale-lanche nunca chegou.':'Atendimento encerrado. Nenhuma nova operação disponível.'}</p>`:!received?`<div class="app-step-note"><strong>${!a.linkSent?'Link ainda não enviado':!a.linkOpened?'Link enviado. Cadastro vazio.':'Página aberta. Cadastro ainda vazio.'}</strong><p>${!a.linkSent?'Explique a oferta e responda à dúvida. Depois envie o link pelo botão no Zape.':!a.linkOpened?'Retome a conversa. O personagem decide se abre a página; receber o link não entrega o cartão.':'O personagem viu os campos. Ele ainda precisa decidir se preenche e envia. Só abrir a página não revela dados.'}</p></div><button data-app="calls">Voltar à conversa</button>`:`<section class="clone-received"><h2>Cadastro recebido</h2><p>Origem: formulário preenchido por ${esc(callers.find(c=>c.id===a.caller).name)}. A confirmação também está no Zape.</p><button data-review-clone ${a.cardReviewed?'disabled':''}>${a.cardReviewed?'Cadastro conferido':'Conferir cadastro recebido'}</button><div class="operation-total"><span>Débito no BatataPay do personagem</span><strong>C$ 450</strong></div><button class="primary" data-execute="link" ${!a.cardReviewed?'disabled':''}>Usar cartão fictício · C$ 450</button></section>`}<p class="operation-footnote">O link não clona nada ao ser aberto. A armadilha é entregar dados a uma página cuja origem não foi conferida. Toda a operação acontece dentro do jogo.</p></section>`;
}
