export function recordEnding(a,actor,cause){
 if(!a.outcome||a.ending)return;
 a.ending={actor,cause,turn:(a.log||[]).filter(m=>m.speaker==='Você').length};
}
export function endingSummary(a){
 const e=a.ending;
 if(!e)return 'A conversa terminou sem uma causa detalhada neste salvamento antigo.';
 const causes={button:'Você usou Encerrar conversa antes de concluir a operação.',refusal:'Você recusou explicitamente a proposta; o personagem encerrou o contato.',protection:'O personagem interrompeu a tentativa após sua orientação de proteção.',verification:'O personagem interrompeu para conferir a proposta.',suspicion:'O personagem interrompeu por suspeita ou insistência.',hostility:'O personagem interrompeu após agressões repetidas.',confession:'O personagem interrompeu após a declaração de intenção de enganar.',disconnect:'Você desconectou a sessão remota.',operation:'A operação fictícia foi concluída.'};
 return causes[e.cause]||'O personagem interrompeu a conversa; a operação não foi concluída.';
}
