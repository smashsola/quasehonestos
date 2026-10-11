import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {safeStorage} from '../src/safe-storage.js';
import {startBoot} from '../src/boot.js';
import {skipLines} from '../src/boot-copy.js';
import {fresh,nextCall,load,KEY} from '../src/engine.js';

test('Supervisor estabiliza o DOM em vez de alimentar o próprio MutationObserver',async()=>{
 const pending=[];let notify=()=>{},writes=0;
 const node=initial=>{let value=initial;return {get textContent(){return value;},set textContent(next){value=next;writes++;pending.push(notify);}};};
 const elements={small:node('BILHETE DO CHEFE'),h2:node('Chefia falando.'),'p:not(.scribble)':node('Turno da firma.'),'.scribble':node('A firma é quase séria.')};
 const boss={querySelector:selector=>elements[selector]||null};
 const root={querySelector:selector=>selector==='.boss'?boss:selector==='.shift'?{textContent:'Turno 1 / 3'}:null};
 const source=await readFile(new URL('../src/supervisor-ui.js',import.meta.url),'utf8');
 vm.runInNewContext(source.replace('export function','function'),{document:{querySelector:()=>root},MutationObserver:class{constructor(callback){notify=callback;}observe(){}}});
 for(let i=0;i<30&&pending.length;i++)pending.shift()();
 assert.equal(pending.length,0,'O observer não pode gerar uma fila infinita de microtarefas.');
 assert.equal(elements.h2.textContent,'Supervisor de turno.');
 assert.ok(writes<=4,'A segunda aplicação não deve reescrever o mesmo texto.');
});
test('Todas as cinco frases pulam imediatamente, cancelam a sequência e só concluem uma vez',()=>{
 const saved=new Map(),storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 for(const phrase of skipLines){
  const handlers={},attributes={},jobs=new Map();let n=0,ready=0;
  const button={addEventListener:(event,fn)=>handlers[event]=fn,setAttribute:(key,value)=>attributes[key]=value};
  const status={},app={inert:false},screen={querySelector:s=>s==='button'?button:status,classList:{add:()=>{}},remove:()=>{}};
  startBoot({screen,app,storage,ready:()=>ready++,schedule:(fn,delay)=>{jobs.set(++n,{fn,delay});return n;},cancel:id=>jobs.delete(id)});
  assert.equal(button.textContent,phrase);assert.match(attributes['aria-label'],/^Pular inicialização:/);assert.equal(app.inert,true);
  handlers.click();handlers.click();assert.equal(app.inert,false);assert.equal(ready,1);assert.equal(jobs.size,1);assert.equal([...jobs.values()][0].delay,400);
 }
});
test('Storage negado e quota esgotada usam memória sem interromper o jogo',()=>{
 const denied=safeStorage(()=>{throw new Error('SecurityError');});denied.setItem('draft','oi');assert.equal(denied.getItem('draft'),'oi');assert.equal(denied.temporary,true);
 const previous=new Map([[KEY,JSON.stringify({...fresh(),credits:80})]]);
 const full=safeStorage(()=>({getItem:k=>previous.get(k)??null,setItem:()=>{throw new Error('QuotaExceededError');}}));
 const state=load(full);assert.equal(state.credits,80);state.credits=90;full.setItem(KEY,JSON.stringify(state));assert.equal(load(full).credits,90);assert.equal(JSON.parse(previous.get(KEY)).credits,80);
});
test('Salvamento ilegível fica intacto quando a sessão temporária começa',()=>{
 let original='{quebrado';const store=safeStorage(()=>({getItem:()=>original,setItem:(_k,v)=>original=v}));
 const state=load(store);nextCall(state);store.setItem(KEY,JSON.stringify(state));assert.equal(original,'{quebrado');assert.equal(store.temporary,true);assert.equal(load(store).active.caller,'nino');
});
test('Retomada conserva saldo, histórico e conversa sem exigir arrays ausentes em saves antigos',()=>{
 const state=fresh();nextCall(state);state.credits=100;delete state.active.used;state.active.log=[{speaker:'Você',text:'Olá'},null];
 const restored=load({getItem:()=>JSON.stringify(state)});assert.equal(restored.credits,100);assert.deepEqual(restored.active.used,[]);assert.equal(restored.active.log.length,1);
});
