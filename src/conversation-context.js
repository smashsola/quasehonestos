export const characterProfiles={
 nino:'Entusiasmado e imaginativo; gosta de desenhar batatas. Faz perguntas simples e concretas. Se criticarem seu desenho, demonstra mágoa sem abandonar a dúvida sobre a proposta. Não confunde uma piada com autorização.',
 olga:'Acolhedora, firme e independente. Café e áudios longos fazem parte de sua rotina. Não gosta de pressa; pede tempo e condições claras. Usa “meu bem” com moderação, sem tratar o jogador como criança.',
 davi:'Metódico, direto e desconfiado de contatos inesperados. Confere origem, identidade e detalhes; humor seco sobre burocracia. Não aceita um cargo declarado como prova.',
 yara:'Sociável, protetora do grupo e dos códigos do clube. Quer consultar a turma e entender quem organizou. Brinca com a política dos talheres, mas mantém limites claros.',
 pri:'Analítica e atenta a inconsistências. Compara o que foi prometido com a fala atual, cita a contradição concreta. Humor de planilhas, sem transformar toda resposta em relatório.',
 bento:'Informal, brincalhão e ligado em memes. Pode rir de uma frase absurda, mas lembra de problemas ao compartilhar fotos e dados. Fica sério diante de desrespeito repetido.'
};
export function conversationContext(a){
 return {stage:['pitch','question','request','ready','done'].includes(a.stage)?a.stage:'pitch',outcome:['blocked','fooled','closed'].includes(a.outcome)?a.outcome:null,shared:!!a.item,fileSent:!!a.fileSent,trust:Math.max(0,Math.min(3,Number(a.trust)||0)),irritation:Math.max(0,Math.min(10,Number(a.irritation)||0)),suspicion:Math.max(0,Math.min(10,Number(a.suspicion)||0)),promisedFree:!!a.memory?.free};
}
export function replyDecision(context){return context.outcome?'ended':context.stage==='ready'&&context.shared?'shared':context.stage==='request'?'consider':'clarify';}
export function nextObjective(a){
 if(a.outcome)return 'A conversa terminou. Veja o resultado para continuar o expediente.';
 if(a.stage==='ready')return 'O item chegou. Abra o app da operação para concluir; conversar não recebe os créditos automaticamente.';
 if(a.stage==='request')return a.scheme==='prize'?'Próximo objetivo: pedir o cartão fictício da Batata Cósmica. Depois, use o código na Carteira Quase Digital.':a.scheme==='support'?'Próximo objetivo: pedir uma sessão de acesso ao PãoOS. Depois, abra a Torradeira Remota.':a.scheme==='club'?'Próximo objetivo: pedir o passe do clube. Depois, conclua a associação no Clube VIP.':a.fileSent?'O anexo chegou. Converse sobre a instalação do pacote fictício; o personagem ainda pode recusar.':'Envie o anexo pelo botão antes de conversar sobre a instalação.';
 return a.stage==='question'?'Responda à dúvida da última mensagem. Uma explicação ainda não significa que o personagem compartilhou algo.':'Apresente a proposta escolhida. O personagem vai querer entender de onde ela veio.';
}
