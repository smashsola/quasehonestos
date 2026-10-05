// Authored jokes and protections for the fictional proposals.
export const characterAsides={
 nino:['Minha batata ganhou olhos de plástico. Agora ela também está desconfiando dessa conversa.','Acabei de desenhar uma batata de terno. Ela já está mais empregada que eu.'],
 olga:['Fiz um áudio explicando meu café. Tem introdução, intervalo e segunda temporada.','O bule apitou. Se for outra oferta, diga que ele já tem assinatura.'],
 davi:['Li o rodapé do rodapé. Descobri que até as letras pequenas têm letras pequenas.','Minha calculadora abriu. Só levou tempo suficiente para eu fazer a conta no papel.'],
 yara:['A colher prometeu transparência. É de inox, então começamos mal.','O garfo pediu quatro votos na eleição. A colher abriu uma comissão.'],
 pri:['A planilha da minha planilha pediu férias. Registrei como falta justificada.','Abri uma aba chamada “sem confusão”. Já tem dezessete inconsistências.'],
 bento:['Tentei recortar a mesa da foto. Agora o meme é só uma mesa sem contexto.','Minha tia respondeu meu meme com “amém”. Não sei em que fase da carreira estou.']
};
export const protectionCards={
 prize:{joke:'O troféu pode ser de batata. A origem precisa ser de verdade.',signal:'Um prêmio inesperado virou pedido de dados.',harm:'Compartilhar dados para receber um prêmio sem confirmar o concurso pode expor sua conta ou permitir cobranças.',action:'Abra o jogo ou site oficial por conta própria e confira o anúncio. Não envie dados de cartão ou códigos para o contato.'},
 support:{joke:'Computador crocante não é diagnóstico.',signal:'Um suporte que ninguém chamou pediu acesso ao computador.',harm:'Uma sessão remota pode permitir ver arquivos e usar aplicativos. Minimizar uma janela não protege o que está no PC.',action:'Encerre o contato e procure o suporte por um canal que você já conhece. Confirme a necessidade antes de autorizar acesso.'},
 club:{joke:'Até uma colher pode vestir um crachá. Isso não confirma o convite.',signal:'O convite pediu um passe e tentou apressar a decisão.',harm:'Um passe ou código pode liberar acesso à sua conta ou grupo. Simpatia, crachá e urgência não provam identidade.',action:'Confirme o convite com os organizadores por outro canal. Guarde códigos de acesso para você e leia as condições com calma.'},
 update:{joke:'Uma skin nova não precisa conhecer sua agenda.',signal:'Um pacote de skins pediu perfil, contato e rotina.',harm:'Instalar um arquivo desconhecido pode expor dados e comprometer o dispositivo. Permissões precisam combinar com a função prometida.',action:'Use canais oficiais, confira quem oferece o arquivo e revise as permissões. Se algo parecer suspeito, não instale e peça ajuda a alguém de confiança.'}
};
export function protectionCard(scheme,escape){
 const card=protectionCards[scheme];if(!card)return '';
 return `<details class="learning-replay protection-card"><summary>Tá, mas como eu me protejo?</summary><p><strong>${escape(card.joke)}</strong></p><h4>O sinal de perigo</h4><p>${escape(card.signal)}</p><h4>O que poderia acontecer fora do jogo</h4><p>${escape(card.harm)}</p><h4>Uma atitude para se proteger</h4><p>${escape(card.action)}</p><small>Dados, arquivos e créditos desta partida são fictícios.</small></details>`;
}
