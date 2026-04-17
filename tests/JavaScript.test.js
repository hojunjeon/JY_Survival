import { JavaScriptWeapon } from '../weapons/JavaScript.js';
import { Projectile } from '../entities/Projectile.js';

describe('JavaScriptWeapon', () => {
  test('초기 maxCooldown 0.8초', () => {
    const w = new JavaScriptWeapon();
    expect(w.maxCooldown).toBe(0.8);
  });

  test('fire() — Projectile 5개 반환', () => {
    const w = new JavaScriptWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 1, 0);
    expect(result).toHaveLength(5);
    for (const p of result) {
      expect(p).toBeInstanceOf(Projectile);
      expect(p.damage).toBe(8);
    }
  });

  test('5개 투사체 속도 250', () => {
    const w = new JavaScriptWeapon();
    w.cooldown = 0;
    const result = w.fire(0, 0, 1, 0);
    const speeds = result.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy));
    for (const s of speeds) expect(s).toBeCloseTo(250, 0);
  });
});
