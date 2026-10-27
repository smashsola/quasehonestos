import test from 'node:test';
import assert from 'node:assert/strict';
import {captureRevengeLayout,restoreRevengeLayout} from '../src/revenge-layout.js';
function panel(phase='ready',playback=true,height=600){const scroll={scrollTop:145},body={offsetHeight:height,style:{}};return {dataset:{revengeCase:'fake-store',revengePhase:phase},querySelector:s=>s==='.revenge-window-scroll'?scroll:s==='.revenge-body'?body:s==='.revenge-scene'&&playback?{}:null,scroll,body};}
test('Each automatic stage and its final preserve scrolling and reserved height',()=>{
 for(const caseId of ['whatsapp','bank-call','fake-pix','boleto','delivery','ransomware','fake-motoboy','fake-store','fake-government','card-swap']){let current=panel();current.dataset.revengeCase=caseId;for(const [phase,playback,height] of [['ready',true,580],['ready',true,570],['won',false,500]]){const saved=captureRevengeLayout(current,478),next=panel(phase,playback,height);next.dataset.revengeCase=caseId;next.scroll.scrollTop=0;restoreRevengeLayout(next,saved,478);assert.equal(next.scroll.scrollTop,145);assert.ok(parseInt(next.body.style.minHeight)>=saved.height);current=next;}}
});
test('Feedback stays in place; a new question, case or viewport starts fresh',()=>{
 const saved=captureRevengeLayout(panel('quiz',false),478),feedback=panel('answered',false);feedback.scroll.scrollTop=0;restoreRevengeLayout(feedback,saved,478);assert.equal(feedback.scroll.scrollTop,145);
 for(const [phase,width,id] of [['quiz',478,'fake-store'],['answered',760,'fake-store'],['answered',478,'boleto']]){const next=panel(phase,false);next.scroll.scrollTop=0;next.dataset.revengeCase=id;restoreRevengeLayout(next,captureRevengeLayout(feedback,478),width);assert.equal(next.scroll.scrollTop,0);}
});
test('Prop entrances use the persisted scene clock and do not restart on another sync',async()=>{
 const {syncRevengeEntrances}=await import('../src/revenge-layout.js');let count=0;const animation={currentTime:0};
 const element={dataset:{rvEnter:'350'},animate(frames,options){count++;assert.equal(options.delay,350);assert.equal(options.duration,500);assert.equal(frames[0].filter,'opacity(0)');return animation;}};
 const root={querySelectorAll:()=>[element]};syncRevengeEntrances(root,200);assert.equal(animation.currentTime,200);syncRevengeEntrances(root,900);assert.equal(animation.currentTime,900);assert.equal(count,1);
});
