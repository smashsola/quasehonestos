import {shopContent as renderShop} from './shop-view.js';
import {welcomeStory} from './welcome-story.js';
import {dayCategory} from './case-categories.js';
import {mailMessageView,mailMoney} from './mail-view.js';
import {defenseCaseFor} from './defense-round.js';
import {requiresScamInteraction} from './interaction-policy.js';
import {campaignDay,campaignDaysView,campaignDayBreakView,advanceCampaignDay} from './campaign-days.js';
import {expandedById} from './expanded-scams.js';
import {beginScamInteraction,actScamInteraction,expireScamInteraction} from './scam-interaction.js';
import {createReactionSummary} from './reaction-summary.js';
const syncReactionSummary=createReactionSummary();
import {captureRevengeLayout,restoreRevengeLayout,syncRevengeEntrances} from './revenge-layout.js';
import {installMoneyFeedback,revengeMissFeedback} from './money-feedback.js';
import {startRevenge,answerRevenge,advanceRevenge,finishRevenge,closeRevenge,beginRevengeScene,actRevengeScene,tickRevengeScene,advanceRevengePlayback,revengeAdvanceGate,revengeSceneDuration} from './revenge.js';
import {playerBalanceMood,playerMoodLabels,mountPlayerPortrait} from './player-profile.js';
import {createActionPlayback} from './action-playback.js';
import {localStore as localStorage,sessionStore as sessionStorage,storageStatus} from './safe-storage.js';
import {classroomPanel,beginClassSession,answerClassAssessment,finishClassPlay,learningReport} from './classroom-session.js';
import {inspectFollowup,respondFollowup,setFollowupRelation} from './story-continuity.js';
import {mobileNavigation,installViewport,readingPosition,compactScreen} from './mobile-ui.js';
import {educationalReplay} from './educational-replay.js';
import {defensePanel,defenseSourcePanel,inspectDefense,resolveDefense} from './defense-investigation.js';
import {settleTutorialGrant,tutorialPanel,tutorialAction,applyTutorialHighlights,tutorialWindowRect} from './tutorial.js';
import {informationCard} from './information-card.js';
import './network.js';
import './privacy.js';
import {cloneContent,sendCloneLink,reviewClonedCard} from './clone-card.js';
import {looksPersonal,redactSensitiveText} from './privacy-data.js';
import {shiftEnding,bossQuestions} from './shift-ending.js';
import {offerPicker,chooseOffer,selectedOffer,verifyOperationCode,runRemoteDiagnostic,operationReady,clubPassPanel} from './app-interactions.js';
import {codeFeedback} from './app-feedback.js';
import {portraitSource,updatePortraits} from './portrait-speech.js';
import {replyDuration} from './speech-timing.js';
import {walletAccountPanel} from './prize-wallet.js';
import {characterOpening} from './character-openings.js';
import {officeIcon} from './office-icons.js';
import {nextObjective} from './conversation-context.js';
import {dialogueOptions,applyDialogueOption} from './dialogue-options.js';
import {playConversation,defenseVisible} from './conversation-playback.js';
import {fitWindow,resizeWindow} from './window-geometry.js';
import {desktopIconPosition,initialDesktopIcons} from './desktop-icons.js';
import {moveMobileIcon,normalizeMobileIconOrder} from './mobile-icon-grid.js';
import {resultImpact,consequenceCard,resultReport} from './result-impact.js';
import {defenseResultsContent,mailIcon,flowPanel,filesContent,mailContent,helpContent,updateContent} from './app-content.js';
import {trustAppearance,savedExpression,expressionNames} from './mood.js';
import {remoteProfiles} from './remote-profiles.js';
import {checkIncoming,markIncomingSeen,answerIncoming,dismissIncoming,snoozeIncoming} from './incoming.js';
import {dialogueHints} from './dialogue.js';
import {incomingScene,refreshIncoming,incomingReport} from './incoming-scenes.js';
import {callers,moves,bossLines,schemes,furniture,interactionMoves,schemeItems} from './data.js';
import {defensePeople,scammerPeople,defenseCases,defenseActionSounds,settleDefenseLoss,startDefenseCall,resumeDefenseCall,finishDefenseMurmur,beginDefenseAction,decideDefense,stopRansomware,endDefenseContact,expireRansomware,useDefenseMechanic} from './defense-round.js';
import {defenseView,defenseCampaignEnding,defenseActionDuration} from './defense-view.js';
import {load,KEY,nextCall,applyMove,closeCall,finishCall,fresh,migrateToDefense,buy,equipWallpaper,availableMoves,executeScheme,disconnectSession,sendUpdateFile,reviewUpdateData,chooseSkin} from './engine.js';
const isMobile=()=>compactScreen(innerWidth,innerHeight,matchMedia('(pointer: coarse)').matches);
const app=document.querySelector('#app');let state=load(localStorage);
const migratedToDefense=migrateToDefense(state);
state.audience=['child','teen'].includes(localStorage.getItem('qh-player-age-band'))?localStorage.getItem('qh-player-age-band'):undefined;
if(state.active?.interaction&&!requiresScamInteraction(state.active.caseId,state.active.interaction.choice)){const choice=state.active.interaction.choice;state.active.interaction=null;beginDefenseAction(state.active,choice);}
if(state.active?.interaction){const a=state.active,i=a.interaction;if(a.caseId!=='fake-middleman')i.step=expandedById[a.caseId]?.checks.length||i.step;if(i.choice.endsWith('--accept')&&i.view!=='contain'){i.view='contain';i.deadline=Date.now()+12000;}}
const moneyEffects=installMoneyFeedback(state.credits);
refreshIncoming(state);
if(state.active?.mode!=='defense'&&state.active?.log.length===1&&!state.active.used.length&&!state.active.outcome&&state.active.log[0].speaker!=='Você')state.active.log=[];
if(state.active?.mode!=='defense'&&state.active&&!state.active.scheme&&!state.active.used.length&&!state.active.outcome)state.active.log=[];
const legacyLines=['Você tenta encurtar o tempo para decidir.','Você mostra um cargo inventado. O crachá tem um carimbo de batata.','Você usa simpatia para tentar conquistar confiança.','Você apresenta a proposta fictícia e espera uma decisão.'];
if(state.active?.mode==='defense'&&!state.active.outcome)resumeDefenseCall(state.active);
for(const entry of [state.active,...state.history])for(const line of entry?.log||[]){const index=legacyLines.indexOf(line.text);if(index>=0)line.text=moves[index].reply;}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const protectivePauses=()=>[...state.history,state.active].filter(h=>resultImpact(h)?.protectionChosen).length;
function showStorageStatus(){
 const message=storageStatus();if(!message)return;
 const intro=document.querySelector('.intro-footer>span');if(intro)intro.textContent='Sessão temporária';
 const host=[...document.querySelectorAll('[data-window-id]')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))[0]?.querySelector('.call-window-body,.app-window-body');
 if(host&&!host.querySelector('.storage-status')){const notice=document.createElement('p');notice.className='storage-status';notice.setAttribute('role','status');notice.textContent=message+' O arquivo anterior foi mantido.';host.prepend(notice);}
}
function resultSummary(h){
  if(h.caseId){const person=defensePeople.find(c=>c.id===h.caller),scenario=defenseCaseFor(h);return `<details class="result-summary"><summary class="result-card-toggle"><div class="result-heading"><strong>${escape(person?.name||'Pessoa atendida')}</strong><span class="result-outcome ${h.outcome}">${(h.choice==='end-contact'||!!h.partial)?'Contato pausado':h.outcome==='blocked'?'Risco interrompido':'A tentativa passou'}</span></div><p class="result-context">${escape(scenario?.title||'Rodada de defesa')}</p></summary><div class="result-body"><p><b>Ação escolhida:</b> ${escape(scenario?.choices.find(c=>c.id===h.choice)?.label||'')}</p><p>${escape(h.feedback||'')}</p>${h.balanceSettlement?.loss?`<p class="result-loss">Prejuízo fictício: − C$ ${h.balanceSettlement.loss}</p>`:''}${h.revenge?.credited?`<p class="result-revenge">Revanche: + C$ ${h.revenge.award}</p>`:''}<p><b>Técnica:</b> ${escape(scenario?.technique||'')}</p></div></details>`;}
 const person=callers.find(c=>c.id===h.caller);
 const actions=h.moves.map(id=>[...moves,...interactionMoves].find(m=>m.id===id)?.label).filter(Boolean);
 const reaction=[...(h.log||[])].reverse().find(line=>line.speaker===person.name)?.text;
 const outcome=h.outcome==='blocked'?'Tentativa interrompida':h.outcome==='fooled'?'Proposta aceita':'Conversa encerrada';
 const impact=resultImpact(h);
 return `<details class="result-summary"><summary class="result-card-toggle"><div class="result-heading"><strong>${escape(person.name)}</strong><span class="result-outcome ${h.outcome}">${outcome}</span></div><p class="result-context">${escape(impact?.summary||person.context)}</p></summary><div class="result-body"><p><b>Suas jogadas:</b> ${actions.length?actions.map(escape).join(' · '):h.audit?.length?'Conversa registrada; veja as escolhas no replay abaixo.':'Nenhuma jogada registrada.'}</p>${reaction?`<blockquote><small>${escape(person.name)} respondeu</small><p>“${escape(reaction)}”</p></blockquote>`:''}<div class="result-explanation"><p>${escape(schemes.find(s=>s.id===h.scheme)?.name||person.context)}</p>${consequenceCard(h,escape)}${learningReplay(h)}${h.learningDefense?.result?`<div class="defense-history"><b>Defesa: ${escape(h.learningDefense.result.title)}</b><p>${escape(h.learningDefense.result.feedback)}</p></div>`:''}${h.defenseRound?`<div class="defense-history"><b>Na rodada de defesa:</b> ${escape(h.defenseRound.label)}<p>${escape(h.defenseRound.feedback)}</p></div>`:''}${h.steps?.length?`<p><b>Etapas:</b> ${h.steps.map(escape).join(' · ')}</p>`:''}${h.item?`<p><b>Item compartilhado:</b> ${escape(h.item.name)}</p>`:''}${h.scheme?`<p><b>Proposta:</b> ${escape(schemes.find(s=>s.id===h.scheme)?.name||'Proposta anterior')} · <b>Recebido:</b> C$ ${h.earned||0}</p>`:''}</div></div></details>`;
}
let opened='calls',minimized=false,searchOpen=false,searchTerm='',profileOpen=false;
let cardDraft={};try{cardDraft=JSON.parse(sessionStorage.getItem('qh-card-draft'))||{};}catch{}
function checkAppCode(id){
 const field=document.querySelector(id==='wallet'?'#demo-card-number':'#club-pass-code'),output=document.querySelector(id==='wallet'?'.card-entry-error':'.club-code-status');
 if(typing){if(output)output.textContent='Aguarde a mensagem do personagem terminar antes de conferir.';return;}
 if(verifyOperationCode(state,id,field?.value)){render();return;}
 if(output){output.textContent=codeFeedback(state.active,id,field?.value).message;output.dataset.kind='error';}
 field?.setAttribute('aria-invalid','true');field?.focus();
}
app.addEventListener('input',e=>{if(!['demo-card-number','club-pass-code'].includes(e.target.id))return;e.target.removeAttribute('aria-invalid');const output=document.querySelector(e.target.id==='demo-card-number'?'.card-entry-error':'.club-code-status');if(output?.dataset.kind==='error'){output.textContent='Código editado. Use Conferir para validar novamente.';delete output.dataset.kind;}});
app.addEventListener('input',e=>{if(e.target.id!=='demo-card-number')return;if(looksPersonal(e.target.value)){cardDraft={};sessionStorage.removeItem('qh-card-draft');return;}cardDraft={token:state.active?.item?.token,text:e.target.value};sessionStorage.setItem('qh-card-draft',JSON.stringify(cardDraft));});
let resultView='result';
let typing=null,cancelPlayback=()=>{},defenseLoading=false;let messageDraft='';try{const draft=JSON.parse(sessionStorage.getItem('qh-message-draft'));if(draft?.caller===state.active?.caller){messageDraft=redactSensitiveText(draft.text||'').text;sessionStorage.setItem('qh-message-draft',JSON.stringify({caller:state.active?.caller,text:messageDraft}));}}catch{}
app.addEventListener('input',e=>{if(e.target.id==='player-message'){if(looksPersonal(e.target.value)){messageDraft='';sessionStorage.removeItem('qh-message-draft');return;}messageDraft=redactSensitiveText(e.target.value).text;sessionStorage.setItem('qh-message-draft',JSON.stringify({caller:state.active?.caller,text:messageDraft}));}});

function showTurn(active,start,{trust=active.trust,expression=savedExpression(active)}={}){
 cancelPlayback();
 const reply=active.log.slice(start).findLast(line=>line.speaker!=='Você');
 cancelPlayback=playConversation({start,total:active.log.length,speaker:reply?.speaker||'Sistema',text:reply?.text||'',ended:!!active.outcome,current:()=>state.active===active,
   frame:frame=>{typing={...frame,trust:frame.phase==='reading'?active.trust:trust,expression:frame.phase==='reading'?savedExpression(active):expression};render();if(frame.phase==='reading')murmurReply(replyDuration(reply?.text||''),reply?.text||'');},
  done:()=>{typing=null;render();if(opened==='calls')document.querySelector('[data-window-id="calls"] [data-dialogue-option]:not([disabled])')?.focus({preventScroll:true});}
 });
}
function animateMove(id){
 if(typing||!state.active)return;
 const active=state.active,start=active.log.length,prior={trust:active.trust||0,expression:savedExpression(active)};
 const guided=id.startsWith('choice:')?applyDialogueOption(state,id.slice(7)):null;
 if(guided?.app){openSchemeApp(guided.app);return;}
 if(!(id.startsWith('choice:')?guided:applyMove(state,id)))return;
 showTurn(active,start,prior);
}
function presentOperation(action){
 if(typing||!state.active)return false;
 const active=state.active,start=active.log.length,prior={trust:active.trust||0,expression:savedExpression(active)};
 if(!action())return false;
 opened='calls';windows.calls??=desktopWindowGeometry(690,65);windows.calls.hidden=false;windows.calls.z=++layer;
 showTurn(active,start,prior);return true;
}
function defenseEntrance(a){
 if(defenseVisible(a))return defensePanel(a,escape);
 return `<section class="defense-entrance"><small>ATENDIMENTO ENCERRADO</small><h3>Agora você está do outro lado.</h3><p>Um novo recado chegou. Desta vez, a decisão é sua: investigar e se proteger.</p><button class="primary" data-start-defense ${defenseLoading?'disabled':''}>${defenseLoading?'Abrindo o novo recado…':'Abrir rodada de defesa'}</button></section>`;
}
function classDefenseReminder(a){return state.classSession?.phase==='play'&&a?.outcome&&!a.learningDefense?.result?'<p class="class-defense-reminder">Para continuar a atividade, conclua a rodada de defesa acima.</p>':'';}

