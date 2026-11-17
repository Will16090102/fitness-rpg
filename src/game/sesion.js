export const SERIES = 4;

// Valores iniciales al elegir un ejercicio: última marca, o valores por defecto
export function valoresIniciales(ej, perfil) {
  const u = perfil.ultimos?.[ej.id];
  if (u) return { peso: u.peso, reps: u.reps };
  const reps = ej.tipo === 'tiempo' ? 30 : ej.equipo === 'peso_corporal' ? 12 : 10;
  const peso = ej.equipo === 'peso_corporal' ? 0 : ej.equipo === 'mancuernas' ? 10 : 20;
  return { peso, reps };
}
export const pasoReps = (ej) => (ej?.tipo === 'tiempo' ? 5 : 1);

// Rutina del día: 4 a 5 ejercicios de la categoría, cada uno con su contador de series
export const armarSesion = (lista, max = 5) => lista.slice(0, max).map((e) => ({ id: e.id, hechas: 0 }));
