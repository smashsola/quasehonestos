import test from 'node:test';
import assert from 'node:assert/strict';
import {defensePeople,defenseCases,startDefenseCall,decideDefense,stopRansomware,endDefenseContact,expireRansomware} from '../src/defense-round.js';
import {fresh,nextCall,finishCall,migrateToDefense} from '../src/engine.js';
import {defenseView} from '../src/defense-view.js';
import {helpContent} from '../src/app-content.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('Primeira rodada defensiva oferece seis pessoas e escolhas claramente rotuladas como ações',()=>{
 assert.equal(defensePeople.length,6);
 for(const person of defensePeople){const scenario=defenseCases[person.caseId];assert.ok(person.name);assert.ok(scenario.technique);assert.equal(scenario.choices.length,4);assert.ok(scenario.choices.every(choice=>choice.label.startsWith('AÇÃO — ')));}
});

test('Migra uma partida salva para defesa sem apagar o histórico nem a conversa em andamento',()=>{
 const state=fresh();state.cursor=2;state.history=[{caller:'nino',outcome:'blocked'}];state.active={caller:'olga',log:[{speaker:'Olga',text:'Mensagem anterior'}]};
 assert.equal(migrateToDefense(state),true);assert.equal(state.mode,'defense');assert.equal(state.cursor,0);assert.equal(state.active,null);assert.equal(state.history.length,1);assert.equal(state.previousCampaign.active.log[0].text,'Mensagem anterior');assert.equal(state.migratedToDefense,true);
});

test('Inicia a conversa com a mensagem recebida e registra ação segura',()=>{
 const state=fresh();state.mode='defense';assert.equal(nextCall(state),true);assert.equal(state.active.mode,'defense');assert.equal(state.active.log[0].speaker,defensePeople[0].name);
 const scenario=defenseCases[state.active.caseId],safe=scenario.choices.find(choice=>choice.safe);
 assert.equal(decideDefense(state.active,safe.id,1000),true);assert.equal(state.active.outcome,'blocked');assert.equal(state.active.feedback,safe.feedback);
 assert.equal(finishCall(state),true);assert.equal(state.history[0].caseId,'whatsapp');
});

test('Pode encerrar qualquer contato e recebe orientação clara se já compartilhou algo',()=>{
 const a=startDefenseCall(0);assert.equal(endDefenseContact(a),true);assert.equal(a.outcome,'blocked');assert.match(a.feedback,/não cancela uma transferência/);
});

test('Tela explica o golpe, mostra as quatro ações e ensina como sair',()=>{
 const state=fresh();state.mode='defense';nextCall(state);
 const html=defenseView(state,{escape,portraitSource:(id,emotion)=>`/src/portraits/${id}-${emotion}.svg`});
 assert.match(html,/O que pode acontecer/);assert.equal((html.match(/data-defense-choice=/g)||[]).length,4);assert.match(html,/data-defense-exit/);
 assert.match(helpContent(state,escape),/confirmar por um canal conhecido/);
});

test('Ransomware é só simulação, permite desconectar e encerra após 45 segundos se não reagir',()=>{
 const a=startDefenseCall(5),scenario=defenseCases.ransomware,unsafe=scenario.choices.find(choice=>choice.ransomware);
 assert.equal(decideDefense(a,unsafe.id,2000),true);assert.equal(a.ransomwareDeadline,47000);assert.equal(expireRansomware(a,46999),false);
 assert.equal(stopRansomware(a),true);assert.equal(a.outcome,'blocked');assert.equal(a.ransomwareDeadline,null);
 const b=startDefenseCall(5);decideDefense(b,unsafe.id,2000);assert.equal(expireRansomware(b,47000),true);assert.equal(b.gameOver,true);assert.match(b.feedback,/salário inexistente de estagiário/);
});
