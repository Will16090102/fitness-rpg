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
