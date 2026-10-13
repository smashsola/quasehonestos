// Synthetic real-Qwen conversations, strictly bounded. Never use with real player logs.
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {analyzeTurn,polishReply,dialogueDiagnostic} from '../src/ai-dialogue.js';
import {onRequestPost} from '../functions/api/dialogue.js';
import {failureMetadata} from '../src/dialogue-diagnostics.js';
import {providerText} from '../functions/model-provider.js';
import {dialogueModel} from '../src/dialogue-config.js';
import {confirmedProbeQuota} from './probe-quota.mjs';
import {nextQuotaReset} from '../src/dialogue-quota.js';
const publicMode=process.argv.includes('--public'),output=process.env.QH_REMOTE_OUTPUT||'.dialogue-checks/remote-conversations.json',origin='https://quasehonestos.betaniaaa.workers.dev';
await mkdir('.dialogue-checks',{recursive:true});
const records=await Promise.all(['.dialogue-checks/qwen-control-before.json','.dialogue-checks/remote-turn-check.json',output].map(p=>readFile(p,'utf8').then(JSON.parse).catch(()=>null)));
const blocked=confirmedProbeQuota(records);if(blocked){console.log(JSON.stringify({status:'quota-cooldown',...blocked,providerCalls:0}));process.exitCode=2;}
else{
 let calls=0,rawOutput=null;const budget=24;
 let token=null,account=process.env.CLOUDFLARE_ACCOUNT_ID;
 if(!publicMode){if(!/^[a-f0-9]{32}$/.test(account||''))throw Error('Account required');({token}=JSON.parse(execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','auth','token','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']})));}
 const binding={run:async(model,args)=>{
  if(++calls>budget)throw Error('probe budget');
  const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(6800)}),data=await r.json();
  if(!r.ok||data.success===false){const error=Error(data.errors?.[0]?.message||'provider-unavailable');error.code=data.errors?.[0]?.code;throw error;}
  try{rawOutput=JSON.parse(providerText({provider:'workers-ai'},data.result));}catch{rawOutput={format:'not-json'};}return data.result;
 }};
 const env={DIALOGUE_AI_ENABLED:'true',DIALOGUE_PROVIDER:'workers-ai',Workers_AI:binding},results=[];let stop=false,retryAt=null;
 const fetcher=async(_url,options)=>{
  if(publicMode){if(++calls>budget)throw Error('probe budget');return fetch(origin+'/api/dialogue',{...options,headers:{...options.headers,Origin:origin}});}
  return onRequestPost({env,request:new Request('https://probe.invalid/api/dialogue',{...options,headers:{...options.headers,Origin:'https://probe.invalid'}})});
 };
 for(const [caller,alias]of (process.env.QH_REMOTE_VARIANT==='novel'?[['nino','Tico'],['olga','Dora'],['davi','Zeca']]:[['nino','Rafa'],['olga','Lia'],['davi','Beto']])){
  const s=fresh();nextCall(s);Object.assign(s.active,{caller,scheme:'prize',stage:'pitch',prepared:true,trust:35,log:[{speaker:'Você',text:'Tenho um prêmio de desenho.'},{speaker:{nino:'Nino',olga:'Olga',davi:'Davi'}[caller],text:'Quero entender a oferta.'}]});
  let messages=[`${caller==='olga'?'Pode me chamar de':caller==='davi'?'Aqui é o':'Meu nome é'} ${alias}. A entrega é de graça.`,
   'Qual nome eu disse e como você checaria o prêmio sem depender de mim?',
   'Pera, corrigindo: agora o envio custa C$27. O que mudou e por que cartão para um prêmio seria perigoso?',
   'Hoje tá um calor danado kkk.',
   'Não sei quem organiza. Não quero inventar. Qual meu nome e o que ainda falta confirmar?',
   'Voltando: qual custo eu tinha dito antes e qual vale agora?',
   'Não quero participar nem enviar meus dados. Pode encerrar.'];
  if(process.env.QH_REMOTE_VARIANT==='novel')messages=[messages[0].replace('de graça','sem taxa'), 'E aí kkk, que nome eu usei e como vc conferiria isso por fora?', 'Me enganei no frete: corrigindo, a entrega sai por C$19. Qual foi a alteração e qual o risco de mandar cartão pelo prêmio?', 'Aqui está chovendo rs.', 'Sei lá quem fez esse concurso. Não quero inventar. Como me chamo e o que falta esclarecer?', 'Retomando: qual valor da entrega eu falei primeiro e qual vale agora?', 'Prefiro não participar. Não vou mandar nenhum dado.'];
  for(const message of messages){
   rawOutput=null;const started=performance.now(),analysis=await analyzeTurn(s.active,message,fetcher),d=dialogueDiagnostic(s.active);
   applyTypedMove(s,'typed',message,analysis);const reply=s.active.log.at(-1),accepted=await polishReply(s.active,reply,fetcher),f=dialogueDiagnostic(reply);
   results.push({caller,message,providerOutput:rawOutput,analysis,displayed:reply.text,acceptedRemote:accepted,reason:f?.reason||d?.reason||null,code:d?.code||null,inputTokens:d?.inputTokens??null,outputTokens:d?.outputTokens??null,durationMs:Math.round(performance.now()-started),state:{intent:s.active.lastIntent,ending:s.active.ending,credits:s.credits,shared:!!s.active.item},diagnostic:d});
   if(d?.reason==='quota'){stop=true;retryAt=nextQuotaReset(Date.now());break;}
   if(s.active.outcome)break;
  }
  if(stop)break;
 }
 const tokenSamples=results.filter(r=>r.inputTokens!==null&&r.outputTokens!==null),inputTokens=tokenSamples.reduce((n,r)=>n+r.inputTokens,0),outputTokens=tokenSamples.reduce((n,r)=>n+r.outputTokens,0),summary={observedAt:new Date().toISOString(),mode:publicMode?'public-endpoint':'real-binding-rest',model:dialogueModel.id,providerCalls:calls,turns:results.length,accepted:results.filter(r=>r.acceptedRemote).length,fallback:results.filter(r=>!r.acceptedRemote).length,tokenSamples:tokenSamples.length,inputTokens,outputTokens,estimatedNeurons:(inputTokens*4625+outputTokens*30475)/1e6,reasons:results.filter(r=>r.reason).reduce((all,r)=>(all[r.reason]=(all[r.reason]||0)+1,all),{}),retryAt};
 await writeFile(output,JSON.stringify({...summary,results,limits:'Real provider; synthetic conversations only. Token totals cover available usage samples. Acceptance is validator acceptance, not a naturalness score.'},null,2));console.log(JSON.stringify(summary));if(stop)process.exitCode=2;
}