const openingLines={nino:'Oi, Nino! Estou ligando sobre o concurso da Batata Cósmica.',olga:'Oi, Olga! Podemos conversar sobre a Cafeteira Intergaláctica?',davi:'Oi, Davi! Estou entrando em contato sobre o seu PãoOS.',yara:'Oi, Yara! Podemos falar sobre o Clube Colher?',pri:'Oi, Pri! Estou ligando sobre os convites para o evento.',bento:'Oi, Bento! Queria conversar sobre aquela foto da sua mesa.'};
function beginConversation(schemeId){
 if(typing||!state.active||state.active.log.length)return;
 const caller=callers.find(c=>c.id===state.active.caller),scheme=schemes.find(s=>s.id===schemeId);if(!scheme)return;state.active.scheme=scheme.id;state.active.stage='pitch';if(isMobile()&&state.tutorial==='active')state.tutorialCollapsed=true;state.active.suspicion=0;state.active.expression='thinking';
 state.active.log.push({speaker:'Você',text:scheme.opening+(selectedOffer(state.active)?' Proposta: '+selectedOffer(state.active).name+'. '+selectedOffer(state.active).detail:'')},{speaker:caller.name,text:characterOpening(caller.id,scheme.id)});
 showTurn(state.active,0);
}
let defensePlaybackTimers=[];
let bootReadyWaiting=false;
function clearDefensePlayback(){for(const timer of defensePlaybackTimers)clearTimeout(timer);defensePlaybackTimers=[];document.dispatchEvent(new CustomEvent('qh-speaking-stop'));}
function defenseMurmurDuration(text){return Math.min(4200,Math.max(2800,replyDuration(text)));}
function speakDefenseLine(active,text,caller,emotion,duration=defenseMurmurDuration(text)){if(!active||!text||!caller)return;document.dispatchEvent(new CustomEvent('qh-murmur',{detail:{caller,duration,emotion,text}}));}
function finishDefensePlayback(active){
 if(state.active!==active||active.outcome||!finishDefenseMurmur(active))return;
 for(const timer of defensePlaybackTimers)clearTimeout(timer);defensePlaybackTimers=[];document.dispatchEvent(new CustomEvent('qh-speaking-stop'));render();
}
document.addEventListener('qh-speaking-start',e=>{
 const active=state.active;if(active?.mode!=='defense'||active.scammerId!==e.detail?.caller||active.chatStage!=='speaking'||active.outcome)return;
 for(const timer of defensePlaybackTimers)clearTimeout(timer);defensePlaybackTimers=[];
 const duration=Number(e.detail.duration)||defenseMurmurDuration(defenseCaseFor(active).message);
 if(active.scammerSpeakingExpression&&active.scammerSpeakingExpression!==active.scammerExpression)defensePlaybackTimers.push(setTimeout(()=>{if(state.active!==active||active.outcome||active.chatStage!=='speaking')return;active.scammerExpression=active.scammerSpeakingExpression;render();document.dispatchEvent(new CustomEvent('qh-speaking-expression',{detail:{caller:active.scammerId,emotion:active.scammerExpression}}));},Math.round(duration*.58)));
 defensePlaybackTimers.push(setTimeout(()=>finishDefensePlayback(active),duration+350));
});
document.addEventListener('qh-speaking-end',e=>{const active=state.active;if(active?.mode==='defense'&&active.scammerId===e.detail?.caller)finishDefensePlayback(active);});
document.addEventListener('qh-murmur-skipped',e=>{const active=state.active;if(active?.mode==='defense'&&active.scammerId===e.detail?.caller)finishDefensePlayback(active);});
function startDefenseMurmur(active,scenario){
 if(!active||state.active!==active||active.mode!=='defense'||active.outcome||!scenario||active.murmurHeard)return;
 clearDefensePlayback();active.chatStage='speaking';active.murmurHeard=true;render();const duration=defenseMurmurDuration(scenario.message);speakDefenseLine(active,scenario.message,active.scammerId,active.scammerExpression,duration);defensePlaybackTimers.push(setTimeout(()=>finishDefensePlayback(active),duration+1800));
}
function animateIncoming(){
 const active=state.active;if(active?.mode!=='defense'){render();return;}
 if(document.documentElement.dataset.bootReady!=='true'){
  if(!bootReadyWaiting){bootReadyWaiting=true;document.addEventListener('qh-boot-ready',()=>{bootReadyWaiting=false;if(state.active===active&&!active.outcome&&!active.ransomwareDeadline)animateIncoming();},{once:true});}
  return;
 }
 if(active.chatVisible>0&&['ready','speaking'].includes(active.chatStage)){if(active.chatStage==='speaking')active.chatStage='ready';if(!active.murmurHeard)startDefenseMurmur(active,defenseCaseFor(active));else render();return;}
 clearDefensePlayback();const person=defensePeople.find(p=>p.id===active.caller),scenario=defenseCaseFor(active),scammer=scammerPeople.find(p=>p.id===active.scammerId)||scammerPeople.find(p=>p.id===person?.scammerId)||scammerPeople[0];if(!person||!scenario||!scammer){render();return;}
 const typingDelay=3000;
 const emotion=person.emotion||'confused',scammerEmotion=active.scammerExpression||scammer.emotion||'confused';active.scammerId=scammer.id;active.unread=true;active.chatVisible=0;active.chatStage='typing';active.expression=emotion;active.scammerExpression=scammerEmotion;active.scammerSpeakingExpression=scammer.speakingExpression||scammerEmotion;active.log=[];render();
 defensePlaybackTimers.push(setTimeout(()=>{if(state.active!==active||active.outcome)return;active.unread=false;active.chatVisible=1;active.chatStage='ready';active.log.push({speaker:'Contato não salvo',text:scenario.message});startDefenseMurmur(active,scenario);},typingDelay));
}
function murmurReply(duration,text=''){
 const a=state.active;if(!a)return;
 document.dispatchEvent(new CustomEvent('qh-message'));
 document.dispatchEvent(new CustomEvent('qh-murmur',{detail:{caller:a.caller,duration,emotion:savedExpression(a),text}}));
}

function characterExpression(a){return typing?.expression||savedExpression(a);}
function conversationControls(a){
 if(!a.scheme||!a.log.length||(a.outcome&&!typing))return '';
 const {percent,color,label:level}=trustAppearance(typing?.trust??a.trust);
 const label=a.suspicion&&!typing?'Com um pé atrás':level;
 return `<div class="conversation-mood trust-card" style="--trust-color:${color}"><div class="trust-caption"><span><i aria-hidden="true"></i> Clima da conversa</span></div><div class="trust-footer"><small>${label}</small><span aria-hidden="true">● ● ●</span></div></div>`;
}

function composeForm(a){
 if(typing)return '<section class="reply-wait" role="status">'+(typing.phase==='reading'?(a.outcome?'Conversa concluída. Preparando o resultado…':'Preparando suas próximas falas…'):'Aguarde a resposta…')+'</section>';
 if(a.supportPaused)return '<section class="support-pause"><p>Conversa pausada.</p><button data-support-resume>Retomar quando quiser</button></section>';
 const options=dialogueOptions(a);if(!options.length)return '';
 return `<section class="guided-compose" aria-label="Escolha sua resposta"><div class="guided-heading"><div><small>SUA VEZ</small><h2>O que você responde?</h2></div><span>4 caminhos</span></div><div class="dialogue-options">${options.map((o,i)=>`<button type="button" class="dialogue-option ${o.funny?'option-witty':''} ${o.protective?'option-protective':''}" data-dialogue-option="${escape(o.key)}" ${typing?'disabled':''}><span class="option-number" aria-hidden="true">${i+1}</span><span>${escape(o.label)}</span></button>`).join('')}</div><div class="guided-footer"><span>Seu turno, sem pressa.</span><button class="quiet" data-action="close" ${typing?'disabled':''}>Encerrar contato</button></div></section>`;
}
function composeMessage(a){return composeForm(a);}
app.addEventListener('click',e=>{const b=e.target.closest('[data-dialogue-option]');if(b&&!typing)animateMove('choice:'+b.dataset.dialogueOption);});

const typingBubble=()=>typing&&typing.phase!=='reading'&&typing.speaker!=='Sistema'?`<div class="bubble typing-bubble ${typing.speaker==='Você'?'own':''}" role="status" aria-label="${escape(typing.speaker)} está digitando"><small>${escape(typing.speaker)}</small><div class="typing-dots" aria-hidden="true"><span></span><span></span><span></span></div><span class="sr-only">Digitando…</span></div>`:'';
let layer=2,startOpen=false,mobileAppsOpen=false;let desktopRestore=null;
const appIds=['calls','files','boss','ledger','help','shop'];
let pinnedApps=['calls','boss'];
try{const saved=JSON.parse(localStorage.getItem('qh-pinned-apps'));if(Array.isArray(saved))pinnedApps=[...new Set(saved.filter(id=>appIds.includes(id)))];}catch{}
const savePins=()=>localStorage.setItem('qh-pinned-apps',JSON.stringify(pinnedApps));
function pinApp(id,index=pinnedApps.length){pinnedApps=pinnedApps.filter(appId=>appId!==id);pinnedApps.splice(index,0,id);savePins();}

let mobileIconOrder=normalizeMobileIconOrder(appIds,(()=>{try{return JSON.parse(localStorage.getItem('qh-mobile-icon-order')||'null');}catch{return null;}})());

