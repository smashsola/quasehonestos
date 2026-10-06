const thresholds={nino:1.5,bento:1.55,yara:1.65,olga:1.75,davi:1.9,pri:1.95};
export const sharingThreshold=caller=>thresholds[caller]||1.9;
