import {validStructuredReply} from './structured-reply.js';
// Qwen describes language and drafts speech. The local engine owns every result.
import {conversationContext} from './conversation-context.js';
import {replyIsGrounded} from './dialogue-model-rules.js';
import {remoteDialogueAllowed} from './dialogue-safety.js';
import {applyReplyEmotion,expressions} from './mood.js';
import {validateSemanticAnalysis} from './semantic-contract.js';
import {publicDialogueAI} from './privacy-data.js';
export function dialogueHistory(log,limit=12){
 const lines=log.filter(m=>m.speaker!=='Sistema');
 const indices=lines.length<=limit?lines.map((_,i)=>i):[0,1,...Array.from({length:limit-2},(_,i)=>lines.length-(limit-2)+i)];
 return indices.map(i=>({speaker:lines[i].speaker,text:lines[i].text.slice(0,900)}));
}
export async function analyzeMessage(active,text,fetcher=fetch){
 if((!publicDialogueAI&&fetcher===fetch)||!remoteDialogueAllowed(text)||active.log.some(m=>!remoteDialogueAllowed(m.text))){diagnose(active,'fallback','local-or-filtered',null,'interpret');return null;}
 try{
  const history=dialogueHistory(active.log,11);
  history.push({speaker:'Você',text:text.slice(0,400)});
  const before=conversationContext(active);
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'interpret',caller:active.caller,scheme:active.scheme,history,reference:'Interprete apenas a fala do jogador, sem calcular consequências.',context:before}),signal:AbortSignal.timeout(5000)});
  if(!response.ok){diagnose(active,'fallback',response.status,null,'interpret');return null;}
  if(JSON.stringify(conversationContext(active))!==JSON.stringify(before)){diagnose(active,'fallback','stale',null,'interpret');return null;}
  const result=validateSemanticAnalysis(await response.json(),history);
  diagnose(active,result?'api':'fallback',result?response.status:'validation',response.headers?.get('X-Dialogue-Model'),'interpret');
  return result;
 }catch{diagnose(active,'fallback','unavailable',null,'interpret');return null;}
}
// Compatibility for external imports; there is no remote trust score anymore.
export const evaluateTrust=analyzeMessage;
const pendingReplies=new WeakMap();
const diagnostics=new WeakMap();
export const dialogueDiagnostic=reply=>diagnostics.get(reply)||null;
function diagnose(reply,source,status,model=null,phase='draft'){
 const value={source,status,model,phase};diagnostics.set(reply,value);
 if(typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname))console.info('[dialogue]',value);
}
export function polishReply(active,reply,fetcher=fetch){
 if(reply.ai)return Promise.resolve(true);
 if(pendingReplies.has(reply))return pendingReplies.get(reply);
 const pending=polishReplyOnce(active,reply,fetcher).finally(()=>pendingReplies.delete(reply));
 pendingReplies.set(reply,pending);return pending;
}
async function polishReplyOnce(active,reply,fetcher){
 if((!publicDialogueAI&&fetcher===fetch)||active.log.some(m=>!remoteDialogueAllowed(m.text)))return false;
 try{
  const history=dialogueHistory(active.log.slice(0,-1),12);
  const context=conversationContext(active),reference=reply.text;
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'grounded-reply',caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference,context}),signal:AbortSignal.timeout(7000)});
  if(!response.ok){diagnose(reply,'fallback',response.status);return false;}const data=await response.json();
  if(JSON.stringify(conversationContext(active))!==JSON.stringify(context)||reply.text!==reference){diagnose(reply,'fallback','stale');return false;}
  if(active.lastIntent&&!validStructuredReply(data,history,reference,context)){diagnose(reply,'fallback','validation');return false;}
  if(!data||Object.keys(data).some(key=>!['text','emotion','decision','intent','evidence'].includes(key))||(data.emotion!==undefined&&!expressions.includes(data.emotion))||typeof data.text!=='string'||!data.text.trim()||data.text.length>700||!replyIsGrounded(data.text,history,reference,context)){diagnose(reply,'fallback','grounding');return false;}
  reply.text=data.text.trim();reply.ai=true;diagnose(reply,'api',response.status,response.headers?.get('X-Dialogue-Model'));if(data.emotion)applyReplyEmotion(active,data.emotion);return true;
 }catch{diagnose(reply,'fallback','unavailable');return false;}
}
