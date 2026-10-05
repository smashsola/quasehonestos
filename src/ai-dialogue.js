// The server owns the key. The engine validates AI trust changes and owns items/payments.
import {conversationContext} from './conversation-context.js';
import {dialogueIntents} from './language.js';
export function dialogueHistory(log,limit=12){
 const lines=log.filter(m=>m.speaker!=='Sistema');
 const indices=lines.length<=limit?lines.map((_,i)=>i):[0,1,...Array.from({length:limit-2},(_,i)=>lines.length-(limit-2)+i)];
 return indices.map(i=>({speaker:lines[i].speaker,text:lines[i].text.slice(0,900)}));
}
export async function evaluateTrust(active,text,fetcher=fetch){
 try{
  const history=dialogueHistory(active.log,11);
  history.push({speaker:'Você',text:text.slice(0,400)});
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'trust',caller:active.caller,scheme:active.scheme,history,reference:'Avalie apenas a última mensagem do jogador.',context:conversationContext(active)}),signal:AbortSignal.timeout(13000)});
  if(!response.ok)return null;
  const result=await response.json();
  if(!Number.isInteger(result.trustDelta)||result.trustDelta< -25||result.trustDelta>25||typeof result.reason!=='string'||!result.reason.trim()||result.reason.length>180)return null;
  return {trustDelta:result.trustDelta,reason:result.reason,...(dialogueIntents.includes(result.intent)?{intent:result.intent}:{})};
 }catch{return null;}
}
export async function polishReply(active,reply,fetcher=fetch){
 try{
  const history=dialogueHistory(active.log.slice(0,-1),12);
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference:reply.text,context:conversationContext(active)}),signal:AbortSignal.timeout(13000)});
  if(!response.ok)return false;const data=await response.json();
  if(typeof data.text!=='string'||!data.text.trim()||data.text.length>700)return false;
  reply.text=data.text.trim();reply.ai=true;return true;
 }catch{return false;}
}
