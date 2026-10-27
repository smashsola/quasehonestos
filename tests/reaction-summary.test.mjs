import test from 'node:test';
import assert from 'node:assert/strict';
import {createReactionSummary,reactionSummaryDelay} from '../src/reaction-summary.js';
function node(name,id=''){return {id,classList:[name],isConnected:true,inert:false,matches:s=>s.includes('.'+name),animate(frames,options){this.animation={currentTime:0,frames,options};return this.animation;}};}
test('Summary reserves each block and reveals explanation, money and controls in order',()=>{
 let frame;const sync=createReactionSummary({requestFrame:cb=>{frame=cb;return 1;},cancelFrame(){}}),active={};
 const children=[node('defense-consequence-icon'),node('', 'defense-reaction-title'),node('defense-reaction-feedback'),node('defense-loss'),node('revenge-invitation'),node('defense-feedback-actions')];
 sync({children},active,1000);assert.deepEqual(children.map(n=>n.animation.options.delay),[0,40,100,220,320,420]);assert.ok(children.at(-1).inert);assert.ok(children.at(-2).inert);
 frame(2000);assert.equal(children.at(-1).inert,true);frame(2200);assert.equal(children.at(-1).inert,false);
 const replacement=node('defense-feedback-actions');sync({children:[replacement]},active,5000);assert.equal(replacement.animation.currentTime,4000);assert.equal(replacement.inert,false);
 const fresh=node('defense-feedback-actions');sync({children:[fresh]}, {},5000);assert.equal(fresh.animation.currentTime,0);assert.equal(fresh.inert,true);
});
test('Success, pause and failure feedback use the same reveal timing',()=>{for(const name of ['defense-reaction-feedback','defense-loss','defense-feedback-actions'])assert.equal(reactionSummaryDelay(node(name)),({ 'defense-reaction-feedback':100,'defense-loss':220,'defense-feedback-actions':420})[name]);});
