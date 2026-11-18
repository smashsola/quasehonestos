// Ritmo das falas. Camada de acessibilidade: lida a preferência do jogador sem alterar o jogo.
// Mantém o ritmo respeitando as preferências desta versão e da versão já publicada.
const A11Y_KEYS = ['qh-a11y-v1','qh-accessibility-settings'];

// Lê as preferências locais direto do navegador, sem importar a camada de acessibilidade
// (assim este módulo continua seguro para usar antes do jogo carregar).
export function instantTextOn() {
  try {
    for (const key of A11Y_KEYS) {
      const raw = JSON.parse(localStorage.getItem(key) || 'null');
      if (raw && (raw.instant || raw.screenReader)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Espera normal do jogo, ou nada quando a narração está ligada.
export function a11yDelay(ms) {
  return instantTextOn() ? 0 : Math.max(0, Number(ms) || 0);
}
