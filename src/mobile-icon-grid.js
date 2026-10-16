export function normalizeMobileIconOrder(ids,saved){
 const valid=new Set(ids),seen=new Set(),order=[];
 for(const id of Array.isArray(saved)?saved:[])if(valid.has(id)&&!seen.has(id)){seen.add(id);order.push(id);}
 for(const id of ids)if(!seen.has(id))order.push(id);
 return order;
}

export function moveMobileIcon(order,movingId,targetId){
 const next=[...order],from=next.indexOf(movingId),to=next.indexOf(targetId);
 if(from<0||to<0||from===to)return next;
 next.splice(from,1);next.splice(to,0,movingId);
 return next;
}
