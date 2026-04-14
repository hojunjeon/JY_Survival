import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponBase } from '../weapons/WeaponBase.js';

describe('WeaponBase', () => {
  let weapon;

  beforeEach(() => {
    weapon = new WeaponBase({ damage: 20, cooldown: 1.0 });
  });

  it('생성 시 damage와 cooldown이 설정된다', () => {
    expect(weapon.damage).toBe(20);
    expect(weapon.cooldown).toBe(1.0);
  });

  it('생성 직후에는 발사 가능 상태다', () => {
    expect(weapon.canFire()).toBe(true);
  });

  it('fire() 후에는 쿨다운이 걸린다', () => {
    weapon.fire(0, 0, 1, 0);
    expect(weapon.canFire()).toBe(false);
  });

  it('update()로 쿨다운이 감소한다', () => {
    weapon.fire(0, 0, 1, 0);
    weapon.update(0.5);
    // 쿨다운 1.0초 중 0.5초 경과 — 아직 불가
    expect(weapon.canFire()).toBe(false);
  });

  it('쿨다운이 모두 소진되면 발사 가능 상태로 돌아온다', () => {
    weapon.fire(0, 0, 1, 0);
    weapon.update(1.0);
    expect(weapon.canFire()).toBe(true);
  });

  it('쿨다운 중 fire()를 호출하면 빈 배열을 반환한다', () => {
    weapon.fire(0, 0, 1, 0);
    const result = weapon.fire(0, 0, 1, 0);
    expect(result).toEqual([]);
  });

  it('fire()는 Projectile 배열을 반환한다', () => {
    const projectiles = weapon.fire(100, 200, 1, 0);
    expect(Array.isArray(projectiles)).toBe(true);
    expect(projectiles.length).toBeGreaterThan(0);
  });

  it('fire()로 생성된 투사체는 지정한 위치에서 시작된다', () => {
    const projectiles = weapon.fire(100, 200, 1, 0);
    expect(projectiles[0].x).toBe(100);
    expect(projectiles[0].y).toBe(200);
  });

  it('fire()로 생성된 투사체는 damage를 가진다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    expect(projectiles[0].damage).toBe(20);
  });
});
