export function shuffledChoices(active,choices,salt='actions'){
 let seed=2166136261;for(const char of `${active?.caseId||''}:${active?.choiceSeed??0}:${salt}`){seed^=char.charCodeAt(0);seed=Math.imul(seed,16777619);}
 const list=[...choices];for(let i=list.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[list[i],list[j]]=[list[j],list[i]];}return list;
}
