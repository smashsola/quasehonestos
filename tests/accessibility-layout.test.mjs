import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [controls,layout,app,loginCss,loginRuntime,game,achievements,accessibilityCss,interfaceCss,audio]=await Promise.all([
 readFile(new URL('../src/a11y.css',import.meta.url),'utf8'),
 readFile(new URL('../src/a11y.css',import.meta.url),'utf8'),
 readFile(new URL('../src/accessibility.js',import.meta.url),'utf8'),
 readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8'),
 readFile(new URL('../src/login.js',import.meta.url),'utf8'),
 readFile(new URL('../src/game.js',import.meta.url),'utf8'),
 readFile(new URL('../src/achievements.js',import.meta.url),'utf8'),
 readFile(new URL('../src/accessibility.css',import.meta.url),'utf8'),
 readFile(new URL('../src/conversation-ui.css',import.meta.url),'utf8'),
 readFile(new URL('../src/audio.js',import.meta.url),'utf8'),
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
 assert.match(loginCss,/\.os-login \.login-age label\{display:flex!important;align-items:flex-start!important;gap:16px!important\}/);
 assert.match(loginCss,/\.os-login \.login-age label>span\{flex:1 1 auto!important;min-width:0!important\}/);
 assert.match(loginCss,/\.os-login \.a11y-entry-actions\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important\}/);
 assert.match(loginCss,/\.os-login \.a11y-entry-actions button\{width:auto!important;min-width:0!important\}/);
 assert.match(loginCss,/@media\(min-width:781px\) and \(max-height:820px\)\{[\s\S]*?\.os-login\{justify-content:flex-start!important/);
});

test('First profile always offers the voice onboarding, while returning accounts get the settings shortcut',()=>{
 assert.match(app,/export function renderAccessibilityPrompt\(\)\s*\{\s*return/);
 assert.match(app,/export function startAccessibilityEntry\(root\)[\s\S]*settings\.screenReader = true/);
 assert.match(loginRuntime,/screen\.className='os-login login-first-visit'/);
 assert.match(loginRuntime,/renderAccessibilityPrompt\(\)\}\s*<form/);
 assert.match(loginRuntime,/welcome\.innerHTML=renderAccessibilityPill\(\)/);
});

test('Screen reader speaks dynamic alerts and each desktop app exposes a skip link and main landmark',()=>{
 assert.match(app,/function installLiveSpeech\(\)[\s\S]*MutationObserver/);
 assert.match(app,/node\.matches\('\[aria-live\]/);
 assert.match(app,/function spokenName\(target\)[\s\S]*aria-pressed/);
 assert.match(game,/skip-main-link/);
 assert.match(game,/setAttribute\('role','main'\)/);
 assert.match(interfaceCss,/\.skip-main-link:focus/);
});

test('Secrets are announced and can be collected without a mouse; accessibility heading and taskbar remain usable',()=>{
 assert.match(achievements,/aria-keyshortcuts','E'/);
 assert.match(achievements,/Aperte E ou Enter para pegar/);
 assert.match(achievements,/getElementById\('announcement'\);if\(live\)live\.textContent=/);
 assert.match(controls,/\.taskbar \.os-account\{margin-left:auto!important/);
 assert.match(controls,/\.taskbar>\.show-desktop\{order:20/);
 assert.match(controls,/\.taskbar>\.show-desktop\{order:20;margin-left:8px!important;flex:0 0 10px!important/);
 assert.match(game,/data-show-desktop aria-label="\$\{desktopRestore\?'Restaurar janelas':'Mostrar área de trabalho'\}" aria-pressed="\$\{!!desktopRestore\}"/);
 assert.match(game,/class="show-desktop"[\s\S]*?<span class="show-desktop-mark" aria-hidden="true"><\/span>/);
 assert.match(controls,/\.desktop-window>\.app-window-body,\.desktop-window>\.call-window-body\{margin:0!important\}/);
 assert.match(game,/savedAvatar=localStorage\.getItem\('qh-player-avatar'\)[\s\S]*?:'nino'/);
 assert.match(controls,/\.a11y-header\{display:block!important/);
 assert.match(controls,/a11y-font-xlarge \.desktop-window\[data-window-id="accessibility"\] \.a11y-window-view\{zoom:1\.35/);
});

test('Character voice reads the actual dialogue when the integrated reader is enabled',()=>{
 assert.match(audio,/function speakBoss\(panel\)[\s\S]*text,duration:replyDuration\(text\)/);
 assert.match(audio,/getAccessibilitySettings\(\)\.screenReader/);
 assert.match(audio,/detail\.text&&getAccessibilitySettings\(\)\.screenReader/);
});
