import { SQLWeapon } from '../weapons/SQL.js';
import { Projectile } from '../entities/Projectile.js';

describe('SQLWeapon', () => {
  test('초기 maxCooldown 5초', () => {
    const w = new SQLWeapon();
    expect(w.maxCooldown).toBe(5);
  });

  test('fire() — Projectile 3개 반환', () => {
    const w = new SQLWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 0, -1);
    expect(result).toHaveLength(3);
    for (const p of result) {
      expect(p).toBeInstanceOf(Projectile);
      expect(p.damage).toBe(20);
    }
  });

  test('3개 투사체가 다른 x 위치에서 출발', () => {
    const w = new SQLWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 0, -1);
    const xs = result.map(p => p.x);
    expect(new Set(xs).size).toBe(3);
  });
});
