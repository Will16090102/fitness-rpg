import { variantes } from '../data/ejercicios.js';
import { SLOTS, movsDe } from '../data/patrones.js';

export const SERIES = 4;
export const VERSION = 3;

// Valores iniciales al elegir un ejercicio: última marca, o valores por defecto
export function valoresIniciales(ej, perfil) {
  const u = perfil.ultimos?.[ej.id];
  if (u) return { peso: u.peso, reps: u.reps };
  const reps = ej.tipo === 'tiempo' ? 30 : ej.equipo === 'peso_corporal' ? 12 : 10;
  const peso = ej.equipo === 'peso_corporal' ? 0 : ej.equipo === 'mancuernas' ? 10 : 20;
  return { peso, reps };
}
export const pasoReps = (ej) => (ej?.tipo === 'tiempo' ? 5 : 1);

// Carga primero (slots 1-2), intermedio después y dinámico/metabólico al final
const CARGA = ['gimnasio', 'multifuncional', 'mancuernas', 'peso_corporal'];
const MEDIO = ['multifuncional', 'mancuernas', 'gimnasio', 'peso_corporal'];
const DINAMICO = ['peso_corporal', 'mancuernas', 'multifuncional', 'gimnasio'];
const ES_DINAMICO = (p) => p === 'core' || p === 'metabolico' || p.startsWith('cardio');
export function elegirEq(mov, eqUsuario, slot, patron) {
  const disp = variantes(mov, eqUsuario).map((v) => v.equipo);
  const pref = slot <= 1 ? CARGA : slot === 4 && ES_DINAMICO(patron) ? DINAMICO : MEDIO;
  return pref.find((e) => disp.includes(e)) ?? 'peso_corporal';
}

// 5 slots con patrones distintos; dentro de cada patrón el movimiento rota cada día y no se repite
export function armarSesion(cat, eqUsuario, dia = new Date()) {
  const dias = Math.floor(dia.getTime() / 86400000);
  const usados = new Set();
  return (SLOTS[cat] || []).map((patron, slot) => {
    const pool = movsDe(patron);
    const off = dias % pool.length;
    const orden = [...pool.slice(off), ...pool.slice(0, off)];
    const m = orden.find((x) => !usados.has(x.id)) || orden[0];
    usados.add(m.id);
    return { id: m.id, eq: elegirEq(m, eqUsuario, slot, patron), slot, hechas: 0 };
  });
}
