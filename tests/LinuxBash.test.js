import { LinuxBashWeapon } from '../weapons/LinuxBash.js';

describe('LinuxBashWeapon', () => {
  test('초기 maxCooldown 8초', () => {
    const w = new LinuxBashWeapon();
    expect(w.maxCooldown).toBe(8);
  });

  test('fire() — isUlt 시그널 반환', () => {
    const w = new LinuxBashWeapon();
    w.cooldown = 0;
    const result = w.fire(0, 0, 1, 0);
    expect(result).toHaveLength(1);
    expect(result[0].isUlt).toBe(true);
    expect(result[0].damage).toBe(60);
  });

  test('fire() 후 쿨타임 8초로 리셋', () => {
    const w = new LinuxBashWeapon();
    w.cooldown = 0;
    w.fire(0, 0, 1, 0);
    expect(w.cooldown).toBe(8);
  });
});
