import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {speechTiming} from '../src/speech-timing.js';
const out=fileURLToPath(new URL('../src/portraits/',import.meta.url));await mkdir(out,{recursive:true});
const people={bia:['#e4a4bd','#a9694f','#422d31','#6042a0'],caio:['#78b9d1','#d6a37b','#302c37','#36748c'],luana:['#dda96c','#f0c39a','#653d30','#517a53'],igor:['#8bc9a9','#905d49','#262c31','#5d5791'],maya:['#b8a3db','#a96f53','#3d282b','#a65678'],leo:['#e38d78','#e0ad84','#59432c','#496f86']};
const moods={neutral:'M41 60h14',happy:'M39 59q9 10 18 0',suspicious:'M40 62q8-6 16 0',thinking:'M41 61q8-4 14 0',angry:'M40 62q8-7 16 0',amused:'M38 58q10 13 20 0',confused:'M40 62q8-4 16 1',surprised:'M48 57q7 0 7 6t-7 6q-7 0-7-6t7-6',hurt:'M40 63q8-7 16 0'};
const brows={neutral:'M32 39h9m14 0h9',happy:'M32 39q5-3 9 0m14 0q5-3 9 0',suspicious:'M32 37l9 2m14 0 9-3',thinking:'M32 39h9m14 0 9-4',angry:'M32 41l9-4m14 4 9-4',amused:'M32 39h9m14 0h9',confused:'M32 38l9 2m14-2 9 2',surprised:'M32 35q5-4 9 0m14 0q5-4 9 0',hurt:'M32 38q5 3 9 1m14-1q5-2 9-1'};
const expr=Object.keys(moods);
for(const [id,[bg,skin,hair,shirt]] of Object.entries(people))for(const emotion of expr){
 const mouth=moods[emotion],brow=brows[emotion];
 const base=`<rect width="96" height="96" rx="16" fill="${bg}"/><circle cx="75" cy="18" r="28" fill="#ffffff25"/><path d="M12 96Q14 70 38 70h20Q82 72 84 96" fill="${shirt}"/><path d="M40 60h16v16Q48 83 40 76" fill="${skin}"/><ellipse cx="48" cy="44" rx="23" ry="27" fill="${skin}"/><path d="M24 42V28Q28 12 49 15L66 13 63 22Q78 23 71 43L62 33 34 31Z" fill="${hair}"/><path d="${brow}" stroke="${hair}" stroke-width="2" stroke-linecap="round"/><g fill="#29303b"><circle cx="37" cy="46" r="2.2"/><circle cx="59" cy="46" r="2.2"/></g><path d="M47 46l-2 9h5" fill="none" stroke="#543a3a55" stroke-width="2"/>`;
 const tail=`<path d="${mouth}" fill="none" stroke="#713f43" stroke-width="2.2" stroke-linecap="round"/>`;
 await writeFile(`${out}${id}-${emotion}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${base}${tail}</svg>`);
 const pace=String(speechTiming(id,emotion).pace);
 const animation=`<style>.speech-head{transform-origin:48px 72px;animation:nod 1.8s ease-in-out infinite}.mouth-rest{animation:closed ${pace}s steps(1,end) infinite}.mouth-speaking{transform-origin:48px 62px;animation:syllable ${pace}s ease-out infinite}@keyframes closed{0%,80%,100%{opacity:1}10%,65%{opacity:0}}@keyframes syllable{0%,80%,100%{opacity:0;transform:scaleY(.15)}10%,65%{opacity:1;transform:scaleY(.95)}35%{opacity:1;transform:scaleY(.6)}}@keyframes nod{0%,100%{transform:rotate(-.5deg)}50%{transform:rotate(.7deg) translateY(-.5px)}}@media(prefers-reduced-motion:reduce){.speech-head{animation:none}}</style>`;
 const head=base.slice(base.indexOf('<path d="M40 60'),base.indexOf('</g><path d="M47'));
 const talking=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${animation}<rect width="96" height="96" rx="16" fill="${bg}"/><circle cx="75" cy="18" r="28" fill="#ffffff25"/><path d="M12 96Q14 70 38 70h20Q82 72 84 96" fill="${shirt}"/><g class="speech-head">${head}<path d="M47 46l-2 9h5" fill="none" stroke="#543a3a55" stroke-width="2"/><g class="mouth-rest"><path d="${mouth}" fill="none" stroke="#713f43" stroke-width="2.2" stroke-linecap="round"/></g><g class="mouth-speaking"><ellipse cx="48" cy="62" rx="7" ry="5.2" fill="#653f3d"/><path d="M44 59h8" stroke="#fff0d5" stroke-width="2"/><path d="M45 65q3-2 6 0" stroke="#d99388" stroke-width="1.5"/></g></g></svg>`;
 await writeFile(`${out}${id}-${emotion}-talking.svg`,talking);
}
console.log('Generated six defense characters with nine expressions and speaking portraits.');
