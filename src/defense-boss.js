export const bossResultLines=[
 'Hoje a pressa venceu o expediente. Amanhã, antes de clicar, confirme por outro canal. Até eu preciso desse lembrete.',
 'Uma tentativa ficou pelo caminho. Vamos aumentar essa lista: mensagem urgente também pode esperar uma conferência.',
 'Você interrompeu algumas tentativas. O próximo passo é desconfiar do pedido, mesmo quando a foto parece conhecida.',
 'Já tem conferência aparecendo nesse relatório. Continue assim: nome bonito e crachá não confirmam ninguém.',
 'A firma quase pegou o ritmo. Antes de pagar ou enviar dados, confira o pedido num canal que você já conhece.',
 'Metade do caminho veio com proteção. Na próxima rodada, leve essa mesma calma para as outras situações.',
 'A maioria das tentativas ficou pelo caminho. Boa. Agora revise as que passaram e veja qual conferência faltou.',
 'Você segurou bastante coisa hoje. O financeiro agradece; a impressora continua sem colaborar.',
 'Quase tudo ficou protegido neste treino. Revise os casos restantes: golpe gosta de se esconder no detalhe.',
 'Excelente expediente: você interrompeu quase todas ou todas as tentativas. Continue conferindo na vida real; o jogo não dá imunidade a golpe.'
];

export const bossResultVariants=bossResultLines.map((line,tier)=>[line,
 ['A pressa bateu o ponto antes de você. Na próxima, confira primeiro e deixe o golpista esperando.','Uma defesa já apareceu. Agora use a mesma conferência quando a foto e o nome parecerem familiares.','Tem proteção começando aqui. O truque é conferir o pedido, não confiar no crachá.','Você já achou algumas brechas. Revise as que passaram e veja onde a urgência te apressou.','A firma está entrando no ritmo. Antes do próximo Pix, confirme quem recebe e por quê.','Metade protegida é um começo. A outra metade virou material para a próxima conferência.','Boa parte ficou segura. O relatório mostra quais detalhes ainda merecem uma segunda olhada.','O golpista perdeu várias chances hoje. Só não deixa a comemoração clicar no próximo link por você.','Quase tudo protegido. Falta pouco; até pedido bem escrito precisa de confirmação.','Excelente! Hoje os golpes ficaram sem expediente. Continue verificando fora do jogo também.'][tier],
 ['Esse relatório pede uma pausa. Quando a mensagem correr, você não precisa correr junto.','Um caso protegido mostra que você consegue. Repita o hábito de buscar outro canal.','Algumas tentativas pararam em você. Agora repare também nos pedidos de códigos e permissões.','Já tem conferência no relatório. A próxima melhoria é confirmar mesmo quando o pedido parece comum.','As decisões estão melhorando. O banco agradece quando a confirmação vem antes da transferência.','Você protegeu metade dos casos. Reveja o restante sem pressa e identifique o pedido que mudou tudo.','Mais proteção que prejuízo. Agora compare as escolhas que funcionaram com as que deixaram brecha.','Bom expediente! Os golpes trabalharam bastante e ganharam pouco espaço.','Só alguns detalhes escaparam. Abra esses casos: o melhor aprendizado está no ponto da decisão.','A firma pode respirar. Você confirmou antes de agir em quase tudo; mantenha esse cuidado.'][tier]
]);
const childBossLines=['Hoje alguns pedidos passaram sem conferir. Vamos rever os casos e descobrir o que faltou.','Uma conferência já ajudou. Tente fazer isso antes dos próximos pedidos também.','Algumas tentativas pararam. Continue conferindo quem pediu antes de responder.','Você já encontrou algumas armadilhas. Agora olhe as que passaram.','A firma está pegando o ritmo. Confira antes de mandar dinheiro ou dados.','Metade dos casos ficou protegida. Vamos aprender com a outra metade também.','Você protegeu boa parte dos casos. Veja qual pista faltou nos outros.','Boa! Muitos pedidos foram conferidos. Continue assim, sem pressa.','Quase tudo ficou protegido. Os detalhes dos outros casos podem ajudar.','Muito bem! Você conferiu quase todos ou todos os pedidos. Continue pedindo ajuda e conferindo fora do jogo.'];
export function defenseBossResult(state){
 const campaign=(state.history||[]).filter(item=>item.caseId);
 const protectedCount=campaign.filter(item=>item.outcome==='blocked'&&item.choice!=='end-contact'&&!item.partial).length;
 const completed=campaign.length;
 // Use the full campaign as the denominator: an early crash is not a perfect shift.
 const tier=Math.min(9,Math.floor(protectedCount/Math.max(10,completed)*10));
 const crashed=campaign.some(item=>item.gameOver);
 return {tier,protectedCount,completed,line:state.audience==='child'?childBossLines[tier]:bossResultVariants[tier][((campaign.filter(x=>(x.choice==='end-contact'||!!x.partial)).length+campaign.filter(x=>x.revenge?.credited).length)%3)],note:crashed?'O expediente terminou antes da hora. Revise o caso do arquivo suspeito antes de recomeçar.':`${protectedCount} de ${completed} situações tiveram o risco interrompido. Pausar é um começo; confirme o pedido antes de retomar.`};
}

export function defenseBossPanel(state,escape){
 const result=defenseBossResult(state);
 return `<article class="defense-boss-report" data-boss-tier="${result.tier}" aria-labelledby="defense-boss-title"><div class="defense-boss-heading"><div class="defense-boss-portrait"><img src="/src/portraits/boss.svg" width="84" height="84" alt="Chefe da Quase Honestos" draggable="false"><span aria-hidden="true"></span></div><div><small>CHEFIA · BALANÇO DO EXPEDIENTE</small><h2 id="defense-boss-title">Antes de bater o ponto…</h2></div></div><p class="defense-boss-line" data-boss-line>${escape(result.line)}</p><p class="defense-boss-note">${escape(result.note)}</p></article>`;
}
