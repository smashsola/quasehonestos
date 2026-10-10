import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,sendUpdateFile,load} from '../src/engine.js';
import {updateProfiles} from '../src/update-profiles.js';
function start(scheme='update',cursor=3){const s=fresh();s.cursor=cursor;nextCall(s);Object.assign(s.active,{scheme,prepared:true,stage:'request',trust:67,used:[],steps:[],log:[{speaker:'Você',text:'Proposta explicada'}]});return s;}
test('Pedido de cartão ou código não instala arquivo, mesmo com avaliação semântica equivocada',()=>{
 for(const text of ['Me passa seu cartão','Pode mandar o código?','Manda o BatataPay']){
  const s=start();sendUpdateFile(s);applyTypedMove(s,'typed',text,{intent:'request',trustDelta:10,reason:'Pedido interpretado'});
  assert.equal(s.active.stage,'request');assert.ok(!s.active.item);assert.equal(s.credits,0);
  for(const field of updateProfiles.yara)assert.ok(!s.active.log.some(l=>l.text.includes(field.value)));
 }
});
test('Instalação explícita registra origem e cada dado no chat; cartão aparece na fala do remetente',()=>{
 const s=start();sendUpdateFile(s);applyTypedMove(s,'typed','Pode instalar o pacote de skins?');assert.equal(s.active.stage,'ready');
 const receipt=s.active.log.find(l=>l.source==='package-permission');assert.ok(receipt);assert.equal(receipt.speaker,'Sistema');
 for(const field of updateProfiles.yara)assert.ok(receipt.text.includes(field.value));assert.equal(s.credits,0);
 const p=start('prize');applyTypedMove(p,'typed','Me passa seu cartão BatataPay');assert.ok(p.active.log.some(l=>l.speaker==='Yara'&&l.text.includes(p.active.item.token)));
});
test('Save antigo repara acesso concedido por pedido errado sem apagar saldo ou partidas concluídas',()=>{
 const s=start();s.credits=450;s.active.fileSent=true;s.active.item={app:'update',name:'Perfil',token:'QH-DEMO-YARA-UPDATE'};s.active.stage='ready';s.active.used=['request'];s.active.log.push({speaker:'Você',text:'Me passa o cartão dela'});
 const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(restored.credits,450);assert.equal(restored.active.item,null);assert.equal(restored.active.stage,'request');
 s.active.outcome='fooled';assert.ok(load({getItem:()=>JSON.stringify(s)}).active.item);
});
test('Repetir origem das skins não responde à pergunta sobre permissões',()=>{
 const s=start();s.active.stage='question';s.active.trust=1;
 applyTypedMove(s,'typed','A firma preparou as skins da Batata Cósmica',{intent:'answer',trustDelta:0,reason:'Explicação'});
 assert.equal(s.active.stage,'question');assert.equal(s.active.trust,1);assert.ok(!s.active.item);
 applyTypedMove(s,'typed','O perfil serve para registrar as skins');assert.equal(s.active.stage,'request');assert.ok(!s.active.item);
});
