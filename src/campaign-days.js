import {mailDayRecap} from './mail-view.js';
import {dayCategory} from './case-categories.js';
import {caseReviewCard} from './case-review.js';
import {officeIcon} from './office-icons.js';
export const CASES_PER_DAY=5;
export const campaignDayCount=total=>Math.ceil(total/CASES_PER_DAY);
export function campaignDay(state,total=30){
 const cursor=Math.max(0,Math.min(total,state.cursor||0)),number=state.dayBreak?.completedDay||Math.min(campaignDayCount(total),state.finished?Math.max(1,Math.ceil(cursor/CASES_PER_DAY)):Math.floor(cursor/CASES_PER_DAY)+1);
 return {number,total:campaignDayCount(total),position:state.dayBreak?CASES_PER_DAY:state.finished?Math.max(1,(cursor-1)%CASES_PER_DAY+1):cursor%CASES_PER_DAY+1,completed:cursor,dayComplete:!!state.dayBreak};
}
export function checkpointDay(state,total){
 if(state.mode!=='defense')return;
 state.campaignDaysVersion=1;
 if(!state.finished&&!state.active&&state.cursor>0&&state.cursor<total&&state.cursor%CASES_PER_DAY===0)state.dayBreak={completedDay:state.cursor/CASES_PER_DAY,cursor:state.cursor};
 else state.dayBreak=null;
 state.shift=state.dayBreak?state.dayBreak.completedDay-1:Math.min(campaignDayCount(total)-1,Math.floor(state.cursor/CASES_PER_DAY));
}
export function restoreCampaignDays(state,total){
 if(state.mode!=='defense')return;
 if(state.active||state.finished)state.dayBreak=null;
 else if(state.campaignDaysVersion!==1)checkpointDay(state,total);
 else if(state.dayBreak&&(state.dayBreak.cursor!==state.cursor||state.cursor%CASES_PER_DAY!==0||state.cursor<=0||state.cursor>=total))state.dayBreak=null;
 state.campaignDaysVersion=1;
 state.shift=campaignDay(state,total).number-1;
}
export function advanceCampaignDay(state,total=30){
 const stop=state.dayBreak;if(state.mode!=='defense'||state.active||state.finished||!stop||stop.cursor!==state.cursor||state.cursor%CASES_PER_DAY!==0||state.cursor>=total)return false;
 state.dayBreak=null;state.shift=Math.floor(state.cursor/CASES_PER_DAY);if(state.incoming&&!state.incoming.pending)state.incoming.nextAt=null;return true;
}
export function campaignAdvanceLabel(state,total=30){
 if(state.cursor>=total-1)return 'Concluir campanha';
 return (state.cursor+1)%CASES_PER_DAY===0?'Encerrar dia '+(Math.floor(state.cursor/CASES_PER_DAY)+1):'Próxima situação';
}
export function campaignDaysView(state,people,cases,escape){
 const day=campaignDay(state,people.length);
 return `<div class="campaign-days" aria-label="Seis dias de expediente">${Array.from({length:day.total},(_,i)=>{const start=i*CASES_PER_DAY,done=Math.max(0,Math.min(CASES_PER_DAY,state.cursor-start)),current=day.number===i+1,category=dayCategory(state,i,people);return `<div class="campaign-day ${done===CASES_PER_DAY?'is-complete':current?'is-current':'is-locked'}" ${current?'aria-current="step"':''}><span>${officeIcon(category.icon)}</span><b>${escape(category.name)}</b><small>Dia ${i+1} · ${done===CASES_PER_DAY?'Concluído':current?`${done} de 5 concluídos`:'5 atendimentos'}</small></div>`;}).join('')}</div>`;
}
export function campaignDayBreakView(state,people,cases,escape){
 const stop=state.dayBreak;if(!stop)return '';
 const day=stop.completedDay,start=(day-1)*CASES_PER_DAY,history=(state.history||[]).filter(h=>h.caseId).slice(start,start+CASES_PER_DAY),safe=history.filter(h=>h.outcome==='blocked'&&h.choice!=='end-contact'&&!h.partial).length;
 return `<section class="welcome campaign-day-break"><div class="campaign-day-brand">${officeIcon('brand')}<small>FIM DO DIA ${day} · ${campaignDayCount(people.length)} DIAS DE EXPEDIENTE</small></div><h1 tabindex="-1">Dia ${day} concluído.</h1><p>Cinco atendimentos resolvidos. ${safe} risco${safe===1?'':'s'} interrompido${safe===1?'':'s'} após suas escolhas.</p><div class="campaign-day-balance"><span>Seu saldo continua com você</span><strong data-balance-value>C$ ${state.credits}</strong></div><button class="primary campaign-next-day" data-next-day>Começar dia ${day+1}</button>${campaignDaysView(state,people,cases,escape)}<details class="campaign-day-recap"><summary><span>${officeIcon('help')}</span><span><b>Rever os cinco casos do dia</b><small>Suas escolhas, o que conferir e as vinganças</small></span><i aria-hidden="true"></i></summary><div class="campaign-day-cases">${history.map((h,index)=>caseReviewCard(h,start+index,escape)).join('')}</div></details>${mailDayRecap(state,day,escape)}<p class="campaign-day-save">Nome, personagem, saldo e escolhas ficam salvos neste navegador. Você pode continuar agora ou voltar depois.</p><button class="campaign-day-desktop" data-show-desktop>Voltar ao computador</button></section>`;
}
