export const JEFES = [
  { cap: 1, nombre: 'El Carcelero de Escoria', debilidad: ['Pierna', 'Espalda y bíceps'], frases: ['¡Nadie despierta de mi sueño!', 'Tu fuerza... me incomoda.', 'No... el hierro... no...'] },
  { cap: 2, nombre: 'Mirel, la Hidra del Letargo', debilidad: ['Cardio / HIIT'], frases: ['Duerme, viajero. Descansa.', 'Mis cabezas... se despiertan.', 'El pantano... se seca...'] },
  { cap: 3, nombre: 'Vespera, la Dama del Vendaval', debilidad: ['Cardio / HIIT', 'Pecho y tríceps'], frases: ['El viento te arrastrará.', 'Eres más veloz de lo que creí.', 'Mi tormenta... se apaga.'] },
  { cap: 4, nombre: 'El Coloso de la Puerta', debilidad: ['Full body', 'Pecho y tríceps'], frases: ['Nadie cruza esta puerta.', 'La piedra se agrieta...', 'Imposible... cedo.'] },
];
export const jefeInfo = (cap) => JEFES[Math.min(Math.max(cap, 1), JEFES.length) - 1];
export const frase = (info, pct) => info.frases[pct > 50 ? 0 : pct > 15 ? 1 : 2];

// HP inicial estimado: daño medio por serie (300) x series por semana x 0.90; +10% por capítulo
export function nuevoJefe(perfil, cap) {
  const seriesSemana = Math.max(1, (perfil.dias || []).length) * 10;
  const hp = Math.round(300 * seriesSemana * 0.9 * (1 + 0.1 * (cap - 1)));
  return { cap, nombre: jefeInfo(cap).nombre, hp, hpMax: hp };
}
