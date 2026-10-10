export const characterProfiles={
 nino:'Entusiasmado e imaginativo; gosta de desenhar batatas. Faz perguntas simples e concretas. Se criticarem seu desenho, demonstra mágoa sem abandonar a dúvida sobre a proposta. Não confunde uma piada com autorização.',
 olga:'Acolhedora, firme e independente. Café e áudios longos fazem parte de sua rotina. Não gosta de pressa; pede tempo e condições claras. Usa “meu bem” com moderação, sem tratar o jogador como criança.',
 davi:'Metódico, direto e desconfiado de contatos inesperados. Confere origem, identidade e detalhes; humor seco sobre burocracia. Não aceita um cargo declarado como prova.',
 yara:'Sociável, protetora do grupo e dos códigos do clube. Quer consultar a turma e entender quem organizou. Brinca com a política dos talheres, mas mantém limites claros.',
 pri:'Analítica e atenta a inconsistências. Compara o que foi prometido com a fala atual, cita a contradição concreta. Humor de planilhas, sem transformar toda resposta em relatório.',
 bento:'Informal, brincalhão e ligado em memes. Pode rir de uma frase absurda, mas lembra de problemas ao compartilhar fotos e dados. Fica sério diante de desrespeito repetido.'
};
export function characterState(caller,scheme){
 const knowledge={nino:['Participei do concurso de desenho da Batata Cósmica.'],olga:['Não me inscrevi nesse concurso. Não solicitei suporte.'],davi:['Não abri chamado de suporte. Tenho um canal conhecido para conferir.'],yara:['Participo do Clube Colher. A turma não pediu suporte.'],pri:['Os convites recebidos têm nomes diferentes. Quero comparar suas condições.'],bento:['Já tive problemas ao compartilhar fotos. Meu computador está funcionando.']};
 return {known:knowledge[caller]||[],goal:scheme==='support'?'Entender por que surgiu um atendimento não solicitado.':scheme==='update'?'Entender o acesso pedido pelo pacote de skins.':'Entender a oferta e as condições antes de decidir.',style:characterProfiles[caller],limits:['Não conheço a organização apenas porque o contato declarou um cargo.','Interesse e esclarecimento não são autorização.','Endereço, telefone e fatos pessoais não definidos no cenário não devem ser inventados.']};
}
export function conversationContext(a){
 const text=value=>typeof value==='string'?value.slice(0,180):null;
 const records=(items,keys,limit)=>Array.isArray(items)?items.slice(-limit).filter(item=>item&&typeof item==='object'&&!Array.isArray(item)).map(item=>Object.fromEntries(keys.filter(key=>typeof item[key]==='string'||typeof item[key]==='boolean'||Number.isInteger(item[key])).map(key=>[key,typeof item[key]==='string'?text(item[key]):item[key]]))):[];
 const m=a.facts,q=m?.question;
 const ending=a.ending&&['player','character','simulation'].includes(a.ending.actor)?{actor:a.ending.actor,cause:text(a.ending.cause),turn:Number.isInteger(a.ending.turn)?a.ending.turn:0}:null;
 const facts=m?{
  claims:Object.fromEntries(['price','origin','data'].filter(key=>typeof m.claims?.[key]==='string').map(key=>[key,text(m.claims[key])])),
  question:q&&typeof q==='object'?{topic:text(q.topic),topics:Array.isArray(q.topics)?q.topics.filter(topic=>typeof topic==='string').slice(0,3).map(text):[],status:text(q.status),text:text(q.text)}:null,
  verification:text(m.verification),verificationEvents:records(m.verificationEvents,['turn','status','source'],6),
  promises:records(m.promises,['turn','type','value'],6),events:records(m.events,['turn','type','stage','shared'],8),
  corrections:Array.isArray(m.corrections)?m.corrections.slice(-4).filter(c=>c&&typeof c==='object').map(c=>({turn:Number.isInteger(c.turn)?c.turn:0,previous:boundedClaims(c.previous),current:boundedClaims(c.current)})):[],
  refused:m.refused===true,provenance:'Afirmações e intenções do jogador. Nenhuma delas comprova uma ação ou a origem.'
 }:null;
 return {stage:['pitch','question','request','ready','done'].includes(a.stage)?a.stage:'pitch',outcome:['blocked','fooled','closed'].includes(a.outcome)?a.outcome:null,ending,shared:!!a.item,itemToken:/^QH-DEMO-[A-Z0-9-]{1,80}$/.test(a.item?.token||'')?a.item.token:null,fileSent:a.fileSent===true,linkSent:a.linkSent===true,linkOpened:a.linkOpened===true,linkSubmitted:a.linkSubmitted===true,cardReviewed:a.cardReviewed===true,operationCompleted:a.outcome==='fooled',independentlyVerified:a.independentlyVerified===true,trust:Math.max(0,Math.min(100,Number(a.trust)||0)),trustScale:100,irritation:Math.max(0,Math.min(10,Number(a.irritation)||0)),suspicion:Math.max(0,Math.min(10,Number(a.suspicion)||0)),promisedFree:!!a.memory?.free,proposalExplained:!!(a.proposalExplained||a.used?.includes('pitch')),doubtAnswered:!!(a.doubtAnswered||a.used?.includes('answer')),facts,lastIntent:['confession','correction','rule-instruction','protect','refusal','doubt','offtopic','state-conflict','wrong-item','chat','smalltalk','pitch','answer','question','request','wait','pressure','hostile','apology','uncertain','contradiction','thanks','after','unclear'].includes(a.lastIntent)?a.lastIntent:null};
}
function boundedClaims(claims){return Object.fromEntries(['price','origin','data'].filter(key=>typeof claims?.[key]==='string').map(key=>[key,claims[key].slice(0,180)]));}
export function replyDecision(context){return context.outcome?'ended':context.stage==='ready'&&context.shared?'shared':context.stage==='request'?'consider':'clarify';}
export function nextObjective(a){
 if(a.outcome)return 'A conversa terminou. Veja o resultado para continuar o expediente.';
 if(a.stage==='ready')return 'O item chegou. Abra o app da operação para concluir; conversar não recebe os créditos automaticamente.';
 if(a.stage==='request'&&a.scheme==='link')return !a.linkSent?'Envie a página fictícia pelo botão no Zape.':!a.linkOpened?'O personagem recebeu o link. Converse sobre abrir a página do resgate.':'A página abriu, mas não recebeu dados. Converse sobre preencher e enviar o cadastro; o personagem pode recusar.';
 if(a.stage==='request')return a.scheme==='prize'?'Próximo objetivo: pedir o cartão fictício BatataPay: o identificador é o dado que a Carteira usa para desviar créditos do personagem. Ele ainda pode recusar.':a.scheme==='support'?'Próximo objetivo: pedir uma sessão de acesso ao PãoOS. Depois, abra a Torradeira Remota.':a.scheme==='club'?'Próximo objetivo: pedir o passe do clube. Depois, conclua a associação no Clube VIP.':a.fileSent?'O anexo chegou. Converse sobre a instalação do pacote fictício; o personagem ainda pode recusar.':'Envie o anexo pelo botão antes de conversar sobre a instalação.';
 return a.stage==='question'?'Responda à dúvida da última mensagem. Uma explicação ainda não significa que o personagem compartilhou algo.':'Apresente a proposta escolhida. O personagem vai querer entender de onde ela veio.';
}
