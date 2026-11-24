// Módulo de Acessibilidade — Trambique OS
// Oferece suporte completo para deficientes visuais e os top 4 tipos de daltonismo.

const STORAGE_KEY = 'qh-accessibility-settings';
let entrySpeechTimer = 0;

export const accessibilityDefaults = {
  highContrast: false,
  fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
  textSpacing: false,
  screenReader: false,
  speechRate: 1.05,
  captionSize: 'normal',
  captionPosition: 'top',
  focusIndicator: true,
  reducedMotion: false,
  daltonism: 'none' // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia'
};

export function getAccessibilitySettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...accessibilityDefaults };
    return { ...accessibilityDefaults, ...JSON.parse(raw) };
  } catch {
    return { ...accessibilityDefaults };
  }
}

export function saveAccessibilitySettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
  applyAccessibility(settings);
  document.dispatchEvent(new CustomEvent('qh-accessibility-change', { detail: settings }));
}

// Síntese de voz integrada (Web Speech API)
let speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let currentUtterance = null;
let lastSpokenText = '';
let speechCaptionNode = null, speechCaptionTimer = 0, speechCaptionRevision = 0;

export function showSpeechCaption(text, timeoutMs = 30000) {
  if (typeof document === 'undefined') return 0;
  const clean = String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean || !document.body) return 0;
  if (!speechCaptionNode?.isConnected) {
    speechCaptionNode = document.createElement('div');
    speechCaptionNode.className = 'qh-a11y-caption';
    speechCaptionNode.setAttribute('aria-hidden', 'true');
    speechCaptionNode.setAttribute('dir', 'auto');
  }
  const login = document.querySelector('.os-login');
  const prompt = login?.querySelector('.a11y-entry-prompt');
  if (login && prompt) prompt.insertAdjacentElement('afterend', speechCaptionNode);
  else if (speechCaptionNode.parentElement !== document.body) document.body.append(speechCaptionNode);
  clearTimeout(speechCaptionTimer);
  const revision = ++speechCaptionRevision;
  speechCaptionNode.textContent = clean;
  const settings = getAccessibilitySettings();
  speechCaptionNode.dataset.size = settings.captionSize === 'large' ? 'large' : 'normal';
  speechCaptionNode.dataset.position = settings.captionPosition === 'bottom' ? 'bottom' : 'top';
  speechCaptionNode.classList.add('show');
  if (timeoutMs > 0) speechCaptionTimer = setTimeout(() => clearSpeechCaption(revision), timeoutMs);
  return revision;
}

if (typeof document !== 'undefined') document.addEventListener('qh-player-login', () => {
  if (speechCaptionNode?.isConnected && speechCaptionNode.parentElement !== document.body) document.body.append(speechCaptionNode);
});

export function clearSpeechCaption(revision = 0) {
  if (revision && revision !== speechCaptionRevision) return;
  clearTimeout(speechCaptionTimer);
  speechCaptionTimer = 0;
  speechCaptionRevision++;
  speechCaptionNode?.classList.remove('show');
}

export function speakText(text, interrupt = true) {
  if (!text) return;
  const clean = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  lastSpokenText = clean;
  if (typeof document !== 'undefined') document.querySelectorAll('[data-a11y-replay-speech]').forEach(button => { button.disabled = false; });
  if (!speechSynth) { showSpeechCaption(clean, 6000); return; }
  try {
    if (interrupt) { speechSynth.cancel(); clearSpeechCaption(); }
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'pt-BR';
    const requestedRate = Number(getAccessibilitySettings().speechRate);
    utterance.rate = Number.isFinite(requestedRate) ? Math.max(.75, Math.min(1.25, requestedRate)) : 1.05;
    utterance.pitch = 1.0;
    const voices = speechSynth.getVoices();
    const ptVoice = voices.find(v => v.lang?.toLowerCase().startsWith('pt')) || voices[0];
    if (ptVoice) utterance.voice = ptVoice;
    const captionRevision = showSpeechCaption(clean);
    utterance.addEventListener?.('end', () => clearSpeechCaption(captionRevision), { once: true });
    currentUtterance = utterance;
    speechSynth.speak(utterance);
    return utterance;
  } catch {
    return null;
  }
}

export function replayLastSpeech() {
  if (!lastSpokenText) return false;
  speakText(lastSpokenText);
  return true;
}

export function stopSpeaking() {
  try { speechSynth?.cancel(); } catch {}
  clearSpeechCaption();
}

