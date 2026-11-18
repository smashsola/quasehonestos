const STATE_KEY='quase-honestos-v1';
const SAFE_KEYS=['qh-player-avatar','qh-audience','qh-a11y-v1','qh-accessibility-settings','qh-pinned-apps','qh-mobile-icon-order','qh-desktop-icons','qh-windows','qh-window-views','qh-conquistas-v1','qh-quick-invite'];
const MAX_FILE_BYTES=2_000_000;
const safeJson=(value,fallback)=>{try{return JSON.parse(value);}catch{return fallback;}};
const storageGet=key=>{try{return localStorage.getItem(key);}catch{return null;}};
const storageSet=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};
const storageRemove=key=>{try{localStorage.removeItem(key);}catch{}};
export function privacySafeState(input){
 if(!input||typeof input!=='object'||!Array.isArray(input.history))return null;
 const allowed=['version','trustScale','shift','cursor','credits','history','discovered','decor','mode','finished','dayBreak','campaignDaysVersion','caseOrder','followups','mailFolder','classSession','hiddenDecor','migratedToDefense','tutorial','tutorialCollapsed','tutorialGrant','started','revengeEarned','revengeTutorialSeen','wallpaper','lastPurchase','audience'];
 const state=Object.fromEntries(allowed.filter(key=>Object.hasOwn(input,key)).map(key=>[key,structuredClone(input[key])]));
 state.active=null;
 state.notes={};
 state.incoming=null;
 state.previousCampaign=input.previousCampaign&&typeof input.previousCampaign==='object'?{mode:input.previousCampaign.mode,cursor:input.previousCampaign.cursor,shift:input.previousCampaign.shift,finished:input.previousCampaign.finished,active:null,incoming:null}:null;
 const historyKeys=['caller','trustScale','trust','outcome','ending','scheme','caseId','audience','partial','humor','choiceSeed','choice','balanceSettlement','revenge','gameOver','earned','moves','learningDefense'];
 state.history=state.history.map(entry=>{const clean={};for(const key of historyKeys)if(entry&&Object.hasOwn(entry,key))clean[key]=entry[key];return clean;});
 return state;
}
function safeState(){return privacySafeState(safeJson(storageGet(STATE_KEY)||'null',null));}
function exportData(){
 const state=safeState();if(!state)throw Error('Não encontrei um progresso válido neste navegador.');
 const items={[STATE_KEY]:JSON.stringify(state)};
 for(const key of SAFE_KEYS){const value=storageGet(key);if(value!==null)items[key]=value;}
 return {game:'quase-honestos',format:1,saved:new Date().toISOString(),items,notice:'Conversas, anotações e nome do perfil não são exportados. Uma situação que ainda não terminou recomeça ao carregar a cópia.'};
}
export function validImport(data){
 if(!data||data.game!=='quase-honestos'||data.format!==1||!data.items||typeof data.items!=='object'||Array.isArray(data.items))return false;
 const entries=Object.entries(data.items);if(entries.some(([key,value])=>key!==STATE_KEY&&!SAFE_KEYS.includes(key)||typeof value!=='string'))return false;
 const state=privacySafeState(safeJson(data.items[STATE_KEY]||'null',null));
 return !!state&&Number.isInteger(state.cursor)&&state.cursor>=0&&['defense','solo'].includes(state.mode);
}
let dialog=null,previousFocus=null;
function close(){dialog?.remove();dialog=null;previousFocus?.focus?.({preventScroll:true});}
function open(){
 if(dialog)return;
 previousFocus=document.activeElement;dialog=document.createElement('div');dialog.className='qh-a11y-panel';dialog.innerHTML='<section class="qh-a11y-win" role="dialog" aria-modal="true" aria-labelledby="qh-save-title"><header><strong id="qh-save-title">Salvamento</strong><button type="button" data-save-close aria-label="Fechar">×</button></header><div class="qh-a11y-body"><small class="eyebrow">TRAMBIQUE OS · SALVAMENTO</small><fieldset><legend>Seu progresso</legend><p data-save-summary></p><p>O expediente salva sozinho neste navegador. Uma cópia leva créditos e casos concluídos, sem conversas, anotações nem nome do perfil. Se um caso estiver em andamento, ele recomeça ao carregar.</p><div class="qh-a11y-foot"><button type="button" class="primary" data-save-continue>Continuar de onde parei</button><button type="button" data-save-export>Baixar cópia</button><button type="button" data-save-import>Carregar cópia</button></div><input type="file" accept="application/json,.json" hidden><p role="status" data-save-status></p></fieldset></div></section>';
 document.body.append(dialog);
 const name=storageGet('qh-player-name'),state=safeJson(storageGet(STATE_KEY)||'null',null),status=dialog.querySelector('[data-save-status]'),file=dialog.querySelector('input[type=file]');
 dialog.querySelector('[data-save-summary]').textContent=state?`Expediente de ${name||'Estagiário'} · ${Math.max(0,Number(state.cursor)||0)} casos concluídos · C$ ${Number(state.credits)||0}.`:'Ainda não há expediente salvo neste navegador.';
 dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-save-close]'))close();});
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
 dialog.querySelector('[data-save-continue]').onclick=()=>{close();document.querySelector('[data-action="start"]')?.click();};
 dialog.querySelector('[data-save-export]').onclick=()=>{try{const data=exportData(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='quase-honestos-salvamento.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Cópia baixada. Conversas e anotações ficaram de fora.';}catch(error){status.textContent=error.message||'Não foi possível criar a cópia.';}};
 dialog.querySelector('[data-save-import]').onclick=()=>file.click();
  file.onchange=async()=>{const chosen=file.files?.[0];if(!chosen)return;try{if(chosen.size>MAX_FILE_BYTES)throw Error('Esse arquivo é grande demais para um salvamento.');const data=JSON.parse(await chosen.text());if(!validImport(data))throw Error('Esse arquivo não parece uma cópia válida do jogo.');data.items[STATE_KEY]=JSON.stringify(privacySafeState(safeJson(data.items[STATE_KEY],null)));if(!confirm('Carregar a cópia substitui o progresso e as preferências salvos neste navegador. O caso atual será reiniciado. Continuar?'))return;const keys=[STATE_KEY,...SAFE_KEYS],previous=Object.fromEntries(keys.map(key=>[key,storageGet(key)]));for(const key of keys)storageRemove(key);let stored=true;for(const [key,value]of Object.entries(data.items))if(!storageSet(key,value)){stored=false;break;}if(!stored){for(const key of keys)storageRemove(key);for(const [key,value]of Object.entries(previous))if(value!==null)storageSet(key,value);throw Error('O navegador não permitiu salvar a cópia; o progresso anterior foi restaurado.');}status.textContent='Cópia carregada. Reabrindo o jogo…';setTimeout(()=>location.reload(),500);}catch(error){status.textContent=error.message||'Não foi possível carregar a cópia.';}finally{file.value='';}};
 dialog.querySelector('[data-save-close]').focus();
}
if(typeof window!=='undefined')window.qhSaveOpen=open;
