import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,nextCall,applyTypedMove,closeCall,finishCall,load,executeScheme} from '../src/engine.js';
import {verifyOperationCode} from '../src/app-interactions.js';
import {inspectDefense,resolveDefense} from '../src/defense-investigation.js';
import {compactScreen,readingPosition,viewportLayout,mobileNavigation} from '../src/mobile-ui.js';
import {replayComparison} from '../src/replay-comparison.js';
import {registerFollowup,followupPanel} from '../src/story-continuity.js';
import {assessmentForms,beginClassSession,answerClassAssessment,finishClassPlay,learningReport,evaluateAssessment,classroomPanel} from '../src/classroom-session.js';
const start=()=>{const s=fresh();nextCall(s);Object.assign(s.active,{scheme:'prize',prepared:true,stage:'pitch',log:[{speaker:'Você',text:'Olá'}]});return s;};
const answers=form=>assessmentForms[form].map(q=>({action:q.correctAction,evidence:q.correctEvidence}));
test('Celular em retrato e paisagem mantém um app; desktop conserva janelas',()=>{
 for(const width of [360,390,412,768])assert.equal(compactScreen(width,844,true),true);
 assert.equal(compactScreen(844,390,true),true);assert.equal(compactScreen(1280,720,false),false);assert.equal(compactScreen(595,672,false),false);assert.equal(compactScreen(390,844,false),false);assert.equal(compactScreen(768,1024,true),true);
});
test('Leitura antiga preserva posição e conta só mensagens novas; fim acompanha resposta',()=>{
 assert.deepEqual(readingPosition({bottom:false,count:8,unread:1},10),{follow:false,unread:3});
 assert.deepEqual(readingPosition({bottom:false,count:10,unread:3},10),{follow:false,unread:3});
 assert.deepEqual(readingPosition({bottom:true,count:8,unread:2},10),{follow:true,unread:0});
 assert.deepEqual(readingPosition(undefined,2),{follow:true,unread:0});
});
test('Viewport distingue redução por teclado de zoom, sem alterar partida',()=>{
 assert.deepEqual(viewportLayout({width:390,height:844,visualHeight:490,offsetTop:8,focused:true,touch:true}),{height:490,top:8,keyboard:true});
 assert.equal(viewportLayout({width:390,height:844,visualHeight:490,scale:2,focused:true,touch:true}).keyboard,false);
 assert.equal(viewportLayout({width:1280,height:720,visualHeight:400,focused:true,touch:true}).keyboard,false);
 assert.equal(viewportLayout({width:390,height:844,visualHeight:820,focused:true,touch:true}).keyboard,false);
});
test('Alternador expõe aplicativos e mensagens novas com nomes acessíveis',()=>{
 const html=mobileNavigation([['calls','', 'Zape'],['boss','','Correio'],['files','','Fichas']],'files',{expanded:true,pending:true,unread:2});
 assert.match(html,/aria-modal="true"/);assert.match(html,/data-app="files" aria-current="page"/);assert.match(html,/mensagens novas/);assert.match(html,/Correio · mensagem nova/);
 assert.match(html,/<svg class="os-app-grid"/);assert.doesNotMatch(html,/▦/);
});
test('Atividade explica o fluxo da turma e separa confiança do resultado',()=>{
 const html=classroomPanel(fresh(),String);
 assert.match(html,/Antes → jogo → depois/);assert.match(html,/quatro situações antes/);assert.match(html,/ação escolhida/);assert.match(html,/porcentagem de confiança/);assert.match(html,/não entram na avaliação/);
});
test('Hipótese usa a regra protetiva sem apagar exposição nem alterar saldo ou fatos reais',()=>{
 const s=start();applyTypedMove(s,'typed','Tenho um prêmio do concurso');applyTypedMove(s,'typed','A equipe do concurso organizou a premiação');applyTypedMove(s,'typed','Me passa seu cartão');
 assert.ok(s.active.item);verifyOperationCode(s,'wallet',s.active.item.token);executeScheme(s,'wallet');
 const before=JSON.stringify(s),comparison=replayComparison(s.active);assert.match(comparison.hypothesis,/antes de compartilhar/);assert.match(comparison.timing,/não apaga/);assert.equal(JSON.stringify(s),before);
});
test('Continuação vem depois e cita apoio ou reconhecimento observados; não duplica',()=>{
 const s=start();applyTypedMove(s,'typed','Confira no canal oficial');registerFollowup(s,s.active);assert.equal(followupPanel(s,String),'');finishCall(s);assert.equal(s.followups.length,1);assert.match(followupPanel(s,String),/Reconheci o pedido/);
 const exposed=start();Object.assign(exposed.active,{outcome:'closed',item:{name:'Inventado'}});finishCall(exposed);assert.match(followupPanel(exposed,String),/não de quem acreditou/);assert.equal(load({getItem:()=>JSON.stringify(exposed)}).followups[0].kind,'support');
});
test('Atividade antes/depois retoma progresso e mede ação + evidência em situações diferentes',()=>{
 const s=start();s.credits=55;assert.equal(beginClassSession(s,1000),true);assert.equal(beginClassSession(s,2000),false);assert.equal(answerClassAssessment(s,answers('A')),true);
 const restored=load({getItem:()=>JSON.stringify(s)});applyTypedMove(restored,'typed','Confira no canal oficial');inspectDefense(restored,'order');resolveDefense(restored,'verify','order','conflicts');assert.equal(finishClassPlay(restored),true);finishCall(restored);
 assert.equal(answerClassAssessment(restored,answers('B'),61000),true);assert.equal(restored.classSession.elapsedSeconds,60);assert.equal(restored.credits,55);assert.equal(restored.cursor,1);
 assert.ok(restored.classSession.post.every(r=>r.supported));assert.notEqual(assessmentForms.A[0].prompt,assessmentForms.B[0].prompt);
 const wrongEvidence=answers('B');wrongEvidence[0].evidence=0;assert.equal(evaluateAssessment('B',wrongEvidence)[0].supported,false);
});
test('Exportação padrão não inclui nomes, dinheiro, anotações ou conversas completas',()=>{
 const s=start();s.notes={nino:'Texto particular'};s.active.log.push({speaker:'Você',text:'Texto de conversa particular'});closeCall(s);inspectDefense(s,'order');resolveDefense(s,'verify','order','conflicts');finishCall(s);
 const report=learningReport(s),text=JSON.stringify(report);assert.equal(report.assessment,null);assert.doesNotMatch(text,/particular|Nino|credits|speaker|caller|log"/);assert.match(text,/não demonstra eficácia/);assert.deepEqual(report.defenses[0].evidence,['order']);
});