// Injeção de filtros SVG para correção e visualização de daltonismo
function ensureSvgFilters() {
  if (typeof document === 'undefined' || document.getElementById('a11y-svg-filters')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'a11y-svg-filters';
  svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;overflow:hidden;';
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <defs>
      <!-- Deuteranopia (Deficiência de verde — o mais comum) -->
      <filter id="a11y-filter-deuteranopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0,   0, 0
          0.70,  0.30,  0,   0, 0
          0,     0.30,  0.70, 0, 0
          0,     0,     0,   1, 0
        "/>
      </filter>

      <!-- Protanopia (Deficiência de vermelho) -->
      <filter id="a11y-filter-protanopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0,     0, 0
          0.558, 0.442, 0,     0, 0
          0,     0.242, 0.758, 0, 0
          0,     0,     0,     1, 0
        "/>
      </filter>

      <!-- Tritanopia (Deficiência de azul-amarelo) -->
      <filter id="a11y-filter-tritanopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          0.95, 0.05,  0,     0, 0
          0,    0.433, 0.567, 0, 0
          0,    0.475, 0.525, 0, 0
          0,    0,     0,     1, 0
        "/>
      </filter>
    </defs>
  `;
  document.body?.appendChild(svg);
}

// Aplicação das classes no HTML
export function applyAccessibility(settings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  ensureSvgFilters();
  if (speechCaptionNode?.isConnected) {
    speechCaptionNode.dataset.size = settings.captionSize === 'large' ? 'large' : 'normal';
    speechCaptionNode.dataset.position = settings.captionPosition === 'bottom' ? 'bottom' : 'top';
  }

  // Alto Contraste
  root.classList.toggle('a11y-high-contrast', !!settings.highContrast);

  // Escala de Fonte
  root.classList.toggle('a11y-font-large', settings.fontSize === 'large');
  root.classList.toggle('a11y-font-xlarge', settings.fontSize === 'xlarge');

  // Espaçamento
  root.classList.toggle('a11y-text-spacing', !!settings.textSpacing);

  // Indicador de Foco
  root.classList.toggle('a11y-focus-visible', !!settings.focusIndicator);

  // Redução de Movimento
  root.classList.toggle('a11y-reduced-motion', !!settings.reducedMotion);

  // Daltonismo
  root.classList.remove(
    'a11y-daltonism-deuteranopia',
    'a11y-daltonism-protanopia',
    'a11y-daltonism-tritanopia',
    'a11y-daltonism-achromatopsia'
  );

  if (settings.daltonism && settings.daltonism !== 'none') {
    root.classList.add(`a11y-daltonism-${settings.daltonism}`);
  }
}

// Ouvinte de leitor de tela interativo
let speechListenerInstalled = false;
const liveSpeechValues = new Map();

function spokenName(target) {
  const labelledBy = target.getAttribute('aria-labelledby')
    ?.split(/\s+/).map(id => document.getElementById(id)?.innerText || '').join(' ');
  const labels = [...(target.labels || [])].map(label => label.innerText).join(' ');
  const name = target.getAttribute('aria-label') || labelledBy || labels ||
    target.innerText || target.getAttribute('placeholder') || target.getAttribute('title') || '';
  const role = target.getAttribute('role') || (target.tagName === 'INPUT'
    ? ({radio:'opção',checkbox:'caixa de seleção',range:'controle deslizante',submit:'botão'}[target.type] || 'campo')
    : ({BUTTON:'botão', A:'link', TEXTAREA:'campo de texto', SELECT:'lista'}[target.tagName] || ''));
  const state = target.getAttribute('aria-pressed') === 'true' ? 'ativado' :
    target.getAttribute('aria-pressed') === 'false' ? 'desativado' :
    target.getAttribute('aria-expanded') === 'true' ? 'aberto' :
    target.getAttribute('aria-expanded') === 'false' ? 'fechado' :
    target.getAttribute('aria-current') === 'page' ? 'página atual' :
    target.getAttribute('aria-selected') === 'true' || target.checked ? 'selecionado' :
    target.getAttribute('aria-selected') === 'false' || target.getAttribute('aria-checked') === 'false' ? 'não selecionado' : '';
  return [name, role, state].filter(Boolean).join('. ');
}

const speechControlSelector = 'button,a,input,select,textarea,summary,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="radio"],[data-app],[data-window],[data-action],[data-choice]';
const speechTextSelector = 'p,h1,h2,h3,h4,h5,h6,li,dt,dd,legend,label,summary,figcaption,blockquote';

function clickedSpeechTarget(node) {
  const element = node instanceof Element ? node : node?.parentElement;
  if (!element) return null;
  if (element.closest('[data-a11y-replay-speech]')) return null;
  const control = element.closest(speechControlSelector);
  if (control) return control.closest('[aria-hidden="true"],[hidden],[inert]') ? null : control;
  if (element.closest('[aria-hidden="true"],[hidden],[inert]')) return null;
  const textBlock = element.closest(speechTextSelector);
  if (textBlock) return textBlock;
  const inlineText = element.closest('span,strong,em,b,i,small,code,time,mark');
  if (inlineText?.textContent?.trim()) return inlineText;
  for (let current = element; current && current !== document.body; current = current.parentElement) {
    const directText = [...current.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).map(child => child.textContent).join(' ').trim();
    if (directText) return current;
  }
  return null;
}

function speechTextForClick(target) {
  if (target.matches(speechControlSelector)) return spokenName(target);
  return (target.innerText || target.textContent || '').replace(/\s+/g, ' ').trim();
}

function installLiveSpeech() {
  if (typeof document === 'undefined' || !document.body || document.body.dataset.a11yLiveSpeech) return;
  document.body.dataset.a11yLiveSpeech = 'true';
  const announce = node => {
    if (!getAccessibilitySettings().screenReader || !(node instanceof Element)) return;
    const live = node.matches('[aria-live],#announcement,[role="status"],[role="alert"],[role="log"]')
      ? node : node.closest('[aria-live],#announcement,[role="status"],[role="alert"],[role="log"]');
    if (!live || live.closest('[aria-hidden="true"]') || live.hidden) return;
    const text = (live.matches('[role="log"]') ? live.lastElementChild?.innerText : live.innerText || live.textContent || '')
      ?.replace(/\s+/g, ' ').trim();
    const key = live.id || `${live.getAttribute('aria-label') || live.getAttribute('role')}:${typeof live.className === 'string' ? live.className : ''}`;
    if (!text || liveSpeechValues.get(key) === text) return;
    liveSpeechValues.set(key, text);
    speakText(text);
  };
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') announce(record.target.parentElement);
      else if (record.type === 'childList') {
        if (record.target instanceof Element) announce(record.target);
        for (const added of record.addedNodes) if (added instanceof Element) announce(added);
      }
    }
  });
  observer.observe(document.body, {subtree:true,childList:true,characterData:true});
}

function installSpeechListeners() {
  if (speechListenerInstalled || typeof document === 'undefined') return;
  speechListenerInstalled = true;
  installLiveSpeech();

  let lastFocusedTarget = null, lastFocusedAt = 0;
  document.addEventListener('focusin', e => {
    const s = getAccessibilitySettings();
    if (!s.screenReader) return;
    const target = e.target;
    if (!target) return;
    if (target.closest?.('[data-a11y-replay-speech]')) return;
    const text = spokenName(target);
    if (text) { lastFocusedTarget = target; lastFocusedAt = Date.now(); speakText(text); }
  });
  document.addEventListener('click', e => {
    if (!getAccessibilitySettings().screenReader) return;
    const target = clickedSpeechTarget(e.target);
    if (!target) return;
    // Pointer clicks focus buttons before the click event; the focus already spoke them.
    if (target === lastFocusedTarget && Date.now() - lastFocusedAt < 900) { lastFocusedTarget = null; return; }
    const text = speechTextForClick(target);
    if (text) speakText(text);
  });
}

// Banner com a pergunta sutil mas evidente ao abrir o site
export function renderAccessibilityPrompt() {
  return `
    <aside class="a11y-entry-prompt" role="region" aria-label="Preferências de Acessibilidade">
      <span class="a11y-entry-icon" aria-hidden="true"><svg viewBox="0 0 48 48" role="img" aria-label="Logo do Trambique OS"><rect x="4" y="5" width="40" height="38" rx="9" fill="#edb77f"/><rect x="11" y="12" width="26" height="21" rx="3" fill="#173b3a"/><path d="M17 19h4m6 0h4M18 25h12M20 33v5m8-5v5M15 39h18" fill="none" stroke="#edb77f" stroke-width="2.5" stroke-linecap="round"/></svg></span>
      <div class="a11y-entry-text">
        <strong>Acessibilidade · primeira visita</strong>
        <p>Ajustar abre as opções de voz e acessibilidade. A narração começa no primeiro toque se o navegador permitir.</p>
      </div>
      <div class="a11y-entry-actions">
        <button type="button" class="a11y-entry-btn-primary" data-open-accessibility aria-label="Ajustar acessibilidade do jogo">Ajustar</button>
        <button type="button" class="a11y-entry-btn-secondary" data-a11y-entry-dismiss>Dispensar</button>
      </div>
      <div class="a11y-entry-confirm" data-a11y-entry-confirm hidden><span>Dispensar agora?</span><button type="button" data-a11y-dismiss-cancel>Voltar</button><button type="button" data-a11y-dismiss-confirm>Sim, dispensar</button></div>
    </aside>
  `;
}

export function startAccessibilityEntry(root) {
  const prompt = root?.querySelector('.a11y-entry-prompt');
  if (!prompt) return false;
  if (localStorage.getItem('qh-a11y-entry-dismissed') === 'true') { prompt.remove(); return false; }
  const settings = getAccessibilitySettings(); settings.screenReader = true; saveAccessibilitySettings(settings);
  const intro = 'Acessibilidade do Trambique OS. Use Ajustar para abrir as opções de voz, contraste e movimento. A narração depende da voz disponível no navegador. Dispensar fecha este aviso; você pode ajustar depois no menu.';
  prompt.querySelector('[data-a11y-entry-dismiss]')?.addEventListener('click', () => { prompt.querySelector('[data-a11y-entry-confirm]').hidden = false; prompt.querySelector('[data-a11y-dismiss-cancel]').focus(); speakText('Quer dispensar este aviso? Voltar mantém as opções. Sim, dispensar fecha o aviso.'); });
  prompt.querySelector('[data-a11y-dismiss-cancel]')?.addEventListener('click', () => { prompt.querySelector('[data-a11y-entry-confirm]').hidden = true; prompt.querySelector('[data-a11y-entry-dismiss]').focus(); });
  prompt.querySelector('[data-a11y-dismiss-confirm]')?.addEventListener('click', () => { localStorage.setItem('qh-a11y-entry-dismissed','true'); prompt.remove(); stopSpeaking(); });
  let started = false; const start = () => { if (started) return; started = true; window.clearTimeout(entrySpeechTimer); entrySpeechTimer = 0; speakText(intro); };
  root.addEventListener('pointerdown', start, {once:true}); root.addEventListener('keydown', start, {once:true});
  window.clearTimeout(entrySpeechTimer);
  entrySpeechTimer = window.setTimeout(start, 350);
  return true;
}

// Botão de atalho flutuante sutil no canto
export function renderAccessibilityPill() {
  return `
    <button type="button" class="a11y-pill-shortcut" data-open-accessibility aria-label="Abrir configurações de acessibilidade (Alt+A)">
      <span aria-hidden="true">♿</span>
      <span>Acessibilidade <small style="opacity:0.75">(Alt+A)</small></span>
    </button>
  `;
}

// Conteúdo da janela de Acessibilidade no Trambique OS
export function accessibilityContent(state, esc = s => s) {
  const s = getAccessibilitySettings();

  return `
    <div class="a11y-window-view">
      <header class="a11y-header">
        <small>TRAMBIQUE OS · PREFERÊNCIAS DO SISTEMA</small>
        <h1>Painel de Acessibilidade</h1>
        <p>Ajuste recursos visuais, motor de voz e paletas para os tipos de daltonismo mais comuns. Suas preferências ficam salvas neste navegador.</p>
      </header>

      <!-- SEÇÃO 1: DEFICIÊNCIA VISUAL E BAIXA VISÃO -->
      <section class="a11y-section" aria-labelledby="a11y-vis-title">
        <h2 id="a11y-vis-title"><span aria-hidden="true">👁️</span> Recursos para Deficiência Visual</h2>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Modo Alto Contraste</strong>
            <span>Preto profundo, texto amarelo ouro e branco com bordas hiper-nítidas.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="highContrast" aria-label="Modo Alto Contraste" aria-pressed="${s.highContrast}">
            ${s.highContrast ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Tamanho dos Textos e Janelas</strong>
            <span>Amplia fontes de diálogos, botões e cards sem quebrar o layout.</span>
          </div>
          <div class="a11y-btn-group" role="group" aria-label="Tamanho da fonte">
            <button type="button" data-a11y-fontsize="normal" aria-pressed="${s.fontSize === 'normal'}">Padrão</button>
            <button type="button" data-a11y-fontsize="large" aria-pressed="${s.fontSize === 'large'}">Grande (+18%)</button>
            <button type="button" data-a11y-fontsize="xlarge" aria-pressed="${s.fontSize === 'xlarge'}">Extragrande (+35%)</button>
          </div>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Espaçamento e Legibilidade</strong>
            <span>Aumenta a altura de linha e o espaçamento entre caracteres para facilitar a leitura.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="textSpacing" aria-label="Espaçamento e Legibilidade" aria-pressed="${s.textSpacing}">
            ${s.textSpacing ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Leitor de Voz Sintética Integrado</strong>
            <span>Lê em voz alta textos clicados ou focados, opções, botões e mensagens do jogo.</span>
          </div>
          <div class="a11y-voice-controls">
            <button type="button" class="a11y-toggle-btn" data-a11y-toggle="screenReader" aria-label="Leitor de Voz Sintética Integrado" aria-pressed="${s.screenReader}">
              ${s.screenReader ? '✓ Leitor Ativo' : 'Desativado'}
            </button>
            <button type="button" class="a11y-test-voice" data-a11y-test-voice title="Testar sintetizador de voz">
              🔊 Testar voz
            </button>
          </div>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Indicador de Foco Evidente</strong>
            <span>Destaca o elemento selecionado no teclado com uma borda amarela dupla e espessa.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="focusIndicator" aria-label="Indicador de Foco Evidente" aria-pressed="${s.focusIndicator}">
            ${s.focusIndicator ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Reduzir Movimentos e Animações</strong>
            <span>Desliga transições e animações da interface para quem tem sensibilidade ao movimento.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="reducedMotion" aria-label="Reduzir Movimentos e Animações" aria-pressed="${s.reducedMotion}">
            ${s.reducedMotion ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>
      </section>

      <section class="a11y-section" aria-labelledby="a11y-speech-title">
        <h2 id="a11y-speech-title"><span aria-hidden="true">🔊</span> Voz e legendas</h2>
        <div class="a11y-row">
          <div class="a11y-row-text"><strong>Velocidade da narração</strong><span>Escolha um ritmo confortável para a leitura em voz alta.</span></div>
          <label class="a11y-select-control">Velocidade<select data-a11y-setting="speechRate"><option value="0.8" ${Number(s.speechRate)===0.8?'selected':''}>Mais devagar</option><option value="1.05" ${Number(s.speechRate)===1.05?'selected':''}>Padrão</option><option value="1.2" ${Number(s.speechRate)===1.2?'selected':''}>Mais rápida</option></select></label>
        </div>
        <div class="a11y-row">
          <div class="a11y-row-text"><strong>Tamanho das legendas</strong><span>Aumenta o texto mostrado enquanto alguém fala.</span></div>
          <label class="a11y-select-control">Tamanho<select data-a11y-setting="captionSize"><option value="normal" ${s.captionSize==='normal'?'selected':''}>Padrão</option><option value="large" ${s.captionSize==='large'?'selected':''}>Grande</option></select></label>
        </div>
        <div class="a11y-row">
          <div class="a11y-row-text"><strong>Posição das legendas</strong><span>Coloque a legenda no alto ou perto do rodapé.</span></div>
          <label class="a11y-select-control">Posição<select data-a11y-setting="captionPosition"><option value="top" ${s.captionPosition==='top'?'selected':''}>Em cima</option><option value="bottom" ${s.captionPosition==='bottom'?'selected':''}>Embaixo</option></select></label>
        </div>
        <div class="a11y-row">
          <div class="a11y-row-text"><strong>Ouvir de novo</strong><span>Repete a última fala narrada neste computador.</span></div>
          <button type="button" data-a11y-replay-speech ${lastSpokenText?'':'disabled'}>Repetir última fala</button>
        </div>
      </section>

      <!-- SEÇÃO 2: TOP 4 TIPOS DE DALTONISMO -->
      <section class="a11y-section" aria-labelledby="a11y-color-title">
        <h2 id="a11y-color-title"><span aria-hidden="true">🎨</span> Modos para Daltonismo (Top 4 mais comuns)</h2>
        <p class="a11y-help-copy">Selecione o filtro correspondente para recalibrar as cores e garantir distinção por forma e luminosidade:</p>

        <div class="a11y-daltonism-grid">
          <!-- Padrão -->
          <button type="button" class="a11y-daltonism-card" data-a11y-daltonism="none" aria-pressed="${s.daltonism === 'none'}">
            <strong>Padrão do Trambique OS</strong>
            <span>Cores originais da firma com paleta verde-petróleo e dourado.</span>
            <div class="a11y-palette-preview">
              <span style="background:#182922"></span>
              <span style="background:#395744"></span>
              <span style="background:#e3c17c"></span>
              <span style="background:#81c8b1"></span>
            </div>
          </button>

          <!-- 1. Deuteranopia -->
          <button type="button" class="a11y-daltonism-card" data-a11y-daltonism="deuteranopia" aria-pressed="${s.daltonism === 'deuteranopia'}">
            <strong>1. Deuteranopia (Verde)</strong>
            <span>Mais comum (~6% dos homens). Substitui tons de verde por azul e amarelo de alto contraste.</span>
            <div class="a11y-palette-preview">
              <span style="background:#1a2f47"></span>
              <span style="background:#2e5a88"></span>
              <span style="background:#f0c05a"></span>
              <span style="background:#6bb4ff"></span>
            </div>
          </button>

          <!-- 2. Protanopia -->
          <button type="button" class="a11y-daltonism-card" data-a11y-daltonism="protanopia" aria-pressed="${s.daltonism === 'protanopia'}">
            <strong>2. Protanopia (Vermelho)</strong>
            <span>Dificuldade com tons de vermelho (~2% dos homens). Recalibra vermelhos para âmbar e azul profundo.</span>
            <div class="a11y-palette-preview">
              <span style="background:#13283b"></span>
              <span style="background:#235172"></span>
              <span style="background:#e8b84b"></span>
              <span style="background:#5da3e6"></span>
            </div>
          </button>

          <!-- 3. Tritanopia -->
          <button type="button" class="a11y-daltonism-card" data-a11y-daltonism="tritanopia" aria-pressed="${s.daltonism === 'tritanopia'}">
            <strong>3. Tritanopia (Azul / Amarelo)</strong>
            <span>Dificuldade com azul e amarelo. Paleta ajustada para tons de ciano brilhante, magenta e escuro.</span>
            <div class="a11y-palette-preview">
              <span style="background:#2c1822"></span>
              <span style="background:#632845"></span>
              <span style="background:#00d9b4"></span>
              <span style="background:#ff5588"></span>
            </div>
          </button>

          <!-- 4. Acromatopsia -->
          <button type="button" class="a11y-daltonism-card" data-a11y-daltonism="achromatopsia" aria-pressed="${s.daltonism === 'achromatopsia'}">
            <strong>4. Acromatopsia (Monocromia)</strong>
            <span>Visão em tons de cinza. Contraste de luz acentuado com texturas e símbolos nítidos.</span>
            <div class="a11y-palette-preview">
              <span style="background:#111111"></span>
              <span style="background:#555555"></span>
              <span style="background:#aaaaaa"></span>
              <span style="background:#ffffff"></span>
            </div>
          </button>
        </div>
      </section>

      <footer style="margin-top:24px;text-align:right;">
        <button type="button" class="primary" data-a11y-close-window>
          Concluir e Salvar Preferências
        </button>
      </footer>
    </div>
  `;
}

// Modal Acessível Flutuante
export function openAccessibilityModal() {
  const existing = document.getElementById('a11y-modal-dialog');
  if (existing) existing.remove();
  const previousFocus = document.activeElement;
  const appRoot = document.getElementById('app'), wasAppInert = appRoot?.inert;

  const backdrop = document.createElement('div');
  backdrop.id = 'a11y-modal-dialog';
  backdrop.className = 'a11y-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Configurações de Acessibilidade');

  backdrop.innerHTML = `
    <div class="a11y-modal-content">
      <div class="a11y-modal-header">
        <div>
          <strong>♿ Acessibilidade e Daltonismo</strong>
          <p>Configure o visual antes ou durante o expediente.</p>
        </div>
        <button type="button" class="a11y-modal-close" aria-label="Fechar painel de acessibilidade (Escape)">✕ Fechar</button>
      </div>
      <div class="a11y-modal-body">
        ${accessibilityContent(null)}
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  if (appRoot) appRoot.inert = true;
  const close = () => {
    backdrop.remove();
    document.removeEventListener('keydown', handleKeyDown);
    if (appRoot) appRoot.inert = !!wasAppInert;
    previousFocus?.focus?.({ preventScroll: true });
  };

  const closeBtn = backdrop.querySelector('.a11y-modal-close');
  closeBtn?.focus();

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      backdrop.remove();
      document.removeEventListener('keydown', handleKeyDown);
      if (appRoot) appRoot.inert = !!wasAppInert;
      previousFocus?.focus?.({ preventScroll: true });
      return;
    }
    if (e.key !== 'Tab') return;
    const controls = [...backdrop.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el => !el.hidden);
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  document.addEventListener('keydown', handleKeyDown);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop || e.target.closest('.a11y-modal-close') || e.target.closest('[data-a11y-close-window]')) {
      close();
    }
  });
}

// Inicializador global de acessibilidade
export function initAccessibility() {
  if (typeof window === 'undefined') return;

  const current = getAccessibilitySettings();
  applyAccessibility(current);
  installSpeechListeners();

  // Atalho de teclado Alt + A para acessibilidade rápida
  window.addEventListener('keydown', e => {
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      openAccessibilityModal();
    }
  });

  // Delegação de eventos para controles de acessibilidade
  document.addEventListener('click', e => {
    const openBtn = e.target.closest('[data-open-accessibility]');
    if (openBtn) {
      e.preventDefault();
      window.clearTimeout(entrySpeechTimer); entrySpeechTimer = 0;
      openAccessibilityModal();
      return;
    }

    const toggle = e.target.closest('[data-a11y-toggle]');
    if (toggle) {
      const key = toggle.dataset.a11yToggle;
      const s = getAccessibilitySettings();
      s[key] = !s[key];
      saveAccessibilitySettings(s);
      toggle.setAttribute('aria-pressed', String(s[key]));
      toggle.textContent = s[key] ? '✓ Ativado' : 'Desativado';
      if (key === 'screenReader' && s.screenReader) {
        speakText('Leitor de voz ativado com sucesso.');
      }
      return;
    }

    const fontBtn = e.target.closest('[data-a11y-fontsize]');
    if (fontBtn) {
      const size = fontBtn.dataset.a11yFontsize;
      const s = getAccessibilitySettings();
      s.fontSize = size;
      saveAccessibilitySettings(s);
      fontBtn.parentElement.querySelectorAll('button').forEach(b => {
        b.setAttribute('aria-pressed', String(b === fontBtn));
      });
      return;
    }

    const daltonismBtn = e.target.closest('[data-a11y-daltonism]');
    if (daltonismBtn) {
      const type = daltonismBtn.dataset.a11yDaltonism;
      const s = getAccessibilitySettings();
      s.daltonism = type;
      saveAccessibilitySettings(s);
      daltonismBtn.closest('.a11y-daltonism-grid')?.querySelectorAll('.a11y-daltonism-card').forEach(b => {
        b.setAttribute('aria-pressed', String(b === daltonismBtn));
      });
      return;
    }

    const testVoice = e.target.closest('[data-a11y-test-voice]');
    if (testVoice) {
      speakText('Olá! O leitor de voz do Trambique OS está funcionando perfeitamente.');
      return;
    }

    const replay = e.target.closest('[data-a11y-replay-speech]');
    if (replay) {
      replayLastSpeech();
      return;
    }

    const closeWin = e.target.closest('[data-a11y-close-window]');
    if (closeWin) {
      const modal = document.getElementById('a11y-modal-dialog');
      if (modal) modal.remove();
      return;
    }
  });

  document.addEventListener('change', e => {
    const control = e.target.closest('[data-a11y-setting]');
    if (!control) return;
    const key = control.dataset.a11ySetting, settings = getAccessibilitySettings();
    if (key === 'speechRate') settings.speechRate = [0.8,1.05,1.2].includes(Number(control.value)) ? Number(control.value) : accessibilityDefaults.speechRate;
    else if (key === 'captionSize') settings.captionSize = control.value === 'large' ? 'large' : 'normal';
    else if (key === 'captionPosition') settings.captionPosition = control.value === 'bottom' ? 'bottom' : 'top';
    else return;
    saveAccessibilitySettings(settings);
    if (settings.screenReader) speakText(`${control.labels?.[0]?.innerText||control.getAttribute('aria-label')||'Preferência'}: ${control.selectedOptions?.[0]?.text||control.value}.`);
  });
}

// release v20261115a
