import {verifyOperationCode,runRemoteDiagnostic} from '../src/app-interactions.js';
export function prepareOperation(state){const app=state.active.item?.app;return app==='support'?runRemoteDiagnostic(state):['wallet','club'].includes(app)?verifyOperationCode(state,app,state.active.item.token):true;}
