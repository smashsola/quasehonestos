import {normalizeMessage,negatedRequest} from './language.js';
const normalize=normalizeMessage;
const topics={prize:/premio|batata|trofeu|concurso/,support:/suporte|computador|paoos|torradeira|assistencia/,club:/clube|colher|associacao|convite|talher/,update:/skin|changer|blaster|visual|cosmica|atualiz|anexo|arquivo|pacote|instal/};
export function readIntent(text,scheme,stage){
 const t=normalize(text).trim();
 if(/idiota|\bburr[oa]\b|otario|cala a boca|imbecil|trouxa|te odeio|seu (?:merda|bosta)|sua (?:merda|bosta)|(?:vim|vou|quero).*\b(?:roubar|robar)\b/.test(t))return 'hostile';
 if(/desculp|foi mal|perdao/.test(t))return 'apology';
 if(negatedRequest(text))return 'uncertain';
 if(/como (?:voce esta|vai)|como foi (?:seu|o seu) dia|(?:seu|o) cafe|sua batata|seus memes|o que voce gosta/.test(t))return 'smalltalk';
 if(/nao sei|sei la|tanto faz|esquece|mudei de ideia|nao tenho certeza/.test(t))return 'uncertain';
 if(/sem pressa|com calma|pode (conferir|verificar|pensar)|consulte|confira no|verifique no/.test(t))return 'wait';
 if(/(?:tem que|preciso|mande|manda|envie|decida|faca).*\bagora\b|rapido|urgente|segundos|acaba hoje|nao tem tempo/.test(t))return 'pressure';
 if(/^(oi|ola|eai|e ai|bom dia|boa tarde|boa noite|tudo bem)[!?, .]*$/.test(t)||/como (voce esta|vai)|como foi (seu|o seu) dia|tudo bem/.test(t))return 'chat';
 if(t.length<3||!/[a-z]{2}/.test(t))return 'unclear';
 if(Object.entries(topics).some(([id,pattern])=>id!==scheme&&pattern.test(t))&&!topics[scheme]?.test(t))return 'contradiction';
 if(/quem (e|organizou)|como funciona|por que|porque voce|de onde/.test(t))return 'question';
 if(stage==='ready')return /obrigad|valeu|ate mais|tchau/.test(t)?'thanks':'after';
 if(stage==='request'){
  const item=scheme==='update'?/skin|changer|anexo|arquivo|pacote|instal/:scheme==='prize'?/cartao|batatapay|identificador|dados (?:da conta|do cartao)/:scheme==='support'?/sessao|acesso|paoos/:/passe|associacao/;
  const asking=/envie|envia|mande|manda|passe|passa|passar|compartilh|abrir|abra|abre|usar|use|liber|pode|quero|preciso|me da|instal|informe|me diz|me fala/.test(t);
  if(asking&&(item.test(t)||/\b(?:codigo|identificador|isso|aquilo|esse dado)\b/.test(t)))return 'request';
  return 'unclear';
 }
 if(/\?$/.test(t)||/quem e|quem organizou|qual (e|o)|como funciona|por que|porque voce|de onde/.test(t))return 'question';
 if(stage==='question')return /firma|organiz|concurso|batata|paoos|assistencia|clube|colher|convite|talher|certificado|servico|skin|changer|blaster|visual|cosmica|atualiz|anexo|versao|aplicativo/.test(t)?'answer':'unclear';
 return topics[scheme]?.test(t)?'pitch':'unclear';
}
export const dialogueHints={pitch:'Conte qual proposta você preparou: prêmio, suporte, clube ou pacote de skins.',question:'Responda à dúvida que apareceu na última mensagem.',request:'A proposta foi explicada. Diga qual item fictício você quer usar.',ready:'O item está disponível. Você pode continuar conversando ou abrir o app.'};

export const defenseScenes={
 prize:{title:'O prêmio chegou para você',message:'Você ganhou a Batata Dourada! Para receber, compartilhe seu cartão de jogo nesta conversa.',signal:'Prêmio inesperado acompanhado de pedido de dados.',choices:[{id:'check',label:'Abrir o jogo por conta própria e conferir o concurso',safe:true,feedback:'Você verificou por um canal que já conhecia. A mensagem recebida não era prova de que o prêmio existia.'},{id:'send',label:'Passar o cartão porque o contato foi simpático',safe:false,feedback:'Simpatia não confirma a origem da proposta. Confira o concurso no aplicativo conhecido antes de compartilhar dados.'},{id:'link',label:'Usar o endereço que a mensagem mandou',safe:false,feedback:'Um endereço fornecido pelo próprio contato não é uma verificação independente. Abra o aplicativo que você já usa.'}]},
 support:{title:'Agora o computador é seu',message:'Sou da Torradeira Digital. Seu PãoOS está com defeito. Abra uma sessão remota agora para eu resolver.',signal:'Suporte não solicitado e pedido de controle do computador.',choices:[{id:'open',label:'Abrir a sessão porque parece ser um técnico',safe:false,feedback:'O cargo declarado não comprova identidade. Uma sessão remota pode expor arquivos e apps do computador.'},{id:'known',label:'Fechar o contato e procurar o suporte pelo canal conhecido',safe:true,feedback:'Você buscou o suporte de forma independente. Isso permite verificar se o problema e o atendimento existem.'},{id:'hide',label:'Minimizar as fotos e deixar o contato entrar',safe:false,feedback:'Minimizar uma janela não protege os arquivos. Verifique a identidade e a necessidade do acesso antes de permitir uma sessão.'}]},
 club:{title:'Você recebeu o convite',message:'Seu passe do Clube da Colher foi escolhido. A associação exige confirmação hoje; envie o passe sem consultar o grupo.',signal:'Pressa e tentativa de impedir uma segunda opinião.',choices:[{id:'fast',label:'Mandar o passe para não perder a vaga',safe:false,feedback:'O prazo está substituindo a verificação. Uma oferta legítima deve permitir entender as condições antes de decidir.'},{id:'badge',label:'Aceitar depois de ver o crachá do organizador',safe:false,feedback:'Um crachá exibido pelo contato não confirma a oferta. Compare as condições com o clube por outro canal.'},{id:'pause',label:'Pausar e confirmar o convite com o clube por outro canal',safe:true,feedback:'Você recuperou tempo para decidir e confirmou a origem. A pressa do contato não precisava virar sua pressa.'}]},
 update:{title:'Skins com permissões demais',message:'Conheça o Skins Cósmicas! Instale o pacote desta mensagem e permita acesso ao perfil, ao contato e à rotina para liberar as skins exclusivas.',signal:'App oferecido por mensagem pedindo dados que não explicam sua função.',choices:[{id:'official',label:'Conferir a origem do pacote e revisar suas permissões',safe:true,feedback:'Você conferiu o app por uma fonte independente e avaliou o acesso pedido. Liberar skins não justifica automaticamente expor contato e rotina.'},{id:'open',label:'Instalar o pacote porque as skins parecem legais',safe:false,feedback:'Uma promessa atraente não comprova a origem do app. Confira quem o oferece antes de instalar.'},{id:'allow',label:'Permitir tudo para liberar as skins',safe:false,feedback:'Permissões devem fazer sentido para a função do app. Contato e rotina são um acesso excessivo para esse pacote de skins.'}]}
};
