import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { INVENTARIO_INICIAL, ITEMS, SLOTS_EQ, TIERS, aspecto } from '../data/armeria.js';
import { sonido } from '../services/audio.js';
import Avatar from '../components/Avatar.jsx';

export default function Armeria({ uid, perfil, onVolver }) {
  const [slot, setSlot] = useState('pechera');
  const inv = perfil.inventario || INVENTARIO_INICIAL;
  const eq = perfil.equipado || {};
  const lista = ITEMS.filter((i) => i.slot === slot);
  const tengo = ITEMS.filter((i) => inv.includes(i.id)).length;
  const alternar = (it) => {
    sonido.click();
    setDoc(doc(db, 'usuarios', uid), { equipado: { ...eq, [it.slot]: eq[it.slot] === it.id ? null : it.id } }, { merge: true }).catch(() => {});
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-gold text-xs">ARMERÍA</h1>
        <span className="text-[#c9bee8]">{tengo} / {ITEMS.length} piezas</span>
        <button onClick={onVolver} className="min-h-12 px-3 border-4 border-black bg-[#3b2a66] text-[#f8f1d8]">Volver</button>
      </div>
      <div className="border-4 border-black bg-card py-3 flex justify-center"><Avatar clase={perfil.clase} tinte={perfil.tinte} escala={7} {...aspecto(perfil)} /></div>
      <div className="flex gap-1" role="tablist" aria-label="Ranuras de equipo">
        {SLOTS_EQ.map(([k, n]) => <button key={k} role="tab" aria-selected={slot === k} onClick={() => setSlot(k)} className={`flex-1 min-h-12 border-4 font-pixel text-[8px] ${slot === k ? 'border-gold bg-[#2a1b4a] text-gold' : 'border-black bg-card text-[#c9bee8]'}`}>{n}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {lista.map((it) => {
          const mio = inv.includes(it.id);
          const puesto = eq[it.slot] === it.id;
          if (!mio) return (
            <div key={it.id} className="border-4 border-black bg-card p-3 text-center opacity-60" aria-label="Pieza sin descubrir">
              <div className="mx-auto w-10 h-10 bg-[#3b2a66] flex items-center justify-center font-pixel text-gold">?</div>
              <div className="text-lg">{it.tier === 5 ? '???' : 'Sin descubrir'}</div>
              <div className="text-sm text-[#c9bee8]">{TIERS[it.tier]} · cae en cofres</div>
            </div>
          );
          return (
            <button key={it.id} onClick={() => alternar(it)} aria-pressed={puesto} className={`border-4 ${puesto ? 'border-gold' : 'border-black'} bg-card p-3 text-center min-h-24`}>
              <div className="mx-auto w-10 h-10 border-2 border-black" style={{ background: it.color }} />
              <div className="text-lg leading-tight">{it.nombre}</div>
              <div className="text-sm" style={{ color: it.color }}>{TIERS[it.tier]}</div>
              <div className="text-sm text-[#c9bee8]">{puesto ? 'Equipado · toca para quitar' : 'Toca para equipar'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
