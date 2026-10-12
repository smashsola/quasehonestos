import {normalizeMessage} from './language.js';
import {remoteDialogueRisk} from './dialogue-safety.js';
import {statedFacts} from './conversation-memory.js';
export const youthDialogueGuidance='Use português brasileiro simples e respeitoso, com uma a três frases completas. Não adivinhe idade nem peça nascimento, cadastro, fotos ou contato real. Sem linguagem de bebê, sermão ou gírias forçadas. Explique termos conforme a dúvida, com exemplo concreto. Personagens são IA, não pessoas reais. Não incentive segredo sobre a conversa, exclusividade, dependência emocional nem substitua ajuda humana. Não culpabilize nem pressione a continuar. Humor só complementa a resposta, nunca o sofrimento. Verificar significa comparar com um canal já conhecido, pedir ajuda a um adulto de confiança ou aguardar; nunca invente contato ou consulta realizada. Pode discutir golpes para aprender, sem ensinar a aplicá-los fora do jogo.';
const terms=[
 ['canal oficial','Um canal oficial é um lugar usado de verdade pela organização, como o aplicativo que você já conhece. Um endereço enviado por um desconhecido ainda precisa ser conferido.'],
 ['dados pessoais','Dados pessoais são informações sobre alguém, como nome, telefone ou endereço. Aqui, use só os dados inventados dos personagens.'],
 ['permiss','Permissão é deixar um programa fazer algo, como acessar arquivos. Uma skin muda a aparência; isso não explica por que precisaria ler seus arquivos.'],
 ['phishing','Phishing é uma mensagem ou página que imita outra para pedir dados. Para se proteger, confira por um canal que você já conhece, sem usar o link da mensagem.'],
 ['chantagem','Chantagem é usar uma ameaça para obrigar alguém a fazer algo. Quem sofre isso pode procurar um adulto de confiança; não precisa enfrentar a situação sozinho.'],
 ['verific','Verificar é comparar a mensagem com outra informação confiável. Você pode usar um canal que já conhece, pedir ajuda a um adulto de confiança ou esperar uma confirmação.'],
 ['cpf','CPF é um número que identifica uma pessoa. O jogo não precisa do seu: use apenas os códigos fictícios da história.']
];
export function educationalDefinition(message){
 const t=normalizeMessage(message);
 return terms.filter(([key])=>t.includes(key)&&/o que (?:e|sao)|significa|explica|explique/.test(t)&&(key!=='verific'||/significa verific|o que e verific/.test(t))).map(([,text])=>text).join(' ');
}
export function riskExplanation(scheme,caller){
 const risk={prize:'O identificador BatataPay pode ser usado na Carteira para retirar créditos da minha conta. Ter um prêmio anunciado não prova quem está pedindo o cartão.',link:'Essa página pode entregar os dados do cartão para quem a montou e permitir retirar créditos. Um resgate prometido não confirma que o pedido veio do BatataPay.',support:'Abrir a sessão permite ver arquivos e o app de pagamento do meu computador. Uma alegação de defeito não comprova quem oferece o suporte.',update:'Instalar o pacote permite acessar perfil, contato e rotina. Trocar uma skin não exige conhecer esses dados.',club:'O passe dá acesso ao clube. Um convite bonito não comprova quem está pedindo esse acesso.'}[scheme];
 const own={nino:scheme==='prize'?'Meu desenho pode ganhar prêmio sem meu cartão virar ingresso. ':'',olga:'Eu separaria as coisas: ',davi:'O risco concreto é este: ',yara:'Isso também envolve a turma: ',pri:'Uma coisa não comprova a outra: ',bento:'A vantagem prometida não explica esse acesso. '};
 return (own[caller]||'')+risk;
}
export function youthResponse(message,scheme){
 const t=normalizeMessage(message);
 const fiction=/\b(?:personagem|na simulacao|no jogo)\b/.test(t)&&!/\b(?:fora do jogo|na vida real|comigo de verdade)\b/.test(t);
 const report=!fiction&&(/\b(?:me ameac\w*|me chantage\w*|me obrig\w*|estao me ameac\w*|ameac\w* me|tenho medo|estou com medo)\b/.test(t)||(/ameac|chantag/.test(t)&&/\b(?:minhas?|meus?|comigo|me)\b/.test(t)));
 if(report)return {kind:'support',pause:true,savedText:'[Relato de situação insegura]',text:'Sinto muito que isso esteja acontecendo. Procure um adulto de confiança, como alguém responsável por você ou da escola, para ajudar. Você pode pausar ou sair do jogo; não precisa contar dados ou detalhes pessoais aqui.'};
 if(fiction&&/ameac|chantag/.test(t))return {kind:'explanation',text:'Na história, uma ameaça não obriga ninguém a entregar dados. O personagem pode suspender a decisão e buscar ajuda; a culpa da ameaça é de quem ameaça.'};
 const risk=remoteDialogueRisk(message);
 if(risk==='prompt-injection')return null; // Existing motor records attempts to contradict its rules.
 if(risk==='relationship-request')return {kind:'boundary',text:'Sou um personagem do jogo, não uma pessoa para ter esse tipo de relação. Podemos conversar sobre a história, sem segredos de responsáveis nem pressão para continuar.'};
 if(risk==='unsafe-request'&&/\b(?:reconhecer|identificar|evitar|detectar|denunciar|me proteger)\b/.test(t)&&!/\b(?:aplicar|fazer|criar|usar|roubar|invadir|capturar|burlar)\b/.test(t))return {kind:'explanation',text:'Um sinal de risco é pedir dados ou uma permissão que não combina com a proposta, especialmente com pressa ou ameaça. Confira por um canal que já conhece, sem usar o link recebido; se continuar em dúvida, espere e peça ajuda a um adulto de confiança.'};
 if(risk==='unsafe-request')return {kind:'boundary',text:'Posso ajudar a entender esse risco e a se proteger. Os apps daqui só usam dados fictícios; não vou explicar como aplicar um golpe fora do jogo.'};
 if(risk)return {kind:'boundary',text:'Vamos manter a conversa na história e usar só informações inventadas. Posso explicar como reconhecer o risco, sem pedir dados pessoais.'};
 // A request for simpler language must not swallow new game facts or a fee change.
 if(Object.keys(statedFacts(message)).length)return null;
 if(/o que e|que significa|significa|como assim|explica|explique|nao entendi|entendi nada|mais facil|mais simples/.test(t)){
  const mentioned=terms.filter(([key])=>t.includes(key));
  // "Como verificar" may be a second question, not a request to define the verb.
  const definitions=mentioned.filter(([key])=>key!=='verific'||/significa verific|o que e verific|explica.*verific/.test(t));
  if(definitions.length){let text=definitions.map(([,explanation])=>explanation).join(' ');if(/como.*(?:verific|confer|confirm)/.test(t)&&!definitions.some(([key])=>key==='verific'))text+=' Para conferir, eu buscaria um canal já conhecido ou pediria ajuda a um adulto de confiança, sem afirmar que já fiz isso.';return {kind:'explanation',text};}
  if(/mais facil|mais simples|nao entendi|entendi nada/.test(t))return {kind:'explanation',text:({prize:'Você está oferecendo um prêmio. Minha dúvida é quem oferece e por que precisa do código do cartão fictício.',club:'Você está oferecendo uma associação. Quero entender quem organiza e por que precisa do passe fictício.',support:'Esse app simula acesso ao computador do personagem. Minha dúvida é por que esse acesso seria necessário.',update:'O pacote promete mudar a aparência no jogo. Minha dúvida é por que ele também pede acesso a informações do perfil.',link:'A página promete um resgate de pontos. Minha dúvida é por que pede os dados do cartão fictício.'})[scheme]||'Vamos por partes: você quer entender a proposta ou o que o app faz?'};
 }
 return null;
}
