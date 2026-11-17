import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { ETIQUETA, MOVIMIENTOS, disponibles, resolver, variantes } from '../data/ejercicios.js';
import { ETIQUETA_PATRON, SLOTS, movsDe } from '../data/patrones.js';
import { frase, jefeInfo, nuevoJefe } from '../game/jefes.js';
import { danoFinal } from '../game/combat.js';
import { alRegistrarEntreno, hoyKey } from '../game/streak.js';
import { momento } from '../game/oakhaven.js';
import { SERIES, VERSION, armarSesion, pasoReps, valoresIniciales } from '../game/sesion.js';
import { alternarSilencio, esSilencio, sonido } from '../services/audio.js';
import JefeSprite from '../components/JefeSprite.jsx';
import IconoEjercicio from '../components/IconoEjercicio.jsx';
import GolpeOverlay from '../components/GolpeOverlay.jsx';
import Botin from '../components/Botin.jsx';

const CATS = ['Pecho y tríceps', 'Espalda y bíceps', 'Pierna', 'Hombro y core', 'Full body', 'Cardio / HIIT'];
const SEM = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const RESCATES = ['mira', 'garrick', 'soren'];
const ESTILO = { 'Pecho y tríceps': 'golpe', 'Hombro y core': 'golpe', 'Espalda y bíceps': 'tajo', Pierna: 'salto', 'Full body': 'giro', 'Cardio / HIIT': 'rafaga' };
const r2 = (n) => Math.round(n * 100) / 100;
const btn = 'min-h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] active:translate-y-[3px] active:shadow-none';
const mini = 'w-12 h-12 border-4 border-black font-pixel text-sm';

