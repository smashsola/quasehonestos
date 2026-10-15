// Authored dialogue, selected by scene and turn. No inference or random catchphrases.
const scenes={
 prize:{
  pitch:['Seu desenho ganhou! A batata mandou lembranças e uma nota fiscal.','O troféu ficou pronto antes do regulamento. Eficiência da firma.'],
  question:['O concurso é de desenho. O regulamento é que foi desenhado nas coxas.','A organização tem um carimbo de batata. Reconhecimento vegetal.'],
  detail:['É o identificador BatataPay. A batata inventou até banco agora.','O certificado é enfeite; esse código mexe no saldo. Troféu com boleto é outra modalidade.'],
  request:['Manda o cartão fictício? A batata ainda não tem maquininha.','O prêmio é dourado. A burocracia veio na cor papel de pão.'],
  ready:['O código chegou. A firma comemorou antes de conferir a conta.','Vou abrir a Carteira. O troféu não cabe no bolso, mas o código cabe.'],
 },
 support:{
  pitch:['Seu PãoOS está lento ou está esperando a manteiga derreter?','Trouxe suporte técnico. A cesta de pão é cobrada à parte.'],
  question:['É uma sessão remota. O técnico vem pela tela; as migalhas ficam.','O chamado não veio de você. Veio da padaria de protocolos da firma.'],
  detail:['A sessão dá acesso ao computador. Não é só espiar se a torrada ficou pronta.','Esse acesso alcança arquivos. Até a pasta “receitas DEFINITIVAS versão 8”.'],
  request:['Abrimos a sessão? Prometo não passar manteiga no teclado.','Pode autorizar o acesso fictício? A torradeira já vestiu o jaleco.'],
  ready:['Sessão pronta. O mouse pediu para não ser servido com café.','Vou ao terminal. Se o teclado começar a cheirar a pão, é hora de parar.'],
 },
 club:{
  pitch:['O clube é VIP. O garfo ainda está na fila.','Convite exclusivo! A concha entrou por indicação da panela.'],
  question:['É o Clube da Colher. A assembleia do garfo foi adiada por falta de sopa.','A firma oferece o convite. A colher ainda não assinou a ata.'],
  detail:['O passe dá acesso à associação. O guardanapo não serve como procuração.','É uma credencial, não um cupom de sobremesa. Até a colher quer saber disso.'],
  request:['Manda o passe fictício? A catraca não aceita sopa.','Vamos usar o passe? A fila VIP está dando volta no escorredor.'],
  ready:['O passe chegou. Vou ao clube antes que o garfo ocupe minha cadeira.','Papelada recebida. A primeira reunião podia ser um almoço, né?'],
 },
 update:{
  pitch:['Chegou a skin. Agora a batata vai trabalhar de terno.','Seu blaster vai ficar elegante. Finalmente um emprego para a gravata da batata.'],
  question:['É roupa de batata, mas o pacote pede até currículo.','O instalador quer sua rotina. Vai trocar a skin ou organizar uma reunião?'],
  detail:['Perfil, contato e rotina. Só faltou pedir o tamanho do sapato do blaster.','A permissão expõe o perfil. Bastante papelada para vestir uma batata.'],
  request:['Instalamos? Seu blaster está vestido para uma reunião.','Quer instalar o pacote do jogo? A batata já escolheu a gravata.'],
  attachment:['Lá vai o pacote. A gravata da batata foi dobrada com cuidado.','Anexo enviado. Não sacode: tem uma batata de terno aí dentro.'],
  ready:['O perfil apareceu. Essa skin trouxe mais bagagem que o chefe nas férias.','Vou revisar o pacote. A batata trocou de roupa e esqueceu a agenda no bolso.'],
 },
 link:{
  pitch:['Tem vale-lanche. O pastel já trouxe o currículo.','A proposta promete um lanche. O chefe leu “lanche” e aprovou sem óculos.'],
  question:['O cadastro está maior que a fome do chefe.','Prometeram lanche e pediram cartão. Esse pastel veio com departamento financeiro.'],
  detail:['Abrir não envia dados. O pastel ainda está só na vitrine.','Enviar o cadastro expõe o cartão fictício. A fome não autentica a lanchonete.'],
  request:['Quer enviar o cadastro fictício? O pastel não aceita fiado.','A página abriu. O lanche continua invisível, igual ao aumento do estagiário.'],
  link:['Lá vai a página. O lanche é virtual; a fome é convincente.','Endereço enviado. Se tiver fila, peça senha para o pastel.'],
  ready:['O cadastro chegou. O lanche sumiu mais rápido que o chefe na faxina.','Vou conferir o retorno. Até agora, só quem comeu foi a burocracia.'],
 },
};
const voices={
 nino:{prize:'Meu desenho era uma batata, não um plano de negócios.',support:'Se o PãoOS travar, não vale assoprar o teclado como cartucho.',club:'Esse clube tem conquistas ou só talheres desbloqueáveis?',update:'Batata de terno eu aceito. Reunião obrigatória no jogo, não.',link:'Pastel lendário sem foto no inventário? Essa missão está estranha.'},
 olga:{prize:'Vou enquadrar o desenho. A nota fiscal pode ficar com o chefe.',support:'Se esse computador fizer café, me avise antes de mexer.',club:'Na minha reunião tem café. A colher que traga a própria xícara.',update:'Trocar de roupa é rápido. Esse pacote parece mala de três dias.',link:'Lanche de promessa não enche prato. Já tive reunião assim.'},
 davi:{prize:'Prêmio de desenho com departamento financeiro. Criaram uma modalidade.',support:'Favor não alimentar os periféricos. Já basta o nome PãoOS.',club:'Falta definir se a colher tem direito a voto ou só à sobremesa.',update:'Skin com currículo: terceirizaram até o figurino.',link:'O pastel abriu uma filial da burocracia. Vou precisar de uma cadeira.'},
 yara:{prize:'O desenho era meu. A empresa da batata surgiu agora.',support:'Se aparecer “atualizando o pão”, não vou deixar o computador no forno.',club:'O garfo pode reclamar, mas vai ter que respeitar a ata da sopa.',update:'Esse blaster vai chegar mais arrumado que eu ao campeonato.',link:'Se o pastel for patrocinador, quero contrato. E guardanapo.'},
 pri:{prize:'Vou lançar na planilha: uma batata e várias interrogações.',support:'Minha planilha não precisa de manteiga para rodar.',club:'Na lista de presença, marco a concha como titular ou suplente?',update:'A roupa mudou; as permissões continuam precisando de revisão.',link:'Na coluna “lanche recebido” ainda está zero. O pastel não fecha a conta.'},
 bento:{prize:'Isso merece uma foto. O boleto vai ficar fora do enquadramento.',support:'Se o mouse virar torrada, vai faltar espaço na mesa para o prato.',club:'A foto da reunião vai ser só gente escondida atrás de talher.',update:'Vou fotografar essa skin antes que chamem a batata para o RH.',link:'Promessa de pastel não dá nem para fotografar. Está faltando o recheio.'},
};
export function sceneHumor(a,step){
 const phase=step==='question'&&(a.guidedAnswers||0)>0?'detail':step;
 const lines=scenes[a.scheme]?.[phase]||scenes[a.scheme]?.question||[];
 const visits=(a.guidedHumorVisits?.[phase]||0)+(step==='request'&&((a.guidedAnswers||0)>=2||a.linkOpened)?1:0);
 return {phase,main:lines[visits%lines.length],aside:lines[(visits+1)%lines.length]};
}
export function jokeReaction(a,phase){
 const visits=a.guidedHumorVisits?.[phase]||0;
 const line=voices[a.caller]?.[a.scheme]||'Essa firma precisa de um intervalo.';
 return visits%2===0?line:({nino:'Já entendi a zoeira. Agora quero entender a próxima jogada.',olga:'A piada eu acompanhei. A proposta ainda precisa fazer sentido.',davi:'Humor registrado. Autorização continua sendo outro assunto.',yara:'Vou guardar essa para o campeonato. Ela não resolve a proposta.',pri:'A piada não mudou os números. Vamos ao que ainda falta.',bento:'Essa dá legenda. Não dá autorização.'})[a.caller];
}