let iconPositions={};try{iconPositions=JSON.parse(localStorage.getItem('qh-desktop-icons')||'{}');}catch{}
iconPositions=initialDesktopIcons(appIds,iconPositions,isMobile()?{width:1280,height:800}:{width:innerWidth,height:innerHeight});
function desktopWindowGeometry(width=560,y=65){if(isMobile())return {x:170,y};const icons=initialDesktopIcons(appIds,iconPositions,{width:innerWidth,height:innerHeight}),x=Math.max(250,...Object.values(icons).map(position=>position.x+110+16));return {x,y,width:Math.min(width,Math.max(360,innerWidth-x-16))};}
const desktopIcon=officeIcon;
let suppressIconClick=false;
app.addEventListener('click',e=>{if(suppressIconClick&&e.target.closest('[data-icon],.mobile-app-switcher>div [data-app]')){e.stopImmediatePropagation();e.preventDefault();suppressIconClick=false;}},true);
app.addEventListener('pointerdown',e=>{
 const el=e.target.closest('[data-icon],[data-task-app]');if(!el||e.button!==0||isMobile())return;
 const desktopPositions=initialDesktopIcons(appIds,iconPositions,{width:innerWidth,height:innerHeight}),id=el.dataset.icon||el.dataset.taskApp,fromBar=!!el.dataset.taskApp,rect=el.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,original={...(desktopPositions[id]||iconPositions[id])};let moved=false,ghost;
 el.setPointerCapture(e.pointerId);
 const bar=document.querySelector('.taskbar');
 const move=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;
  if(!moved){moved=true;ghost=el.cloneNode(true);ghost.className='app-drag-ghost';ghost.removeAttribute('data-app');ghost.removeAttribute('data-icon');ghost.removeAttribute('data-task-app');document.querySelector('.desktop').append(ghost);}
  ghost.style.left=(ev.clientX-35)+'px';ghost.style.top=(ev.clientY-35)+'px';
  const nearBar=ev.clientY>=bar.getBoundingClientRect().top-40;
  ghost.hidden=!fromBar&&!nearBar;
  el.classList.toggle('pin-preview',!fromBar&&nearBar);
  bar.classList.toggle('pin-drop',nearBar);
  if(!fromBar){const p=desktopIconPosition({x:rect.left+ev.clientX-sx,y:rect.top+ev.clientY-sy},{width:innerWidth,height:innerHeight},{snap:false});el.style.left=p.x+'px';el.style.top=p.y+'px';el.classList.add('dragging');}
 };
 const finish=ev=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',finish);ghost?.remove();bar.classList.remove('pin-drop');el.classList.remove('dragging','pin-preview');if(!moved)return;
  suppressIconClick=true;setTimeout(()=>suppressIconClick=false,350);
  if(ev.type==='pointercancel'){if(!fromBar){el.style.left=original.x+'px';el.style.top=original.y+'px';}return;}
  if(ev.clientY>=bar.getBoundingClientRect().top){const siblings=[...bar.querySelectorAll('[data-task-app]')].filter(button=>button.dataset.taskApp!==id);let index=siblings.filter(button=>ev.clientX>button.getBoundingClientRect().left+button.offsetWidth/2).length;pinApp(id,Math.min(index,pinnedApps.length));}
  else if(fromBar){pinnedApps=pinnedApps.filter(appId=>appId!==id);savePins();}
  else{
   iconPositions[id]=desktopIconPosition({x:rect.left+ev.clientX-sx,y:rect.top+ev.clientY-sy},{width:innerWidth,height:innerHeight},{occupied:Object.entries(desktopPositions).filter(([other])=>other!==id).map(([,p])=>p)});localStorage.setItem('qh-desktop-icons',JSON.stringify(iconPositions));
  }
  render();
 };
 el.addEventListener('pointermove',move);el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);
});
app.addEventListener('pointerdown',e=>{
 if(!isMobile()||e.button!==0)return;
 const icon=e.target.closest('.mobile-app-switcher>div [data-app],.desktop-icons [data-icon]');if(!icon)return;
 const grid=icon.closest('.mobile-app-switcher>div,.desktop-icons'),scrollBox=grid,startX=e.clientX,startY=e.clientY,startScroll=scrollBox.scrollTop,id=icon.dataset.icon||icon.dataset.app;
 let armed=e.pointerType!=='touch',moved=false,scrolling=false,target=icon;
 if(armed){icon.classList.add('mobile-drag-source');grid.classList.add('mobile-grid-dragging');}
 const hold=armed?null:setTimeout(()=>{armed=true;icon.classList.add('mobile-drag-source');grid.classList.add('mobile-grid-dragging');},280);
 const move=ev=>{
  const distance=Math.hypot(ev.clientX-startX,ev.clientY-startY);
  if(!armed&&distance>9){clearTimeout(hold);scrolling=true;scrollBox.scrollTop=Math.max(0,startScroll-(ev.clientY-startY));ev.preventDefault();return;}
  if(!armed||distance<4)return;
  moved=true;ev.preventDefault();
  const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.mobile-app-switcher>div [data-app],.desktop-icons [data-icon]');
  if(target!==over){target?.classList.remove('mobile-drop-target');target=over||icon;if(target!==icon)target.classList.add('mobile-drop-target');}
 };
 const finish=ev=>{
  clearTimeout(hold);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);
  icon.classList.remove('mobile-drag-source');target?.classList.remove('mobile-drop-target');grid.classList.remove('mobile-grid-dragging');
  if(moved||scrolling){suppressIconClick=true;setTimeout(()=>suppressIconClick=false,350);}
  if(ev.type==='pointercancel'||!moved||target===icon)return;
  mobileIconOrder=moveMobileIcon(mobileIconOrder,id,target.dataset.icon||target.dataset.app);localStorage.setItem('qh-mobile-icon-order',JSON.stringify(mobileIconOrder));render();
 };
 try{icon.setPointerCapture(e.pointerId);}catch{}
 window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
});
app.addEventListener('contextmenu',e=>{const button=e.target.closest('[data-task-app]');if(!button)return;e.preventDefault();document.querySelector('.pin-menu')?.remove();const id=button.dataset.taskApp,menu=document.createElement('div');menu.className='pin-menu';menu.style.left=Math.min(e.clientX,innerWidth-210)+'px';menu.innerHTML=`<button data-toggle-pin="${id}">${pinnedApps.includes(id)?'Desafixar da barra':'Fixar na barra'}</button>`;document.querySelector('.desktop').append(menu);});
app.addEventListener('click',e=>{if(suppressIconClick&&e.target.closest('[data-task-app]')){e.stopImmediatePropagation();e.preventDefault();return;}const button=e.target.closest('[data-toggle-pin]');if(button){const id=button.dataset.togglePin;if(pinnedApps.includes(id)){pinnedApps=pinnedApps.filter(appId=>appId!==id);savePins();}else pinApp(id);render();}else document.querySelector('.pin-menu')?.remove();},true);
const windowViews=new Map();
try{const saved=JSON.parse(localStorage.getItem('qh-window-views')||'{}');for(const [id,view]of Object.entries(saved))if(appIds.includes(id)&&view?.positions&&Array.isArray(view.details))windowViews.set(id,view);}catch{}
const saveViews=()=>localStorage.setItem('qh-window-views',JSON.stringify(Object.fromEntries(windowViews)));
const scrollAreas=['.scam-interaction-scroll','.app-window-body','.call-window-body','.conversation','.choices','.debrief'];
function captureWindowViews(layoutChanged=false){
 for(const el of document.querySelectorAll('[data-window-id]')){
  const positions={};for(const selector of scrollAreas){const area=el.querySelector(selector);if(area)positions[selector]={top:area.scrollTop,bottom:layoutChanged&&selector==='.conversation'&&windowViews.get(el.dataset.windowId)?.positions?.[selector]?windowViews.get(el.dataset.windowId).positions[selector].bottom:area.scrollHeight-area.clientHeight-area.scrollTop<32,count:area.querySelectorAll('.bubble:not(.typing-bubble)').length,unread:windowViews.get(el.dataset.windowId)?.positions?.[selector]?.unread||0};}
  const details=[...el.querySelectorAll('details')].map(d=>({key:d.querySelector('summary')?.textContent,open:d.open}));
  windowViews.set(el.dataset.windowId,{positions,details});
 }
 saveViews();return windowViews;
}
function clearReadNotice(){document.querySelector('.new-message-jump')?.remove();const label=document.querySelector('.mobile-dock [data-app="calls"] span');if(label)label.textContent='Zape';}
function restoreWindowViews(views){
 for(const el of document.querySelectorAll('[data-window-id]')){
  const view=views.get(el.dataset.windowId);
  for(const d of el.querySelectorAll('details')){const old=view?.details.find(item=>item.key===d.querySelector('summary')?.textContent);if(old)d.open=old.open;}
  for(const selector of scrollAreas){const area=el.querySelector(selector),old=view?.positions[selector];if(!area)continue;
   if(selector==='.conversation'){const count=area.querySelectorAll('.bubble:not(.typing-bubble)').length,reading=readingPosition(old,count);area.scrollTop=reading.follow?area.scrollHeight:old.top;if(view?.positions)view.positions[selector]={...old,count,unread:reading.unread};if(reading.unread){const b=document.createElement('button');b.dataset.newMessages='true';b.className='new-message-jump';b.innerHTML=`<span class="new-message-count">${reading.unread}${reading.unread===1?' mensagem nova':' mensagens novas'}</span><span class="new-message-action">ir ao fim</span>`;area.after(b);}}else if(old)area.scrollTop=old.top;
  }
 }
}
let windows={calls:{...desktopWindowGeometry(690,65),z:2,hidden:false,max:false}};
try{const saved=JSON.parse(localStorage.getItem('qh-windows'));if(saved&&typeof saved==='object'&&!Array.isArray(saved)){windows={};for(const [id,w] of Object.entries(saved)){if(!appIds.includes(id)||!Number.isFinite(w.x)||!Number.isFinite(w.y))continue;windows[id]={x:Math.max(0,Math.min(innerWidth-180,w.x)),y:Math.max(45,Math.min(innerHeight-120,w.y)),z:Number.isFinite(w.z)?w.z:++layer,hidden:!!w.hidden,max:!!w.max,width:Number.isFinite(w.width)?w.width:null,height:Number.isFinite(w.height)?w.height:null};}}}catch{}
function normalizeDesktopWindows(){if(isMobile())return;const minimumX=desktopWindowGeometry(560,65).x;for(const [id,windowState] of Object.entries(windows)){if(windowState.max)continue;if(windowState.x<minimumX)windowState.x=minimumX;const available=Math.max(360,innerWidth-16-windowState.x),target=windowState.width??(id==='calls'?690:560);if(windowState.width||windowState.x+target>innerWidth-8)windowState.width=Math.min(target,available);}}
normalizeDesktopWindows();
layer=Math.max(layer,...Object.values(windows).map(w=>w.z||0));opened=Object.entries(windows).filter(([,w])=>!w.hidden).sort((a,b)=>(b[1].z||0)-(a[1].z||0))[0]?.[0]||'calls';
const saveWindows=()=>localStorage.setItem('qh-windows',JSON.stringify(windows));
if(migratedToDefense||state.mode==='defense'&&state.cursor===0&&!state.active&&!state.finished&&!state.started){windows.calls??={...desktopWindowGeometry(690,65),z:++layer,hidden:false};windows.calls.hidden=false;windows.calls.z=++layer;}
 function render(layoutChanged=false){const previousReactionScroll=app.querySelector('.reaction-scroll')?.scrollTop;const previousRevengeLayout=captureRevengeLayout(app.querySelector('.revenge-window'),innerWidth);settleDefenseLoss(state);if(settleTutorialGrant(state))localStorage.setItem(KEY,JSON.stringify(state));if(layoutChanged)normalizeDesktopWindows();const previousViews=captureWindowViews(layoutChanged);const focusElement=document.activeElement,focusButton=focusElement?.matches('button')?focusElement:null,focusAttribute=focusButton?[...focusButton.attributes].find(a=>a.name.startsWith('data-')):null;const focusId=document.activeElement?.id,focused=['player-message','caller-note','demo-card-number','chat-search'].includes(focusId),selection=focused?[document.activeElement.selectionStart,document.activeElement.selectionEnd]:null;saveWindows();const active=opened;let shell;const fragments=[];for(const [id,w]of Object.entries(windows)){if(w.hidden||(isMobile()&&id!==Object.entries(windows).filter(([,v])=>!v.hidden).sort((a,b)=>(b[1].z||0)-(a[1].z||0))[0]?.[0]))continue;opened=id;minimized=false;renderSingle();const el=document.querySelector('.desktop-window');el.dataset.windowId=id;if(id==='calls'&&!state.active&&!state.finished)el.classList.add('welcome-window');el.style.cssText=`left:${w.x}px;top:${w.y}px;z-index:${w.z||1}`;{if(w.width){el.style.width=Math.min(w.width,innerWidth-16)+'px';el.style.setProperty('--window-width',el.style.width);}if(w.height){el.style.height=Math.min(w.height,innerHeight-95)+'px';el.style.setProperty('--window-height',el.style.height);el.style.setProperty('--chat-height',Math.max(140,w.height-350)+'px');}el.insertAdjacentHTML('beforeend',`<button class="window-resize-side" data-resize-window="${id}" data-resize-axis="x" aria-label="Arraste a borda direita para ajustar a largura" title="Ajustar largura · setas do teclado" tabindex="0"></button><button class="window-resize-bottom" data-resize-window="${id}" data-resize-axis="y" aria-label="Arraste a borda inferior para ajustar a altura" title="Ajustar altura · setas do teclado" tabindex="0"></button><button class="window-resize-handle" data-resize-window="${id}" aria-label="Arraste o canto para ajustar largura e altura" title="Ajustar tamanho · setas do teclado" tabindex="0"></button>`);}if(w.max&&!isMobile())el.classList.add('maximized');else if(!isMobile()){const measured=el.getBoundingClientRect(),fit=fitWindow({x:w.x,y:w.y,width:measured.width,height:measured.height},{width:innerWidth,height:innerHeight});w.x=fit.x;w.y=fit.y;el.style.left=w.x+'px';el.style.top=w.y+'px';el.style.setProperty('--window-left',el.style.left);el.style.setProperty('--window-top',el.style.top);el.style.setProperty('--window-room',Math.max(1,innerHeight-57-w.y)+'px');if(w.width){el.style.width=(w.width=fit.width)+'px';el.style.setProperty('--window-width',el.style.width);}if(w.height){el.style.height=(w.height=fit.height)+'px';el.style.setProperty('--window-height',el.style.height);}}if(isMobile()&&id!=='calls'&&state.active)el.querySelector('.app-window-body')?.insertAdjacentHTML('afterbegin','<button class="mobile-return-chat" data-app="calls">Voltar à conversa</button>');const bar=el.querySelector('.windowbar');bar.dataset.drag=id;const closeControl=bar.querySelector('[data-window="close"]');closeControl?.insertAdjacentHTML('beforebegin',`<button class="window-max-control" data-max="${id}" aria-label="${w.max?'Restaurar janela':'Maximizar janela'}" aria-pressed="${w.max}" title="${w.max?'Restaurar':'Maximizar'}"><svg viewBox="0 0 16 16" aria-hidden="true">${w.max?'<path d="M5 2h9v9H5z"/><path d="M2 5v9h9"/>':'<rect x="3" y="3" width="10" height="10"/>'}</svg></button>`);fragments.push(el.outerHTML);shell=document.querySelector('.desktop').outerHTML;}opened=active;if(!shell){minimized=true;renderSingle();shell=document.querySelector('.desktop').outerHTML;}app.innerHTML=shell;document.querySelector('.desktop-window')?.remove();document.querySelector('.desktop').insertAdjacentHTML('beforeend',fragments.join(''));document.querySelector('.start-menu').removeAttribute('data-app');document.querySelector('.start-menu').dataset.start='true';document.querySelector('.taskbar>small').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});if(startOpen)document.querySelector('.desktop').insertAdjacentHTML('beforeend',`<div class="os-start"><strong>TRAMBIQUE OS</strong><p>${escape(localStorage.getItem('qh-player-name')||'Estagiário')} · sessão local</p>${applications.map(([id,icon,name])=>`<button data-app="${id}">${desktopIcon(id)} ${name}</button>`).join('')}<small>Trambique OS · todos os serviços são fictícios</small></div>`);saveWindows();const desktopPositions=initialDesktopIcons(appIds,iconPositions,{width:innerWidth,height:innerHeight});document.querySelectorAll('[data-icon]').forEach(el=>{const pos=desktopPositions[el.dataset.icon];if(pos){el.style.left=pos.x+'px';el.style.top=pos.y+'px';}});if(focused){const input=document.getElementById(focusId);if(input){input.focus({preventScroll:true});input.setSelectionRange(...selection);}}if(!focused&&focusAttribute){const name=focusAttribute.name,value=focusAttribute.value;[...document.querySelectorAll('button')].find(b=>b.getAttribute(name)===value&&!b.disabled)?.focus({preventScroll:true});}incomingMessages();applyConversationSearch();updatePortraits();restoreWindowViews(previousViews);restoreRevengeLayout(app.querySelector('.revenge-window'),previousRevengeLayout,innerWidth);const current=Object.entries(windows).filter(([,w])=>!w.hidden).sort((a,b)=>(b[1].z||0)-(a[1].z||0))[0]?.[0]||'calls';document.querySelector('.desktop').insertAdjacentHTML('beforeend',mobileNavigation(applications,current,{expanded:mobileAppsOpen,pending:!!state.incoming?.pending&&!state.incoming.pending.result&&!state.incoming.pending.seen,unread:windowViews.get('calls')?.positions?.['.conversation']?.unread||0,callUnread:!!state.active?.unread},desktopIcon));if(isMobile()){const grids=[document.querySelector('.mobile-app-switcher>div'),document.querySelector('.desktop-icons')].filter(Boolean);for(const grid of grids)for(const id of mobileIconOrder){const icon=grid.querySelector(`[data-app="${id}"],[data-icon="${id}"]`);if(icon)grid.append(icon);}}refreshTutorialGuidance();syncActionDemonstration();syncRevengeVisual();syncReactionSummary(app.querySelector('.reaction-scroll'),state.active);if(previousReactionScroll!==undefined){const summary=app.querySelector('.reaction-scroll');if(summary)summary.scrollTop=previousReactionScroll;}showStorageStatus();const playerAvatar=localStorage.getItem('qh-player-avatar');if(['bia','luana','yara','pri','olga','enzo','igor','leo','nino','caio'].includes(playerAvatar))document.querySelectorAll('.badge-avatar').forEach(badge=>{const image=document.createElement('img');image.src='/src/portraits/'+playerAvatar+'-balance-'+playerBalanceMood(state.credits)+'.svg';image.alt='Seu bonequinho';image.width=80;image.height=80;badge.replaceChildren(image);});mountPlayerPortrait(document.querySelector('.desktop-top>span'),playerAvatar,playerBalanceMood(state.credits));moneyEffects.sync(state.credits);}
