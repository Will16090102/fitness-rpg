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
