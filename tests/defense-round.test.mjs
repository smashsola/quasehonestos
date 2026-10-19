import test from 'node:test';
import assert from 'node:assert/strict';
import {defensePeople,scammerPeople,defenseCases,defenseMechanics,defenseFailures,defenseActionScenes,defenseActionSounds,startDefenseCall,resumeDefenseCall,finishDefenseMurmur,decideDefense,stopRansomware,endDefenseContact,expireRansomware,useDefenseMechanic} from '../src/defense-round.js';
import {fresh,nextCall,finishCall,migrateToDefense} from '../src/engine.js';
import {defenseView,defenseCampaignEnding,defenseActionDemos} from '../src/defense-view.js';
import {helpContent} from '../src/app-content.js';
import {expressions} from '../src/mood.js';
import {voiceProfiles} from '../src/speech-timing.js';
import {readFile} from 'node:fs/promises';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('A rodada encerrada permite voltar ao computador sem reiniciar',()=>{
 const html=defenseCampaignEnding({history:[]},escape);
 assert.match(html,/data-show-desktop/);
 assert.match(html,/Voltar para o computador/);
 assert.match(html,/data-action="reset"/);
 assert.match(html,/Começar outra rodada/);
});

test('O resumo final deixa abrir cada conversa e mostra os dados ou anexos enviados',async()=>{
 const html=defenseCampaignEnding({history:[
  {caseId:'bank-call',caller:'caio',choice:'give-code',outcome:'fooled',feedback:'Código informado.'},
  {caseId:'delivery',caller:'maya',choice:'reply-cpf',outcome:'fooled',feedback:'Dados enviados.'},
  {caseId:'fake-store',caller:'duda',choice:'send-document',outcome:'fooled',feedback:'Documento anexado.'},
  {caseId:'whatsapp',caller:'bia',choice:'verify-person',outcome:'blocked',feedback:'Ligação pelo contato salvo.'}
 ]},escape);
 assert.equal((html.match(/<details class="defense-recap-card"/g)||[]).length,4);assert.equal((html.match(/<summary class="defense-recap-heading"/g)||[]).length,4);assert.match(html,/Eu: \[código SMS fictício: 804 271\]/);assert.match(html,/Eu: \[CPF e endereço fictícios enviados\]/);assert.match(html,/Eu: \[CPF e foto de documento fictícios anexados\]/);assert.match(html,/Eu: \[nenhum código, CPF ou anexo enviado\]/);assert.match(html,/Mensagem fictícia enviada/);assert.match(html,/<span>1<\/span>/);assert.doesNotMatch(html,/<span>0[1-9]<\/span>/);
 const css=await readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8');assert.match(css,/call-window-body:has\(\.defense-ending\).*overflow-y:auto/);assert.match(css,/\.defense-recap-card\[open\]/);assert.match(css,/\.defense-recap-message\.is-risk/);
});

test('O resumo registra anexos e dados como mensagens fictícias enviadas pela pessoa jogadora',()=>{
 const html=defenseCampaignEnding({history:[
  {caseId:'ransomware',caller:'leo',choice:'open-attachment',outcome:'fooled',feedback:'Arquivo aberto.'},
  {caseId:'bank-call',caller:'caio',choice:'give-code',outcome:'fooled',feedback:'Código compartilhado.'}
 ]},escape);
 assert.match(html,/Eu: \[anexo aberto: nota-fiscal-urgente\.pdf fictício\]/);
 assert.match(html,/Eu: \[código SMS fictício: 804 271\]/);
 assert.match(html,/aria-label="Mensagem simulada"/);
});

