import { JavaScriptWeapon } from '../weapons/JavaScript.js';
import { Projectile } from '../entities/Projectile.js';

describe('JavaScriptWeapon', () => {
  test('초기 maxCooldown 0.6초', () => {
    const w = new JavaScriptWeapon();
    expect(w.maxCooldown).toBe(0.6);
  });

  test('fire() — Projectile 3개 반환 (랜덤)', () => {
    const w = new JavaScriptWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 1, 0);
    expect(result).toHaveLength(3);
    for (const p of result) {
      expect(p).toBeInstanceOf(Projectile);
      expect(p.damage).toBe(12);
    }
  });

  test('3개 투사체 속도 280', () => {
    const w = new JavaScriptWeapon();
    w.cooldown = 0;
    const result = w.fire(0, 0, 1, 0);
    const speeds = result.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy));
    for (const s of speeds) expect(s).toBeCloseTo(280, 0);
  });
});
