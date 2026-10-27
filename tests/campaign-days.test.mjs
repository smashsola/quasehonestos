import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrateToDefense,nextCall,finishCall,load} from '../src/engine.js';
import {defensePeople,defenseCases,decideDefense} from '../src/defense-round.js';
import {campaignDay,campaignDayCount,campaignAdvanceLabel,advanceCampaignDay,campaignDayBreakView} from '../src/campaign-days.js';
import {beginScamInteraction,actScamInteraction} from '../src/scam-interaction.js';
const safeFinish=state=>{const a=state.active,choice=defenseCases[a.caseId].choices.find(c=>c.safe);assert.ok(decideDefense(a,choice.id));assert.ok(finishCall(state));};
test('Thirty cases form six days of five; each checkpoint waits for an explicit continuation',()=>{
 const s=fresh();migrateToDefense(s);s.credits=375;const boundaries=[];
 assert.equal(defensePeople.length,30);assert.equal(campaignDayCount(30),6);
 for(let i=0;i<30;i++){
  assert.ok(nextCall(s));assert.deepEqual([campaignDay(s).number,campaignDay(s).position],[Math.floor(i/5)+1,i%5+1]);
  assert.equal(campaignAdvanceLabel(s),i===29?'Concluir campanha':i%5===4?'Encerrar dia '+(Math.floor(i/5)+1):'Próxima situação');
  safeFinish(s);assert.equal(finishCall(s),false);assert.equal(s.credits,375);
  if(i%5===4&&i<29){boundaries.push(i+1);assert.equal(s.dayBreak.completedDay,(i+1)/5);assert.equal(nextCall(s),false);assert.equal(s.finished,false);const html=campaignDayBreakView(s,defensePeople,defenseCases,String);assert.match(html,new RegExp('Começar dia '+((i+1)/5+1)));assert.equal((html.match(/class="case-review-card"/g)||[]).length,5);assert.equal((html.match(/class="campaign-day /g)||[]).length,6);assert.ok(advanceCampaignDay(s));assert.equal(advanceCampaignDay(s),false);}
 }
 assert.deepEqual(boundaries,[5,10,15,20,25]);assert.equal(s.finished,true);assert.equal(s.dayBreak,null);assert.equal(s.shift,5);assert.equal(nextCall(s),false);
});
test('Reloading the day break retains the checkpoint, balance, history and chosen outcomes',()=>{
 let s=fresh();migrateToDefense(s);s.credits=-81;for(let i=0;i<5;i++){nextCall(s);safeFinish(s);}const before=JSON.stringify(s.history);s=load({getItem:()=>JSON.stringify(s)});assert.equal(s.dayBreak.completedDay,1);assert.equal(s.credits,-81);assert.equal(JSON.stringify(s.history),before);assert.equal(nextCall(s),false);assert.ok(advanceCampaignDay(s));assert.ok(nextCall(s));assert.equal(s.cursor,5);assert.equal(s.active.caseId,'fake-pix');assert.equal(campaignDay(s).number,2);
});
test('Legacy saves are aligned to days without resetting progress or an active scene',()=>{
 for(const cursor of [5,10,15,20,25,26]){const old={...fresh(),mode:'defense',cursor,finished:cursor===26,credits:123};delete old.caseOrder;delete old.campaignDaysVersion;delete old.dayBreak;const s=load({getItem:()=>JSON.stringify(old)});assert.equal(s.cursor,cursor);assert.equal(s.credits,123);assert.equal(s.finished,false);assert.equal(!!s.dayBreak,cursor%5===0);assert.equal(campaignDay(s).number,cursor%5===0?cursor/5:6);}
 const old={...fresh(),mode:'defense',cursor:5};delete old.caseOrder;nextCall(old);delete old.campaignDaysVersion;const s=load({getItem:()=>JSON.stringify(old)});assert.equal(s.dayBreak,null);assert.equal(s.active.caseId,'ransomware');assert.equal(campaignDay(s).number,2);
});
test('An early crash retains its actual day and position',()=>{for(const cursor of [1,5,6,11,30]){const d=campaignDay({cursor,finished:true});assert.equal(d.number,Math.ceil(cursor/5));assert.equal(d.position,(cursor-1)%5+1);}});
test('Both sides of the middleman story must be opened; rereading one side does not complete the comparison',()=>{
 const a={mode:'defense',caseId:'fake-middleman',chatStage:'ready',used:[]};assert.ok(beginScamInteraction(a,'fake-middleman--verify'));assert.equal(actScamInteraction(a,'read:buyer').changed,true);assert.equal(a.interaction.step,1);assert.equal(actScamInteraction(a,'read:buyer'),null);assert.equal(actScamInteraction(a,'safe'),null);actScamInteraction(a,'read:seller');assert.equal(actScamInteraction(a,'safe').choice,'fake-middleman--verify');
});
test('Donation and MEI require the independently checked destination',()=>{
 for(const [id,wrong,right] of [['fake-donation','forwarded','official'],['fake-mei','received','guide']]){const a={mode:'defense',caseId:id,chatStage:'ready',used:[]};beginScamInteraction(a,id+'--verify');actScamInteraction(a,'inspect');actScamInteraction(a,'inspect');actScamInteraction(a,'select:'+wrong);assert.equal(actScamInteraction(a,'safe'),null);actScamInteraction(a,'select:'+right);assert.equal(actScamInteraction(a,'safe').choice,id+'--verify');}
});
test('Free-skin safe choice needs no extra screen; an authorized trade has a direct rescue',()=>{
 const a={mode:'defense',caseId:'free-skins',chatStage:'ready',used:[]};assert.equal(beginScamInteraction(a,'free-skins--verify'),false);
 const b={mode:'defense',caseId:'free-skins',chatStage:'ready',used:[]};assert.ok(beginScamInteraction(b,'free-skins--accept',1000));assert.equal(b.interaction.view,'contain');assert.equal(actScamInteraction(b,'rescue',2000).choice,'free-skins--verify');
});
