import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarCuerpo } from './Avatar.jsx';
import { aspecto } from '../data/armeria.js';
import { momento } from '../game/oakhaven.js';
import { sombrear } from '../game/pixel.js';

const CIELO = { alba: ['#ffcf7a', '#f3a6a0', '#b07ac0'], dia: ['#6aa7e0', '#8fc3ee', '#bfe3f5'], noche: ['#0b0818', '#1a1033', '#2a1b4a'] };
const MAPA = ['...OOOO...', '..OHHHHO..', '.OHHHHHHO.', '.OHSSSSHO.', '.OSESSESO.', '.OSSSSSSO.', '..OSSSSO..', '..OAAAAO..', '.OAAAAAAO.', '.OSAAAASO.', '.OAAAAAAO.', '..OLLLLO..', '..OLOOLO..', '..ODOODO..'];
const BASE_PAL = { O: '#1B0F2A', S: '#F0C08F', E: '#1B0F2A', L: '#2D3566', D: '#120A20' };
const PNJ = {
  vael: { nombre: 'Vael', x: 62, y: 232, pal: { H: '#9a9aa8', A: '#8a5a2b' }, lineas: ['El hierro no miente, Portador. Lo que levantas hoy te sostiene mañana.', 'Mi brazo ya no responde, pero tu esfuerzo sí enciende esta fragua.'] },
  lyra: { nombre: 'Lyra', x: 300, y: 232, pal: { H: '#e8e0c8', A: '#6a3fb5' }, lineas: ['No necesito ojos para ver tu aura, viajero.', 'Anoto cada hazaña tuya en las Crónicas. Que no se pierda ninguna.'] },
  mira: { nombre: 'Mira', x: 104, y: 238, pal: { H: '#5a3a1a', A: '#2e9e78' }, lineas: ['Gracias por rescatarme. Mis Elixires protegerán tu racha.'] },
  garrick: { nombre: 'Garrick', x: 0, y: 244, pal: { H: '#2a1a0a', A: '#7a5230' }, lineas: ['Conozco cada risco de estas tierras. Te guiaré.'] },
  soren: { nombre: 'Soren', x: 248, y: 238, pal: { H: '#d9a441', A: '#b3392b' }, lineas: ['Compondré una canción con tus victorias.'] },
};

function Persona({ pal, amp = 1, dur = 2.4, delay = 0, extra, s = 3 }) {
  const h = s / 2;
  const rects = useMemo(() => sombrear(MAPA, { ...BASE_PAL, ...pal }), [pal]);
  return (
    <g>
      <rect x={-14} y={-2} width={28} height={4} fill="#000" opacity="0.3" />
      <motion.g animate={{ y: [0, -amp, 0] }} transition={{ duration: dur, repeat: Infinity, delay }}>
        <g transform={`translate(${-5 * s},${-14 * s})`}>
          {rects.map((r, n) => <rect key={n} x={r.x * h} y={r.y * h} width={r.w * h} height={r.h * h} fill={r.f} />)}
          <motion.g animate={{ opacity: [0, 0, 1, 0, 0] }} transition={{ duration: 4, repeat: Infinity, delay, times: [0, 0.9, 0.93, 0.97, 1] }}>
            <rect x={3 * s} y={4 * s} width={s} height={s} fill="#F0C08F" /><rect x={6 * s} y={4 * s} width={s} height={s} fill="#F0C08F" />
          </motion.g>
        </g>
        {extra}
      </motion.g>
    </g>
  );
}

