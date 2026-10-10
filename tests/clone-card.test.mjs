import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,executeScheme,load,closeCall} from '../src/engine.js';
import {sendCloneLink,reviewClonedCard,clonedFields,cloneContent} from '../src/clone-card.js';
import {callers} from '../src/data.js';
import {resultImpact} from '../src/result-impact.js';

function start(index=0){const s=fresh();s.cursor=index;nextCall(s);Object.assign(s.active,{scheme:'link',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Tenho uma oferta de resgate.'}]});return s;}
function explain(s){applyTypedMove(s,'typed','Oi');applyTypedMove(s,'typed','Seus pontos renderam um vale-lanche no BatataPay.');applyTypedMove(s,'typed','O cadastro pede titular e cartão para registrar o resgate de pontos.');assert.equal(s.active.stage,'request');}
test('Link enviado, abertura e envio do formulário são eventos diferentes para todos os personagens',()=>{
 for(let i=0;i<callers.length;i++){
  const s=start(i);assert.equal(sendCloneLink(s),false);explain(s);
  applyTypedMove(s,'typed','Pode abrir a página de resgate?');assert.equal(s.active.linkOpened,undefined);assert.equal(s.active.item,undefined);
  assert.equal(sendCloneLink(s),true);assert.equal(sendCloneLink(s),false);assert.deepEqual(clonedFields(s.active),[]);
  applyTypedMove(s,'typed','Pode abrir a página de resgate?');
  if(s.active.stage==='question'){assert.equal(s.active.linkOpened,undefined);applyTypedMove(s,'typed','A equipe do programa BatataPay organizou o resgate.');applyTypedMove(s,'typed','Pode abrir a página de resgate?');}
  assert.equal(s.active.linkOpened,true);assert.equal(s.active.item,undefined);
  applyTypedMove(s,'typed','Abre a página de resgate de novo');assert.equal(s.active.item,undefined);
  applyTypedMove(s,'typed','Pode me passar o cartão?');assert.equal(s.active.item,undefined);
  applyTypedMove(s,'typed','Pode preencher e enviar o cadastro de resgate?');assert.equal(s.active.linkSubmitted,true);assert.equal(s.active.stage,'ready');assert.equal(s.credits,0);
  const fields=clonedFields(s.active);assert.equal(fields.length,3);const receipt=s.active.log.find(l=>l.source==='link-form');for(const f of fields)assert.ok(receipt.text.includes(f.value));
  assert.equal(executeScheme(s,'link'),false);assert.equal(reviewClonedCard(s),true);
  const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(executeScheme(restored,'link'),true);assert.equal(restored.credits,450);assert.equal(executeScheme(restored,'link'),false);assert.equal(restored.active.walletTransfer.amount,450);assert.match(resultImpact(restored.active).summary,/cadastro.*450/);
 }
});
test('Conferir por outro canal bloqueia e fechar após cadastro mantém a consequência sem pagar',()=>{
 const safe=start();explain(safe);sendCloneLink(safe);applyTypedMove(safe,'typed','Pode conferir no aplicativo que você já conhece');assert.equal(safe.active.outcome,'blocked');assert.equal(safe.active.item,null);assert.equal(reviewClonedCard(safe),false);
 const s=start();explain(s);sendCloneLink(s);applyTypedMove(s,'typed','Abra a página de resgate');applyTypedMove(s,'typed','Preencha o cadastro de resgate');closeCall(s);assert.equal(executeScheme(s,'link'),false);assert.equal(s.credits,0);assert.equal(resultImpact(s.active).exposed,true);
});
test('Página é cenográfica: não navega, não coleta entradas e não revela cartão antes do envio',()=>{
 const s=start();explain(s);sendCloneLink(s);s.active.linkOpened=true;
 const html=cloneContent(s,String);assert.doesNotMatch(html,/<input|<form|href=|action=/);assert.doesNotMatch(html,/QH-DEMO-/);assert.match(html,/Cadastro ainda vazio/);
 applyTypedMove(s,'typed','Preencha o cadastro de resgate');assert.match(cloneContent(s,String),/QH-DEMO-NINO-LINK/);assert.doesNotMatch(cloneContent(s,String,true),/QH-DEMO-NINO-LINK/);
});
