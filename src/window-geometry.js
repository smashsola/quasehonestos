export function windowBounds(viewport){return {left:8,top:36,right:Math.max(8,viewport.width-8),bottom:Math.max(36,viewport.height-57)};}
export function fitWindow(rect,viewport){
 const b=windowBounds(viewport),width=Math.min(Math.max(1,rect.width),b.right-b.left),height=Math.min(Math.max(1,rect.height),b.bottom-b.top);
 return {width,height,x:Math.max(b.left,Math.min(b.right-width,rect.x)),y:Math.max(b.top,Math.min(b.bottom-height,rect.y))};
}
export function resizeWindow(rect,delta,axis,viewport){
 const b=windowBounds(viewport),maxWidth=Math.max(1,b.right-rect.x),maxHeight=Math.max(1,b.bottom-rect.y);
 return {...rect,width:axis==='y'?rect.width:Math.min(maxWidth,Math.max(Math.min(360,maxWidth),rect.width+delta.x)),height:axis==='x'?rect.height:Math.min(maxHeight,Math.max(Math.min(360,maxHeight),rect.height+delta.y))};
}
