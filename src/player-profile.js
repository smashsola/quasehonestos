export function playerBalanceMood(balance){
 const value=Number.isFinite(balance)?balance:0;
 if(value>=500)return 'happy';
 if(value>0)return 'smile';
 if(value===0)return 'neutral';
 if(value>=-200)return 'worried';
 return 'sad';
}
export const playerMoodLabels={happy:'radiante',smile:'contente',neutral:'tranquilo',worried:'preocupado',sad:'arrasado'};

const faceStates={happy:[58,65,75,-3,0],smile:[59,64,67,0,0],neutral:[61,61,61,0,0],worried:[63,57,58,1,3],sad:[64,54,55,2,5]};
let portrait=null,portraitId=null,face=null,faceTarget='neutral',faceFrame=0,faceLoad=0;
const svgNS='http://www.w3.org/2000/svg';
function paintFace(values){
 if(!face)return;
 const [corner,upper,lower,eye,brow]=values;
 face.mouth.setAttribute('d',`M39 ${corner} C44 ${upper} 52 ${upper} 57 ${corner} C52 ${lower} 44 ${lower} 39 ${corner}Z`);
 face.eyes[0].setAttribute('d',`M35 46 Q37 ${46+eye} 39 46`);face.eyes[1].setAttribute('d',`M57 46 Q59 ${46+eye} 61 46`);
 face.brows.setAttribute('d',`M32 ${39+brow/2} L41 ${39-brow/2} M55 ${39-brow/2} L64 ${39+brow/2}`);
 face.values=values;
}
function animateFace(mood){
 faceTarget=mood;if(!face)return;cancelAnimationFrame(faceFrame);
 const from=[...face.values],to=faceStates[mood]||faceStates.neutral,start=performance.now();
 const duration=750;
 function tick(now){const t=duration?Math.min(1,(now-start)/duration):1,ease=t*t*(3-2*t);paintFace(to.map((value,i)=>from[i]+(value-from[i])*ease));if(t<1)faceFrame=requestAnimationFrame(tick);}
 faceFrame=requestAnimationFrame(tick);
}
export function mountPlayerPortrait(owner,id,mood){
 if(!owner||!['bia','luana','yara','pri','olga','enzo','igor','leo','nino','caio'].includes(id))return;
 if(!portrait||portrait.tagName!=='IMG'){portrait=document.createElement('img');portrait.className='session-owner-photo';portrait.width=72;portrait.height=72;portrait.decoding='async';portrait.onerror=()=>{portrait.onerror=null;portrait.src=`/src/portraits/${id}-balance-neutral.svg`;};}
 owner.prepend(portrait);owner.classList.add('session-owner');portrait.alt='Seu bonequinho: '+playerMoodLabels[mood];portrait.title='Humor do saldo: '+playerMoodLabels[mood];
 const source=`/src/portraits/${id}-balance-${['happy','smile','neutral','worried','sad'].includes(mood)?mood:'neutral'}.svg`;
 if(portrait.dataset.source!==source){portrait.dataset.source=source;portrait.src=source;}
 portraitId=id;faceTarget=mood;
}
