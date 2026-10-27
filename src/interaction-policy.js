import {expandedById} from './expanded-scams.js';
export const interactiveChoices={
 'pix-return':['verify'],
 'account-takeover':['verify','accept'],
 'fake-update':['accept'],
 'terms-permissions':['verify'],
 'fake-middleman':['verify'],
 'fake-donation':['verify'],
 'fake-mei':['verify'],
 'free-skins':['accept']
};
export function requiresScamInteraction(caseId,choice){return !!expandedById[caseId]&&!!interactiveChoices[caseId]?.some(suffix=>choice===caseId+'--'+suffix);}
