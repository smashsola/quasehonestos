import {requiresScamInteraction} from '../src/interaction-policy.js';
import {advanceCampaignDay} from '../src/campaign-days.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {expandedScams,expandedById} from '../src/expanded-scams.js';
import {beginScamInteraction,actScamInteraction,expireScamInteraction,scamInteractionView} from '../src/scam-interaction.js';
import {defensePeople,defenseCases,startDefenseCall,beginDefenseAction,decideDefense,settleDefenseLoss} from '../src/defense-round.js';
import {fresh,load,finishCall,nextCall} from '../src/engine.js';
import {revengeScenes} from '../src/revenge.js';
import {revengeAnimation} from '../src/revenge-animation.js';
import {officeIcon} from '../src/office-icons.js';
function active(id){const a=startDefenseCall(defensePeople.findIndex(p=>p.caseId===id));Object.assign(a,{chatStage:'ready',chatVisible:1,murmurHeard:true});return a;}
function review(a){if(a.caseId==='fake-middleman'){actScamInteraction(a,'read:buyer');actScamInteraction(a,'read:seller');}if(a.caseId==='terms-permissions')for(const key of ['contacts','sms','renewal'])actScamInteraction(a,'toggle:'+key);if(a.caseId==='fake-donation')actScamInteraction(a,'select:official');if(a.caseId==='fake-mei')actScamInteraction(a,'select:guide');}

test('Fifteen new scams plus terms append without changing the first ten cases',()=>{assert.equal(expandedScams.length,20);assert.equal(defensePeople.length,30);assert.equal(Object.values(defenseCases).flatMap(s=>s.choices).length,120);assert.deepEqual(defensePeople.slice(0,10).map(p=>p.caseId),['whatsapp','bank-call','fake-pix','boleto','delivery','ransomware','fake-motoboy','fake-store','fake-government','card-swap']);assert.equal(new Set(expandedScams.map(s=>s.kind)).size,20);});
for(const s of expandedScams){
 test(s.id+': all four choices settle once; only selected choices open their mechanic',()=>{
  for(const choice of defenseCases[s.id].choices){let a=active(s.id),state={active:a,credits:0},done=choice.id;
   const interactive=requiresScamInteraction(s.id,choice.id);assert.equal(beginScamInteraction(a,choice.id,1000),interactive);
   if(interactive){assert.equal(beginScamInteraction(a,choice.id,1001),false);assert.equal(beginDefenseAction(a,choice.id),false);assert.match(scamInteractionView(a,String),/role="dialog"/);assert.doesNotMatch(scamInteractionView(a,String),/type="file"|type="password"|https?:\/\//);state=load({getItem:()=>JSON.stringify({...fresh(),mode:'defense',active:a,cursor:defensePeople.findIndex(p=>p.caseId===s.id)})});a=state.active;assert.equal(a.interaction.choice,choice.id);
    if(a.interaction.view==='contain'){assert.equal(expireScamInteraction(a,12999),null);done=actScamInteraction(a,'rescue',2000).choice;}else{review(a);done=actScamInteraction(a,'safe').choice;}
    assert.ok(done.endsWith('--verify'));assert.equal(actScamInteraction(a,'safe'),null);
   }
   assert.ok(beginDefenseAction(a,done));assert.equal(beginDefenseAction(a,done),false);a.actionPending=null;assert.ok(decideDefense(a,done));assert.equal(a.outcome,defenseCases[s.id].choices.find(c=>c.id===done).safe?'blocked':'fooled');assert.equal(decideDefense(a,done),false);settleDefenseLoss(state);const balance=state.credits;assert.equal(settleDefenseLoss(state),false);assert.equal(state.credits,balance);
  }
 });
 test(s.id+': unsafe animation or live incident charges only once',()=>{const a=active(s.id),state={active:a,credits:0},id=s.id+'--accept';let done=id;if(requiresScamInteraction(s.id,id)){assert.ok(beginScamInteraction(a,id,1000));assert.equal(a.interaction.view,'contain');assert.equal(expireScamInteraction(a,12999),null);done=expireScamInteraction(a,13000).choice;}else assert.equal(beginScamInteraction(a,id),false);assert.ok(beginDefenseAction(a,done));a.actionPending=null;decideDefense(a,done);assert.equal(settleDefenseLoss(state),true);assert.equal(state.credits,-s.loss);assert.equal(settleDefenseLoss(state),false);});
 test(s.id+': five revenge frames use a distinct prop and preserve entrance timing',()=>{const frames=[];for(let step=0;step<5;step++){const html=revengeAnimation(s.id,step,revengeScenes[s.id],String);frames.push(html);assert.match(html,/rv-unique-scene rv-prop-/);assert.match(html,/data-rv-enter=/);assert.doesNotMatch(html,/undefined/);}assert.equal(new Set(frames).size,5);});
}

test('Danger containment can be rescued before its deadline, including after a save',()=>{for(const id of ['fake-update','account-takeover']){let a=active(id);beginScamInteraction(a,id+'--accept',1000);a=JSON.parse(JSON.stringify(a));assert.equal(actScamInteraction(a,'rescue',12999).choice,id+'--verify');assert.equal(expireScamInteraction(a,13000),null);}});
test('Permissions must all be reviewed and declined; toggles do not accumulate duplicate entries',()=>{const a=active('terms-permissions');beginScamInteraction(a,'terms-permissions--verify');actScamInteraction(a,'inspect');actScamInteraction(a,'inspect');assert.equal(actScamInteraction(a,'safe'),null);actScamInteraction(a,'toggle:contacts');actScamInteraction(a,'toggle:contacts');assert.deepEqual(a.interaction.disabled,[]);assert.equal(actScamInteraction(a,'toggle:camera'),null);for(const k of ['contacts','sms','renewal'])actScamInteraction(a,'toggle:'+k);assert.equal(actScamInteraction(a,'safe').choice,'terms-permissions--verify');});
test('An old finished ten-case save resumes at the first new case; a crash is preserved',()=>{const state={...fresh(),mode:'defense',cursor:10,finished:true,history:[]};delete state.caseOrder;const restored=load({getItem:()=>JSON.stringify(state)});assert.equal(restored.finished,false);assert.ok(nextCall(restored));assert.equal(restored.active.caseId,'pix-return');state.history=[{caller:'leo',caseId:'ransomware',outcome:'fooled',gameOver:true}];assert.equal(load({getItem:()=>JSON.stringify(state)}).finished,true);});
test('The last campaign result is at case 30; earlier results do not finish prematurely',()=>{const state={...fresh(),mode:'defense'};for(let i=0;i<30;i++){if(state.dayBreak)assert.ok(advanceCampaignDay(state));assert.ok(nextCall(state));const a=state.active,choice=defenseCases[a.caseId].choices.find(c=>c.safe);decideDefense(a,choice.id);assert.ok(finishCall(state));assert.equal(state.finished,i===29);}assert.equal(nextCall(state),false);assert.equal(state.history.length,30);});
test('Our original monitor mark and new affordances are vector assets, with no Windows glyph',()=>{for(const id of ['brand','shield','search'])assert.match(officeIcon(id),/<svg/);assert.match(officeIcon('brand'),/office-brand/);assert.match(officeIcon('brand'),/#e7a867/);});
test('Closing a live incident cannot silently erase an already authorized risk',()=>{const a=active('fake-update');beginScamInteraction(a,'fake-update--accept',1000);assert.equal(actScamInteraction(a,'cancel'),null);assert.equal(a.interaction.view,'contain');assert.equal(expireScamInteraction(a,13000).choice,'fake-update--accept');});
