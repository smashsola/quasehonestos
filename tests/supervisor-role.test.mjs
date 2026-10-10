import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const load=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('Tutorial usa asset e identidade de Supervisor',async()=>{
 const tutorial=await load('src/tutorial.js');
 assert.match(tutorial,/portraits\/supervisor\.svg/);
 assert.match(tutorial,/SUPERVISÃO/);
 assert.doesNotMatch(tutorial,/portraits\/boss\.svg/);
});

test('Interface operacional aplica Supervisor e preserva Chefia para fechamento',async()=>{
 const [index,role,ending]=await Promise.all([load('index.html'),load('src/supervisor-ui.js'),load('src/shift-ending.js')]);
 assert.match(index,/src\/supervisor-ui\.js/);
 assert.match(role,/RECADO DO SUPERVISOR/);
 assert.match(role,/Supervisor de turno/);
 assert.match(role,/primeiro atendimento/);
 assert.match(ending,/CHEFIA · ÚLTIMO RECADO/);
 assert.match(ending,/boss-goodbye/);
});
