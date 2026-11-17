import { MOVIMIENTOS } from './ejercicios.js';

// Patrón muscular -> movimientos que lo trabajan (se puede cambiar por cualquiera de su grupo)
export const PATRONES = {
  empuje_h: ['Press horizontal', 'Press inclinado', 'Aperturas'],
  empuje: ['Press horizontal', 'Press de hombro', 'Press inclinado'],
  hombro: ['Press de hombro', 'Elevación lateral', 'Hombro posterior', 'Elevación frontal'],
  triceps: ['Fondos', 'Extensión de tríceps', 'Patada de tríceps'],
  traccion_v: ['Jalón vertical', 'Remo horizontal'],
  traccion_h: ['Remo horizontal', 'Remo unilateral', 'Espalda alta', 'Trapecio', 'Espalda baja'],
  traccion: ['Remo horizontal', 'Jalón vertical', 'Remo unilateral'],
  biceps: ['Curl de bíceps', 'Curl martillo'],
  cuadriceps: ['Sentadilla', 'Cuádriceps', 'Sentadilla unilateral', 'Zancada'],
  cuadriceps_fb: ['Sentadilla', 'Thruster', 'Cuádriceps'],
  bisagra: ['Bisagra de cadera', 'Femoral'],
  bisagra_fb: ['Peso muerto', 'Bisagra de cadera', 'Balanceo'],
  gluteo: ['Glúteo', 'Zancada'],
  gemelo: ['Gemelos', 'Zancada', 'Glúteo'],
  core: ['Plancha', 'Abdominales', 'Elevación de piernas', 'Rotación'],
  metabolico: ['Burpee', 'Escaladores', 'Balanceo', 'Cargada', 'Paseo del granjero'],
  cardio_a: ['Carrera', 'Velocidad'],
  cardio_b: ['Saltos', 'Rodillas altas'],
  cardio_c: ['Velocidad', 'Lateral'],
  cardio_d: ['Combate', 'Rodillas altas'],
  cardio_e: ['Circuito', 'Escaladores'],
};
export const ETIQUETA_PATRON = {
  empuje_h: 'Empuje de pecho', empuje: 'Empuje', hombro: 'Hombro', triceps: 'Tríceps', traccion_v: 'Tracción vertical', traccion_h: 'Tracción horizontal', traccion: 'Tracción',
  biceps: 'Bíceps', cuadriceps: 'Cuádriceps', cuadriceps_fb: 'Pierna / cuádriceps', bisagra: 'Bisagra de cadera', bisagra_fb: 'Bisagra / cadera', gluteo: 'Glúteo', gemelo: 'Gemelos',
  core: 'Core', metabolico: 'Metabólico / core', cardio_a: 'Base aeróbica', cardio_b: 'Saltos', cardio_c: 'Velocidad', cardio_d: 'Combate', cardio_e: 'Circuito',
};
// 5 slots por sesión, cada uno con un patrón distinto
export const SLOTS = {
  'Pecho y tríceps': ['empuje_h', 'empuje_h', 'empuje_h', 'triceps', 'triceps'],
  'Espalda y bíceps': ['traccion_v', 'traccion_h', 'traccion_h', 'biceps', 'biceps'],
  Pierna: ['cuadriceps', 'bisagra', 'cuadriceps', 'gluteo', 'gemelo'],
  'Hombro y core': ['hombro', 'hombro', 'hombro', 'core', 'core'],
  'Full body': ['cuadriceps_fb', 'bisagra_fb', 'empuje', 'traccion', 'metabolico'],
  'Cardio / HIIT': ['cardio_a', 'cardio_b', 'cardio_c', 'cardio_d', 'cardio_e'],
};
export const movsDe = (patron) => (PATRONES[patron] || []).map((n) => MOVIMIENTOS.find((m) => m.nombre === n)).filter(Boolean);
