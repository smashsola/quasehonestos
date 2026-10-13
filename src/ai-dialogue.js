import {replyRejectionCodes,structuredReplyRejectionReason} from './structured-reply.js';
import {conversationContext} from './conversation-context.js';
import {replyIsGrounded} from './dialogue-model-rules.js';
import {remoteDialogueAllowed} from './dialogue-safety.js';
import {applyReplyEmotion,expressions} from './mood.js';
import {validateSemanticAnalysis} from './semantic-contract.js';
import {publicDialogueAI} from './privacy-data.js';
import {dialogueModel} from './dialogue-config.js';
import {failureMetadata} from './dialogue-diagnostics.js';
import {redactSensitiveText,redactDialogueObject} from './privacy-data.js';
import {youthResponse} from './youth-dialogue.js';
import {syncDisplayedReply} from './conversation-memory.js';
import {simpleLocalMessage,validateTurn,turnRequestContext} from './dialogue-turn.js';
import {recordRequestMetric,recordDisplayMetric} from './dialogue-metrics.js';
import {createQuotaCircuit} from './dialogue-quota.js';
import {localStore} from './safe-storage.js';
import {previewDialogue} from './dialogue-preview.js';
const diagnostics=new WeakMap(),pendingReplies=new WeakMap(),pendingAnalysis=new WeakMap(),candidates=new WeakMap();
const quotaCircuit=createQuotaCircuit(localStore);
export const dialogueDiagnostic=value=>diagnostics.get(value)||null;
export function dialogueHistory(log,limit=12,person=null){
 const lines=log.filter(m=>m&&!m.localOnly&&typeof m.text==='string'&&m.speaker!=='Sistema'&&(!person||m.speaker==='Você'||m.speaker===person));
 const indices=lines.length<=limit?lines.map((_,i)=>i):[0,1,...Array.from({length:limit-2},(_,i)=>lines.length-(limit-2)+i)];
 return indices.map(i=>({speaker:lines[i].speaker,text:redactSensitiveText(lines[i].text).text.slice(0,900)}));
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
  const numberHeader=name=>{const v=response.headers?.get(name);return v!==null&&v!==undefined&&Number.isFinite(Number(v))?Number(v):null;};
  details.providerCalls=numberHeader('X-Dialogue-Calls');details.inputTokens=numberHeader('X-Dialogue-Input-Tokens');details.outputTokens=numberHeader('X-Dialogue-Output-Tokens');
  let data;try{data=await response.json();}catch{diagnose(value,'fallback',response.status,null,phase,{...details,reason:response.ok?'parsing':'http',code:null});return null;}
  if(!response.ok){const reasons=['quota','capacity','timeout','aborted','empty','json','parsing','truncated','semantics','grounding','validation','provider-unavailable','binding-unavailable','disabled','local-simple','provider-mismatch'];const reason=reasons.includes(data?.diagnostic)?data.diagnostic:'http';if(reason==='quota'&&typeof window!=='undefined')quotaCircuit.confirm(reason);diagnose(value,'fallback',response.status,response.headers?.get('X-Dialogue-Model'),phase,{...details,reason,rejection:replyRejectionCodes.includes(data?.rejection)?data.rejection:null,code:Number.isInteger(data?.code)?data.code:null});return null;}
  if(data==null||data===''){diagnose(value,'fallback',response.status,null,phase,{...details,reason:'empty',code:null});return null;}
  diagnose(value,'api',response.status,response.headers?.get('X-Dialogue-Model'),phase,{...details,reason:null,code:null});return data;
 }catch(error){diagnose(value,'fallback','unavailable',null,phase,{...details,durationMs:Math.round(performance.now()-started),...failureMetadata(error)});return null;}
 finally{recordRequestMetric({...details,durationMs:Math.round(performance.now()-started)});}
}
const reject=(value,phase,reason)=>{const d=dialogueDiagnostic(value)||{};diagnose(value,'fallback',d.status||'unavailable',d.model,phase,{...d,source:'fallback',reason});return null;};
export function analyzeMessage(active,text,fetcher=fetch,mode='interpret'){
 const fingerprint=mode+snapshot(active)+text,existing=pendingAnalysis.get(active);
 if(existing?.fingerprint===fingerprint)return existing.promise;
 if(existing)return Promise.resolve(null);
 const promise=analyzeOnce(active,text,fetcher,mode).finally(()=>{if(pendingAnalysis.get(active)?.promise===promise)pendingAnalysis.delete(active);});
 pendingAnalysis.set(active,{fingerprint,promise});return promise;
}
export const analyzeTurn=(active,text,fetcher=fetch)=>analyzeMessage(active,text,fetcher,'turn');
function turnHistory(log,limit,person){return dialogueHistory(log,limit,person).map(m=>({...m,text:m.text.slice(0,m.speaker==='Você'?400:500)}));}
async function analyzeOnce(active,text,fetcher,mode){
 candidates.delete(active);
 if(typeof window!=='undefined'&&quotaCircuit.remaining()){diagnose(active,'fallback','local',null,mode,{calls:0,durationMs:0,reason:'quota',retryAt:quotaCircuit.remaining()});return null;}
 if(mode==='turn'&&simpleLocalMessage(text)){diagnose(active,'fallback','local',null,'turn',{calls:0,durationMs:0,reason:'local-simple'});return null;}
 if(redactSensitiveText(text).redacted||text.includes('[dado removido]')||youthResponse(text,active.scheme)||active.supportPaused){diagnose(active,'fallback','local',null,'interpret',{calls:0,durationMs:0,reason:'local-protection'});return null;}
 if((!publicDialogueAI&&fetcher===fetch)||!remoteDialogueAllowed(text)||active.log.some(m=>!m.localOnly&&!remoteDialogueAllowed(m.text))){diagnose(active,'fallback','local-or-filtered',null,'interpret',{calls:0,durationMs:0,reason:'local-or-filtered'});return null;}
 const history=mode==='turn'?turnHistory(active.log,7,names[active.caller]):dialogueHistory(active.log,11,names[active.caller]);history.push({speaker:'Você',text:text.slice(0,400)});
 const context=conversationContext(active),before=snapshot(active),result=await request(active,mode,{mode,caller:active.caller,scheme:active.scheme,history,reference:'Interprete apenas a fala do jogador, sem calcular consequências.',...(mode==='turn'?{preview:redactDialogueObject(previewDialogue(active,text))}:{}),context:redactDialogueObject(mode==='turn'?turnRequestContext(context):context)},fetcher,mode==='turn'?7000:5000);
 if(!result)return null;if(snapshot(active)!==before)return reject(active,'interpret','stale');
 if(mode==='turn'){const turn=validateTurn(result,history);if(!turn)return reject(active,'turn','validation');candidates.set(active,{candidate:turn.candidate,history:JSON.stringify(history),caller:active.caller,scheme:active.scheme});return turn.analysis;}
 const analysis=validateSemanticAnalysis(result,history);return analysis||reject(active,'interpret','validation');
}
export const evaluateTrust=analyzeMessage;
export function polishReply(active,reply,fetcher=fetch){
 if(reply.ai)return Promise.resolve(true);
 if(pendingReplies.has(reply))return pendingReplies.get(reply);
 const pending=polishReplyOnce(active,reply,fetcher).then(api=>{recordDisplayMetric(api,dialogueDiagnostic(reply)?.reason);return api;}).finally(()=>pendingReplies.delete(reply));pendingReplies.set(reply,pending);return pending;
}
async function polishReplyOnce(active,reply,fetcher){
 if(reply.localOnly){diagnose(reply,'fallback','local',null,'draft',{durationMs:0,calls:0,reason:'local-protection'});return false;}
 const interpretation=dialogueDiagnostic(active);
 if(interpretation?.phase==='turn'){
  const saved=candidates.get(active);candidates.delete(active);
  const fallback=reason=>{diagnose(reply,'fallback',interpretation.status,interpretation.model,'draft',{calls:0,durationMs:0,reason,code:interpretation.code||null});return false;};
  if(interpretation.source!=='api')return fallback(interpretation.reason||'local-or-filtered');
  if(!saved?.candidate)return fallback('invalid-candidate');
  const history=turnHistory(active.log.slice(0,-1),8,names[active.caller]);
  if(saved.caller!==active.caller||saved.scheme!==active.scheme||saved.history!==JSON.stringify(history))return fallback('stale');
  const context=conversationContext(active),reference=reply.text,rejection=structuredReplyRejectionReason(saved.candidate,history,reference,context);
  if(rejection)return fallback(rejection);
  reply.text=saved.candidate.text.trim();reply.ai=true;syncDisplayedReply(active,reply);if(saved.candidate.emotion)applyReplyEmotion(active,saved.candidate.emotion);
  diagnose(reply,'api',interpretation.status,interpretation.model,'draft',{calls:0,durationMs:0,reason:null,reusedCandidate:true});return true;
 }
 if((!publicDialogueAI&&fetcher===fetch)||active.log.some(m=>!m.localOnly&&!remoteDialogueAllowed(m.text))||interpretation?.source==='fallback'){
  diagnose(reply,'fallback',interpretation?.status||'local-or-filtered',interpretation?.model,'draft',{durationMs:0,calls:0,reason:interpretation?.reason||'local-or-filtered',code:interpretation?.code||null});return false;
 }
 const history=dialogueHistory(active.log.slice(0,-1),12,names[active.caller]),before=snapshot(active),context=redactDialogueObject(conversationContext(active)),reference=redactSensitiveText(reply.text).text;
 const data=await request(reply,'draft',{mode:'grounded-reply',caller:active.caller,scheme:active.scheme,expression:active.expression,history,reference,context},fetcher,7000);
 if(!data)return false;if(snapshot(active)!==before||reply.text!==reference){reject(reply,'draft','stale');return false;}
 if(active.lastIntent){const rejection=structuredReplyRejectionReason(data,history,reference,context);if(rejection){reject(reply,'draft',rejection);return false;}}
 if(Object.keys(data).some(key=>!['text','emotion','decision','intent','evidence'].includes(key))||(data.emotion!==undefined&&!expressions.includes(data.emotion))||typeof data.text!=='string'||!data.text.trim()||data.text.length>700||!replyIsGrounded(data.text,history,reference,context)){reject(reply,'draft','grounding');return false;}
 reply.text=data.text.trim();reply.ai=true;syncDisplayedReply(active,reply);if(data.emotion)applyReplyEmotion(active,data.emotion);return true;
}
