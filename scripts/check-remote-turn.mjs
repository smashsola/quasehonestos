// Controlled real-provider probe: maximum three synthetic turns, stops on quota.
// Credentials stay in memory; this does not deploy or save speech.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {analyzeTurn,polishReply,dialogueDiagnostic} from '../src/ai-dialogue.js';
import {onRequestPost} from '../functions/api/dialogue.js';
import {dialogueModel} from '../src/dialogue-config.js';
import {nextQuotaReset} from '../src/dialogue-quota.js';
import {confirmedProbeQuota} from './probe-quota.mjs';
const output=resolve('.dialogue-checks/remote-turn-check.json');
await mkdir(resolve('.dialogue-checks'),{recursive:true});
const previous=await readFile(output,'utf8').then(JSON.parse).catch(()=>null);
const control=await readFile(resolve('.dialogue-checks/qwen-control-before.json'),'utf8').then(JSON.parse).catch(()=>null);
const blocked=confirmedProbeQuota([previous,control]);
if(blocked){console.log(JSON.stringify({status:'quota-cooldown',...blocked,providerCalls:0}));process.exitCode=2;}
else {
 const account=process.env.CLOUDFLARE_ACCOUNT_ID;if(!/^[a-f0-9]{32}$/.test(account||''))throw Error('Defina CLOUDFLARE_ACCOUNT_ID para a conta já autorizada.');
 const {token}=JSON.parse(execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','auth','token','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 let calls=0;const binding={run:async(model,args)=>{
  if(++calls>3)throw Error('Probe budget exceeded');
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(6800)});
  const data=await response.json();if(!response.ok||data.success===false){const error=Error(data.errors?.[0]?.message||'provider-unavailable');error.code=data.errors?.[0]?.code;throw error;}return data.result;
 }};
 const env={DIALOGUE_AI_ENABLED:'true',DIALOGUE_PROVIDER:'workers-ai',Workers_AI:binding};
 const fetcher=(_url,options)=>onRequestPost({env,request:new Request('https://probe.invalid/api/dialogue',{...options,headers:{...options.headers,Origin:'https://probe.invalid'}})});
 const results=[];let retryAt=null;
 for(const [caller,alias,intro]of [['nino','Rafa','Meu nome é Rafa.'],['olga','Lia','Pode me chamar de Lia.'],['davi','Beto','Aqui é o Beto.']]){
  const s=fresh();nextCall(s);Object.assign(s.active,{caller,scheme:'prize',stage:'pitch',prepared:true,trust:35,log:[{speaker:'Você',text:'Tenho um prêmio de desenho.'},{speaker:{nino:'Nino',olga:'Olga',davi:'Davi'}[caller],text:'Quero entender a oferta.'}]});
  applyTypedMove(s,'typed',intro);applyTypedMove(s,'typed','Não sei quem organiza. Não quero inventar.');
  const text='Qual nome eu disse e como você checaria o prêmio sem depender de mim?',started=performance.now(),analysis=await analyzeTurn(s.active,text,fetcher),diagnostic=dialogueDiagnostic(s.active);
  applyTypedMove(s,'typed',text,analysis);const reply=s.active.log.at(-1),accepted=await polishReply(s.active,reply,fetcher),final=dialogueDiagnostic(reply);
  results.push({caller,model:dialogueModel.id,acceptedRemote:accepted,reason:final?.reason||diagnostic?.reason||null,code:diagnostic?.code||null,inputTokens:diagnostic?.inputTokens??null,outputTokens:diagnostic?.outputTokens??null,durationMs:Math.round(performance.now()-started),coversName:reply.text.includes(alias),credits:s.credits,shared:!!s.active.item});
  if(diagnostic?.reason==='quota'){retryAt=nextQuotaReset(Date.now());break;}
 }
 const report={observedAt:new Date().toISOString(),providerCalls:calls,acceptedRemote:results.filter(r=>r.acceptedRemote).length,results,retryAt,limits:'Synthetic controlled probe; no student validation or naturalness score.'};
 await writeFile(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.acceptedRemote!==3)process.exitCode=2;
}
