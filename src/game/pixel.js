const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
// f > 0 aclara hacia blanco, f < 0 oscurece
export const mezclar = (hex, f) => '#' + rgb(hex).map((v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)).toString(16).padStart(2, '0')).join('');

// Sombreado 16-bit: cada celda se parte en 2x2 subpíxeles; luz arriba-izquierda y sombra abajo-derecha
// en los bordes de cada región. Devuelve rectángulos en medias celdas { x, y, w, h, f, c }.
export function sombrear(mapa, pal, { oy = 0 } = {}) {
  const at = (i, j) => (mapa[j] && mapa[j][i]) || '.';
  const out = [];
  mapa.forEach((fila, j) => [...fila].forEach((c, i) => {
    if (c === '.' || !pal[c]) return;
    const base = pal[c];
    const plano = c === 'O' || c === 'E';
    const luz = plano ? base : mezclar(base, 0.3);
    const som = plano ? base : mezclar(base, -0.3);
    const up = at(i, j - 1) !== c, lf = at(i - 1, j) !== c, dn = at(i, j + 1) !== c, rt = at(i + 1, j) !== c;
    const sub = [up || lf ? luz : base, up ? luz : rt ? som : base, lf ? luz : dn ? som : base, dn || rt ? som : base];
    const x = i * 2, y = (j + oy) * 2;
    if (sub.every((f) => f === sub[0])) out.push({ x, y, w: 2, h: 2, f: sub[0], c });
    else sub.forEach((f, k) => out.push({ x: x + (k % 2), y: y + (k >> 1), w: 1, h: 1, f, c }));
  }));
  return out;
}
