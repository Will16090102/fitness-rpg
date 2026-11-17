export const CLASES = {
  guerrero: { nombre: 'Guerrero', bono: '+10% de daño en series de 1 a 6 reps', rango: [1, 6] },
  explorador: { nombre: 'Explorador', bono: '+10% en HIIT y descansos estrictos', rango: null },
  mago: { nombre: 'Mago', bono: '+10% de daño en series de 10 a 20 reps', rango: [10, 20] },
};
// ctx: { reps, hiit, descansoExacto }
export function bonoPostura(clase, ctx) {
  const c = CLASES[clase];
  if (!c) return 1;
  if (c.rango) return ctx.reps >= c.rango[0] && ctx.reps <= c.rango[1] ? 1.1 : 1;
  return ctx.hiit || ctx.descansoExacto ? 1.1 : 1;
}
