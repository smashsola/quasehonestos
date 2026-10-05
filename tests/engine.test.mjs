import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyMove,finishCall,load,KEY} from '../src/engine.js';
import {callers,moves,defenseTriggers,conversations} from '../src/data.js';
const permutations=items=>items.length?items.flatMap((item,i)=>permutations(items.filter((_,j)=>i!==j)).map(rest=>[item,...rest])):[[]];
test('Todas as ordens de jogadas encerram cada atendimento com falas válidas',()=>{
 for(let cursor=0;cursor<callers.length;cursor++)for(const order of permutations(moves.map(m=>m.id))){const state=fresh();state.cursor=cursor;nextCall(state);for(const id of order)applyMove(state,id);assert.ok(state.active.outcome);assert.ok(state.active.log.every(line=>typeof line.text==='string'&&line.text.length));const credits=state.credits;assert.equal(applyMove(state,order[0]),false);assert.equal(state.credits,credits);assert.equal(finishCall(state),true);assert.equal(state.history.length,1);assert.equal(state.cursor,cursor+1);}
});
test('Defesas ficam registradas e o expediente completo sobrevive ao salvamento',()=>{
 const state=fresh();for(const caller of callers){assert.equal(nextCall(state),true);applyMove(state,defenseTriggers[caller.defense][0]);assert.equal(state.active.outcome,'blocked');finishCall(state);}assert.equal(state.finished,true);assert.equal(nextCall(state),false);assert.deepEqual(state.discovered,callers.map(c=>c.id));assert.deepEqual(load({getItem:key=>key===KEY?JSON.stringify(state):null}),state);
});
test('Cada reação sem defesa tem fala própria do personagem',()=>{
 for(let cursor=0;cursor<callers.length;cursor++)for(const move of moves){if(defenseTriggers[callers[cursor].defense].includes(move.id))continue;const state=fresh();state.cursor=cursor;nextCall(state);applyMove(state,move.id);const dialogue=conversations[callers[cursor].id];assert.equal(state.active.log.at(-1).text,state.active.outcome?dialogue.accepted:dialogue[move.id]);}
});
