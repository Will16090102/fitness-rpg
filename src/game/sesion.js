import { variantes } from '../data/ejercicios.js';

export const SERIES = 4;
export const VERSION = 2;

// Valores iniciales al elegir un ejercicio: última marca, o valores por defecto
export function valoresIniciales(ej, perfil) {
  const u = perfil.ultimos?.[ej.id];
  if (u) return { peso: u.peso, reps: u.reps };
  const reps = ej.tipo === 'tiempo' ? 30 : ej.equipo === 'peso_corporal' ? 12 : 10;
  const peso = ej.equipo === 'peso_corporal' ? 0 : ej.equipo === 'mancuernas' ? 10 : 20;
  return { peso, reps };
}
export const pasoReps = (ej) => (ej?.tipo === 'tiempo' ? 5 : 1);

// Rutina del día: 5 movimientos de la categoría (rotan cada día), cada uno con la variante de tu equipo
export function armarSesion(movs, eqUsuario, dia = new Date(), max = 5) {
  const off = movs.length ? Math.floor(dia.getTime() / 86400000) % movs.length : 0;
  return [...movs.slice(off), ...movs.slice(0, off)].slice(0, max).map((m) => ({ id: m.id, eq: variantes(m, eqUsuario)[0]?.equipo ?? 'peso_corporal', hechas: 0 }));
}
