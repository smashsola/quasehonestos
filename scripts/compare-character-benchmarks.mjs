// One scorer for both stored, synthetic samples. No provider calls or player logs.
import {readFile,writeFile} from 'node:fs/promises';
import {repetitionReason} from '../src/dialogue-diagnostics.js';
import {characterBenchmark} from '../tests/fixtures/character-benchmark.mjs';
const [beforePath,afterPath,output]=process.argv.slice(2);
if(!beforePath||!afterPath)throw Error('Uso: node scripts/compare-character-benchmarks.mjs ANTES.json DEPOIS.json [RESULTADO.json]');
const questionKeys=new Set(['benefit','deadline','verification','waiting','alternative','goal','price','unpaid','agreement','session','record']);
function score(sample){
 const result={summary:sample.summary,questionChecks:{passed:0,total:0},sameRepetitionScorer:{count:0,total:0},dateCorrection:{answered:0,inventedPreviousDate:0,total:0},unanticipatedContradiction:{count:0,total:0},attributionRepairs:{recognized:0,total:0}};
 for(const run of sample.runs){
  const fixture=characterBenchmark.find(f=>f.id===run.id),history=[{speaker:'Você',text:'Tenho uma proposta.'},{speaker:'Personagem',text:fixture.scheme==='update'?'Por que o pacote pede acesso ao perfil?':'Quem organizou?'}];
  for(const [index,turn]of run.trace.entries()){
   const asks=turn.input.includes('?')||/quero entender como/i.test(turn.input);
   for(const c of turn.checks)if(asks&&questionKeys.has(c.key)){result.questionChecks.total++;if(c.pass)result.questionChecks.passed++;}
   if(turn.skipped)continue;
   if(fixture.turns[index].injectWrongAttribution)history.push({speaker:'Personagem',text:'Você disse que já pagou.'});
   result.sameRepetitionScorer.total++;if(repetitionReason(turn.reply,history,turn.input))result.sameRepetitionScorer.count++;
   result.unanticipatedContradiction.total++;if(turn.intent==='contradiction'&&!fixture.turns[index].checks.contradiction)result.unanticipatedContradiction.count++;
   if(run.id==='repair'&&index===1){result.dateCorrection.total++;if(/amanh/i.test(turn.reply)&&/entendi|atualiz|anot|prazo agora|corrigido|correção aceita/i.test(turn.reply))result.dateCorrection.answered++;if(/hoje|ontem/i.test(turn.reply)&&/antes|anterior/i.test(turn.reply)&&!history.some(m=>m.speaker==='Você'&&/hoje|ontem/i.test(m.text)))result.dateCorrection.inventedPreviousDate++;}
   if(fixture.turns[index].injectWrongAttribution){result.attributionRepairs.total++;if(/razão|razao|enganei|confundi|minha fala|vou corrigir/i.test(turn.reply)&&/não há pagamento|nao ha pagamento|não.*confirmad|nao.*confirmad|não que já pagou|nao que ja pagou/i.test(turn.reply))result.attributionRepairs.recognized++;}
   history.push({speaker:'Você',text:turn.input},{speaker:'Personagem',text:turn.reply});
  }
 }
 return result;
}
const result={before:score(JSON.parse(await readFile(beforePath,'utf8'))),after:score(JSON.parse(await readFile(afterPath,'utf8'))),limits:'Same fixed lexical and state criteria applied to both stored samples. Unanticipated contradiction is a review flag, not proof that every contradiction is unjustified. Invented-date count covers the three specified date-correction probes only. Question checks can miss valid paraphrases; review the traces. These are not student-learning results.'};
if(output)await writeFile(output,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
