import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,load} from '../src/engine.js';
import {livingReply} from '../src/living-dialogue.js';
import {callers} from '../src/data.js';
function start(caller='nino'){const s=fresh();s.cursor=callers.findIndex(c=>c.id===caller);nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:caller,text:'Oi'}]});return s;}
test('Todos os personagens têm dúvidas e reações próprias',()=>{
 for(const event of ['aside','repeat','repair','refuse','end','memory','question'])assert.equal(new Set(callers.map(c=>livingReply({caller:c.id,scheme:'prize'},event))).size,6);
 for(const c of callers){const s=start(c.id);applyTypedMove(s,'','Como foi seu dia?');assert.equal(s.active.stage,'pitch');assert.equal(s.active.trust,0);assert.equal(s.active.item,undefined);assert.equal(s.active.log.at(-1).text,livingReply(s.active,'aside'));}
});
test('Memória sobre gratuidade sobrevive ao salvamento e contradições não encerram',()=>{
 let s=start();applyTypedMove(s,'','O prêmio da Batata é grátis');s=load({getItem:()=>JSON.stringify(s)});
 applyTypedMove(s,'','Precisa pagar uma taxa');assert.equal(s.active.outcome,null);assert.equal(s.active.stage,'question');assert.equal(s.active.log.at(-1).text,livingReply(s.active,'memory'));assert.equal(s.credits,0);
 applyTypedMove(s,'','Precisa pagar uma taxa');assert.equal(s.active.outcome,null);
});
test('Desculpas acalmam sem liberar item; agressão repetida encerra',()=>{
 for(const c of callers){const s=start(c.id);applyTypedMove(s,'','Você é um idiota');assert.equal(s.active.outcome,null);assert.equal(s.active.irritation,2);
 applyTypedMove(s,'','Desculpa, foi mal');assert.equal(s.active.irritation,1);assert.equal(s.active.item,undefined);assert.equal(s.active.stage,'pitch');
 applyTypedMove(s,'','Cala a boca');assert.equal(s.active.outcome,'blocked');assert.equal(s.active.expression,'angry');assert.equal(s.active.log.at(-1).text,livingReply(s.active,'end'));}
});
