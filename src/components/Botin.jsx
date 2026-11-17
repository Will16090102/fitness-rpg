import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { INVENTARIO_INICIAL, TIERS, porId, tirarBotin, aspecto } from '../data/armeria.js';
import { sonido } from '../services/audio.js';
import Avatar from './Avatar.jsx';
import { compartirPNG, tarjetaPNG } from './tarjeta.js';

const LORE = ['Vael golpea el yunque: «Cada serie despierta a un durmiente».', 'Lyra anota en sus Crónicas: hoy el valle respiró un poco más.', 'Una luz cálida cruza Oakhaven: alguien recuerda su nombre.', 'Las cadenas del Carcelero suenan cada vez más débiles.', 'Huele a hierro y a esperanza, Portador.'];
const COFRE = { W: '#8a5a2b', G: '#f59e0b', O: '#1B0F2A' };
const TAPA = ['..OOOOOOOO..', '.OWWWWWWWWO.', 'OWWWWGGWWWWO', 'OOOOOGGOOOOO'];
const CUERPO = ['OWWWWGGWWWWO', 'OWWWWWWWWWWO', 'OWWWWWWWWWWO', 'OWWWWWWWWWWO', '.OOOOOOOOOO.'];
const celdas = (filas, y0, s) => filas.flatMap((f, j) => [...f].map((c, i) => (COFRE[c] ? <rect key={`${i}-${j}-${y0}`} x={i * s} y={(j + y0) * s} width={s} height={s} fill={COFRE[c]} /> : null)));

export default function Botin({ uid, perfil, onCerrar }) {
  const ses = perfil.sesion;
  const st = ses.stats || {};
  const [fase, setFase] = useState(ses.botin ? 'abierto' : 'cerrado');
  const [drop, setDrop] = useState(ses.botin?.item ? porId(ses.botin.item) : null);
  const [ocupado, setOcupado] = useState(false);
  const s = 8;

  const abrir = () => {
    if (fase !== 'cerrado') return;
    sonido.click();
    setFase('agitando');
    setTimeout(() => {
      const inv = perfil.inventario || INVENTARIO_INICIAL;
      const it = tirarBotin(inv);
      setDrop(it); setFase('abierto');
      (it && it.tier >= 3 ? sonido.critico : sonido.victoria)();
      setDoc(doc(db, 'usuarios', uid), { inventario: it ? [...inv, it.id] : inv, fragmentos: (perfil.fragmentos || 0) + 1, sesion: { ...ses, botin: { item: it ? it.id : null } } }, { merge: true }).catch(() => {});
    }, 900);
  };
  const compartir = async () => {
    setOcupado(true);
    try { await compartirPNG(await tarjetaPNG({ perfil, item: drop })); } catch { /* cancelado */ }
    setOcupado(false);
  };
  const stat = (n, v) => <div className="border-4 border-black bg-card p-2 text-center"><div className="text-sm text-[#c9bee8]">{n}</div><b className="font-pixel text-[11px] text-gold">{v}</b></div>;
  const resc = (st.rescatados || []).map((k) => k[0].toUpperCase() + k.slice(1));

  return (
    <div className="fixed inset-0 z-40 bg-space overflow-y-auto" role="dialog" aria-label="Botín de batalla">
      <div className="mx-auto max-w-[430px] p-5 flex flex-col gap-3 items-stretch">
        <h1 className="font-pixel text-gold text-xs leading-relaxed text-center">BOTÍN DE BATALLA</h1>
        <div className="flex justify-center"><motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 0.8, repeat: Infinity }}><Avatar clase={perfil.clase} tinte={perfil.tinte} escala={6} {...aspecto(perfil)} /></motion.div></div>
        <div className="grid grid-cols-2 gap-2">{stat('Daño total', `${st.dmg || 0} HP`)}{stat('Tonelaje', `${st.ton || 0} kg`)}{stat('Series', st.series || 0)}{stat('Nuevos PR', st.prs || 0)}</div>
        {resc.length > 0 && <p className="text-center text-emerald">Rescatados hoy: {resc.join(', ')}</p>}
        <p className="italic text-center text-[#c9bee8]">{LORE[Math.floor(Date.now() / 86400000) % LORE.length]}</p>

        <button onClick={abrir} disabled={fase !== 'cerrado'} aria-label={fase === 'cerrado' ? 'Abrir cofre' : 'Cofre'} className="relative mx-auto min-h-12">
          <motion.svg width={12 * s} height={13 * s} viewBox={`0 0 ${12 * s} ${13 * s}`} shapeRendering="crispEdges" animate={fase === 'agitando' ? { rotate: [0, -6, 6, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.9 }}>
            {fase === 'abierto' && <motion.rect x="2" y="0" width={12 * s - 4} height={5 * s} fill="#ffe08a" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.5] }} transition={{ duration: 0.6 }} />}
            <motion.g animate={fase === 'abierto' ? { y: -3 * s, rotate: -12 } : { y: 0, rotate: 0 }} style={{ transformOrigin: '0 40px' }}>{celdas(TAPA, 4, s)}</motion.g>
            {celdas(CUERPO, 8, s)}
          </motion.svg>
          {fase === 'cerrado' && <span className="block text-sm text-gold">Toca para abrir</span>}
        </button>
        <AnimatePresence>{fase === 'agitando' && <motion.div className="fixed inset-0 bg-white pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0.9, 0] }} transition={{ duration: 0.9, times: [0, 0.6, 0.8, 1] }} exit={{ opacity: 0 }} />}</AnimatePresence>

        {fase === 'abierto' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-4 p-3 text-center bg-card" style={{ borderColor: drop ? drop.color : '#10b981' }}>
            {drop ? (<><b className="font-pixel text-[9px]" style={{ color: drop.color }}>{TIERS[drop.tier]}</b><div className="text-2xl">{drop.nombre}</div><div className="text-sm text-[#c9bee8]">Nueva pieza en tu Armería</div></>)
              : (<><b className="font-pixel text-[9px] text-emerald">FRAGMENTO DE VOLUNTAD</b><div className="text-lg">+1 · Esta vez no cayó equipo</div></>)}
          </motion.div>
        )}
        <button disabled={fase !== 'abierto' || ocupado} onClick={compartir} className="min-h-12 px-4 border-4 border-black bg-emerald text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] disabled:opacity-40">{ocupado ? 'CREANDO…' : 'COMPARTIR HAZAÑA'}</button>
        <button disabled={fase !== 'abierto'} onClick={onCerrar} className="min-h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] disabled:opacity-40">CONTINUAR</button>
      </div>
    </div>
  );
}
