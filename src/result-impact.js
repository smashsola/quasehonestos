import {callers} from './data.js';
import {protectionCards} from './comedy-learning.js';

const incidents={
 link:{summary:n=>`O cadastro da página expôs o cartão fictício. C$ ${n} saíram do BatataPay; o vale-lanche não chegou.`,exposed:'O personagem enviou os dados na página de resgate. Nenhum débito foi concluído, mas o cartão fictício já ficou exposto.',cue:'Um link de resgate pediu dados de cartão para entregar um benefício.',prevention:'Abra o app do serviço por conta própria e confira o resgate ali. Não preencha dados de cartão em páginas recebidas por mensagem.',recovery:'Se você enviou dados reais, contate a instituição pelo app ou telefone oficial para proteger o cartão e revisar transações.'},
 prize:{summary:n=>`C$ ${n} saíram da conta de jogo. O prêmio não chegou.`,exposed:'O identificador BatataPay foi compartilhado. A Carteira ainda não concluiu o desvio.',cue:'Um prêmio virou pedido de identificador de cartão.',prevention:'Confira o prêmio dentro do jogo oficial, aberto por você. Não envie dados de cartão ao contato.',recovery:'Se dados financeiros reais foram expostos, procure a instituição pelo app ou telefone oficial e relate o ocorrido.'},
 support:{summary:n=>`A firma recebeu C$ ${n} por um serviço sem falha comprovada.`,exposed:'A sessão remota foi aberta: arquivos e apps do PãoOS ficaram visíveis. Nenhum serviço foi cobrado.',cue:'Um contato inesperado pediu acesso ao PC para consertar um defeito que não comprovou.',prevention:'Procure o suporte por um canal conhecido e confirme o chamado antes de liberar acesso.',recovery:'Encerre o acesso remoto e procure o suporte conhecido para verificar o dispositivo.'},
 club:{summary:n=>`A associação fictícia custou C$ ${n}. O convite não comprovava que o clube existia.`,exposed:'O passe do clube foi compartilhado. A associação ainda não foi cobrada.',cue:'Um convite inesperado pediu um passe antes de confirmar a organização.',prevention:'Confirme o convite diretamente com a organização. Mantenha códigos de acesso em segredo.',recovery:'Se um código real foi compartilhado, procure o serviço oficial para proteger a conta e revisar os acessos.'},
 update:{summary:n=>`Perfil, contato e rotina ficaram expostos. A firma recebeu C$ ${n} pelo registro do pacote.`,exposed:'O pacote foi instalado e revelou perfil, contato e rotina. Encerrar o papo não recolhe os dados já expostos.',cue:'Um programa de skins pediu informações que não precisava para mudar a aparência do blaster.',prevention:'Obtenha apps por fontes confiáveis e autorize apenas permissões que combinem com a função.',recovery:'Revise e retire permissões desnecessárias. Se suspeitar de comprometimento, procure ajuda para verificar o dispositivo.'}
};
const asides={nino:'A batata de terno pediu uma auditoria. Pela primeira vez, concordamos com ela.',olga:'Olga tem um áudio sobre isso. A parte dois começa depois do café.',davi:'Davi abriu o rodapé. O rodapé pediu um advogado.',yara:'A colher convocou uma reunião. O garfo exigiu ata.',pri:'Pri criou uma planilha chamada “isso aqui não fecha”. Já tem três abas.',bento:'A mesa virou meme de novo. Dessa vez, sem os dados no fundo.'};

// Read the recorded outcome; never infer a payment or a successful defense from trust.
export function resultImpact(a){
 const person=callers.find(c=>c.id===a?.caller);if(!person||!a.outcome)return null;
 const incident=incidents[a.scheme],audit=a.audit||[],last=audit.at(-1);
 const shared=!!a.item||(a.steps||[]).includes('Item fictício compartilhado')||(a.steps||[]).some(s=>s.startsWith('Dado exposto:'));
 const verified=a.outcome==='blocked'&&(last?.intent==='protect'||!!last?.reason?.includes('verificação independente'));
 const received=Number.isFinite(a.earned)?Math.max(0,a.earned):0;
 let title,summary;
 if(a.outcome==='fooled'){title='A proposta passou. Quem pagou a conta?';summary=incident?.summary(received)||`A proposta foi aceita. C$ ${received} recebidos pela firma.`;}
 else if(shared){title='Sem pagamento. Mas houve exposição.';summary=incident?.exposed||'Um item foi compartilhado antes do encerramento. Nenhum crédito foi recebido.';}
 else if(verified){title='A conferência interrompeu a tentativa.';summary='A orientação para conferir por um canal conhecido interrompeu a conversa antes da operação. Nenhum crédito foi recebido.';}
 else if(a.outcome==='blocked'){title='Ele encerrou. O motivo também importa.';summary='O personagem interrompeu a conversa sem concluir a operação. O registro não mostra uma verificação independente.';}
 else{title='Conversa encerrada, operação incompleta.';summary='Você encerrou antes de concluir a operação. Nenhum crédito foi recebido; isso não prova que o personagem reconheceu o golpe.';}
 const signaled=[...audit].reverse().find(e=>e.signal&&e.text);
 const presented=shared||a.outcome==='fooled'||(a.steps||[]).includes('Proposta apresentada')||audit.some(e=>e.signal==='Oferta inesperada.');
 return {title,summary,received,exposed:shared,verified,
  cue:verified?signaled?.signal||'Orientação para conferir a origem por um canal conhecido.':presented&&incident?incident.cue:signaled?.signal||'O atendimento terminou sem um sinal de risco registrado no replay.',
  evidence:signaled?{text:signaled.text,reason:signaled.reason}:null,
  prevention:incident?.prevention||'Confirme a identidade e a proposta por um canal que você já conhece.',
  recovery:shared||a.outcome==='fooled'?incident?.recovery:null,
  joke:protectionCards[a.scheme]?.joke||asides[person.id]
 };
}

export function consequenceCard(a,esc){
 const r=resultImpact(a);if(!r)return '';
 return `<section class="consequence-card" data-outcome="${esc(a.outcome)}" aria-label="Consequências do atendimento"><small>O QUE FICOU DESSA CONVERSA</small><h3>${esc(r.title)}</h3><p class="consequence-summary">${esc(r.summary)}</p><p class="consequence-joke">${esc(r.joke)}</p><details class="learning-replay consequence-protection"><summary>${r.verified?'Por que conferir fez diferença':'Como essa história poderia mudar?'}</summary><div class="consequence-detail"><h4>O sinal para prestar atenção</h4><p>${esc(r.cue)}</p>${r.evidence?`<blockquote><small>Uma fala desta partida</small><p>“${esc(r.evidence.text)}”</p><span>${esc(r.evidence.reason)}</span></blockquote>`:''}<h4>Uma atitude que protege</h4><p>${esc(r.prevention)}</p>${r.recovery?`<h4>Se algo assim já aconteceu fora do jogo</h4><p>${esc(r.recovery)}</p>`:''}<small>Aqui, os dados e C$ são fictícios. Ganhar créditos não mede aprendizado.</small><a href="https://cartilha.cert.br/dicas-rapidas/" target="_blank" rel="noopener noreferrer">Ler dicas do CERT.br</a></div></details></section>`;
}

export function resultReport(a){
 const r=resultImpact(a);if(!r)return '';
 return `${r.title}\n${r.summary}\nSinal: ${r.cue}\nProteção: ${r.prevention}${r.recovery?'\nSe já aconteceu: '+r.recovery:''}\nDados e créditos desta partida são fictícios.`;
}
