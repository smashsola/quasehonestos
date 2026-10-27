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
 if(!portrait){portrait=document.createElement('div');portrait.className='session-owner-photo';portrait.setAttribute('role','img');}
 owner.prepend(portrait);owner.classList.add('session-owner');portrait.setAttribute('aria-label','Seu bonequinho: '+playerMoodLabels[mood]);portrait.title='Humor do saldo: '+playerMoodLabels[mood];
 if(id===portraitId){if(mood!==faceTarget)animateFace(mood);return;}
 portraitId=id;faceTarget=mood;face=null;cancelAnimationFrame(faceFrame);const request=++faceLoad;
 portrait.style.backgroundImage=`url('/src/portraits/${id}-balance-${mood}.svg')`;portrait.style.backgroundSize='cover';
 fetch(`/src/portraits/${id}-balance-neutral.svg`).then(response=>{if(!response.ok)throw Error('portrait');return response.text();}).then(source=>{
  if(request!==faceLoad)return;
  const svg=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;
  svg.setAttribute('aria-hidden','true');svg.setAttribute('width','100%');svg.setAttribute('height','100%');
  const paths=[...svg.querySelectorAll('path')];paths.find(path=>path.getAttribute('d')?.startsWith('M41 61'))?.remove();
  paths.find(path=>path.getAttribute('d')?.startsWith('M32 39'))?.remove();
  svg.querySelectorAll('g[fill="#29303b"]').forEach(group=>group.remove());
  const make=(attributes)=>{const node=document.createElementNS(svgNS,'path');for(const [key,value]of Object.entries(attributes))node.setAttribute(key,value);svg.append(node);return node;};
  const mouth=make({fill:'#713f43',stroke:'#713f43','stroke-width':'2.2','stroke-linejoin':'round'}),eyes=[0,1].map(()=>make({fill:'none',stroke:'#29303b','stroke-width':'3.8','stroke-linecap':'round'})),brows=make({fill:'none',stroke:'#655048','stroke-width':'2','stroke-linecap':'round'});
  face={mouth,eyes,brows,values:[...faceStates[faceTarget]]};paintFace(face.values);portrait.replaceChildren(svg);portrait.style.backgroundImage='none';
 }).catch(()=>{});
}