app.addEventListener('click',e=>{const b=e.target.closest('button'),win=e.target.closest('[data-window-id]');if(b?.hasAttribute('data-show-desktop')){const visible=Object.entries(windows).filter(([,w])=>!w.hidden);if(visible.length){desktopRestore=visible.map(([id])=>id);visible.forEach(([,w])=>w.hidden=true);}else if(desktopRestore){desktopRestore.forEach(id=>{if(windows[id])windows[id].hidden=false;});desktopRestore=null;}startOpen=false;render();return;}if(win)opened=win.dataset.windowId;if(b?.dataset.max){windows[b.dataset.max].max=!windows[b.dataset.max].max;render();}if(b?.dataset.start){startOpen=!startOpen;render();}if(b?.dataset.app){startOpen=false;mobileAppsOpen=false;}},true);
app.addEventListener('pointerdown',e=>{
 const win=e.target.closest('[data-window-id]');if(win){const activeWindow=windows[win.dataset.windowId];if(activeWindow){activeWindow.z=++layer;win.style.zIndex=activeWindow.z;}}
 let bar=e.target.closest('[data-drag]');if(!bar||e.target.closest('button')||isMobile()||e.button!==0)return;
 const id=bar.dataset.drag,w=windows[id],viewport={width:innerWidth,height:innerHeight};if(!w)return;
 if(w.max){
  const oldRect=bar.closest('[data-window-id]').getBoundingClientRect(),anchor=Math.max(0,Math.min(1,(e.clientX-oldRect.left)/oldRect.width));
  const width=w.width||Math.min(id==='calls'?790:560,innerWidth-185),height=w.height||Math.min(620,innerHeight-150);
  const restored=fitWindow({x:e.clientX-width*anchor,y:e.clientY-18,width,height},viewport);
  w.max=false;w.width=restored.width;w.height=restored.height;w.x=restored.x;w.y=restored.y;render();
  bar=document.querySelector(`[data-window-id="${id}"] [data-drag]`);if(!bar)return;
 }
 e.preventDefault();const sx=e.clientX,sy=e.clientY,el=bar.closest('[data-window-id]'),rect=el.getBoundingClientRect(),x=w.x,y=w.y,pointerId=e.pointerId;let latestX=0,latestY=0,dragging=false,frame=0;
 w.z=++layer;el.style.zIndex=w.z;
 try{bar.setPointerCapture(pointerId);}catch{}
 const paint=()=>{frame=0;if(!dragging)return;const fit=fitWindow({x:x+latestX,y:y+latestY,width:rect.width,height:rect.height},{width:innerWidth,height:innerHeight});el.style.transform=`translate3d(${fit.x-x}px,${fit.y-y}px,0)`;};
 const move=ev=>{if(ev.pointerId!==pointerId)return;latestX=ev.clientX-sx;latestY=ev.clientY-sy;if(!dragging&&Math.hypot(latestX,latestY)<3)return;dragging=true;el.classList.add('window-dragging');if(!frame)frame=requestAnimationFrame(paint);};
 const cleanup=()=>{bar.removeEventListener('pointermove',move);bar.removeEventListener('pointerup',end);bar.removeEventListener('pointercancel',cancel);if(frame)cancelAnimationFrame(frame);};
 const end=ev=>{if(ev.pointerId!==pointerId)return;cleanup();if(dragging){const fit=fitWindow({x:x+latestX,y:y+latestY,width:rect.width,height:rect.height},{width:innerWidth,height:innerHeight});w.x=fit.x;w.y=fit.y;el.style.left=w.x+'px';el.style.top=w.y+'px';el.style.setProperty('--window-left',el.style.left);el.style.setProperty('--window-top',el.style.top);}el.style.transform='';el.classList.remove('window-dragging');try{if(bar.hasPointerCapture(pointerId))bar.releasePointerCapture(pointerId);}catch{}saveWindows();};
 const cancel=ev=>{if(ev.pointerId!==pointerId)return;cleanup();el.style.transform='';el.classList.remove('window-dragging');try{if(bar.hasPointerCapture(pointerId))bar.releasePointerCapture(pointerId);}catch{};};
 bar.addEventListener('pointermove',move);bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',cancel);
});
app.addEventListener('dblclick',e=>{const bar=e.target.closest('[data-drag]');if(!bar||e.target.closest('button')||isMobile())return;const w=windows[bar.dataset.drag];if(!w)return;w.max=!w.max;render();});
setInterval(()=>{const clock=document.querySelector('.taskbar>small');if(clock)clock.textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});},30000);
const applications=[['calls','☎','Zape Zape 2'],['files','▤','Fichas'],['boss','✉','Correio'],['ledger','◈','Resultados'],['help','?','Manual'],['shop','▣','Loja da firma']];
const decorEmoji=Object.fromEntries(furniture.map(item=>[item.id,item.emoji]));
function decorContent(){return `<div class="desktop-decor" aria-label="Sua mesa · objetos comprados">${state.decor.filter(id=>furniture.find(item=>item.id===id)?.type==='decor'&&!state.hiddenDecor?.includes(id)).map(id=>`<span data-decor="${id}" role="img" aria-label="${escape(furniture.find(item=>item.id===id)?.name||id)}" title="${escape(furniture.find(item=>item.id===id)?.name||id)}">${decorEmoji[id]}</span>`).join('')}</div>`;}
const schemeNames={link:'Clona Cartão',prize:'Premia Fácil',support:'Torradeira Remota',club:'Clube VIP',update:'Pacote Surpresa'};
function fitTutorialLayout(){
 const desktop=document.querySelector('.desktop'),guide=document.querySelector('.first-call-guide');
 const reserve=!!guide&&!isMobile();desktop?.classList.toggle('has-tutorial-desktop',reserve);
 if(!reserve)return;
 const guideWidth=Math.min(330,Math.max(280,innerWidth*.27));
 desktop.style.setProperty('--tutorial-guide-width',guideWidth+'px');
 for(const el of document.querySelectorAll('.desktop-window')){
  const w=windows[el.dataset.windowId]||{},rect=tutorialWindowRect({x:w.x??252,width:w.width||Math.min(560,innerWidth-32)},{width:innerWidth},guideWidth);
  el.style.setProperty('--tutorial-fit-left',rect.x+'px');el.style.setProperty('--tutorial-fit-width',rect.width+'px');
 }
}
function refreshTutorialGuidance(){
 const old=document.querySelector('.first-call-guide'),guideScroll=old?.scrollTop||0;
 if(isMobile()&&!state.active){old?.remove();return;}
 const guideFocus=old?.contains(document.activeElement)?[...document.activeElement.attributes].find(a=>a.name.startsWith('data-')):null;
 old?.remove();
 const ui={callsVisible:!!document.querySelector('[data-window-id="calls"]')};
 const guide=tutorialPanel(state,escape,isMobile(),ui);
 const host=isMobile()?document.querySelector('.desktop-window>.call-window-body,.desktop-window>.app-window-body'):document.querySelector('.desktop');
 host?.insertAdjacentHTML(isMobile()?'afterbegin':'beforeend',guide);
 const panel=document.querySelector('.first-call-guide');if(panel)panel.scrollTop=guideScroll;
 fitTutorialLayout();applyTutorialHighlights(app,state,ui);
 if(guideFocus)document.querySelector(`.first-call-guide [${guideFocus.name}="${guideFocus.value}"]`)?.focus({preventScroll:true});
}
app.addEventListener('toggle',e=>{
 if(!e.target.matches?.('.defense-clues')||!e.target.open||state.mode!=='defense'||state.cursor!==0||state.tutorial!=='defense'||!state.active||state.active.tutorialCluesSeen)return;
 state.active.tutorialCluesSeen=true;localStorage.setItem(KEY,JSON.stringify(state));refreshTutorialGuidance();
},true);
document.addEventListener('pointerup',()=>{if(document.querySelector('.first-call-guide'))fitTutorialLayout();});

let demonstration=null;
const demonstrationClock=createActionPlayback({
 onPhase(phase){
  if(!demonstration)return;
  demonstration.layer.dataset.phase=phase;
  const status=demonstration.layer.querySelector('.defense-action-working');
  if(status){status.replaceChildren();if(phase!=='result')status.append(document.createElement('i'));status.append(phase==='preparing'?'Localizando o controle…':phase==='acting'?'Ação em andamento…':'Ação concluída. Confira a última etapa.');}
 },
 onPress(active){if(state.active===active&&active.actionPending)document.dispatchEvent(new CustomEvent('qh-defense-action',{detail:{sound:['partial','help'].includes(defenseCaseFor(active)?.choices.find(c=>c.id===active.actionPending)?.adaptiveRole)?'click':defenseActionSounds[active.actionPending]||null}}));},
 onFinish(active){
  if(state.active!==active||!active.actionPending)return;
  const choice=active.actionPending;active.actionPending=null;
  if(!decideDefense(active,choice))return;
  clearDefensePlayback();document.dispatchEvent(new CustomEvent('qh-defense-reaction',{detail:{tier:active.reactionTier}}));render();
 }
});
function syncActionDemonstration(){
 const fresh=app.querySelector('.defense-action-playback'),shade=app.querySelector('.defense-action-playback-shade'),active=state.active;
 if(!active?.actionPending){demonstrationClock.stop();demonstration?.layer.remove();demonstration=null;return;}
 if(demonstration?.active===active&&demonstration.choice===active.actionPending){fresh?.remove();shade?.remove();}
 else{
  demonstrationClock.stop();demonstration?.layer.remove();demonstration=null;if(!fresh)return;
  const layer=document.createElement('div');layer.className='desktop qh-action-layer';layer.setAttribute('data-action-instance',String(active.actionStartedAt||Date.now()));
  if(shade)layer.append(shade);layer.append(fresh);document.body.append(layer);
  demonstration={layer,active,choice:active.actionPending};
  const duration=defenseActionDuration(active.actionPending)*1000;
  const cursor=layer.querySelector('.defense-action-cursor');
  if(cursor)cursor.style.setProperty('animation','none','important');
  cursor?.animate([
   {offset:0,transform:'translate(100px,-60px)',opacity:0},
   {offset:.08,transform:'translate(80px,-50px)',opacity:1},
   {offset:.16,transform:'translate(0,0)',opacity:1},
   {offset:.18,transform:'translate(0,3px)',opacity:1},
   {offset:.22,transform:'translate(0,0)',opacity:1},
   {offset:.55,transform:'translate(45px,-12px)',opacity:0},
   {offset:1,transform:'translate(45px,-12px)',opacity:0}
  ],{duration,fill:'forwards'});
  const startedAt=Number.isFinite(active.actionStartedAt)?active.actionStartedAt:Date.now(),elapsed=Math.max(0,Date.now()-startedAt);
  for(const animation of layer.getAnimations({subtree:true}))animation.currentTime=elapsed;
  const track=layer.querySelector('.demo-delivery-track i');
  if(track){const motion=track.animate([{width:'0%'},{width:'100%'}],{delay:duration*.18,duration:duration*.58,fill:'both'});motion.currentTime=elapsed;}
  demonstrationClock.start(active,duration,startedAt);
 }
 const guide=document.querySelector('#app .first-call-guide');
 demonstration.layer.classList.toggle('has-tutorial-desktop',!!guide&&!isMobile());
 if(guide)demonstration.layer.style.setProperty('--tutorial-guide-width',guide.getBoundingClientRect().width+'px');
 const pointer=demonstration.layer.querySelector('.defense-action-cursor'),target=demonstration.layer.querySelector('.defense-action-appbutton');
 if(pointer&&target){const box=target.getBoundingClientRect(),origin=pointer.parentElement.getBoundingClientRect();pointer.style.setProperty('left',(box.left-origin.left+box.width/2-3)+'px','important');pointer.style.setProperty('top',(box.top-origin.top+box.height/2-2)+'px','important');}

 demonstrationClock.refresh();
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)demonstrationClock.refresh();});

