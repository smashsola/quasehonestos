const balances={nino:90,olga:160,davi:120,yara:100,pri:150,bento:80};
export function virtualAccount(a){
 if(a?.scheme!=='prize'||a.item?.app!=='wallet')return null;
 const before=balances[a.caller]||100,amount=a.outcome==='fooled'?(a.earned||30):0;
 return {identifier:a.item.token,before,balance:before-amount,debit:amount};
}
export function walletAccountPanel(a,name,escape){
 const account=virtualAccount(a);if(!account)return '';
 return `<article class="virtual-account"><small>BATATAPAY · CONTA DE JOGO</small><h2>${escape(name)}</h2><p>Identificador obtido na conversa</p><code>${escape(account.identifier)}</code><div><span>Saldo do personagem</span><strong>C$ ${account.balance}</strong></div>${account.debit?`<p class="account-debit">− C$ ${account.debit} desviados para a firma</p><small>O personagem perdeu créditos; não recebeu um prêmio.</small>`:'<small>Dados obtidos. Nenhum crédito movimentado ainda.</small>'}</article>`;
}
