import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createDevServer} from '../scripts/serve.mjs';

test('Um arquivo ausente retorna 404 sem derrubar a prévia nem enviar dois cabeçalhos',async t=>{
 const server=createDevServer();server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base='http://127.0.0.1:'+server.address().port;
 const missing=await fetch(base+'/not-an-asset.ico');assert.equal(missing.status,404);assert.equal(await missing.text(),'Não encontrado');
 const asset=await fetch(base+'/src/favicon.svg');assert.equal(asset.status,200);assert.match(await asset.text(),/<svg/);
 const page=await fetch(base+'/');assert.equal(page.status,200);assert.match(await page.text(),/Quase Honestos/);
});
