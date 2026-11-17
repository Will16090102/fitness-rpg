import { motion } from 'framer-motion';

const BASE = ['....OOOOOO....', '...OHHHHHHO...', '..OHHHHHHHHO..', '..OHHHHHHHHO..', '..OHSSSSSSHO..', '..OSSESSESSO..', '..OSSESSESSO..', '..OSSSSSSSSO..', '...OSSSSSSO...', '....OOOOOO....',
  '...OAAAAAAO...', '..OCAaAAaACO..', '..OCAAAAAACO..', '..OSBBBBBBSO..', '...OAAAAAAO...', '...OLLOOLLO...', '...OLLO.OLLO..', '...ODDO.ODDO..'];
const PAL = {
  guerrero: { O: '#1B0F2A', H: '#B9BFCC', S: '#F0C08F', E: '#1B0F2A', A: '#9AA3B5', a: '#6F7890', C: '#C0392B', B: '#F2A541', L: '#5A6070', D: '#3A3F4F' },
  explorador: { O: '#1B0F2A', H: '#8A4B2A', S: '#F0C08F', E: '#1B0F2A', A: '#4FA05A', a: '#347A41', C: '#2F6B3A', B: '#8A5A2B', L: '#5B3A22', D: '#3A2414' },
  mago: { O: '#1B0F2A', H: '#3B2257', S: '#F0C08F', E: '#1B0F2A', A: '#5A3D8C', a: '#432C6B', C: '#33204F', B: '#F2A541', L: '#432C6B', D: '#2A1A44' },
};
// Capas del sprite: cada una se puede teñir o reemplazar por equipo
const CAPAS = { capa: 'C', pechera: 'AaB', piernas: 'L', botas: 'D', cuerpo: 'OHSE' };

function oscurecer(hex, f = 0.75) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
const celdas = (pts, fill, s) => pts.map(([x, y]) => <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={fill} />);

export default function Avatar({ clase = 'guerrero', tinte, tintes = {}, escala = 6, etiqueta = 'Avatar del héroe' }) {
  const p = { ...PAL[clase] };
  const t = { pechera: tinte, ...tintes };
  if (t.pechera) { p.A = t.pechera; p.a = oscurecer(t.pechera); }
  if (t.capa) p.C = t.capa;
  if (t.botas) p.D = t.botas;
  const s = escala;
  const pts = (letras) => BASE.flatMap((fila, j) => [...fila].map((c, i) => (letras.includes(c) ? [i, j + 2] : null)).filter(Boolean));
  const gorro = clase === 'guerrero' ? celdas([[7, 0], [8, 0], [6, 1], [7, 1], [8, 1]], '#D6403A', s)
    : clase === 'explorador' ? celdas([[6, 1], [7, 1], [7, 0]], p.H, s)
      : [...celdas([[6, 0], [7, 0], [5, 1], [6, 1], [7, 1], [8, 1], ...Array.from({ length: 6 }, (_, k) => [4 + k, 2]), ...Array.from({ length: 12 }, (_, k) => [1 + k, 3])], '#6A3FB5', s)];
  return (
    <svg viewBox={`0 0 ${14 * s} ${21 * s}`} width={14 * s} height={21 * s} shapeRendering="crispEdges" role="img" aria-label={etiqueta}>
      <rect x={3 * s} y={20 * s} width={8 * s} height={s / 2} fill="#000" opacity="0.35" />
      <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        {Object.entries(CAPAS).map(([capa, letras]) => (
          <g key={capa} data-capa={capa}>
            {letras.split('').map((l) => <g key={l}>{celdas(pts(l), p[l], s)}</g>)}
          </g>
        ))}
        <g data-capa="cabeza">{gorro}</g>
        <motion.g animate={{ opacity: [0, 0, 1, 0, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.97, 1] }}>
          {celdas([[5, 7], [5, 8], [8, 7], [8, 8]], p.S, s)}
          <rect x={5 * s} y={8.5 * s} width={s} height={s / 2} fill={p.E} />
          <rect x={8 * s} y={8.5 * s} width={s} height={s / 2} fill={p.E} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
