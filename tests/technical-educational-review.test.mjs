import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,closeCall,finishCall,load} from '../src/engine.js';
import {statedFacts} from '../src/conversation-memory.js';
import {conversationContext} from '../src/conversation-context.js';
import {inspectFollowup,respondFollowup,followupPanel,setFollowupRelation} from '../src/story-continuity.js';
import {learningReport} from '../src/classroom-session.js';
const start=()=>{const s=fresh();s.cursor=1;nextCall(s);Object.assign(s.active,{scheme:'club',prepared:true,stage:'pitch',trust:30,log:[]});return s;};
test('A pergunta de Olga não vira recusa, botão ou encerramento no resumo',()=>{
 const s=start();applyTypedMove(s,'typed','Não sei quem organiza. Não quero inventar: pode ser um convite falso. O que você faria para verificar sem depender de mim?');
 assert.equal(s.active.lastIntent,'question');assert.equal(s.active.outcome,null);assert.equal(s.active.ending,undefined);assert.equal(s.active.trust,30);assert.equal(s.credits,0);
 closeCall(s);assert.deepEqual(s.active.ending,{actor:'player',cause:'button',turn:1});
});
test('Benefício, prazo e pedido fictício são alegações estruturadas, sem comprovação',()=>{
 const s=start();applyTypedMove(s,'typed','O benefício é uma caneca. O prazo é amanhã. Precisamos do cartão.');
 const claims=s.active.facts.claims;assert.equal(claims.benefit,'uma caneca');assert.equal(claims.deadline,'amanha');assert.equal(claims.requestedData,'cartao');
 const context=conversationContext(s.active);assert.equal(context.independentlyVerified,false);assert.equal(context.facts.claims.benefit,'uma caneca');
 const resumed=load({getItem:()=>JSON.stringify(s)});assert.deepEqual(resumed.active.facts.claims,claims);
});
test('Condições novas não contradizem fatos ausentes; alteração explícita de prazo é citada',()=>{
 const s=start();applyTypedMove(s,'typed','O benefício é uma caneca.');applyTypedMove(s,'typed','O prazo é amanhã.');assert.notEqual(s.active.lastIntent,'contradiction');
 applyTypedMove(s,'typed','O prazo é sexta-feira.');assert.equal(s.active.lastIntent,'contradiction');assert.match(s.active.log.at(-1).text,/amanha.*sexta-feira/);assert.equal(s.active.facts.claims.deadline,'amanha');
 applyTypedMove(s,'typed','Corrigindo: o prazo é sexta-feira.');assert.equal(s.active.lastIntent,'correction');assert.equal(s.active.facts.claims.deadline,'sexta-feira');assert.equal(s.active.item,undefined);
});
test('Pergunta, hipótese, negação e relato não viram promessa registrada',()=>{
 for(const text of ['O prazo é amanhã?','O contato disse que o prazo é amanhã','Talvez o benefício seja uma caneca','O benefício não é uma caneca'])assert.deepEqual(statedFacts(text),{},text);
});
test('Pedidos de dados têm escopo por cláusula e não incorporam dados que se pediu para proteger',()=>{
 assert.equal(statedFacts('Precisamos do cartão. Não envie a senha.').requestedData,'cartao');
 assert.equal(statedFacts('Me envie seu perfil. Me passe o código.').requestedData,'codigo, perfil');
 assert.equal(statedFacts('Não me envie seu perfil.').requestedData,undefined);
 assert.equal(statedFacts('Você vai receber uma caneca.').benefit,'uma caneca');
 assert.equal(statedFacts('Válido até amanhã.').deadline,'amanha');
});
test('Continuação usa apenas o item registrado e permite consultar antes de decidir',()=>{
 const s=start();Object.assign(s.active,{outcome:'closed',item:{name:'Passe fictício',token:'QH-DEMO-OLGA-CLUB'}});s.credits=80;finishCall(s);
 const e=s.followups[0];assert.match(followupPanel(s,String),/QH-DEMO-OLGA-CLUB/);assert.equal(inspectFollowup(s,e.id),true);
 const resumed=load({getItem:()=>JSON.stringify(s)});assert.equal(resumed.followups[0].reviewed,true);assert.equal(respondFollowup(resumed,e.id,'verify','new-contact-unconfirmed'),true);
 assert.equal(resumed.followups[0].response.quality,'supported');assert.equal(resumed.credits,80);assert.equal(resumed.cursor,s.cursor);assert.equal(respondFollowup(resumed,e.id,'trust'),false);
});
test('A relação escolhida na continuação retoma sem incluir fala ou personagem na exportação',()=>{
 const s=start();closeCall(s);finishCall(s);const e=s.followups[0];assert.equal(setFollowupRelation(s,e.id,'new-contact-unconfirmed'),true);
 const resumed=load({getItem:()=>JSON.stringify(s)});assert.equal(resumed.followups[0].relation,'new-contact-unconfirmed');assert.match(followupPanel(resumed,String),/new-contact-unconfirmed/);
 inspectFollowup(resumed,e.id);respondFollowup(resumed,e.id,'verify',resumed.followups[0].relation);
 const report=learningReport(resumed);assert.deepEqual(report.followups,[{action:'verify',relation:'new-contact-unconfirmed',quality:'supported'}]);
 assert.doesNotMatch(JSON.stringify(report),/Olga|olga|QH-DEMO|speaker|caller|sourceTurn|body|benefit|deadline|log"/);
});
test('Anotar sem relacionar e citar dados conhecidos não comprovam identidade nem aprendizagem',()=>{
 const s=start();closeCall(s);finishCall(s);const e=s.followups[0];inspectFollowup(s,e.id);respondFollowup(s,e.id,'verify');assert.equal(e.response.quality,'unverified');
 const unsafe=start();closeCall(unsafe);finishCall(unsafe);respondFollowup(unsafe,unsafe.followups[0].id,'trust','identity-confirmed');assert.equal(unsafe.followups[0].response.quality,'review');assert.equal(unsafe.credits,0);
});
