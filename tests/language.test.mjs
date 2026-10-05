import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMessage,negatedRequest} from '../src/language.js';
import {readIntent} from '../src/dialogue.js';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
function start(stage){const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage,trust:2.4,log:[{speaker:'Nino',text:'Quem organizou isso?'}]});return s;}
test('Abreviações e pedidos informais são compreendidos na reserva local',()=>{
 assert.equal(normalizeMessage('vc q manda o cod aq pfv'),'voce que manda o codigo aqui por favor');
 assert.equal(readIntent('me passa aquele cod ai pfv','prize','request'),'request');
 assert.equal(negatedRequest('n me manda o kartao'),true);
});
test('Intenção contextual responde sem palavras fixas e não pula etapas',()=>{
 const s=start('question');applyTypedMove(s,'typed','Foi o pessoal que fez aquele evento',{trustDelta:3,reason:'Respondeu à origem.',intent:'answer'});assert.equal(s.active.stage,'request');assert.equal(s.active.item,undefined);
 const early=start('pitch');applyTypedMove(early,'typed','Me passa aquilo',{trustDelta:3,reason:'Pedido antecipado.',intent:'request'});assert.equal(early.active.item,undefined);
});
test('Negação permanece negação mesmo com classificação incorreta da IA',()=>{
 const s=start('request');applyTypedMove(s,'typed','n me manda o kartao',{trustDelta:0,reason:'Não pediu o item.',intent:'request'});assert.equal(s.active.item,undefined);
 const unclear=start('question');applyTypedMove(unclear,'typed','abacaxi espacial',{trustDelta:0,reason:'Não respondeu.',intent:'unclear'});assert.equal(unclear.active.stage,'question');
});