function focusMobileApp(){if(!isMobile())return;const target=document.querySelector('.desktop-window h1,.desktop-window h2,.desktop-window .windowbar strong')||document.querySelector('.mobile-dock [data-mobile-apps]');target?.setAttribute('tabindex','-1');target?.focus({preventScroll:true});}
function openSchemeApp(id){if(!appIds.includes(id))return;mobileAppsOpen=false;startOpen=false;opened=id;windows[id]??=desktopWindowGeometry(560,75);windows[id].hidden=false;windows[id].z=++layer;render();focusMobileApp();}
function schemeApp(id){if(state.active?.item?.app===id)return operationContent(id);const scheme=schemes.find(s=>s.id===id),active=state.active,selected=active?.scheme===id,previewOffer=selectedOffer({...active,scheme:id}),person=callers.find(c=>c.id===active?.caller);return `<section class="welcome scheme-tool"><small>${schemeNames[id].toUpperCase()} · FERRAMENTA DA FIRMA</small><h1>${id==='prize'?'Emitir certificado':id==='support'?'Preparar suporte':'Emitir convite'}</h1><p>${id==='prize'?'Prepare a promessa de prêmio. Seu objetivo é obter o identificador do cartão BatataPay do personagem.':id==='support'?'Prepare uma sessão de suporte no computador fictício da história.':'Emita o convite do clube inventado para abrir sua conversa.'}</p>${flowPanel(state,id)}${offerPicker(active,id,escape)}<div class="tool-preview ${id}"><small>${id==='prize'?'CERTIFICADO DE PREMIAÇÃO':id==='support'?'TORRADEIRA DIGITAL · SESSÃO SIMULADA':'CONVITE EXCLUSIVO'}</small><h2 class="${id==='prize'?'certificate-title':''}">${id==='prize'?desktopIcon('prize')+'<span>Batata Dourada</span>':id==='support'?'PãoOS · terminal de suporte':'Clube VIP da Colher'}</h2><p>${id==='prize'?escape(previewOffer?.name||'Talento tubérculo'):id==='support'?escape(previewOffer?.detail||'Estado: pão detectado na unidade C:'):escape(previewOffer?.name||'Campeonato de sopa')}</p><strong>${selected&&person?escape(person.name):'Aguardando destinatário'}</strong><div class="tool-stamp">${id==='prize'?'APROVADO PELA BATATA':id==='support'?'100% DENTRO DO JOGO':'MEMBRO QUASE OFICIAL'}</div></div>${id==='prize'?`<button data-export-certificate ${!selected?'disabled':''}>Imprimir a papelada fictícia</button>`:''}<div class="tool-path"><b>Como usar</b><p>1. Escolha esta proposta em Zape Zape 2.</p><p>2. Prepare ${id==='prize'?'o certificado':id==='support'?'a sessão':'o convite'} aqui e abra a conversa.</p>${id==='prize'?'<p>3. Obtenha o identificador do cartão BatataPay na conversa.</p><p>4. Digite o dado na Carteira Quase Digital e desvie C$ 300. O prêmio era a isca; os créditos saem da conta dele.</p>':`<p>3. Obtenha o ${id==='support'?'passe de sessão':'passe do clube'} na conversa e conclua a operação no app para receber C$ ${scheme.payout}.</p>`}</div><button class="primary" data-prepare="${id}" ${!selected||active?.log.length?'disabled':''}>${active?.scheme===id&&active.log.length?'Proposta já enviada':!selected?'Selecione a proposta em Zape Zape 2':id==='prize'?'Carimbar certificado e conversar':id==='support'?'Preparar sessão e conversar':'Caprichar no convite e conversar'}</button></section>`;}

let remoteApp=null,remoteCaller=null;
function remoteDesktop(a,person,done){
 if(remoteCaller!==a.caller){remoteCaller=a.caller;remoteApp='diagnostic';}
 const apps=[['diagnostic','⌁','Diagnóstico'],['files','▤','Arquivos'],['photos','▧','Fotos'],['mail','✉','Correio'],['bank','◈','Banco do Pão']];
 const profile=remoteProfiles[person.id],payout=schemes.find(s=>s.id===a.scheme).payout;
 const documents=(items,icon)=>items.map(([title,body])=>`<details class="remote-document"><summary>${icon} ${escape(title)}</summary><p>${escape(body)}</p></details>`).join('');
 const panels={diagnostic:`<h3>Diagnóstico da sessão</h3><p>Problema alegado: ${escape(selectedOffer(a)?.name||'PãoOS lento')}</p>${a.diagnostic?'<ul class="diagnostic-checks">'+a.diagnostic.checks.map(check=>'<li>✓ '+escape(check)+'</li>').join('')+'</ul><p>O acesso funcionou; isso não comprova que havia defeito.</p>':'<p>Observe o que a sessão permite ver antes de registrar o serviço.</p>'}<button data-run-diagnostic ${a.diagnostic||done?'disabled':''}>${a.diagnostic?'Verificação concluída':'Verificar sessão fictícia'}</button>`,files:'<h3>Meus arquivos</h3>'+documents(profile.files,'▤'),photos:`<h3>Álbum de ${escape(person.name)}</h3><div class="remote-photos">${profile.photos.map(([icon,label])=>`<span>${icon}<small>${escape(label)}</small></span>`).join('')}</div>`,mail:'<h3>Correio pessoal</h3>'+documents(profile.mail,'✉'),bank:`<h3>Banco do Pão</h3><small>CONTA DO PERSONAGEM · CRÉDITOS DO JOGO</small><div class="remote-balance">C$ ${1200-(done?payout:0)}</div>${done?`<div class="remote-receipt"><strong>Pagamento registrado</strong><p>− C$ ${payout} · serviço da firma</p><small>Um suporte inesperado recebeu acesso ao computador e ao app de pagamento.</small></div>`:`<p>Serviço apresentado na conversa: C$ ${payout}</p><p>${a.diagnostic?'Sessão verificada. O registro fará sair créditos do personagem.':'Abra Diagnóstico e verifique a sessão antes de registrar.'}</p>`}<button class="primary" data-execute="support" ${done||!operationReady(a,'support')?'disabled':''}>${done?'Serviço registrado':'Concluir serviço fictício'}</button>`};
 return `<div class="remote-pc" style="--owner:${person.color}"><div class="remote-session"><span class="remote-dot"></span> Conectado ao PãoOS de ${escape(person.name)}<small>Sessão do jogo</small>${!done?'<button data-disconnect-remote>Desconectar</button>':''}</div><div class="remote-workspace"><div class="remote-icons">${apps.map(([id,icon,name])=>`<button data-remote-app="${id}" class="${remoteApp===id?'selected':''}"><span>${icon}</span>${name}</button>`).join('')}</div>${remoteApp?`<section class="remote-app-window"><header>${apps.find(app=>app[0]===remoteApp)[2]}<button data-remote-close aria-label="Fechar app do personagem">×</button></header><div>${panels[remoteApp]}</div></section>`:'<div class="remote-desktop-note">Computador de '+escape(person.name)+'<small>Abra um aplicativo para explorar.</small></div>'}</div><div class="remote-taskbar"><b>▣ PãoOS</b><span>${escape(person.name)} · conectado</span></div></div>`;
}
app.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.remoteApp){remoteApp=b.dataset.remoteApp;render();}else if(b?.hasAttribute('data-remote-close')){remoteApp=null;render();}});

function operationContent(id){const a=state.active,person=callers.find(c=>c.id===a?.caller),ready=!typing&&a?.stage==='ready'&&a.item?.app===id,done=!typing&&a?.outcome==='fooled'&&a.item?.app===id;return `<section class="welcome operation-app"><small>${id==='wallet'?'CARTEIRA QUASE DIGITAL':id==='support'?'TORRADEIRA REMOTA':'CLUBE VIP'} · SIMULAÇÃO</small><h1>${id==='wallet'?'Conta BatataPay':id==='support'?'Computador remoto':'Registrar associação'}</h1><p>${id==='wallet'?'O prêmio era a isca. Use o identificador obtido na conversa para tirar créditos da conta BatataPay do personagem.':id==='support'?'A sessão é um cenário de PãoOS dentro deste jogo.':'Este passe só abre o clube imaginário da história.'}</p>${flowPanel(state,id)}${ready||done?`${id==='wallet'?walletAccountPanel(a,person.name,escape):''}${id==='wallet'&&!done?`<div class="card-entry"><label for="demo-card-number">Identificador do cartão BatataPay</label><input id="demo-card-number" type="text" autocomplete="off" spellcheck="false" maxlength="40" placeholder="QH-DEMO-…" value="${escape(cardDraft.token===a.item.token?cardDraft.text||'':'')}" aria-describedby="card-entry-hint card-check-status"><small id="card-entry-hint">Digite o código de cartão que o personagem compartilhou em Zape Zape 2.</small><button data-check-card>Conferir código digitado</button><p id="card-check-status" class="card-entry-error" role="status">${a.checkedToken===a.item.token?codeFeedback(a,'wallet',a.item.token).message:'Cole ou digite o código recebido. Conferir não movimenta créditos.'}</p></div>`:`<div class="demo-card"><small>${escape(a.item.name)}</small><strong>${escape(person.name)}</strong><code>${escape(a.item.token)}</code><span>SEM VALOR FORA DO JOGO</span></div>`}${id==='support'?remoteDesktop(a,person,done):id==='club'?clubPassPanel(a,person.name,escape):''}${id==='wallet'&&a.checkedToken===a.item.token&&!done?'<div class="transfer-preview"><strong>Cartão conferido · operação pronta</strong><p>Ao confirmar: − C$ 300 do personagem → + C$ 300 para a firma. Nenhum prêmio será depositado.</p></div>':''}<div class="operation-total"><span>${id==='wallet'?'Da conta do personagem → firma':id==='club'?'Taxa de associação → firma':'Operação da proposta'}</span><strong>C$ ${schemes.find(s=>s.id===a.scheme).payout}</strong></div><button class="primary" ${id==='support'?'hidden':''} data-execute="${id}" ${!ready||!operationReady(a,id)?'disabled':''}>${done?'Operação concluída':id==='wallet'?'Desviar C$ 300 para a firma':id==='support'?'Concluir serviço fictício':'Ativar associação fictícia'}</button>${id==='club'?`<details class="app-document membership"><summary>Ver associação de ${escape(person.name)}</summary><p>Clube VIP da Colher · membro ${done?'registrado':'aguardando confirmação'}</p><p>Benefícios: campeonato de sopa e reunião extraordinária dos talheres.</p></details>`:''}<p class="operation-footnote">${done?(id==='wallet'?'O saldo do personagem diminuiu. O desvio e a proteção estão nos Resultados.':'Recebimento registrado nos Resultados.'): 'O dinheiro só entra no saldo após esta etapa.'}</p>`:'<button data-app="calls">Ir para Zape Zape 2</button>'}</section>`;}
function shopContent(){return renderShop(state,escape);}

