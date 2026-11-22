import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revengeAnimation} from '../src/revenge-animation.js';
import {revengeCases,revengeScenes} from '../src/revenge.js';
import {expandedScams} from '../src/expanded-scams.js';
import {expandedRevenge} from '../src/expanded-revenge.js';
import {defensePeople,defenseCases} from '../src/defense-round.js';
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
test('All twenty additional revenge scenes stay focused on the action and leave dialogue for the ending',()=>{
 for(const scam of expandedScams){
  const scene=revengeScenes[scam.id];
  const villain=revengeAnimation(scam.id,2,scene,escape);
  const reply=revengeAnimation(scam.id,4,scene,escape);
  assert.ok(!villain.includes(escape(scam.villain)),`${scam.id}: no repeated villain line`);
  assert.ok(!reply.includes(escape(scam.reply)),`${scam.id}: no repeated firm reply`);
  assert.ok(reply.includes(escape(scene.steps[4][2])),`${scam.id}: closing note`);
 }
});
test('As 30 situações e vinganças têm ligação e identidade próprias',()=>{
 const titles=[],plans=[],villains=[],replies=[],props=[];
 for(const person of defensePeople){
  const situation=defenseCases[person.caseId],script=revengeCases[person.caseId],scene=revengeScenes[person.caseId];
  assert.ok(situation?.message,`${person.caseId}: situação comum`);assert.ok(script?.questions?.length===3,`${person.caseId}: perguntas`);
  assert.ok(scene?.steps?.length===5,`${person.caseId}: sequência visual`);assert.ok(scene.prop,`${person.caseId}: objeto da cena`);
  assert.equal(new Set(scene.steps.map(step=>step[0])).size,5,`${person.caseId}: etapas distintas`);
  titles.push(script.title);plans.push(script.plan);villains.push(script.villain);replies.push(script.reply);props.push(scene.prop);
 }
 for(const collection of [titles,plans,villains,replies,props])assert.equal(new Set(collection).size,30);
 for(const scam of expandedScams){assert.equal(revengeScenes[scam.id].prop,expandedRevenge[scam.id].prop,`${scam.id}: objeto correto`);assert.equal(revengeCases[scam.id].title,scam.revengeTitle,`${scam.id}: título correto`);}
 assert.match(revengeCases['marketplace-sale'].title,/venda/i);assert.doesNotMatch(revengeCases['marketplace-sale'].title,/frete/i);
});
test('A vingança de WhatsApp guarda um rascunho, envia a resposta uma vez e não a reanima nas etapas seguintes',()=>{
 const scene=revengeScenes.whatsapp,frames=Array.from({length:5},(_,step)=>revengeAnimation('whatsapp',step,scene,escape));
 assert.deepEqual(scene.steps.map(step=>step[0]),['Revisar o pedido','Preparar a resposta','Enviar uma vez','Aguardar a reação','Carimbar o recibo']);
 assert.equal(scene.outgoing,revengeCases.whatsapp.reply);
 assert.equal((frames[0].match(/class="rv-chat-bubble rv-outgoing"/g)||[]).length,0);
 assert.equal((frames[1].match(/class="rv-chat-bubble rv-outgoing"/g)||[]).length,0);assert.match(frames[1],/RASCUNHO · AINDA NÃO ENVIADO/);
 for(const step of [2,3,4])assert.equal((frames[step].match(/class="rv-chat-bubble rv-outgoing"/g)||[]).length,1,`etapa ${step}: resposta aparece uma vez`);
 assert.match(frames[2],/data-rv-enter="\d+"[^>]*><small>EU/);
 for(const step of [3,4])assert.match(frames[step],/rv-chat-bubble rv-outgoing"[^>]*>/);
 assert.doesNotMatch(frames[3].match(/<div class="rv-chat-bubble rv-outgoing"[^>]*>/)?.[0]||'',/data-rv-enter/);
 assert.match(frames[3],/Mensagem visualizada · digitando uma resposta/);assert.match(frames[4],/Taxa da taxa recebida/);
});

