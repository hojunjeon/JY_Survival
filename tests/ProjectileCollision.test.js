import { describe, it, expect, beforeEach } from 'vitest';
import { Projectile } from '../entities/Projectile.js';
import { createEnemy } from '../entities/Enemy.js';
import { checkCollision } from '../core/Collision.js';

describe('투사체 ↔ 적 충돌', () => {
  it('투사체와 적이 겹치면 checkCollision이 true를 반환한다', () => {
    const proj = new Projectile(100, 100, 0, 0, 10);
    const enemy = createEnemy('syntax_error', 100, 100);
    expect(checkCollision(proj, enemy)).toBe(true);
  });

  it('투사체와 적이 떨어져 있으면 checkCollision이 false를 반환한다', () => {
    const proj = new Projectile(0, 0, 0, 0, 10);
    const enemy = createEnemy('syntax_error', 500, 500);
    expect(checkCollision(proj, enemy)).toBe(false);
  });

  it('비관통 투사체는 적과 충돌 시 비활성화된다', () => {
    const proj = new Projectile(100, 100, 0, 0, 10, { piercing: false });
    const enemy = createEnemy('syntax_error', 100, 100);

    if (checkCollision(proj, enemy)) {
      enemy.takeDamage(proj.damage);
      if (!proj.piercing) proj.deactivate();
    }

    expect(proj.active).toBe(false);
  });

  it('관통 투사체는 적과 충돌해도 활성 상태를 유지한다', () => {
    const proj = new Projectile(100, 100, 0, 0, 10, { piercing: true });
    const enemy = createEnemy('syntax_error', 100, 100);

    if (checkCollision(proj, enemy)) {
      enemy.takeDamage(proj.damage);
      // piercing이면 deactivate 하지 않음
    }

    expect(proj.active).toBe(true);
  });

  it('투사체가 적에게 데미지를 준다', () => {
    const proj = new Projectile(100, 100, 0, 0, 10);
    const enemy = createEnemy('syntax_error', 100, 100); // hp: 24

    if (checkCollision(proj, enemy)) {
      enemy.takeDamage(proj.damage);
    }

    expect(enemy.hp).toBe(14); // 24 - 10
  });

  it('투사체 데미지로 적 HP가 0이 되면 isDead가 된다', () => {
    const proj = new Projectile(100, 100, 0, 0, 9999);
    const enemy = createEnemy('syntax_error', 100, 100);

    if (checkCollision(proj, enemy)) {
      enemy.takeDamage(proj.damage);
    }

    expect(enemy.isDead).toBe(true);
  });
});

describe('오비탈 오브 ↔ 적 충돌', () => {
  it('오브 위치와 적이 겹치면 데미지를 준다', () => {
    const enemy = createEnemy('syntax_error', 100, 100);
    const hpBefore = enemy.hp;
    const orbDamage = 10;

    // 오브 위치를 적과 동일하게 설정
    const orb = { x: 100, y: 100, width: 16, height: 16, damage: orbDamage };

    if (checkCollision(orb, enemy)) {
      enemy.takeDamage(orb.damage);
    }

    expect(enemy.hp).toBe(hpBefore - orbDamage);
  });
});
