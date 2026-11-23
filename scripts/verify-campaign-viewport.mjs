import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {revengeCases} from '../src/revenge.js';

const origin='http://127.0.0.1:4183';
const cases=[
  {width:360,height:800,label:'celular estreito'},
  {width:447,height:900,label:'celular largo'},
  {width:768,height:1024,label:'tablet'},
  {width:1280,height:800,label:'desktop'},
  {width:1920,height:1080,label:'desktop amplo'}
];
const server=spawn(process.execPath,['scripts/qa-server.mjs'],{cwd:process.cwd(),env:{...process.env,QA_PORT:'4183'},stdio:'ignore',windowsHide:true});
let browser;

async function waitForServer(){
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw new Error(`QA server terminou com código ${server.exitCode}`);
    try{const response=await fetch(`${origin}/__qa`);if(response.ok)return;}catch{}
    await delay(250);
  }
  throw new Error('QA server não iniciou em 20 segundos');
}

async function enterDesktop(page){
  await page.goto(`${origin}/__qa?scene=ready&id=verify-person`);
  await page.getByRole('button',{name:/Entrar no computador/}).click();
  await page.locator('[data-window-id="calls"]').waitFor({state:'visible'});
  await dismissQuickInvite(page);
  await page.locator('[data-defense-choice]').first().waitFor({state:'visible'});
}

async function dismissQuickInvite(page){
  const panel=page.locator('.qh-quick-invite');
  await panel.waitFor({state:'visible',timeout:1500}).catch(()=>{});
  if(await panel.isVisible()){
    await panel.locator('[data-quick-later]').click();
    await panel.waitFor({state:'detached'});
  }
}

async function assertNoHorizontalOverflow(page,width,label){
  const actual=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  assert.ok(actual.document<=width+1&&actual.body<=width+1,`${label}: rolagem horizontal (${JSON.stringify(actual)})`);
}

async function assertWithinViewport(locator,width,height,label){
  const rect=await locator.boundingBox();
  assert.ok(rect,`${label}: elemento não visível`);
  assert.ok(rect.x>=-1&&rect.y>=-1&&rect.x+rect.width<=width+1&&rect.y+rect.height<=height+1,`${label}: elemento cortado (${JSON.stringify(rect)})`);
}

