import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, increment, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './services/firebase.js';
import { loginAnonimo, loginGoogle, logout, watchUser } from './services/auth.js';

const card = 'border-4 border-black bg-card shadow-[0_4px_0_#090614] p-4';
const btn = 'h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] active:translate-y-[3px] active:shadow-none';

export default function App() {
  const [user, setUser] = useState(undefined);
  const [prueba, setPrueba] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => watchUser(setUser), []);
  useEffect(() => {
    if (!user) { setPrueba(null); return undefined; }
    return onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      setPrueba({ n: snap.data()?.pruebas ?? 0, cache: snap.metadata.fromCache, pendiente: snap.metadata.hasPendingWrites });
    }, (e) => setErr(e.message));
  }, [user]);

  const run = (fn) => async () => { setErr(''); try { await fn(); } catch (e) { setErr(e.code || e.message); } };
  const guardar = run(() => setDoc(doc(db, 'usuarios', user.uid), { pruebas: increment(1), actualizado: serverTimestamp() }, { merge: true }));

  return (
    <main className="mx-auto max-w-[430px] min-h-screen p-5 flex flex-col gap-4">
      <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-pixel text-gold text-lg leading-relaxed">
        GYM RPG
      </motion.h1>
      <p className="text-sm text-[#c9bee8]">Fase 0: comprobación de despliegue, sesión y base de datos.</p>

      <section className={card}>
        <h2 className="font-pixel text-[10px] text-emerald mb-3">SESIÓN</h2>
        {user === undefined && <p>Cargando…</p>}
        {user === null && (
          <div className="flex flex-col gap-3">
            <button className={btn} onClick={run(loginAnonimo)}>ENTRAR ANÓNIMO</button>
            <button className={btn} onClick={run(loginGoogle)}>ENTRAR CON GOOGLE</button>
          </div>
        )}
        {user && (
          <div className="flex flex-col gap-3">
            <p>{user.isAnonymous ? 'Sesión anónima' : `Google: ${user.email}`}</p>
            {user.isAnonymous && <button className={btn} onClick={run(loginGoogle)}>VINCULAR GOOGLE</button>}
            <button className={btn + ' bg-[#3b2a66] text-[#f8f1d8]'} onClick={run(logout)}>SALIR</button>
          </div>
        )}
      </section>

      {user && (
        <section className={card}>
          <h2 className="font-pixel text-[10px] text-cyan mb-3">PRUEBA DE FIRESTORE</h2>
          <p>Guardados: <b className="font-pixel text-gold">{prueba ? prueba.n : '…'}</b></p>
          <p className="text-sm text-[#c9bee8]">
            {prueba?.pendiente ? 'Pendiente de sincronizar (sin conexión)' : prueba?.cache ? 'Leído desde la caché local' : 'Sincronizado con el servidor'}
          </p>
          <button className={btn + ' mt-3 w-full'} onClick={guardar}>GUARDAR PRUEBA</button>
        </section>
      )}
      {err && <p role="alert" className="text-crimson text-sm break-words">Error: {err}</p>}
    </main>
  );
}
