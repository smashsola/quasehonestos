// Real calls use synthetic game dialogue only. Output is aggregate metadata, never transcripts.
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {analyzeMessage,polishReply,dialogueDiagnostic} from '../src/ai-dialogue.js';
const origin=process.argv[2];if(!origin)throw Error('Informe a URL da prévia.');
const cases=[{caller:'nino',scheme:'prize',lines:[
 ['Como você verificaria sem depender de mim?',/procur|buscar|ajuda|suspend|aguardar|confirm/i],
 ['A equipe do concurso organizou a premiação. É gratuito.',null],
 ['O benefício é uma caneca. O prazo é amanhã.',null],
 ['Agora precisa pagar uma taxa.',/antes|mud|gratuit|cobr|condi/i],
 ['Qual benefício eu tinha prometido e qual era o prazo?',/caneca|amanh/i],
 ['Não quero participar.',null]]},
 {caller:'olga',scheme:'club',lines:[
 ['Não sei quem organiza. Não quero inventar: pode ser um convite falso. O que você faria para verificar sem depender de mim?',/procur|buscar|ajuda|suspend|confirm/i],
 ['Como você conferiria a origem e o que faria enquanto espera?',/conhecid|canal|ajuda|aguard|confirm/i],
 ['O benefício é uma medalha. O prazo é sexta-feira.',null],
 ['Você lembra do benefício e do prazo que eu disse?',/medalha|sexta/i],
 ['Não quero participar.',null]]}];
const runs=[];
for(const mode of ['api','local']){
 let requests=0,accepted=0,repeated=0,relevant=0,checked=0,endedQuestions=0,changedCredits=0;const durations=[],sources={},errors={},rejections={},targetFailures=[];
 for(const scenario of cases){const s=fresh();nextCall(s);Object.assign(s.active,{caller:scenario.caller,scheme:scenario.scheme,prepared:true,stage:'question',trust:30,log:[{speaker:'Você',text:'Tenho uma proposta para o evento.'},{speaker:scenario.caller==='nino'?'Nino':'Olga',text:'Quem organizou esse evento?'}]});
 for(const [text,expected]of scenario.lines){if(s.active.outcome)break;const a=s.active,start=performance.now(),prior=a.log.filter(l=>l.speaker!=='Você').slice(-4).map(l=>l.text),fetcher=async(path,options)=>{requests++;if(mode==='local')throw new Error('offline');return fetch(new URL(path,origin),{...options,headers:{...options.headers,Origin:new URL(origin).origin}});};
 const analysis=await analyzeMessage(a,text,fetcher);applyTypedMove(s,'typed',text,analysis);const reply=a.log.at(-1);const drafted=await polishReply(a,reply,fetcher);durations.push(Math.round(performance.now()-start));if(drafted)accepted++;
 const d=dialogueDiagnostic(reply)||{};sources[d.source||'local']=(sources[d.source||'local']||0)+1;if(d.reason||d.status!==200)errors[d.reason||d.status||'none']=(errors[d.reason||d.status||'none']||0)+1;
 if(d.rejection)rejections[d.rejection]=(rejections[d.rejection]||0)+1;if(prior.includes(reply.text))repeated++;if(expected){checked++;if(expected.test(reply.text))relevant++;else targetFailures.push({caller:scenario.caller,messageIndex:scenario.lines.findIndex(line=>line[0]===text),intent:a.lastIntent,source:d.source});if(a.outcome)endedQuestions++;}if(s.credits!==0)changedCredits++;
 }}
 durations.sort((a,b)=>a-b);runs.push({mode,messages:durations.length,requests,requestsPerMessage:requests/durations.length,acceptedDrafts:accepted,sources,errors,rejections,exactRepetitions:repeated,targetedContentChecks:{passed:relevant,total:checked},targetFailures,endedQuestions,changedCredits,latencyMs:{median:durations[Math.floor(durations.length/2)],max:durations.at(-1)}});
}
console.log(JSON.stringify({runs,notice:'Verificações lexicais direcionadas, não avaliação humana universal de pertinência; sem estudantes.'},null,2));
