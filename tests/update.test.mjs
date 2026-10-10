import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,sendUpdateFile,reviewUpdateData,executeScheme,finishCall,load,chooseSkin} from '../src/engine.js';
import {updateProfiles} from '../src/update-profiles.js';
import {updateContent} from '../src/app-content.js';
function start(cursor=0){const s=fresh();s.cursor=cursor;nextCall(s);Object.assign(s.active,{scheme:'update',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Editor de fotos'}]});return s;}
function explain(s){applyTypedMove(s,'typed','Oi');applyTypedMove(s,'typed','Tenho um pacote de skins da Batata Cósmica');applyTypedMove(s,'typed','O pacote pede perfil e contato para registrar as skins');}
test('Anexo exige explicação e envio; enviar sozinho não expõe dados',()=>{
 const s=start();assert.equal(sendUpdateFile(s),false);explain(s);
 applyTypedMove(s,'typed','Pode instalar o Skins Cósmicas?');assert.equal(s.active.item,undefined);assert.equal(s.active.stage,'request');
 assert.equal(sendUpdateFile(s),true);assert.equal(sendUpdateFile(s),false);assert.equal(s.active.log.at(-1).attachment,'CosmicChanger.qh');assert.equal(s.active.item,undefined);
 assert.equal(reviewUpdateData(s,'contact'),false);assert.equal(executeScheme(s,'update'),false);
 applyTypedMove(s,'typed','Pode instalar o Skins Cósmicas?');assert.equal(s.active.stage,'ready');assert.equal(s.active.item.app,'update');assert.equal(s.credits,0);
});
test('Todos os perfis só pagam após revisão; salvamento impede crédito duplicado',()=>{
 for(let cursor=0;cursor<6;cursor++){const s=start(cursor);explain(s);sendUpdateFile(s);applyTypedMove(s,'typed','Pode abrir o arquivo?');
 if(s.active.stage==='question'){assert.ok(!s.active.item);applyTypedMove(s,'typed','A firma preparou o pacote de skins.');applyTypedMove(s,'typed','Pode abrir o arquivo?');}
 assert.equal(executeScheme(s,'update'),false);assert.equal(reviewUpdateData(s,'unknown'),false);
 for(const field of updateProfiles[s.active.caller]){assert.equal(reviewUpdateData(s,field.id),true);assert.equal(reviewUpdateData(s,field.id),false);}
 const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(executeScheme(restored,'wallet'),false);assert.equal(executeScheme(restored,'update'),true);assert.equal(restored.credits,350);
 assert.equal(executeScheme(load({getItem:()=>JSON.stringify(restored)}),'update'),false);finishCall(restored);assert.ok(restored.history.at(-1).steps.includes('Dado exposto: Contato cadastrado'));
 }
});
test('Conferir o pacote de skins revoga acesso e mantém dados protegidos',()=>{
 const s=start();explain(s);sendUpdateFile(s);applyTypedMove(s,'typed','Pode instalar o Skins Cósmicas?');
 applyTypedMove(s,'typed','Pode conferir na loja do aplicativo');assert.equal(s.active.outcome,'blocked');assert.equal(s.active.item,null);assert.match(s.active.log.at(-1).text,/loja/);
 assert.equal(reviewUpdateData(s,'contact'),false);assert.equal(executeScheme(s,'update'),false);assert.equal(s.credits,0);
});
test('Painel não revela os dados antes da abertura do anexo',()=>{
 const s=start();explain(s);sendUpdateFile(s);const before=updateContent(s,String);assert.ok(!before.includes(updateProfiles.nino[1].value));
 applyTypedMove(s,'typed','Pode instalar o Skins Cósmicas?');assert.ok(updateContent(s,String).includes(updateProfiles.nino[1].value));
});

test('Skin escolhida persiste no pacote e não muda depois do envio',()=>{
 const s=start();assert.equal(chooseSkin(s,'unknown'),false);assert.equal(chooseSkin(s,'solar'),true);
 const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(restored.active.skin,'solar');
 explain(restored);assert.equal(sendUpdateFile(restored),true);assert.match(restored.active.log.at(-1).text,/Ouro Solar/);
 assert.equal(chooseSkin(restored,'ghost'),false);assert.equal(restored.active.skin,'solar');
 assert.ok(restored.active.steps.includes('Skin prometida: Ouro Solar'));
});
