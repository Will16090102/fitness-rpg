const SEM = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const p2 = (n) => String(n).padStart(2, '0');
export const hoyKey = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const aFecha = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const sumarDias = (k, n) => { const d = aFecha(k); d.setDate(d.getDate() + n); return hoyKey(d); };
export const diffDias = (a, b) => { const f = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((f(a) - f(b)) / 86400000); };

// Recorre los días sin revisar hasta ayer: aplica Elixires, pierde racha y degrada atributos.
export function reconciliar(p, hoy) {
  const out = { racha: p.racha || 0, elixires: p.elixires || 0, atributos: { ...p.atributos }, ultimaRevision: hoy };
  if (!p.ultimoEntreno) return out;
  const dias = p.dias || [];
  let d = p.ultimaRevision && p.ultimaRevision > p.ultimoEntreno ? p.ultimaRevision : sumarDias(p.ultimoEntreno, 1);
  for (; d < hoy; d = sumarDias(d, 1)) {
    let protegido = false;
    if (dias.includes(SEM[aFecha(d).getDay()])) {
      if (out.racha > 0 && out.elixires > 0) { out.elixires--; protegido = true; } else out.racha = 0;
    }
    if (diffDias(d, p.ultimoEntreno) > 3 && !protegido) {
      for (const k of Object.keys(out.atributos)) out.atributos[k] = Math.max(1, out.atributos[k] - 1);
    }
  }
  return out;
}

// Se llama al registrar la primera serie del día. Elixir: a los 3 días y luego cada 5 (máx. 2).
export function alRegistrarEntreno(p, hoy) {
  if (p.ultimoEntreno === hoy) return { racha: p.racha || 0, elixires: p.elixires || 0, ultimoEntreno: hoy };
  const racha = (p.racha || 0) + 1;
  let elixires = p.elixires || 0;
  if ((racha === 3 || (racha > 3 && (racha - 3) % 5 === 0)) && elixires < 2) elixires++;
  return { racha, elixires, ultimoEntreno: hoy };
}

// El Velo de Ceniza: más de 4 días sin entrenar y sin Elixir
export const velo = (p, hoy) => (p.ultimoEntreno ? diffDias(hoy, p.ultimoEntreno) > 4 && !(p.elixires > 0) : false);
