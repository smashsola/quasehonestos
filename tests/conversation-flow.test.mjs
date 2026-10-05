import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {conversationContext} from '../src/conversation-context.js';
import {dialogueHistory} from '../src/ai-dialogue.js';
test('Explicação adicional preserva etapa e esclarecimento sem liberar item',()=>{
 const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'request',trust:2,used:['pitch','answer'],log:[{speaker:'Nino',text:'Qual é o próximo passo?'}]});
 applyTypedMove(s,'typed','Foi a turma do concurso',{trustDelta:2,reason:'Detalhou a origem.',intent:'answer'});
 assert.equal(s.active.stage,'request');assert.equal(s.active.item,undefined);assert.doesNotMatch(s.active.log.at(-1).text,/Primeiro preciso entender/);
 const context=conversationContext(s.active);assert.equal(context.doubtAnswered,true);assert.equal(context.proposalExplained,true);assert.equal(context.lastIntent,'answer');assert.equal(s.credits,0);
});
test('Histórico limitado preserva abertura e mensagens recentes sem duplicar',()=>{
 const log=Array.from({length:30},(_,i)=>({speaker:i%2?'Nino':'Você',text:'Mensagem '+i}));
 const history=dialogueHistory(log,11);assert.equal(history.length,11);assert.equal(history[0].text,'Mensagem 0');assert.equal(history[1].text,'Mensagem 1');assert.equal(history.at(-1).text,'Mensagem 29');assert.equal(new Set(history.map(m=>m.text)).size,11);
 assert.deepEqual(dialogueHistory(log.slice(0,3)),log.slice(0,3));
});
