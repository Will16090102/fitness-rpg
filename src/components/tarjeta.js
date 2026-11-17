import { rectasAvatar } from '../game/sprites.js';
import { levelFromXp } from '../game/levels.js';
import { aspecto } from '../data/armeria.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Captura de juego retro (PNG vertical): escena nocturna, héroe celebrando y pergamino con estadísticas
export async function tarjetaPNG({ perfil, item }) {
  const { tintes, aura } = aspecto(perfil);
  const st = perfil.sesion?.stats || {};
  const h = 7, ox = 180 - 7 * 14, oy = 150;
  const { rects } = rectasAvatar({ clase: perfil.clase, tinte: perfil.tinte, tintes, pose: 'victoria' });
  const sprite = rects.map((r) => `<rect x="${ox + r.x * h}" y="${oy + r.y * h}" width="${r.w * h}" height="${r.h * h}" fill="${r.f}"/>`).join('');
  const estrellas = [20, 60, 100, 150, 210, 260, 310, 340].map((x, i) => `<rect x="${x}" y="${70 + ((i * 37) % 120)}" width="4" height="4" fill="#f8f1d8"/>`).join('');
  const halo = `<rect x="${ox - 20}" y="${oy - 10}" width="${14 * 14 + 40}" height="${18 * 14 + 30}" fill="${aura || '#f59e0b'}" opacity="0.18"/><rect x="${ox}" y="${oy + 10}" width="${14 * 14}" height="${18 * 14 + 10}" fill="${aura || '#f59e0b'}" opacity="0.14"/>`;
  const t = (x, y, txt, size, fill, anchor = 'middle') => `<text x="${x}" y="${y}" font-family="monospace" font-weight="bold" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(txt)}</text>`;
  const fila = (y, a, b) => `${t(48, y, a, 16, '#3a2410', 'start')}${t(312, y, b, 16, '#8a4b0f', 'end')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640" shape-rendering="crispEdges">
<rect width="360" height="640" fill="#130e24"/><rect y="40" width="360" height="130" fill="#1a1033"/><rect y="170" width="360" height="120" fill="#2a1b4a"/>
<rect x="296" y="60" width="26" height="26" fill="#f2f0d8"/>${estrellas}<rect y="400" width="360" height="240" fill="#2d3a2a"/><rect y="400" width="360" height="4" fill="#5a8a4a"/>
${halo}${sprite}<rect x="${ox + 1 * 14}" y="${oy + 20 * 14}" width="${12 * 14}" height="6" fill="#000" opacity="0.35"/>
<rect x="10" y="10" width="340" height="620" fill="none" stroke="#f59e0b" stroke-width="6"/><rect x="18" y="18" width="324" height="604" fill="none" stroke="#5e3b14" stroke-width="2"/>
${t(180, 50, 'GYM RPG', 26, '#f59e0b')}${t(180, 74, '¡VICTORIA!', 14, '#ffe08a')}
<rect x="30" y="${oy + 20 * 14 + 28}" width="300" height="${600 - (oy + 20 * 14 + 28)}" fill="#ead9ae" stroke="#5e3b14" stroke-width="6"/><rect x="38" y="${oy + 20 * 14 + 36}" width="284" height="${584 - (oy + 20 * 14 + 28)}" fill="none" stroke="#b8913f" stroke-width="3"/>
${t(180, oy + 20 * 14 + 62, `${perfil.nombre} · NV. ${levelFromXp(perfil.exp || 0).nivel}`, 18, '#3a2410')}
${perfil.jefe ? t(180, oy + 20 * 14 + 82, perfil.jefe.nombre, 12, '#9a2a1a') : ''}
${fila(oy + 20 * 14 + 108, 'Daño total', `${st.dmg || 0} HP`)}${fila(oy + 20 * 14 + 130, 'Tonelaje', `${st.ton || 0} kg`)}${fila(oy + 20 * 14 + 152, 'Series', `${st.series || 0}`)}${fila(oy + 20 * 14 + 174, 'Nuevos PR', `${st.prs || 0}`)}
${item ? t(180, oy + 20 * 14 + 202, `Botín: ${item.nombre}`, 14, '#6a2a8a') : t(180, oy + 20 * 14 + 202, 'Botín: +1 Fragmento de Voluntad', 12, '#1f6b4a')}
${t(180, 614, new Date().toLocaleDateString('es'), 11, '#c9bee8')}</svg>`;
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
