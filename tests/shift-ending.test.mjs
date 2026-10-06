import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,load,KEY} from '../src/engine.js';
import {shiftReceipt,bossClosing,shiftEnding} from '../src/shift-ending.js';
test('Fechamento separa ganhos, perdas e saldo sem alterar os créditos',()=>{
 const state={...fresh(),finished:true,credits:210,history:[{earned:300},{earned:200},{earned:0}],incoming:{history:[{safe:false,penalty:90},{safe:true,penalty:0}]}};
 const before=JSON.stringify(state);
 assert.deepEqual(shiftReceipt(state),{earned:500,lost:90,balance:210,calls:3,risky:1});
 assert.match(bossClosing(state).join(' '),/C\$ 90/);
 assert.equal(JSON.stringify(state),before);
 assert.match(shiftEnding(state,s=>s),/Créditos não medem aprendizado/);
 assert.equal(shiftEnding({...state,finished:false},s=>s),'');
});
test('Chefe reconhece decisão arriscada sem saldo e não elogia como proteção',()=>{
 const state={...fresh(),incoming:{history:[{safe:false,penalty:0}]}};
 assert.match(bossClosing(state).join(' '),/suspeito que você aceitou/);
 state.incoming.history=[{safe:true,penalty:0}];
 assert.match(bossClosing(state).join(' '),/segurou o dinheiro/);
 state.decor=['duck'];assert.match(bossClosing(state).join(' '),/pato supervisor/);
});
test('Pergunta ao chefe persiste ao carregar e desaparece em um novo expediente',()=>{
 const state={...fresh(),finished:true,bossReply:'raise'};
 const loaded=load({getItem:key=>key===KEY?JSON.stringify(state):null});
 assert.match(shiftEnding(loaded,s=>s),/Estagiário Sênior/);
 assert.equal(fresh().bossReply,undefined);
});
