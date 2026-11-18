import test from 'node:test';
import assert from 'node:assert/strict';
import {privacySafeState,validImport} from '../src/save-app.js';

test('Cópia portátil preserva progresso e remove conversas, anotações e mensagem pendente',()=>{
 const source={mode:'defense',cursor:3,credits:120,history:[{caller:'bia',outcome:'closed',caseId:'whatsapp',earned:20,log:[{text:'texto privado'}],facts:['frase privada'],interactionAudit:{transcript:'privado'}}],active:{log:[{text:'em andamento'}]},notes:{bia:'nota privada'},incoming:{pending:{body:'mensagem'}},previousCampaign:{mode:'solo',cursor:2,active:{log:[{text:'privado'}]}},conversationMemory:['privado'],memeCaption:'texto escrito pela pessoa'};
 const result=privacySafeState(source);
 assert.equal(result.cursor,3);assert.equal(result.credits,120);assert.equal(result.active,null);assert.deepEqual(result.notes,{});assert.equal(result.incoming,null);assert.equal(result.history[0].caseId,'whatsapp');
 assert.doesNotMatch(JSON.stringify(result),/texto privado|frase privada|nota privada|mensagem|em andamento|privado|texto escrito pela pessoa/);
 assert.equal(source.history[0].log[0].text,'texto privado');
});

test('Importa somente arquivos de salvamento com progresso válido',()=>{
 const accepted={game:'quase-honestos',format:1,items:{'quase-honestos-v1':JSON.stringify({mode:'solo',cursor:1,history:[]})}};
 assert.equal(validImport(accepted),true);assert.equal(validImport({...accepted,game:'outro'}),false);assert.equal(validImport({...accepted,items:{'quase-honestos-v1':'{}'}}),false);
});
