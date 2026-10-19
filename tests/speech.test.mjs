import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {speechTiming,speechPlan,replyDuration,voiceProfiles} from '../src/speech-timing.js';
import {expressions} from '../src/mood.js';
test('Ritmo e duração acompanham personagem, emoção e tamanho da fala',()=>{
 assert.notEqual(speechTiming('nino','happy').pace,speechTiming('olga','happy').pace);
 assert.ok(speechTiming('bento','amused').pace<speechTiming('bento','hurt').pace);
 assert.equal(replyDuration('x'.repeat(900)),7500);assert.equal(replyDuration('Oi'),2800);
 assert.ok(replyDuration('Uma resposta mais longa, com pausas para você acompanhar o personagem.')>replyDuration('Oi'));
 for(const caller of Object.keys(voiceProfiles))for(const emotion of expressions){const pace=speechTiming(caller,emotion).pace;assert.ok(pace>=.25&&pace<=.55,`${caller}/${emotion}: ritmo legível`);}
 assert.equal(speechTiming('nino','happy',999999).duration,7.5);
 for(const caller of Object.keys(voiceProfiles))for(const emotion of expressions){const plan=speechPlan(caller,emotion,3850);assert.ok(Math.abs(plan.pace*plan.syllables-plan.duration)<1e-9);}
});
test('Personagens fazem murmúrio sem narrar o texto em voz alta',async()=>{
 const audio=await readFile(new URL('../src/audio.js',import.meta.url),'utf8');
 assert.doesNotMatch(audio,/SpeechSynthesisUtterance|speechSynthesis|function speakText/);
 assert.match(audio,/voice\.type=softVoices/);assert.match(audio,/createBiquadFilter/);assert.match(audio,/Murmúrio dos personagens/);
 assert.match(audio,/qh-speaking-start/);assert.match(audio,/qh-speaking-end/);assert.match(audio,/voice\.stop\(t\+pace\)/);
 assert.match(audio,/softVoices\.has\(caller\)\?'triangle':grittyVoices\.has\(caller\)\?'sawtooth':'square'/);
 assert.match(audio,/linearRampToValueAtTime\(\.4\*\(quieterVoices\.has\(caller\)\?1\.2:1\)\*characterVolume\/100/);assert.match(audio,/const quieterVoices=new Set\(\['davi','bento','caio','igor','rafa','golpista1','golpista5'\]\)/);assert.match(audio,/characterVolume=setting\('qh-character-volume',100\)/);
 const layout=await readFile(new URL('../src/style.css',import.meta.url),'utf8');assert.match(layout,/\.defense-typing span:nth-child\(1\)\{animation:defense-dot-wave \.84s ease-in-out 0s infinite/);assert.match(layout,/\.defense-typing span:nth-child\(2\)\{animation:defense-dot-wave \.84s ease-in-out \.16s infinite/);assert.match(layout,/\.defense-typing span:nth-child\(3\)\{animation:defense-dot-wave \.84s ease-in-out \.32s infinite/);assert.match(layout,/@keyframes defense-dot-wave/);assert.match(layout,/prefers-reduced-motion:reduce\)\{\.desktop \.defense-typing span:nth-child\(1\)\{animation:defense-dot-wave/);assert.match(layout,/\.defense-typing span\{width:6px;height:6px;border:0;border-radius:50%;background:#34775d;box-shadow:none;transform:none/);assert.match(layout,/border-radius:19px 19px 19px 7px/);assert.match(layout,/linear-gradient\(145deg,#fff 0%,#edf7f0 100%\)/);
});
test('Retratos falantes deixam a boca estática aberta para a animação sincronizada pelo áudio',async()=>{
 for(const caller of Object.keys(voiceProfiles))for(const emotion of expressions){const svg=await readFile(new URL(`../src/portraits/${caller}-${emotion}-talking.svg`,import.meta.url),'utf8');assert.match(svg,/\.mouth-rest\{opacity:0\}/);assert.match(svg,/\.mouth-speaking\{opacity:1\}/);assert.doesNotMatch(svg,/animation:(?:syllable|nod)/);assert.match(svg,/mouth-speaking/);assert.match(svg,/rx="12" ry="9"/);assert.match(svg,/class="speech-head"/);assert.equal((svg.match(/<g\b/g)||[]).length,(svg.match(/<\/g>/g)||[]).length,`${caller}/${emotion}: SVG com grupos fechados`);}
});
test('Luana e o contato da cobrança têm silhuetas bem distintas nos retratos parados e falando',async()=>{
 for(const caller of ['luana','golpista3'])for(const emotion of expressions)for(const suffix of ['', '-talking']){
  const svg=await readFile(new URL(`../src/portraits/${caller}-${emotion}${suffix}.svg`,import.meta.url),'utf8');assert.match(svg,/M25 27C19 30/);
 }
});
test('Rosto acompanha o ritmo do murmúrio mesmo com movimento reduzido, persiste após render e para ao ocultar a página',async()=>{
 const original={document:globalThis.document,matchMedia:globalThis.matchMedia,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};const events={};let end,animate,closeMouth;
 const img={src:''},label={textContent:''},avatar={dataset:{caller:'nino',expression:'happy'},querySelector:()=>img,classList:{toggle(){}},parentElement:{querySelector:()=>label}};
 try{
 globalThis.document={hidden:false,addEventListener:(name,cb)=>events[name]=cb,querySelectorAll:()=>[avatar]};globalThis.matchMedia=()=>({matches:true});globalThis.setTimeout=(cb,delay)=>{if(delay===1800)end=cb;else{assert.equal(delay,225,`boca fecha perto do fim da sílaba: ${delay}ms`);closeMouth=cb;}return 1;};globalThis.clearTimeout=()=>{};globalThis.setInterval=(cb,delay)=>{assert.equal(delay,300,`movimento labial segue o ritmo da fala: ${delay}ms`);animate=cb;return 2;};globalThis.clearInterval=()=>{};
 const {portraitSource,updatePortraits}=await import('../src/portrait-speech.js');
 events['qh-murmur']({detail:{caller:'nino',emotion:'happy',duration:1800}});assert.doesNotMatch(img.src,/-talking.svg$/);events['qh-speaking-start']({detail:{caller:'nino',emotion:'happy',duration:1800,pace:.3}});assert.match(img.src,/happy-talking.svg$/);assert.equal(label.textContent,'falando…');updatePortraits();assert.match(portraitSource('nino','happy'),/-talking/);closeMouth();assert.match(img.src,/nino-happy.svg$/);animate();assert.match(img.src,/happy-talking.svg$/);closeMouth();assert.match(img.src,/nino-happy.svg$/);end();assert.match(img.src,/nino-happy.svg$/);assert.equal(label.textContent,'animado');
 events['qh-speaking-start']({detail:{caller:'nino',emotion:'happy',duration:1800,pace:.3}});avatar.dataset.expression='confused';events['qh-speaking-expression']({detail:{caller:'nino',emotion:'confused'}});assert.match(img.src,/confused-talking.svg$/);assert.match(portraitSource('nino','confused'),/-talking/);document.hidden=true;events.visibilitychange();assert.doesNotMatch(img.src,/-talking/);
 }finally{Object.assign(globalThis,original);}
});

test('Retrato estático permanece até a imagem falante carregar e falha de asset não apaga o rosto',async()=>{
 const previous={document:globalThis.document,Image:globalThis.Image},events={},images=[];
 const img={src:'/src/portraits/yara-neutral.svg'},avatar={dataset:{caller:'yara',expression:'neutral'},querySelector:()=>img,classList:{toggle(){}},parentElement:{querySelector:()=>null}};
 try{
 globalThis.Image=class {constructor(){images.push(this);}};
 globalThis.document={hidden:false,addEventListener:(n,cb)=>events[n]=cb,querySelectorAll:()=>[avatar]};
 const speech=await import('../src/portrait-speech.js?loading-test');
 speech.updatePortraits();events['qh-murmur']({detail:{caller:'yara',emotion:'neutral',duration:2800}});events['qh-speaking-start']({detail:{caller:'yara',emotion:'neutral',duration:2800,pace:.3}});
 assert.equal(img.src,'/src/portraits/yara-neutral.svg');
 const talking=images.find(i=>i.src.endsWith('-talking.svg'));talking.onerror();assert.equal(speech.portraitSource('yara','neutral'),'/src/portraits/yara-neutral.svg');
 talking.onload();assert.equal(img.src,'/src/portraits/yara-neutral-talking.svg');events['qh-speaking-stop']();
 }finally{Object.assign(globalThis,previous);}
});
