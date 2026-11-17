import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './services/firebase.js';
import { loginAnonimo, loginGoogle, logout, watchUser } from './services/auth.js';
import { levelFromXp } from './game/levels.js';
import { hoyKey, reconciliar, velo as hayVelo } from './game/streak.js';
import { BONO_TEXTO, momento } from './game/oakhaven.js';
import Aldea from './components/Aldea.jsx';
import NavBar from './components/NavBar.jsx';
import Onboarding from './screens/Onboarding.jsx';
import { CajaIcono, Pix, Placa } from './components/Marco.jsx';
import { mezclar } from './game/pixel.js';
import Rutina from './screens/Rutina.jsx';
import Armeria from './screens/Armeria.jsx';

const btn = 'h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] active:translate-y-[3px] active:shadow-none';
const FLAMA = ['...X....', '..XX....', '..XXX...', '.XXXX...', '.XXXXX..', 'XXXXXXX.', 'XXXXXXX.', '.XXXXX..'];

const ICONOS = {
  fuerza: ['......XX', '.....XXX', '....XXX.', '...XXX..', 'X.XXX...', '.XXX....', '.XX.....', 'X.X.....'],
  resistencia: ['.XX..XX.', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '........'],
  velocidad: ['....XXX.', '...XXX..', '..XXX...', '.XXXXXX.', '...XXX..', '..XX....', '..X.....', '.X......'],
};
const Icono = ({ k, color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} aria-hidden="true">{ICONOS[k].flatMap((f, j) => [...f].map((c, i) => (c === 'X' ? <rect key={`${i}-${j}`} x={i * 3} y={j * 3} width="3" height="3" /> : null)))}</svg>
);
const Barra = ({ label, v, color, icono }) => (
  <div className="flex items-center gap-2">
    {icono ? <CajaIcono><Pix mapa={ICONOS[icono]} pal={{ X: color }} s={3} /></CajaIcono> : <div className="w-10 shrink-0" />}
    <div className="flex-1">
      <div className="flex justify-between text-lg leading-tight"><span>{label}</span><span className="font-pixel text-[10px] self-center">{Math.round(v)}</span></div>
      <div className="h-4 border-[3px] border-[#090614] bg-[#1a1438]"><div className="h-full" style={{ width: `${Math.min(100, v)}%`, background: `linear-gradient(${mezclar(color, 0.35)}, ${color} 55%, ${mezclar(color, -0.3)})` }} /></div>
    </div>
  </div>
);

function Llama({ racha }) {
  const color = racha >= 7 ? '#38bdf8' : '#f59e0b';
  return (
    <div className="flex items-center gap-2" aria-label={`Racha de ${racha} días`}>
      <motion.svg width="24" height="24" viewBox="0 0 24 24" shapeRendering="crispEdges" fill={color} animate={{ scaleY: [1, 1.12, 0.95, 1] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ transformOrigin: '50% 100%' }}>
        {FLAMA.flatMap((f, j) => [...f].map((c, i) => (c === 'X' ? <rect key={`${i}-${j}`} x={i * 3} y={j * 3} width="3" height="3" /> : null)))}
      </motion.svg>
      <b className="font-pixel text-[10px]" style={{ color }}>{racha}</b>
    </div>
  );
}

const Pocion = ({ llena }) => (
  <svg width="18" height="24" viewBox="0 0 6 8" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="2" y="0" width="2" height="1" fill="#c9bee8" /><rect x="2" y="1" width="2" height="2" fill="#c9bee8" />
    <rect x="1" y="3" width="4" height="4" fill={llena ? '#10b981' : '#3b2a66'} /><rect x="1" y="3" width="4" height="4" fill="none" stroke="#000" strokeWidth="0.5" />
  </svg>
);

const Pronto = ({ titulo, texto }) => (
  <div className="border-4 border-black bg-card shadow-[0_4px_0_#090614] p-4"><h2 className="font-pixel text-[10px] text-gold mb-2">{titulo}</h2><p className="text-[#c9bee8]">{texto}</p></div>
);

