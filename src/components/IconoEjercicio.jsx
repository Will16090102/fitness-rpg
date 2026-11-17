const MAPAS = {
  gimnasio: ['..........', 'X........X', 'XX......XX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XX......XX', 'X........X', '..........'],
  mancuernas: ['..........', '..X....X..', '.XX....XX.', '.XXXXXXXX.', '.XXXXXXXX.', '.XX....XX.', '..X....X..', '..........'],
  multifuncional: ['...XXXX...', '..X....X..', '..X.XX.X..', '..X.XX.X..', '..X....X..', '...XXXX...', '....X.....', '....X.....'],
  peso_corporal: ['....XX....', '....XX....', '..XXXXXX..', '..X.XX.X..', '....XX....', '...X..X...', '...X..X...', '..XX..XX..'],
};
// Icono 2D del ejercicio según la herramienta de la variante activa
export default function IconoEjercicio({ equipo, tiempo }) {
  const mapa = MAPAS[equipo] || MAPAS.peso_corporal;
  const s = 5;
  return (
    <div className="shrink-0 w-[60px] h-[52px] border-4 border-black bg-[#2a1b4a] flex items-center justify-center">
      <svg width={10 * s} height={8 * s} viewBox={`0 0 ${10 * s} ${8 * s}`} shapeRendering="crispEdges" role="img" aria-label={`Ejercicio con ${equipo.replace('_', ' ')}${tiempo ? ', por tiempo' : ''}`}>
        {mapa.flatMap((f, j) => [...f].map((c, i) => (c === 'X' ? <rect key={`${i}-${j}`} x={i * s} y={j * s} width={s} height={s} fill={tiempo ? '#4FD1A5' : '#f59e0b'} /> : null)))}
      </svg>
    </div>
  );
}
