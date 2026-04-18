import { SQLWeapon } from '../weapons/SQL.js';
import { Projectile } from '../entities/Projectile.js';

describe('SQLWeapon', () => {
  test('초기 maxCooldown 4초', () => {
    const w = new SQLWeapon();
    expect(w.maxCooldown).toBe(4);
  });

  test('fire() — Projectile 1개 반환 (레이저)', () => {
    const w = new SQLWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 0, -1);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Projectile);
    expect(result[0].damage).toBe(35);
    expect(result[0].piercing).toBe(true);
  });

  test('투사체가 마우스 방향으로 발사된다', () => {
    const w = new SQLWeapon();
    w.cooldown = 0;
    const result = w.fire(0, 0, 1, 0);
    expect(result[0].vx).toBeGreaterThan(0);
    expect(result[0].vy).toBeCloseTo(0, 1);
  });
});
