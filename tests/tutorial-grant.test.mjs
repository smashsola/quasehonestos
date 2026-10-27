import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,load} from '../src/engine.js';
import {settleTutorialGrant,tutorialGrantLine} from '../src/tutorial.js';
import {startDefenseCall} from '../src/defense-round.js';
import {mailMoney} from '../src/mail-view.js';
import {createMoneyTween} from '../src/money-feedback.js';

test('Lia paga C$ 100 uma vez ao concluir o tutorial, inclusive após salvar e carregar',()=>{
 const state={...fresh(),mode:'defense',tutorial:'defense',active:startDefenseCall(0,'child')};
 assert.equal(settleTutorialGrant(state),false);
 state.active.outcome='blocked';assert.equal(settleTutorialGrant(state),true);assert.equal(state.credits,100);
 assert.equal(settleTutorialGrant(state),false);
 const restored=load({getItem:()=>JSON.stringify(state)});assert.equal(settleTutorialGrant(restored),false);assert.equal(restored.credits,100);
 assert.match(tutorialGrantLine,/RH|pato/);
});
test('Pular tutorial ou já estar em outro caso não gera bônus; bônus não apaga prejuízo',()=>{
 for(const override of [{tutorial:'skipped'},{tutorial:'completed'},{cursor:1},{active:{outcome:'fooled',gameOver:true}}]){
  const state={...fresh(),mode:'defense',tutorial:'defense',active:{outcome:'blocked'},...override};assert.equal(settleTutorialGrant(state),false);
 }
 const state={...fresh(),mode:'defense',tutorial:'defense',active:{outcome:'fooled'},credits:-480};settleTutorialGrant(state);assert.equal(state.credits,-380);
});
test('Ganho pequeno do Correio começa em zero e percorre valores intermediários',()=>{
 const clock=createMoneyTween(0),run=clock.retarget(20,1000,350);assert.equal(clock.sample(1300).count,0);
 assert.equal(clock.sample(1350+run.duration*.5).count,10);assert.equal(clock.sample(1350+run.duration).count,20);
 assert.match(mailMoney({penalty:0,reward:20,after:20},true),/data-money-delta="20"/);
 assert.doesNotMatch(mailMoney({penalty:0,reward:20,after:20}),/data-money-delta/);
});
