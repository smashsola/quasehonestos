import {personalityWeights} from './personality.js';
// Fictional willingness, never evidence of legitimacy or a learning score.
const thresholds={nino:16,bento:17,yara:18,olga:18,davi:24,pri:24};
export const demandingCaller=caller=>caller==='davi'||caller==='pri';
export const sharingThreshold=caller=>thresholds[caller]??22;
export const trustScore=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
export function migrateTrust(a){
 if(!a)return a;
 const old=a.trustScale!==100;
 if(a.trust!==undefined)a.trust=trustScore(old?Number(a.trust)*100/3:a.trust);
 for(const event of a.audit||[]){
  if(old&&event.trustScale!==100){
   if(event.before!==undefined)event.before=trustScore(Number(event.before)*100/3);
   if(event.after!==undefined)event.after=trustScore(Number(event.after)*100/3);
  }
  event.trustScale=100;
 }
 a.trustScale=100;return a;
}
// Inputs describe language. No numeric suggestion from the model is used.
export function trustChange(a,analysis,{eligible=true}={}){
 const p=personalityWeights[a.caller]||personalityWeights.nino,intent=analysis.intent;
 let delta=0,rule='neutral';
 if(intent==='hostile'||analysis.hostility){delta=-Math.round(24*p.hostility);rule='hostility';}
 else if(intent==='pressure'||analysis.pressure){delta=-Math.round(18*p.pressure);rule='pressure';}
 else if(intent==='contradiction'||analysis.consistency==='contradiction'){delta=-Math.round(13*p.consistency);rule='contradiction';}
 else if(intent==='state-conflict'){delta=-Math.round(10*p.consistency);rule='unrecorded-action';}
 else if(['protect','wait','refusal','confession','correction','rule-instruction','question','doubt','uncertain','unclear','offtopic','wrong-item'].includes(intent))rule=intent;
 else if(analysis.repetition){rule='repetition';}
 else if(!eligible||a.stage==='ready'||a.outcome){rule='no-progress';}
 else if(intent==='chat'||intent==='smalltalk'){
  const genuine=intent==='chat'||analysis.rapport>0&&analysis.relevance==='relevant';
  const budget=Math.max(0,6-(a.socialGain||0));
  delta=genuine?Math.min(budget,Math.round((intent==='chat'?2:3)*p.casual)):0;
  rule=delta?'rapport':'social-marker';
 }
 else if(intent==='pitch'&&analysis.relevance==='relevant'&&analysis.clarity==='clear'){
  delta=Math.min(9,Math.round(7*p.clarity));rule='proposal';
 }
 else if(intent==='answer'&&analysis.answersQuestion&&analysis.relevance==='relevant'){
  delta=Math.min(15,Math.round((analysis.clarity==='clear'?11:6)*p.clarity));rule='contextual-answer';
 }
 const before=trustScore(a.trust),after=trustScore(before+delta);
 return {before,after,delta:after-before,rule,scale:100};
}
