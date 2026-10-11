import {validStructuredReply} from './structured-reply.js';
import {conversationContext} from './conversation-context.js';
import {replyIsGrounded} from './dialogue-model-rules.js';
import {remoteDialogueAllowed} from './dialogue-safety.js';
import {applyReplyEmotion,expressions} from './mood.js';
import {validateSemanticAnalysis} from './semantic-contract.js';
import {publicDialogueAI} from './privacy-data.js';
import {dialogueModel} from './dialogue-config.js';
import {failureMetadata} from './dialogue-diagnostics.js';
const diagnostics=new WeakMap(),pendingReplies=new WeakMap(),pendingAnalysis=new WeakMap();
export const dialogueDiagnostic=value=>diagnostics.get(value)||null;
export function dialogueHistory(log,limit=12,person=null){
 const lines=log.filter(m=>m&&typeof m.text==='string'&&m.speaker!=='Sistema'&&(!person||m.speaker==='Você'||m.speaker===person));
 const indices=lines.length<=limit?lines.map((_,i)=>i):[0,1,...Array.from({length:limit-2},(_,i)=>lines.length-(limit-2)+i)];
 return indices.map(i=>({speaker:lines[i].speaker,text:lines[i].text.slice(0,900)}));
}
const names={nino:'Nino',olga:'Olga',davi:'Davi',yara:'Yara',pri:'Pri',bento:'Bento'};
const snapshot=a=>JSON.stringify({caller:a.caller,scheme:a.scheme,context:conversationContext(a),log:a.log});
function diagnose(value,source,status,model,phase,details={}){
 const metadata={source,status,model:model||null,configuredModel:dialogueModel.id,phase,...details};diagnostics.set(value,metadata);
 if(typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname))console.info('[dialogue]',metadata);
}
async function request(value,phase,payload,fetcher,timeout){
 const started=performance.now(),details={calls:1,contextMessages:payload.history.length,contextChars:JSON.stringify(payload.context).length+payload.history.reduce((n,m)=>n+m.text.length,0)};
 try{
  const response=await fetcher('/api/dialogue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(timeout)});
  details.durationMs=Math.round(performance.now()-started);
  let data;try{data=await response.json();}catch{diagnose(value,'fallback',response.status,null,phase,{...details,reason:response.ok?'parsing':'http',code:null});return null;}
  if(!response.ok){const reasons=['quota','capacity','timeout','aborted','empty','json','parsing','truncated','semantics','grounding','validation','provider-unavailable'];diagnose(value,'fallback',response.status,null,phase,{...details,reason:reasons.includes(data?.diagnostic)?data.diagnostic:'http',code:Number.isInteger(data?.code)?data.code:null});return null;}
  if(data==null||data===''){diagnose(value,'fallback',response.status,null,phase,{...details,reason:'empty',code:null});return null;}
  diagnose(value,'api',response.status,response.headers?.get('X-Dialogue-Model'),phase,{...details,reason:null,code:null});return data;
 }catch(error){diagnose(value,'fallback','unavailable',null,phase,{...details,durationMs:Math.round(performance.now()-started),...failureMetadata(error)});return null;}
}
const reject=(value,phase,reason)=>{const d=dialogueDiagnostic(value)||{};diagnose(value,'fallback',d.status||'unavailable',d.model,phase,{...d,source:'fallback',reason});return null;};
export function analyzeMessage(active,text,fetcher=fetch){
 const fingerprint=snapshot(active)+text,existing=pendingAnalysis.get(active);
 if(existing?.fingerprint===fingerprint)return existing.promise;
 if(existing)return Promise.resolve(null);
 const promise=analyzeOnce(active,text,fetcher).finally(()=>{if(pendingAnalysis.get(active)?.promise===promise)pendingAnalysis.delete(active);});
 pendingAnalysis.set(active,{fingerprint,promise});return promise;
}
async function analyzeOnce(active,text,fetcher){
 if((!publicDialogueAI&&fetcher===fetch)||!remoteDialogueAllowed(text)||active.log.some(m=>!remoteDialogueAllowed(m.text))){diagnose(active,'fallback','local-or-filtered',null,'interpret',{calls:0,durationMs:0,reason:'local-or-filtered'});return null;}
 const history=dialogueHistory(active.log,11,names[active.caller]);history.push({speaker:'Você',text:text.slice(0,400)});
 const before=snapshot(active),result=await request(active,'interpret',{mode:'interpret',caller:active.caller,scheme:active.scheme,history,reference:'Interprete apenas a fala do jogador, sem calcular consequências.',context:conversationContext(active)},fetcher,5000);
 if(!result)return null;if(snapshot(active)!==before)return reject(active,'interpret','stale');
 const analysis=validateSemanticAnalysis(result,history);return analysis||reject(active,'interpret','validation');
}
export const evaluateTrust=analyzeMessage;
export function polishReply(active,reply,fetcher=fetch){
 if(reply.ai)return Promise.resolve(true);
 if(pendingReplies.has(reply))return pendingReplies.get(reply);
 const pending=polishReplyOnce(active,reply,fetcher).finally(()=>pendingReplies.delete(reply));pendingReplies.set(reply,pending);return pending;
}
async function polishReplyOnce(active,reply,fetcher){
 const interpretation=dialogueDiagnostic(active);
 if((!publicDialogueAI&&fetcher===fetch)||active.log.some(m=>!remoteDialogueAllowed(m.text))||interpretation?.source==='fallback'){
  diagnose(reply,'fallback',interpretation?.status||'local-or-filtered',interpretation?.model,'draft',{durationMs:0,calls:0,reason:interpretation?.reason||'local-or-filtered',code:interpretation?.code||null});return false;
 }
 const history=dialogueHistory(active.log.slice(0,-1),12,names[active.caller]),before=snapshot(active),context=conversationContext(active),reference=reply.text;
 const data=await request(reply,'draft',{mode:'grounded-reply',caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference,context},fetcher,7000);
 if(!data)return false;if(snapshot(active)!==before||reply.text!==reference){reject(reply,'draft','stale');return false;}
 if(active.lastIntent&&!validStructuredReply(data,history,reference,context)){reject(reply,'draft','validation');return false;}
 if(Object.keys(data).some(key=>!['text','emotion','decision','intent','evidence'].includes(key))||(data.emotion!==undefined&&!expressions.includes(data.emotion))||typeof data.text!=='string'||!data.text.trim()||data.text.length>700||!replyIsGrounded(data.text,history,reference,context)){reject(reply,'draft','grounding');return false;}
 reply.text=data.text.trim();reply.ai=true;if(data.emotion)applyReplyEmotion(active,data.emotion);return true;
}
