import {validStructuredReply} from './structured-reply.js';
// The server owns the key. The engine validates AI trust changes and owns items/payments.
import {conversationContext} from './conversation-context.js';
import {replyIsGrounded} from './dialogue-model-rules.js';
import {applyReplyEmotion} from './mood.js';
import {dialogueIntents} from './language.js';
import {publicDialogueAI,looksPersonal} from './privacy-data.js';
export function dialogueHistory(log,limit=12){
 const lines=log.filter(m=>m.speaker!=='Sistema');
 const indices=lines.length<=limit?lines.map((_,i)=>i):[0,1,...Array.from({length:limit-2},(_,i)=>lines.length-(limit-2)+i)];
 return indices.map(i=>({speaker:lines[i].speaker,text:lines[i].text.slice(0,900)}));
}
export async function evaluateTrust(active,text,fetcher=fetch){
 if((!publicDialogueAI&&fetcher===fetch)||looksPersonal(text)||active.log.some(m=>looksPersonal(m.text)))return null;
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
const pendingReplies=new WeakMap();
export function polishReply(active,reply,fetcher=fetch){
 if(reply.ai)return Promise.resolve(true);
 if(pendingReplies.has(reply))return pendingReplies.get(reply);
 const pending=polishReplyOnce(active,reply,fetcher).finally(()=>pendingReplies.delete(reply));
 pendingReplies.set(reply,pending);return pending;
}
async function polishReplyOnce(active,reply,fetcher){
 if((!publicDialogueAI&&fetcher===fetch)||active.log.some(m=>looksPersonal(m.text)))return false;
 try{
  const history=dialogueHistory(active.log.slice(0,-1),12);
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'grounded-reply',caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference:reply.text,context:conversationContext(active)}),signal:AbortSignal.timeout(13000)});
  if(!response.ok)return false;const data=await response.json();
  if(active.lastIntent&&!validStructuredReply(data,history,reply.text,conversationContext(active)))return false;
  if(typeof data.text!=='string'||!data.text.trim()||data.text.length>700||!replyIsGrounded(data.text,history,reply.text,conversationContext(active)))return false;
  reply.text=data.text.trim();reply.ai=true;if(data.emotion)applyReplyEmotion(active,data.emotion);return true;
 }catch{return false;}
}