const Martillo = () => (
  <g transform="translate(9,-15)">
    <motion.g animate={{ rotate: [-60, 25, -60] }} transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 1] }} style={{ transformOrigin: '0px 0px' }}>
      <rect x="-1" y="-18" width="3" height="18" fill="#8a5a2b" /><rect x="-6" y="-24" width="13" height="7" fill="#7a8396" /><rect x="-6" y="-24" width="13" height="2" fill="#b9bfcc" />
    </motion.g>
  </g>
);
const Yunque = () => (
  <g transform="translate(26,0)">
    <rect x="-9" y="-8" width="18" height="8" fill="#565e70" /><rect x="-12" y="-14" width="24" height="6" fill="#7a8396" /><rect x="-12" y="-14" width="24" height="2" fill="#b9bfcc" />
    <motion.g animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.48, 0.52, 1] }}>
      {[[-6, -22], [0, -26], [6, -21], [-10, -17]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" fill="#ffe08a" />)}
    </motion.g>
  </g>
);
const Laud = () => (
  <g>
    <rect x="6" y="-14" width="10" height="8" fill="#8a5a2b" /><rect x="6" y="-14" width="10" height="2" fill="#b07a3f" /><rect x="14" y="-22" width="3" height="9" fill="#5e3b14" />
    {[0, 1].map((i) => <motion.rect key={i} x={20 + i * 6} y="-24" width="3" height="3" fill="#ffe08a" animate={{ y: [-24, -44], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i }} />)}
  </g>
);
const Pergamino = () => <g><rect x="5" y="-13" width="11" height="8" fill="#ead9ae" /><rect x="7" y="-11" width="7" height="1" fill="#5e3b14" /><rect x="7" y="-8" width="5" height="1" fill="#5e3b14" /></g>;
const Plantas = () => <g transform="translate(16,0)">{[0, 8, 16].map((x) => <g key={x}><rect x={x} y="-7" width="2" height="7" fill="#2f6b3a" /><rect x={x - 2} y="-10" width="6" height="4" fill="#4fa05a" /><rect x={x - 1} y="-11" width="2" height="2" fill="#f87171" /></g>)}</g>;

function Casa({ x, y, lit }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="4" y="26" width="64" height="38" fill="#8a5a2b" />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x="4" y={30 + k * 8} width="64" height="2" fill="#6e4520" />)}
      <rect x="4" y="26" width="4" height="38" fill="#a37038" /><rect x="64" y="26" width="4" height="38" fill="#5e3b14" />
      {[0, 1, 2, 3].map((r) => {
        const w = 28 + r * 14, xx = 36 - w / 2;
        return (
          <g key={r}>
            <rect x={xx} y={r * 8} width={w} height="8" fill={r % 2 ? '#8f2d22' : '#b3392b'} /><rect x={xx} y={r * 8} width={w} height="1" fill="#d4604f" /><rect x={xx} y={r * 8 + 6} width={w} height="2" fill="#5e1d16" />
            {Array.from({ length: Math.floor(w / 8) }, (_, k) => <rect key={k} x={xx + 4 + k * 8} y={r * 8} width="1" height="6" fill="#5e1d16" />)}
          </g>
        );
      })}
      <rect x="52" y="2" width="8" height="14" fill="#7a7a86" /><rect x="50" y="0" width="12" height="3" fill="#565e70" />
      {[0, 1].map((i) => <motion.rect key={i} x="54" y="-4" width="4" height="4" fill="#c8c8d4" animate={{ y: [-4, -26], opacity: [0.7, 0], x: [54, 58] }} transition={{ duration: 3, repeat: Infinity, delay: i * 1.5 }} />)}
      <rect x="12" y="38" width="16" height="14" fill="#2a1a0a" />
      <motion.rect x="14" y="40" width="12" height="10" fill="#ffd24a" animate={lit ? { opacity: [0.85, 1, 0.9, 1] } : { opacity: 0.3 }} transition={{ duration: 2, repeat: Infinity }} />
      <rect x="19" y="40" width="2" height="10" fill="#2a1a0a" /><rect x="14" y="44" width="12" height="2" fill="#2a1a0a" />
      <rect x="42" y="40" width="16" height="24" fill="#4a3228" /><rect x="42" y="40" width="16" height="2" fill="#6a4a3a" /><rect x="54" y="52" width="2" height="2" fill="#ffd24a" />
    </g>
  );
}
const Pino = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-3" y="30" width="6" height="12" fill="#4a3228" />
    {[[12, 0, 10], [20, 10, 10], [28, 20, 12]].map(([w, yy, hh], i) => (
      <g key={i}><rect x={-w / 2} y={yy} width={w} height={hh} fill="#2f6b3a" /><rect x="0" y={yy} width={w / 2} height={hh} fill="#245530" /><rect x={-w / 2} y={yy} width="2" height={hh} fill="#3f8a4a" /></g>
    ))}
  </g>
);
const Nube = ({ y, dur, delay, color }) => (
  <motion.g initial={{ x: -80 }} animate={{ x: 440 }} transition={{ duration: dur, repeat: Infinity, ease: 'linear', delay }}>
    <g transform={`translate(0,${y})`}><rect x="16" y="0" width="16" height="8" fill={color} /><rect x="4" y="8" width="44" height="8" fill={color} /><rect x="8" y="14" width="36" height="4" fill="#000" opacity="0.12" /></g>
  </motion.g>
);

