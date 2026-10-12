// Original desk symbols: one outline, paper base and restrained department colors.
const symbols={
 calls:['#81c8b1','<path d="M12 12h40v31H28l-12 9v-9h-4z"/><path d="M21 23h22M21 31h15"/>'],
 files:['#e3c17c','<path d="M8 17h18l6 7h24v29H8z"/><path d="M14 33h35M14 41h27"/>'],
 boss:['#98bbcb','<rect x="9" y="16" width="46" height="35" rx="3"/><path d="m11 19 21 18 21-18M12 48l14-13m26 13L38 35"/>'],
 ledger:['#98bbcb','<path d="M15 8h27l8 8v40H15zM42 8v10h8"/><path d="M23 43V32m9 11V25m9 18V35"/>'],
 help:['#98bbcb','<path d="M10 12h19l3 5 3-5h19v41H35l-3 3-3-3H10zM32 17v34"/><path d="M17 24h9m-9 8h9m12-8h9m-9 8h9"/>'],
 shop:['#e3c17c','<path d="M10 21h44l-4 33H14zM23 21v-6a9 9 0 0 1 18 0v6"/><path d="M23 34h18m-14 7h10"/>'],
 prize:['#e3c17c','<path d="M21 11h22v23a11 11 0 0 1-22 0zM21 17H11v9c0 9 7 12 13 12m19-21h10v9c0 9-7 12-13 12M32 45v10m-11 0h22"/>'],
 support:['#98bbcb','<rect x="9" y="10" width="46" height="34" rx="3"/><path d="m18 20 8 7-8 7m15 0h11M32 44v11m-13 0h26"/>'],
 club:['#b7a1c3','<rect x="9" y="15" width="46" height="36" rx="3"/><circle cx="24" cy="28" r="6"/><path d="M15 43c2-11 16-11 18 0m5-16h10m-10 9h10M28 9h8v9h-8z"/>'],
 wallet:['#81c8b1','<path d="M10 18h41v34H10zM10 18l35-8v8"/><path d="M38 29h17v13H38z"/><circle cx="44" cy="35.5" r="1.5"/>'],
 update:['#98bbcb','<path d="M15 8h26l9 9v39H15zM41 8v10h9"/><path d="m24 38 8-9 8 9m-8-9v18"/>'],
 link:['#81c8b1','<rect x="10" y="14" width="44" height="35" rx="3"/><path d="M10 24h44M18 34h11m8 0h9m-28 7h7"/>']
};
export function officeIcon(id){const [accent,art]=symbols[id]||symbols.help;return `<svg class="office-icon" viewBox="0 0 64 64" aria-hidden="true"><g fill="${accent}" stroke="#173b3a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;}
