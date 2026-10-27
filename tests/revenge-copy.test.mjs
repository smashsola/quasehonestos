import test from 'node:test';
import assert from 'node:assert/strict';
import {revengeTeasers,revengeTeaserIndex} from '../src/defense-view.js';
import {defensePeople} from '../src/defense-round.js';
test('As trinta situações têm provocações diferentes e estáveis',()=>{assert.equal(revengeTeasers.length,30);assert.equal(new Set(revengeTeasers).size,30);const indexes=defensePeople.map(person=>revengeTeaserIndex({caseId:person.caseId}));assert.equal(new Set(indexes).size,30);for(const person of defensePeople)assert.equal(revengeTeaserIndex({caseId:person.caseId}),revengeTeaserIndex({caseId:person.caseId}));});
