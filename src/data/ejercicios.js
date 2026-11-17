// Cada MOVIMIENTO tiene una variante por equipo: g = gimnasio, m = multifuncional/poleas, d = mancuernas, p = sin equipo.
// Sufijos: #t = por tiempo (segundos), #u = unilateral (reps x2 para el daño)
const RAW = `Pecho y tríceps|Press horizontal|g:Press de banca con barra|m:Press de pecho en máquina|d:Press con mancuernas|p:Flexiones
Pecho y tríceps|Press inclinado|g:Press inclinado con barra|m:Press inclinado en máquina|d:Press inclinado con mancuernas|p:Flexiones con pies elevados
Pecho y tríceps|Aperturas|g:Contractor de pecho en máquina|m:Cruce de poleas|d:Aperturas con mancuernas|p:Flexiones lentas de 3 s
Pecho y tríceps|Fondos|g:Fondos en paralelas|m:Fondos asistidos en máquina|d:Press francés con mancuerna|p:Fondos en banco
Pecho y tríceps|Extensión de tríceps|g:Press cerrado con barra|m:Extensión de tríceps en polea|d:Extensión de tríceps con mancuerna|p:Flexiones diamante
Pecho y tríceps|Patada de tríceps|g:Extensión sobre la cabeza con barra EZ|m:Patada de tríceps en polea|d:Patada de tríceps con mancuerna|p:Flexiones con manos juntas
Espalda y bíceps|Remo horizontal|g:Remo con barra|m:Remo en polea baja|d:Remo con mancuernas a dos manos|p:Remo invertido bajo una mesa
Espalda y bíceps|Remo unilateral|g:Remo en máquina a un brazo#u|m:Remo unilateral en polea#u|d:Remo con mancuerna#u|p:Remo con toalla en una puerta#u
Espalda y bíceps|Jalón vertical|g:Dominadas|m:Jalón al pecho|d:Pullover de espalda con mancuerna|p:Dominadas australianas bajas
Espalda y bíceps|Espalda alta|g:Remo al mentón con barra|m:Face pull en polea|d:Pájaros con mancuernas|p:Superman en el suelo
Espalda y bíceps|Curl de bíceps|g:Curl con barra|m:Curl en polea baja|d:Curl con mancuernas|p:Curl con mochila cargada
Espalda y bíceps|Curl martillo|g:Curl con barra EZ|m:Curl martillo con cuerda|d:Curl martillo con mancuernas|p:Curl isométrico con toalla#t
Espalda y bíceps|Trapecio|g:Encogimientos con barra|m:Encogimientos en máquina|d:Encogimientos con mancuernas|p:Retracciones escapulares en el suelo
Espalda y bíceps|Espalda baja|g:Hiperextensiones en banco|m:Hiperextensión en máquina|d:Buenos días con mancuerna|p:Superman con pausa
Pierna|Sentadilla|g:Sentadilla con barra|m:Prensa de piernas|d:Sentadilla goblet|p:Sentadilla libre
Pierna|Bisagra de cadera|g:Peso muerto rumano con barra|m:Pull-through en polea|d:Peso muerto rumano con mancuernas|p:Buenos días sin peso
Pierna|Zancada|g:Zancadas con barra|m:Zancadas con polea|d:Zancadas con mancuernas|p:Zancadas caminando
Pierna|Sentadilla unilateral|g:Sentadilla búlgara con barra#u|m:Sentadilla búlgara en Smith#u|d:Sentadilla búlgara con mancuernas#u|p:Sentadilla búlgara#u
Pierna|Femoral|g:Peso muerto con piernas rígidas|m:Curl femoral en máquina|d:Curl femoral con mancuerna entre los pies|p:Curl femoral deslizando una toalla
Pierna|Cuádriceps|g:Sentadilla frontal|m:Extensión de piernas en máquina|d:Sentadilla con pausa y mancuernas|p:Sentadilla isométrica en pared#t
Pierna|Gemelos|g:Elevación de talones con barra|m:Elevación de talones en máquina|d:Elevación de talones con mancuernas|p:Elevación de talones en escalón
Pierna|Glúteo|g:Hip thrust con barra|m:Patada de glúteo en polea|d:Hip thrust con mancuerna|p:Puente de glúteo
Hombro y core|Press de hombro|g:Press militar con barra|m:Press de hombro en máquina|d:Press de hombro con mancuernas|p:Pike push-up
Hombro y core|Elevación lateral|g:Elevaciones laterales en máquina|m:Elevaciones laterales en polea|d:Elevaciones laterales|p:Rotaciones de hombro con toalla
Hombro y core|Elevación frontal|g:Elevación frontal con disco|m:Elevación frontal en polea|d:Elevación frontal con mancuernas|p:Pike push-up con pausa
Hombro y core|Hombro posterior|g:Pájaros en máquina inversa|m:Pájaros en polea cruzada|d:Pájaros inclinado con mancuernas|p:Plancha con toque de hombro
Hombro y core|Plancha|g:Plancha con disco en la espalda#t|m:Plancha con polea anti-rotación#t|d:Plancha con remo de mancuerna#t|p:Plancha#t
Hombro y core|Abdominales|g:Crunch en máquina|m:Crunch en polea alta|d:Crunch con mancuerna|p:Crunch abdominal
Hombro y core|Elevación de piernas|g:Elevación de piernas colgado|m:Elevación de rodillas en torre|d:Elevación de piernas con mancuerna entre los pies|p:Elevación de piernas en el suelo
Hombro y core|Rotación|g:Leñador con disco|m:Leñador en polea|d:Giro ruso con mancuerna|p:Giro ruso sin peso
Full body|Peso muerto|g:Peso muerto con barra|m:Peso muerto en Smith|d:Peso muerto con mancuernas|p:Peso muerto a una pierna sin peso#u
Full body|Cargada|g:Cargada de potencia|m:Cargada en polea baja|d:Cargada con mancuernas|p:Saltos con sentadilla
Full body|Thruster|g:Thruster con barra|m:Thruster en Smith|d:Thruster con mancuernas|p:Sentadilla con salto y brazos
Full body|Balanceo|g:Swing con kettlebell|m:Swing en polea|d:Swing con mancuerna|p:Swing con mochila
Full body|Burpee|g:Burpee con salto al cajón|m:Burpee con tirón de polea|d:Burpee con mancuernas|p:Burpees
Full body|Paseo del granjero|g:Paseo del granjero con barra hexagonal|m:Paseo del granjero con discos|d:Paseo del granjero con mancuernas|p:Caminata del oso
Full body|Escaladores|g:Escaladores con manos en banco#t|m:Escaladores con manos en Smith#t|d:Escaladores con manos en mancuernas#t|p:Escaladores#t
Cardio / HIIT|Carrera|g:Cinta de correr#t|m:Remo ergómetro#t|d:Marcha con mancuernas#t|p:Trote en sitio#t
Cardio / HIIT|Saltos|g:Saltos al cajón#t|m:Battle ropes#t|d:Saltos con mancuernas#t|p:Saltos de tijera#t
Cardio / HIIT|Velocidad|g:Sprints en cinta#t|m:Bicicleta estática por intervalos#t|d:Carrera con mancuernas ligeras#t|p:Sprints cortos#t
Cardio / HIIT|Rodillas altas|g:Rodillas altas en cinta#t|m:Elíptica por intervalos#t|d:Rodillas altas con mancuernas#t|p:Rodillas altas#t
Cardio / HIIT|Combate|g:Saco de boxeo#t|m:Escaladora de escaleras#t|d:Boxeo de sombra con mancuernas#t|p:Boxeo de sombra#t
Cardio / HIIT|Circuito|g:Circuito de máquinas#t|m:Circuito en poleas#t|d:Circuito con mancuernas y burpees#t|p:Circuito sin equipo#t
Cardio / HIIT|Lateral|g:Patinador en máquina deslizante#t|m:Slideboard#t|d:Patinador con mancuernas#t|p:Patinador#t`;