export default function App() {
  const [user, setUser] = useState(undefined);
  const [perfil, setPerfil] = useState(undefined);
  const [tab, setTab] = useState('avatar');
  const [vista, setVista] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => watchUser(setUser), []);
  useEffect(() => {
    if (!user) { setPerfil(undefined); return undefined; }
    return onSnapshot(doc(db, 'usuarios', user.uid), (s) => setPerfil(s.exists() && s.data().nombre ? s.data() : null), (e) => setErr(e.code || e.message));
  }, [user]);
  // Al abrir la app: aplica Elixires, pérdida de racha y decay de los días que pasaron
  useEffect(() => {
    if (!user || !perfil) return;
    const hoy = hoyKey();
    if (perfil.ultimaRevision === hoy) return;
    setDoc(doc(db, 'usuarios', user.uid), reconciliar(perfil, hoy), { merge: true }).catch(() => {});
  }, [user, perfil]);
  const run = (fn) => async () => { setErr(''); try { await fn(); } catch (e) { setErr(e.code || e.message); } };

  if (user === undefined || (user && perfil === undefined && !err)) return <p className="p-5">Cargando…</p>;
  if (!user) return (
    <main className="mx-auto max-w-[430px] min-h-screen p-5 flex flex-col gap-4 justify-center">
      <h1 className="font-pixel text-gold text-lg leading-relaxed">GYM RPG</h1>
      <p className="text-[#c9bee8]">El Tratado de la Carne y el Hierro</p>
      <button className={btn} onClick={run(loginAnonimo)}>ENTRAR ANÓNIMO</button>
      <button className={btn} onClick={run(loginGoogle)}>ENTRAR CON GOOGLE</button>
      {err && <p role="alert" className="text-crimson text-sm">Error: {err}</p>}
    </main>
  );
  if (perfil === null) return <Onboarding uid={user.uid} />;
  if (!perfil) return <p role="alert" className="p-5 text-crimson">Error: {err}</p>;

  const lv = levelFromXp(perfil.exp ?? 0);
  const velo = hayVelo(perfil, hoyKey());
  const a = perfil.atributos || {};
  return (
    <div className="pb-20">
      <main className="mx-auto max-w-[430px] min-h-screen p-5 flex flex-col gap-4">
        {tab === 'avatar' && vista !== 'armeria' && <div className="text-center"><Placa>AVATAR</Placa></div>}
        <div className="flex items-center justify-between">
          <b className="font-pixel text-gold text-sm">NV. {lv.nivel}</b>
          <span className="text-[#c9bee8]">{perfil.nombre}</span>
          <Llama racha={perfil.racha || 0} />
        </div>
        {tab === 'avatar' && vista === 'armeria' && <Armeria uid={user.uid} perfil={perfil} onVolver={() => setVista(null)} />}
        {tab === 'avatar' && vista !== 'armeria' && (<>
          <Aldea perfil={perfil} velo={velo} />
          <p className="text-sm text-[#c9bee8]">{BONO_TEXTO[momento(new Date().getHours())]}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg">Elixires de Escudo</span>
            <div className="flex gap-1">{[0, 1].map((i) => <Pocion key={i} llena={i < (perfil.elixires || 0)} />)}</div>
          </div>
          <div className="flex flex-col gap-3">
            <Barra label="EXP" v={Math.round((lv.actual / lv.necesaria) * 100)} color="#f59e0b" />
            <Barra label="Fuerza" icono="fuerza" v={a.fuerza ?? 0} color="#ef4444" />
            <Barra label="Resistencia" icono="resistencia" v={a.resistencia ?? 0} color="#10b981" />
            <Barra label="Velocidad" icono="velocidad" v={a.velocidad ?? 0} color="#3b82f6" />
          </div>
          <button className={btn} onClick={() => setVista('armeria')}>ARMERÍA</button>
          <button className={btn + ' bg-[#3b2a66] text-[#f8f1d8]'} onClick={run(logout)}>SALIR</button>
        </>)}
        {tab === 'rutina' && <Rutina uid={user.uid} perfil={perfil} />}
        {tab === 'cronicas' && <Pronto titulo="CRÓNICAS" texto="El mapa de capítulos y el bestiario llegan con los jefes." />}
        {tab === 'ranking' && <Pronto titulo="RANKING" texto="Tu liga semanal llega más adelante." />}
        {err && <p role="alert" className="text-crimson text-sm">Error: {err}</p>}
      </main>
      <NavBar activa={tab} onChange={setTab} />
    </div>
  );
}
