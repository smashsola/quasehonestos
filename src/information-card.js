import {clonedFields} from './clone-card.js';
import {updateProfiles} from './update-profiles.js';

export function informationCard(line,caller,esc){
 if(line.source==='link-form'){const fields=clonedFields({caller,scheme:'link',linkSubmitted:true,item:{token:'QH-DEMO-'+caller.toUpperCase()+'-LINK'}}).filter(f=>line.text.includes(f.value));return `<section class="chat-information" aria-label="Cadastro recebido pela página"><div class="information-heading"><strong>Cadastro recebido pelo Clona Cartão</strong></div><dl>${fields.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl><p class="information-origin">O personagem preencheu e enviou a página de resgate. Abrir o link sozinho não entregou os dados.</p></section>`;}
 if(line.source!=='package-permission')return `<p>${esc(line.text)}</p>`;
 // Render only values actually present in this saved receipt, not new profile data.
 const fields=(updateProfiles[caller]||[]).filter(field=>line.text.includes(field.value));
 if(!fields.length)return `<p>${esc(line.text)}</p>`;
 return `<section class="chat-information" aria-label="Dados revelados pelo pacote"><div class="information-heading"><span aria-hidden="true">▤</span><div><strong>Retorno do pacote</strong><small>CosmicChanger.qh · após a instalação</small></div></div><dl>${fields.map(field=>`<div><dt>${esc(field.label)}</dt><dd>${esc(field.value)}</dd></div>`).join('')}</dl><p class="information-origin">Origem: permissão concedida ao arquivo. O personagem não ditou estes dados.</p></section>`;
}