test('Cada resultado de situação oferece voltar ao PC junto de continuar',()=>{
 const active=startDefenseCall(0);decideDefense(active,'send-pix');
 const html=defenseView({active,cursor:0},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(html,/Voltar ao PC/);assert.match(html,/data-show-desktop/);assert.match(html,/Próxima situação/);
});

test('Ao voltar para uma conversa salva, o murmúrio do golpista toca de novo',()=>{
 const active=startDefenseCall(2);active.chatVisible=2;active.chatStage='ready';active.murmurHeard=true;active.actionPending='deliver-proof';
 assert.equal(resumeDefenseCall(active),true);assert.equal(active.actionPending,null);assert.equal(active.chatStage,'typing');assert.equal(active.chatVisible,1);assert.equal(active.unread,true);assert.equal(active.murmurHeard,false);
 const ransomware=startDefenseCall(5);ransomware.ransomwareDeadline=Date.now()+10_000;assert.equal(resumeDefenseCall(ransomware),true);assert.equal(ransomware.chatStage,'ready');assert.equal(ransomware.chatVisible,2);
});

test('Cada golpista muda de expressão durante uma fala curta e encerra o murmúrio ao terminar',()=>{
 for(const scammer of scammerPeople){assert.ok(expressions.includes(scammer.emotion));assert.ok(expressions.includes(scammer.speakingExpression));assert.notEqual(scammer.emotion,scammer.speakingExpression);}
 const active=startDefenseCall(2);assert.equal(active.scammerExpression,'confused');assert.equal(active.scammerSpeakingExpression,'suspicious');active.chatStage='speaking';assert.equal(finishDefenseMurmur(active),true);assert.equal(active.chatStage,'ready');assert.equal(finishDefenseMurmur(active),false);
});

test('Cada golpista tem uma fala engraçada e uma segunda ação classificada sem apontar a resposta certa',()=>{
 assert.equal(defensePeople.length,10);
 for(const person of defensePeople){const scenario=defenseCases[person.caseId],witty=scenario.choices.filter(choice=>choice.witty),classified=scenario.choices.filter(choice=>choice.classification);assert.ok(person.name);assert.ok(scenario.technique);assert.equal(scenario.choices.length,4);assert.ok(scenario.choices.every(choice=>choice.label.startsWith('AÇÃO — ')));assert.equal(witty.length,1,`${person.name} deve ter exatamente uma opção engraçada`);assert.equal(witty[0].safe,true);assert.equal(classified.length,1,`${person.name} deve ter uma ação classificada`);assert.equal(classified[0].safe,false);}
});

test('Cada conversa tem uma dica rápida própria, opcional e sem punição',()=>{
 const mechanics=Object.values(defenseMechanics);assert.equal(mechanics.length,9);assert.equal(new Set(mechanics.map(item=>item.button)).size,9);
 for(const person of defensePeople){const active=startDefenseCall(defensePeople.indexOf(person));active.chatVisible=1;if(person.caseId==='ransomware'){assert.equal(defenseMechanics[person.caseId],undefined);assert.equal(useDefenseMechanic(active),false);continue;}assert.ok(defenseMechanics[person.caseId]);assert.equal(useDefenseMechanic(active),true);assert.equal(active.mechanicFeedback,defenseMechanics[person.caseId].result);assert.equal(active.outcome,null);assert.equal(useDefenseMechanic(active),false);}
});

test('Interações rápidas aparecem junto da conversa e o resultado fica visível após tocar',()=>{
 const active=startDefenseCall(0);active.chatVisible=1;active.chatStage='ready';const view=()=>defenseView({active,cursor:0},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(view(),/DICA · OPCIONAL/);assert.match(view(),/Toque para ver uma pista/);assert.match(view(),/data-defense-mechanic/);assert.equal(useDefenseMechanic(active),true);assert.match(view(),/role="status" tabindex="-1" data-mechanic-status/);assert.match(view(),/DICA<\/small>/);assert.match(view(),/Este número não está salvo/);assert.doesNotMatch(view(),/data-defense-mechanic/);
});

test('Cada erro anima uma consequência própria; ransomware mantém a pane especial',async()=>{
 assert.equal(Object.keys(defenseFailures).length,9);
 const css=await readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8');const consequenceAnimations={whatsapp:'defenseConsequenceSend','bank-call':'defenseConsequenceLock','fake-pix':'defenseConsequenceReceipt',boleto:'defenseConsequenceQr',delivery:'defenseConsequenceLeak','fake-motoboy':'defenseConsequenceCard','fake-store':'defenseConsequenceShop','fake-government':'defenseConsequenceStamp','card-swap':'defenseConsequenceSwap'};assert.deepEqual(Object.keys(consequenceAnimations).sort(),Object.keys(defenseFailures).sort());for(const [caseId,animation] of Object.entries(consequenceAnimations)){assert.ok(css.includes(`.consequence-${caseId} .defense-consequence-icon{animation:${animation}`),`animação para ${caseId}`);assert.ok(css.includes(`@keyframes ${animation}`),`keyframes para ${caseId}`);}assert.match(css,/\.defense-action-appbutton::after/);assert.match(css,/@keyframes defenseAppRipple/);
 const titles=new Set();
 for(const person of defensePeople){const scenario=defenseCases[person.caseId],wrong=scenario.choices.find(choice=>!choice.safe);assert.ok(wrong);const active=startDefenseCall(defensePeople.indexOf(person));assert.equal(decideDefense(active,wrong.id,1000),true);if(person.caseId==='ransomware'){assert.equal(active.consequence,undefined);assert.ok(active.ransomwareDeadline);continue;}const effect=defenseFailures[person.caseId];assert.ok(effect,`consequência de ${person.caseId}`);assert.ok(!titles.has(effect.title),`título repetido: ${effect.title}`);titles.add(effect.title);assert.equal(active.consequence,effect);const html=defenseView({active,cursor:0},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(html,/class="defense-feedback defense-reaction defense-consequence is-miss/);assert.ok(html.includes(`consequence-${person.caseId}`));assert.ok(html.includes(effect.icon));assert.ok(html.includes(effect.title));assert.ok(html.includes(effect.result));assert.match(html,/Isso aconteceu só no jogo/);}
});

test('Cada uma das 40 ações dos dez turnos mostra sua própria cena animada',async()=>{
 const options=Object.values(defenseCases).flatMap(scenario=>scenario.choices),choiceIds=options.map(choice=>choice.id);assert.equal(options.length,40);assert.equal(Object.keys(defenseActionScenes).length,40);assert.equal(Object.keys(defenseActionDemos).length,40);assert.ok(Object.keys(defenseActionSounds).every(id=>choiceIds.includes(id)));assert.ok(Object.values(defenseActionSounds).every(type=>['call','hangup','message','keypad','payment'].includes(type)));
 const titles=new Set(),demoKinds=new Set();
 for(const person of defensePeople){const scenario=defenseCases[person.caseId],active=startDefenseCall(defensePeople.indexOf(person));active.chatVisible=1;active.chatStage='ready';for(const choice of scenario.choices){const scene=defenseActionScenes[choice.id],demo=defenseActionDemos[choice.id];assert.ok(scene,`cena para ${choice.id}`);assert.ok(scene.title&&scene.detail&&scene.icon&&scene.motion&&scene.target,`cena demonstrativa completa para ${choice.id}`);assert.ok(!titles.has(scene.title),`cena repetida: ${scene.title}`);titles.add(scene.title);assert.ok(demo?.context&&demo.button&&demo.result,`ação simulada completa para ${choice.id}`);active.actionPending=choice.id;const html=defenseView({active,cursor:defensePeople.indexOf(person)},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.ok(html.includes(`data-action-scene="${choice.id}"`));assert.ok(html.includes(scene.title));assert.ok(html.includes(scene.detail));assert.ok(html.includes(`motion-${scene.motion}`));assert.ok(html.includes(`data-demo-app="${choice.id}"`));assert.ok(html.includes(demo.context));assert.ok(html.includes(demo.button));assert.ok(html.includes(demo.result));const kind=html.match(/data-demo-kind="([^"]+)"/)?.[1];assert.ok(kind,`tipo visual ausente: ${choice.id}`);demoKinds.add(kind);assert.match(html,/class="defense-action-pc"/);assert.match(html,/TRAMBIQUE OS/);assert.match(html,/AÇÃO EM ANDAMENTO/);assert.match(html,/defense-action-progress/);assert.match(html,/defense-action-appresult/);assert.match(html,/data-defense-choice="[^"]+"[^>]*disabled/);if(choice.id==='open-known-app')assert.match(html,/Banco Quase Digital/);}}assert.equal(demoKinds.size,8,'oito estilos de app distintos');
 const [game,css,view,audio]=await Promise.all([readFile(new URL('../src/game.js',import.meta.url),'utf8'),readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8'),readFile(new URL('../src/defense-view.js',import.meta.url),'utf8'),readFile(new URL('../src/audio.js',import.meta.url),'utf8')]);assert.match(game,/active\.actionPending=choiceId/);assert.match(game,/qh-defense-action/);assert.match(game,/defenseActionSounds\[choiceId\]/);assert.match(game,/active\.actionPending=null/);assert.match(game,/},7000\)/);assert.match(audio,/addEventListener\('qh-defense-action'/);for(const type of ['call','hangup','message','keypad','payment'])assert.ok(audio.includes(`type==='${type}'`),`efeito sonoro para ${type}`);assert.match(view,/Banco Quase Digital/);assert.match(view,/defense-action-appbar/);for(const visual of ['demo-call-rings','demo-bank-route','demo-message-out','demo-security-checks','demo-delivery-track','demo-file-scan','demo-protocol','demo-nfc'])assert.ok(view.includes(visual),`app sem visual próprio: ${visual}`);assert.match(css,/\.defense-action-pc/);assert.match(css,/\.defense-action-playback-icon\.motion-call/);assert.match(css,/@keyframes defenseActionCall/);assert.match(css,/@keyframes defenseAppLaunch/);assert.match(css,/@keyframes defenseAppClick/);assert.match(css,/@keyframes defenseAppResult/);assert.match(css,/defenseAppWait 7s/);assert.match(css,/defenseAppResult 7s/);assert.match(css,/defenseActionProgress 7s/);assert.match(css,/\.defense-action-progress i/);assert.match(css,/@keyframes demoCallRing/);assert.match(css,/@keyframes demoFileScan/);assert.match(css,/@keyframes demoNfcWave/);
});

test('Ações com códigos, arquivos e dados mostram o golpista digitando no PC fictício',async()=>{
 const active=startDefenseCall(0);active.chatVisible=1;active.chatStage='ready';
 for(const id of ['give-code','install-remote','repeat-pin','enable-macros','reply-cpf','send-document','pay-link']){active.actionPending=id;const html=defenseView({active,cursor:0},{escape,portraitSource:(person,emotion)=>`/src/portraits/${person}-${emotion}.svg`});assert.match(html,/class="demo-scammer-control/,id);assert.match(html,/Golpista (?:mexendo no PC|digitando no app)/,id);assert.match(html,/EU · (?:MENSAGEM FICTÍCIA|AÇÃO SIMULADA)/,id);assert.match(html,/class="demo-scammer-text"/,id);}
 for(const id of ['give-code','reply-cpf','send-doc','send-document']){active.actionPending=id;const html=defenseView({active,cursor:0},{escape,portraitSource:(person,emotion)=>`/src/portraits/${person}-${emotion}.svg`});assert.match(html,/Enviando mensagem…/,id);assert.match(html,/Mensagem enviada/,id);assert.match(html,/✓✓ Enviada/,id);}
 for(const id of ['send-doc','send-document']){active.actionPending=id;const html=defenseView({active,cursor:0},{escape,portraitSource:(person,emotion)=>`/src/portraits/${person}-${emotion}.svg`});assert.match(html,/documento-de-exemplo\.pdf/,id);assert.match(html,/Anexando…/,id);assert.match(html,/Anexado ✓/,id);}
 active.actionPending='verify-person';assert.doesNotMatch(defenseView({active,cursor:0},{escape,portraitSource:(person,emotion)=>`/src/portraits/${person}-${emotion}.svg`}),/class="demo-scammer-control"/);
 const css=await readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8');assert.match(css,/@keyframes demoTypeLetter/);assert.match(css,/animation-delay:calc\(var\(--letter\)\*\.075s\)/);assert.match(css,/@keyframes demoMessageSent/);assert.match(css,/@keyframes demoAttachmentArrive/);assert.match(css,/@keyframes demoAttachmentProgress/);assert.match(css,/prefers-reduced-motion:reduce\).*demo-scammer-text/);
});

test('Cada escolha mostra uma reação grande, com parabéns, quase lá ao pausar ou consequência ao errar',async()=>{
 const render=active=>defenseView({active,cursor:0},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 const safe=startDefenseCall(0);decideDefense(safe,'verify-person',1000);assert.equal(safe.reactionTier,'success');assert.match(render(safe),/class="defense-feedback defense-reaction is-success"/);assert.match(render(safe),/PARABÉNS!/);assert.match(render(safe),/🎉/);assert.equal((render(safe).match(/class="defense-confetti-corner /g)||[]).length,4);assert.equal((render(safe).match(/<i style="--dx:/g)||[]).length,72);
 const almost=startDefenseCall(0);endDefenseContact(almost);assert.equal(almost.reactionTier,'almost');assert.match(render(almost),/class="defense-feedback defense-reaction is-almost"/);assert.match(render(almost),/QUASE LÁ!/);assert.doesNotMatch(render(almost),/defense-confetti/);
 const miss=startDefenseCall(0);decideDefense(miss,'send-pix',1000);assert.equal(miss.reactionTier,'miss');assert.match(render(miss),/class="defense-feedback defense-reaction defense-consequence is-miss/);assert.match(render(miss),/O Pix foi para o número novo/);assert.match(render(miss),/aria-modal="true"/);assert.doesNotMatch(render(miss),/defense-confetti/);
 const [audio,game,css]=await Promise.all([readFile(new URL('../src/audio.js',import.meta.url),'utf8'),readFile(new URL('../src/game.js',import.meta.url),'utf8'),readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8')]);assert.match(game,/CustomEvent\('qh-defense-reaction'/);assert.match(audio,/addEventListener\('qh-defense-reaction'/);assert.match(audio,/tier==='success'/);assert.match(audio,/reactionTone\(frequency,start\+i\*\.15,\.28,\.3,'triangle'\)/);assert.match(audio,/reactionTone\(frequency\*2,start\+i\*\.15,\.19,\.075,'sine'\)/);assert.match(audio,/frequency,start\+\.72,\.68,\.18,'sine'/);assert.match(audio,/level\*1\.5\*messageVolume\/65/);assert.match(audio,/createDynamicsCompressor/);assert.match(audio,/tier==='almost'/);assert.match(audio,/reactionTone\(frequency,start\+i\*\.14,\.24,\.2,'triangle'\)/);assert.match(audio,/reactionTone\(392,start,\.58,\.3,'triangle',110\)/);assert.match(audio,/reactionTone\(146\.83,start\+\.08,\.48,\.23,'sawtooth',98\)/);assert.match(css,/animation:defenseConfettiFly/);assert.match(css,/@keyframes defenseConfettiFly/);assert.doesNotMatch(css,/defense-confetti-corner i\{animation:none/);
});

test('Todos os dez personagens têm retratos com expressão e boca animada para falar',async()=>{
 for(const person of defensePeople){assert.ok(voiceProfiles[person.id],`voz de ${person.id}`);for(const expression of expressions){const portrait=await readFile(new URL(`../src/portraits/${person.id}-${expression}.svg`,import.meta.url),'utf8');const talking=await readFile(new URL(`../src/portraits/${person.id}-${expression}-talking.svg`,import.meta.url),'utf8');assert.match(portrait,/<svg/);assert.match(talking,/mouth-speaking/);}}
});

test('Seis contatos falsos têm voz própria e rosto animado em cada expressão',async()=>{
 assert.equal(scammerPeople.length,6);
 for(const scammer of scammerPeople){assert.ok(voiceProfiles[scammer.id],`voz de ${scammer.id}`);for(const expression of expressions){const portrait=await readFile(new URL(`../src/portraits/${scammer.id}-${expression}.svg`,import.meta.url),'utf8');const talking=await readFile(new URL(`../src/portraits/${scammer.id}-${expression}-talking.svg`,import.meta.url),'utf8');assert.match(portrait,/<svg/);assert.match(talking,/mouth-speaking/);}}
});

test('Migra uma partida salva para defesa sem apagar o histórico nem a conversa em andamento',()=>{
 const state=fresh();state.cursor=2;state.history=[{caller:'nino',outcome:'blocked'}];state.active={caller:'olga',log:[{speaker:'Olga',text:'Mensagem anterior'}]};
 assert.equal(migrateToDefense(state),true);assert.equal(state.mode,'defense');assert.equal(state.cursor,0);assert.equal(state.active,null);assert.equal(state.history.length,1);assert.equal(state.previousCampaign.active.log[0].text,'Mensagem anterior');assert.equal(state.migratedToDefense,true);
});

test('Inicia com aviso e três pontos antes de revelar a mensagem do contato',()=>{
 const state=fresh();state.mode='defense';assert.equal(nextCall(state),true);assert.equal(state.active.mode,'defense');assert.equal(state.active.log.length,0);assert.equal(state.active.chatStage,'typing');assert.equal(state.active.chatVisible,0);assert.equal(state.active.unread,true);assert.ok(scammerPeople.some(contact=>contact.id===state.active.scammerId));
 const scenario=defenseCases[state.active.caseId],safe=scenario.choices.find(choice=>choice.safe);
 assert.equal(decideDefense(state.active,safe.id,1000),true);assert.equal(state.active.outcome,'blocked');assert.equal(state.active.feedback,safe.feedback);
 assert.equal(finishCall(state),true);assert.equal(state.history[0].caseId,'whatsapp');
});

test('Pode encerrar qualquer contato e recebe orientação clara se já compartilhou algo',()=>{
 for(const person of defensePeople){const a=startDefenseCall(defensePeople.indexOf(person));assert.equal(endDefenseContact(a),true);assert.equal(a.outcome,'blocked');assert.match(a.feedback,/Você pausou a conversa/);assert.match(a.feedback,/canal oficial/);}
});

test('Tela explica o golpe, mostra as quatro ações e ensina como sair',()=>{
 const state=fresh();state.mode='defense';nextCall(state);
 const html=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(html,/O que pode acontecer/);assert.match(html,/O contato não salvo está digitando/);assert.doesNotMatch(html,/Já paguei!/);assert.ok(!html.includes(defensePeople[0].reaction));assert.doesNotMatch(html,/data-defense-speak|Ouvir fala|defense-message-stamp|>agora</);assert.match(html,/role="log" tabindex="0"/);assert.equal((html.match(/data-defense-choice=/g)||[]).length,0);assert.match(html,/defense-typing/);assert.doesNotMatch(html,/AÇÃO SEGURA/);assert.doesNotMatch(html,/data-defense-exit/);
 state.active.chatVisible=1;state.active.chatStage='ready';const ready=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.doesNotMatch(ready,/reaction|<small>Eu/);assert.equal((ready.match(/data-defense-choice=/g)||[]).length,4);assert.match(ready,/Quer interromper por aqui\?/);assert.match(ready,/data-defense-exit/);
 const ids=[...ready.matchAll(/data-defense-choice="([^"]+)"/g)].map(match=>match[1]),choices=ids.map(id=>defenseCases.whatsapp.choices.find(choice=>choice.id===id));assert.ok(choices.slice(0,2).every(choice=>!choice.witty&&!choice.classification));assert.ok(choices.slice(2).every(choice=>choice.witty||choice.classification));assert.equal(new Set(choices.slice(2).map(choice=>choice.safe)).size,2);
 assert.match(helpContent(state,escape),/confirmar por um canal conhecido/);
 assert.match(helpContent(state,escape),/Golpes incluídos nesta rodada \(10\)/);
 const direct=fresh();direct.mode='defense';nextCall(direct);direct.active.caller='caio';direct.active.caseId='bank-call';direct.active.scammerId='golpista2';direct.active.chatVisible=2;direct.active.chatStage='ready';const directHtml=defenseView(direct,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(directHtml,/class="defense-response-tag is-classified"><span aria-hidden="true">💬<\/span> Resposta direta/);
});

test('Só o golpista murmura e anima a boca; tutorial abre as pistas sem botão de áudio',()=>{
 const state=fresh();state.mode='defense';nextCall(state);state.active.chatVisible=0;state.active.chatStage='typing';
 const html=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(html,/defense-typing/);assert.match(html,/está digitando/);assert.doesNotMatch(html,/Já paguei!/);assert.doesNotMatch(html,/data-defense-choice=/);assert.match(html,/contato não confirmado/);assert.doesNotMatch(html,/no Zape agora/);
 assert.equal((html.match(/<span><\/span>/g)||[]).length,3);assert.doesNotMatch(html,/defense-wait/);
 state.active.chatVisible=1;state.active.chatStage='speaking';const speaking=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(speaking,/data-caller="golpista1"/);assert.match(speaking,/data-speaking="true"/);assert.match(speaking,/class="avatar is-speaking"/);assert.match(speaking,/class="defense-sender-avatar is-speaking"/);assert.match(speaking,/defense-chat is-speaking/);assert.doesNotMatch(speaking,/Bia está falando|O contato não salvo está falando|murmurando ·|defense-speech-tone|defense-murmur-mark/);assert.match(speaking,/data-defense-choice=/);assert.match(speaking,/O que observar nesta mensagem/);const speakingSources=[...speaking.matchAll(/<img draggable="false" src="([^"]+)" alt="" width="(?:64|48)"/g)].map(match=>match[1]);assert.equal(speakingSources.length,2);assert.equal(speakingSources[0],speakingSources[1]);
 state.active.chatStage='ready';const ready=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(ready,/data-defense-choice=/);assert.match(ready,/O que observar nesta mensagem/);assert.match(ready,/class="defense-response-tag is-witty"/);assert.match(ready,/class="defense-response-tag is-classified"/);
 assert.doesNotMatch(ready,/<small>Eu<\/small>|Você está preparando uma resposta|bia-thinking-talking|data-defense-play|Clique aqui para ouvir/);assert.match(ready,/Três pistas para conferir antes de agir/);
});

test('No golpe do Pix, o mesmo retrato do golpista aparece no perfil e na mensagem',()=>{
 const state=fresh();state.mode='defense';state.active=startDefenseCall(2);state.active.chatVisible=2;state.active.chatStage='ready';
 const html=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(html,/<strong>Contato não salvo<\/strong>/);assert.match(html,/Luana · Vende bolos por encomenda/);assert.doesNotMatch(html,/defense-character|<small>Eu<\/small>/);
 const avatarSources=[...html.matchAll(/<img draggable="false" src="([^"]+)" alt="" width="(?:64|48)"/g)].map(match=>match[1]);assert.equal(avatarSources.length,2);assert.equal(avatarSources[0],avatarSources[1]);
 state.active.chatStage='speaking';state.active.chatVisible=1;
 const scammer=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(scammer,/class="avatar is-speaking"/);assert.match(scammer,/class="defense-sender-avatar is-speaking"/);assert.match(scammer,/class="defense-chat is-speaking"/);assert.match(scammer,/data-defense-choice=/);assert.doesNotMatch(scammer,/murmurando ·|defense-speech-tone|defense-murmur-mark/);
 state.active.chatStage='ready';state.active.chatVisible=1;
 const idle=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.doesNotMatch(idle,/luana-suspicious-talking|defense-character is-murmuring/);
});

test('Bolinha de mensagem nova aparece no Zape, inclusive na barra do celular',async()=>{
 const {mobileNavigation}=await import('../src/mobile-ui.js');
 const html=mobileNavigation([['calls','☎','Zape Zape 2']],'calls',{callUnread:true},()=>'<svg></svg>');
 assert.match(html,/data-app="calls" class="has-unread" aria-label="Zape, mensagem nova"/);
});

test('Ransomware é só simulação, permite desconectar e encerra após 10 segundos se não reagir',async()=>{
 const a=startDefenseCall(5),scenario=defenseCases.ransomware,unsafe=scenario.choices.find(choice=>choice.ransomware);
 assert.equal(decideDefense(a,unsafe.id,2000),true);assert.equal(a.ransomwareDeadline,12000);assert.match(a.log.at(-1).text,/10 segundos/);assert.equal(expireRansomware(a,11999),false);
 assert.equal(stopRansomware(a),true);assert.equal(a.outcome,'blocked');assert.equal(a.ransomwareDeadline,null);
 const b=startDefenseCall(5);decideDefense(b,unsafe.id,2000);assert.equal(expireRansomware(b,12000),true);assert.equal(b.gameOver,true);assert.match(b.feedback,/só aconteceu dentro do jogo/);assert.match(b.feedback,/desconecte o aparelho da rede/);
 const html=defenseView({active:b,cursor:5},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(html,/class="pc-crash-screen"/);assert.match(html,/Tentar novamente/);assert.match(html,/Você abriu o anexo suspeito/);assert.match(html,/contador chegou a zero antes de você parar/);assert.match(html,/seus arquivos reais continuam intactos/);assert.match(html,/Voltar ao PC/);assert.doesNotMatch(html,/class="defense-feedback defense-reaction/);
 const [game,audio,css]=await Promise.all([readFile(new URL('../src/game.js',import.meta.url),'utf8'),readFile(new URL('../src/audio.js',import.meta.url),'utf8'),readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8')]);assert.match(game,/data-retry-ransomware/);assert.match(game,/qh-computer-burnout/);assert.match(game,/qh-computer-restart/);assert.match(game,/const typingDelay=3000/);assert.match(audio,/addEventListener\('qh-computer-burnout'/);assert.match(audio,/computerDead=true;stopMurmurs\(\)/);assert.match(audio,/computerDead=false/);assert.match(css,/@keyframes pcBurnout/);assert.match(css,/@keyframes pcStatic/);
 const alert=startDefenseCall(5);decideDefense(alert,unsafe.id,2000);const alertHtml=defenseView({active:alert,cursor:5},{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(alertHtml,/data-defense-stop/);assert.match(alertHtml,/Parar o bloqueio/);assert.match(alertHtml,/Desconectar da rede e chamar o suporte/);assert.match(audio,/Math\.min\(\.9,\.48\*level\)/);assert.match(audio,/Math\.min\(\.9,\.34\*level\)/);assert.match(audio,/staticGain\.connect\(reactionLimiter\)/);
});
test('Confetes continuam animados mesmo com movimento reduzido',async()=>{
 const css=await readFile(new URL('../src/style.css',import.meta.url),'utf8');
 assert.match(css,/\.desktop \.defense-confetti-corner i\{animation:defenseConfettiFly[^}]+!important\}/);
});
