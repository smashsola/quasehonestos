// Rescore both synthetic samples with identical criteria, without API calls.
import {readFile,writeFile} from 'node:fs/promises';
import {characterBenchmark} from '../tests/fixtures/journey-benchmark.mjs';
import {repetitionReason} from '../src/dialogue-diagnostics.js';
import {schemes} from '../src/data.js';
import {selectedOffer} from '../src/app-interactions.js';
const [beforePath,afterPath,output]=process.argv.slice(2);
if(!beforePath||!afterPath)throw Error('Uso: node scripts/compare-journey-benchmarks.mjs ANTES DEPOIS [SAIDA]');
const memories=new Set(['opening','alias','delivery','amount']);
const questions=new Set([...memories,'verification','change','actor','payment','session','record']);
function score(sample){
 const result={summary:sample.summary,questionParts:{passed:0,total:0},memoryParts:{passed:0,total:0},sameRepetitionScorer:{count:0,total:0},unexpectedContradictions:{count:0,total:0},repairAcknowledgments:{passed:0,total:0}};
 for(const run of sample.runs){
  const fixture=characterBenchmark.find(f=>f.id===run.id),scene=schemes.find(s=>s.id===fixture.scheme),offer=selectedOffer({scheme:fixture.scheme,offer:fixture.offer}),history=[{speaker:'Você',text:scene.opening+(offer?' Proposta: '+offer.name+'. '+offer.detail:'')},{speaker:'Personagem',text:scene.response}];
  for(const [i,t]of run.trace.entries()){
   const asks=t.input.includes('?');
   for(const c of t.checks){if(asks&&questions.has(c.key)){result.questionParts.total++;if(c.pass)result.questionParts.passed++;}if(memories.has(c.key)){result.memoryParts.total++;if(c.pass)result.memoryParts.passed++;}}
   if(t.skipped)continue;
   if(fixture.turns[i].injectWrongAttribution){history.push({speaker:'Personagem',text:'Você disse que já pagou.'});result.repairAcknowledgments.total++;if(/corrig|razão|razao|enganei|confundi|equívoco/i.test(t.reply))result.repairAcknowledgments.passed++;}
   result.sameRepetitionScorer.total++;if(repetitionReason(t.reply,history,t.input))result.sameRepetitionScorer.count++;
   result.unexpectedContradictions.total++;if(t.intent==='contradiction'&&!(run.id==='price-change'&&i===1))result.unexpectedContradictions.count++;
   history.push({speaker:'Você',text:t.input},{speaker:'Personagem',text:t.reply});
  }
 }
 return result;
}
const result={before:score(JSON.parse(await readFile(beforePath,'utf8'))),after:score(JSON.parse(await readFile(afterPath,'utf8'))),limits:'Partes de resposta usam verificações lexicais fixas; não são uma nota de inteligência ou aprendizagem. Alertas de contradição e repetição precisam da leitura integral. A mesma regra de repetição e reparação foi aplicada às duas amostras. Só falas finais são armazenadas; rejeições do modelo são metadados.'};
if(output)await writeFile(output,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
