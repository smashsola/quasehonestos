import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../src/engine.js';
import {tutorialPanel,tutorialStory} from '../src/tutorial.js';
import {helpContent,mailContent} from '../src/app-content.js';
import {classroomPanel} from '../src/classroom-session.js';
import {trustAppearance} from '../src/mood.js';

const esc=value=>String(value);

test('Onboarding usa história curta e Supervisor, sem colocar a Chefia no tutorial',()=>{
 const state=fresh(),tutorial=tutorialPanel(state,esc),manual=helpContent(state,esc,false);
 assert.ok(tutorialStory.length<260);
 assert.match(tutorial,/Lia/);assert.match(tutorial,/Trambique OS/);assert.doesNotMatch(tutorial,/Chefia/);
 assert.match(manual,/Onde você está/);assert.match(manual,/Supervisor acompanha só o primeiro caso/);
});

test('Correio deixa desempenho para o fechamento e não mostra Chefia durante o turno',()=>{
 const html=mailContent(fresh(),esc);
 assert.doesNotMatch(html,/Chefia|chefe/i);
 assert.match(html,/mail-nav-footer/);assert.match(html,/mail-toolbar-title/);assert.match(html,/Sobre esta caixa/);
});

test('Correio troca de pasta e permite guardar o recado com estrela',()=>{
 const state=fresh();state.incoming={pending:{sender:'Entrega Expressa',subject:'Aviso',starred:false}};
 const inbox=mailContent(state,esc);assert.match(inbox,/data-mail-folder="starred"/);assert.match(inbox,/data-mail-star/);assert.match(inbox,/aria-pressed="false"/);
 state.incoming.pending.starred=true;state.mailFolder='starred';assert.match(mailContent(state,esc),/data-open-inbox/);assert.match(mailContent(state,esc),/aria-pressed="true"/);
 for(const folder of ['sent','drafts']){state.mailFolder=folder;const html=mailContent(state,esc);assert.match(html,/gmail-empty/);assert.match(html,/aria-current="page"/);}
});

test('Manual descreve as quatro escolhas locais e controles de cada dispositivo',()=>{
 const html=helpContent(fresh(),esc,false),mobile=helpContent(fresh(),esc,true);
 assert.match(html,/falas são roteirizadas/);assert.match(html,/quatro falas/);assert.match(html,/Tab e Enter/);
 assert.match(mobile,/Aplicativos na barra inferior/);assert.doesNotMatch(mobile,/Enter envia|Enter pula|toque em Enviar/);
 assert.doesNotMatch(html,/Cloudflare Workers AI|Até 12 falas|serviço falhar/);
});

test('Validação em sala separa porcentagem da avaliação de aprendizagem',()=>{
 const html=classroomPanel(fresh(),esc);
 assert.match(html,/Antes → jogo → depois/);
 assert.match(html,/ação combina com a situação/);
 assert.match(html,/porcentagem de confiança/);
 assert.match(html,/não entram na avaliação/);
});

test('Percentual de confiança continua determinístico e limitado',()=>{
 assert.equal(trustAppearance(0).percent,0);
 assert.equal(trustAppearance(38).percent,38);
 assert.equal(trustAppearance(78).percent,78);
 assert.equal(trustAppearance(3).percent,3);
 assert.equal(trustAppearance(99).percent,99);
 assert.equal(trustAppearance(120).percent,100);
});
