// categoría | equipo | tipo | nombre   (tipo: reps, unilateral, tiempo, peso_corporal)
const RAW = `Pecho y tríceps|gimnasio|reps|Press de banca con barra
Pecho y tríceps|gimnasio|reps|Press inclinado con barra
Pecho y tríceps|multifuncional|reps|Cruce de poleas
Pecho y tríceps|mancuernas|reps|Press con mancuernas
Pecho y tríceps|mancuernas|reps|Extensión de tríceps con mancuerna
Pecho y tríceps|peso_corporal|peso_corporal|Flexiones
Pecho y tríceps|peso_corporal|peso_corporal|Fondos en banco
Espalda y bíceps|gimnasio|reps|Remo con barra
Espalda y bíceps|gimnasio|peso_corporal|Dominadas
Espalda y bíceps|multifuncional|reps|Jalón al pecho
Espalda y bíceps|multifuncional|reps|Remo en polea baja
Espalda y bíceps|mancuernas|unilateral|Remo con mancuerna
Espalda y bíceps|mancuernas|reps|Curl de bíceps con mancuernas
Espalda y bíceps|peso_corporal|peso_corporal|Remo invertido bajo una mesa
Pierna|gimnasio|reps|Sentadilla con barra
Pierna|gimnasio|reps|Peso muerto rumano
Pierna|multifuncional|reps|Prensa de piernas
Pierna|multifuncional|reps|Curl femoral en máquina
Pierna|mancuernas|unilateral|Sentadilla búlgara con mancuernas
Pierna|mancuernas|reps|Zancadas con mancuernas
Pierna|peso_corporal|unilateral|Sentadilla búlgara
Pierna|peso_corporal|peso_corporal|Sentadilla libre
Hombro y core|gimnasio|reps|Press militar con barra
Hombro y core|multifuncional|reps|Elevaciones laterales en polea
Hombro y core|mancuernas|reps|Press de hombro con mancuernas
Hombro y core|mancuernas|reps|Elevaciones laterales
Hombro y core|peso_corporal|tiempo|Plancha (segundos)
Hombro y core|peso_corporal|peso_corporal|Elevación de piernas
Hombro y core|peso_corporal|peso_corporal|Pike push-up
Full body|gimnasio|reps|Peso muerto con barra
Full body|gimnasio|reps|Cargada de potencia
Full body|mancuernas|reps|Thruster con mancuernas
Full body|mancuernas|reps|Swing con mancuerna
Full body|peso_corporal|peso_corporal|Burpees
Full body|peso_corporal|tiempo|Escaladores (segundos)
Cardio / HIIT|gimnasio|tiempo|Cinta de correr (segundos)
Cardio / HIIT|multifuncional|tiempo|Remo ergómetro (segundos)
Cardio / HIIT|mancuernas|tiempo|Circuito con mancuernas (segundos)
Cardio / HIIT|peso_corporal|tiempo|Saltos de tijera (segundos)
Cardio / HIIT|peso_corporal|tiempo|Trote en sitio (segundos)
Cardio / HIIT|peso_corporal|peso_corporal|Sprints cortos`;

export const EJERCICIOS = RAW.split('\n').map((l, i) => {
  const [cat, equipo, tipo, nombre] = l.split('|');
  return { id: `e${i}`, cat, equipo, tipo, nombre };
});
