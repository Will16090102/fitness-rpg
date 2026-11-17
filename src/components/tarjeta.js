import { BASE, PAL, oscurecer } from './Avatar.jsx';
import { levelFromXp } from '../game/levels.js';
import { aspecto } from '../data/armeria.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Tarjeta vertical tipo carta coleccionable (PNG) con tu avatar, el jefe y tus estadísticas
export async function tarjetaPNG({ perfil, item }) {
  const { tintes, aura } = aspecto(perfil);
  const p = { ...PAL[perfil.clase] };
  const pech = tintes.pechera || perfil.tinte;
  if (pech) { p.A = pech; p.a = oscurecer(pech); }
  if (tintes.capa) p.C = tintes.capa;
  if (tintes.botas) p.D = tintes.botas;
  const st = perfil.sesion?.stats || {};
  const s = 14, ox = (360 - 14 * s) / 2, oy = 120;
  const sprite = BASE.flatMap((fila, j) => [...fila].map((c, i) => (p[c] ? `<rect x="${ox + i * s}" y="${oy + j * s}" width="${s}" height="${s}" fill="${p[c]}"/>` : ''))).join('');
  const halo = aura ? `<rect x="${ox - 20}" y="${oy - 10}" width="${14 * s + 40}" height="${18 * s + 20}" fill="${aura}" opacity="0.22"/>` : '';
  const t = (y, txt, size, fill = '#f8f1d8') => `<text x="180" y="${y}" font-family="monospace" font-weight="bold" font-size="${size}" fill="${fill}" text-anchor="middle">${esc(txt)}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640" shape-rendering="crispEdges">
<rect width="360" height="640" fill="#130e24"/><rect x="10" y="10" width="340" height="620" fill="none" stroke="#f59e0b" stroke-width="6"/>
${t(52, 'GYM RPG', 26, '#f59e0b')}${t(80, 'El Tratado de la Carne y el Hierro', 11, '#c9bee8')}${halo}${sprite}
${t(oy + 18 * s + 40, `${perfil.nombre} · NV. ${levelFromXp(perfil.exp || 0).nivel}`, 20, '#ffe08a')}
${t(oy + 18 * s + 66, perfil.jefe ? `Frente a ${perfil.jefe.nombre}` : '', 12, '#ef4444')}
${t(430, `Daño total: ${st.dmg || 0} HP`, 18)}${t(462, `Tonelaje: ${st.ton || 0} kg`, 18)}${t(494, `Series: ${st.series || 0} · Nuevos PR: ${st.prs || 0}`, 16)}
${item ? t(546, `Botín: ${item.nombre}`, 16, item.color) : t(546, 'Botín: +1 Fragmento de Voluntad', 14, '#10b981')}
${t(600, new Date().toLocaleDateString('es'), 12, '#c9bee8')}</svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, 720, 1280);
  return new Promise((r) => canvas.toBlob(r, 'image/png'));
}

export async function compartirPNG(blob) {
  const file = new File([blob], 'hazana-gym-rpg.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Mi hazaña en Gym RPG' }); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
