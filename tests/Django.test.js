import { DjangoWeapon } from '../weapons/Django.js';
import { Projectile } from '../entities/Projectile.js';

describe('DjangoWeapon', () => {
  test('초기 maxCooldown 1.5초', () => {
    const w = new DjangoWeapon();
    expect(w.maxCooldown).toBe(1.5);
  });

  test('fire() — Projectile 7개 반환 (부채꼴)', () => {
    const w = new DjangoWeapon();
    w.cooldown = 0;
    const result = w.fire(300, 300, 0, -1);
    expect(result).toHaveLength(7);
    for (const p of result) {
      expect(p).toBeInstanceOf(Projectile);
      expect(p.damage).toBe(12);
    }
  });

  test('7개 투사체가 부채꼴 배치 (오른쪽 ±60도)', () => {
    const w = new DjangoWeapon();
    w.cooldown = 0;
    const result = w.fire(0, 0, 1, 0);
    for (const p of result) {
      const angle = Math.atan2(p.vy, p.vx);
      expect(angle).toBeGreaterThanOrEqual(-Math.PI / 3 - 0.01);
      expect(angle).toBeLessThanOrEqual(Math.PI / 3 + 0.01);
    }
  });
});