function renderContent(){if(state.active?.mode==='defense'){app.innerHTML=defenseView(state,{escape,portraitSource});localStorage.setItem(KEY,JSON.stringify(state));return;}if(!state.active?.outcome)resultView='result';for(const line of state.active?.log||[])line.time??=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});const a=state.active,c=callers.find(c=>c.id===a?.caller),result=typing?null:a?.outcome;app.innerHTML=`<header><a class="logo" href="/">QUASE<span>HONESTOS</span><small>CENTRAL DE TRAMBIQUES · SIMULAÇÃO FICTÍCIA</small></a><span class="shift">Turno ${state.shift+1} / 3 · ${state.cursor} de 6 atendimentos</span></header><main><aside><div class="boss"><small>BILHETE DO CHEFE</small><h2>Chefia falando.</h2><p>${bossLines[state.shift]}</p><p class="scribble">“A firma é quase séria.”</p></div><section class="notes"><h3>Seu expediente</h3><p>Escolha uma abordagem e acompanhe a reação. Cada pessoa pode desconfiar por um motivo diferente.</p><strong>${protectivePauses()} conferências registradas</strong><p>Saldo: ${state.credits} fichas de confete</p><small>Fichas são fictícias. Não representam seu aprendizado.</small></section></aside><section class="computer"><div class="windowbar"><span>● ● ●</span> TERMINAL DO ESTAGIÁRIO <span>SOLO</span></div><nav><span>☎ Atendimento</span><span>✎ Ficha</span><span>▤ Recados</span></nav>${a?`<div class="call-person-header"><div class="contact"><div class="avatar" data-expression="${characterExpression(a)}" data-caller="${c.id}" style="--person:${c.color}"><img draggable="false" src="${portraitSource(c.id,characterExpression(a))}" alt="${c.name}: ${expressionNames[characterExpression(a)]}" width="48" height="48"></div><div><h1>${c.name}</h1><p>${c.role}</p><span class="portrait-emotion">${expressionNames[characterExpression(a)]}</span></div><span class="status call-live">${result?'Encerrado':'Na linha'}</span></div>${chatTools(a,c)}</div><p class="context"><span class="dialogue-scripted-status">Atendimento</span> ${a.scheme?escape(schemes.find(s=>s.id===a.scheme)?.name||c.context):escape(c.context)}</p>${conversationControls(a)}${result?`<nav class="result-tabs" aria-label="Atendimento"><button data-result-view="result" aria-pressed="${resultView==='result'}">Resultado</button><button data-result-view="defense" aria-pressed="${resultView==='defense'}">Rodada de defesa</button><button data-result-view="conversation" aria-pressed="${resultView==='conversation'}">Conversa</button></nav>`:''}<div class="conversation" ${result&&resultView!=='conversation'?'hidden':''} role="log" tabindex="0" aria-label="Conversa">${a.log.slice(0,typing?typing.visible:a.log.length).map(l=>`<div class="bubble ${l.speaker==='Você'?'own':''} ${['package-permission','link-form'].includes(l.source)?'info-message':''}"><small>${escape(l.speaker)}</small>${informationCard(l,a.caller,escape)}${l.linkPreview?`<div class="chat-link-preview"><strong>Resgate BatataPay</strong><code>${escape(l.linkPreview)}</code><small>Link cenográfico · página do jogo</small></div>`:''}${l.attachment?`<div class="chat-attachment"><span aria-hidden="true">▤</span><div><strong>${escape(l.attachment)}</strong><small>Pacote do jogo · 2,4 MB fictícios</small></div></div>`:''}<span class="message-meta">${escape(l.time||'')}${l.speaker==='Você'?'<b aria-label="Entregue">✓</b>':''}</span></div>`).join('')}${typingBubble()}</div>${result?`<section class="debrief" ${resultView==='conversation'?'hidden':''}><div class="result-content" ${resultView==='result'?'':'hidden'}><small>REPLAY DO ATENDIMENTO</small>${consequenceCard(a,escape)}<p class="call-payout">${result==='fooled'?`+ C$ ${a.earned||0} recebidos · saldo C$ ${state.credits}`:'Nenhum crédito recebido nesta conversa.'}</p>${learningReplay(a)}</div><div class="defense-content" ${resultView==='defense'?'':'hidden'}>${defenseEntrance(a)}${classDefenseReminder(a)}</div><button data-action="finish" class="primary" ${state.classSession?.phase==='play'&&!a.learningDefense?.result?'disabled':''}>${state.classSession?.phase==='play'&&!a.learningDefense?.result?'Conclua a rodada de defesa':state.cursor===5?'Bater o ponto de saída':state.cursor===0&&state.tutorial==='active'?'Tutorial concluído · próximo atendimento':'Quem tá na linha?'}</button></section>`:`<div class="choices">${!a.log.length?`<small>VOCÊ ESTÁ NA LINHA</small><p class="call-start-note">Comece a conversa para ouvir ${escape(c.name)}.</p><small>ESCOLHA SUA PROPOSTA</small><div class="scheme-options">${schemes.map(s=>`<button data-scheme="${s.id}"><strong>${s.name}</strong><span>${s.description}</span><span class="scheme-apps">Apps: ${schemeNames[s.id]} · Zape Zape 2 · ${schemeItems[s.id].tool}</span><em>Rende até C$ ${s.payout}</em></button>`).join('')}</div>`:`${composeMessage(a)}${!typing?`<small class="conversation-stage">${a.stage==='ready'?'ITEM RECEBIDO':a.stage==='question'?'ELE TEM UMA DÚVIDA':a.stage==='request'?'CONTINUE A CONVERSA':'ESCOLHA UM CAMINHO'}</small>`:''}${a.stage==='ready'&&!typing?`<div class="received-item"><strong>${escape(a.item.name)}</strong><p>${a.scheme==='link'?'Cadastro recebido pela página':a.scheme==='update'?'Arquivo instalado · 3 dados revelados':escape(a.item.token)}</p><button data-open-operation="${a.item.app}" ${typing?'disabled':''}>Abrir ${escape(schemeItems[a.scheme].tool)}</button><small>${a.scheme==='link'?'O personagem preencheu e enviou o cadastro. Confira os dados no Clona Cartão.':a.scheme==='update'?'A instalação revelou o perfil. Veja o retorno do pacote no chat e revise no app.':'O personagem enviou este código no chat. Copie-o e confira no app antes de concluir.'}</small></div>`:''}${a.supportPaused?'<button class="quiet" data-action="close">Encerrar conversa</button>':''}</div>`}`}`:state.finished?(state.mode==='defense'?defenseCampaignEnding(state,escape):shiftEnding(state,escape)):`<section class="welcome onboarding"><div class="mobile-start-intro"><div class="badge-avatar"></div><small>${state.mode==='defense'?'DIA '+campaignDay(state,defensePeople.length).number+' NA FIRMA':'SEU PRIMEIRO DIA NA FIRMA'}</small><h1>${state.cursor?'Seu próximo recado está esperando.':'Seu primeiro recado chegou.'}</h1><p>Leia a mensagem e escolha como agir.<br>O Supervisor te ajuda no começo.</p></div><div class="firm-label"><span class="firm-status"></span> CENTRAL ABERTA <span>DESDE QUASE SEMPRE</span></div><div class="intro-grid"><div class="intro-copy"><small>${state.mode==='defense'?'DIA '+campaignDay(state,defensePeople.length).number+' NA FIRMA':'SEU PRIMEIRO DIA NA FIRMA'}</small><h1>Um emprego.<br>Zero referências.<br><em>Boa sorte.</em></h1><p>O café é duvidoso. O chefe também.<br>Seu computador já está ligado e a primeira chamada está esperando.</p></div><div class="employee-badge"><div class="badge-clip"></div><small>QUASE HONESTOS</small><div class="badge-avatar" aria-hidden="true"><svg viewBox="0 0 80 80"><rect x="8" y="8" width="64" height="64" rx="12" fill="#496572"/><circle cx="40" cy="31" r="12" fill="#e7b688"/><path d="M19 67q1-23 21-23t21 23" fill="#d99966"/><path d="M27 27q0-18 18-12l9 5-6 9-5-7-16 7" fill="#283841"/></svg></div><strong>ESTAGIÁRIO</strong><span>Departamento de Quase Tudo</span><div class="badge-footer">Nº 0042 <b>CONTRATADO*</b></div><p>*ninguém conferiu o currículo</p></div></div><aside class="first-day-note"><span aria-hidden="true">✎</span><div><small>BILHETE DO CHEFE</small><p>“Atenda com confiança. Se der errado, a culpa é da impressora.”</p><span>— Chefia, provavelmente</span></div></aside>${state.migratedToDefense?'<p class="migration-note">Seu expediente antigo foi preservado. Esta partida começa pela defesa; o histórico continua em Resultados.</p>':''}<div class="first-day-steps"><div><b>1</b><span>Leia a mensagem<small>Veja quem escreveu e o que está pedindo.</small></span></div><div><b>2</b><span>Confira o risco<small>Leia o sinal de alerta e entenda o golpe.</small></span></div><div><b>3</b><span>Escolha uma ação<small>Confirme por outro canal, pause ou peça ajuda.</small></span></div></div>${state.mode==='defense'?'<details class="campaign-schedule"><summary>Seis dias · cinco atendimentos por dia</summary>'+campaignDaysView(state,defensePeople,defenseCases,escape)+'</details>':''}<button class="primary start-shift" data-action="start">${officeIcon('brand')}<span><b>Começar expediente</b><small>Cinco atendimentos · um caso de cada vez</small></span></button><div class="intro-footer"><span>Salvo neste navegador</span><button data-privacy-open>Privacidade e termos de uso</button></div></section>`}</section></main><footer>Uma comédia fictícia sobre manipulação e as defesas que a interrompem. Nenhuma ligação, mensagem ou transação real.</footer>`;localStorage.setItem(KEY,JSON.stringify(state));document.querySelector('.conversation')?.scrollTo(0,99999);}
function renderSingle(){renderContent();const gameContent=document.querySelector('.computer').innerHTML.replace(/<div class="windowbar">.*?<\/div>/,'').replace(/<nav>.*?<\/nav>/,'');const person=callers.find(c=>c.id===state.active?.caller);let content=opened==='calls'?(state.mode==='defense'&&state.dayBreak?campaignDayBreakView(state,defensePeople,defenseCases,escape):gameContent):opened==='update'?updateContent(typing&&state.active?.scheme==='update'&&state.active?.stage==='ready'?{...state,active:{...state.active,item:null}}:state,escape):opened==='wallet'?operationContent('wallet'):['prize','support','club','wallet','update'].includes(opened)?schemeApp(opened):opened==='link'?cloneContent(state,escape,!!typing):opened==='shop'?shopContent():opened==='files'?filesContent(state,escape,typing?.expression):opened==='boss'?mailContent(state,escape)+incomingResults():opened==='ledger'?defenseResultsContent(state,escape,resultSummary):classroomPanel(state,escape)+helpContent(state,escape,isMobile());if(opened!=='calls')content=(defenseVisible(state.active)?defenseSourcePanel(state.active,opened,escape):'')+content+`<div class="app-return"><button data-app="calls">${desktopIcon("calls")}<span>Voltar ao Zape</span></button></div>`;if(opened==='calls'&&state.mode==='defense'&&!state.active&&!state.finished&&!state.dayBreak)content=welcomeStory(state,escape);app.innerHTML=`<div class="desktop" data-tutorial-defense="${state.mode==='defense'&&state.cursor===0&&state.tutorial==='defense'}" data-wallpaper="${furniture.some(item=>item.id===state.wallpaper&&item.type==='wallpaper')&&state.decor.includes(state.wallpaper)?state.wallpaper:'default'}"><div class="desktop-top"><strong>QUASE HONESTOS <small>TRAMBIQUE OS</small></strong><span><span class="session-owner-details"><span>${escape(localStorage.getItem('qh-player-name')||'Estagiário')}</span></span></span></div><div class="desktop-icons">${applications.map(([id,icon,title])=>`<button data-app="${id}" data-icon="${id}" class="${(id==='boss'&&state.incoming?.pending&&!state.incoming.pending.result&&!state.incoming.pending.seen||id==='calls'&&state.active?.mode==='defense'&&state.active.unread)?'has-unread':''}" aria-label="Abrir ${title}${id==='boss'&&state.incoming?.pending&&!state.incoming.pending.result&&!state.incoming.pending.seen||id==='calls'&&state.active?.mode==='defense'&&state.active.unread?' · mensagem nova':''}"><span class="desktop-app-icon" aria-hidden="true">${desktopIcon(id)}</span><span class="desktop-app-label">${title}</span></button>`).join('')}</div>${decorContent()}<div class="desktop-wallpaper" aria-hidden="true">quase<br><em>honestos.</em><small>SETOR DE ASSUNTOS QUASE RESOLVIDOS.</small></div>${!minimized?`<section class="desktop-window"><div class="windowbar"><strong>${applications.find(a=>a[0]===opened)[2]}</strong><div><button data-window="minimize" aria-label="Minimizar janela">—</button><button data-window="close" aria-label="Fechar janela"><svg class="window-close-symbol" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button></div></div><div class="${opened==='calls'?'call-window-body':'app-window-body'}">${content}</div></section>`:''}<div class="taskbar"><button data-app="help" class="start-menu" aria-label="Abrir menu Trambique OS" title="Trambique OS"><svg class="os-symbol" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v11H6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h2m4 0h2M9 12h6M4 19h16M9 15v4m6-4v4" stroke="currentColor" stroke-width="2"/><path d="M17 2l4 4" stroke="#fff1cf" stroke-width="3"/></svg></button>${[...pinnedApps,...Object.keys(windows).filter(id=>!pinnedApps.includes(id))].map(id=>applications.find(a=>a[0]===id)).map(([id,icon,title])=>`<button data-task-app="${id}" data-pinned="${pinnedApps.includes(id)}" class="${windows[id]&&!windows[id].hidden?'active':''} ${(id==='boss'&&state.incoming?.pending&&!state.incoming.pending.result&&!state.incoming.pending.seen||id==='calls'&&state.active?.mode==='defense'&&state.active.unread)?'has-unread':''}" data-app="${id}" aria-label="${title}${id==='boss'&&state.incoming?.pending&&!state.incoming.pending.result&&!state.incoming.pending.seen||id==='calls'&&state.active?.mode==='defense'&&state.active.unread?' · mensagem nova':''}" title="${title}"><span>${desktopIcon(id)}</span><span>${title}</span></button>`).join('')}<div class="os-account"><span>SALDO DA FIRMA</span><strong data-balance-value>C$ ${state.credits}</strong></div><small>${state.mode==='defense'?`DIA ${campaignDay(state,defensePeople.length).number} · ${campaignDay(state,defensePeople.length).position}/5`:`SOLO · ${state.cursor}/6`}</small><button class="show-desktop" data-show-desktop aria-label="Mostrar área de trabalho ou restaurar janelas" title="Mostrar área de trabalho"></button></div></div>`;document.querySelector('.conversation')?.scrollTo(0,99999);}
app.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.app){if(!appIds.includes(b.dataset.app))return;mobileAppsOpen=false;startOpen=false;if(b.dataset.app==='boss')markIncomingSeen(state);opened=b.dataset.app;minimized=false;windows[opened]??=desktopWindowGeometry(560,65);windows[opened].hidden=false;windows[opened].z=++layer;render();focusMobileApp();}else if(b?.dataset.window){if(b.dataset.window==='close')delete windows[opened];else if(windows[opened])windows[opened].hidden=true;render();focusMobileApp();}});

function learningReplay(a){return educationalReplay(a,escape);}
let lastIncomingId=null;
function incomingMessages(){
 const p=state.incoming?.pending;document.querySelector('.incoming-message')?.remove();
 if(!p||p.seen||p.result||opened==='boss')document.querySelector('.mobile-mail-notice')?.remove();
 if(isMobile()&&p&&!p.seen&&!p.result&&!p.mobileNotified&&opened!=='boss'&&!(Date.now()<p.snoozedUntil)){
  p.mobileNotified=true;localStorage.setItem(KEY,JSON.stringify(state));
  const notice=document.createElement('aside');notice.className='mobile-mail-notice';notice.setAttribute('role','status');notice.innerHTML='<button data-mobile-inbox><span aria-hidden="true">'+mailIcon('inbox')+'</span><span><strong>Chegou mensagem no Correio</strong><small></small></span><b aria-hidden="true">Abrir</b></button>';notice.querySelector('small').textContent=p.sender;document.querySelector('.desktop')?.append(notice);setTimeout(()=>notice.remove(),8500);
 }

 if(p&&!p.result&&!p.seen&&!isMobile()&&opened==='calls'&&state.active){for(const button of document.querySelectorAll('.desktop-icons [data-icon="boss"],.taskbar [data-task-app="boss"]')){button.classList.add('has-unread');if(!button.getAttribute('aria-label')?.includes('mensagem nova'))button.setAttribute('aria-label',(button.getAttribute('aria-label')||'Correio')+' · mensagem nova');}return;}
 if(!p||(state.active?.outcome&&opened!=='boss')||(!p.open&&Date.now()<p.snoozedUntil)||(isMobile()&&(!p.open||!document.querySelector('[data-window-id="boss"]'))))return;
 const scene=incomingScene(p),result=p.result;if(!scene)return;const box=document.createElement('section');box.className='incoming-message '+(p.open?'expanded':'');box.setAttribute('aria-label','Mensagem recebida');
 if(lastIncomingId===p.id)box.style.animation='none';lastIncomingId=p.id;
 box.innerHTML=mailMessageView(state,escape);
 if(opened==='boss'){box.classList.add('mail-inline');document.querySelector('[data-window-id="boss"] .app-window-body')?.prepend(box);}else if(!isMobile())document.querySelector('.desktop')?.append(box);
}
const incomingMoney=mailMoney;
function incomingResults(){
 const history=state.incoming?.history||[];if(!history.length)return '';
 return `<section class="incoming-results"><h2>Mensagens que chegaram para você</h2>${history.map(h=>`<details><summary>${escape(h.sender)} <span>${h.reward?'+ C$ '+h.reward:h.partial?'Conversa pausada':h.safe?'Tentativa interrompida':h.penalty?'Perdeu C$ '+h.penalty:'Tentativa de golpe registrada'}</span></summary><p><b>Sua escolha:</b> ${escape(h.label)}</p><p>${escape(h.feedback)}</p>${incomingMoney(h)}<small>Sinal de atenção: ${escape(h.signal)}</small></details>`).join('')}</section>`;
}
app.addEventListener('click',e=>{
 const choice=e.target.closest('[data-incoming-choice]'),action=e.target.closest('[data-incoming]');if(!choice&&!action)return;
 if(choice){if(answerIncoming(state,choice.dataset.incomingChoice)){markIncomingSeen(state);render();}return;}
 else if(action.dataset.incoming==='open'){state.incoming.pending.open=true;markIncomingSeen(state);opened='boss';windows.boss??=desktopWindowGeometry(560,75);windows.boss.hidden=false;windows.boss.z=++layer;}
 else if(action.dataset.incoming==='later')snoozeIncoming(state);
 else dismissIncoming(state);
 localStorage.setItem(KEY,JSON.stringify(state));if(action.dataset.incoming==='open')render();else incomingMessages();
});
setInterval(()=>{
 if(document.hidden)return;
 const before=state.incoming?.nextAt,arrived=checkIncoming(state);
 if(before!==state.incoming?.nextAt||arrived)localStorage.setItem(KEY,JSON.stringify(state));
 if(arrived){if(isMobile())render();else incomingMessages();document.dispatchEvent(new CustomEvent('qh-notification'));}
 else if(state.incoming?.pending&&!document.querySelector('.incoming-message'))incomingMessages();
 },1000);



