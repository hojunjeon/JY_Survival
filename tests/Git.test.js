import { GitWeapon } from '../weapons/Git.js';

describe('GitWeapon', () => {
  test('초기 maxCooldown 3초', () => {
    const w = new GitWeapon();
    expect(w.maxCooldown).toBe(3);
  });

  test('fire() — 폭발 투사체 1개 + 8방향 투사체 8개 반환 (총 9개)', () => {
    const w = new GitWeapon();
    w.cooldown = 0;
    const result = w.fire(100, 200, 0, 1);
    expect(result).toHaveLength(9);
    expect(result[0].isAreaEffect).toBe(true);
    expect(result[0].areaRadius).toBe(150);
    expect(result[0].damage).toBe(40);
  });

  test('fire() 후 쿨타임 리셋', () => {
    const w = new GitWeapon();
    w.cooldown = 0;
    w.fire(0, 0, 1, 0);
    expect(w.cooldown).toBe(3);
  });
});
