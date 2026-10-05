import {prepareOperation} from './prepare-operation.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {trustAppearance,savedExpression} from '../src/mood.js';
import {fresh,nextCall,applyTypedMove,load,KEY,disconnectSession,executeScheme} from '../src/engine.js';
import {flowSteps} from '../src/app-content.js';
function start(){const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'support',prepared:true,stage:'pitch',steps:[],log:[{speaker:'Nino',text:'Oi'}]});return s;}
test('Cor da confiança acompanha o percentual e limita valores inválidos',()=>{
 assert.equal(trustAppearance(0).color,'#ef827f');assert.equal(trustAppearance(1).color,'#e8b865');assert.equal(trustAppearance(1.5).color,'#e8b865');assert.equal(trustAppearance(2).color,'#66d3a3');assert.equal(trustAppearance(3).percent,100);assert.equal(trustAppearance(-1).percent,0);assert.equal(trustAppearance(9).percent,100);
});
test('Expressões reagem às falas e sobrevivem ao salvamento sem depender da janela',()=>{
 const s=start();applyTypedMove(s,'typed','oi');assert.equal(savedExpression(s.active),'happy');
 applyTypedMove(s,'typed','abc');assert.equal(savedExpression(s.active),'confused');
 applyTypedMove(s,'typed','Preciso disso agora');assert.equal(savedExpression(s.active),'suspicious');
 applyTypedMove(s,'typed','Você é um idiota');assert.equal(savedExpression(s.active),'angry');
 const restored=load({getItem:key=>key===KEY?JSON.stringify(s):null});assert.equal(savedExpression(restored.active),'angry');
 assert.equal(savedExpression({...restored.active,stage:'pitch',trust:3}),'angry');
});
test('Desconectar uma sessão encerra sem pagar e impede operação posterior',()=>{
 const s=start();Object.assign(s.active,{stage:'ready',item:{app:'support',token:'QH-DEMO'}});s.credits=25;
 assert.equal(disconnectSession(s),true);assert.equal(s.active.item,null);assert.equal(s.active.outcome,'closed');assert.equal(s.credits,25);assert.equal(disconnectSession(s),false);assert.equal(executeScheme(s,'support'),false);
 const prize=start();prize.active.scheme='prize';assert.equal(disconnectSession(prize),false);
});
test('Indicador das ferramentas acompanha somente a proposta correspondente',()=>{
 const s=start();assert.deepEqual(flowSteps(s,'support').map(x=>x.done),[true,false,false]);assert.deepEqual(flowSteps(s,'prize').map(x=>x.done),[false,false,false,false]);
 s.active.item={app:'support',token:'QH-DEMO'};s.active.stage='ready';assert.deepEqual(flowSteps(s,'support').map(x=>x.done),[true,true,false]);
 prepareOperation(s);executeScheme(s,'support');assert.deepEqual(flowSteps(s,'support').map(x=>x.done),[true,true,true]);
});
