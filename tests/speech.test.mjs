import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {speechTiming,replyDuration,voiceProfiles} from '../src/speech-timing.js';
import {expressions} from '../src/mood.js';
test('Ritmo e duração acompanham personagem, emoção e tamanho da fala',()=>{
 assert.notEqual(speechTiming('nino','happy').pace,speechTiming('olga','happy').pace);
 assert.ok(speechTiming('bento','amused').pace<speechTiming('bento','hurt').pace);
 assert.equal(replyDuration('x'.repeat(900)),7500);assert.equal(replyDuration('Oi'),2800);
 assert.ok(replyDuration('Uma resposta mais longa, com pausas para você acompanhar o personagem.')>replyDuration('Oi'));
 for(const caller of Object.keys(voiceProfiles))for(const emotion of expressions){const pace=speechTiming(caller,emotion).pace;assert.ok(pace>=.25&&pace<=.55,`${caller}/${emotion}: ritmo legível`);}
 assert.equal(speechTiming('nino','happy',999999).duration,7.5);
});
test('Personagens fazem murmúrio sem narrar o texto em voz alta',async()=>{
 const audio=await readFile(new URL('../src/audio.js',import.meta.url),'utf8');
 assert.doesNotMatch(audio,/SpeechSynthesisUtterance|speechSynthesis|function speakText/);
 assert.match(audio,/voice\.type='sawtooth'/);assert.match(audio,/createBiquadFilter/);assert.match(audio,/Murmúrio dos personagens/);
});
test('Retratos falantes mantêm emoção, abrem a boca de forma visível e têm ritmo legível',async()=>{
 for(const caller of Object.keys(voiceProfiles))for(const emotion of expressions){const svg=await readFile(new URL(`../src/portraits/${caller}-${emotion}-talking.svg`,import.meta.url),'utf8');assert.match(svg,/mouth-rest/);assert.match(svg,/mouth-speaking/);assert.match(svg,/rx="12" ry="9"/);assert.match(svg,/class="speech-head"/);assert.match(svg,/prefers-reduced-motion/);assert.equal((svg.match(/<g\b/g)||[]).length,(svg.match(/<\/g>/g)||[]).length,`${caller}/${emotion}: SVG com grupos fechados`);assert.ok(svg.includes(`syllable ${speechTiming(caller,emotion).pace}s`));}
});
test('Luana e o contato da cobrança têm silhuetas bem distintas nos retratos parados e falando',async()=>{
 for(const caller of ['luana','golpista3'])for(const emotion of expressions)for(const suffix of ['', '-talking']){
  const svg=await readFile(new URL(`../src/portraits/${caller}-${emotion}${suffix}.svg`,import.meta.url),'utf8');assert.match(svg,/M25 27C19 30/);
 }
});
test('Rosto abre e fecha a boca enquanto o golpista murmura, persiste após render e para ao ocultar a página',async()=>{
 const original={document:globalThis.document,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};const events={};let end,animate;
 const img={src:''},label={textContent:''},avatar={dataset:{caller:'nino',expression:'happy'},querySelector:()=>img,classList:{toggle(){}},parentElement:{querySelector:()=>label}};
 try{
 globalThis.document={hidden:false,addEventListener:(name,cb)=>events[name]=cb,querySelectorAll:()=>[avatar]};globalThis.setTimeout=cb=>{end=cb;return 1;};globalThis.clearTimeout=()=>{};globalThis.setInterval=(cb,delay)=>{assert.ok(delay>=320,`movimento labial legível: ${delay}ms`);animate=cb;return 2;};globalThis.clearInterval=()=>{};
 const {portraitSource,updatePortraits}=await import('../src/portrait-speech.js');
 events['qh-murmur']({detail:{caller:'nino',emotion:'happy',duration:1800}});assert.match(img.src,/happy-talking.svg$/);assert.equal(label.textContent,'falando…');updatePortraits();assert.match(portraitSource('nino','happy'),/-talking/);animate();assert.match(img.src,/nino-happy.svg$/);animate();assert.match(img.src,/happy-talking.svg$/);end();assert.match(img.src,/nino-happy.svg$/);assert.equal(label.textContent,'animado');
 events['qh-murmur']({detail:{caller:'nino',emotion:'happy',duration:1800}});document.hidden=true;events.visibilitychange();assert.doesNotMatch(img.src,/-talking/);
 }finally{Object.assign(globalThis,original);}
});

test('Retrato estático permanece até a imagem falante carregar e falha de asset não apaga o rosto',async()=>{
 const previous={document:globalThis.document,Image:globalThis.Image},events={},images=[];
 const img={src:'/src/portraits/yara-neutral.svg'},avatar={dataset:{caller:'yara',expression:'neutral'},querySelector:()=>img,classList:{toggle(){}},parentElement:{querySelector:()=>null}};
 try{
 globalThis.Image=class {constructor(){images.push(this);}};
 globalThis.document={hidden:false,addEventListener:(n,cb)=>events[n]=cb,querySelectorAll:()=>[avatar]};
 const speech=await import('../src/portrait-speech.js?loading-test');
 speech.updatePortraits();events['qh-murmur']({detail:{caller:'yara',emotion:'neutral',duration:2800}});
 assert.equal(img.src,'/src/portraits/yara-neutral.svg');
 const talking=images.find(i=>i.src.endsWith('-talking.svg'));talking.onerror();assert.equal(speech.portraitSource('yara','neutral'),'/src/portraits/yara-neutral.svg');
 talking.onload();assert.equal(img.src,'/src/portraits/yara-neutral-talking.svg');events['qh-speaking-stop']();
 }finally{Object.assign(globalThis,previous);}
});