function Contador({ label, valor, set, paso, min }) {
  return (
    <div className="flex-1">
      <div className="text-[#c9bee8]">{label}</div>
      <div className="flex items-center gap-2">
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
  const [filtro, setFiltro] = useState('todos');
  const [peso, setPeso] = useState(0);
  const [reps, setReps] = useState(10);
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const [aviso, setAviso] = useState('');
  const [golpe, setGolpe] = useState(0);
  const [anim, setAnim] = useState(null);
  const [silencio, setSilencio] = useState(esSilencio());
  const sonoFin = useRef(false);

  const jefe = perfil.jefe;
  const info = jefeInfo(perfil.capitulo || 1);
  const plan = perfil.sesion?.fecha === hoy && perfil.sesion.cat === cat && perfil.sesion.v === VERSION ? perfil.sesion : null;
  const items = plan?.items || [];
  const pend = items.findIndex((i) => i.hechas < SERIES);
  const actual = items.find((i) => i.id === foco) || items[pend] || items[items.length - 1];
  const ej = actual ? resolver(actual, perfil.equipo) : null;
  const vars = actual ? variantes(MOVIMIENTOS.find((m) => m.id === actual.id), perfil.equipo) : [];
  const pct = jefe ? Math.round((jefe.hp / jefe.hpMax) * 100) : 100;
  const resto = fin ? Math.max(0, Math.ceil((fin - ahora) / 1000)) : 0;
  const guardar = (datos) => setDoc(doc(db, 'usuarios', uid), datos, { merge: true }).catch(() => {});

  useEffect(() => { if (!jefe) guardar({ jefe: nuevoJefe(perfil, perfil.capitulo || 1) }); }, [jefe]); // eslint-disable-line
  useEffect(() => { if (!plan) guardar({ sesion: { v: VERSION, fecha: hoy, cat, items: armarSesion(cat, perfil.equipo), completa: false } }); }, [plan, cat]); // eslint-disable-line
  useEffect(() => { if (ej) { const v = valoresIniciales(ej, perfil); setPeso(v.peso); setReps(v.reps); } }, [ej?.id]); // eslint-disable-line
  useEffect(() => {
    if (!fin) return undefined;
    sonoFin.current = false;
    const t = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(t);
  }, [fin]);
  useEffect(() => { if (fin && resto === 0 && !sonoFin.current) { sonoFin.current = true; sonido.finDescanso(); } }, [fin, resto]);

  const recordTxt = (e) => {
    const m = perfil.marcas?.[e.id];
    if (!m) return 'Sin marca';
    return e.tipo === 'tiempo' ? `Último: ${perfil.ultimos?.[e.id]?.reps ?? '-'} s` : `Récord ≈ ${Math.round(m)} kg`;
  };

  const registrar = () => {
    if (!jefe || !ej || !actual || jefe.hp <= 0 || anim) return;
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
    const finEj = nuevos.find((i) => i.id === actual.id).hechas >= SERIES;

    guardar({
      ...ent, seriesHoy: n, seriesFecha: hoy, exp: (perfil.exp || 0) + exp, atributos: a,
      marcas: { [ej.id]: r2(Math.max(mejor || 0, e1rm)) }, ultimos: { [ej.id]: { peso, reps } }, jefe: { ...jefe, hp },
      sesion: { ...plan, items: nuevos, completa, stats: { dmg: (plan.stats?.dmg || 0) + dmg, ton: (plan.stats?.ton || 0) + Math.round(pesoEf * repsEq), series: (plan.stats?.series || 0) + 1, prs: (plan.stats?.prs || 0) + (critico ? 1 : 0), rescatados: [...(plan.stats?.rescatados || []), ...(rescate ? [rescate] : [])] } },
      ...(rescate ? { aldeanos: [...(perfil.aldeanos || []), rescate] } : {}),
    });
    addDoc(collection(db, 'historial_entrenos'), { uid, fecha: hoy, ejercicio: ej.nombre, categoria: ej.cat, peso: r2(pesoEf), reps: repsEq, dano: dmg, critico, tonelaje: Math.round(pesoEf * repsEq), creadoEn: serverTimestamp() }).catch(() => {});

    if (finEj) setFoco(null);
    setFin(Date.now() + 120000);
    if (rescate) setAviso(`¡Rescataste a ${rescate[0].toUpperCase() + rescate.slice(1)}! Visítalo en la Aldea.`);
    else if (extra) setAviso('¡Sesión completa! +30 EXP');
    // Animación 2D de golpe: oscurece los controles ~1,2 s (1,7 s al completar)
    setAnim({ estilo: ej.tipo === 'tiempo' ? 'rafaga' : ESTILO[ej.cat] || 'golpe', dmg, crit: critico, antes: pct, despues: Math.round((hp / jefe.hpMax) * 100), finEj, victoria: hp === 0 });
    setTimeout(() => { setGolpe((g) => g + 1); (critico ? sonido.critico : sonido.ataque)(); }, 350);
    setTimeout(() => { setAnim(null); if (hp === 0) sonido.victoria(); }, finEj || hp === 0 ? 1700 : 1200);
  };

  const siguiente = () => { const cap = (perfil.capitulo || 1) + 1; guardar({ capitulo: cap, jefe: nuevoJefe(perfil, cap) }); };
  const cambiarVariante = (eq) => { sonido.click(); guardar({ sesion: { ...plan, items: items.map((i) => (i.id === actual.id ? { ...i, eq } : i)) } }); };
  const cambiar = (idViejo, v) => {
    sonido.click();
    guardar({ sesion: { ...plan, items: items.map((i) => (i.id === idViejo ? { ...i, id: v.mov, eq: v.equipo } : i)) } });
    if (foco === idViejo) setFoco(v.mov);
    setCambiando(null);
  };
  if (!jefe) return <p>Preparando al jefe…</p>;

  const itemCamb = items.find((i) => i.id === cambiando);
  const patronCamb = itemCamb ? SLOTS[cat][itemCamb.slot] : null;
  const grupos = itemCamb
    ? movsDe(patronCamb).filter((m) => m.id === itemCamb.id || !items.some((i) => i.id === m.id))
      .map((m) => ({ m, vs: variantes(m, perfil.equipo).filter((v) => filtro === 'todos' || v.equipo === filtro) })).filter((g) => g.vs.length)
    : [];

  return (
    <div className="flex flex-col gap-2">
      <section className="border-4 border-black bg-card shadow-[0_4px_0_#090614] p-2">
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <b className="font-pixel text-[8px] text-crimson">CAP. {perfil.capitulo || 1}</b>
              <button onClick={() => setSilencio(alternarSilencio())} className="text-sm text-[#c9bee8] min-h-8 px-1" aria-pressed={silencio}>Sonido: {silencio ? 'no' : 'sí'}</button>
            </div>
            <h2 className="font-pixel text-[9px] text-gold leading-relaxed">{jefe.nombre.toUpperCase()}</h2>
            <p className="italic text-sm leading-tight">«{frase(info, pct)}»</p>
          </div>
          <JefeSprite cap={perfil.capitulo || 1} golpe={golpe} derrotado={jefe.hp <= 0} escala={4} />
        </div>
        <div className="relative h-4 border-2 border-black bg-[#3b2a66] mt-1"><div className="absolute inset-y-0 left-0 bg-crimson" style={{ width: `${pct}%` }} /></div>
        <div className="flex justify-between text-sm text-[#c9bee8]"><span>{jefe.hp} / {jefe.hpMax} HP</span><span>⚡ {info.debilidad.join(', ')}</span></div>
      </section>

      {jefe.hp <= 0 ? (
        <div className="border-4 border-gold bg-card p-4 flex flex-col gap-3">
          <b className="font-pixel text-xs text-gold leading-relaxed">¡JEFE DERROTADO!</b>
          <p>+300 EXP. Oakhaven respira un poco más.</p>
          <button className={btn} onClick={siguiente}>SIGUIENTE CAPÍTULO</button>
        </div>
      ) : (<>
        <select aria-label="Categoría de hoy" value={cat} onChange={(e) => { setCat(e.target.value); setFoco(null); }} className="h-11 border-4 border-black bg-card px-2 text-[#f8f1d8]">{CATS.map((c) => <option key={c}>{c}</option>)}</select>

        <div role="tablist" aria-label="Ejercicios del día" className="flex gap-1">
          {items.map((i, k) => {
            const hecho = i.hechas >= SERIES;
            const activo = actual?.id === i.id;
            return <button key={i.id} role="tab" aria-selected={activo} onClick={() => setFoco(i.id)} className={`flex-1 h-12 border-4 font-pixel text-[10px] ${activo ? 'border-gold bg-[#2a1b4a] text-gold' : 'border-black bg-card text-[#c9bee8]'} ${hecho ? 'text-emerald' : ''}`}>{k + 1}{hecho ? '✓' : ''}</button>;
          })}
        </div>

        {ej && actual && (
          <section className="border-4 border-black bg-card p-2 flex flex-col gap-2" aria-label="Ejercicio actual">
            <div className="flex items-center gap-2">
              <IconoEjercicio equipo={ej.equipo} tiempo={ej.tipo === 'tiempo'} />
              <button onClick={() => { setFiltro('todos'); setCambiando(actual.id); }} className="flex-1 min-w-0 text-left min-h-12">
                <b className="text-xl leading-tight block">{ej.nombre} <span className="text-gold">⇄</span></b>
                <span className="text-sm text-[#c9bee8]">{ETIQUETA_PATRON[SLOTS[cat][actual.slot]]} · {recordTxt(ej)}{info.debilidad.includes(ej.cat) ? ' · ⚡' : ''}</span>
              </button>
            </div>
            {vars.length > 1 && (
              <div className="flex gap-1" role="group" aria-label="Variante según tu equipo">
                {vars.map((v) => <button key={v.equipo} onClick={() => cambiarVariante(v.equipo)} aria-pressed={v.equipo === ej.equipo} className={`flex-1 min-h-11 border-4 border-black font-pixel text-[8px] ${v.equipo === ej.equipo ? 'bg-gold text-space' : 'bg-[#3b2a66] text-[#f8f1d8]'}`}>{ETIQUETA[v.equipo]}</button>)}
              </div>
            )}
            <div className="flex items-center justify-center gap-2" role="img" aria-label={`Serie ${Math.min(actual.hechas + 1, SERIES)} de ${SERIES}`}>
              {Array.from({ length: SERIES }, (_, k) => <span key={k} className={`w-5 h-5 border-2 border-black ${k < actual.hechas ? 'bg-emerald' : k === actual.hechas ? 'bg-gold' : 'bg-[#3b2a66]'}`} />)}
              {fin && <b className="ml-3 font-pixel text-[10px] text-gold">{Math.floor(resto / 60)}:{String(resto % 60).padStart(2, '0')}</b>}
            </div>
            {fin && (
              <div className="flex gap-2 justify-center">
                <button className="h-11 px-3 border-4 border-black bg-[#3b2a66] text-[#f8f1d8]" onClick={() => setFin((f) => f - 15000)}>-15s</button>
                <button className="h-11 px-3 border-4 border-black bg-[#3b2a66] text-[#f8f1d8]" onClick={() => setFin((f) => f + 30000)}>+30s</button>
              </div>
            )}
          </section>
        )}

        {ej && (
          <div className="flex gap-4">
            <Contador label={ej.equipo === 'peso_corporal' ? 'Lastre (kg)' : 'Peso (kg)'} valor={peso} set={setPeso} paso={2.5} min={0} />
            <Contador label={ej.tipo === 'tiempo' ? 'Segundos' : ej.tipo === 'unilateral' ? 'Reps (x2)' : 'Reps'} valor={reps} set={setReps} paso={pasoReps(ej)} min={1} />
          </div>
        )}
        {aviso && <button onClick={() => setAviso('')} className="border-4 border-emerald bg-card p-2 text-left">{aviso}</button>}
        <button className={btn + ' h-14'} onClick={registrar}>REGISTRAR SERIE</button>
      </>)}

      {cambiando && itemCamb && (
        <div className="fixed inset-0 z-20 bg-black/70 flex items-end" onClick={() => setCambiando(null)}>
          <div role="dialog" aria-label="Cambiar ejercicio" className="w-full max-w-[430px] mx-auto max-h-[75vh] overflow-y-auto bg-card border-t-4 border-gold p-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center"><b className="font-pixel text-[9px] text-gold">PATRÓN: {ETIQUETA_PATRON[patronCamb].toUpperCase()}</b><button className="h-12 px-3 text-[#c9bee8]" onClick={() => setCambiando(null)}>Cerrar</button></div>
            <div className="flex gap-1" role="group" aria-label="Filtrar por herramienta">
              {['todos', ...disponibles(perfil.equipo)].map((e) => <button key={e} aria-pressed={filtro === e} onClick={() => setFiltro(e)} className={`flex-1 min-h-11 border-4 border-black font-pixel text-[7px] ${filtro === e ? 'bg-gold text-space' : 'bg-[#3b2a66] text-[#f8f1d8]'}`}>{e === 'todos' ? 'TODOS' : ETIQUETA[e]}</button>)}
            </div>
            {grupos.length === 0 && <p className="text-[#c9bee8]">No hay alternativas con esa herramienta para este patrón.</p>}
            {grupos.map(({ m, vs }) => (
              <div key={m.id} className="flex flex-col gap-1">
                <div className="text-[#c9bee8] text-sm">{m.nombre}</div>
                {vs.map((v) => {
                  const esActual = v.mov === itemCamb.id && v.equipo === resolver(itemCamb, perfil.equipo)?.equipo;
                  return (
                    <button key={v.id} onClick={() => (esActual ? setCambiando(null) : cambiar(cambiando, v))} className={`min-h-14 text-left border-4 px-3 py-1 ${esActual ? 'border-gold' : 'border-black'} bg-[#2a1b4a]`}>
                      <div className="text-lg leading-tight">{v.nombre}</div>
                      <div className="text-sm text-[#c9bee8]">{ETIQUETA[v.equipo]} · {recordTxt(v)}{esActual ? ' · actual' : ''}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      {plan?.completa && !plan.botinVisto && !anim && <Botin uid={uid} perfil={perfil} onCerrar={() => guardar({ sesion: { ...perfil.sesion, botinVisto: true } })} />}
      {anim && <GolpeOverlay anim={anim} perfil={perfil} cap={perfil.capitulo || 1} golpe={golpe} />}
    </div>
  );
}
