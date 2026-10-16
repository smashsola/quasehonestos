export const voiceProfiles={nino:[205,.32,850,1500],olga:[165,.43,650,1100],davi:[115,.36,430,1350],yara:[240,.3,1000,1900],pri:[190,.28,750,1750],bento:[95,.46,350,950],bia:[220,.34,880,1550],caio:[135,.32,510,1420],luana:[245,.34,1040,1880],igor:[110,.38,440,1250],maya:[205,.31,900,1730],leo:[155,.36,680,1480]};
export function speechTiming(caller,emotion,duration=2800){
 const [basePitch,basePace,f1,f2]=voiceProfiles[caller]||voiceProfiles.nino;
 const tone={amused:1.13,surprised:1.18,hurt:.86,angry:.9,confused:1.04}[emotion]||1;
 return {pitch:basePitch*tone,pace:basePace*(emotion==='amused'?.92:emotion==='hurt'?1.15:1),f1,f2,duration:Math.max(.6,Math.min(7.5,Number(duration)/1000||2.8))};
}
export function replyDuration(text){return Math.max(2800,Math.min(7500,1200+String(text).length*35));}
