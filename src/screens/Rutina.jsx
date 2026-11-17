import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { EJERCICIOS } from '../data/ejercicios.js';
import { frase, jefeInfo, nuevoJefe } from '../game/jefes.js';
import { danoFinal } from '../game/combat.js';
import { alRegistrarEntreno, hoyKey } from '../game/streak.js';
import { momento } from '../game/oakhaven.js';
import { SERIES, armarSesion, pasoReps, valoresIniciales } from '../game/sesion.js';
import { alternarSilencio, esSilencio, sonido } from '../services/audio.js';
import JefeSprite from '../components/JefeSprite.jsx';

const CATS = ['Pecho y tríceps', 'Espalda y bíceps', 'Pierna', 'Hombro y core', 'Full body', 'Cardio / HIIT'];
const SEM = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const RESCATES = ['mira', 'garrick', 'soren'];
const r2 = (n) => Math.round(n * 100) / 100;
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const btn = 'min-h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] active:translate-y-[3px] active:shadow-none';
const mini = 'w-12 h-12 border-4 border-black font-pixel text-sm';

function Contador({ label, valor, set, paso, min }) {
  return (
    <div className="flex-1">
      <div className="text-[#c9bee8]">{label}</div>
      <div className="flex items-center gap-1">
        <button aria-label={`Bajar ${label}`} className={mini + ' bg-[#3b2a66] text-[#f8f1d8]'} onClick={() => { sonido.click(); set(Math.max(min, r2(valor - paso))); }}>-</button>
        <input aria-label={label} type="number" inputMode="decimal" value={valor} onChange={(e) => set(Math.max(min, Number(e.target.value) || 0))} className="w-full min-w-0 h-12 border-4 border-black bg-[#3b2a66] text-center text-2xl text-[#f8f1d8]" />
        <button aria-label={`Subir ${label}`} className={mini + ' bg-gold text-space'} onClick={() => { sonido.click(); set(r2(valor + paso)); }}>+</button>
      </div>
    </div>
  );
}

