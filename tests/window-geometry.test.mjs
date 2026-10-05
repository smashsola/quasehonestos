import test from 'node:test';
import assert from 'node:assert/strict';
import {fitWindow,resizeWindow} from '../src/window-geometry.js';
test('Janela restaurada cabe no desktop sem cobrir a barra de tarefas',()=>{
 const r=fitWindow({x:1100,y:650,width:700,height:650},{width:1280,height:720});
 assert.ok(r.x+r.width<=1272);assert.ok(r.y+r.height<=663);assert.ok(r.y>=36);
});
test('Redimensionamento lateral e inferior afetam apenas o eixo arrastado',()=>{
 const r={x:170,y:65,width:490,height:500},v={width:1280,height:720};
 assert.deepEqual(resizeWindow(r,{x:60,y:100},'x',v),{...r,width:550});
 assert.deepEqual(resizeWindow(r,{x:60,y:40},'y',v),{...r,height:540});
});
test('Canto cresce até a área livre e diminui até o mínimo disponível',()=>{
 const r={x:900,y:500,width:360,height:160},v={width:1280,height:720};
 const large=resizeWindow(r,{x:999,y:999},undefined,v);assert.equal(large.width,372);assert.equal(large.height,163);
 const small=resizeWindow(r,{x:-999,y:-999},undefined,v);assert.equal(small.width,360);assert.equal(small.height,163);
 const compact=fitWindow({...r,width:9999,height:9999},{width:320,height:300});assert.equal(compact.width,304);assert.equal(compact.height,207);
});
