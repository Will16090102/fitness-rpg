import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { INVENTARIO_INICIAL, TIERS, porId, tirarBotin, aspecto } from '../data/armeria.js';
import { sombrear } from '../game/pixel.js';
import { sonido } from '../services/audio.js';
import Avatar from './Avatar.jsx';
import { compartirPNG, tarjetaPNG } from './tarjeta.js';

const LORE = ['Vael golpea el yunque: «Cada serie despierta a un durmiente».', 'Lyra anota en sus Crónicas: hoy el valle respiró un poco más.', 'Una luz cálida cruza Oakhaven: alguien recuerda su nombre.', 'Las cadenas del Carcelero suenan cada vez más débiles.', 'Huele a hierro y a esperanza, Portador.'];
const COFRE = { W: '#9a6a33', G: '#f59e0b', O: '#1B0F2A', K: '#5e3b14' };
const TAPA = ['..OOOOOOOO..', '.OWWWWWWWWO.', 'OWWWWGGWWWWO', 'OOOOOGGOOOOO'];
const CUERPO = ['OWWWWGGWWWWO', 'OWKWWGGWWKWO', 'OWWWWWWWWWWO', 'OKWWWWWWWWKO', '.OOOOOOOOOO.'];
const PERGAMINO = { background: '#ead9ae', border: '4px solid #5e3b14', boxShadow: 'inset 0 0 0 3px #b8913f, 0 4px 0 #090614', color: '#3a2410' };
const CHISPAS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

export default function Botin({ uid, perfil, onCerrar }) {
  const ses = perfil.sesion;
  const st = ses.stats || {};
  const [fase, setFase] = useState(ses.botin ? 'abierto' : 'cerrado');
  const [drop, setDrop] = useState(ses.botin?.item ? porId(ses.botin.item) : null);
  const [ocupado, setOcupado] = useState(false);
  const s = 8, h = s / 2;
  const tapa = useMemo(() => sombrear(TAPA, COFRE, { oy: 4 }), []);
  const cuerpo = useMemo(() => sombrear(CUERPO, COFRE, { oy: 8 }), []);
  const dibujar = (rs) => rs.map((r, n) => <rect key={n} x={r.x * h} y={r.y * h} width={r.w * h} height={r.h * h} fill={r.f} />);

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
  const stat = (n, v) => <div className="p-2 text-center" style={{ border: '3px solid #5e3b14', background: '#f3e6c3' }}><div className="text-base">{n}</div><b className="font-pixel text-[11px]" style={{ color: '#8a4b0f' }}>{v}</b></div>;
  const resc = (st.rescatados || []).map((k) => k[0].toUpperCase() + k.slice(1));
  const vibra = fase === 'cerrado' ? { x: [0, -2, 2, -1, 1, 0], y: [0, -1, 0] } : fase === 'agitando' ? { rotate: [0, -7, 7, -7, 7, -4, 4, 0] } : {};

  return (
    <div className="fixed inset-0 z-40 bg-space overflow-y-auto" role="dialog" aria-label="Botín de batalla">
      <div className="mx-auto max-w-[430px] p-5 flex flex-col gap-3 items-stretch">
        <h1 className="font-pixel text-gold text-xs leading-relaxed text-center">¡VICTORIA!</h1>
        <div className="flex justify-center relative">
          <motion.div className="absolute inset-0 m-auto w-48 h-48 rounded-full" style={{ background: 'radial-gradient(#f59e0b55,transparent 70%)' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />
          <div className="relative"><Avatar clase={perfil.clase} tinte={perfil.tinte} escala={6} pose="victoria" {...aspecto(perfil)} etiqueta="Tu héroe celebrando la victoria" /></div>
        </div>

        <div className="p-3 flex flex-col gap-2" style={PERGAMINO}>
          <b className="font-pixel text-[10px] text-center" style={{ color: '#8a4b0f' }}>BOTÍN DE BATALLA</b>
          <div className="grid grid-cols-2 gap-2">{stat('Daño total', `${st.dmg || 0} HP`)}{stat('Tonelaje', `${st.ton || 0} kg`)}{stat('Series', st.series || 0)}{stat('Nuevos PR', st.prs || 0)}</div>
          {resc.length > 0 && <p className="text-center" style={{ color: '#1f6b4a' }}>Rescatados hoy: {resc.join(', ')}</p>}
          <p className="italic text-center">{LORE[Math.floor(Date.now() / 86400000) % LORE.length]}</p>
        </div>

        <button onClick={abrir} disabled={fase !== 'cerrado'} aria-label={fase === 'cerrado' ? 'Abrir cofre' : 'Cofre'} className="relative mx-auto min-h-12 mt-2">
          {fase !== 'abierto' && <motion.div className="absolute inset-0 m-auto w-28 h-28 rounded-full" style={{ background: 'radial-gradient(#ffe08a88,transparent 70%)' }} animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 1.2, repeat: Infinity }} />}
          <motion.svg width={12 * s} height={13 * s} viewBox={`0 0 ${12 * s} ${13 * s}`} shapeRendering="crispEdges" className="relative" animate={vibra} transition={fase === 'cerrado' ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.8 } : { duration: 0.9 }}>
            {fase === 'abierto' && <motion.rect x="4" y="0" width={12 * s - 8} height={6 * s} fill="#ffe08a" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.55] }} transition={{ duration: 0.7 }} />}
            <motion.g animate={fase === 'abierto' ? { y: -3 * s, rotate: -14 } : { y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 10 }} style={{ transformOrigin: '0px 40px' }}>{dibujar(tapa)}</motion.g>
            {dibujar(cuerpo)}
            {fase === 'abierto' && CHISPAS.map(([dx, dy], i) => (
              <motion.g key={i} initial={{ x: 6 * s, y: 5 * s, opacity: 0 }} animate={{ x: 6 * s + dx * 44, y: 5 * s + dy * 44, opacity: [0, 1, 0] }} transition={{ duration: 0.8 }}>
                <rect x="-4" y="-4" width="8" height="8" fill={i % 2 ? '#ffe08a' : '#f59e0b'} />
              </motion.g>
            ))}
          </motion.svg>
          {fase === 'cerrado' && <span className="block text-sm text-gold mt-1">Toca el cofre para abrirlo</span>}
        </button>
        <AnimatePresence>{fase === 'agitando' && <motion.div className="fixed inset-0 bg-white pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 0.95, 0] }} transition={{ duration: 0.9, times: [0, 0.6, 0.8, 1] }} exit={{ opacity: 0 }} />}</AnimatePresence>

        {fase === 'abierto' && (
          <motion.div initial={{ y: 60, scale: 0.3, opacity: 0 }} animate={{ y: [60, -24, 0], scale: [0.3, 1.15, 1], opacity: 1 }} transition={{ duration: 0.6 }} className="border-4 p-3 text-center bg-card" style={{ borderColor: drop ? drop.color : '#10b981' }}>
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
