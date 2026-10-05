import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {speechTiming,replyDuration,voiceProfiles} from '../src/speech-timing.js';
import {expressions} from '../src/mood.js';
test('Ritmo e duração acompanham personagem, emoção e tamanho da fala',()=>{
 assert.notEqual(speechTiming('nino','happy').pace,speechTiming('olga','happy').pace);
 assert.ok(speechTiming('bento','amused').pace<speechTiming('bento','hurt').pace);
 assert.equal(replyDuration('x'.repeat(900)),4400);assert.equal(replyDuration('Oi'),1400);
 assert.equal(speechTiming('nino','happy',999999).duration,4.4);
});
test('Retratos falantes mantêm emoção, boca articulada e opção de movimento reduzido',async()=>{
 for(const caller of Object.keys(voiceProfiles))for(const emotion of expressions){const svg=await readFile(new URL(`../src/portraits/${caller}-${emotion}-talking.svg`,import.meta.url),'utf8');assert.match(svg,/mouth-rest/);assert.match(svg,/mouth-speaking/);assert.match(svg,/class="speech-head"/);assert.match(svg,/prefers-reduced-motion/);assert.ok(svg.includes(`syllable ${speechTiming(caller,emotion).pace}s`));}
});
test('Rosto fala apenas durante a fala, persiste após render e para ao ocultar a página',async()=>{
 const original={document:globalThis.document,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};const events={};let end;
 const img={src:''},label={textContent:''},avatar={dataset:{caller:'nino',expression:'happy'},querySelector:()=>img,classList:{toggle(){}},parentElement:{querySelector:()=>label}};
 try{
 globalThis.document={hidden:false,addEventListener:(name,cb)=>events[name]=cb,querySelectorAll:()=>[avatar]};globalThis.setTimeout=cb=>{end=cb;return 1;};globalThis.clearTimeout=()=>{};
 const {portraitSource,updatePortraits}=await import('../src/portrait-speech.js');
 events['qh-murmur']({detail:{caller:'nino',emotion:'happy',duration:1800}});assert.match(img.src,/happy-talking.svg$/);assert.equal(label.textContent,'falando…');updatePortraits();assert.match(portraitSource('nino','happy'),/-talking/);end();assert.match(img.src,/nino-happy.svg$/);assert.equal(label.textContent,'animado');
 events['qh-murmur']({detail:{caller:'nino',emotion:'happy',duration:1800}});document.hidden=true;events.visibilitychange();assert.doesNotMatch(img.src,/-talking/);
 }finally{Object.assign(globalThis,original);}
});
