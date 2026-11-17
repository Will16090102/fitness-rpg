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
  const s = armarSesion(MOVIMIENTOS.filter((m) => m.cat === 'Pierna'), ['mancuernas']);
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
  const movs = MOVIMIENTOS.filter((m) => m.cat === 'Pierna');
  const a = armarSesion(movs, ['mancuernas'], new Date(2026, 10, 17)), b = armarSesion(movs, ['mancuernas'], new Date(2026, 10, 18));
  assert.notEqual(a[0].id, b[0].id);
  assert.ok(a.every((i) => ['mancuernas', 'peso_corporal'].includes(i.eq)));
});
