import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Boss } from '../entities/Boss.js';

describe('Boss 초기 상태', () => {
  let boss;

  beforeEach(() => {
    boss = new Boss(400, 300);
  });

  it('초기 HP는 500이다', () => {
    expect(boss.hp).toBe(500);
    expect(boss.maxHp).toBe(500);
  });

  it('초기 페이즈는 1이다', () => {
    expect(boss.phase).toBe(1);
  });

  it('초기 isDead는 false다', () => {
    expect(boss.isDead).toBe(false);
  });

  it('초기 위치가 설정된다', () => {
    expect(boss.x).toBe(400);
    expect(boss.y).toBe(300);
  });

  it('너비와 높이는 64이다', () => {
    expect(boss.width).toBe(64);
    expect(boss.height).toBe(64);
  });

  it('type은 boss다', () => {
    expect(boss.type).toBe('boss');
  });

  it('shootCooldown은 0으로 시작한다', () => {
    expect(boss.shootCooldown).toBe(0);
  });
});

describe('Boss.takeDamage()', () => {
  let boss;

  beforeEach(() => {
    boss = new Boss(400, 300);
  });

  it('데미지만큼 HP가 감소한다', () => {
    boss.takeDamage(100);
    expect(boss.hp).toBe(400);
  });

  it('HP는 0 미만으로 내려가지 않는다', () => {
    boss.takeDamage(9999);
    expect(boss.hp).toBe(0);
  });

  it('HP가 0이 되면 isDead가 true가 된다', () => {
    boss.takeDamage(500);
    expect(boss.isDead).toBe(true);
  });

  it('HP가 0보다 크면 isDead는 false다', () => {
    boss.takeDamage(100);
    expect(boss.isDead).toBe(false);
  });
});

describe('Boss 페이즈 전환', () => {
  let boss;

  beforeEach(() => {
    boss = new Boss(400, 300);
  });

  it('HP 50% 초과일 때 페이즈는 1이다', () => {
    boss.takeDamage(249); // HP 251 → 50.2%
    boss.updatePhase();
    expect(boss.phase).toBe(1);
  });

  it('HP가 정확히 50%이면 페이즈 2로 전환된다', () => {
    boss.takeDamage(250); // HP 250 → 50%
    boss.updatePhase();
    expect(boss.phase).toBe(2);
  });

  it('HP 50% 미만이면 페이즈 2로 전환된다', () => {
    boss.takeDamage(300); // HP 200 → 40%
    boss.updatePhase();
    expect(boss.phase).toBe(2);
  });

  it('페이즈 2 돌입은 1번만 발생한다', () => {
    boss.takeDamage(300);
    const n1 = boss.updatePhase();
    const n2 = boss.updatePhase();
    const transitions = [n1, n2].filter(n => n === true);
    expect(transitions.length).toBe(1);
  });
});

describe('Boss 이동', () => {
  let boss;

  beforeEach(() => {
    boss = new Boss(0, 0);
  });

  it('1페이즈에서 플레이어를 향해 이동한다', () => {
    boss.update(1, 100, 0);
    expect(boss.x).toBeGreaterThan(0);
  });

  it('2페이즈에서는 더 빠르게 이동한다', () => {
    const boss1 = new Boss(0, 0);
    const boss2 = new Boss(0, 0);
    boss2.phase = 2;
    boss1.update(1, 100, 0);
    boss2.update(1, 100, 0);
    expect(boss2.x).toBeGreaterThan(boss1.x);
  });

  it('dt가 0이면 이동하지 않는다', () => {
    boss.update(0, 100, 0);
    expect(boss.x).toBe(0);
  });
});

describe('Boss 투사체 발사', () => {
  let boss;

  beforeEach(() => {
    boss = new Boss(400, 300);
    // shootCooldown을 0으로 설정해 즉시 발사 가능
    boss.shootCooldown = 0;
  });

  it('1페이즈에서 shoot()은 3방향 투사체를 반환한다', () => {
    boss.phase = 1;
    const projectiles = boss.shoot(400, 0); // 위쪽 플레이어
    expect(projectiles).toHaveLength(3);
  });

  it('2페이즈에서 shoot()은 5방향 투사체를 반환한다', () => {
    boss.phase = 2;
    const projectiles = boss.shoot(400, 0);
    expect(projectiles).toHaveLength(5);
  });

  it('투사체는 x, y, vx, vy, damage 속성을 가진다', () => {
    const projectiles = boss.shoot(400, 0);
    const p = projectiles[0];
    expect(p).toHaveProperty('x');
    expect(p).toHaveProperty('y');
    expect(p).toHaveProperty('vx');
    expect(p).toHaveProperty('vy');
    expect(p).toHaveProperty('damage');
  });

  it('투사체 데미지는 양수다', () => {
    const projectiles = boss.shoot(400, 0);
    projectiles.forEach(p => expect(p.damage).toBeGreaterThan(0));
  });

  it('쿨다운 중에는 shoot()이 빈 배열을 반환한다', () => {
    boss.shootCooldown = 1;
    const projectiles = boss.shoot(400, 0);
    expect(projectiles).toHaveLength(0);
  });
});

describe('Boss 대사', () => {
  let boss;

  beforeEach(() => {
    boss = new Boss(400, 300);
  });

  it('등장 대사를 반환한다', () => {
    const line = boss.getDialogue('appear');
    expect(line).toContain('이깁니다');
  });

  it('2페이즈 대사를 반환한다', () => {
    const line = boss.getDialogue('phase2');
    expect(line).toContain('억울');
  });

  it('처치 대사를 반환한다', () => {
    const line = boss.getDialogue('death');
    expect(line).toContain('억울');
  });

  it('도발 대사를 반환한다', () => {
    const line = boss.getDialogue('taunt');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  it('알 수 없는 대사 키는 빈 문자열을 반환한다', () => {
    const line = boss.getDialogue('unknown_key');
    expect(line).toBe('');
  });
});

describe('Boss.update() — 쿨다운 감소', () => {
  it('update 시 shootCooldown이 감소한다', () => {
    const boss = new Boss(400, 300);
    boss.shootCooldown = 2;
    boss.update(1, 400, 0);
    expect(boss.shootCooldown).toBeLessThan(2);
  });

  it('shootCooldown은 0 미만으로 내려가지 않는다', () => {
    const boss = new Boss(400, 300);
    boss.shootCooldown = 0;
    boss.update(5, 400, 0);
    expect(boss.shootCooldown).toBeGreaterThanOrEqual(0);
  });
});