export default function Rutina({ uid, perfil }) {
  const hoy = hoyKey();
  const [cat, setCat] = useState(() => (perfil.sesion?.fecha === hoy ? perfil.sesion.cat : (perfil.categorias || {})[SEM[new Date().getDay()]] || 'Pierna'));
  const [foco, setFoco] = useState(null);
  const [cambiando, setCambiando] = useState(null);
  const [peso, setPeso] = useState(0);
  const [reps, setReps] = useState(10);
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const [flot, setFlot] = useState([]);
  const [aviso, setAviso] = useState('');
  const [golpe, setGolpe] = useState(0);
  const [silencio, setSilencio] = useState(esSilencio());
  const ctrl = useAnimationControls();
  const sonoFin = useRef(false);

  const jefe = perfil.jefe;
  const info = jefeInfo(perfil.capitulo || 1);
  const lista = EJERCICIOS.filter((e) => e.cat === cat && (e.equipo === 'peso_corporal' || (perfil.equipo || []).includes(e.equipo)));
  const plan = perfil.sesion?.fecha === hoy && perfil.sesion.cat === cat ? perfil.sesion : null;
  const items = plan?.items || [];
  const pend = items.findIndex((i) => i.hechas < SERIES);
  const actual = items.find((i) => i.id === foco) || items[pend] || items[items.length - 1];
  const ej = actual ? EJERCICIOS.find((e) => e.id === actual.id) : null;
  const pct = jefe ? Math.round((jefe.hp / jefe.hpMax) * 100) : 100;
  const resto = fin ? Math.max(0, Math.ceil((fin - ahora) / 1000)) : 0;
  const guardar = (datos) => setDoc(doc(db, 'usuarios', uid), datos, { merge: true }).catch(() => {});

  useEffect(() => { if (!jefe) guardar({ jefe: nuevoJefe(perfil, perfil.capitulo || 1) }); }, [jefe]); // eslint-disable-line
  useEffect(() => { if (!plan && lista.length) guardar({ sesion: { fecha: hoy, cat, items: armarSesion(lista), completa: false } }); }, [plan, cat, lista.length]); // eslint-disable-line
  // Al cambiar de ejercicio: carga tu última marca o los valores por defecto (30 s, 10-12 reps)
  useEffect(() => { if (ej) { const v = valoresIniciales(ej, perfil); setPeso(v.peso); setReps(v.reps); } }, [ej?.id]); // eslint-disable-line
  useEffect(() => {
    if (!fin) return undefined;
    sonoFin.current = false;
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [fin]);
  useEffect(() => { if (fin && resto === 0 && !sonoFin.current) { sonoFin.current = true; sonido.finDescanso(); } }, [fin, resto]);

  const flotar = (texto, crit) => {
    const id = Math.random();
    setFlot((f) => [...f, { id, texto, crit }]);
    setTimeout(() => setFlot((f) => f.filter((x) => x.id !== id)), 1000);
  };
  const recordTxt = (e) => {
    const m = perfil.marcas?.[e.id];
    if (!m) return 'Sin marca';
    return e.tipo === 'tiempo' ? `Último: ${perfil.ultimos?.[e.id]?.reps ?? '-'} s` : `Récord ≈ ${Math.round(m)} kg (1RM est.)`;
  };

  const registrar = async () => {
    if (!jefe || !ej || !actual || jefe.hp <= 0) return;
    const bw = Number(perfil.pesoCorporal) || 70;
    const pesoEf = (ej.equipo === 'peso_corporal' ? bw * 0.65 : ej.tipo === 'tiempo' ? bw * 0.5 : 0) + peso;
    const repsEq = ej.tipo === 'tiempo' ? reps / 5 : ej.tipo === 'unilateral' ? reps * 2 : reps;
    const e1rm = pesoEf * (1 + Math.min(repsEq, 12) / 30);
    const mejor = perfil.marcas?.[ej.id];
    const critico = mejor != null && e1rm > mejor;
    const dmg = danoFinal({ peso: pesoEf, reps: repsEq, fuerza: perfil.atributos?.fuerza ?? 0, clase: perfil.clase, racha: perfil.racha || 0, critico, debilidad: info.debilidad.includes(ej.cat), hiit: ej.cat === 'Cardio / HIIT' });
    const hp = Math.max(0, jefe.hp - dmg);

    const ent = alRegistrarEntreno(perfil, hoy);
    const n = (perfil.seriesFecha === hoy ? perfil.seriesHoy || 0 : 0) + 1;
    const a = { ...perfil.atributos };
    const sube = (k) => { a[k] = r2((a[k] ?? 0) + 0.4 * (1 - (a[k] ?? 0) / 100)); };
    if (repsEq <= 8 && ej.cat !== 'Cardio / HIIT') sube('fuerza');
    if (repsEq >= 15 || ej.cat === 'Cardio / HIIT') sube('resistencia');
    if (ej.cat === 'Cardio / HIIT') sube('velocidad');
    const rescate = n % 4 === 0 ? RESCATES.find((k) => !(perfil.aldeanos || []).includes(k)) : null;
    const nuevos = items.map((i) => (i.id === actual.id ? { ...i, hechas: Math.min(SERIES, i.hechas + 1) } : i));
    const completa = nuevos.every((i) => i.hechas >= SERIES);
    const extra = completa && !plan.completa ? 30 : 0;
    const exp = Math.round(5 * (momento(new Date().getHours()) === 'alba' ? 1.05 : 1)) + extra + (hp === 0 ? 300 : 0);

    guardar({
      ...ent, seriesHoy: n, seriesFecha: hoy, exp: (perfil.exp || 0) + exp, atributos: a,
      marcas: { [ej.id]: r2(Math.max(mejor || 0, e1rm)) }, ultimos: { [ej.id]: { peso, reps } }, jefe: { ...jefe, hp },
      sesion: { ...plan, items: nuevos, completa },
      ...(rescate ? { aldeanos: [...(perfil.aldeanos || []), rescate] } : {}),
    });
    addDoc(collection(db, 'historial_entrenos'), { uid, fecha: hoy, ejercicio: ej.nombre, categoria: ej.cat, peso: r2(pesoEf), reps: repsEq, dano: dmg, critico, tonelaje: Math.round(pesoEf * repsEq), creadoEn: serverTimestamp() }).catch(() => {});

    if (nuevos.find((i) => i.id === actual.id).hechas >= SERIES) setFoco(null);
    setFin(Date.now() + 120000);
    if (rescate) setAviso(`¡Rescataste a ${rescate[0].toUpperCase() + rescate.slice(1)}! Visítalo en la Aldea.`);
    else if (extra) setAviso('¡Sesión completa! +30 EXP');
    (critico ? sonido.critico : sonido.ataque)();
    await ctrl.start({ filter: 'brightness(3)', transition: { duration: 0.05 } });
    setGolpe((g) => g + 1);
    await pausa(50);
    flotar(critico ? `¡CRÍTICO! -${dmg} HP` : `-${dmg} HP`, critico);
    await ctrl.start({ filter: 'brightness(1)', x: [-6, 6, -3, 0], transition: { duration: 0.25 } });
    if (hp === 0) sonido.victoria();
  };

  const siguiente = () => { const cap = (perfil.capitulo || 1) + 1; guardar({ capitulo: cap, jefe: nuevoJefe(perfil, cap) }); };
  const cambiar = (idViejo, nuevo) => {
    sonido.click();
    guardar({ sesion: { ...plan, items: items.map((i) => (i.id === idViejo ? { ...i, id: nuevo.id } : i)) } });
    if (foco === idViejo) setFoco(nuevo.id);
    setCambiando(null);
  };
  if (!jefe) return <p>Preparando al jefe…</p>;

  return (
    <div className="flex flex-col gap-3">
      <motion.section animate={ctrl} className="relative border-4 border-black bg-card shadow-[0_4px_0_#090614] p-3">
        <div className="flex justify-between items-center">
          <b className="font-pixel text-[9px] text-crimson">CAP. {perfil.capitulo || 1}</b>
          <button onClick={() => setSilencio(alternarSilencio())} className="text-sm text-[#c9bee8] min-h-8 px-2" aria-pressed={silencio}>Sonido: {silencio ? 'no' : 'sí'}</button>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="font-pixel text-[10px] text-gold leading-relaxed mt-1">{jefe.nombre.toUpperCase()}</h2>
            <p className="italic text-[#f8f1d8] mt-1">«{frase(info, pct)}»</p>
          </div>
          <JefeSprite cap={perfil.capitulo || 1} golpe={golpe} derrotado={jefe.hp <= 0} />
        </div>
        <div className="relative h-5 border-2 border-black bg-[#3b2a66] mt-2">
          <motion.div className="absolute inset-y-0 left-0 bg-[#facc15]" animate={{ width: `${pct}%` }} transition={{ delay: 0.4, duration: 0.4 }} />
          <div className="absolute inset-y-0 left-0 bg-crimson" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-sm text-[#c9bee8] mt-1"><span>{jefe.hp} / {jefe.hpMax} HP</span><span>Debilidad: {info.debilidad.join(', ')}</span></div>
        <AnimatePresence>{flot.map((f) => (
          <motion.span key={f.id} initial={{ y: 0, opacity: 1 }} animate={{ y: -50, opacity: 0 }} transition={{ duration: 1 }} className={`absolute right-4 top-10 font-pixel text-xs pointer-events-none ${f.crit ? 'text-gold' : 'text-[#f8f1d8]'}`}>{f.texto}</motion.span>
        ))}</AnimatePresence>
      </motion.section>

      {jefe.hp <= 0 ? (
        <div className="border-4 border-gold bg-card p-4 flex flex-col gap-3">
          <b className="font-pixel text-xs text-gold leading-relaxed">¡JEFE DERROTADO!</b>
          <p>+300 EXP. Oakhaven respira un poco más.</p>
          <button className={btn} onClick={siguiente}>SIGUIENTE CAPÍTULO</button>
        </div>
      ) : (<>
        <label className="text-[#c9bee8]">Categoría de hoy
          <select value={cat} onChange={(e) => { setCat(e.target.value); setFoco(null); }} className="mt-1 w-full h-12 border-4 border-black bg-card px-2 text-[#f8f1d8]">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        </label>

        <ol className="flex flex-col gap-1" aria-label="Rutina del día">
          {items.map((i, k) => {
            const e = EJERCICIOS.find((x) => x.id === i.id);
            const hecho = i.hechas >= SERIES;
            const activo = actual?.id === i.id;
            return (
              <li key={i.id} className={`flex items-stretch border-4 ${activo ? 'border-gold' : 'border-black'} bg-card`}>
                <button onClick={() => setFoco(i.id)} className="flex-1 min-h-12 flex items-center gap-2 px-2 text-left" aria-current={activo ? 'step' : undefined}>
                  <span className={`font-pixel text-[10px] w-4 ${hecho ? 'text-emerald' : activo ? 'text-gold' : 'text-[#c9bee8]'}`}>{hecho ? '✓' : activo ? '▶' : k + 1}</span>
                  <span className={`flex-1 leading-tight ${hecho ? 'text-[#c9bee8] line-through' : ''}`}>{e?.nombre}</span>
                  <b className="font-pixel text-[9px] text-[#c9bee8]">{i.hechas}/{SERIES}</b>
                </button>
                <button aria-label={`Cambiar ${e?.nombre}`} onClick={() => setCambiando(i.id)} className="w-12 border-l-4 border-black bg-[#3b2a66] text-gold">⇄</button>
              </li>
            );
          })}
        </ol>

        {ej && (<>
          <button onClick={() => setCambiando(actual.id)} className="text-left border-4 border-black bg-card p-3">
            <b className="text-xl leading-tight">{ej.nombre} · Serie {Math.min(actual.hechas + 1, SERIES)}/{SERIES}</b>
            <div className="text-sm text-[#c9bee8]">{ej.equipo.replace('_', ' ')} · {recordTxt(ej)}{info.debilidad.includes(ej.cat) ? ' · ⚡ DEBILIDAD DEL JEFE' : ''}</div>
          </button>
          <div className="flex gap-3">
            <Contador label={ej.equipo === 'peso_corporal' ? 'Lastre (kg)' : 'Peso (kg)'} valor={peso} set={setPeso} paso={2.5} min={0} />
            <Contador label={ej.tipo === 'tiempo' ? 'Segundos' : 'Reps'} valor={reps} set={setReps} paso={pasoReps(ej)} min={1} />
          </div>
          {ej.tipo === 'unilateral' && <p className="text-sm text-[#c9bee8]">Unilateral: las reps cuentan x2 para el daño.</p>}
        </>)}
        {fin && (
          <div className="flex items-center justify-between border-4 border-black bg-card p-2">
            <span className="text-[#c9bee8]">Descanso</span>
            <b className="font-pixel text-sm text-gold">{Math.floor(resto / 60)}:{String(resto % 60).padStart(2, '0')}</b>
            <div className="flex gap-1">
              <button className="h-12 px-2 border-4 border-black bg-[#3b2a66] text-[#f8f1d8]" onClick={() => setFin((f) => f - 15000)}>-15s</button>
              <button className="h-12 px-2 border-4 border-black bg-[#3b2a66] text-[#f8f1d8]" onClick={() => setFin((f) => f + 30000)}>+30s</button>
            </div>
          </div>
        )}
        {aviso && <button onClick={() => setAviso('')} className="border-4 border-emerald bg-card p-2 text-left">{aviso}</button>}
        <button className={btn + ' h-14'} onClick={registrar}>REGISTRAR SERIE</button>
      </>)}

      {cambiando && (
        <div className="fixed inset-0 z-20 bg-black/70 flex items-end" onClick={() => setCambiando(null)}>
          <div role="dialog" aria-label="Cambiar ejercicio" className="w-full max-w-[430px] mx-auto max-h-[70vh] overflow-y-auto bg-card border-t-4 border-gold p-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><b className="font-pixel text-[10px] text-gold">{cat.toUpperCase()} · {lista.length} OPCIONES</b><button className="h-12 px-3 text-[#c9bee8]" onClick={() => setCambiando(null)}>Cerrar</button></div>
            {lista.map((e) => {
              const enPlan = items.some((i) => i.id === e.id);
              const esActual = e.id === cambiando;
              return (
                <button key={e.id} disabled={enPlan && !esActual} onClick={() => (esActual ? setCambiando(null) : cambiar(cambiando, e))} className={`min-h-14 text-left border-4 px-3 py-1 ${esActual ? 'border-gold' : 'border-black'} bg-[#2a1b4a] disabled:opacity-40`}>
                  <div className="text-lg leading-tight">{e.nombre}</div>
                  <div className="text-sm text-[#c9bee8]">{e.equipo.replace('_', ' ')} · {recordTxt(e)}{enPlan && !esActual ? ' · ya en tu rutina' : ''}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
