import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
test('Worker entrega assets e mantém API separada do HTML',async()=>{
 const env={ASSETS:{fetch:async()=>new Response('jogo')}};
 assert.equal(await (await worker.fetch(new Request('https://example.com/'),env)).text(),'jogo');
 assert.equal((await worker.fetch(new Request('https://example.com/api/missing'),env)).status,404);
 assert.equal((await worker.fetch(new Request('https://example.com/api/dialogue'),env)).status,405);
 const request=new Request('https://example.com/api/dialogue',{method:'POST',headers:{Origin:'https://example.com'}});
 assert.equal((await worker.fetch(request,env)).status,410);
});

test('Endereços de versões antigas chegam à versão atual sem redirecionar a si mesmos',async()=>{
 const requested=[];const env={ASSETS:{fetch:async request=>{requested.push(new URL(request.url).pathname);return new Response('<!doctype html>',{headers:{'Content-Type':'text/html'}});}}};
 for(const version of ['f','g','h','i','j','k','l']){
  const response=await worker.fetch(new Request(`https://example.com/index-v20261015${version}`),env);
  assert.equal(response.status,200);
  assert.equal(requested.at(-1),'/index-v20261016q.html');
 }
 for(const path of ['/index-v20261015l','/index-v20261016l.html','/index-v20261016m','/index-v20261016m.html','/index-v20261016n','/index-v20261016n.html','/index-v20261016o','/index-v20261016o.html','/index-v20261016p','/index-v20261016p.html']){
  await worker.fetch(new Request(`https://example.com${path}`),env);
  assert.equal(requested.at(-1),'/index-v20261016q.html');
 }
 await worker.fetch(new Request('https://example.com/index-v20261016q'),env);
 assert.equal(requested.at(-1),'/index-v20261016q');
 await worker.fetch(new Request('https://example.com/index-v20261016q.html'),env);
 assert.equal(requested.at(-1),'/index-v20261016q.html');
});

test('Endpoint aposentado não consulta binding mesmo que um ambiente antigo ainda o ofereça',async()=>{
 let calls=0;const env={DIALOGUE_AI_ENABLED:'true',Workers_AI:{run(){calls++;throw Error('Não pode chamar');}},ASSETS:{fetch:async()=>new Response('jogo')}};
 const r=await worker.fetch(new Request('https://example.com/api/dialogue',{method:'POST',body:'{}'}),env);assert.equal(r.status,410);assert.equal((await r.json()).mode,'scripted-choices');assert.equal(calls,0);
});
