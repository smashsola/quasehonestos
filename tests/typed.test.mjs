import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove} from '../src/engine.js';
function start(){const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:'Nino',text:'Oi'}]});return s;}
test('Falas digitadas podem subir e reduzir confiança sem avançar por agressão',()=>{
 const s=start();assert.equal(applyTypedMove(s,'chat','Oi, tudo bem?'),true);assert.equal(s.active.trust,1);
 assert.equal(applyTypedMove(s,'pitch','Você é um idiota'),true);assert.equal(s.active.trust,0);assert.equal(s.active.stage,'pitch');assert.equal(s.active.log.at(-2).text,'Você é um idiota');
 assert.equal(applyTypedMove(s,'pitch','Queria apresentar o prêmio da Batata'),true);assert.equal(s.active.trust,1);
 assert.equal(applyTypedMove(s,'answer','Não tenho certeza'),true);assert.equal(s.active.trust,.5);assert.equal(s.active.stage,'question');
});
test('Pressão reduz confiança e conversa após item recebido não paga nem muda etapa',()=>{
 const s=start();applyTypedMove(s,'chat','Oi');applyTypedMove(s,'pressure','Tem que ser agora');assert.equal(s.active.trust,0);
 s.active.stage='ready';const length=s.active.log.length;assert.equal(applyTypedMove(s,'answer','Oi'),true);assert.equal(s.active.log.length,length+2);assert.equal(s.active.stage,'ready');assert.equal(s.credits,0);
});
