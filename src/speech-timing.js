export const voiceProfiles={nino:[205,.12,850,1500],olga:[165,.19,650,1100],davi:[115,.14,430,1350],yara:[240,.105,1000,1900],pri:[190,.095,750,1750],bento:[95,.21,350,950]};
export function speechTiming(caller,emotion,duration=1800){
 const [basePitch,basePace,f1,f2]=voiceProfiles[caller]||voiceProfiles.nino;
 const tone={amused:1.13,surprised:1.18,hurt:.86,angry:.9,confused:1.04}[emotion]||1;
 return {pitch:basePitch*tone,pace:basePace*(emotion==='amused'?.86:emotion==='hurt'?1.2:1),f1,f2,duration:Math.max(.6,Math.min(4.4,Number(duration)/1000||1.8))};
}
export function replyDuration(text){return Math.max(1400,Math.min(4400,900+String(text).length*18));}
