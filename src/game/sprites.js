import { mezclar, sombrear } from './pixel.js';

export const BASE = ['....OOOOOO....', '...OHHHHHHO...', '..OHHHHHHHHO..', '..OHHHHHHHHO..', '..OHSSSSSSHO..', '..OSSESSESSO..', '..OSSESSESSO..', '..OSSSSSSSSO..', '...OSSSSSSO...', '....OOOOOO....',
  '...OAAAAAAO...', '..OCAaAAaACO..', '..OCAAAAAACO..', '..OSBBBBBBSO..', '...OAAAAAAO...', '...OLLOOLLO...', '...OLLO.OLLO..', '...ODDO.ODDO..'];
export const PAL = {
  guerrero: { O: '#1B0F2A', H: '#B9BFCC', S: '#F0C08F', E: '#1B0F2A', A: '#9AA3B5', a: '#6F7890', C: '#C0392B', B: '#F2A541', L: '#5A6070', D: '#3A3F4F' },
  explorador: { O: '#1B0F2A', H: '#8A4B2A', S: '#F0C08F', E: '#1B0F2A', A: '#4FA05A', a: '#347A41', C: '#2F6B3A', B: '#8A5A2B', L: '#5B3A22', D: '#3A2414' },
  mago: { O: '#1B0F2A', H: '#3B2257', S: '#F0C08F', E: '#1B0F2A', A: '#5A3D8C', a: '#432C6B', C: '#33204F', B: '#F2A541', L: '#432C6B', D: '#2A1A44' },
};
// Capas del sprite: cada una se puede teñir o reemplazar por equipo
export const CAPAS = { capa: 'C', pechera: 'AaB', piernas: 'L', botas: 'D', cuerpo: 'OHSE' };
export const oscurecer = (hex, f = 0.75) => mezclar(hex, f - 1);
const CAPA_DE = Object.fromEntries(Object.entries(CAPAS).flatMap(([k, ls]) => [...ls].map((l) => [l, k])));

// Rectángulos del avatar en medias celdas (sombreados). pose 'victoria': brazo y espada en alto.
export function rectasAvatar({ clase = 'guerrero', tinte, tintes = {}, pose } = {}) {
  const p = { ...PAL[clase] };
  const t = { pechera: tinte, ...tintes };
  if (t.pechera) { p.A = t.pechera; p.a = oscurecer(t.pechera); }
  if (t.capa) p.C = t.capa;
  if (t.botas) p.D = t.botas;
  const victoria = pose === 'victoria';
  const mapa = victoria ? BASE.map((f, j) => (j === 13 ? f.slice(0, 10) + 'C' + f.slice(11) : f)) : BASE;
  const rects = sombrear(mapa, p, { oy: 2 }).map((r) => ({ ...r, capa: CAPA_DE[r.c] }));
  const cel = (x, y, f, w = 1, h = 1) => rects.push({ x: x * 2, y: y * 2, w: w * 2, h: h * 2, f, c: '', capa: 'cabeza' });
  if (clase === 'guerrero') { cel(7, 0, '#D6403A', 2); cel(6, 1, '#D6403A', 3); cel(8, 1, '#8F2D22'); }
  else if (clase === 'explorador') { cel(6, 1, p.H, 2); cel(7, 0, p.H); }
  else { cel(6, 0, '#6A3FB5', 2); cel(5, 1, '#6A3FB5', 4); cel(4, 2, '#6A3FB5', 6); cel(1, 3, '#6A3FB5', 12); cel(1, 3, '#8A63D8', 12, 0.5); cel(2, 4, '#3B2257', 2); cel(10, 4, '#3B2257', 2); }
  if (victoria) {
    cel(12, 7, p.S, 1, 7); cel(11, 13, p.A); cel(12, 6, p.S);
    cel(11, 5, '#F2A541', 3); cel(12, -2, '#D8DDE8', 1, 7); cel(12, -3, '#FFFFFF'); cel(12, -2, '#FFFFFF', 0.5, 7);
  }
  return { rects, p };
}
