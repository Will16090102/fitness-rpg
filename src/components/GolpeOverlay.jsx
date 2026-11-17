import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import JefeSprite from './JefeSprite.jsx';

const DIR = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
// Cada estilo de ataque depende del tipo de ejercicio
const HEROE = {
  golpe: { x: [0, 80, 80, 0] },
  tajo: { x: [0, 80, 80, 0], rotate: [0, -14, 14, 0] },
  salto: { x: [0, 80, 80, 0], y: [0, -60, 0, 0] },
  giro: { x: [0, 80, 80, 0], rotate: [0, 180, 360, 360] },
  rafaga: { x: [0, 80, 50, 80, 50, 80, 0] },
};

export default function GolpeOverlay({ anim, perfil, cap, golpe }) {
  const h = HEROE[anim.estilo] || HEROE.golpe;
  const n = h.x.length;
  const times = Array.from({ length: n }, (_, i) => i / (n - 1));
  return (
    <motion.div className="fixed inset-0 z-30 bg-black/80 flex flex-col items-center justify-center gap-6 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} aria-live="polite">
      <div className="w-full max-w-[430px]">
        <div className="flex justify-between text-sm text-[#c9bee8] mb-1"><span>{perfil.jefe.nombre}</span><span>{anim.despues}%</span></div>
        <div className="h-5 border-2 border-black bg-[#3b2a66]">
          <motion.div className="h-full bg-crimson" initial={{ width: `${anim.antes}%` }} animate={{ width: `${anim.despues}%` }} transition={{ delay: 0.35, duration: 0.5 }} />
        </div>
      </div>
      <div className="relative w-full max-w-[430px] flex items-end justify-between px-6">
        <motion.div initial={{ x: 0, y: 0, rotate: 0 }} animate={h} transition={{ duration: 0.8, times }}><Avatar clase={perfil.clase} tinte={perfil.tinte} escala={8} /></motion.div>
        <motion.div animate={{ x: [0, 0, 24, 0] }} transition={{ duration: 0.6, times: [0, 0.55, 0.7, 1] }}><JefeSprite cap={cap} golpe={golpe} escala={9} /></motion.div>
        <svg width="80" height="80" viewBox="-40 -40 80 80" shapeRendering="crispEdges" className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          {DIR.map(([dx, dy], i) => (
            <motion.g key={i} initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: dx * 32, y: dy * 32, opacity: [0, 1, 0] }} transition={{ delay: 0.35, duration: 0.45 }}>
              <rect x="-4" y="-4" width="8" height="8" fill={i % 2 ? '#ffe08a' : '#f59e0b'} />
            </motion.g>
          ))}
        </svg>
      </div>
      <motion.b initial={{ y: 0, opacity: 0 }} animate={{ y: -30, opacity: [0, 1, 1, 0] }} transition={{ delay: 0.35, duration: 0.8 }} className={`font-pixel text-sm ${anim.crit ? 'text-gold' : 'text-[#f8f1d8]'}`}>
        {anim.crit ? `¡CRÍTICO! -${anim.dmg} HP` : `-${anim.dmg} HP`}
      </motion.b>
      {(anim.finEj || anim.victoria) && (
        <motion.b initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-pixel text-[10px] text-emerald">{anim.victoria ? '¡JEFE DERROTADO!' : '¡EJERCICIO COMPLETADO!'}</motion.b>
      )}
    </motion.div>
  );
}
