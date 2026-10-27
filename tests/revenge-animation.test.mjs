import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revengeAnimation} from '../src/revenge-animation.js';
import {revengeScenes} from '../src/revenge.js';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const expected={whatsapp:'rv-chat', 'bank-call':'rv-support','fake-pix':'rv-bakery',boleto:'rv-billing',delivery:'rv-delivery',ransomware:'rv-license','fake-motoboy':'rv-collection','fake-store':'rv-store','fake-government':'rv-government','card-swap':'rv-warranty'};
for(const [id,kind] of Object.entries(expected))test(`A vingança ${id} demonstra três mudanças na própria aplicação`,()=>{
 const frames=[0,1,2,3,4].map(step=>revengeAnimation(id,step,revengeScenes[id],escape));
 assert.equal(new Set(frames).size,5);
 frames.forEach((html,step)=>{
  assert.ok(html.includes(`data-revenge-case="${id}" data-revenge-stage="${step}"`));
  assert.ok(html.includes(`rv-workspace ${kind}`));
  assert.equal((html.match(/class="rv-control"/g)||[]).length,1);
  assert.ok(html.includes(escape(revengeScenes[id].steps[step][2])));
  assert.doesNotMatch(html,/revenge-scene-object|revenge-sim-control|data-revenge-scene/);
 });
});
test('O movimento instrutivo sobrevive à regra global de reduzir movimento',()=>{
 const css=readFileSync(new URL('../src/conversation-ui.css',import.meta.url),'utf8');
 for(const [selector,animation] of [['.rv-control','rvPress'],['.rv-control .rv-cursor','rvCursor'],['.rv-paper','rvPaperFeed'],['.rv-stamp','rvStamp'],['.rv-store-shutter','rvShutter']]){
  const rule=css.slice(css.indexOf(selector+'{')).split('}')[0];
  assert.ok(rule.includes(`animation:${animation} var(--rv-duration)`),selector);
  assert.match(rule,/animation:[^;]+!important/,selector);
 }
 assert.doesNotMatch(css,/\.rv-app \*\{animation-duration:\.01ms/);
});
test('All thirty stages reserve and stagger their props, control and result',()=>{
 for(const [id,scene] of Object.entries(revengeScenes))for(let step=0;step<5;step++){
  const html=revengeAnimation(id,step,scene,escape),delays=[...html.matchAll(/data-rv-enter="(\d+)"/g)].map(m=>+m[1]);
  assert.ok(delays.includes(100),`${id}/${step}: prop entrance`);
  assert.ok(delays.includes(650),`${id}/${step}: control entrance`);
  assert.ok(delays.includes(1700),`${id}/${step}: result entrance`);
  assert.doesNotMatch(html,/display:none|\shidden=/);
 }
});

