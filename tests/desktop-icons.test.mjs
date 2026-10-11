import {test} from 'node:test';
import assert from 'node:assert/strict';
import {desktopIconPosition,initialDesktopIcons} from '../src/desktop-icons.js';
test('A drop in an intermediate desktop space stays there after reload',()=>{
 const viewport={width:1000,height:800},drop=desktopIconPosition({x:157,y:244},viewport);
 assert.deepEqual(drop,{x:157,y:244});
 assert.deepEqual(initialDesktopIcons(['calls'],{calls:drop},viewport).calls,drop);
});
test('Shortcuts remain above the taskbar and within a resized desktop',()=>{
 assert.deepEqual(desktopIconPosition({x:1600,y:1500},{width:800,height:600}),{x:690,y:437});
 const saved=initialDesktopIcons(['calls','files'],{calls:{x:-10,y:-30},files:{x:1000,y:900}},{width:800,height:600});
 assert.deepEqual(saved.calls,{x:18,y:65});assert.deepEqual(desktopIconPosition(saved.files,{width:800,height:600}),{x:690,y:437});
 assert.deepEqual(saved.files,{x:1000,y:900});
});
