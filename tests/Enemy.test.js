import { describe, it, expect, beforeEach } from 'vitest';
import { Enemy, createEnemy } from '../entities/Enemy.js';

describe('Enemy 기반 클래스', () => {
  let enemy;

  beforeEach(() => {
    enemy = new Enemy(200, 150, { hp: 40, speed: 80, contactDamage: 10 });
  });

  it('초기 위치를 생성자에서 설정한다', () => {
    expect(enemy.x).toBe(200);
    expect(enemy.y).toBe(150);
  });

  it('충돌박스는 32×32이다', () => {
    expect(enemy.width).toBe(32);
    expect(enemy.height).toBe(32);
  });

  it('생성 시 isDead는 false다', () => {
    expect(enemy.isDead).toBe(false);
  });

  it('데미지를 받으면 HP가 줄어든다', () => {
    enemy.takeDamage(15);
    expect(enemy.hp).toBe(25);
  });

  it('HP가 0이 되면 isDead가 true가 된다', () => {
    enemy.takeDamage(40);
    expect(enemy.isDead).toBe(true);
  });

  it('HP는 0 미만이 되지 않는다', () => {
    enemy.takeDamage(9999);
    expect(enemy.hp).toBe(0);
  });

  it('타깃 방향으로 이동한다', () => {
    const before = { x: enemy.x, y: enemy.y };
    enemy.update(1, 400, 150); // 오른쪽 타깃
    expect(enemy.x).toBeGreaterThan(before.x);
    expect(enemy.y).toBe(before.y);
  });

  it('dt=0이면 위치가 변하지 않는다', () => {
    enemy.update(0, 400, 300);
    expect(enemy.x).toBe(200);
    expect(enemy.y).toBe(150);
  });

  it('speed px/s 속도로 이동한다', () => {
    enemy.update(1, 1000, 150); // 오른쪽으로만 이동
    expect(enemy.x).toBeCloseTo(200 + 80, 0);
  });
});

describe('createEnemy 팩토리', () => {
  it('SyntaxError 적을 생성한다', () => {
    const e = createEnemy('syntax_error', 100, 100);
    expect(e.type).toBe('syntax_error');
    expect(e.hp).toBeGreaterThan(0);
    expect(e.contactDamage).toBeGreaterThan(0);
  });

  it('NullPointerException 적을 생성한다', () => {
    const e = createEnemy('null_pointer', 100, 100);
    expect(e.type).toBe('null_pointer');
    expect(e.hp).toBeGreaterThan(0);
  });

  it('SegFault 적을 생성한다', () => {
    const e = createEnemy('seg_fault', 100, 100);
    expect(e.type).toBe('seg_fault');
    expect(e.hp).toBeGreaterThan(0);
  });

  it('HealBug 적을 생성한다', () => {
    const e = createEnemy('heal_bug', 100, 100);
    expect(e.type).toBe('heal_bug');
    expect(e.contactDamage).toBe(0);
    expect(e.dropsHpItem).toBe(true);
  });
});

describe('적 타입별 스탯', () => {
  it('SegFault는 SyntaxError보다 HP가 높다', () => {
    const seg = createEnemy('seg_fault', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(seg.hp).toBeGreaterThan(syn.hp);
  });

  it('NullPointerException은 SyntaxError보다 빠르다', () => {
    const npe = createEnemy('null_pointer', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(npe.speed).toBeGreaterThan(syn.speed);
  });

  it('SegFault는 SyntaxError보다 contactDamage가 높다', () => {
    const seg = createEnemy('seg_fault', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(seg.contactDamage).toBeGreaterThan(syn.contactDamage);
  });

  it('HealBug는 플레이어로부터 멀어진다', () => {
    const bug = createEnemy('heal_bug', 200, 150);
    bug.update(1, 400, 150); // 플레이어가 오른쪽
    expect(bug.x).toBeLessThan(200); // 왼쪽으로 도망
  });
});
