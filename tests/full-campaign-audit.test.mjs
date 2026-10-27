import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrateToDefense,nextCall,finishCall,load,buy} from '../src/engine.js';
import {defenseCaseFor,decideDefense,settleDefenseLoss} from '../src/defense-round.js';
import {advanceCampaignDay} from '../src/campaign-days.js';
import {settleTutorialGrant} from '../src/tutorial.js';
import {startRevenge,revengeCaseFor,answerRevenge,advanceRevenge,beginRevengeScene,advanceRevengePlayback,finishRevenge,canRevenge} from '../src/revenge.js';
import {questionIsCorrect} from '../src/audience.js';
import {furniture} from '../src/data.js';
const reload=s=>load({getItem:()=>JSON.stringify(s)});
test('Histórico antigo recupera a pausa parcial quando a explicação registrada é inequívoca',()=>{
 const s=fresh();migrateToDefense(s);s.audience='teen';nextCall(s);const c=defenseCaseFor(s.active).choices.find(c=>c.partial);decideDefense(s.active,c.id);finishCall(s);delete s.history[0].partial;
 assert.equal(reload(s).history[0].partial,true);
});
for(const band of ['child','teen'])for(const path of ['safe','partial'])test(`Campanha inteira ${band}/${path}: seis dias, reload a cada caso e resultados coerentes`,()=>{
 let s=fresh();migrateToDefense(s);s.audience=band;let earned=0;
 for(let i=0;i<30;i++){
  assert.ok(nextCall(s));const a=s.active,sc=defenseCaseFor(a),c=sc.choices.find(c=>path==='partial'?c.partial:c.safe);
  assert.ok(decideDefense(a,c.id));settleDefenseLoss(s);if(i===0){assert.ok(settleTutorialGrant(s));s.tutorial='completed';}
  if(path==='safe'){
   assert.ok(startRevenge(s));const qs=revengeCaseFor(a).questions;
   for(let step=0;step<3;step++){const q=qs[step],answer=q.options.find(o=>questionIsCorrect(q,o.id));assert.ok(answerRevenge(s,step,answer.id,1000));assert.ok(advanceRevenge(s,4000));}
   assert.ok(beginRevengeScene(s));advanceRevengePlayback(s,5000);
   for(let stage=1;stage<=5;stage++)assert.ok(advanceRevengePlayback(s,5000+stage*3000).changed);
   assert.equal(a.revenge.award,180);earned+=180;assert.equal(finishRevenge(s),false);
  }else assert.equal(canRevenge(a),false);
  assert.ok(finishCall(s));assert.equal(finishCall(s),false);s=reload(s);const h=s.history.at(-1);
  assert.equal(h.audience,band);assert.equal(h.partial,path==='partial');assert.equal(defenseCaseFor(h).choices.filter(c=>c.safe).length,band==='child'?2:1);
  if(i%5===4&&i<29){assert.ok(s.dayBreak);assert.equal(nextCall(s),false);assert.ok(advanceCampaignDay(s));s=reload(s);}
 }
 assert.equal(s.finished,true);assert.equal(s.cursor,30);assert.equal(s.history.length,30);assert.equal(s.credits,100+earned);
 for(const item of furniture)if(s.credits>=item.price){assert.ok(buy(s,item));assert.equal(buy(s,item),false);}
 const saved=reload(s);assert.deepEqual(saved.decor,s.decor);assert.equal(saved.credits,s.credits);assert.equal(nextCall(saved),false);
});
