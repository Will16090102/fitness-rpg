import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { CLASES } from '../game/classes.js';
import Avatar from '../components/Avatar.jsx';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const CATS = ['Pecho y tríceps', 'Espalda y bíceps', 'Pierna', 'Hombro y core', 'Full body', 'Cardio / HIIT'];
const EXP = ['Nunca he entrenado', 'Menos de 6 meses', '6 meses a 2 años', 'Más de 2 años'];
const EQUIPO = [['gimnasio', 'Gimnasio completo'], ['multifuncional', 'Multifuncional / Poleas'], ['mancuernas', 'Mancuernas'], ['peso_corporal', 'Solo peso corporal']];
const TINTES = ['#4A6CF0', '#2E9E78', '#B3392B', '#7A4DFF', '#E8E0C8', '#2B3050'];
const panel = 'border-4 border-black bg-card shadow-[0_4px_0_#090614] p-3';
const btn = 'h-12 px-4 border-4 border-black bg-gold text-space font-pixel text-[10px] shadow-[0_4px_0_#090614] active:translate-y-[3px] active:shadow-none disabled:opacity-40';
const opt = (on) => `border-4 p-3 text-left ${on ? 'border-gold bg-[#2a1b4a]' : 'border-black bg-card'}`;

export default function Onboarding({ uid }) {
  const [paso, setPaso] = useState(1);
  const [d, setD] = useState({ nombre: '', clase: 'guerrero', tinte: TINTES[0], experiencia: 2, peso: '', equipo: [], dias: [], cats: {}, hora: '18:00' });
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const toggle = (k, v) => set(k, d[k].includes(v) ? d[k].filter((i) => i !== v) : [...d[k], v]);
  const diasSel = DIAS.filter((x) => d.dias.includes(x));
  const cat = (dia) => d.cats[dia] || CATS[diasSel.indexOf(dia) % CATS.length];
  const valido = { 1: d.nombre.trim().length >= 2, 2: true, 3: d.equipo.length > 0, 4: d.dias.length > 0, 5: true }[paso];

  const terminar = () => {
    setDoc(doc(db, 'usuarios', uid), {
      nombre: d.nombre.trim(), clase: d.clase, tinte: d.tinte, experiencia: EXP[d.experiencia], pesoCorporal: Number(d.peso) || null,
      equipo: d.equipo, dias: diasSel, categorias: Object.fromEntries(diasSel.map((x) => [x, cat(x)])), horaAviso: d.hora,
      nivel: 1, exp: 0, atributos: { fuerza: 5, resistencia: 5, velocidad: 5 }, racha: 0, elixires: 0, fragmentos: 0, capitulo: 1,
      creadoEn: serverTimestamp(),
    }, { merge: true }).catch(() => {});
  };

  return (
    <main className="mx-auto max-w-[430px] min-h-screen p-5 flex flex-col gap-4">
      <div className="flex gap-1" role="progressbar" aria-valuenow={paso} aria-valuemin={1} aria-valuemax={5}>
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`h-3 flex-1 border-2 border-black ${i <= paso ? 'bg-gold' : 'bg-[#3b2a66]'}`} />)}
      </div>

      {paso === 1 && (<>
        <h1 className="font-pixel text-gold text-xs leading-relaxed">¿QUIÉN ERES, VIAJERO?</h1>
        <label className="text-sm text-[#c9bee8]">Nombre del héroe
          <input className="mt-1 w-full h-12 border-4 border-black bg-[#3b2a66] px-3 text-lg text-[#f8f1d8]" maxLength={16} value={d.nombre} onChange={(e) => set('nombre', e.target.value)} />
        </label>
        <div className="flex flex-col gap-2">
          {Object.entries(CLASES).map(([k, c]) => (
            <button key={k} onClick={() => set('clase', k)} className={opt(d.clase === k) + ' flex items-center gap-3'}>
              <Avatar clase={k} escala={4} etiqueta={c.nombre} />
              <span><b className="font-pixel text-[10px] text-gold">{c.nombre.toUpperCase()}</b><br /><span className="text-sm text-[#c9bee8]">{c.bono}</span></span>
            </button>
          ))}
        </div>
        <p className="text-xs text-[#c9bee8]">Podrás cambiar de postura una vez por semana en la Armería. Inicias en NV. 1.</p>
      </>)}

      {paso === 2 && (<>
        <h1 className="font-pixel text-gold text-xs leading-relaxed">TU EQUIPO INICIAL</h1>
        <div className={panel + ' flex justify-center py-4'}><Avatar clase={d.clase} tinte={d.tinte} escala={9} /></div>
        <p className="text-sm text-[#c9bee8]">Pechera de Tier 1. Elige su color; el equipo mejor se gana en batalla.</p>
        <div className="flex gap-2">{TINTES.map((c) => <button key={c} aria-label={`Color ${c}`} onClick={() => set('tinte', c)} style={{ background: c }} className={`h-10 flex-1 border-4 ${d.tinte === c ? 'border-gold' : 'border-black'}`} />)}</div>
      </>)}

      {paso === 3 && (<>
        <h1 className="font-pixel text-gold text-xs leading-relaxed">TU HISTORIA</h1>
        <div className="flex flex-col gap-2">{EXP.map((t, i) => <button key={t} onClick={() => set('experiencia', i)} className={opt(d.experiencia === i)}>{t}</button>)}</div>
        <label className="text-sm text-[#c9bee8]">Peso corporal aproximado (kg, para calistenia)
          <input type="number" inputMode="decimal" className="mt-1 w-full h-12 border-4 border-black bg-[#3b2a66] px-3 text-lg text-[#f8f1d8]" value={d.peso} onChange={(e) => set('peso', e.target.value)} />
        </label>
        <p className="text-sm text-[#c9bee8]">Equipo disponible (puedes elegir varios)</p>
        <div className="grid grid-cols-2 gap-2">{EQUIPO.map(([k, t]) => <button key={k} onClick={() => toggle('equipo', k)} className={opt(d.equipo.includes(k)) + ' text-sm'}>{t}</button>)}</div>
      </>)}

      {paso === 4 && (<>
        <h1 className="font-pixel text-gold text-xs leading-relaxed">TU SEMANA</h1>
        <div className="flex gap-1">{DIAS.map((x) => <button key={x} onClick={() => toggle('dias', x)} className={`h-11 flex-1 border-4 font-pixel text-[10px] ${d.dias.includes(x) ? 'border-black bg-gold text-space' : 'border-black bg-[#3b2a66] text-[#c9bee8]'}`}>{x}</button>)}</div>
        <p className="text-xs text-[#c9bee8]">Dorado: entrenas. Gris: descanso (no rompe tu racha).</p>
        {diasSel.map((x) => (
          <label key={x} className="flex items-center justify-between gap-3 text-sm">
            <span className="font-pixel text-[10px] text-gold">{x}</span>
            <select value={cat(x)} onChange={(e) => set('cats', { ...d.cats, [x]: e.target.value })} className="flex-1 h-11 border-4 border-black bg-card px-2 text-[#f8f1d8]">
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        ))}
        <label className="text-sm text-[#c9bee8]">Hora de aviso
          <input type="time" value={d.hora} onChange={(e) => set('hora', e.target.value)} className="mt-1 w-full h-12 border-4 border-black bg-[#3b2a66] px-3 text-lg text-[#f8f1d8]" />
        </label>
      </>)}

      {paso === 5 && (<>
        <h1 className="font-pixel text-gold text-xs leading-relaxed">CAPÍTULO 1: EL VALLE DE LOS DORMIDOS</h1>
        <div className={panel + ' flex flex-col items-center gap-2 py-4'}>
          <Avatar clase={d.clase} tinte={d.tinte} escala={8} />
          <b className="font-pixel text-[10px] text-gold">{d.nombre.toUpperCase()} · NV. 1</b>
          <span className="text-sm text-[#c9bee8]">{CLASES[d.clase].nombre} · {diasSel.length} días por semana</span>
        </div>
        <p className="leading-snug">Oakhaven duerme bajo La Quietud. Vael, el herrero manco, te tiende un martillo viejo: «Cada serie que levantes devuelve un poco de vida a este valle, Portador».</p>
      </>)}

      <div className="mt-auto flex gap-3">
        {paso > 1 && <button className={btn + ' bg-[#3b2a66] text-[#f8f1d8]'} onClick={() => setPaso(paso - 1)}>ATRÁS</button>}
        <button className={btn + ' flex-1'} disabled={!valido} onClick={() => (paso < 5 ? setPaso(paso + 1) : terminar())}>{paso < 5 ? 'CONTINUAR' : 'COMENZAR AVENTURA'}</button>
      </div>
    </main>
  );
}