app.addEventListener('click',event=>{
 const button=event.target.closest('[data-revenge-start],[data-revenge-answer],[data-revenge-next],[data-revenge-execute],[data-revenge-scene],[data-revenge-guide],[data-revenge-close]');if(!button||button.disabled)return;
 if(button.matches('[data-revenge-next],[data-revenge-execute]')&&revengeAdvanceGate(state).remaining)return;
 let changed=false,earned=false;
 if(button.hasAttribute('data-revenge-guide')){state.revengeTutorialSeen=true;changed=true;}
 else if(button.hasAttribute('data-revenge-start'))changed=startRevenge(state);
 else if(button.hasAttribute('data-revenge-answer'))changed=answerRevenge(state,Number(button.dataset.revengeStep),button.dataset.revengeAnswer);
 else if(button.hasAttribute('data-revenge-next'))changed=advanceRevenge(state);
 else if(button.hasAttribute('data-revenge-execute')){changed=beginRevengeScene(state);if(changed){state.active.revenge.scene.auto=true;actRevengeScene(state);}}
 else if(button.hasAttribute('data-revenge-scene'))changed=actRevengeScene(state);
 else changed=closeRevenge(state);
 if(!changed)return;
 if(button.hasAttribute('data-revenge-close'))document.dispatchEvent(new CustomEvent('qh-speaking-stop'));
 render();localStorage.setItem(KEY,JSON.stringify(state));
 document.querySelector('.revenge-body h2')?.focus({preventScroll:true});
 if(button.hasAttribute('data-revenge-answer')&&!state.active.revenge.feedback.correct)revengeMissFeedback();
 if(earned){document.dispatchEvent(new CustomEvent('qh-notification'));document.dispatchEvent(new CustomEvent('qh-revenge-dialogue'));}
});

app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.action==='finish'&&state.active?.revenge?.open&&revengeAdvanceGate(state).remaining)return;if(b.dataset.resultView){resultView=b.dataset.resultView;render();return;}if(b.hasAttribute('data-start-defense')){if(defenseLoading||typing||!state.active?.outcome)return;const active=state.active;defenseLoading=true;render();setTimeout(()=>{defenseLoading=false;if(state.active!==active)return;active.defenseOpened=true;resultView='defense';render();const panel=document.querySelector('.defense-investigation');panel?.setAttribute('tabindex','-1');panel?.focus({preventScroll:true});panel?.scrollIntoView({block:'start',behavior:'instant'});},650);return;}if(b.dataset.defenseSource){openSchemeApp(b.dataset.defenseSource);const record=document.querySelector('.investigation-records');if(record){record.closest('.app-window-body').scrollTop=0;record.querySelector('h2').setAttribute('tabindex','-1');record.querySelector('h2').focus({preventScroll:true});}return;}if(b.dataset.defenseInspect){if(inspectDefense(state,b.dataset.defenseInspect)){render();const button=document.querySelector('[data-defense-inspect="'+b.dataset.defenseInspect+'"]');button?.closest('article')?.insertAdjacentHTML('beforeend','<p role="status" tabindex="-1" class="record-noted">Registro anotado. Volte ao recado quando quiser decidir.</p>');document.querySelector('.record-noted')?.focus();}return;}if(b.dataset.defenseResolve){if(resolveDefense(state,b.dataset.defenseResolve,document.querySelector('#defense-citation')?.value||null,document.querySelector('#defense-relation')?.value||null,document.querySelector('#defense-fragment')?.value||null)){render();const verdict=document.querySelector('.defense-verdict');verdict?.setAttribute('tabindex','-1');verdict?.focus();}return;}if(b.hasAttribute('data-send-clone')){if(!typing&&sendCloneLink(state))render();return;}if(b.hasAttribute('data-review-clone')){if(!typing&&reviewClonedCard(state))render();return;}if(b.dataset.equipWallpaper){if(equipWallpaper(state,b.dataset.equipWallpaper))render();return;}if(b.dataset.pickOffer){if(chooseOffer(state,b.dataset.pickOffer))render();return;}if(b.hasAttribute('data-run-diagnostic')){if(!typing&&runRemoteDiagnostic(state))render();return;}if(b.hasAttribute('data-check-club')){checkAppCode('club');return;}if(b.dataset.pickSkin){if(chooseSkin(state,b.dataset.pickSkin))render();return;}if(b.hasAttribute('data-send-update')){if(!typing&&sendUpdateFile(state)){opened='calls';windows.calls??=desktopWindowGeometry(690,65);windows.calls.hidden=false;windows.calls.z=++layer;render();}return;}if(b.dataset.reviewUpdate){if(!typing&&reviewUpdateData(state,b.dataset.reviewUpdate))render();return;}if(b.dataset.openOperation){openSchemeApp(b.dataset.openOperation);return;}if(b.dataset.execute){if(typing)return;if(b.dataset.execute==='wallet'){const field=document.querySelector('#demo-card-number');if(!field||!verifyOperationCode(state,'wallet',field.value)){checkAppCode('wallet');return;}}presentOperation(()=>executeScheme(state,b.dataset.execute));return;}if(b.dataset.buy){const item=furniture.find(item=>item.id===b.dataset.buy);if(buy(state,item))state.lastPurchase=item.name;render();return;}if((!b.dataset.move&&!b.dataset.action&&!b.dataset.scheme&&!b.dataset.prepare&&!b.dataset.defenseChoice&&!b.hasAttribute('data-defense-stop')&&!b.hasAttribute('data-defense-exit')&&!b.hasAttribute('data-defense-mechanic')&&!b.hasAttribute('data-retry-ransomware'))||typing)return;if(b.hasAttribute('data-retry-ransomware')){if(!state.active?.gameOver||state.active.caseId!=='ransomware')return;document.dispatchEvent(new CustomEvent('qh-computer-restart'));clearDefensePlayback();state.active=startDefenseCall(defensePeople.findIndex(p=>p.caseId==='ransomware'),state.audience);render();animateIncoming();return;}if(b.dataset.scheme){if(state.active?.log.length)return;state.active.scheme=b.dataset.scheme;openSchemeApp(b.dataset.scheme);return;}if(b.dataset.prepare){if(!state.active||state.active.log.length)return;const id=b.dataset.prepare;state.active.prepared=true;opened='calls';windows.calls??=desktopWindowGeometry(690,65);windows.calls.hidden=false;windows.calls.z=++layer;beginConversation(id);return;}
  if(b.hasAttribute('data-defense-mechanic')){const active=state.active;if(useDefenseMechanic(active)){render();document.querySelector('[data-mechanic-status]')?.focus({preventScroll:true});}return;}if(b.dataset.defenseChoice){const active=state.active,choiceId=b.dataset.defenseChoice;if(b.disabled)return;if(requiresScamInteraction(active?.caseId,choiceId)&&!active.interaction){if(beginScamInteraction(active,choiceId)){clearDefensePlayback();render();document.querySelector('#scam-interaction-title')?.focus({preventScroll:true});}return;}if(!beginDefenseAction(active,choiceId))return;clearDefensePlayback();render();return;}if(b.hasAttribute('data-defense-stop')){const active=state.active;if(stopRansomware(active)){clearDefensePlayback();document.dispatchEvent(new CustomEvent('qh-defense-reaction',{detail:{tier:active.reactionTier}}));render();}return;}if(b.hasAttribute('data-defense-exit')){const active=state.active;if(endDefenseContact(active)){clearDefensePlayback();document.dispatchEvent(new CustomEvent('qh-defense-reaction',{detail:{tier:active.reactionTier}}));render();}return;}
 if(b.dataset.move){animateMove(b.dataset.move);return;}
 if(b.dataset.action==='greet'){beginConversation();return;}
  if(b.dataset.action==='start'){if(nextCall(state)){animateIncoming();return;}}
 else if(b.dataset.action==='close'){presentOperation(()=>closeCall(state));return;}
 else if(b.dataset.action==='finish'){if(state.classSession?.phase==='play'&&!state.active?.learningDefense?.result)return;searchTerm='';profileOpen=false;searchOpen=false;messageDraft='';if(state.cursor===0&&['active','defense'].includes(state.tutorial))state.tutorial='completed';const classroomDone=finishClassPlay(state);finishCall(state);if(classroomDone){openSchemeApp('help');return;}if(state.dayBreak){render();const body=document.querySelector('[data-window-id="calls"] .call-window-body');if(body)body.scrollTop=0;document.querySelector('.campaign-day-break h1')?.focus({preventScroll:true});return;}if(!state.finished&&nextCall(state)){animateIncoming();return;}}
 else if(b.dataset.action==='reset'){cancelPlayback();typing=null;defenseLoading=false;state=fresh();moneyEffects.reset(state.credits);state.mode='defense';state.tutorial='defense';}
 render();if(b.dataset.action==='finish'&&state.finished)document.dispatchEvent(new CustomEvent('qh-boss-report'));});if(state.active?.mode==='defense'&&!state.active.outcome&&!state.active.ransomwareDeadline)animateIncoming();else render();
setInterval(()=>{const a=state.active;if(a?.mode!=='defense'||!a.ransomwareDeadline)return;if(expireRansomware(a)){clearDefensePlayback();document.dispatchEvent(new CustomEvent('qh-computer-burnout'));render();document.querySelector('[data-retry-ransomware]')?.focus({preventScroll:true});return;}const counter=document.querySelector('[data-ransomware-countdown]');if(counter)counter.textContent=String(Math.max(0,Math.ceil((a.ransomwareDeadline-Date.now())/1000)));},1000);

app.addEventListener('pointerdown',e=>{
 const handle=e.target.closest('[data-resize-window]');if(!handle||e.button!==0)return;
 const id=handle.dataset.resizeWindow,w=windows[id],el=handle.closest('[data-window-id]');if(w.max)return;
 e.preventDefault();const rect=el.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;handle.setPointerCapture(e.pointerId);
 const move=ev=>{const next=resizeWindow({x:rect.left,y:rect.top,width:rect.width,height:rect.height},{x:ev.clientX-sx,y:ev.clientY-sy},handle.dataset.resizeAxis,{width:innerWidth,height:innerHeight});if(handle.dataset.resizeAxis!=='y'){w.width=next.width;el.style.width=w.width+'px';el.style.setProperty('--window-width',el.style.width);}if(handle.dataset.resizeAxis!=='x'){w.height=next.height;el.style.height=w.height+'px';el.style.setProperty('--window-height',el.style.height);}};
 const end=()=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);saveWindows();};
 handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
});



