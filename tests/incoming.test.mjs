import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,load,KEY} from '../src/engine.js';
import {checkIncoming,answerIncoming,dismissIncoming,snoozeIncoming} from '../src/incoming.js';
import {defenseScenes} from '../src/dialogue.js';
function start(){const s=fresh();nextCall(s);s.active.log=[{speaker:'Nino',text:'Oi'}];return s;}
test('A mensagem chega após intervalo variável, sem depender de resultado de atendimento',()=>{
 const s=start();assert.equal(checkIncoming(s,1000,()=>0),false);assert.equal(s.incoming.nextAt,36000);assert.equal(checkIncoming(s,35999,()=>0),false);assert.equal(checkIncoming(s,36000,()=>0),true);assert.equal(s.active.outcome,null);assert.equal(s.incoming.pending.scene,'prize');assert.equal(checkIncoming(s,90000,()=>0),false);
 const later=start();checkIncoming(later,1000,()=>.9);assert.ok(later.incoming.nextAt>60000);
});
test('Responder preserva a conversa, o item e o dinheiro; registra uma única decisão',()=>{
 const s=start();s.active.item={token:'QH-DEMO'};s.credits=40;const active=JSON.stringify(s.active);checkIncoming(s,0,()=>0);checkIncoming(s,35000,()=>0);
 assert.equal(answerIncoming(s,'unknown'),false);assert.equal(dismissIncoming(s,35000,()=>0),false);assert.equal(answerIncoming(s,'check'),true);assert.equal(answerIncoming(s,'send'),false);assert.equal(s.incoming.history.length,1);assert.equal(s.credits,40);assert.equal(JSON.stringify(s.active),active);
 const saved=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.equal(saved.incoming.pending.result.safe,true);assert.equal(dismissIncoming(saved,50000,()=>0),true);assert.equal(saved.incoming.nextAt,140000);assert.equal(saved.incoming.pending,null);
});
test('Eventos variam, não se repetem e param ao concluir o expediente',()=>{
 const s=start();let now=0;checkIncoming(s,now,()=>0);
 for(let i=0;i<3;i++){now=s.incoming.nextAt;assert.equal(checkIncoming(s,now,()=>0),true);const p=s.incoming.pending;const choice=defenseScenes[p.scene].choices.find(c=>c.safe);answerIncoming(s,choice.id);dismissIncoming(s,now,()=>0);}
 assert.equal(new Set(s.incoming.history.map(h=>h.scene)).size,3);assert.equal(checkIncoming(s,s.incoming.nextAt,()=>0),false);
 const empty=fresh();assert.equal(checkIncoming(empty,999999,()=>0),false);assert.equal(empty.incoming,undefined);const finished=start();finished.finished=true;assert.equal(checkIncoming(finished,999999,()=>0),false);
});
test('Ver depois recolhe a mensagem sem registrar uma resposta',()=>{
 const s=start();checkIncoming(s,0,()=>0);checkIncoming(s,35000,()=>0);s.incoming.pending.open=true;assert.equal(snoozeIncoming(s),true);assert.equal(s.incoming.pending.open,false);assert.ok(s.incoming.pending.snoozedUntil>Date.now());assert.equal(s.incoming.history.length,0);
});
