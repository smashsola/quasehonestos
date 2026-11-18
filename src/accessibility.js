// Módulo de Acessibilidade — Trambique OS
// Oferece suporte completo para deficientes visuais e os top 4 tipos de daltonismo.

const STORAGE_KEY = 'qh-accessibility-settings';

export const accessibilityDefaults = {
  highContrast: false,
  fontSize: 'normal', // 'normal' | 'large' | 'xlarge'
  textSpacing: false,
  screenReader: false,
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

export function speakText(text, interrupt = true) {
  if (!speechSynth || !text) return;
  const clean = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;

  if (interrupt) {
    speechSynth.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Tenta encontrar uma voz em português
  const voices = speechSynth.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith('pt')) || voices[0];
  if (ptVoice) utterance.voice = ptVoice;

  currentUtterance = utterance;
  speechSynth.speak(utterance);
}

export function stopSpeaking() {
  if (speechSynth) speechSynth.cancel();
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
function installSpeechListeners() {
  if (speechListenerInstalled || typeof document === 'undefined') return;
  speechListenerInstalled = true;

  document.addEventListener('focusin', e => {
    const s = getAccessibilitySettings();
    if (!s.screenReader) return;
    const target = e.target;
    if (!target) return;
    const text = target.getAttribute('aria-label') || target.innerText || target.getAttribute('placeholder') || target.getAttribute('title') || '';
    if (text) speakText(text);
  });

  document.addEventListener('click', e => {
    const s = getAccessibilitySettings();
    if (!s.screenReader) return;
    const bubble = e.target.closest('.bubble, .login-return-card, .choices button, .windowbar, .a11y-daltonism-card');
    if (bubble && !e.target.closest('button[data-open-accessibility]')) {
      const text = bubble.getAttribute('aria-label') || bubble.innerText || '';
      if (text) speakText(text);
    }
  });
}

// Banner com a pergunta sutil mas evidente ao abrir o site
export function renderAccessibilityPrompt() {
  return `
    <aside class="a11y-entry-prompt" role="region" aria-label="Preferências de Acessibilidade">
      <span class="a11y-entry-icon" aria-hidden="true">♿</span>
      <div class="a11y-entry-text">
        <strong>Acessibilidade</strong>
        <p>Contraste, leitor de voz ou cores?</p>
      </div>
      <div class="a11y-entry-actions">
        <button type="button" class="a11y-entry-btn-primary" data-open-accessibility aria-label="Configurar acessibilidade do jogo">
          Ajustar
        </button>
      </div>
    </aside>
  `;
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
            <strong>Modo Alto Contraste (WCAG AAA)</strong>
            <span>Preto profundo, texto amarelo ouro e branco com bordas hiper-nítidas.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="highContrast" aria-pressed="${s.highContrast}">
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
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="textSpacing" aria-pressed="${s.textSpacing}">
            ${s.textSpacing ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Leitor de Voz Sintética Integrado</strong>
            <span>Lê em voz alta em português qualquer texto, opção ou mensagem selecionada.</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button type="button" class="a11y-toggle-btn" data-a11y-toggle="screenReader" aria-pressed="${s.screenReader}">
              ${s.screenReader ? '✓ Leitor Ativo' : 'Desativado'}
            </button>
            <button type="button" class="a11y-btn-group button" data-a11y-test-voice title="Testar sintetizador de voz" style="padding:7px 10px;font-size:12px;">
              🔊 Testar Voz
            </button>
          </div>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Indicador de Foco Evidente</strong>
            <span>Destaca o elemento selecionado no teclado com uma borda amarela dupla e espessa.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="focusIndicator" aria-pressed="${s.focusIndicator}">
            ${s.focusIndicator ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>

        <div class="a11y-row">
          <div class="a11y-row-text">
            <strong>Reduzir Movimentos e Animações</strong>
            <span>Desliga transições e animações da interface para quem tem sensibilidade ao movimento.</span>
          </div>
          <button type="button" class="a11y-toggle-btn" data-a11y-toggle="reducedMotion" aria-pressed="${s.reducedMotion}">
            ${s.reducedMotion ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>
      </section>

      <!-- SEÇÃO 2: TOP 4 TIPOS DE DALTONISMO -->
      <section class="a11y-section" aria-labelledby="a11y-color-title">
        <h2 id="a11y-color-title"><span aria-hidden="true">🎨</span> Modos para Daltonismo (Top 4 mais comuns)</h2>
        <p style="font-size:12px;color:#a4b8ad;margin:0 0 12px;">Selecione o filtro correspondente para recalibrar as cores e garantir distinção por forma e luminosidade:</p>

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
          <strong style="color:#ffd88a;font-size:16px;">♿ Acessibilidade e Daltonismo</strong>
          <p style="margin:2px 0 0;font-size:12px;color:#a4b8ad;">Configure o visual antes ou durante o expediente.</p>
        </div>
        <button type="button" class="a11y-modal-close" aria-label="Fechar painel de acessibilidade (Escape)">✕ Fechar</button>
      </div>
      <div class="a11y-modal-body">
        ${accessibilityContent(null)}
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const closeBtn = backdrop.querySelector('.a11y-modal-close');
  closeBtn?.focus();

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      backdrop.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop || e.target.closest('.a11y-modal-close') || e.target.closest('[data-a11y-close-window]')) {
      backdrop.remove();
      document.removeEventListener('keydown', handleKeyDown);
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

    const closeWin = e.target.closest('[data-a11y-close-window]');
    if (closeWin) {
      const modal = document.getElementById('a11y-modal-dialog');
      if (modal) modal.remove();
      return;
    }
  });
}

// release v20261115a
