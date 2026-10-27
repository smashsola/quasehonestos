// Local-only disposable fixtures for UI auditing. Never imported by the public game.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {revengeCases,revengeCaseFor,startRevenge,answerRevenge,advanceRevenge,beginRevengeScene,advanceRevengePlayback} from '../src/revenge.js';
import {furniture} from '../src/data.js';
import {incomingScenes} from '../src/incoming-scenes.js';
import {answerIncoming} from '../src/incoming.js';
import {fresh,KEY,migrateToDefense} from '../src/engine.js';
import {defensePeople,defenseCases,startDefenseCall,decideDefense,beginDefenseAction} from '../src/defense-round.js';
const root=path.resolve(import.meta.dirname,'../dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.wav':'audio/wav'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__qa-seed.js'){
   const state=fresh();migrateToDefense(state);state.audience=url.searchParams.get('band')==='child'?'child':'teen';
   if(['day','day-break'].includes(url.searchParams.get('scene'))){
    const day=Math.max(1,Math.min(5,Number(url.searchParams.get('day')||1))),count=day*5;
    state.tutorial='completed';state.credits=200;state.cursor=url.searchParams.get('scene')==='day'?count-1:count;
    state.history=state.caseOrder.slice(0,state.cursor).map(id=>{const index=defensePeople.findIndex(p=>p.caseId===id),p=defensePeople[index],a=startDefenseCall(index);decideDefense(a,defenseCases[p.caseId].choices.find(c=>c.safe).id);return {...a};});
    if(url.searchParams.get('scene')==='day'){state.active=startDefenseCall(defensePeople.findIndex(p=>p.caseId===state.caseOrder[state.cursor]));Object.assign(state.active,{chatStage:'ready',chatVisible:1,murmurHeard:true});}
    else state.dayBreak={completedDay:day,cursor:count};
   }else if(['ending','last'].includes(url.searchParams.get('scene'))){
    state.finished=true;state.cursor=defensePeople.length;state.tutorial='completed';
    const safe=Number(url.searchParams.get('safe')||8);
    state.history=defensePeople.map((p,i)=>{const a=startDefenseCall(i),choice=defenseCases[p.caseId].choices.find(c=>c.safe===(i<safe));decideDefense(a,choice.id);return {...a,caseId:p.caseId,outcome:i<safe?'blocked':'fooled',gameOver:false};});
    if(url.searchParams.get('scene')==='last'){state.finished=false;state.cursor=9;state.history=state.history.slice(0,9);state.active=startDefenseCall(9);Object.assign(state.active,{chatStage:'ready',chatVisible:1,murmurHeard:true});}
   }else if(['action','ready','revenge','outcome'].includes(url.searchParams.get('scene'))){
    const id=url.searchParams.get('id'),index=defensePeople.findIndex(p=>defenseCases[p.caseId].choices.some(c=>c.id===id));
    if(index<0)throw Error('Unknown action');state.cursor=index;state.tutorial='completed';state.active=startDefenseCall(index,state.audience);Object.assign(state.active,{chatStage:'ready',chatVisible:1,murmurHeard:true});
    if(url.searchParams.get('scene')==='revenge'){decideDefense(state.active,id);startRevenge(state);for(let i=0;i<Number(url.searchParams.get('quiz')??3);i++){answerRevenge(state,i,revengeCaseFor(state.active).questions[i].correct);advanceRevenge(state);}}
    if(url.searchParams.has('rvstage')&&state.active.revenge?.phase==='ready'){const stage=Number(url.searchParams.get('rvstage')),baseTime=Date.now()-stage*3000;beginRevengeScene(state);advanceRevengePlayback(state,baseTime);for(let n=1;n<=stage;n++)advanceRevengePlayback(state,baseTime+n*3000);}
    if(url.searchParams.get('scene')==='outcome')decideDefense(state.active,id);
    if(url.searchParams.get('scene')==='action')beginDefenseAction(state.active,id,Date.now()-Number(url.searchParams.get('elapsed')||0));
   }else if(url.searchParams.get('scene')==='choice'){
    state.active=startDefenseCall(0);Object.assign(state.active,{chatStage:'ready',chatVisible:1,murmurHeard:true});
   }
   if(url.searchParams.has('tutorial')){state.cursor=0;state.tutorial='defense';state.tutorialCollapsed=url.searchParams.has('collapsed');if(state.active){state.active.mechanicUsed=url.searchParams.has('hint');state.active.tutorialCluesSeen=url.searchParams.has('clues');}}
   if(state.active){state.active.balanceEligible=true;state.credits=Number(url.searchParams.get('credits')??200);}
   if(url.searchParams.has('mail'))state.incoming={nextAt:null,pending:{id:'qa-mail',scene:'support',sender:'Chefia · número novíssimo',arrivedAt:Date.now(),open:false,result:null},history:[],seen:[]};
   if(url.searchParams.get('owned')==='all'){state.decor=furniture.map(p=>p.id);state.credits=5000;state.wallpaper='arcade';}
   if(url.searchParams.get('mail')==='history'){state.incoming={nextAt:null,pending:null,history:[],seen:[]};for(const [n,id]of ['support','cloud'].entries()){state.incoming.pending={id:'qa-history-'+n,scene:id,variant:'office',sender:id==='support'?'Chefia · número novo':'Nuvem da firma',day:1,open:true};answerIncoming(state,id==='support'?'known':'check');state.incoming.pending=null;}}
   if(url.searchParams.has('answered')&&state.incoming?.pending){state.incoming.pending.variant='office';state.incoming.pending.open=true;answerIncoming(state,'known');}
   if(url.searchParams.has('mail')&&incomingScenes[url.searchParams.get('mail')]){const id=url.searchParams.get('mail');state.incoming.pending.scene=id;state.incoming.pending.sender=incomingScenes[id].sender;state.incoming.pending.audience=state.audience;}
   if(url.searchParams.get('app')==='boss'&&state.incoming?.pending)state.incoming.pending.open=true;
   if(url.searchParams.has('credits'))state.credits=Number(url.searchParams.get('credits'));
   const entry=(await readFile(path.join(root,'index.html'),'utf8')).match(/\/src\/game-[^"]+\.js/)[0];
   const profileMode=url.searchParams.get('scene')==='profile',termsMode=url.searchParams.get('scene')==='terms';
   const script=`import {localStore} from '/src/safe-storage.js';document.documentElement.dataset.bootReady='true';localStore.setItem('qh-player-name','Teste QA');localStore.setItem('qh-player-avatar','bia');localStore.setItem('qh-player-age-band',${JSON.stringify(state.audience)});localStore.setItem(${JSON.stringify(KEY)},${JSON.stringify(JSON.stringify(state))});localStore.setItem('qh-privacy-notice','2026-10-26-age-bands');localStore.setItem('qh-window-views','{}');localStore.setItem('qh-windows',JSON.stringify({calls:{x:264,y:46,width:560,z:2,hidden:false,max:${url.searchParams.has('max')}}}));${profileMode?"localStore.removeItem('qh-player-name');localStore.removeItem('qh-player-avatar');localStore.removeItem('qh-player-age-band');":''}${termsMode?"localStore.removeItem('qh-privacy-notice');":''}await import('${entry}');${url.searchParams.has('app')?"document.addEventListener('qh-player-login',()=>setTimeout(()=>document.querySelector('[data-icon=\""+url.searchParams.get('app')+"\"]')?.click(),50),{once:true});":''}`;
   res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});res.end(script);return;
  }
  const fixture=url.pathname==='/__qa';
  const file=path.resolve(root,fixture||url.pathname==='/'?'index.html':url.pathname.slice(1));
  if(!file.startsWith(root+path.sep))throw Error('Outside');
  let content=await readFile(file);
  if(fixture)content=content.toString().replace(/\/src\/game-[^"]+\.js/,'/__qa-seed.js'+url.search.replaceAll('&','&amp;')).replace(/<section id="os-boot"[\s\S]*?<\/section>/,'').replace(/<script[^>]+src="\/src\/boot.js"[^>]*><\/script>/,'');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);
 }catch(error){res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.QA_PORT||4183),'127.0.0.1',()=>console.log('Preview http://127.0.0.1:4183'));

