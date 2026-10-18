import test from 'node:test';
import assert from 'node:assert/strict';
import {defensePeople,scammerPeople,defenseCases,startDefenseCall,decideDefense,stopRansomware,endDefenseContact,expireRansomware} from '../src/defense-round.js';
import {fresh,nextCall,finishCall,migrateToDefense} from '../src/engine.js';
import {defenseView} from '../src/defense-view.js';
import {helpContent} from '../src/app-content.js';
import {expressions} from '../src/mood.js';
import {voiceProfiles} from '../src/speech-timing.js';
import {readFile} from 'node:fs/promises';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('Cada golpista tem uma fala engraçada e uma segunda ação classificada sem apontar a resposta certa',()=>{
 assert.equal(defensePeople.length,10);
 for(const person of defensePeople){const scenario=defenseCases[person.caseId],witty=scenario.choices.filter(choice=>choice.witty),classified=scenario.choices.filter(choice=>choice.classification);assert.ok(person.name);assert.ok(scenario.technique);assert.equal(scenario.choices.length,4);assert.ok(scenario.choices.every(choice=>choice.label.startsWith('AÇÃO — ')));assert.equal(witty.length,1,`${person.name} deve ter exatamente uma opção engraçada`);assert.equal(witty[0].safe,true);assert.equal(classified.length,1,`${person.name} deve ter uma ação classificada`);assert.equal(classified[0].safe,false);}
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
 state.active.chatVisible=1;state.active.chatStage='speaking';const speaking=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.match(speaking,/data-caller="golpista1"/);assert.match(speaking,/data-speaking="true"/);assert.match(speaking,/golpista1-amused-talking\.svg/);assert.match(speaking,/O contato não salvo está falando/);assert.match(speaking,/defense-chat is-speaking/);assert.doesNotMatch(speaking,/Bia está falando/);assert.equal((speaking.match(/-talking\.svg/g)||[]).length,1);
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
 assert.match(scammer,/golpista3-confused-talking\.svg/);assert.match(scammer,/class="defense-murmur-mark"/);
 state.active.chatStage='ready';state.active.chatVisible=1;
 const idle=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});assert.doesNotMatch(idle,/luana-suspicious-talking|defense-character is-murmuring/);
});

test('Bolinha de mensagem nova aparece no Zape, inclusive na barra do celular',async()=>{
 const {mobileNavigation}=await import('../src/mobile-ui.js');
 const html=mobileNavigation([['calls','☎','Zape Zape 2']],'calls',{callUnread:true},()=>'<svg></svg>');
 assert.match(html,/data-app="calls" class="has-unread" aria-label="Zape, mensagem nova"/);
});

test('Ransomware é só simulação, permite desconectar e encerra após 45 segundos se não reagir',()=>{
 const a=startDefenseCall(5),scenario=defenseCases.ransomware,unsafe=scenario.choices.find(choice=>choice.ransomware);
 assert.equal(decideDefense(a,unsafe.id,2000),true);assert.equal(a.ransomwareDeadline,47000);assert.equal(expireRansomware(a,46999),false);
 assert.equal(stopRansomware(a),true);assert.equal(a.outcome,'blocked');assert.equal(a.ransomwareDeadline,null);
 const b=startDefenseCall(5);decideDefense(b,unsafe.id,2000);assert.equal(expireRansomware(b,47000),true);assert.equal(b.gameOver,true);assert.match(b.feedback,/salário inexistente de estagiário/);
});
