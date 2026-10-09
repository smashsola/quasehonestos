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
 const events=replayEvents(a);if(!events.length)return '';
 return `<details class="learning-replay educational-replay" open><summary>Replay: fala, reação e proteção</summary><p class="replay-intro">Estas são as falas desta partida. A confiança descreve o personagem; não mede seu conhecimento.</p><ol>${events.map(event=>`<li><dl><div><dt>Você disse</dt><dd>“${esc(event.text)}”</dd></div><div><dt>O personagem respondeu</dt><dd>“${esc(event.reaction)}”</dd></div><div><dt>O que ficou registrado</dt><dd>${esc(event.reason)}</dd></div><div><dt>Risco observado</dt><dd>${esc(event.risk)}</dd></div><div><dt>Atitude de proteção</dt><dd>${esc(event.protection)}</dd></div></dl><span class="trust-change">Confiança do personagem: ${Math.round(event.before/3*100)}% para ${Math.round(event.after/3*100)}%</span></li>`).join('')}</ol></details>`;
}
