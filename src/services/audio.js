// Sintetizador 8-bit con Web Audio API (sin archivos externos)
let ctx;
let silencio = typeof localStorage !== 'undefined' && localStorage.getItem('mute') === '1';
function tono(f, d, tipo = 'square', t0 = 0, vol = 0.08, f2) {
  if (silencio) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime + t0;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d);
  } catch { /* sin audio disponible */ }
}
export const sonido = {
  click: () => tono(660, 0.05),
  ataque: () => { tono(400, 0.2, 'sawtooth', 0, 0.1, 80); tono(60, 0.25, 'sine', 0, 0.15); },
  critico: () => { tono(880, 0.1); tono(1320, 0.15, 'square', 0.1); },
  finDescanso: () => [0, 0.2, 0.4].forEach((t) => tono(1000, 0.1, 'square', t)),
  victoria: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.18, 'square', i * 0.15)),
};
export const esSilencio = () => silencio;
export function alternarSilencio() { silencio = !silencio; localStorage.setItem('mute', silencio ? '1' : '0'); return silencio; }
