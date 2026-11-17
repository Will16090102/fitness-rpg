const ICONOS = {
  avatar: ['..XXXX..', '..XXXX..', '..XXXX..', '...XX...', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XX....XX'],
  rutina: ['........', 'X......X', 'X.XXXX.X', 'XXXXXXXX', 'XXXXXXXX', 'X.XXXX.X', 'X......X', '........'],
  cronicas: ['.XXXXXX.', 'XX.XX.XX', 'XX.XX.XX', 'XX.XX.XX', 'XX.XX.XX', 'XX.XX.XX', 'XXXXXXXX', '........'],
  ranking: ['XXXXXXXX', 'X.XXXX.X', 'X.XXXX.X', '.XXXXXX.', '..XXXX..', '...XX...', '..XXXX..', '.XXXXXX.'],
};
const TABS = [['avatar', 'AVATAR'], ['rutina', 'RUTINA'], ['cronicas', 'CRÓNICAS'], ['ranking', 'RANKING']];

export default function NavBar({ activa, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-4 border-black" aria-label="Navegación principal">
      <div className="mx-auto max-w-[430px] flex">
        {TABS.map(([id, nombre]) => (
          <button key={id} onClick={() => onChange(id)} aria-current={activa === id ? 'page' : undefined}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 text-base ${activa === id ? 'text-gold border-t-2 border-gold bg-[#2a1b4a]' : 'text-[#c9bee8] border-t-2 border-transparent'}`}>
            <svg viewBox="0 0 24 24" width="24" height="24" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
              {ICONOS[id].flatMap((f, j) => [...f].map((c, i) => (c === 'X' ? <rect key={`${i}-${j}`} x={i * 3} y={j * 3} width="3" height="3" /> : null)))}
            </svg>
            <span>{nombre}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
