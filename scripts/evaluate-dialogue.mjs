import {writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {qualityCases} from '../tests/fixtures/dialogue-quality.mjs';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {statedFacts} from '../src/conversation-memory.js';
import {conversationContext} from '../src/conversation-context.js';
import {dialogueHistory} from '../src/ai-dialogue.js';
import {providerConfig} from '../functions/model-provider.js';
import {onRequestPost} from '../functions/api/dialogue.js';
import {callers} from '../src/data.js';
const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const live=process.argv.includes('--live');
const env={...process.env,DIALOGUE_PROVIDER:arg('provider')||'gemini',DIALOGUE_MODEL:arg('model')||'gemini-3.5-flash-lite',DIALOGUE_AI_ENABLED:'true'};
const config=providerConfig(env),results=[];
const caller=callers.find(c=>c.id===(arg('caller')||'nino'));if(!caller)throw new Error('Personagem não encontrado');
let tokenUsage=null;
if(live&&config){
 const original=globalThis.fetch;
 globalThis.fetch=async(...args)=>{const response=await original(...args);let data;try{data=await response.clone().json();}catch{}const usage=data?.usageMetadata||data?.usage;
  tokenUsage=usage?{input:usage.promptTokenCount??usage.input_tokens,output:usage.candidatesTokenCount!==undefined?usage.candidatesTokenCount+(usage.thoughtsTokenCount||0):usage.output_tokens}:null;return response;};
}
for(const c of qualityCases){
 const state=fresh();state.cursor=callers.indexOf(caller);nextCall(state);const a=state.active;
 Object.assign(a,{prepared:true,scheme:'prize',stage:'question',trust:1,used:['pitch'],proposalExplained:true,facts:{claims:c.previous?statedFacts(c.previous):{},events:[]},audit:[],log:[{speaker:'Você',text:c.previous||'Tenho uma proposta do concurso.'},{speaker:caller.name,text:'Quem organizou?'}]});
 const begin=performance.now();applyTypedMove(state,'typed',c.text);const reference=a.log.at(-1).text;
 const row={id:c.id,expected:c.expected,localIntent:a.lastIntent,localReply:reference,credits:state.credits,shared:!!a.item,localMs:Math.round((performance.now()-begin)*100)/100};
 if(live&&config){
  const history=dialogueHistory(a.log.slice(0,-1));const began=performance.now();
  const request=new Request('https://benchmark.invalid/api/dialogue',{method:'POST',headers:{Origin:'https://benchmark.invalid','Content-Type':'application/json'},body:JSON.stringify({mode:'grounded-reply',caller:a.caller,scheme:a.scheme,history,reference,context:conversationContext(a)})});
  tokenUsage=null;const response=await onRequestPost({request,env});const reply=await response.json();
  Object.assign(row,{providerStatus:response.status,providerMs:Math.round(performance.now()-began),tokens:tokenUsage,...(response.ok?{proposedReply:reply.text}:{failure:reply.error})});
 }
 results.push(row);
}
const report={kind:'authored-scenarios-not-students',caller:caller.id,provider:env.DIALOGUE_PROVIDER,model:env.DIALOGUE_MODEL,remoteTested:live&&!!config,remoteReason:!live?'Offline por padrão; --live exige credenciais e pode consumir cota/créditos.':!config?'Credenciais/configuração ausentes.':null,cost:'Sem API real, custo por sessão não medido. Em execução live, usar tokens e preço vigente; falhas também podem consumir tokens.',humanReview:'Revisar naturalidade, diferenças de voz e pertinência. Aprovação estrutural não é julgamento humano.',results};
await writeFile(arg('output')||'docs/dialogue-after.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({cases:results.length,localMatches:results.filter(r=>r.localIntent===r.expected).length,remoteTested:report.remoteTested}));
