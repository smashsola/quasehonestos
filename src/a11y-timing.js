// Ritmo das falas. Camada de acessibilidade: lida a preferência do jogador sem alterar o jogo.
// A preferência é gravada pela camada de acessibilidade (public/src/a11y.js) na chave qh-a11y-v1.
const A11Y_KEY = 'qh-a11y-v1';

// Lê a preferência de texto instantâneo direto do navegador, sem importar a camada de acessibilidade
// (assim este módulo continua seguro para usar antes do jogo carregar).
export function instantTextOn() {
  try {
    const raw = JSON.parse(localStorage.getItem(A11Y_KEY) || 'null');
    return !!(raw && raw.instant);
  } catch {
    return false;
  }
}

// Espera normal do jogo, ou nada quando o jogador pediu texto instantâneo.
export function a11yDelay(ms) {
  return instantTextOn() ? 0 : Math.max(0, Number(ms) || 0);
}
