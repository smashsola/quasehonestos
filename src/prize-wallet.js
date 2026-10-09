const balances={nino:900,olga:1600,davi:1200,yara:1000,pri:1500,bento:800};
export function virtualAccount(a){
 if(!((a?.scheme==='prize'&&a.item?.app==='wallet')||(a?.scheme==='link'&&a.item?.app==='link')))return null;
 const before=balances[a.caller]||1000,amount=a.outcome==='fooled'?(a.earned||300):0;
 return {identifier:a.item.token,before,balance:before-amount,debit:amount};
}
export function walletAccountPanel(a,name,escape){
 const account=virtualAccount(a);if(!account)return '';
 return `<article class="virtual-account"><small>BATATAPAY · CONTA DE JOGO</small><h2>${escape(name)}</h2><p>Identificador obtido na conversa</p><code>${escape(account.identifier)}</code><div><span>Saldo do personagem</span><strong>C$ ${account.balance}</strong></div>${account.debit?`<p class="account-debit">− C$ ${account.debit} desviados para a firma</p><small>O personagem perdeu créditos; não recebeu um prêmio.</small>`:'<small>Dados obtidos. Nenhum crédito movimentado ainda.</small>'}</article>`;
}
