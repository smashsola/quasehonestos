// Local fictional dialogue; each caller keeps the same voice across proposals.
const voices={
 nino:{answer:'Entendi! Já estou desenhando essa história. Qual é a próxima etapa?',pressure:'Pera! Nem minha batata de corrida resolve tudo tão rápido.',hostile:'Ei! Até minha batata sabe conversar sem ofender.',unclear:'Me perdi no desenho. Pode explicar melhor?',received:'Tá aqui. Minha batata assinou como testemunha.'},
 olga:{answer:'Agora ficou mais claro. Vou deixar o café aqui. O que vem depois?',pressure:'Meu café nem esfriou. Vou decidir no meu tempo.',hostile:'Olha o respeito, meu bem. Não liguei para ouvir desaforo.',unclear:'Você pulou uma parte da história. Me conta de novo, com calma.',received:'Aqui está. Depois eu conto isso num áudio de sete minutos.'},
 davi:{answer:'Explicação anotada. Qual seria a próxima etapa desse atendimento?',pressure:'Prazo curto não conserta uma explicação incompleta.',hostile:'Isso não é um jeito profissional de conversar.',unclear:'Faltou informação. Pode explicar exatamente o que está propondo?',received:'Anotei o que você pediu. Vou guardar a conversa também.'},
 yara:{answer:'Beleza, entendi a proposta. Qual é o próximo passo?',pressure:'Calma. A colher ainda está em reunião com o garfo.',hostile:'Aqui no clube a regra é respeitar as pessoas.',unclear:'Não acompanhei essa jogada. Explica o próximo passo?',received:'Aqui vai. A colher está observando tudo.'},
 pri:{answer:'Certo, anotei sua explicação. Agora qual seria a próxima etapa?',pressure:'Pressa não resolve informação que não combina.',hostile:'Vou registrar essa mudança de tom. Prefiro conversar com respeito.',unclear:'Essa frase não respondeu ao que perguntei. Pode esclarecer?',received:'Compartilhei. Vou salvar esse registro na minha planilha.'},
 bento:{answer:'Ah, agora entendi a história. E o que você precisa depois?',pressure:'Se eu fizer correndo, vai virar outro meme errado.',hostile:'Zoar a mesa tudo bem. Me ofender já passou do ponto.',unclear:'Não entendi. Explica sem cortar a parte principal do meme?',received:'Pronto. Dessa vez não mandei a foto da mesa junto.'}
};
export function characterReply(caller,event,base=''){
 const line=voices[caller]?.[event];
 return line?(base?base+' '+line:line):base;
}
export function verificationReply(caller,scheme){
 const source=scheme==='update'?'a loja de aplicativos que eu já uso':scheme==='support'?'o suporte que eu já conheço':scheme==='club'?'a organização do clube':'o aplicativo do concurso';
 const openings={nino:'A batata pediu uma pausa.',olga:'Vou terminar meu café primeiro.',davi:'Vou conferir a origem desse atendimento.',yara:'Vou consultar a turma.',pri:'Vou comparar as informações.',bento:'Vou revisar tudo antes de compartilhar.'};
 return `${openings[caller]||'Vou conferir a proposta.'} Prefiro confirmar com ${source} antes de continuar.`;
}
