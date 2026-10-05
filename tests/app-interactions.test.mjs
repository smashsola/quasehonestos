import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,executeScheme,load,disconnectSession} from '../src/engine.js';
import {chooseOffer,selectedOffer,verifyOperationCode,runRemoteDiagnostic,operationReady} from '../src/app-interactions.js';
function start(scheme,app){const s=fresh();nextCall(s);Object.assign(s.active,{scheme,stage:'ready',prepared:true,used:[],steps:[],log:[],item:{app,token:'QH-DEMO-NINO-'+scheme.toUpperCase()}});return s;}
test('Oferta só muda antes de preparar e persiste na partida',()=>{
 const s=fresh();nextCall(s);s.active.scheme='club';assert.equal(chooseOffer(s,'council'),true);assert.equal(selectedOffer(load({getItem:()=>JSON.stringify(s)}).active).name,'Conselho dos talheres');
 s.active.prepared=true;assert.equal(chooseOffer(s,'soup'),false);assert.equal(chooseOffer(s,'unknown'),false);assert.equal(s.credits,0);
});
test('Cartão e passe exigem conferência correta, sem crédito antecipado',()=>{
 for(const [scheme,app] of [['prize','wallet'],['club','club']]){const s=start(scheme,app);assert.equal(executeScheme(s,app),false);assert.equal(verifyOperationCode(s,app,'123456789'),false);assert.equal(verifyOperationCode(s,'wrong',s.active.item.token),false);assert.equal(verifyOperationCode(s,app,s.active.item.token.toLowerCase()),true);assert.equal(s.credits,0);assert.equal(verifyOperationCode(s,app,s.active.item.token),true);assert.equal(s.active.steps.length,1);
 const restored=load({getItem:()=>JSON.stringify(s)});assert.equal(operationReady(restored.active,app),true);assert.equal(executeScheme(restored,app),true);const credits=restored.credits;assert.equal(executeScheme(restored,app),false);assert.equal(restored.credits,credits);}
});
test('Diagnóstico só existe com sessão autorizada; desconectar impede pagamento',()=>{
 const s=start('support','support');s.active.item=null;assert.equal(runRemoteDiagnostic(s),false);s.active.item={app:'support',token:'QH-DEMO-NINO-SUPPORT'};assert.equal(executeScheme(s,'support'),false);assert.equal(runRemoteDiagnostic(s),true);assert.equal(runRemoteDiagnostic(s),false);assert.equal(s.credits,0);assert.match(s.active.diagnostic.checks.at(-1),/Nenhuma falha comprovada/);assert.equal(disconnectSession(s),true);assert.equal(executeScheme(s,'support'),false);
});