const EQ = { g: 'gimnasio', m: 'multifuncional', d: 'mancuernas', p: 'peso_corporal' };
export const PRIORIDAD = ['gimnasio', 'multifuncional', 'mancuernas', 'peso_corporal'];
export const ETIQUETA = { gimnasio: 'GIMNASIO', multifuncional: 'POLEAS', mancuernas: 'MANCUERNAS', peso_corporal: 'SIN EQUIPO' };
export const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const MOVIMIENTOS = RAW.split('\n').map((l) => {
  const [cat, nombre, ...vs] = l.split('|');
  const id = slug(`${cat}-${nombre}`);
  const v = {};
  for (const x of vs) {
    let n = x.slice(2), tipo = 'reps';
    if (n.endsWith('#t')) { tipo = 'tiempo'; n = n.slice(0, -2); } else if (n.endsWith('#u')) { tipo = 'unilateral'; n = n.slice(0, -2); }
    v[EQ[x[0]]] = { id: slug(n), nombre: n, tipo, equipo: EQ[x[0]], cat, mov: id, movNombre: nombre };
  }
  return { id, cat, nombre, v };
});
export const EJERCICIOS = MOVIMIENTOS.flatMap((m) => PRIORIDAD.filter((e) => m.v[e]).map((e) => m.v[e]));

// Equipos que realmente puede usar el usuario (sin equipo siempre está disponible)
export const disponibles = (eqUsuario) => PRIORIDAD.filter((e) => e === 'peso_corporal' || (eqUsuario || []).includes(e));
export const variantes = (mov, eqUsuario) => disponibles(eqUsuario).filter((e) => mov.v[e]).map((e) => mov.v[e]);
export function resolver(item, eqUsuario) {
  const mov = MOVIMIENTOS.find((m) => m.id === item.id);
  if (!mov) return null;
  const vs = variantes(mov, eqUsuario);
  return vs.find((e) => e.equipo === item.eq) || vs[0] || null;
}
