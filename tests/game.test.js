import test from 'node:test';
import assert from 'node:assert/strict';
import { xpForLevel, levelFromXp } from '../src/game/levels.js';
import { danoBase, danoFinal, bonoRacha } from '../src/game/combat.js';

test('la EXP por nivel crece', () => { for (let n = 1; n < 20; n++) assert.ok(xpForLevel(n + 1) > xpForLevel(n)); });
test('levelFromXp parte en nivel 1', () => assert.equal(levelFromXp(0).nivel, 1));
test('daño base 100 kg x 5 reps', () => assert.equal(Math.round(danoBase(100, 5)), 402));
test('racha con tope de +25%', () => { assert.equal(bonoRacha(3), 1.15); assert.equal(bonoRacha(10), 1.25); });
test('el crítico multiplica x1.5', () => {
  const a = danoFinal({ peso: 50, reps: 10, clase: 'explorador' });
  const b = danoFinal({ peso: 50, reps: 10, clase: 'explorador', critico: true });
  assert.ok(Math.abs(b - a * 1.5) <= 1);
});
test('el guerrero rinde más en pocas reps y el mago en muchas', () => {
  assert.ok(danoFinal({ peso: 80, reps: 5, clase: 'guerrero' }) > danoFinal({ peso: 80, reps: 5, clase: 'mago' }));
  assert.ok(danoFinal({ peso: 40, reps: 15, clase: 'mago' }) > danoFinal({ peso: 40, reps: 15, clase: 'guerrero' }));
});

import { reconciliar, alRegistrarEntreno, velo } from '../src/game/streak.js';
import { momento } from '../src/game/oakhaven.js';
const base = { racha: 4, elixires: 0, atributos: { fuerza: 10, resistencia: 10, velocidad: 10 }, dias: ['L', 'X', 'V'], ultimoEntreno: '2026-11-16' };

test('un día de descanso no rompe la racha', () => assert.equal(reconciliar(base, '2026-11-18').racha, 4));
test('fallar un día programado rompe la racha', () => assert.equal(reconciliar(base, '2026-11-19').racha, 0));
test('el Elixir protege la racha y se gasta', () => {
  const r = reconciliar({ ...base, elixires: 1 }, '2026-11-19');
  assert.equal(r.racha, 4); assert.equal(r.elixires, 0);
});
test('decay: -1 por día tras más de 3 sin entrenar', () => {
  const r = reconciliar({ ...base, dias: [], ultimoEntreno: '2026-11-10' }, '2026-11-16');
  assert.equal(r.atributos.fuerza, 8);
});
test('no cuenta dos veces los mismos días', () => {
  const p = { ...base, dias: [], ultimoEntreno: '2026-11-10' };
  const a = reconciliar(p, '2026-11-16');
  assert.equal(reconciliar({ ...p, ...a }, '2026-11-16').atributos.fuerza, 8);
});
test('Elixir a los 3 días y luego cada 5, máx. 2', () => {
  assert.equal(alRegistrarEntreno({ racha: 2, elixires: 0 }, '2026-11-16').elixires, 1);
  assert.equal(alRegistrarEntreno({ racha: 7, elixires: 1 }, '2026-11-16').elixires, 2);
  assert.equal(alRegistrarEntreno({ racha: 7, elixires: 2 }, '2026-11-16').elixires, 2);
});
test('Velo de Ceniza y momento del día', () => {
  assert.equal(velo({ ultimoEntreno: '2026-11-10', elixires: 0 }, '2026-11-16'), true);
  assert.equal(velo({ ultimoEntreno: '2026-11-10', elixires: 1 }, '2026-11-16'), false);
  assert.deepEqual([momento(7), momento(15), momento(22), momento(1)], ['alba', 'dia', 'noche', 'noche']);
});

import { EJERCICIOS, MOVIMIENTOS, disponibles, resolver, variantes } from '../src/data/ejercicios.js';
import { nuevoJefe, jefeInfo } from '../src/game/jefes.js';
test('la debilidad del jefe suma 15%', () => {
  const a = danoFinal({ peso: 100, reps: 5, clase: 'mago' });
  const b = danoFinal({ peso: 100, reps: 5, clase: 'mago', debilidad: true });
  assert.ok(Math.abs(b - a * 1.15) <= 1);
});
test('catálogo: 40+ ejercicios y toda categoría tiene opción sin equipo', () => {
  assert.ok(EJERCICIOS.length >= 40);
  for (const c of new Set(EJERCICIOS.map((e) => e.cat))) assert.ok(EJERCICIOS.some((e) => e.cat === c && e.equipo === 'peso_corporal'), c);
});
test('el HP del jefe escala con días y capítulo', () => {
  const a = nuevoJefe({ dias: ['L', 'X', 'V'] }, 1), b = nuevoJefe({ dias: ['L', 'X', 'V', 'S'] }, 1), c = nuevoJefe({ dias: ['L', 'X', 'V'] }, 2);
  assert.ok(b.hp > a.hp && c.hp > a.hp && a.hp === a.hpMax);
  assert.equal(jefeInfo(99).cap, 4);
});

