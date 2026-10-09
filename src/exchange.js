import {normalizeMessage} from './language.js';
import {updateProfiles} from './update-profiles.js';

// Each fictional tool requires its own action, never another tool's credential.
export function wrongItemRequest(text,scheme){
 const t=normalizeMessage(text);
 const asks=/manda|mande|passa|passe|envia|envie|preciso|quero|me da|me diz|me fala|informe|compartilh|liber/.test(t);
 if(!asks)return false;
 const wanted=/cartao|batatapay/.test(t)?'prize':/passe.*(?:clube|colher)|associacao/.test(t)?'club':/sessao|acesso remoto/.test(t)?'support':null;
 return !!wanted&&wanted!==scheme&&!(scheme==='link'&&wanted==='prize');
}
export const nextAction={link:'É para abrir a página do resgate e preencher o cadastro? Não estou instalando nada nem abrindo meu PC.',prize:'Meu cartão BatataPay? É esse dado que você está pedindo?',support:'Você quer que eu abra uma sessão do PãoOS? Ainda não autorizei acesso.',club:'Você está pedindo meu passe do Clube da Colher?',update:'Você quer que eu instale o CosmicChanger.qh? Pedir meu cartão não instala um arquivo. São coisas diferentes.'};
export function exchangeReceipt(a){
 if(a.scheme==='update')return {speaker:'Sistema',text:'Retorno do pacote CosmicChanger.qh após a instalação: '+updateProfiles[a.caller].map(f=>f.label+': '+f.value).join(' · ')+'. Estes dados foram revelados pela permissão do pacote, não ditados pelo personagem.',source:'package-permission'};
 return {speaker:'Sistema',text:'Item enviado pelo personagem nesta conversa: '+a.item.name+' · '+a.item.token,source:'character-share'};
}
export function repairPendingExchange(a){
 if(!a?.item||a.outcome||a.stage!=='ready')return a;
 if(a.scheme==='update'){
  const request=a.log.findLast(line=>line.speaker==='Você'&&!line.attachment)?.text||'';
  const installation=/instal|abrir|abra|abre|execut|usar|use/.test(normalizeMessage(request))&&/skin|changer|anexo|arquivo|pacote/.test(normalizeMessage(request));
  if(!a.exposureSource&&(!a.fileSent||wrongItemRequest(request,'update')||!installation)){
   a.item=null;a.stage='request';a.reviewedData=[];a.used=a.used.filter(id=>id!=='request');
   a.log.push({speaker:'Sistema',text:'Fluxo corrigido: o pedido anterior não autorizou a instalação. O perfil continua protegido; nenhum crédito foi movimentado.'});return a;
  }
  if(!a.log.some(line=>line.source==='package-permission'))a.log.push(exchangeReceipt(a));
  a.exposureSource='package-permission';
 }else if(!a.log.some(line=>line.text.includes(a.item.token)))a.log.push(exchangeReceipt(a));
 return a;
}
