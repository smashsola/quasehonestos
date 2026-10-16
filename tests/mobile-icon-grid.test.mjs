import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveMobileIcon,normalizeMobileIconOrder} from '../src/mobile-icon-grid.js';

test('mobile launcher order is validated, deduplicated, and completed',()=>{
 assert.deepEqual(normalizeMobileIconOrder(['calls','files','boss'],['boss','boss','unknown']),['boss','calls','files']);
});

test('dragging a mobile icon inserts it into a snapped grid position',()=>{
 assert.deepEqual(moveMobileIcon(['calls','files','boss','ledger'],'calls','boss'),['files','boss','calls','ledger']);
 assert.deepEqual(moveMobileIcon(['calls','files'],'missing','files'),['calls','files']);
});
