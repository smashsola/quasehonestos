import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {voiceProfiles} from '../src/speech-timing.js';
const source=readFileSync(new URL('../src/audio.js',import.meta.url),'utf8').split('// The selected player voice answers')[1];
test('All ten selected avatars answer after the enemy and cancel on exit',()=>{
 const ids=['bia','luana','yara','pri','olga','enzo','igor','leo','nino','caio'];
 assert.equal(new Set(ids.map(id=>JSON.stringify(voiceProfiles[id]))).size,10);
 for(const id of ids){
 const listeners={},heard=[];const panel={isConnected:true,querySelector(selector){if(selector.includes('enemy .avatar'))return {dataset:{caller:'golpista1'}};if(selector.includes('player-speaker'))return {dataset:{caller:id}};return {textContent:'A fictional line'};}};
 const document={hidden:false,querySelector:()=>panel,addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),dispatchEvent(e){if(e.type==='qh-murmur')heard.push(e.detail);for(const fn of listeners[e.type]||[])fn(e);}};
 vm.runInNewContext('// The selected player voice answers'+source,{document,replyDuration:()=>3000,CustomEvent:class{constructor(type,args={}){this.type=type;this.detail=args.detail;}}});
 document.dispatchEvent({type:'qh-revenge-dialogue'});assert.equal(heard[0].caller,'golpista1');
 document.dispatchEvent({type:'qh-speaking-end',detail:{caller:'other'}});assert.equal(heard.length,1);
 document.dispatchEvent({type:'qh-speaking-end',detail:{caller:'golpista1'}});assert.equal(heard[1].caller,id);assert.equal(heard[1].emotion,'amused');
 document.dispatchEvent({type:'qh-speaking-end',detail:{caller:'golpista1'}});assert.equal(heard.length,2);
 document.dispatchEvent({type:'qh-revenge-dialogue'});document.dispatchEvent({type:'qh-speaking-stop'});document.dispatchEvent({type:'qh-speaking-end',detail:{caller:'golpista1'}});assert.equal(heard.length,3);
 }
});
