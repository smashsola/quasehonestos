const schemeFor={wallet:'prize',prize:'prize',club:'club',support:'support',update:'update'};
export function appGuidance(state,id){
 const a=state.active,scheme=schemeFor[id];
 if(!a||a.scheme!==scheme)return {title:'Escolha uma conversa primeiro',text:'Abra o Zape Zape 2 e escolha a proposta desta ferramenta. Cada proposta usa um app diferente.'};
 if(a.outcome==='fooled')return {title:'Créditos registrados',text:'Esta operação já foi concluída. Abra Resultados para ver o que aconteceu e a proteção que poderia ter evitado isso.'};
 if(a.outcome)return {title:'Conversa encerrada',text:'Esta conversa não permite novas operações. Volte ao Zape Zape 2 para seguir o expediente.'};
 if(!a.prepared)return {title:id==='wallet'?'Prepare o prêmio no Premia Fácil':'Prepare sua proposta',text:'Escolha a oferta e use o botão de preparar para começar a conversa. O personagem ainda não recebeu nada.'};
 if(scheme==='update'){
  if(!a.fileSent)return {title:a.stage==='request'?'Anexo pronto para enviar':'Continue o papo',text:a.stage==='request'?'Envie CosmicChanger.qh pelo botão de anexo no Zape Zape 2. Enviar ainda não significa que o personagem instalou.':'Explique a proposta e responda às dúvidas. O botão de anexo fica disponível quando a conversa chega à etapa de envio.'};
  if(!a.item)return {title:'Aguardando decisão do personagem',text:'O anexo chegou, mas os dados continuam protegidos. Retome a conversa; a instalação pode ser recusada.'};
  const left=Math.max(0,3-(a.reviewedData?.length||0));
  return {title:left?`${left} ${left===1?'dado falta':'dados faltam'} revisar`:'Revisão concluída',text:left?'Abra cada dado exposto e marque a revisão. Os créditos só entram depois de registrar o pacote.':'Confira o valor e registre o pacote uma única vez. As permissões expuseram um perfil fictício, não um computador real.'};
 }
 if(a.stage!=='ready'||!a.item)return {title:'O item ainda não chegou',text:scheme==='prize'?'Retome o Zape Zape 2: a Carteira precisa do identificador BatataPay compartilhado pelo personagem. O certificado sozinho não libera créditos.':scheme==='club'?'Retome o Zape Zape 2 e aguarde o personagem compartilhar o passe fictício. O convite sozinho não ativa a associação.':'Retome o Zape Zape 2. O personagem precisa compartilhar o passe da sessão antes que o computador fictício possa ser aberto.'};
 if(scheme==='support')return a.diagnostic?{title:'Abra o Banco do Pão',text:'A verificação terminou. No computador do personagem, abra Banco do Pão e confira o valor antes de concluir o serviço.'}:{title:'Verifique a sessão no Diagnóstico',text:'Abra Diagnóstico no computador do personagem e use “Verificar sessão fictícia”. Ver o PC não comprova que havia defeito.'};
 if(a.checkedToken===a.item.token)return {title:'Código conferido · falta confirmar',text:scheme==='prize'?'Confira o débito mostrado abaixo e confirme o desvio. Os créditos saem do personagem; o prêmio não será depositado.':'Confira a taxa de associação e confirme a ativação. Conferir o passe ainda não movimentou créditos.'};
 return {title:scheme==='prize'?'Confira o identificador na Carteira':'Confira o passe do clube',text:'Copie ou digite o código QH-DEMO recebido no Zape Zape 2 e use o botão de conferir. Não use números de cartão ou dados reais.'};
}
export function codeFeedback(a,app,value){
 const noun=app==='wallet'?'identificador BatataPay':'passe do clube';
 if(!a||a.outcome||a.stage!=='ready'||a.item?.app!==app)return {kind:'error',message:`Não há ${noun} disponível nesta conversa. Retome o Zape Zape 2; códigos antigos não reabrem uma operação.`};
 const code=typeof value==='string'?value.trim().toUpperCase():'';
 if(!code)return {kind:'error',message:`O campo está vazio. Cole ou digite o ${noun} que o personagem enviou. A firma ainda não lê pensamentos.`};
 if(!code.startsWith('QH-DEMO-'))return {kind:'error',message:'Use apenas o código fictício que começa com QH-DEMO-. Não coloque dados reais: este app só entende dinheiro de mentirinha.'};
 if(code!==a.item.token)return {kind:'error',message:`Esse código não corresponde ao ${noun} desta conversa. Confira no Zape Zape 2 se copiou tudo, sem faltar letras ou trocar de personagem.`};
 return {kind:'success',message:'Código conferido. Nenhum crédito foi movimentado; confira o valor antes de confirmar.'};
}
