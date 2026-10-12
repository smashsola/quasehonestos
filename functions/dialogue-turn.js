import {buildTurnRequest,validateTurn,simpleLocalMessage} from '../src/dialogue-turn.js';
import {workersReply,providerText} from './model-provider.js';
import {failureMetadata} from '../src/dialogue-diagnostics.js';
import {generatedDialogueSafe} from '../src/dialogue-safety.js';
import {finishMetric,tokenMetrics} from './dialogue-metrics.js';
import {serverQuotaRemaining,confirmServerQuota} from './dialogue-quota.js';
import {nextQuotaReset} from '../src/dialogue-quota.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function singleTurn(data,context,config){
 const started=Date.now(),body=buildTurnRequest(context,data.history);let calls=0,tokens={},reason=null,code=null;
 const finish=(value,status,source)=>finishMetric(json(value,status),{model:config.model,phase:'turn',calls,durationMs:Date.now()-started,source,reason,code,inputChars:body.messages.reduce((n,m)=>n+m.content.length,0),...tokens});
 const fail=(why,status=503,extra={})=>{reason=why;return finish({error:'unavailable',diagnostic:why,code,...extra},status,'fallback');};
 if(config.provider!=='workers-ai')return fail('provider-mismatch');
 if(simpleLocalMessage(data.history.at(-1)?.text||''))return fail('local-simple',400);
 const until=serverQuotaRemaining(config.binding);if(until)return fail('quota',429,{retryAt:until});
 try{
  calls=1;const result=await workersReply(config,body);tokens=tokenMetrics(result);
  const text=providerText(config,result);if(!text)return fail('empty');
  let value;try{value=JSON.parse(text);}catch{return fail('parsing');}
  const turn=validateTurn(value,data.history);if(!turn)return fail('semantics');
  const candidate=turn.candidate;
  const safe=candidate&&typeof candidate.text==='string'&&candidate.text.trim()&&candidate.text.length<=700&&generatedDialogueSafe(candidate.text);
  reason=safe?null:'invalid-candidate';return finish({analysis:turn.analysis,candidate:safe?candidate:null},200,'api');
 }catch(error){const failure=failureMetadata(error);code=failure.code;reason=error?.diagnostic==='truncated'?'truncated':failure.reason;confirmServerQuota(config.binding,reason);return fail(reason,reason==='quota'?429:503,reason==='quota'?{retryAt:nextQuotaReset(Date.now())}:{});}
}
