import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,executeScheme} from '../src/engine.js';
import {callers} from '../src/data.js';
import {characterReply,verificationReply} from '../src/personality.js';
import {remoteProfiles} from '../src/remote-profiles.js';
function start(){const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'support',prepared:true,stage:'pitch',trust:67,trustScale:100,log:[{speaker:'Nino',text:'Oi'}]});return s;}
test('Insistir na pressa continua tendo consequência e pode revogar um item recebido',()=>{
 const s=start();Object.assign(s.active,{stage:'ready',item:{app:'support',token:'QH-DEMO'},used:['pressure']});
 const before=s.active.trust;applyTypedMove(s,'typed','Preciso disso agora');assert.equal(s.active.suspicion,1);assert.ok(s.active.trust<before&&s.active.trust>0);assert.equal(s.active.stage,'ready');
 applyTypedMove(s,'typed','É urgente');assert.equal(s.active.outcome,'blocked');assert.equal(s.active.item,null);assert.equal(executeScheme(s,'support'),false);assert.equal(s.credits,0);
});
test('Dar tempo para conferir depois do item interrompe a operação pendente',()=>{
 const s=start();Object.assign(s.active,{stage:'ready',item:{app:'support',token:'QH-DEMO'}});
 applyTypedMove(s,'typed','Pode verificar no suporte que você conhece');assert.equal(s.active.outcome,'blocked');assert.equal(s.active.item,null);assert.equal(executeScheme(s,'support'),false);
 assert.match(s.active.log.at(-1).text,/suporte/);assert.doesNotMatch(s.active.log.at(-1).text,/prêmio/);
});
test('Perguntar a origem na etapa do item não libera dados ou muda confiança',()=>{
 const s=start();s.active.stage='request';applyTypedMove(s,'typed','Quem organizou o suporte?');assert.equal(s.active.stage,'request');assert.equal(s.active.trust,67);assert.equal(s.active.item,undefined);assert.match(s.active.audit[0].reason,/Perguntar/);
});
test('Cada personagem tem voz e arquivos próprios em todas as propostas',()=>{
 for(const event of ['answer','hostile','pressure','unclear','received'])assert.equal(new Set(callers.map(c=>characterReply(c.id,event))).size,callers.length);
 for(const c of callers){const profile=remoteProfiles[c.id];assert.equal(profile.photos.length,3);assert.ok(profile.files.every(([title,body])=>title&&body));assert.ok(profile.mail.every(([title,body])=>title&&body));
  for(const scheme of ['prize','support','club'])assert.match(verificationReply(c.id,scheme),/confirmar/);
 }
});
