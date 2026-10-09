export const bossQuestions=[
 {id:'leave',label:'Posso ir embora?',reply:'Pode. Só leva a reunião pra casa e devolve ela resolvida amanhã. Brincadeira. Nem eu sei do que ela era.'},
 {id:'raise',label:'E minha promoção?',reply:'Já está aprovada: agora você é Estagiário Sênior de Coisas Que Sobram. O salário foi promovido a assunto delicado.'},
 {id:'computer',label:'Quem desliga o computador?',reply:'A internet, quando eu abrir minha trigésima oitava aba. É nosso sistema de economia de energia.'}
];
export function shiftReceipt(state){
 const history=state.history||[],inbox=state.incoming?.history||[];
 const amount=value=>Number.isFinite(value)?Math.max(0,value):0;
 return {earned:history.reduce((sum,h)=>sum+amount(h.earned),0),lost:inbox.reduce((sum,h)=>sum+amount(h.penalty),0),balance:amount(state.credits),calls:history.length,risky:inbox.filter(h=>h.safe===false).length};
}
export function bossClosing(state){
 const receipt=shiftReceipt(state);
 const inbox=receipt.lost>0?`Vi C$ ${receipt.lost} escaparem nos recados. A firma dos outros também tinha meta, pelo visto.`:receipt.risky?'Teve recado suspeito que você aceitou. O saldo escapou, mas a história merece uma conferida.':state.incoming?.history?.length?'Você segurou o dinheiro nos recados. O financeiro tentou comemorar, mas a calculadora pediu férias.':'O correio ficou quieto? Milagre. Normalmente até a impressora manda cobrança.';
 const decor=state.decor?.includes('duck')?'O pato supervisor foi promovido. Você pode ficar com o cargo antigo dele: olhar pra mesa.':state.decor?.includes('plant')?'A samambaia foi a funcionária do mês. Chegou no horário e não abriu um chamado.':'Agora pode ir. Amanhã tem reunião para decidir quais reuniões podiam ter sido um recado.';
 return ['Expediente encerrado. Eu trabalhei bastante também: abri uma planilha, me assustei e fechei.',inbox,decor];
}
export function shiftLearning(state){
 const history=state.history||[];
 return {shared:history.filter(h=>h.item).length,verified:history.filter(h=>h.audit?.some(event=>event.intent==='protect'||event.reason==='Uma verificação independente interrompeu a tentativa.')).length,withoutSharing:history.filter(h=>!h.item).length};
}
export function shiftEnding(state,esc){
 if(!state.finished)return '';
 const receipt=shiftReceipt(state),reply=bossQuestions.find(q=>q.id===state.bossReply),learning=shiftLearning(state);
 return `<section class="welcome shift-ending"><div class="shift-stamp"><span></span> EXPEDIENTE ENCERRADO</div><h1>Deu por hoje.<br>O chefe ainda não.</h1><div class="shift-receipt" aria-label="Resumo dos créditos"><div><small>Recebidos no expediente</small><strong>C$ ${receipt.earned}</strong></div><div><small>Perdidos nos recados</small><strong class="${receipt.lost?'receipt-loss':''}">C$ ${receipt.lost}</strong></div><div><small>Saldo da firma</small><strong>C$ ${receipt.balance}</strong></div></div><p class="receipt-note">O saldo também considera suas compras na loja. Créditos não medem aprendizado.</p><section class="shift-learning" aria-label="O que aconteceu nas conversas"><small>ANTES DE BATER O PONTO</small><h2>Dinheiro é uma parte da história.</h2><div class="shift-learning-grid"><div><strong>${learning.shared}</strong><span>conversas com item compartilhado</span></div><div><strong>${learning.verified}</strong><span>decisões de conferir por canal conhecido</span></div><div><strong>${learning.withoutSharing}</strong><span>conversas sem compartilhar item</span></div></div><p>Uma recusa por irritação não é uma verificação. Nos Resultados, veja a decisão de cada personagem e a defesa que faria diferença.</p>${state.tutorial==='completed'?'<span class="training-done">Primeira conversa guiada concluída. O restante do expediente foi por sua conta.</span>':''}</section><article class="boss-goodbye"><div class="boss-contact"><img src="/src/portraits/boss.svg" alt="Chefe com um crachá torto" draggable="false" width="62" height="62"><div><small>CHEFIA · ÚLTIMO RECADO, JURO</small><strong>Antes que você vá…</strong><span>digitou sem consultar o RH</span></div></div><div class="boss-lines">${bossClosing(state).map(line=>`<p>${esc(line)}</p>`).join('')}</div><div class="boss-questions" aria-label="Perguntas para o chefe">${bossQuestions.map(q=>`<button data-boss-question="${q.id}" aria-pressed="${state.bossReply===q.id}">${esc(q.label)}</button>`).join('')}</div>${reply?`<div class="boss-answer" role="status"><small>Você: ${esc(reply.label)}</small><p>${esc(reply.reply)}</p></div>`:''}</article><div class="shift-actions"><button data-app="ledger">Conferir os recibos</button><button class="primary" data-action="reset">Novo expediente</button></div><p class="ending-footnote">${receipt.calls} atendimentos registrados. Veja nos resultados o que aconteceu e o que poderia ter protegido cada pessoa.</p></section>`;
}
