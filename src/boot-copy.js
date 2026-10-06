export const skipLines=[
 'O café pode esperar',
 'Pula, que o chefe tá vindo',
 'Liga logo essa torradeira',
 'Já entendi, sou quase empregado',
 'Sem suspense, tenho boleto'
];
export function nextSkipLine(storage){
 try{
  const saved=Number(storage.getItem('qh-boot-skip-index'));
  const index=Number.isInteger(saved)&&saved>=0?saved%skipLines.length:0;
  storage.setItem('qh-boot-skip-index',String((index+1)%skipLines.length));return skipLines[index];
 }catch{return skipLines[0];}
}
