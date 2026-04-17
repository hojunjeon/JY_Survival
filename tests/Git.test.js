import { GitWeapon } from '../weapons/Git.js';

describe('GitWeapon', () => {
  test('초기 maxCooldown 4초', () => {
    const w = new GitWeapon();
    expect(w.maxCooldown).toBe(4);
  });

  test('fire() — isAreaEffect 객체 반환', () => {
    const w = new GitWeapon();
    w.cooldown = 0;
    const result = w.fire(100, 200, 0, 1);
    expect(result).toHaveLength(1);
    expect(result[0].isAreaEffect).toBe(true);
    expect(result[0].radius).toBe(120);
    expect(result[0].damage).toBe(25);
    expect(result[0].cx).toBe(100);
    expect(result[0].cy).toBe(200);
  });

  test('fire() 후 쿨타임 리셋', () => {
    const w = new GitWeapon();
    w.cooldown = 0;
    w.fire(0, 0, 1, 0);
    expect(w.cooldown).toBe(4);
  });
});
