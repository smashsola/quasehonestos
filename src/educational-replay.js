import {replayComparison} from './replay-comparison.js';
import {callers} from './data.js';

export function replayEvents(a){
 const name=callers.find(c=>c.id===a.caller)?.name,log=a.log||[];let from=0;
 return (a.audit||[]).map(event=>{
  const index=log.findIndex((line,i)=>i>=from&&line.speaker==='Você'&&line.text===event.text);
  const response=index>=0?log.slice(index+1).find(line=>line.speaker===name):null;
  if(index>=0)from=index+1;
  const protection=['protect','wait'].includes(event.intent)||event.reason?.includes('verificação independente');
  const risk=protection?'Orientação de proteção registrada; esta fala não liberou dados novos.':event.signal||'Esta fala não registrou um novo sinal de risco.';
  const action=protection?'Conferir a origem por um canal conhecido; não compartilhar dados nesse contato.':event.intent==='refusal'?'Recusar um pedido é permitido. Se houver insistência ou ameaça, buscar ajuda de alguém de confiança.':event.intent==='unclear'||event.intent==='state-conflict'||event.intent==='doubt'?'Esclarecer a dúvida antes de decidir; não tratar ambiguidade como autorização.':/Pedido de dados|permissão/.test(event.signal||'')?'Conferir quem pede, para que precisa e se a permissão combina com a função.':/Pressa/.test(event.signal||'')?'Pausar e confirmar a situação por outro canal, sem ceder ao prazo.':'A simpatia ou uma explicação convincente não comprovam a origem de uma proposta.';
  return {...event,reaction:response?.text||event.reaction||'Reação não registrada neste salvamento antigo.',risk,protection:action};
 });
}

export function educationalReplay(a,esc){
 const events=replayEvents(a),comparison=replayComparison(a);if(!events.length)return '';
 const decisive=events.findLast(e=>['protect','refusal','wait','request','contradiction','correction','state-conflict'].includes(e.intent))||events.at(-1);
 const moment=event=>`<li><dl><div><dt>Você disse</dt><dd>“${esc(event.text)}”</dd></div><div><dt>Reação</dt><dd>“${esc(event.reaction)}”</dd></div><div><dt>Consequência registrada</dt><dd>${esc(event.reason)}</dd></div><div><dt>Risco observado</dt><dd>${esc(event.risk)}</dd></div><div><dt>Como se proteger</dt><dd>${esc(event.protection)}</dd></div></dl></li>`;
 const others=events.filter(e=>e!==decisive);
 return `<details class="learning-replay educational-replay" open><summary>O momento decisivo</summary><p class="replay-intro">O que aconteceu nesta conversa. Créditos e confiança não medem aprendizagem.</p><ol>${moment(decisive)}</ol>${others.length?`<details class="replay-more"><summary>Ver outros ${others.length} momentos</summary><ol>${others.map(e=>`<li><blockquote>“${esc(e.text)}”</blockquote><p>${esc(e.reaction)}</p><small>${esc(e.reason)}</small></li>`).join('')}</ol></details>`:''}${comparison&&!comparison.alreadyUsed?`<section class="replay-comparison"><h3>E se fosse diferente?</h3><p><b>Outra ação:</b> ${esc(comparison.action)}</p><p>${esc(comparison.hypothesis)}</p><small>${esc(comparison.timing)}</small></section>`:''}</details>`;
}
