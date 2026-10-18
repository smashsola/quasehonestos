import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,finishCall,closeCall,load,migrateToDefense} from '../src/engine.js';
import {tutorialStory,tutorialStep,tutorialPanel,tutorialAction} from '../src/tutorial.js';
import {checkIncoming} from '../src/incoming.js';
import {shiftLearning,shiftEnding} from '../src/shift-ending.js';
test('Tutorial apresenta história curta e Supervisor sem usar a Chefia',()=>{
 const html=tutorialPanel(fresh(),String);
 assert.match(tutorialStory,/Quase Honestos/);assert.ok(tutorialStory.length<260);
 assert.match(html,/Supervisor/);assert.match(html,/SEU PRIMEIRO DIA/);assert.match(html,/Trambique OS/);assert.doesNotMatch(html,/Chefia/);
});
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
test('Tutorial de defesa acompanha só a primeira conversa e fica disponível sem depender do app aberto',()=>{
 const s=fresh();s.history.push({caller:'nino',outcome:'closed'});migrateToDefense(s);
 const welcome=tutorialPanel(s,String,true);assert.match(welcome,/Bata o ponto no Zape/);assert.match(welcome,/Etapa 1 de 3/);assert.match(welcome,/data-app="calls"/);assert.doesNotMatch(welcome,/Começar tutorial/);
 assert.equal(tutorialAction(s,'collapse'),true);assert.match(tutorialPanel(s,String),/Mostrar dicas/);assert.equal(tutorialAction(s,'collapse'),true);
 nextCall(s);s.active.chatStage='typing';assert.match(tutorialStep(s).title,/mensagem nova/);assert.match(tutorialStep(s).text,/três pontos/);
 s.active.chatStage='speaking';assert.match(tutorialStep(s).text,/murmúrio automaticamente/);
 s.active.chatStage='ready';s.active.murmurHeard=true;assert.equal(tutorialStep(s).number,2);const clueGuide=tutorialPanel(s,String);assert.match(clueGuide,/O que observar/);assert.match(clueGuide,/data-tutorial-clues/);assert.match(clueGuide,/lógica/);
 s.active.outcome='blocked';assert.equal(tutorialStep(s).number,3);finishCall(s);assert.equal(tutorialStep(s),null);assert.equal(tutorialPanel(s,String),'');
});
test('Recados surpresa não interrompem a primeira conversa guiada, voltam na seguinte',()=>{
 const s=fresh();nextCall(s);s.active.log=[{speaker:'Você',text:'Oi'}];s.tutorial='active';assert.equal(checkIncoming(s,0),false);assert.equal(s.incoming,undefined);
 s.cursor=1;checkIncoming(s,0,()=>0);assert.ok(s.incoming);assert.equal(checkIncoming(s,35000,()=>0),true);
});
test('Fim do expediente separa item compartilhado, pausa protetiva e recusa por irritação',()=>{
 const s={...fresh(),finished:true,tutorial:'completed',history:[{item:{token:'QH-DEMO'},audit:[]},{item:null,audit:[{intent:'wait'}]},{item:null,audit:[{intent:'hostile'}]}]};
 assert.deepEqual(shiftLearning(s),{shared:1,paused:1,withoutSharing:2});assert.match(shiftEnding(s,String),/Primeira conversa guiada concluída/);assert.match(shiftEnding(s,String),/Pausar também não significa que a fonte já foi consultada/);
});
