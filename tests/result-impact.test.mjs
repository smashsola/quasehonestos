import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,closeCall,finishCall,executeScheme,disconnectSession,sendUpdateFile} from '../src/engine.js';
import {prepareOperation} from './prepare-operation.mjs';
import {resultImpact,consequenceCard,resultReport} from '../src/result-impact.js';

function start(scheme){const s=fresh();nextCall(s);Object.assign(s.active,{scheme,prepared:true,stage:'pitch',log:[{speaker:'Nino',text:'Oi'}]});return s;}
function obtain(s){
 const lines={prize:['Prêmio da Batata','A firma organizou o concurso de batatas','Pode compartilhar seu cartão fictício?'],support:['Tenho suporte para seu PãoOS','A assistência da firma organizou o serviço de PãoOS','Pode abrir a sessão de PãoOS?'],club:['Tenho um convite do Clube da Colher','O clube organizou a associação de talheres','Pode compartilhar seu passe?'],update:['Trouxe skins da Batata Cósmica','A firma preparou as skins da Batata Cósmica','Pode instalar o pacote de skins?']}[s.active.scheme];
 applyTypedMove(s,'typed',lines[0]);applyTypedMove(s,'typed',lines[1]);if(s.active.scheme==='update')sendUpdateFile(s);applyTypedMove(s,'typed',lines[2]);assert.ok(s.active.item);
}

test('O resultado diferencia encerramento por irritação de verificação independente',()=>{
 const angry=start('prize');applyTypedMove(angry,'typed','te odeio');applyTypedMove(angry,'typed','cala a boca');
 assert.equal(angry.active.outcome,'blocked');assert.equal(resultImpact(angry.active).verified,false);assert.match(resultImpact(angry.active).summary,/não mostra uma verificação/);
 const checked=start('prize');applyTypedMove(checked,'typed','Pode conferir com calma');
 assert.equal(checked.active.outcome,'blocked');assert.equal(resultImpact(checked.active).verified,true);
 finishCall(checked);assert.equal(resultImpact(checked.history[0]).verified,true);
});

test('Encerrar sem pagamento não apaga cartão, passe, sessão ou perfil compartilhados',()=>{
 for(const scheme of ['prize','support','club','update']){
  const s=start(scheme);obtain(s);if(scheme==='support')disconnectSession(s);else closeCall(s);
  const before=JSON.stringify(s);const r=resultImpact(s.active);assert.equal(r.exposed,true);assert.equal(r.received,0);assert.ok(r.recovery);assert.match(r.title,/houve exposição/);assert.equal(JSON.stringify(s),before);
  finishCall(s);assert.equal(resultImpact(s.history[0]).exposed,true);assert.equal(resultImpact(s.history[0]).summary,r.summary);
 }
 const unopened=start('update');closeCall(unopened);assert.equal(resultImpact(unopened.active).exposed,false);assert.equal(resultImpact(unopened.active).recovery,null);
});

test('O recibo explica a perda e preserva o valor real após salvar no histórico',()=>{
 for(const [scheme,amount] of [['prize',300],['support',400],['club',250]]){
  const s=start(scheme);obtain(s);prepareOperation(s);executeScheme(s,s.active.item.app);finishCall(s);
  const r=resultImpact(s.history[0]);assert.equal(r.received,amount);assert.match(r.summary,new RegExp('C\\$ '+amount));
  assert.match(resultReport(s.history[0]),/Proteção:/);assert.match(resultReport(s.history[0]),/fictícios/);
 }
});

test('A explicação abre e fecha, escapa falas e não inventa uma fala ausente',()=>{
 const a={caller:'nino',scheme:'prize',outcome:'closed',audit:[{text:'<img src=x onerror=alert(1)>',signal:'Oferta inesperada.',reason:'Texto & teste'}]};
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const html=consequenceCard(a,esc);assert.match(html,/<details/);assert.doesNotMatch(html,/<details[^>]*\bopen\b/);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/&lt;img/);assert.match(html,/cartilha.cert.br/);
 assert.equal(resultImpact({...a,audit:[]}).evidence,null);assert.equal(consequenceCard({caller:'nino'},esc),'');assert.equal(resultReport({caller:'unknown',outcome:'closed'}),'');
});
