import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
import {callers} from '../src/data.js';
import {protectionCard} from '../src/comedy-learning.js';
import {readIntent} from '../src/dialogue.js';

test('Piadas variam sem compartilhar itens ou avançar a proposta',()=>{
 for(const c of callers){const state=fresh();state.cursor=callers.findIndex(p=>p.id===c.id);nextCall(state);Object.assign(state.active,{scheme:'prize',prepared:true,stage:'pitch',log:[]});
 const jokes=[];for(let i=0;i<5;i++){applyTypedMove(state,'typed','Como foi seu dia?');if(i%2===0)jokes.push(state.active.log.at(-1).text);}
 assert.equal(new Set(jokes).size,3);assert.equal(state.active.stage,'pitch');assert.equal(state.active.trust,0);assert.equal(state.active.item,undefined);assert.equal(state.credits,0);
 }
});
test('Cada proposta tem proteção prática abrível e mantém dados fictícios claros',()=>{
 for(const scheme of ['prize','support','club','update']){const html=protectionCard(scheme,text=>text);assert.match(html,/<details/);assert.doesNotMatch(html,/<details[^>]*\bopen\b/);assert.match(html,/O sinal de perigo/);assert.match(html,/Uma atitude para se proteger/);assert.match(html,/fictícios/);}
 assert.equal(protectionCard('unknown',text=>text),'');assert.equal(readIntent('Pode usar o skin changer','update','request'),'request');
});
