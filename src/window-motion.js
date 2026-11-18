// Animações estilo Windows para as janelas (abrir, maximizar, restaurar) e encaixe ao arrastar para o topo.
const app=document.getElementById('app');let rects=new Map();
const calm=()=>document.documentElement.classList.contains('qh-calm')||innerWidth<=780;
const snap=()=>{const m=new Map();app.querySelectorAll('.desktop-window[data-window-id]').forEach(el=>m.set(el.dataset.windowId,el.getBoundingClientRect()));return m;};
new MutationObserver(()=>{const next=snap();if(!calm())for(const [id,r] of next){const el=app.querySelector(`.desktop-window[data-window-id="${id}"]`);if(!el||el.classList.contains('window-dragging'))continue;const o=rects.get(id);
 if(!o){el.animate([{opacity:0,transform:'translateY(14px) scale(.94)'},{opacity:1,transform:'none'}],{duration:190,easing:'cubic-bezier(.2,.9,.3,1)'});continue;}
 const dx=o.left-r.left,dy=o.top-r.top,sx=o.width/r.width,sy=o.height/r.height;
 if(Math.abs(dx)+Math.abs(dy)>2||Math.abs(sx-1)>.02||Math.abs(sy-1)>.02){el.style.transformOrigin='0 0';el.animate([{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transform:'none'}],{duration:220,easing:'cubic-bezier(.2,.9,.3,1)'});}}
 rects=next;}).observe(app,{childList:true});
addEventListener('pointerup',()=>requestAnimationFrame(()=>{rects=snap();}),true);
addEventListener('resize',()=>{rects=snap();});
// Encaixe estilo Windows: topo = tela cheia, laterais = meia tela.
const B=()=>({l:8,t:36,r:innerWidth-8,b:innerHeight-57});
const zoneRect=z=>{const b=B(),w=(b.r-b.l)/2;return z==='max'?{left:b.l,top:b.t,width:b.r-b.l,height:b.b-b.t}:{left:z==='left'?b.l:b.l+w,top:b.t,width:w,height:b.b-b.t};};
const apply=(id,z)=>{if(!window.qhSnapWindow)return;if(z==='max')return window.qhSnapWindow(id,'max');const r=zoneRect(z);window.qhSnapWindow(id,{x:r.left,y:r.top,width:r.width,height:r.height});};
let hint,zone;const showHint=z=>{if(z===zone)return;zone=z;hint?.remove();hint=null;if(!z)return;hint=document.createElement('div');hint.className='qh-snap-hint';const r=zoneRect(z);Object.assign(hint.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',right:'auto',bottom:'auto'});document.body.append(hint);};
addEventListener('pointermove',e=>{const d=app.querySelector('.window-dragging');if(!d||innerWidth<=780)return showHint(null);showHint(e.clientY<=6?'max':e.clientX<=4?'left':e.clientX>=innerWidth-5?'right':null);});
addEventListener('pointerup',()=>{if(!zone)return;const z=zone;showHint(null);const d=app.querySelector('.window-dragging');const id=d?.dataset.windowId;if(id)setTimeout(()=>apply(id,z),0);},true);
// Ícones: ao soltar, desliza suave até a célula da grade.
let iconRects=null;const iconSnap=()=>{const m=new Map();app.querySelectorAll('.desktop-icons button[data-app]').forEach(b=>m.set(b.dataset.app,b.getBoundingClientRect()));return m;};
addEventListener('pointerup',()=>{if(app.querySelector('.desktop-icons button.dragging'))iconRects=iconSnap();},true);
new MutationObserver(()=>{if(!iconRects||calm()){iconRects=null;return;}const old=iconRects;iconRects=null;for(const [id,r] of iconSnap()){const o=old.get(id);if(!o)continue;const dx=o.left-r.left,dy=o.top-r.top;if(Math.abs(dx)+Math.abs(dy)<2)continue;app.querySelector(`.desktop-icons button[data-app="${id}"]`)?.animate([{transform:`translate(${dx}px,${dy}px) scale(1.04)`},{transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.3,1)'});}}).observe(app,{childList:true,subtree:true});
// Passar o mouse no botão de ampliar mostra os layouts de encaixe (Snap Layouts).
let fly,flyT;const closeFly=()=>{fly?.remove();fly=null;};
app.addEventListener('pointerover',e=>{const btn=e.target.closest?.('[data-max]');if(!btn||innerWidth<=780||e.pointerType==='touch')return;clearTimeout(flyT);flyT=setTimeout(()=>{closeFly();const id=btn.dataset.max,r=btn.getBoundingClientRect();fly=document.createElement('div');fly.className='qh-snap-fly';fly.setAttribute('role','menu');
 fly.innerHTML=[['left','Metade esquerda'],['max','Tela cheia'],['right','Metade direita']].map(([z,t])=>`<button type="button" role="menuitem" data-z="${z}" title="${t}" aria-label="${t}"><i class="z-${z}"></i></button>`).join('');
 fly.style.top=(r.bottom+6)+'px';fly.style.left=Math.max(8,Math.min(innerWidth-200,r.right-190))+'px';
 fly.onclick=ev=>{const b=ev.target.closest('[data-z]');if(b){closeFly();apply(id,b.dataset.z);}};fly.onpointerleave=()=>{flyT=setTimeout(closeFly,250);};fly.onpointerenter=()=>clearTimeout(flyT);document.body.append(fly);},450);});
app.addEventListener('pointerout',e=>{if(e.target.closest?.('[data-max]')){clearTimeout(flyT);if(fly)flyT=setTimeout(closeFly,300);}});
addEventListener('pointerdown',e=>{if(fly&&!fly.contains(e.target))closeFly();},true);
