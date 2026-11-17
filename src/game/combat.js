import { bonoPostura } from './classes.js';

export const danoBase = (pesoEfectivoKg, repsEquivalentes) => Math.sqrt(pesoEfectivoKg * repsEquivalentes) * 18;
export const bonoRacha = (dias) => 1 + Math.min(Math.max(dias, 0), 5) * 0.05;

// Daño_Final = Base * (1 + Fuerza*0.005) * Postura * Racha * Crítico (x1.5) * Debilidad (x1.15)
export function danoFinal({ peso, reps, fuerza = 0, clase, racha = 0, critico = false, debilidad = false, hiit = false, descansoExacto = false }) {
  const base = danoBase(peso, reps);
  const total = base * (1 + fuerza * 0.005) * bonoPostura(clase, { reps, hiit, descansoExacto }) * bonoRacha(racha) * (critico ? 1.5 : 1) * (debilidad ? 1.15 : 1);
  return Math.round(total);
}
