export const TIERS = { 1: 'COMÚN', 2: 'RARO', 3: 'ÉPICO', 4: 'LEGENDARIO', 5: 'MÍTICO' };
export const SLOTS_EQ = [['pechera', 'PECHERA'], ['capa', 'CAPA'], ['botas', 'BOTAS'], ['aura', 'AURA']];
// Probabilidad de que un cofre suelte una pieza de ese tier (se tira de mayor a menor)
export const DROP = { 5: 0.015, 4: 0.05, 3: 0.15, 2: 0.3 };

// ranura | tier | nombre | color
const RAW = `pechera|1|Túnica de aprendiz|#c98f63
pechera|2|Cuero reforzado|#7a5230
pechera|3|Cota azul|#4a6cf0
pechera|4|Armadura carmesí|#b3392b
pechera|5|Set dorado del Alba|#f2c14e
capa|1|Capa raída|#6b6b78
capa|2|Capa del bosque|#2f6b3a
capa|3|Capa del cielo|#3b82f6
capa|4|Capa carmesí|#c0392b
capa|5|Manto estelar|#8a5cff
botas|1|Botas de viaje|#5b3a22
botas|2|Botas de cuero|#8a5a2b
botas|3|Botas de acero|#7a8396
botas|4|Botas de fuego|#ef4444
botas|5|Botas del Alba|#f2c14e
aura|2|Aura cobalto|#3b82f6
aura|3|Aura esmeralda|#10b981
aura|4|Aura volcánica|#f97316
aura|5|Aura suprema|#ffe08a`;
export const ITEMS = RAW.split('\n').map((l) => {
  const [slot, tier, nombre, color] = l.split('|');
  return { id: `${slot}-${tier}`, slot, tier: Number(tier), nombre, color };
});
export const porId = (id) => ITEMS.find((i) => i.id === id) || null;
export const INVENTARIO_INICIAL = ['pechera-1', 'capa-1', 'botas-1'];

// Cofre: siempre da 1 Fragmento de Voluntad y, con suerte, una pieza nueva
export function tirarBotin(inventario, rnd = Math.random) {
  for (const tier of [5, 4, 3, 2]) {
    if (rnd() < DROP[tier]) {
      const libres = ITEMS.filter((i) => i.tier === tier && !inventario.includes(i.id));
      if (libres.length) return libres[Math.floor(rnd() * libres.length)];
    }
  }
  return null;
}
// Apariencia del avatar según lo equipado (solo incluye lo que hay)
export function aspecto(perfil) {
  const eq = perfil.equipado || {};
  const tintes = {};
  for (const s of ['pechera', 'capa', 'botas']) { const it = porId(eq[s]); if (it) tintes[s] = it.color; }
  const aura = porId(eq.aura)?.color;
  return aura ? { tintes, aura } : { tintes };
}
