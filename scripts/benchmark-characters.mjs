// Reproducible synthetic evaluation. Stored traces are fixture speech, never production logs.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {characterBenchmark} from '../tests/fixtures/character-benchmark.mjs';
const [rootArg,origin,output,mode='api']=process.argv.slice(2);
if(!rootArg||!origin||!output||!['api','local'].includes(mode))throw Error('Uso: node scripts/benchmark-characters.mjs RAIZ URL RESULTADO api|local');
const root=resolve(rootArg),moduleAt=p=>import(pathToFileURL(resolve(root,p))),{fresh,nextCall,applyTypedMove}=await moduleAt('src/engine.js'),{analyzeMessage,polishReply,dialogueDiagnostic}=await moduleAt('src/ai-dialogue.js'),{replayEvents}=await moduleAt('src/educational-replay.js'),{generatedDialogueSafe}=await moduleAt('src/dialogue-safety.js'),{repetitionReason}=await moduleAt('src/dialogue-diagnostics.js');
const names={nino:'Nino',olga:'Olga',davi:'Davi',pri:'Pri',yara:'Yara',bento:'Bento'},hash=createHash('sha256');
for(const file of ['src/engine.js','src/conversation-memory.js','src/conversation-context.js','src/conversation-replies.js','functions/api/dialogue.js'])hash.update(await readFile(resolve(root,file)));
const runs=[];
for(let repetition=1;repetition<=3;repetition++){
 for(const fixture of characterBenchmark){
  const s=fresh();nextCall(s);Object.assign(s.active,{caller:fixture.caller,scheme:fixture.scheme,prepared:true,stage:'question',trust:35,log:[{speaker:'Você',text:'Tenho uma proposta.'},{speaker:names[fixture.caller],text:fixture.scheme==='update'?'Por que o pacote pede acesso ao perfil?':'Quem organizou?'}]});
  const trace=[];
  for(const step of fixture.turns){
   if(s.active.outcome){trace.push({input:step.text,skipped:true,checks:Object.keys(step.checks).filter(k=>step.checks[k] instanceof RegExp||['continue','exit','noAction','memory','repair','correction','contradiction','appropriate'].includes(k)).map(key=>({key,pass:false}))});continue;}
   if(step.injectWrongAttribution)s.active.log.push({speaker:names[fixture.caller],text:'Você disse que já pagou.'});
   const a=s.active,prior=a.log.map(l=>({...l})),before={stage:a.stage,shared:!!a.item,credits:s.credits},started=performance.now(),requests=[];
   const fetcher=async(path,options)=>{
    const request={phase:JSON.parse(options.body).mode,chars:options.body.length,simulated:mode==='local'||step.outage===true};requests.push(request);
    if(request.simulated)throw Error('offline');
    const response=await fetch(new URL(path,origin),{...options,headers:{...options.headers,Origin:new URL(origin).origin}});request.status=response.status;request.model=response.headers.get('X-Dialogue-Model');return response;
   };
   const semantic=await analyzeMessage(a,step.text,fetcher);applyTypedMove(s,'typed',step.text,semantic);const reply=a.log.at(-1);await polishReply(a,reply,fetcher);
   const d=dialogueDiagnostic(reply)||{},checks=[];
   for(const [key,value]of Object.entries(step.checks)){
    let pass;if(value instanceof RegExp)pass=value.test(reply.text);
    else if(key==='continue')pass=!a.outcome;
    else if(key==='exit')pass=a.ending?.actor==='player'&&a.outcome==='closed';
    else if(key==='noAction')pass=!a.item&&s.credits===before.credits&&!a.linkOpened&&!a.linkSubmitted;
    else if(key==='contradiction')pass=a.lastIntent==='contradiction';
    else if(key==='correction')pass=a.lastIntent==='correction';
    else if(key==='memory')pass=/caneca/i.test(reply.text)&&/amanh/i.test(reply.text);
    else if(key==='appropriate')pass=generatedDialogueSafe(reply.text)&&!/namor|beij|amor por voc|segredo entre/i.test(reply.text);
    if(pass!==undefined)checks.push({key,pass});
   }
   const replay=replayEvents(a).at(-1);trace.push({input:step.text,reply:reply.text,intent:a.lastIntent,source:reply.localOnly?'authored-local':d.source||'local',reason:d.rejection||d.reason||null,model:d.model||null,elapsedMs:Math.round(performance.now()-started),requests,checks,semanticRepeat:!!repetitionReason(reply.text,prior,step.text),replayMatches:!replay||replay.reaction===reply.text,state:{stage:a.stage,shared:!!a.item,credits:s.credits,ending:a.ending||null}});
  }
  runs.push({id:fixture.id,caller:fixture.caller,repetition,trace});
  console.log(JSON.stringify({mode,id:fixture.id,repetition,turns:trace.length,failed:trace.flatMap(t=>t.checks.filter(c=>!c.pass).map(c=>c.key)),apiCalls:trace.flatMap(t=>t.requests||[]).filter(r=>!r.simulated).length}));
 }
}
const turns=runs.flatMap(r=>r.trace),executed=turns.filter(t=>!t.skipped),latencies=executed.map(t=>t.elapsedMs).sort((a,b)=>a-b),checks=turns.flatMap(t=>t.checks),byCheck={};
for(const c of checks){byCheck[c.key]??={passed:0,total:0};byCheck[c.key].total++;if(c.pass)byCheck[c.key].passed++;}
const sources={},reasons={};for(const t of executed){sources[t.source]=(sources[t.source]||0)+1;if(t.reason)reasons[t.reason]=(reasons[t.reason]||0)+1;}
const requests=executed.flatMap(t=>t.requests),real=requests.filter(r=>!r.simulated),summary={mode,scenarios:12,repetitions:3,runs:runs.length,plannedTurns:turns.length,executedTurns:executed.length,skippedTurns:turns.length-executed.length,checks:byCheck,sources,reasons,semanticRepeats:{count:executed.filter(t=>t.semanticRepeat).length,total:executed.length},replay:{matches:executed.filter(t=>t.replayMatches).length,total:executed.length},apiRequests:real.length,simulatedFailures:requests.length-real.length,requestsPerExecutedTurn:real.length/executed.length,contextChars:real.reduce((sum,r)=>sum+r.chars,0),latency:{p50:latencies[Math.floor(latencies.length*.5)],p95:latencies[Math.min(latencies.length-1,Math.floor(latencies.length*.95))]},models:[...new Set(real.map(r=>r.model).filter(Boolean))],limits:'Synthetic lexical checks and reviewed traces; not student learning or a universal naturalness score. Context characters are a size proxy, not billed tokens.'};
await mkdir(resolve(output,'..'),{recursive:true});await writeFile(output,JSON.stringify({revision:hash.digest('hex'),summary,runs},null,2));console.log(JSON.stringify(summary,null,2));
