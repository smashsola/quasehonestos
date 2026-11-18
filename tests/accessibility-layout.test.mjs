import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [controls,layout,app,loginCss]=await Promise.all([
 readFile(new URL('../src/a11y.css',import.meta.url),'utf8'),
 readFile(new URL('../src/a11y.css',import.meta.url),'utf8'),
 readFile(new URL('../src/accessibility.js',import.meta.url),'utf8'),
 readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8'),
]);

test('Titlebar controls are black at rest and the close control turns red on hover',()=>{
 assert.ok(controls.includes('button[data-window],\r\nhtml body #app .desktop .desktop-window>.windowbar button.window-max-control{color:#111!important'));
 assert.match(controls,/button\[data-window="close"\]:hover[^\{]*\{background:#c42b1c!important/);
 assert.match(controls,/button\[data-window="close"\]:hover svg path[^\{]*\{stroke:#fff!important/);
 assert.match(controls,/button\[data-window="minimize"\]::before[^\{]*\{content:"";display:block;width:12px;border-top:2px solid #111/);
});

test('Accessibility app text and color cards retain readable contrast and fit narrow windows',()=>{
 assert.match(app,/class="a11y-help-copy"/);
 assert.match(layout,/\.desktop-window\[data-window-id="accessibility"\] \.a11y-help-copy\{[^}]*color:#334d40/);
 assert.match(layout,/\.desktop-window\[data-window-id="accessibility"\] \.a11y-daltonism-card\{background:#183a2e!important/);
 assert.match(layout,/\.desktop-window\[data-window-id="accessibility"\] \.a11y-daltonism-card span\{color:#edf5ef!important/);
 assert.match(layout,/@media\(max-width:780px\)[\s\S]*?\.a11y-daltonism-grid\{grid-template-columns:minmax\(0,1fr\)\}/);
});

test('Age selection spacing wins against phone-specific label overrides',()=>{
 assert.match(loginCss,/\.os-login \.login-age label\{grid-template-columns:28px minmax\(0,1fr\)!important;gap:16px!important\}\s*$/);
});
