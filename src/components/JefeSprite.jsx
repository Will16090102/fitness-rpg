import { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { sombrear } from '../game/pixel.js';

const SPRITES = [
  { pal: { O: '#1B0F2A', A: '#7a8396', a: '#565e70', E: '#ff4040', W: '#e8e0c8', B: '#c08a3a' },
    map: ['..OOOOOOOO..', '.OAAAAAAAAO.', '.OAEEAAEEAO.', '.OAAAAAAAAO.', '..OAWWWWAO..', '.OOAAAAAAOO.', 'OAAOAAAAOAAO', 'OAAOAaaAOAAO', 'OBBOAAAAOBBO', '.OOOAAAAOOO.', '...OAAAAO...', '..OOO..OOO..'] },
  { pal: { O: '#0f2a1b', A: '#3fae6a', a: '#2b8050', E: '#ffd24a' },
    map: ['OOO.OOO.OOO.', 'AEA.AEA.AEA.', 'OAO.OAO.OAO.', '.A...A...A..', '.AA..AA..AA.', '..AAAAAAAA..', '.OAAAAAAAAO.', 'OAAaAAAAaAAO', 'OAAAAAAAAAAO', 'OAaAAAAAAaAO', '.OAAAAAAAAO.', '..OOOOOOOO..'] },
  { pal: { O: '#1B0F2A', A: '#6fb8e8', a: '#4a8cc0', E: '#1B0F2A', W: '#f2f7ff', S: '#F0C08F' },
    map: ['....OOOO....', '...OWWWWO...', '...OWSSWO...', '...OSEESO...', '....OSSO....', '..OOAAAAOO..', '.OAAAaaAAAO.', 'OAAAAAAAAAAO', 'OAWAAAAAAWAO', '.OAAAaaAAAO.', '..OAAAAAAO..', '...OOOOOO...'] },
  { pal: { O: '#1B0F2A', A: '#9a8f80', a: '#6e6558', E: '#ff9a2a' },
    map: ['..OOOOOOOO..', '.OAAAAAAAAO.', '.OAEAAAAEAO.', '.OAAAAAAAAO.', 'OOAAaaaaAAOO', 'OAAAAAAAAAAO', 'OAAaAAAAaAAO', 'OAAAAAAAAAAO', 'OAAAOAAOAAAO', 'OAAAOAAOAAAO', 'OOOO.OO.OOOO'] },
];

export default function JefeSprite({ cap = 1, golpe = 0, derrotado = false, escala = 6 }) {
  const { pal, map } = SPRITES[Math.min(Math.max(cap, 1), SPRITES.length) - 1];
  const ctrl = useAnimationControls();
  useEffect(() => {
    if (golpe > 0 && !derrotado) ctrl.start({ x: [0, -8, 6, -3, 0], filter: ['brightness(3)', 'brightness(1)', 'brightness(1)', 'brightness(1)', 'brightness(1)'], transition: { duration: 0.3 } });
  }, [golpe, derrotado, ctrl]);
  return (
    <motion.div animate={derrotado ? { rotate: 80, y: 18, opacity: 0.3 } : { rotate: 0, y: 0, opacity: 1 }} transition={{ duration: 0.8 }} style={{ transformOrigin: '50% 100%' }}>
      <motion.div animate={ctrl}>
        <motion.svg width={12 * escala} height={map.length * escala} viewBox={`0 0 ${12 * escala} ${map.length * escala}`} shapeRendering="crispEdges" role="img" aria-label={derrotado ? 'Jefe derrotado' : 'Jefe del capítulo'}
          animate={derrotado ? {} : { y: [0, -3, 0], scaleY: [1, 1.03, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '50% 100%' }}>
          {sombrear(map, pal).map((r, n) => <rect key={n} x={(r.x * escala) / 2} y={(r.y * escala) / 2} width={(r.w * escala) / 2} height={(r.h * escala) / 2} fill={r.f} />)}
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
