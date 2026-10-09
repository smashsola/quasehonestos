import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,buy,equipWallpaper,load} from '../src/engine.js';
import {furniture,schemes} from '../src/data.js';
test('Ganhos novos financiam compras de faixas diferentes',()=>{
 assert.deepEqual(schemes.map(s=>s.payout),[300,400,250,350,450]);
 assert.equal(new Set(furniture.map(item=>item.id)).size,10);
 assert.ok(furniture.some(item=>item.price<250));assert.ok(furniture.some(item=>item.price>400));
});
test('Compra usa preço do catálogo, não permite duplicar ou gastar além do saldo',()=>{
 const s=fresh();s.credits=300;
 assert.equal(buy(s,{id:'coffee',price:-100}),true);assert.equal(s.credits,180);
 assert.equal(buy(s,{id:'coffee'}),false);assert.equal(buy(s,{id:'aquarium'}),false);assert.equal(buy(s,{id:'invented',price:0}),false);assert.equal(s.credits,180);
});
test('Temas comprados são aplicados, trocados e preservados no salvamento',()=>{
 const s=fresh();s.credits=1000;assert.equal(equipWallpaper(s,'night'),false);
 assert.equal(buy(s,furniture.find(item=>item.id==='night')),true);assert.equal(s.wallpaper,'night');assert.equal(s.credits,680);
 assert.equal(buy(s,furniture.find(item=>item.id==='sunset')),true);assert.equal(s.wallpaper,'sunset');assert.equal(equipWallpaper(s,'night'),true);assert.equal(equipWallpaper(s,'coffee'),false);
 const restored=load({getItem:()=>JSON.stringify(s)});assert.deepEqual(restored.decor,['night','sunset']);assert.equal(restored.wallpaper,'night');assert.equal(restored.credits,420);assert.equal(equipWallpaper(restored,'default'),true);assert.equal(restored.credits,420);
});
