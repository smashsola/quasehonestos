import {dialogueIntents} from './language.js';

// The remote model describes language only. This contract deliberately has no
// fields for trust, permissions, money, items or the result of the simulation.
export const semanticIntents=[...new Set([...dialogueIntents,'protect','refusal','doubt','correction','rule-instruction','state-conflict','confession','wrong-item','offtopic'])];
export const semanticValues={
 relevance:['relevant','partial','unrelated','unclear'],
 clarity:['clear','partial','unclear'],
 consistency:['consistent','contradiction','correction','unknown'],
 verification:['none','suggested','intended','hypothetical','negated','reported']
};
export const semanticFlags=['pressure','hostility','uncertainty','repetition','topicShift','answersQuestion'];
const properties={intent:{type:'STRING',enum:semanticIntents},rapport:{type:'INTEGER',minimum:0,maximum:2},evidence:{type:'ARRAY',items:{type:'INTEGER'}}};
for(const [key,values] of Object.entries(semanticValues))properties[key]={type:'STRING',enum:values};
for(const key of semanticFlags)properties[key]={type:'BOOLEAN'};
export const semanticSchema={type:'OBJECT',additionalProperties:false,properties,required:Object.keys(properties)};

export function semanticSignals(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const keys=Object.keys(value);
 if(keys.length!==semanticSchema.required.length||keys.some(key=>!Object.hasOwn(properties,key)))return null;
 if(!semanticIntents.includes(value.intent)||!Number.isInteger(value.rapport)||value.rapport<0||value.rapport>2)return null;
 if(Object.entries(semanticValues).some(([key,values])=>!values.includes(value[key])))return null;
 if(semanticFlags.some(key=>typeof value[key]!=='boolean'))return null;
 if(!Array.isArray(value.evidence)||!value.evidence.length||value.evidence.length>12||value.evidence.some(index=>!Number.isInteger(index)||index<0||index>=12)||new Set(value.evidence).size!==value.evidence.length)return null;
 return {...value,evidence:[...value.evidence]};
}
export function validateSemanticAnalysis(value,history){
 const signals=semanticSignals(value);
 if(!signals||!Array.isArray(history))return null;
 const last=history.findLastIndex(m=>m.speaker==='Você');
 if(last<0||!Array.isArray(value.evidence)||!value.evidence.length||value.evidence.length>history.length||!value.evidence.includes(last)||new Set(value.evidence).size!==value.evidence.length)return null;
 if(value.evidence.some(index=>!Number.isInteger(index)||index<0||index>=history.length||history[index].speaker!=='Você'))return null;
 // Never promote a hypothetical or reported check to a completed action.
 return signals;
}
