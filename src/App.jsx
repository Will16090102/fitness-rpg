import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebase.js';
import { loginAnonimo, loginGoogle, logout, watchUser } from './services/auth.js';
import { levelFromXp } from './game/levels.js';
import Avatar from './components/Avatar.jsx';
import Onboarding from './screens/Onboarding.jsx';

const btn = 'h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] active:translate-y-[3px] active:shadow-none';
const Barra = ({ label, v, color }) => (
  <div><div className="flex justify-between text-lg"><span>{label}</span><span className="font-pixel text-[10px]">{v}</span></div>
    <div className="h-4 border-2 border-black bg-[#3b2a66]"><div style={{ width: `${Math.min(100, v)}%`, background: color }} className="h-full" /></div></div>
);

export default function App() {
  const [user, setUser] = useState(undefined);
  const [perfil, setPerfil] = useState(undefined);
  const [err, setErr] = useState('');
  useEffect(() => watchUser(setUser), []);
  useEffect(() => {
    if (!user) { setPerfil(undefined); return undefined; }
    return onSnapshot(doc(db, 'usuarios', user.uid), (s) => setPerfil(s.exists() && s.data().nombre ? s.data() : null), (e) => setErr(e.code || e.message));
  }, [user]);
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

  const lv = levelFromXp(perfil?.exp ?? 0);
  return (
    <main className="mx-auto max-w-[430px] min-h-screen p-5 flex flex-col gap-4">
      <div className="flex justify-between items-baseline"><b className="font-pixel text-gold text-sm">NV. {lv.nivel}</b><span className="text-[#c9bee8]">{perfil?.nombre}</span></div>
      <div className="border-4 border-black bg-card shadow-[0_4px_0_#090614] py-4 flex justify-center"><Avatar clase={perfil?.clase} tinte={perfil?.tinte} escala={10} /></div>
      <div className="flex flex-col gap-3">
        <Barra label="EXP" v={Math.round((lv.actual / lv.necesaria) * 100)} color="#f59e0b" />
        <Barra label="Fuerza" v={perfil?.atributos?.fuerza ?? 0} color="#ef4444" />
        <Barra label="Resistencia" v={perfil?.atributos?.resistencia ?? 0} color="#10b981" />
        <Barra label="Velocidad" v={perfil?.atributos?.velocidad ?? 0} color="#3b82f6" />
      </div>
      <p className="text-sm text-[#c9bee8]">La Aldea de Oakhaven y la Rutina llegan en el siguiente paso.</p>
      <button className={btn + ' mt-auto bg-[#3b2a66] text-[#f8f1d8]'} onClick={run(logout)}>SALIR</button>
    </main>
  );
}
