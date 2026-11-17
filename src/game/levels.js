// Curva exponencial: cada nivel pide ~15% más EXP que el anterior.
export const xpForLevel = (n) => Math.round(100 * Math.pow(1.15, n - 1));
export function levelFromXp(total) {
  let nivel = 1, resto = Math.max(0, total);
  while (resto >= xpForLevel(nivel)) { resto -= xpForLevel(nivel); nivel++; }
  return { nivel, actual: resto, necesaria: xpForLevel(nivel) };
}
