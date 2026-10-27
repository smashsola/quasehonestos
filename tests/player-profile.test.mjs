import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {playerBalanceMood} from '../src/player-profile.js';
test('Humor acompanha os cinco estados do saldo, incluindo dívida',()=>{for(const [balance,mood] of [[500,'happy'],[1,'smile'],[0,'neutral'],[-1,'worried'],[-200,'worried'],[-201,'sad'],[NaN,'neutral']])assert.equal(playerBalanceMood(balance),mood);});
test('Todos os dez personagens têm os cinco retratos de saldo',async()=>{for(const id of ['bia','luana','yara','pri','olga','enzo','igor','leo','nino','caio'])for(const mood of ['happy','smile','neutral','worried','sad']){const svg=await readFile(new URL('../src/portraits/'+id+'-balance-'+mood+'.svg',import.meta.url),'utf8');assert.match(svg,/<svg/);assert.match(svg,/<\/svg>/);}});
