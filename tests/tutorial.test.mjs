import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,finishCall,closeCall,load} from '../src/engine.js';
import {tutorialStep,tutorialPanel,tutorialAction} from '../src/tutorial.js';
import {checkIncoming} from '../src/incoming.js';
import {shiftLearning,shiftEnding} from '../src/shift-ending.js';
test('Tutorial acompanha o estado real, não entrega itens ou altera créditos e permite pular',()=>{
 const s=fresh();assert.equal(tutorialStep(s).number,1);tutorialAction(s,'start');nextCall(s);assert.equal(tutorialStep(s).number,2);
 Object.assign(s.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Oi'}]});assert.equal(tutorialStep(s).number,4);
 applyTypedMove(s,'typed','Sei lá');assert.equal(tutorialStep(s).number,4);assert.ok(!s.active.item);
 applyTypedMove(s,'typed','Tenho um prêmio do concurso de batatas');assert.equal(tutorialStep(s).number,5);
 applyTypedMove(s,'typed','O pessoal do concurso organizou o prêmio');assert.equal(tutorialStep(s).number,6);
 const before=JSON.stringify(s.active);tutorialAction(s,'collapse');tutorialAction(s,'skip');assert.equal(s.credits,0);assert.equal(JSON.stringify(s.active),before);assert.equal(tutorialPanel(s,String),'');
 assert.equal(load({getItem:()=>JSON.stringify(s)}).tutorial,'skipped');
});
test('Guia distingue anexo, permissão e uso no app; some depois da primeira conversa',()=>{
 const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'update',prepared:true,stage:'request',log:[{speaker:'Você',text:'Oi'}]});s.tutorial='active';
 assert.match(tutorialStep(s).title,/Envie/);s.active.fileSent=true;assert.match(tutorialStep(s).example,/instalar/);
 s.active.stage='ready';s.active.item={app:'update'};assert.equal(tutorialStep(s).app,'update');assert.match(tutorialStep(s).text,/3 dados/);
 closeCall(s);assert.equal(tutorialStep(s).number,8);finishCall(s);assert.equal(tutorialStep(s),null);
});
test('Recados surpresa não interrompem a primeira conversa guiada, voltam na seguinte',()=>{
 const s=fresh();nextCall(s);s.active.log=[{speaker:'Você',text:'Oi'}];s.tutorial='active';assert.equal(checkIncoming(s,0),false);assert.equal(s.incoming,undefined);
 s.cursor=1;checkIncoming(s,0,()=>0);assert.ok(s.incoming);assert.equal(checkIncoming(s,35000,()=>0),true);
});
test('Fim do expediente separa item compartilhado de verificação e recusa por irritação',()=>{
 const s={...fresh(),finished:true,tutorial:'completed',history:[{item:{token:'QH-DEMO'},audit:[]},{item:null,audit:[{reason:'Uma verificação independente interrompeu a tentativa.'}]},{item:null,audit:[{reason:'O tom agressivo reduziu a confiança.'}]}]};
 assert.deepEqual(shiftLearning(s),{shared:1,verified:1,withoutSharing:2});assert.match(shiftEnding(s,String),/Primeira conversa guiada concluída/);
});
