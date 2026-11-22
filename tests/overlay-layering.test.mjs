import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [game,styles]=await Promise.all([
 readFile(new URL('../src/game.js',import.meta.url),'utf8'),
 readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8')
]);

test('Resultado e vingança saem da janela transformada e respeitam as barras do dispositivo',()=>{
 assert.match(game,/\['\.defense-reaction-shade','\.defense-confetti','\.defense-feedback\.defense-reaction','\.revenge-window'\][\s\S]{0,220}desktopOverlayHost\?\.append\(overlay\)/);
 assert.match(styles,/\.desktop > \.revenge-window\{top:calc\(\(100dvh \+ 48px - 57px\)\/2\)/);
 assert.match(styles,/\.desktop > \.defense-feedback\.defense-reaction\{top:calc\(\(100dvh \+ 48px - 57px\)\/2\)!important/);
 assert.match(styles,/\.desktop > \.revenge-window\{top:calc\(\(100dvh \+ 86px - 78px - env\(safe-area-inset-bottom,0px\)\)\/2\)/);
 assert.match(styles,/\.desktop > \.defense-feedback\.defense-reaction\{top:calc\(\(100dvh \+ 86px - 78px - env\(safe-area-inset-bottom,0px\)\)\/2\)!important/);
 assert.match(styles,/@media\(max-width:780px\)\{\.desktop \.defense-reaction \.reaction-scroll\{max-height:calc\(100dvh - 212px\)\}\}/);
});
