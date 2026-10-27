import test from 'node:test';
import assert from 'node:assert/strict';
import {createMoneyTween} from '../src/money-feedback.js';
test('O contador percorre ganhos, perdas e saldos negativos sem mudar o destino',()=>{
 for(const [before,after] of [[0,180],[200,119],[0,-480],[-480,-300],[-10,20],[20,-10]]){
  const clock=createMoneyTween(before),start=clock.retarget(after,1000);assert.equal(start.value,before);assert.equal(start.delta,after-before);
  const samples=[0,.1,.3,.6,.9,1].map(f=>clock.sample(1000+start.duration*f).value);
  for(let i=1;i<samples.length;i++)assert.ok(after>before?samples[i]>=samples[i-1]:samples[i]<=samples[i-1]);
  assert.equal(samples.at(-1),after);assert.equal(clock.sample(9000).value,after);assert.equal(clock.retarget(after,9000),null);
 }
});
test('Atualizar a tela não reinicia o contador; outra compra parte do valor visível',()=>{
 const clock=createMoneyTween(200);clock.retarget(380,1000);const middle=clock.sample(1400).value;
 assert.equal(clock.retarget(380,1400),null);assert.equal(clock.sample(1400).value,middle);
 const next=clock.retarget(300,1400);assert.equal(next.from,middle);assert.equal(next.delta,-80);assert.equal(clock.sample(9000).value,300);
 clock.reset(-20);assert.equal(clock.sample(9000).value,-20);assert.equal(clock.retarget(-20,9000),null);
});

test('O resultado financeiro usa o próprio bloco, sem criar um segundo aviso',async()=>{
 const {installMoneyFeedback}=await import('../src/money-feedback.js');
 const previous={document:globalThis.document,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};let frame,scrolls=0;const events=[],classes=new Set();
 const native={isConnected:true,classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},scrollIntoView(){scrolls++;}};
 const balance={textContent:'C$ 0',animate(){}},amount={dataset:{moneyDelta:'-81'},textContent:'− C$ 81'};
 try{
  globalThis.document={querySelector:s=>s==='.defense-reaction .defense-loss'?native:null,querySelectorAll:s=>s==='[data-balance-value]'?[balance]:s==='[data-money-delta]'?[amount]:[],dispatchEvent:e=>events.push(e.type),createElement(){throw Error('Não deve criar outro aviso quando já existe o resultado.');}};
  globalThis.requestAnimationFrame=callback=>{frame=callback;return 1;};globalThis.cancelAnimationFrame=()=>{};globalThis.setTimeout=()=>1;globalThis.clearTimeout=()=>{};
  const effect=installMoneyFeedback(0);effect.sync(-81);assert.equal(scrolls,0);assert.ok(classes.has('is-money-counting'));frame(performance.now()+2500);
  assert.equal(amount.textContent,'− C$ 81');assert.equal(balance.textContent,'C$ -81');assert.equal(classes.has('is-money-counting'),false);assert.equal(events.filter(x=>x==='qh-money-start').length,1);assert.equal(events.filter(x=>x==='qh-money-finish').length,1);
  effect.sync(-81);assert.equal(scrolls,0);assert.equal(events.filter(x=>x==='qh-money-start').length,1);
 }finally{Object.assign(globalThis,previous);}
});
test('O erro só treme a janela e dispara o som, sem desenhar um corte',async()=>{
 const {revengeMissFeedback}=await import('../src/money-feedback.js');const previous={document:globalThis.document,matchMedia:globalThis.matchMedia};let motion,signal;
 try{globalThis.matchMedia=()=>({matches:false});globalThis.document={querySelector:()=>({animate:(frames,options)=>{motion={frames,options};}}),createElement(){throw Error('Nenhum corte visual deve ser criado.');},dispatchEvent:e=>{signal=e.type;}};revengeMissFeedback();assert.equal(motion.options.duration,320);assert.deepEqual(motion.frames[0],motion.frames.at(-1));assert.equal(signal,'qh-revenge-miss');}finally{Object.assign(globalThis,previous);}
});
test('The final count waits for the reserved receipt to appear',()=>{const clock=createMoneyTween(200),run=clock.retarget(380,1000,650);assert.equal(clock.sample(1500).value,200);assert.equal(clock.sample(1650).value,200);assert.ok(clock.sample(1850).value>200);assert.equal(clock.sample(1650+run.duration).value,380);});
