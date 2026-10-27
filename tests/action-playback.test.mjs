import test from 'node:test';
import assert from 'node:assert/strict';
import {createActionPlayback} from '../src/action-playback.js';
import {defenseCases,startDefenseCall,beginDefenseAction,endDefenseContact,decideDefense} from '../src/defense-round.js';
function harness(){
 let time=0,next=0;const tasks=new Map(),events=[];
 const player=createActionPlayback({now:()=>time,schedule:(fn,ms)=>{const id=++next;tasks.set(id,{fn,at:time+ms});return id;},cancel:id=>tasks.delete(id),onPhase:p=>events.push(p),onPress:()=>events.push('click'),onFinish:()=>events.push('finished')});
 return {player,events,advance(to){time=to;for(const [id,task] of [...tasks])if(task.at<=time){tasks.delete(id);task.fn();}},};
}
test('As 40 demonstrações resistem a atualizações repetidas: um clique e uma conclusão',()=>{
 for(const [index,scenario] of Object.values(defenseCases).entries())for(const choice of scenario.choices){
  const h=harness(),active=startDefenseCall(index);active.chatStage='ready';assert.ok(beginDefenseAction(active,choice.id,0));
  h.player.start(active,7000);
  for(const at of [500,1260,2000,3500,5320,6000]){h.advance(at);assert.equal(h.player.start(active,7000),false);}
  h.advance(7000);h.player.refresh();h.advance(15000);
  assert.equal(h.events.filter(e=>e==='click').length,1,choice.id);assert.equal(h.events.filter(e=>e==='finished').length,1,choice.id);
  assert.equal(beginDefenseAction(active,choice.id,8000),false);assert.equal(endDefenseContact(active),false);
  active.actionPending=null;assert.ok(decideDefense(active,choice.id));assert.equal(decideDefense(active,choice.id),false);
 }
});
test('Cancelar uma demonstração invalida seus callbacks anteriores',()=>{
 const h=harness();h.player.start('old',7000);h.player.stop();h.advance(9000);assert.deepEqual(h.events,['preparing']);
 h.player.start('new',7000);h.advance(16000);assert.equal(h.events.filter(e=>e==='finished').length,1);
});
test('Voltar de uma aba suspensa conclui a ação sem reproduzir um clique atrasado',()=>{
 const h=harness();h.player.start('one',7000);h.advance(30000);h.player.refresh();assert.equal(h.events.filter(e=>e==='finished').length,1);assert.equal(h.events.filter(e=>e==='click').length,0);
});
