export const skinCatalog=[
 {id:'nebula',name:'Nebulosa',tier:'CÓSMICA',color:'#a591f6',accent:'#dfcaff',pattern:'Órbita violeta'},
 {id:'solar',name:'Ouro Solar',tier:'LENDÁRIA',color:'#e9b85e',accent:'#fff0ba',pattern:'Placas douradas'},
 {id:'ghost',name:'Fantasma',tier:'ESPECTRAL',color:'#72d7c2',accent:'#c8fff2',pattern:'Brilho espectral'}
];
export const selectedSkin=a=>skinCatalog.find(skin=>skin.id===a?.skin)||skinCatalog[0];
// A drawn prop from Batata Cósmica, with no connection to another game.
export function blasterPreview(skin){return `<svg viewBox="0 0 420 180" aria-hidden="true"><path d="M38 70h68l18-20h132l24 12h83v22h-83l-26 22H144l-12 47H94l15-47H64z" fill="${skin.color}" stroke="#1b2234" stroke-width="5" stroke-linejoin="round"/><path d="M130 55h107l-15 20h-92zm16 28h95l-20 18h-80z" fill="${skin.accent}"/><path d="M110 105h23l-11 43H99zm163-38h60v10h-60z" fill="#34405d"/><path d="M158 36h70v13h-70z" fill="#45516b" stroke="#1b2234" stroke-width="4"/><circle cx="254" cy="81" r="9" fill="${skin.accent}"/><path d="m76 79 9-6 9 6-9 6z" fill="${skin.accent}"/><path d="M148 110q1 22 27 15l8-19" fill="none" stroke="#34405d" stroke-width="6"/></svg>`;}
export function skinChanger(a,selected){const skin=selectedSkin(a),locked=!selected||!!a?.fileSent;
 return `<section class="skin-changer" aria-label="Prévia do Cosmic Changer"><header><strong>COSMIC CHANGER</strong><span>BATATA CÓSMICA · BLASTER</span></header><div class="skin-stage" style="--skin-glow:${skin.color}"><span class="skin-tier">${skin.tier}</span>${blasterPreview(skin)}<div><strong>${skin.name}</strong><small>${skin.pattern} · prévia cosmética</small></div></div><div class="skin-catalog">${skinCatalog.map(item=>`<button type="button" data-pick-skin="${item.id}" aria-pressed="${skin.id===item.id}" ${locked?'disabled':''} style="--skin-color:${item.color}">${blasterPreview(item)}<strong>${item.name}</strong><small>${item.tier}</small></button>`).join('')}</div><footer>${a?.fileSent?'Skin incluída no pacote enviado.':'Escolha a aparência prometida no anexo.'}<span>Prévia dentro do jogo</span></footer></section>`;
}
