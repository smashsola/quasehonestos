import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,load,KEY} from '../src/engine.js';
import {checkIncoming,answerIncoming,dismissIncoming,snoozeIncoming} from '../src/incoming.js';
import {incomingScenes,incomingScene,refreshIncoming,incomingReport} from '../src/incoming-scenes.js';
function start(){const s=fresh();nextCall(s);s.active.log=[{speaker:'Nino',text:'Oi'}];return s;}
test('A mensagem chega após intervalo variável, sem depender de resultado de atendimento',()=>{
 const s=start();assert.equal(checkIncoming(s,1000,()=>0),false);assert.equal(s.incoming.nextAt,36000);assert.equal(checkIncoming(s,35999,()=>0),false);assert.equal(checkIncoming(s,36000,()=>0),true);assert.equal(s.active.outcome,null);assert.equal(s.incoming.pending.scene,'prize');assert.equal(checkIncoming(s,90000,()=>0),false);
 const later=start();checkIncoming(later,1000,()=>.9);assert.ok(later.incoming.nextAt>60000);
});
test('Resposta segura preserva a conversa, o item e o dinheiro; registra uma única decisão',()=>{
 const s=start();s.active.item={token:'QH-DEMO'};s.credits=40;const active=JSON.stringify(s.active);checkIncoming(s,0,()=>0);checkIncoming(s,35000,()=>0);
 assert.equal(answerIncoming(s,'unknown'),false);assert.equal(dismissIncoming(s,35000,()=>0),false);assert.equal(answerIncoming(s,'check'),true);assert.equal(answerIncoming(s,'send'),false);assert.equal(s.incoming.history.length,1);assert.equal(s.credits,40);assert.equal(JSON.stringify(s.active),active);
 const saved=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.equal(saved.incoming.pending.result.safe,true);assert.equal(dismissIncoming(saved,50000,()=>0),true);assert.equal(saved.incoming.nextAt,140000);assert.equal(saved.incoming.pending,null);
});
test('Eventos variam, não se repetem e param ao concluir o expediente',()=>{
 const s=start();let now=0;checkIncoming(s,now,()=>0);
 for(let i=0;i<3;i++){now=s.incoming.nextAt;assert.equal(checkIncoming(s,now,()=>0),true);const p=s.incoming.pending;const choice=incomingScene(p).choices.find(c=>c.safe);answerIncoming(s,choice.id);dismissIncoming(s,now,()=>0);}
 assert.equal(new Set(s.incoming.history.map(h=>h.scene)).size,3);assert.equal(checkIncoming(s,s.incoming.nextAt,()=>0),false);
 const empty=fresh();assert.equal(checkIncoming(empty,999999,()=>0),false);assert.equal(empty.incoming,undefined);const finished=start();finished.finished=true;assert.equal(checkIncoming(finished,999999,()=>0),false);
});
test('Ver depois recolhe a mensagem sem registrar uma resposta',()=>{
 const s=start();checkIncoming(s,0,()=>0);checkIncoming(s,35000,()=>0);s.incoming.pending.open=true;assert.equal(snoozeIncoming(s),true);assert.equal(s.incoming.pending.open,false);assert.ok(s.incoming.pending.snoozedUntil>Date.now());assert.equal(s.incoming.history.length,0);
});

test('Cada escolha arriscada desconta uma vez, sobrevive ao salvamento e preserva o NPC',()=>{
 for(const [id,scene] of Object.entries(incomingScenes))for(const choice of scene.choices.filter(c=>!c.safe)){
  const s=start();s.credits=600;s.active.item={token:'QH-DEMO'};const active=JSON.stringify(s.active);
  s.incoming={pending:{id:'test-'+id,scene:id,variant:'office',sender:scene.sender,result:null},history:[],seen:[id]};
  assert.equal(answerIncoming(s,choice.id),true);assert.equal(s.credits,600-scene.loss);assert.equal(s.incoming.pending.result.penalty,scene.loss);assert.equal(s.incoming.history[0].before,600);assert.equal(s.incoming.history[0].after,s.credits);assert.equal(JSON.stringify(s.active),active);
  const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(answerIncoming(restored,choice.id),false);assert.equal(restored.credits,s.credits);assert.equal(restored.incoming.history.length,1);assert.ok(incomingReport(restored.incoming.history).includes('Perda: C$ '+scene.loss));assert.ok(incomingReport(restored.incoming.history).includes('saldo após a resposta: C$ '+s.credits));
 }
});

test('Saldo baixo limita a perda e uma escolha inválida não desconta',()=>{
 for(const balance of [0,25]){
  const s=start();s.credits=balance;checkIncoming(s,0,()=>0);checkIncoming(s,35000,()=>0);
  assert.equal(answerIncoming(s,'invalid'),false);assert.equal(s.credits,balance);
  assert.equal(answerIncoming(s,'send'),true);assert.equal(s.credits,0);assert.equal(s.incoming.pending.result.penalty,balance);assert.equal(s.incoming.pending.result.safe,false);
 }
});

test('Atualizar um recado antigo só muda os não respondidos e não desconta retroativamente',()=>{
 const s=start();s.credits=400;s.incoming={pending:{id:'old',scene:'prize',sender:'Equipe Batata Dourada',result:null,open:true},history:[{safe:false,label:'Usar o link',feedback:'Recado antigo'}],seen:['prize']};
 const history=JSON.stringify(s.incoming.history);assert.equal(refreshIncoming(s),true);assert.equal(s.incoming.pending.variant,'office');assert.equal(incomingScene(s.incoming.pending).sender,incomingScenes.prize.sender);assert.equal(s.credits,400);assert.equal(JSON.stringify(s.incoming.history),history);
 assert.equal(refreshIncoming(s),false);answerIncoming(s,'check');assert.equal(s.credits,400);
 delete s.incoming.pending.variant;assert.equal(refreshIncoming(s),false);assert.match(incomingScene(s.incoming.pending).message,/Batata Dourada/);assert.equal(s.credits,400);
});
