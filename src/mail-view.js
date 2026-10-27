import {incomingScene} from './incoming-scenes.js';
import {shuffledChoices} from './choice-order.js';
import {officeIcon} from './office-icons.js';
import {childGlossary} from './audience.js';
export function mailMoney(result,animate=false){
 if(!Number.isFinite(result.penalty))return '<p class="incoming-money">Recado antigo: sem movimentação registrada.</p>';
 const label=result.reward?'+ C$ '+result.reward+' pelo cuidado na conferência.':result.partial?'Sem ganho nem desconto: falta conferir a origem.':result.penalty?'− C$ '+result.penalty+' do saldo fictício.':'Nenhum C$ perdido.';
 return `<p class="incoming-money ${result.reward?'kept':result.penalty?'lost':''}">${animate?`<b data-money-delta="${result.reward||-result.penalty}">${result.reward?'+':'−'} C$ ${result.reward||result.penalty||0}</b> ${result.reward?'pela conferência.':'do saldo fictício.'}`:label}<span>Saldo após a resposta: C$ ${result.after}</span></p>`;
}
export function mailGuide(){return `<aside class="mail-coach"><img src="/src/portraits/supervisor-lia.svg" width="40" height="40" alt="Lia"><div><small>PRIMEIRO RECADO NO CORREIO</small><p>O Correio traz desafios extras. Leia quem mandou, confira o pedido por outro canal e escolha uma resposta. Conferir corretamente rende um bônus pequeno; só abrir a mensagem não rende dinheiro.</p><p>O X deste recado recolhe a mensagem. O X vermelho fecha o Correio. Suas respostas aparecem no balanço do dia.</p><button data-mail-guide-close>Entendi</button></div></aside>`;}
export function mailMessageView(state,escape){
 const p=state.incoming?.pending,scene=incomingScene(p);if(!p||!scene)return '';
 const r=p.result,guided=!state.incoming.tutorialSeen,child=p.audience==='child';
 const coach=guided&&p.open?mailGuide():'';
 const choices=shuffledChoices({caseId:p.scene,choiceSeed:p.id},scene.choices,'mail');
 return `<header><span class="incoming-symbol">${officeIcon('boss')}</span><div><small>${r?'RECADO RESPONDIDO':'NOVA MENSAGEM'}</small><strong>${escape(p.sender)}</strong></div><button data-incoming="${r?'dismiss':'later'}" aria-label="${r?'Guardar recado respondido':'Recolher mensagem'}"><svg class="window-close-symbol" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button></header>${!p.open?`<p>${escape(scene.message.slice(0,100))}…</p><button class="incoming-open" data-incoming="open">Ler o recado</button>`:`<div class="incoming-body">${coach}<div class="mail-training-reward">${officeIcon('wallet')} Bônus do treino: + C$ ${scene.reward||20} ao conferir corretamente</div><div class="unknown-sender">Contato fora da sua lista</div><blockquote>${escape(scene.message)}</blockquote>${child?childGlossary(scene.message+scene.choices.map(c=>c.label).join(' '),escape):''}${r?`<div class="defense-feedback ${r.safe?'safe':'review'}" role="status"><strong>${r.safe?'Pedido conferido.':r.partial?'Você fez uma pausa.':'O pedido não foi confirmado.'}</strong><p>${escape(r.feedback)}</p>${mailMoney(r,!!(r.reward||r.penalty))}<small>Sinal de atenção: ${escape(r.signal)}</small></div><button class="incoming-open" data-incoming="dismiss">Guardar recado e continuar</button>`:`<p>Como você responde?</p><div class="defense-options">${choices.map(c=>`<button data-incoming-choice="${c.id}">${escape(c.label)}</button>`).join('')}</div>`}</div>`}`;
}
export function mailDayRecap(state,day,escape){
 const rows=(state.incoming?.history||[]).filter(h=>(h.day||1)===day),p=state.incoming?.pending,pending=p&&!p.result&&(p.day||day)===day;
 return `<details class="mail-day-recap"><summary>${officeIcon('boss')}<span><b>Correio do dia</b><small>${rows.length} recado(s) respondido(s)${pending?' · um recado pendente':''}</small></span><i aria-hidden="true"></i></summary><div>${rows.length?rows.map(h=>`<article><h3>${escape(h.sender)}</h3><p><b>Sua escolha:</b> ${escape(h.label)}</p><p>${escape(h.feedback)}</p>${mailMoney(h)}</article>`).join(''):'<p>Nenhuma resposta registrada no Correio neste dia.</p>'}${pending?'<p>Há uma mensagem esperando no Correio. Você pode abri-la pela barra de aplicativos.</p>':''}</div></details>`;
}
