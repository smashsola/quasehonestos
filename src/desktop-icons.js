// Keep shortcuts inside the usable desktop, without snapping away from a drop.
export function desktopIconPosition(position, viewport) {
 const left=12,top=46,right=Math.max(left,viewport.width-110),bottom=Math.max(top,viewport.height-163);
 return {x:Math.max(left,Math.min(right,Number.isFinite(position?.x)?position.x:18)),y:Math.max(top,Math.min(bottom,Number.isFinite(position?.y)?position.y:65))};
}
export function initialDesktopIcons(ids,saved,viewport) {
 const rows=Math.max(1,Math.floor((viewport.height-228)/102)+1);
 return Object.fromEntries(ids.map((id,i)=>{
  const p=saved?.[id];
  // A phone or smaller window must not rewrite the user's desktop arrangement.
  return [id,p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=12&&p.y>=46?{x:p.x,y:p.y}:desktopIconPosition({x:18+Math.floor(i/rows)*110,y:65+(i%rows)*102},viewport)];
 }));
}