import { valoresIniciales, armarSesion, pasoReps, SERIES } from '../src/game/sesion.js';
const porNombre = (n) => EJERCICIOS.find((e) => e.nombre.startsWith(n));
test('al cambiar a un ejercicio de tiempo sin historial: 30 s y pasos de 5', () => {
  const e = porNombre('Saltos de tijera');
  assert.deepEqual(valoresIniciales(e, {}), { peso: 0, reps: 30 });
  assert.equal(pasoReps(e), 5);
  assert.equal(pasoReps(porNombre('Flexiones')), 1);
});
test('reps por defecto: 10 con carga, 12 con peso corporal; lastre 0', () => {
  assert.equal(valoresIniciales(porNombre('Press de banca'), {}).reps, 10);
  assert.deepEqual(valoresIniciales(porNombre('Flexiones'), {}), { peso: 0, reps: 12 });
});
test('con historial carga la última marca', () => {
  const e = porNombre('Sentadilla con barra');
  assert.deepEqual(valoresIniciales(e, { ultimos: { [e.id]: { peso: 80, reps: 6 } } }), { peso: 80, reps: 6 });
});
test('la rutina del día tiene 4 a 5 ejercicios distintos', () => {
  const s = armarSesion('Pierna', ['mancuernas']);
  assert.ok(s.length >= 4 && s.length <= 5 && new Set(s.map((i) => i.id)).size === s.length);
  assert.equal(SERIES, 4);
});

test('catálogo ampliado: 40+ movimientos, 150+ ejercicios, ids únicos y variante sin equipo en todos', () => {
  assert.ok(MOVIMIENTOS.length >= 40 && EJERCICIOS.length >= 150);
  assert.equal(new Set(EJERCICIOS.map((e) => e.id)).size, EJERCICIOS.length);
  assert.ok(MOVIMIENTOS.every((m) => m.v.peso_corporal));
});
test('cada ejercicio cambia según el equipo del usuario', () => {
  const sent = MOVIMIENTOS.find((m) => m.nombre === 'Sentadilla');
  assert.deepEqual(variantes(sent, ['mancuernas']).map((e) => e.nombre), ['Sentadilla goblet', 'Sentadilla libre']);
  assert.deepEqual(variantes(sent, []).map((e) => e.nombre), ['Sentadilla libre']);
  assert.equal(variantes(sent, ['gimnasio', 'multifuncional', 'mancuernas']).length, 4);
  assert.equal(resolver({ id: sent.id, eq: 'gimnasio' }, ['mancuernas']).nombre, 'Sentadilla goblet');
  assert.deepEqual(disponibles(['mancuernas']), ['mancuernas', 'peso_corporal']);
});
test('la rutina rota cada día y usa tu equipo', () => {
  const a = armarSesion('Pierna', ['mancuernas'], new Date(2026, 10, 17)), b = armarSesion('Pierna', ['mancuernas'], new Date(2026, 10, 18));
  assert.notEqual(a[0].id, b[0].id);
  assert.ok(a.every((i) => ['mancuernas', 'peso_corporal'].includes(i.eq)));
});

import { PATRONES, SLOTS, movsDe } from '../src/data/patrones.js';
test('todos los patrones resuelven movimientos y cada categoría tiene 5 slots', () => {
  for (const p of Object.keys(PATRONES)) assert.equal(movsDe(p).length, PATRONES[p].length, p);
  for (const [c, s] of Object.entries(SLOTS)) assert.equal(s.length, 5, c);
});
test('ninguna sesión repite movimiento, en ninguna categoría ni día', () => {
  for (const c of Object.keys(SLOTS)) for (let d = 0; d < 12; d++) {
    const s = armarSesion(c, ['gimnasio', 'mancuernas'], new Date(2026, 10, 1 + d));
    assert.equal(new Set(s.map((i) => i.id)).size, 5, `${c} día ${d}`);
  }
});
test('Full body: cuádriceps, bisagra, empuje, tracción y metabólico', () => {
  const s = armarSesion('Full body', ['gimnasio', 'multifuncional', 'mancuernas']);
  const en = (i, patron) => movsDe(patron).some((m) => m.id === s[i].id);
  assert.ok(en(0, 'cuadriceps_fb') && en(1, 'bisagra_fb') && en(2, 'empuje') && en(3, 'traccion') && en(4, 'metabolico'));
});
test('con varias herramientas: carga al inicio y dinámico al final', () => {
  const s = armarSesion('Full body', ['gimnasio', 'multifuncional', 'mancuernas']);
  assert.equal(s[0].eq, 'gimnasio');
  assert.equal(s[4].eq, 'peso_corporal');
  assert.equal(armarSesion('Full body', ['mancuernas'])[0].eq, 'mancuernas');
});

import { ITEMS, INVENTARIO_INICIAL, tirarBotin, aspecto, porId } from '../src/data/armeria.js';
test('Armería: ids únicos, piezas iniciales y apariencia equipada', () => {
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  assert.ok(INVENTARIO_INICIAL.every((id) => porId(id)));
  assert.deepEqual(aspecto({ equipado: { pechera: 'pechera-3', aura: 'aura-4' } }), { tintes: { pechera: '#4a6cf0' }, aura: '#f97316' });
  assert.deepEqual(aspecto({}), { tintes: {} });
});
test('Cofre: con suerte máxima cae un Mítico; sin suerte no cae pieza', () => {
  assert.equal(tirarBotin(INVENTARIO_INICIAL, () => 0).tier, 5);
  assert.equal(tirarBotin(INVENTARIO_INICIAL, () => 0.99), null);
});
test('Cofre: no repite piezas que ya tienes', () => {
  const todo = ITEMS.map((i) => i.id);
  assert.equal(tirarBotin(todo, () => 0), null);
  const sin = todo.filter((id) => id !== 'aura-2');
  assert.equal(tirarBotin(sin, () => 0.2).id, 'aura-2');
});
