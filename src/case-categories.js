import {officeIcon} from './office-icons.js';
export const caseCategories=[
 {id:'identity',name:'Mensagens e identidade',icon:'club',cases:['whatsapp','account-takeover','fake-voice','romance-money','gift-selfie']},
 {id:'payments',name:'Pix e cobranças',icon:'wallet',cases:['fake-pix','boleto','pix-return','loan-fee','fake-mei']},
 {id:'shopping',name:'Compras e entregas',icon:'shop',cases:['delivery','fake-store','fake-rental','fake-ticket','marketplace-sale']},
 {id:'access',name:'Contas e dispositivos',icon:'support',cases:['ransomware','fake-update','terms-permissions','free-skins','bank-call']},
 {id:'opportunities',name:'Trabalho e oportunidades',icon:'ledger',cases:['task-income','fake-job','fake-investment','prize-fee','fake-middleman']},
 {id:'authority',name:'Pressão e falsa autoridade',icon:'files',cases:['fake-motoboy','card-swap','fake-government','fake-lawyer','fake-donation']}
];
export const categoryCaseOrder=caseCategories.flatMap(category=>category.cases);
export const categoryForCase=id=>caseCategories.find(category=>category.cases.includes(id));
export function dayCategory(state,day,people){const ids=(state.caseOrder||people.map(p=>p.caseId)).slice(day*5,day*5+5),categories=new Set(ids.map(id=>categoryForCase(id)?.id));return categories.size===1?categoryForCase(ids[0]):{...caseCategories[day],name:'Categorias variadas'};}
export function categoryCatalog(cases,escape){return `<section class="case-category-catalog"><h2>Atendimentos por categoria</h2><p>Nas novas campanhas, cada dia reúne cinco casos do mesmo tema.</p>${caseCategories.map((category,index)=>`<details class="case-category-group"><summary><span>${officeIcon(category.icon)}</span><span><b>${escape(category.name)}</b><small>Dia ${index+1} · cinco situações</small></span><i aria-hidden="true"></i></summary><ul>${category.cases.map(id=>`<li>${escape(cases[id]?.title||id)}</li>`).join('')}</ul></details>`).join('')}</section>`;}
