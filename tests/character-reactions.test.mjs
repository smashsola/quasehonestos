import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applyReplyEmotion,savedExpression,expressions,reactionFor} from '../src/mood.js';
import {polishReply} from '../src/ai-dialogue.js';
import {callers} from '../src/data.js';
test('Todos os personagens têm retratos para cada emoção disponível',async()=>{
 for(const caller of callers)for(const emotion of expressions){const svg=await readFile(new URL('../src/portraits/'+caller.id+'-'+emotion+'.svg',import.meta.url),'utf8');assert.match(svg,/<svg.*viewBox="0 0 96 96"/);assert.match(svg,/<\/svg>/);}
});
test('Emoção da resposta preserva limites e não altera confiança ou itens',async()=>{
 const reply={speaker:'Nino',text:'Fala local'},a={caller:'nino',scheme:'prize',stage:'question',trust:1,log:[{speaker:'Você',text:'batata malhada kkk'},reply]};
 assert.equal(await polishReply(a,reply,async()=>Response.json({text:'Minha batata nunca pula o dia de perna!',emotion:'amused'})),true);
 assert.equal(savedExpression(a),'amused');assert.equal(a.trust,1);assert.equal(a.item,undefined);assert.equal(a.stage,'question');
 a.irritation=2;assert.equal(applyReplyEmotion(a,'happy'),false);assert.equal(savedExpression(a),'angry');
 a.irritation=0;a.suspicion=1;a.lastIntent='contradiction';assert.equal(applyReplyEmotion(a,'amused'),false);assert.equal(savedExpression(a),'suspicious');
 a.outcome='fooled';assert.equal(applyReplyEmotion(a,'happy'),false);assert.equal(savedExpression(a),'suspicious');assert.equal(applyReplyEmotion(a,'invented'),false);
});
test('Reserva local diferencia confusão e brincadeira de agressão',()=>{
 assert.equal(reactionFor({},'unclear','abc'),'confused');assert.equal(reactionFor({},'smalltalk','batata malhada kkk'),'amused');assert.equal(reactionFor({irritation:2},'smalltalk','kkk'),'angry');
});
