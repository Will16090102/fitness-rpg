import { motion } from 'framer-motion';
import { rectasAvatar } from '../game/sprites.js';

// Cuerpo del avatar (sin <svg>) para poder usarlo dentro de escenas más grandes
export function AvatarCuerpo({ clase = 'guerrero', tinte, tintes = {}, aura, escala = 6, pose }) {
  const s = escala, h = s / 2;
  const { rects, p } = rectasAvatar({ clase, tinte, tintes, pose });
  const capas = {};
  rects.forEach((r) => { (capas[r.capa] = capas[r.capa] || []).push(r); });
  const halo = aura ? Array.from({ length: 21 * 14 }, (_, n) => {
    const i = n % 14, j = Math.floor(n / 14);
    const d = Math.abs((i + 0.5 - 7) / 7) + Math.abs((j + 0.5 - 10.5) / 10.5);
    const op = d <= 0.6 ? 0.35 : d <= 0.8 ? 0.22 : d <= 1 ? 0.12 : 0;
    return op ? <rect key={n} x={i * s} y={j * s} width={s} height={s} fill={aura} opacity={op} /> : null;
  }) : null;
  const salto = pose === 'victoria';
  return (
    <>
      <rect x={3 * s} y={20 * s} width={8 * s} height={s / 2} fill="#000" opacity="0.35" />
      {halo && <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.4, repeat: Infinity }}>{halo}</motion.g>}
      <motion.g animate={{ y: salto ? [0, -s * 1.2, 0] : [0, -2, 0] }} transition={{ duration: salto ? 0.7 : 2, repeat: Infinity, ease: 'easeInOut' }}>
        {Object.entries(capas).map(([capa, rs]) => (
          <g key={capa} data-capa={capa}>{rs.map((r, n) => <rect key={n} x={r.x * h} y={r.y * h} width={r.w * h} height={r.h * h} fill={r.f} />)}</g>
        ))}
        <motion.g animate={{ opacity: [0, 0, 1, 0, 0] }} transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.97, 1] }}>
          {[[5, 7], [5, 8], [8, 7], [8, 8]].map(([x, y]) => <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={p.S} />)}
          <rect x={5 * s} y={8.5 * s} width={s} height={s / 2} fill={p.E} />
          <rect x={8 * s} y={8.5 * s} width={s} height={s / 2} fill={p.E} />
        </motion.g>
      </motion.g>
    </>
  );
}

export default function Avatar({ escala = 6, pose, etiqueta = 'Avatar del héroe', ...resto }) {
  const arriba = pose === 'victoria' ? 3 : 0;
  return (
    <svg viewBox={`0 ${-arriba * escala} ${14 * escala} ${(21 + arriba) * escala}`} width={14 * escala} height={(21 + arriba) * escala} shapeRendering="crispEdges" role="img" aria-label={etiqueta}>
      <AvatarCuerpo escala={escala} pose={pose} {...resto} />
    </svg>
  );
}
