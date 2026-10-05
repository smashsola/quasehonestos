import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
test('Worker entrega assets e mantém API separada do HTML',async()=>{
 const env={ASSETS:{fetch:async()=>new Response('jogo')}};
 assert.equal(await (await worker.fetch(new Request('https://example.com/'),env)).text(),'jogo');
 assert.equal((await worker.fetch(new Request('https://example.com/api/missing'),env)).status,404);
 assert.equal((await worker.fetch(new Request('https://example.com/api/dialogue'),env)).status,405);
 const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com'}});
 assert.equal((await worker.fetch(request,env)).status,503);
});
