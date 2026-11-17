import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { aspecto } from '../data/armeria.js';
import { momento } from '../game/oakhaven.js';

const CIELO = { alba: 'linear-gradient(#ffcf7a,#b07ac0)', dia: 'linear-gradient(#6aa7e0,#bfe3f5)', noche: 'linear-gradient(#0b0818,#2a1b4a)' };
const PNJ = {
  vael: { nombre: 'Vael', color: '#8a5a2b', pelo: '#9a9a9a', x: '8%', lineas: ['El hierro no miente, Portador. Lo que levantas hoy te sostiene mañana.', 'Mi brazo ya no responde, pero tu esfuerzo sí enciende esta fragua.'] },
  lyra: { nombre: 'Lyra', color: '#6a3fb5', pelo: '#e8e0c8', x: '78%', lineas: ['No necesito ojos para ver tu aura, viajero.', 'Anoto cada hazaña tuya en las Crónicas. Que no se pierda ninguna.'] },
  mira: { nombre: 'Mira', color: '#2e9e78', pelo: '#5a3a1a', x: '24%', lineas: ['Gracias por rescatarme. Mis Elixires protegerán tu racha.'] },
  garrick: { nombre: 'Garrick', color: '#7a5230', pelo: '#2a1a0a', x: '64%', lineas: ['Conozco cada risco de estas tierras. Te guiaré.'] },
  soren: { nombre: 'Soren', color: '#b3392b', pelo: '#d9a441', x: '90%', lineas: ['Compondré una canción con tus victorias.'] },
};

function Aldeano({ color, pelo, s = 5 }) {
  const r = (x, y, w, h, f) => <rect x={x * s} y={y * s} width={w * s} height={h * s} fill={f} />;
  return (
    <svg width={8 * s} height={13 * s} viewBox={`0 0 ${8 * s} ${13 * s}`} shapeRendering="crispEdges" aria-hidden="true">
      {r(2, 0, 4, 1, pelo)}{r(2, 1, 4, 3, '#F0C08F')}{r(2, 2, 1, 1, '#1B0F2A')}{r(5, 2, 1, 1, '#1B0F2A')}{r(1, 4, 6, 5, color)}
      {r(0, 5, 1, 3, '#F0C08F')}{r(7, 5, 1, 3, '#F0C08F')}{r(2, 9, 2, 3, '#2D3566')}{r(4, 9, 2, 3, '#2D3566')}{r(2, 12, 2, 1, '#120A20')}{r(4, 12, 2, 1, '#120A20')}
    </svg>
  );
}

function Dialogo({ pnj, onClose }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const texto = pnj.lineas[i];
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => { if (v >= texto.length) { clearInterval(t); return v; } return v + 1; }), 25);
    return () => clearInterval(t);
  }, [texto]);
  const tocar = () => { if (n < texto.length) setN(texto.length); else if (i < pnj.lineas.length - 1) setI(i + 1); else onClose(); };
  return (
    <button onClick={tocar} className="w-full text-left border-4 border-black bg-card shadow-[0_4px_0_#090614] p-3">
      <b className="font-pixel text-[10px] text-gold">{pnj.nombre.toUpperCase()}</b>
      <p className="text-lg leading-tight mt-1">{texto.slice(0, n)}<span className="opacity-60">{n < texto.length ? '_' : ' ▶'}</span></p>
    </button>
  );
}

export default function Aldea({ perfil, velo }) {
  const [hablando, setHablando] = useState(null);
  const mom = momento(new Date().getHours());
  const presentes = ['vael', 'lyra', ...(perfil.aldeanos || [])].filter((k) => PNJ[k]);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-64 overflow-hidden border-4 border-black" style={{ background: CIELO[mom] }}>
        {mom === 'noche' && [8, 22, 35, 52, 68, 83, 94].map((x, i) => <span key={x} className="absolute bg-[#f8f1d8]" style={{ left: `${x}%`, top: `${6 + (i * 13) % 40}%`, width: 3, height: 3 }} />)}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#2d3a2a] border-t-4 border-black" />
        {[['14%', 70], ['66%', 90]].map(([x, w]) => <div key={x} className="absolute bottom-14 bg-[#4a3228] border-4 border-black" style={{ left: x, width: w, height: 56 }}><div className="mx-auto mt-6 w-5 h-8 bg-[#1b0f2a]" /></div>)}
        <div className="absolute bottom-12 left-[44%]" aria-label={velo ? 'Fogata apagada' : 'Fogata encendida'}>
          <svg width="30" height="30" viewBox="0 0 10 10" shapeRendering="crispEdges">
            <rect x="1" y="8" width="8" height="2" fill="#4a3228" />
            {velo ? <rect x="3" y="7" width="4" height="1" fill="#555" /> : (
              <motion.g animate={{ scaleY: [1, 1.15, 0.95, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ transformOrigin: '5px 8px' }}>
                <rect x="3" y="4" width="4" height="4" fill="#f59e0b" /><rect x="4" y="2" width="2" height="3" fill="#ef4444" /><rect x="4" y="5" width="2" height="3" fill="#ffe08a" />
              </motion.g>
            )}
          </svg>
        </div>
        {mom === 'noche' && !velo && [20, 40, 58, 75].map((x, i) => (
          <motion.span key={x} className="absolute w-1 h-1 bg-[#ffe08a]" style={{ left: `${x}%`, bottom: `${30 + i * 8}%` }}
            animate={{ opacity: [0, 1, 0], y: [0, -8, 0] }} transition={{ duration: 3 + i, repeat: Infinity }} />
        ))}
        {presentes.map((k) => (
          <button key={k} onClick={() => setHablando(k)} aria-label={`Hablar con ${PNJ[k].nombre}`} className="absolute bottom-4 -translate-x-1/2" style={{ left: PNJ[k].x }}>
            <Aldeano color={PNJ[k].color} pelo={PNJ[k].pelo} s={4} />
          </button>
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2"><Avatar clase={perfil.clase} tinte={perfil.tinte} escala={6} {...aspecto(perfil)} /></div>
        {velo && <motion.div className="absolute inset-0 bg-[#9a9aa8]" initial={{ opacity: 0 }} animate={{ opacity: [0.4, 0.55, 0.4] }} transition={{ duration: 4, repeat: Infinity }} aria-hidden="true" />}
      </div>
      {velo && <p className="text-sm text-[#c9bee8]">El Velo de Ceniza cubre Oakhaven. Completa una serie para reavivar la fogata.</p>}
      {hablando && <Dialogo key={hablando} pnj={PNJ[hablando]} onClose={() => setHablando(null)} />}
    </div>
  );
}
