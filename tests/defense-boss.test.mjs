import {advanceCampaignDay} from '../src/campaign-days.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {bossResultLines,defenseBossResult,defenseBossPanel} from '../src/defense-boss.js';
import {defenseCampaignEnding} from '../src/defense-view.js';
import {readFile} from 'node:fs/promises';
import {fresh,migrateToDefense,nextCall,finishCall,load} from '../src/engine.js';
import {defensePeople,defenseCases,decideDefense} from '../src/defense-round.js';

test('Chefe tem dez falas distintas e escolhe pelo resultado da campanha',()=>{
 assert.equal(bossResultLines.length,10);assert.equal(new Set(bossResultLines).size,10);
 const seen=new Set();
 for(let safe=0;safe<=10;safe++){
  const state={history:Array.from({length:10},(_,i)=>({caseId:'whatsapp',outcome:i<safe?'blocked':'fooled'}))};
  const result=defenseBossResult(state);assert.equal(result.protectedCount,safe);assert.equal(result.tier,Math.min(9,safe));seen.add(result.line);
  assert.doesNotMatch(defenseBossPanel(state,String),/data-boss-speak/);assert.match(defenseCampaignEnding(state,String),/BALANÇO DO EXPEDIENTE/);
 }
 assert.equal(seen.size,10);
});
test('Partida interrompida não vira desempenho perfeito nem conta histórico antigo',()=>{
 const state={history:[{caller:'old',outcome:'blocked'},{caseId:'ransomware',outcome:'fooled',gameOver:true}]};
 const result=defenseBossResult(state);assert.equal(result.completed,1);assert.equal(result.protectedCount,0);assert.equal(result.tier,0);assert.match(result.note,/antes da hora/);
});
test('Chefe mantém as dez frases escritas e usa o murmúrio dos personagens',async()=>{
 const audio=await readFile(new URL('../src/audio.js',import.meta.url),'utf8');
 assert.match(audio,/caller:'bento',emotion:'neutral',duration:replyDuration\(text\)/);
 assert.match(audio,/\['qh-speaking-end','qh-murmur-skipped'\]/);
 assert.doesNotMatch(audio,/speechSynthesis|bossClip|new Audio\(/);
 for(let safe=0;safe<10;safe++){
  const state={history:Array.from({length:10},(_,i)=>({caseId:'whatsapp',outcome:i<safe?'blocked':'fooled'}))};
  const html=defenseBossPanel(state,String);assert.ok(html.includes(bossResultLines[safe]));assert.doesNotMatch(html,/\.wav|data-boss-audio/);
 }
});
test('Todas as dez situações e o encerramento sobrevivem ao carregamento do save',()=>{
 let state=fresh();migrateToDefense(state);
 for(let i=0;i<defensePeople.length;i++){
  if(state.dayBreak)assert.ok(advanceCampaignDay(state));assert.ok(nextCall(state));const safe=defenseCases[state.active.caseId].choices.find(c=>c.safe);
  assert.ok(decideDefense(state.active,safe.id));assert.ok(finishCall(state));
  const stored=JSON.stringify(state);state=load({getItem:()=>stored});
  assert.equal(state.cursor,i+1);assert.equal(state.history.length,i+1);assert.equal(state.mode,'defense');
 }
 assert.equal(state.finished,true);assert.equal(defenseBossResult(state).protectedCount,30);
});
