const thresholds={nino:1.15,bento:1.2,yara:1.4,olga:1.45,davi:2.35,pri:2.5};
export const demandingCaller=caller=>caller==='davi'||caller==='pri';
export const sharingThreshold=caller=>thresholds[caller]||1.9;
