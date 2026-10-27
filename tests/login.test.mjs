import test from 'node:test';
import assert from 'node:assert/strict';
import {needsAgePicker} from '../src/login.js';

test('A faixa etária salva dispensa nova pergunta; dados ausentes ou inválidos exigem escolha',()=>{
 for(const band of ['child','teen'])assert.equal(needsAgePicker(band),false);
 for(const band of [undefined,null,'','legacy','adult','child '])assert.equal(needsAgePicker(band),true);
});
