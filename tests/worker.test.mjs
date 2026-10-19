import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
test('Worker entrega assets e mantém API separada do HTML',async()=>{
 const env={ASSETS:{fetch:async()=>new Response('jogo',{headers:{'Content-Type':'text/html'}})}};
 const root=await worker.fetch(new Request('https://example.com/'),env);assert.equal(await root.text(),'jogo');assert.equal(root.headers.get('Strict-Transport-Security'),'max-age=31536000');assert.equal(root.headers.get('X-Content-Type-Options'),'nosniff');assert.match(root.headers.get('Content-Security-Policy'),/default-src 'self'/);assert.match(root.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
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
  assert.equal(requested.at(-1),'/index-v20261018bd');
 }
 for(const path of ['/index-v20261015l','/index-v20261016l.html','/index-v20261016m','/index-v20261016m.html','/index-v20261016n','/index-v20261016n.html','/index-v20261016o','/index-v20261016o.html','/index-v20261016p','/index-v20261016p.html','/index-v20261016q','/index-v20261016q.html','/index-v20261016r','/index-v20261016r.html','/index-v20261016s','/index-v20261016s.html','/index-v20261016t','/index-v20261016t.html','/index-v20261016u','/index-v20261016u.html','/index-v20261016v','/index-v20261016v.html','/index-v20261016w','/index-v20261016w.html','/index-v20261016x','/index-v20261016x.html','/index-v20261016y','/index-v20261016y.html','/index-v20261016z','/index-v20261016z.html','/index-v20261016aa','/index-v20261016aa.html','/index-v20261016ab','/index-v20261016ab.html','/index-v20261016ac','/index-v20261016ac.html','/index-v20261017a','/index-v20261017a.html','/index-v20261017b','/index-v20261017b.html','/index-v20261017c','/index-v20261017c.html','/index-v20261017d','/index-v20261017d.html','/index-v20261017e','/index-v20261017e.html','/index-v20261017f','/index-v20261017f.html']){
  await worker.fetch(new Request(`https://example.com${path}`),env);
  assert.equal(requested.at(-1),'/index-v20261018bd');
 }
 for(const path of ['/index-v20261017g','/index-v20261017g.html','/index-v20261018a','/index-v20261018a.html','/index-v20261018b','/index-v20261018b.html','/index-v20261018c','/index-v20261018c.html','/index-v20261018d','/index-v20261018d.html','/index-v20261018e','/index-v20261018e.html','/index-v20261018f','/index-v20261018f.html','/index-v20261018g','/index-v20261018g.html','/index-v20261018h','/index-v20261018h.html','/index-v20261018i','/index-v20261018i.html','/index-v20261018j','/index-v20261018j.html','/index-v20261018k','/index-v20261018k.html']){
  await worker.fetch(new Request(`https://example.com${path}`),env);
  assert.equal(requested.at(-1),'/index-v20261018bd');
 }
 for(const path of ['/index-v20261018ab','/index-v20261018ab.html','/index-v20261018aa','/index-v20261018aa.html','/index-v20261018l','/index-v20261018l.html','/index-v20261018m','/index-v20261018m.html','/index-v20261018n','/index-v20261018n.html','/index-v20261018o','/index-v20261018o.html','/index-v20261018p','/index-v20261018p.html','/index-v20261018q','/index-v20261018q.html','/index-v20261018t','/index-v20261018t.html','/index-v20261018u','/index-v20261018u.html','/index-v20261018v','/index-v20261018v.html','/index-v20261018w','/index-v20261018w.html','/index-v20261018x','/index-v20261018x.html','/index-v20261018y','/index-v20261018y.html']){
  await worker.fetch(new Request(`https://example.com${path}`),env);
  assert.equal(requested.at(-1),'/index-v20261018bd');
 }
 await worker.fetch(new Request('https://example.com/index-v20261018ar'),env);assert.equal(requested.at(-1),'/index-v20261018bd');
 await worker.fetch(new Request('https://example.com/index-v20261018as'),env);assert.equal(requested.at(-1),'/index-v20261018bd');
 await worker.fetch(new Request('https://example.com/index-v20261018at'),env);assert.equal(requested.at(-1),'/index-v20261018bd');
 await worker.fetch(new Request('https://example.com/index-v20261018au'),env);assert.equal(requested.at(-1),'/index-v20261018bd');
 for(const path of ['/index-v20261018az','/index-v20261018az.html','/index-v20261018bd']){await worker.fetch(new Request(`https://example.com${path}`),env);assert.equal(requested.at(-1),'/index-v20261018bd');}
});

test('Endpoint aposentado não consulta binding mesmo que um ambiente antigo ainda o ofereça',async()=>{
 let calls=0;const env={DIALOGUE_AI_ENABLED:'true',Workers_AI:{run(){calls++;throw Error('Não pode chamar');}},ASSETS:{fetch:async()=>new Response('jogo')}};
 const r=await worker.fetch(new Request('https://example.com/api/dialogue',{method:'POST',body:'{}'}),env);assert.equal(r.status,410);assert.equal((await r.json()).mode,'scripted-choices');assert.equal(calls,0);
});
