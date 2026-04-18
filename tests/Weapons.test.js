import { describe, it, expect, beforeEach } from 'vitest';
import { PythonWeapon } from '../weapons/Python.js';
import { CWeapon } from '../weapons/C.js';
import { JavaWeapon } from '../weapons/Java.js';

// ─── Python 무기 ────────────────────────────────────────────────────────────
describe('PythonWeapon', () => {
  let weapon;

  beforeEach(() => {
    weapon = new PythonWeapon();
  });

  it('이름이 Python이다', () => {
    expect(weapon.name).toBe('Python');
  });

  it('fire() 시 3방향 투사체 3개를 반환한다 (homing)', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    expect(projectiles.length).toBe(3);
  });

  it('3개의 투사체가 homing 플래그를 가진다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    projectiles.forEach(p => expect(p.homing).toBe(true));
  });

  it('투사체 속도는 150 이하다 (느림)', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    projectiles.forEach(p => {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      expect(speed).toBeLessThanOrEqual(150);
    });
  });

  it('투사체 damage는 0보다 크다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    projectiles.forEach(p => expect(p.damage).toBeGreaterThan(0));
  });

  it('쿨다운이 있다', () => {
    expect(weapon.cooldown).toBeGreaterThan(0);
  });

  it('투사체는 관통하지 않는다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    projectiles.forEach(p => expect(p.piercing).toBe(false));
  });
});

// ─── C 무기 ──────────────────────────────────────────────────────────────────
describe('CWeapon', () => {
  let weapon;

  beforeEach(() => {
    weapon = new CWeapon();
  });

  it('이름이 C/C++이다', () => {
    expect(weapon.name).toBe('C/C++');
  });

  it('fire() 시 단일 투사체 1개를 반환한다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    expect(projectiles.length).toBe(1);
  });

  it('투사체가 지정한 방향으로 이동한다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0); // 오른쪽
    expect(projectiles[0].vx).toBeGreaterThan(0);
    expect(projectiles[0].vy).toBeCloseTo(0, 1);
  });

  it('투사체 속도가 300 이상이다 (고속)', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    const speed = Math.sqrt(projectiles[0].vx ** 2 + projectiles[0].vy ** 2);
    expect(speed).toBeGreaterThanOrEqual(300);
  });

  it('투사체가 관통한다', () => {
    const projectiles = weapon.fire(0, 0, 1, 0);
    expect(projectiles[0].piercing).toBe(true);
  });

  it('damage는 PythonWeapon보다 높다', () => {
    const python = new PythonWeapon();
    const cProj = weapon.fire(0, 0, 1, 0)[0];
    const pyProj = python.fire(0, 0, 1, 0)[0];
    expect(cProj.damage).toBeGreaterThan(pyProj.damage);
  });

  it('쿨다운이 PythonWeapon보다 짧다', () => {
    const python = new PythonWeapon();
    expect(weapon.cooldown).toBeLessThan(python.cooldown);
  });
});

// ─── Java 무기 ───────────────────────────────────────────────────────────────
describe('JavaWeapon', () => {
  let weapon;

  beforeEach(() => {
    weapon = new JavaWeapon();
  });

  it('이름이 Java다', () => {
    expect(weapon.name).toBe('Java');
  });

  it('초기화 시 3개의 오비탈 오브를 가진다', () => {
    expect(weapon.orbs.length).toBe(3);
  });

  it('각 오브는 angle, radius, damage 속성을 가진다', () => {
    weapon.orbs.forEach(orb => {
      expect(typeof orb.angle).toBe('number');
      expect(orb.radius).toBeGreaterThan(0);
      expect(orb.damage).toBeGreaterThan(0);
    });
  });

  it('update 시 오브가 회전한다', () => {
    const angleBefore = weapon.orbs[0].angle;
    weapon.update(0.1);
    expect(weapon.orbs[0].angle).not.toBe(angleBefore);
  });

  it('getOrbPositions(px, py)는 플레이어 기준 오브 좌표를 반환한다', () => {
    const positions = weapon.getOrbPositions(100, 100);
    expect(positions.length).toBe(3);
    positions.forEach(pos => {
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    });
  });

  it('오브 좌표는 플레이어로부터 radius 거리에 있다', () => {
    const positions = weapon.getOrbPositions(0, 0);
    positions.forEach((pos, i) => {
      const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2);
      expect(dist).toBeCloseTo(weapon.orbs[i].radius, 0);
    });
  });

  it('3개의 오브 초기 각도는 서로 120도 차이다', () => {
    const angles = weapon.orbs.map(o => o.angle);
    const diff01 = Math.abs(angles[1] - angles[0]);
    const diff12 = Math.abs(angles[2] - angles[1]);
    expect(diff01).toBeCloseTo((2 * Math.PI) / 3, 2);
    expect(diff12).toBeCloseTo((2 * Math.PI) / 3, 2);
  });

  it('fire()는 빈 배열을 반환한다 (오비탈은 투사체를 발사하지 않는다)', () => {
    const result = weapon.fire(0, 0, 1, 0);
    expect(result).toEqual([]);
  });

  it('canFire()는 항상 false다 (오비탈 무기는 지속 방식)', () => {
    expect(weapon.canFire()).toBe(false);
  });
});
