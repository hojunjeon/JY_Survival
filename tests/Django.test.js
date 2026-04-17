import { DjangoWeapon } from '../weapons/Django.js';
import { Projectile } from '../entities/Projectile.js';

describe('DjangoWeapon', () => {
  test('초기 maxCooldown 2초', () => {
    const w = new DjangoWeapon();
    expect(w.maxCooldown).toBe(2);
  });

  test('fire() — Projectile 5개 반환', () => {
    const w = new DjangoWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 0, -1);
    expect(result).toHaveLength(5);
    for (const p of result) {
      expect(p).toBeInstanceOf(Projectile);
      expect(p.damage).toBe(15);
    }
  });

  test('5개 투사체가 부채꼴 배치 (오른쪽 ±45도)', () => {
    const w = new DjangoWeapon();
    w.cooldown = 0;
    const result = w.fire(0, 0, 1, 0);
    for (const p of result) {
      const angle = Math.atan2(p.vy, p.vx);
      expect(angle).toBeGreaterThanOrEqual(-Math.PI / 4 - 0.01);
      expect(angle).toBeLessThanOrEqual(Math.PI / 4 + 0.01);
    }
  });
});
