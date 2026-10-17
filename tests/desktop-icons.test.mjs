import {test} from 'node:test';
import assert from 'node:assert/strict';
import {desktopIconPosition,initialDesktopIcons} from '../src/desktop-icons.js';
const viewport={width:1000,height:800};
test('Drop encaixa na grade; movimento do ponteiro continua livre',()=>{
 const drop=desktopIconPosition({x:157,y:244},viewport);assert.deepEqual(drop,{x:138,y:269});
 assert.deepEqual(desktopIconPosition({x:157,y:244},viewport,{snap:false}),{x:157,y:244});
 assert.deepEqual(initialDesktopIcons(['calls'],{calls:drop},viewport).calls,drop);
});
test('Ícone ocupado recebe célula livre próxima e save antigo livre é alinhado',()=>{
 const occupied=[{x:138,y:269}],drop=desktopIconPosition({x:138,y:269},viewport,{occupied});assert.notDeepEqual(drop,occupied[0]);
 const positions=initialDesktopIcons(['calls','files','club'],{calls:{x:155,y:244},files:{x:156,y:243},club:{x:1000,y:900}},viewport);assert.equal(new Set(Object.values(positions).map(p=>`${p.x}:${p.y}`)).size,3);
 for(const p of Object.values(positions)){assert.equal((p.x-18)%120,0);assert.equal((p.y-65)%102,0);assert.ok(p.x<=890&&p.y<=637);}
});
test('Ícones permanecem dentro do desktop acima da barra',()=>{
 assert.deepEqual(desktopIconPosition({x:1600,y:1500},{width:800,height:600}),{x:618,y:371});
 const ids=Array.from({length:11},(_,i)=>String(i)),positions=initialDesktopIcons(ids,{},viewport);assert.equal(new Set(Object.values(positions).map(p=>JSON.stringify(p))).size,ids.length);
});
test('Grade do PC se rearranja ao encolher a janela sem sobrepor ícones nem passar da tela',()=>{
 const ids=Array.from({length:12},(_,i)=>`app-${i}`),saved=initialDesktopIcons(ids,{},viewport),small={width:620,height:460},reflowed=initialDesktopIcons(ids,saved,small);
 assert.equal(new Set(Object.values(reflowed).map(p=>`${p.x}:${p.y}`)).size,ids.length);
 for(const p of Object.values(reflowed)){assert.ok(p.x>=18&&p.x<=small.width-110);assert.ok(p.y>=65&&p.y<=small.height-163);assert.equal((p.x-18)%120,0);assert.equal((p.y-65)%102,0);}
});
test('Grade do PC mantém duas colunas no desktop comum para liberar área às janelas',()=>{
 const ids=Array.from({length:12},(_,i)=>`app-${i}`),positions=initialDesktopIcons(ids,{}, {width:1280,height:720});
 assert.equal(new Set(Object.values(positions).map(p=>p.x)).size,2);
 for(const p of Object.values(positions))assert.ok(p.y+88<=720-57);
});
