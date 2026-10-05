import {prepareOperation} from './prepare-operation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyMove,applyTypedMove,executeScheme,load} from '../src/engine.js';
import {virtualAccount,walletAccountPanel} from '../src/prize-wallet.js';
import {callers} from '../src/data.js';
test('Prêmio expõe só conta virtual após compartilhar e desvia créditos uma vez',()=>{
 for(const caller of callers){const state=fresh();state.cursor=callers.findIndex(c=>c.id===caller.id);nextCall(state);Object.assign(state.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Prêmio'}]});
 assert.equal(virtualAccount(state.active),null);assert.equal(walletAccountPanel(state.active,caller.name,t=>t),'');
 applyMove(state,'pitch');applyMove(state,'answer');applyTypedMove(state,'typed','Pode compartilhar o identificador BatataPay?');
 const account=virtualAccount(state.active);assert.ok(account);assert.match(account.identifier,/QH-DEMO/);assert.equal(account.debit,0);assert.equal(state.credits,0);
 prepareOperation(state);assert.equal(executeScheme(state,'wallet'),true);const restored=load({getItem:()=>JSON.stringify(state)});const after=virtualAccount(restored.active);
 assert.equal(account.balance-after.balance,state.credits);assert.equal(after.debit,30);assert.equal(restored.active.expression,'suspicious');assert.match(restored.active.log.at(-1).text,/DIMINUIU/);assert.equal(executeScheme(restored,'wallet'),false);
 }
});