try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  for(const viewport of cases){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    await page.addInitScript(()=>{
      const spoken=[];
      class TestUtterance{constructor(text){this.text=text;this.listeners={};}addEventListener(name,callback){this.listeners[name]=callback;}}
      Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:TestUtterance});
      Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices(){return [{lang:'pt-BR'}];},speak(utterance){spoken.push({text:utterance.text,rate:utterance.rate});setTimeout(()=>utterance.listeners.end?.(),0);}}});
      window.__qhSpoken=spoken;
    });
    page.on('pageerror',error=>errors.push(error.message));
    await enterDesktop(page);
    await assertNoHorizontalOverflow(page,viewport.width,`${viewport.label} conversa`);
    await assertWithinViewport(page.locator('[data-window-id="calls"]'),viewport.width,viewport.height,`${viewport.label} conversa`);

    if(viewport.width<=768){
      await page.locator('[data-mobile-apps]').first().click();
      await page.locator('.mobile-app-switcher [data-app="accessibility"]').click();
    }else await page.locator('[data-icon="accessibility"]').click();
    const accessibility=page.locator('[data-window-id="accessibility"]');
    await accessibility.waitFor({state:'visible'});
    await assertWithinViewport(accessibility,viewport.width,viewport.height,`${viewport.label} configurações`);
    for(const name of ['Modo Alto Contraste','Espaçamento e Legibilidade','Leitor de Voz Sintética Integrado','Indicador de Foco Evidente','Reduzir Movimentos e Animações']){
      assert.equal(await accessibility.getByRole('button',{name}).count(),1,`${viewport.label}: nome acessível para ${name}`);
    }
    await accessibility.locator('[data-a11y-toggle="screenReader"]').click();
    await accessibility.locator('[data-a11y-setting="speechRate"]').selectOption('0.8');
    await accessibility.locator('[data-a11y-setting="captionSize"]').selectOption('large');
    await accessibility.locator('[data-a11y-setting="captionPosition"]').selectOption('bottom');
    await accessibility.locator('.a11y-header h1').click();
    const replay=accessibility.locator('[data-a11y-replay-speech]');
    await replay.waitFor({state:'visible'});
    assert.equal(await replay.isEnabled(),true,`${viewport.label}: repetição habilitada após a primeira fala`);
    const initialSpeechCount=await page.evaluate(()=>window.__qhSpoken.length);
    await replay.click();
    await page.waitForFunction(count=>window.__qhSpoken.length>count,initialSpeechCount);
    const voiceCheck=await page.evaluate(()=>{const caption=document.querySelector('.qh-a11y-caption'),style=caption&&getComputedStyle(caption);return {spoken:window.__qhSpoken.slice(-2),caption:{size:caption?.dataset.size,position:caption?.dataset.position,fontSize:style?.fontSize,top:style?.top,bottom:style?.bottom},settings:JSON.parse(localStorage.getItem('qh-accessibility-settings'))};});
    assert.equal(voiceCheck.spoken.length,2,`${viewport.label}: fala e repetição registradas`);
    assert.equal(voiceCheck.spoken[0].text,voiceCheck.spoken[1].text,`${viewport.label}: repetir preserva o texto original`);
    assert.equal(voiceCheck.spoken[1].rate,.8,`${viewport.label}: velocidade salva aplicada`);
    assert.equal(voiceCheck.caption.size,'large',`${viewport.label}: tamanho da legenda`);
    assert.equal(voiceCheck.caption.position,'bottom',`${viewport.label}: posição da legenda`);
    assert.equal(voiceCheck.caption.fontSize,'20px',`${viewport.label}: fonte grande da legenda`);
    assert.equal(voiceCheck.caption.bottom,'76px',`${viewport.label}: legenda respeita espaço do rodapé`);
    assert.ok(Number.parseFloat(voiceCheck.caption.top)>viewport.height/2,`${viewport.label}: legenda realmente aparece perto do rodapé`);
    assert.equal(voiceCheck.settings.captionPosition,'bottom');
    assert.equal(voiceCheck.settings.captionSize,'large');
    await accessibility.locator('[data-window="close"]').click();
    await accessibility.waitFor({state:'detached'});

    await page.goto(`${origin}/__qa?scene=outcome&id=send-pix`);
    await page.getByRole('button',{name:/Entrar no computador/}).click();
    await dismissQuickInvite(page);
    const outcome=page.locator('[role="dialog"][aria-labelledby="defense-reaction-title"]');
    await outcome.waitFor({state:'visible'});
    await assertNoHorizontalOverflow(page,viewport.width,`${viewport.label} resultado`);
    await assertWithinViewport(outcome,viewport.width,viewport.height,`${viewport.label} resultado`);
    await outcome.locator('[data-revenge-start]').click();

    const revenge=page.locator('[data-revenge-phase="quiz"]');
    await revenge.waitFor({state:'visible'});
    await assertNoHorizontalOverflow(page,viewport.width,`${viewport.label} revanche`);
    await assertWithinViewport(revenge,viewport.width,viewport.height,`${viewport.label} revanche`);
    const question=revengeCases.whatsapp.questions[0],wrong=question.options.find(option=>option.id!==question.correct);
    await revenge.locator(`[data-revenge-answer="${wrong.id}"]`).click();
    await revenge.locator('.revenge-lesson').waitFor({state:'visible'});
    assert.match(await revenge.locator('.revenge-lesson').innerText(),/erro|chances/i,`${viewport.label}: feedback após erro`);
    await assertNoHorizontalOverflow(page,viewport.width,`${viewport.label} feedback da revanche`);
    assert.deepEqual(errors,[],`${viewport.label}: erros de execução`);
    console.log(`OK ${viewport.width}×${viewport.height} (${viewport.label}): conversa, abrir/fechar app, resultado e resposta da revanche`);
    await context.close();
  }
}finally{
  await browser?.close();
  server.kill();
}