function chatTools(a,c){
 return `<div class="chat-toolbar"><span><i></i> ${typing?.speaker===c.name?'digitando…':a.outcome?'conversa encerrada':'online no Zape'}</span><div><button data-chat-profile aria-expanded="${profileOpen}" aria-label="Ver perfil de ${escape(c.name)}">Perfil</button><button data-chat-search aria-expanded="${searchOpen}" aria-label="Buscar na conversa">⌕</button></div></div>${profileOpen?`<aside class="chat-profile"><img draggable="false" src="/src/portraits/${c.id}-${characterExpression(a)}.svg" alt="${c.name}: ${expressionNames[characterExpression(a)]}" width="90" height="90"><div><strong>${escape(c.name)}</strong><p>${escape(c.role)}</p><small>${expressionNames[characterExpression(a)]} · ${a.log.filter(l=>l.speaker===c.name).length} respostas</small><button data-app="files">Consultar a ficha</button></div></aside>`:''}${searchOpen?`<div class="chat-search"><label class="sr-only" for="chat-search">Buscar mensagem</label><input id="chat-search" type="text" value="${escape(searchTerm)}" placeholder="Buscar nesta conversa…"><output id="chat-search-result" aria-live="polite"></output></div>`:''}`;
}
function applyConversationSearch(){
 const needle=searchOpen?searchTerm.trim().toLocaleLowerCase('pt-BR'):'';let matches=0;
 document.querySelectorAll('[data-window-id="calls"] .bubble:not(.typing-bubble)').forEach(el=>{const found=!needle||el.querySelector('p').textContent.toLocaleLowerCase('pt-BR').includes(needle);el.hidden=!found;if(found)matches++;});
 const output=document.querySelector('#chat-search-result');if(output)output.textContent=needle?matches+' mensagem(ns)':'Digite para buscar';
}
function saveTextFile(name,text){
 document.querySelector('.export-preview')?.querySelector('button')?.click();
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),panel=document.createElement('section'),previousFocus=document.activeElement;
 panel.className='export-preview';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Documento da firma');
 panel.innerHTML=`<div><header><strong>${escape(name)}</strong><button aria-label="Fechar documento">×</button></header><pre></pre><a download="${escape(name)}" href="${url}">Baixar arquivo ${name.endsWith('.json')?'JSON':'.txt'}</a></div>`;panel.querySelector('pre').textContent=text;document.body.append(panel);app.inert=true;
 const close=()=>{app.inert=false;panel.remove();URL.revokeObjectURL(url);previousFocus?.focus({preventScroll:true});};
 panel.querySelector('button').addEventListener('click',close);panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();(document.activeElement===panel.querySelector('button')?panel.querySelector('a'):panel.querySelector('button')).focus();}});panel.querySelector('button').focus();
}
app.addEventListener('input',e=>{
 if(e.target.id==='chat-search'){searchTerm=e.target.value;applyConversationSearch();}
 if(e.target.id==='caller-note'&&state.active){let warning=e.target.parentElement.querySelector('.note-privacy-warning');if(looksPersonal(e.target.value)){if(!warning){warning=document.createElement('p');warning.className='note-privacy-warning';warning.setAttribute('role','alert');e.target.after(warning);}warning.textContent='Essa anotação parece conter dados reais e não foi salva. Use só informações fictícias.';return;}warning?.remove();state.notes??={};state.notes[state.active.caller]=e.target.value;localStorage.setItem(KEY,JSON.stringify(state));}
});
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-tutorial-begin')){document.querySelector('.start-shift')?.click();return;}
 if(b.hasAttribute('data-tutorial-hint')){document.querySelector('[data-window-id="calls"] [data-defense-mechanic]')?.click();return;}
 if(b.hasAttribute('data-tutorial-choice')){const target=document.querySelector('[data-window-id="calls"] [data-defense-choice].tutorial-spotlight');target?.scrollIntoView({block:'center',behavior:'smooth'});target?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-tutorial-finish')){document.querySelector('.defense-feedback-actions [data-action="finish"]')?.click();return;}
 if(b.dataset.mailFolder){state.mailFolder=b.dataset.mailFolder;render();return;}
 if(b.hasAttribute('data-mail-star')&&state.incoming?.pending){state.incoming.pending.starred=!state.incoming.pending.starred;localStorage.setItem(KEY,JSON.stringify(state));render();return;}
 if(b.hasAttribute('data-tutorial-clues')){const clues=document.querySelector('[data-window-id="calls"] .defense-clues');if(clues){clues.open=true;if(state.active){state.active.tutorialCluesSeen=true;localStorage.setItem(KEY,JSON.stringify(state));}refreshTutorialGuidance();clues.scrollIntoView({block:'center',behavior:'smooth'});clues.querySelector('summary')?.focus({preventScroll:true});}return;}
 if(b.dataset.tutorial){if(tutorialAction(state,b.dataset.tutorial))render();return;}
 if(b.dataset.bossQuestion&&state.finished&&bossQuestions.some(q=>q.id===b.dataset.bossQuestion)){state.bossReply=b.dataset.bossQuestion;render();document.querySelector(`[data-boss-question="${state.bossReply}"]`)?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-chat-search')){searchOpen=!searchOpen;render();if(searchOpen)document.querySelector('#chat-search')?.focus();}
 if(b.hasAttribute('data-chat-profile')){profileOpen=!profileOpen;render();}
 if(b.hasAttribute('data-open-inbox')&&state.incoming?.pending){markIncomingSeen(state);state.incoming.pending.open=true;delete state.incoming.pending.snoozedUntil;localStorage.setItem(KEY,JSON.stringify(state));render();}
 if(b.hasAttribute('data-check-card'))checkAppCode('wallet');
 if(b.dataset.toggleDecor){const id=b.dataset.toggleDecor;if(!state.decor.includes(id))return;state.hiddenDecor??=[];state.hiddenDecor=state.hiddenDecor.includes(id)?state.hiddenDecor.filter(d=>d!==id):[...state.hiddenDecor,id];render();}
 if(b.hasAttribute('data-disconnect-remote'))presentOperation(()=>disconnectSession(state));
 if(b.hasAttribute('data-export-results'))saveTextFile('quase-honestos-aprendizagem.json',JSON.stringify(learningReport(state),null,2));
 if(b.hasAttribute('data-export-certificate')&&state.active?.scheme==='prize'){const c=callers.find(c=>c.id===state.active.caller);saveTextFile('batata-dourada-certificado.txt',`CERTIFICADO FICTÍCIO — QUASE HONESTOS\nBatata Dourada\nDestinatário: ${c.name}\nCategoria: ${selectedOffer(state.active)?.name||'Talento tubérculo'}\nEmitido pela firma imaginária. Válido somente dentro do jogo.`);}
});



app.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&(startOpen||profileOpen||searchOpen||mobileAppsOpen)){e.preventDefault();startOpen=false;profileOpen=false;searchOpen=false;mobileAppsOpen=false;render();document.querySelector(isMobile()?'.mobile-dock [data-mobile-apps]':'[data-window-id="calls"] [data-chat-profile]')?.focus();}
 const handle=e.target.closest('[data-resize-window]');if(!handle||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
 e.preventDefault();const w=windows[handle.dataset.resizeWindow],el=handle.closest('[data-window-id]');if(!w||w.max||isMobile())return;
 const r=el.getBoundingClientRect(),delta={x:e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0,y:e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0};
 const resized=resizeWindow({x:r.left,y:r.top,width:r.width,height:r.height},delta,handle.dataset.resizeAxis,{width:innerWidth,height:innerHeight});w.width=resized.width;w.height=resized.height;el.style.width=w.width+'px';el.style.setProperty('--window-width',el.style.width);el.style.height=w.height+'px';el.style.setProperty('--window-height',el.style.height);saveWindows();
});
installViewport(()=>{if(isMobile()&&state.active?.prepared&&state.tutorial==='active')state.tutorialCollapsed=true;render(true);});
app.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.followupInspect&&inspectFollowup(state,button.dataset.followupInspect)){render();return;}
 if(button.dataset.followupAction){const article=button.closest('article'),relation=article?.querySelector('[data-followup-relation]')?.value;if(respondFollowup(state,button.dataset.followupId,button.dataset.followupAction,relation))render();}
});
app.addEventListener('change',e=>{if(e.target.dataset.followupRelation&&setFollowupRelation(state,e.target.dataset.followupRelation,e.target.value))localStorage.setItem(KEY,JSON.stringify(state));});

app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-mobile-apps')){mobileAppsOpen=!mobileAppsOpen;render();document.querySelector(mobileAppsOpen?'.mobile-app-switcher button':'[data-mobile-apps]')?.focus();}if(mobileAppsOpen&&b.closest('.mobile-utilities')){mobileAppsOpen=false;render();}if(b.hasAttribute('data-mobile-inbox')){if(state.incoming?.pending){markIncomingSeen(state);state.incoming.pending.open=true;delete state.incoming.pending.snoozedUntil;}openSchemeApp('boss');}if(b.hasAttribute('data-new-messages')){const area=document.querySelector('[data-window-id="calls"] .conversation');area?.scrollTo(0,area.scrollHeight);b.remove();const view=windowViews.get('calls');if(view?.positions?.['.conversation'])Object.assign(view.positions['.conversation'],{bottom:true,unread:0});saveViews();clearReadNotice();}});
app.addEventListener('scroll',e=>{if(!e.target.matches?.('.conversation'))return;const area=e.target,view=windowViews.get('calls');if(!view)return;const bottom=area.scrollHeight-area.clientHeight-area.scrollTop<32;view.positions['.conversation']={top:area.scrollTop,bottom,count:area.querySelectorAll('.bubble:not(.typing-bubble)').length,unread:bottom?0:view.positions['.conversation']?.unread||0};if(bottom)clearReadNotice();saveViews();},true);

app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-classroom-start')&&beginClassSession(state)){openSchemeApp('help');}if(b.hasAttribute('data-classroom-export'))saveTextFile('quase-honestos-aprendizagem.json',JSON.stringify(learningReport(state),null,2));if(b.hasAttribute('data-classroom-resume')){if(!state.active&&!state.finished)nextCall(state);openSchemeApp('calls');}});
app.addEventListener('submit',e=>{if(!e.target.matches('.classroom-assessment'))return;e.preventDefault();const responses=Array.from({length:4},(_,i)=>({action:Number(e.target.elements['action'+i].value),evidence:Number(e.target.elements['evidence'+i].value)}));if(answerClassAssessment(state,responses)){if(state.classSession.phase==='play'){if(!state.active)nextCall(state);openSchemeApp('calls');}else{render();document.querySelector('.classroom-panel')?.setAttribute('tabindex','-1');document.querySelector('.classroom-panel')?.focus();}}});

app.addEventListener('keydown',e=>{if(e.key!=='Tab'||!mobileAppsOpen)return;const buttons=[...document.querySelectorAll('.mobile-app-switcher button')];if((e.shiftKey&&document.activeElement===buttons[0])||(!e.shiftKey&&document.activeElement===buttons.at(-1))){e.preventDefault();(e.shiftKey?buttons.at(-1):buttons[0])?.focus();}});

app.addEventListener('change',e=>{if(e.target.id!=='defense-citation')return;const d=state.active?.learningDefense;if(!d||d.result)return;d.citation=d.seen.includes(e.target.value)?e.target.value:null;localStorage.setItem(KEY,JSON.stringify(state));});

app.addEventListener('change',e=>{if(e.target.id!=='defense-relation')return;const d=state.active?.learningDefense;if(!d||d.result)return;d.relation=['matches','conflicts','missing','consent'].includes(e.target.value)?e.target.value:null;localStorage.setItem(KEY,JSON.stringify(state));});
app.addEventListener('change',e=>{if(e.target.id!=='defense-fragment')return;const d=state.active?.learningDefense;if(!d||d.result)return;d.fragment=e.target.value;localStorage.setItem(KEY,JSON.stringify(state));});

app.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.hasAttribute('data-support-desktop')){if(windows.calls)windows.calls.hidden=true;opened=null;minimized=true;render();}if(b?.hasAttribute('data-support-resume')&&state.active){state.active.supportPaused=false;render();document.querySelector('#player-message')?.focus();}});


document.addEventListener('qh-player-login',()=>{state.audience=localStorage.getItem('qh-player-age-band');if(state.incoming?.pending&&!state.incoming.pending.result&&!state.incoming.pending.audience)state.incoming.pending.audience=state.audience;if(state.active&&!state.active.audience)state.active.audience=state.active.outcome||state.active.actionPending||state.active.interaction||state.active.ransomwareDeadline?'legacy':state.audience;render();});

document.addEventListener('keydown',event=>{
 const panel=document.querySelector('.scam-interaction,.revenge-window');if(!panel)return;
 if(event.key==='Escape'){event.preventDefault();if(panel.matches('.scam-interaction')){if(actScamInteraction(state.active,'cancel')?.changed){render();localStorage.setItem(KEY,JSON.stringify(state));}}else if(closeRevenge(state))render();return;}
 if(event.key!=='Tab')return;
 const controls=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')],first=controls[0],last=controls.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
});

setInterval(()=>{
 for(const button of document.querySelectorAll('[data-revenge-unlock]')){
  const remaining=Math.max(0,Number(button.dataset.revengeUnlock)-Date.now());
  button.disabled=remaining>0;button.setAttribute('aria-hidden',String(remaining>0));button.closest('.revenge-next-slot')?.classList.toggle('is-waiting',remaining>0);
 }
 const {changed,earned}=advanceRevengePlayback(state);if(!changed)return;
 render();localStorage.setItem(KEY,JSON.stringify(state));
 if(earned){document.dispatchEvent(new CustomEvent('qh-notification'));document.dispatchEvent(new CustomEvent('qh-revenge-dialogue'));}
 document.querySelector('.revenge-body h2')?.focus({preventScroll:true});
},200);

function syncRevengeVisual(){
 const r=state.active?.revenge,scene=r?.scene;
 const root=document.querySelector('.revenge-scene,.revenge-final,.revenge-question:has(.revenge-lesson)');
 if(!root)return;
 const started=root.matches('.revenge-final')?r.completedAt:root.matches('.revenge-question')?r.answeredAt:scene?.startedAt||scene?.busyUntil-revengeSceneDuration;
 if(!Number.isFinite(started))return;
 const elapsed=Math.max(0,Date.now()-started);
 syncRevengeEntrances(root,elapsed);
 for(const animation of root.getAnimations({subtree:true})){
  if(animation.effect?.target?.closest?.('.revenge-wait-track'))continue;
  animation.currentTime=elapsed;
 }
}

app.addEventListener('change',event=>{const control=event.target.closest('[data-scam-toggle]');if(!control)return;actScamInteraction(state.active,'toggle:'+control.dataset.scamToggle);render();localStorage.setItem(KEY,JSON.stringify(state));});
app.addEventListener('click',event=>{const button=event.target.closest('[data-scam-command]');if(!button||button.disabled)return;event.preventDefault();const voice=state.active?.caseId==='fake-voice'&&state.active.interaction?.step===0&&button.dataset.scamCommand==='inspect';const result=actScamInteraction(state.active,button.dataset.scamCommand);if(!result?.changed)return;if(voice)document.dispatchEvent(new CustomEvent('qh-murmur',{detail:{caller:state.active.scammerId,emotion:'thinking',duration:4800,text:expandedById['fake-voice'].message}}));if(result.choice)beginDefenseAction(state.active,result.choice);render();localStorage.setItem(KEY,JSON.stringify(state));});
setInterval(()=>{const result=expireScamInteraction(state.active);if(!result?.choice)return;beginDefenseAction(state.active,result.choice);render();localStorage.setItem(KEY,JSON.stringify(state));},200);

app.addEventListener('click',event=>{const button=event.target.closest('[data-next-day]');if(!button||!advanceCampaignDay(state,defensePeople.length))return;if(nextCall(state)){localStorage.setItem(KEY,JSON.stringify(state));render();const body=document.querySelector('[data-window-id="calls"] .call-window-body');if(body)body.scrollTop=0;animateIncoming();}});

app.addEventListener('click',event=>{const button=event.target.closest('[data-review-tab]');if(!button)return;const card=button.closest('.case-review-card'),tab=button.dataset.reviewTab;for(const item of card.querySelectorAll('[data-review-tab]'))item.setAttribute('aria-selected',String(item===button));for(const panel of card.querySelectorAll('[data-review-panel]'))panel.hidden=panel.dataset.reviewPanel!==tab;});

app.addEventListener('click',event=>{const b=event.target.closest('[data-mail-guide-open],[data-mail-guide-close]');if(!b)return;state.incoming??={pending:null,history:[],seen:[]};state.incoming.tutorialSeen=b.hasAttribute('data-mail-guide-close');if(!state.incoming.tutorialSeen&&state.incoming.pending)state.incoming.pending.open=true;render();localStorage.setItem(KEY,JSON.stringify(state));});