function Fogata({ x, y, apagada }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {!apagada && <><ellipse cx="0" cy="-8" rx="34" ry="22" fill="#f59e0b" opacity="0.1" /><ellipse cx="0" cy="-8" rx="22" ry="14" fill="#f59e0b" opacity="0.16" /></>}
      <rect x="-12" y="-4" width="24" height="5" fill="#4a3228" /><rect x="-10" y="-8" width="20" height="4" fill="#5e3b14" />
      {apagada ? <rect x="-6" y="-10" width="12" height="3" fill="#555" /> : (<>
        <motion.g animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ transformOrigin: '0px 0px' }}>
          <rect x="-8" y="-20" width="16" height="12" fill="#f59e0b" /><rect x="-5" y="-28" width="10" height="10" fill="#ef4444" /><rect x="-3" y="-16" width="6" height="8" fill="#ffe08a" />
        </motion.g>
        {[-6, 0, 6].map((dx, i) => <motion.rect key={dx} x={dx} y="-24" width="2" height="2" fill="#ffe08a" animate={{ y: [-24, -52], opacity: [1, 0], x: [dx, dx + (i - 1) * 6] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5 }} />)}
      </>)}
    </g>
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
  const cielo = CIELO[mom];
  const presentes = ['vael', 'lyra', ...(perfil.aldeanos || [])].filter((k) => PNJ[k]);
  const lit = mom !== 'dia';
  const nube = mom === 'noche' ? '#3b3a66' : '#f2f7ff';
  const extra = { vael: <><Martillo /><Yunque /></>, lyra: <Pergamino />, mira: <Plantas />, soren: <Laud /> };
  const ritmo = { mira: { amp: 3, dur: 1.2 }, soren: { amp: 2, dur: 0.8 }, vael: { amp: 1, dur: 1.8 } };
  const toque = (k) => ({ role: 'button', tabIndex: 0, 'aria-label': `Hablar con ${PNJ[k].nombre}`, onClick: () => setHablando(k), onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') setHablando(k); }, style: { cursor: 'pointer' } });
  return (
    <div className="flex flex-col gap-2">
      <div className="border-4 border-black overflow-hidden">
        <svg viewBox="0 0 360 256" width="100%" shapeRendering="crispEdges" style={{ display: 'block', imageRendering: 'pixelated' }} role="img" aria-label={`Aldea de Oakhaven, ${mom === 'noche' ? 'de noche' : mom === 'alba' ? 'al alba' : 'de día'}`}>
          {cielo.map((c, i) => <rect key={i} x="0" y={i * 50} width="360" height="52" fill={c} />)}
          {mom === 'noche' && [10, 44, 90, 130, 188, 236, 282, 330].map((x, i) => <rect key={x} x={x} y={8 + ((i * 29) % 90)} width="3" height="3" fill="#f8f1d8" />)}
          {mom === 'noche' ? <><rect x="300" y="20" width="20" height="20" fill="#f2f0d8" /><rect x="308" y="20" width="12" height="12" fill="#2a1b4a" opacity="0.5" /></> : <><rect x="296" y="22" width="24" height="24" fill="#ffe08a" /><rect x="300" y="26" width="16" height="16" fill="#fff3b0" /></>}
          <Nube y={40} dur={90} delay={0} color={nube} /><Nube y={74} dur={130} delay={-50} color={nube} /><Nube y={20} dur={110} delay={-20} color={nube} />
          <g fill="#2a3f4a"><rect x="0" y="150" width="360" height="42" /><rect x="20" y="138" width="60" height="14" /><rect x="90" y="130" width="86" height="22" /><rect x="200" y="140" width="70" height="12" /><rect x="282" y="132" width="78" height="20" /></g>
          <g fill="#34505c"><rect x="90" y="130" width="86" height="3" /><rect x="282" y="132" width="78" height="3" /></g>
          <Pino x={22} y={148} /><Pino x={150} y={150} /><Pino x={206} y={146} /><Pino x={338} y={150} />
          <rect x="0" y="190" width="360" height="66" fill="#3a5a34" /><rect x="0" y="190" width="360" height="3" fill="#5a8a4a" />
          {[12, 70, 130, 190, 250, 330].map((x, i) => <g key={x} fill="#4f7a40"><rect x={x} y={200 + (i % 3) * 14} width="2" height="5" /><rect x={x + 4} y={198 + (i % 3) * 14} width="2" height="7" /></g>)}
          <rect x="30" y="226" width="300" height="16" fill="#7a6040" /><rect x="30" y="226" width="300" height="3" fill="#9a7a50" />
          <Casa x={14} y={150} lit={lit} /><Casa x={262} y={150} lit={lit} />
          <Fogata x={200} y={222} apagada={velo} />
          {presentes.map((k) => (k === 'garrick' ? (
            <motion.g key={k} animate={{ x: [40, 320, 320, 40, 40] }} transition={{ duration: 44, repeat: Infinity, times: [0, 0.48, 0.5, 0.98, 1], ease: 'linear' }}>
              <g transform={`translate(0,${PNJ[k].y})`} {...toque(k)}><rect x="-16" y="-48" width="32" height="52" fill="transparent" />
                <motion.g animate={{ scaleX: [1, 1, -1, -1, 1] }} transition={{ duration: 44, repeat: Infinity, times: [0, 0.48, 0.5, 0.98, 1], ease: 'linear' }} style={{ transformOrigin: '0px 0px' }}><Persona pal={PNJ[k].pal} amp={2} dur={0.5} /></motion.g></g>
            </motion.g>
          ) : (
            <g key={k} transform={`translate(${PNJ[k].x},${PNJ[k].y})`} {...toque(k)}><rect x="-16" y="-48" width="32" height="52" fill="transparent" /><Persona pal={PNJ[k].pal} extra={extra[k]} {...(ritmo[k] || {})} /></g>
          )))}
          <g transform="translate(150,152)"><AvatarCuerpo clase={perfil.clase} tinte={perfil.tinte} escala={4} {...aspecto(perfil)} /></g>
          {mom === 'noche' && !velo && [60, 110, 170, 240, 300].map((x, i) => <motion.rect key={x} x={x} y={190 + (i % 3) * 18} width="3" height="3" fill="#ffe08a" animate={{ opacity: [0, 1, 0], y: [190 + (i % 3) * 18, 178 + (i % 3) * 18] }} transition={{ duration: 3 + i, repeat: Infinity }} />)}
          {mom === 'noche' && <rect x="0" y="0" width="360" height="256" fill="#0b0818" opacity="0.18" />}
          {velo && <motion.rect x="0" y="0" width="360" height="256" fill="#9a9aa8" initial={{ opacity: 0 }} animate={{ opacity: [0.4, 0.55, 0.4] }} transition={{ duration: 4, repeat: Infinity }} />}
        </svg>
      </div>
      {velo && <p className="text-sm text-[#c9bee8]">El Velo de Ceniza cubre Oakhaven. Completa una serie para reavivar la fogata.</p>}
      {hablando && <Dialogo key={hablando} pnj={PNJ[hablando]} onClose={() => setHablando(null)} />}
    </div>
  );
}
