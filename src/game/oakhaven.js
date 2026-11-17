// Momento del día según el reloj del dispositivo
export const momento = (hora) => (hora >= 6 && hora < 12 ? 'alba' : hora >= 20 || hora < 2 ? 'noche' : 'dia');
export const BONO_TEXTO = { alba: 'Alba dorada: +5% de EXP', noche: 'Noche estrellada: +5% de crítico', dia: 'Sin bono de horario' };
