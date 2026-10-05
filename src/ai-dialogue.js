// The server owns the key. The engine validates AI trust changes and owns items/payments.
import {conversationContext} from './conversation-context.js';
import {dialogueIntents} from './language.js';
export async function evaluateTrust(active,text,fetcher=fetch){
 try{
  const history=active.log.filter(m=>m.speaker!=='Sistema').slice(-11).map(({speaker,text})=>({speaker,text:text.slice(0,900)}));
  history.push({speaker:'Você',text:text.slice(0,400)});
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'trust',caller:active.caller,scheme:active.scheme,history,reference:'Avalie apenas a última mensagem do jogador.',context:conversationContext(active)}),signal:AbortSignal.timeout(9000)});
  if(!response.ok)return null;
  const result=await response.json();
  if(!Number.isInteger(result.trustDelta)||result.trustDelta< -25||result.trustDelta>25||typeof result.reason!=='string'||!result.reason.trim()||result.reason.length>180)return null;
  return {trustDelta:result.trustDelta,reason:result.reason,...(dialogueIntents.includes(result.intent)?{intent:result.intent}:{})};
 }catch{return null;}
}
export async function polishReply(active,reply,fetcher=fetch){
 try{
  const history=active.log.filter(m=>m.speaker!== 'Sistema').slice(-13,-1).map(({speaker,text})=>({speaker,text:text.slice(0,900)}));
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference:reply.text,context:conversationContext(active)}),signal:AbortSignal.timeout(9000)});
  if(!response.ok)return false;const data=await response.json();
  if(typeof data.text!=='string'||!data.text.trim()||data.text.length>700)return false;
  reply.text=data.text.trim();reply.ai=true;return true;
 }catch{return false;}
}
