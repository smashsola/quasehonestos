// Windows-style shortcut grid. Pointer movement stays free; drops snap into cells.
const origin={x:18,y:65},step={x:120,y:102};
function grid(viewport){return {cols:Math.max(1,Math.floor((viewport.width-110-origin.x)/step.x)+1),rows:Math.max(1,Math.floor((viewport.height-145-origin.y)/step.y)+1)};}
export function desktopIconPosition(position,viewport,{snap=true,occupied=[]}={}){
 const left=12,top=46,right=Math.max(left,viewport.width-110),bottom=Math.max(top,viewport.height-145);
 const free={x:Math.max(left,Math.min(right,Number.isFinite(position?.x)?position.x:origin.x)),y:Math.max(top,Math.min(bottom,Number.isFinite(position?.y)?position.y:origin.y))};
 if(!snap)return free;
 const {cols,rows}=grid(viewport),target={col:Math.max(0,Math.min(cols-1,Math.round((free.x-origin.x)/step.x))),row:Math.max(0,Math.min(rows-1,Math.round((free.y-origin.y)/step.y)))};
 const cells=[];for(let col=0;col<cols;col++)for(let row=0;row<rows;row++)cells.push({x:origin.x+col*step.x,y:origin.y+row*step.y,distance:(col-target.col)**2+(row-target.row)**2});
 cells.sort((a,b)=>a.distance-b.distance||a.x-b.x||a.y-b.y);
 const cell=cells.find(c=>!occupied.some(p=>p.x===c.x&&p.y===c.y))||cells[0];return {x:cell.x,y:cell.y};
}
export function initialDesktopIcons(ids,saved,viewport){
 const {rows}=grid(viewport),positions={};
 for(const [i,id]of ids.entries()){
  const p=saved?.[id],preferred=p&&Number.isFinite(p.x)&&Number.isFinite(p.y)?p:{x:origin.x+Math.floor(i/rows)*step.x,y:origin.y+(i%rows)*step.y};
  positions[id]=desktopIconPosition(preferred,viewport,{occupied:Object.values(positions)});
 }
 return positions;
}
