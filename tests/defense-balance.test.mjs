import test from 'node:test';
import assert from 'node:assert/strict';
import {settleDefenseLoss} from '../src/defense-round.js';
test('Prejuízo fictício desconta uma vez e persiste ao recarregar',()=>{const state={credits:200,active:{mode:'defense',caseId:'card-swap',outcome:'fooled',balanceEligible:true}};assert.equal(settleDefenseLoss(state),true);assert.equal(state.credits,119);assert.equal(state.active.balanceSettlement.loss,81);const restored=JSON.parse(JSON.stringify(state));assert.equal(settleDefenseLoss(restored),false);assert.equal(restored.credits,119);});
test('Desconto permite dívida; acertos e resultados antigos preservam saldo',()=>{for(const credits of [0,30]){const s={credits,active:{mode:'defense',caseId:'whatsapp',outcome:'fooled',balanceEligible:true}};settleDefenseLoss(s);assert.equal(s.credits,credits-480);assert.equal(s.active.balanceSettlement.loss,480);}for(const active of [{mode:'defense',outcome:'blocked',balanceEligible:true},{mode:'defense',outcome:'fooled'},{mode:'defense',balanceEligible:true}]){const s={credits:200,active};settleDefenseLoss(s);assert.equal(s.credits,200);}});

test('Saldo negativo sobrevive ao carregamento da partida',async()=>{const {fresh,load}=await import('../src/engine.js');const state=fresh();state.credits=-480;const restored=load({getItem:()=>JSON.stringify(state)});assert.equal(restored.credits,-480);});
