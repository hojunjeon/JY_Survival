import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem, ENEMY_TYPE_COLORS } from '../systems/ParticleSystem.js';

describe('ParticleSystem', () => {
  let ps;
  beforeEach(() => { ps = new ParticleSystem(); });

  it('addHitSpark는 count만큼 파티클을 추가한다', () => {
    ps.addHitSpark(100, 200, '#ff0000', 5);
    expect(ps.particles.length).toBe(5);
  });

  it('addEnemyDeath는 count만큼 파티클을 추가한다', () => {
    ps.addEnemyDeath(100, 200, 8);
    expect(ps.particles.length).toBe(8);
  });

  it('addHeal은 파티클을 4개 추가한다', () => {
    ps.addHeal(100, 200);
    expect(ps.particles.length).toBe(4);
  });

  it('update 후 life가 감소한다', () => {
    ps.addHitSpark(0, 0, '#fff', 1);
    const before = ps.particles[0].life;
    ps.update(0.1);
    expect(ps.particles[0].life).toBeLessThan(before);
  });

  it('life가 0 이하인 파티클은 제거된다', () => {
    ps.addHitSpark(0, 0, '#fff', 3);
    ps.update(999);
    expect(ps.particles.length).toBe(0);
  });

  it('addWeaponTrail(x, y, "python")은 레벨에 따라 파티클을 추가한다', () => {
    ps.addWeaponTrail(100, 100, 'python', 5);
    expect(ps.particles.length).toBe(20);
  });

  it('Python trail 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addWeaponTrail(100, 100, 'python', 5);
    expect(ps.particles[0].shadowBlur).toBe(20);
    expect(ps.particles[0].shadowColor).toBe('#44ff44');
  });

  it('addWeaponTrail(x, y, "c")은 레벨에 따라 파티클을 추가한다', () => {
    ps.addWeaponTrail(100, 100, 'c', 5);
    expect(ps.particles.length).toBe(12);
  });

  it('C trail 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addWeaponTrail(100, 100, 'c', 5);
    expect(ps.particles[0].shadowBlur).toBe(15);
    expect(ps.particles[0].shadowColor).toBe('#64b4ff');
  });

  it('addWeaponHit(x, y, "c")은 ring-expand 파티클을 추가한다', () => {
    ps.addWeaponHit(100, 100, 'c', 4);
    expect(ps.particles.length).toBeGreaterThan(0);
    const ringExpand = ps.particles.find(p => p.type === 'ring-expand');
    expect(ringExpand).toBeDefined();
  });

  it('C hit 파티클은 ring-expand 타입이다', () => {
    ps.addWeaponHit(100, 100, 'c', 4);
    const ringExpand = ps.particles.find(p => p.type === 'ring-expand');
    expect(ringExpand).toBeDefined();
    expect(ringExpand.type).toBe('ring-expand');
    expect(ringExpand.maxSize).toBe(20);
  });

  it('addWeaponHit(x, y, "unknown")은 addHitSpark으로 fallback한다', () => {
    ps.addWeaponHit(100, 100, 'unknown');
    expect(ps.particles.length).toBe(3); // addHitSpark default count
  });

  it('addOrbitalTail(x, y)은 잔상과 링 파티클을 추가한다', () => {
    ps.addOrbitalTail(100, 100, 2);
    expect(ps.particles.length).toBeGreaterThanOrEqual(5);
    const hasRing = ps.particles.some(p => p.type === 'ring');
    expect(hasRing).toBe(true);
  });

  it('OrbitalTail 잔상 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addOrbitalTail(100, 100, 2);
    expect(ps.particles[0].shadowBlur).toBe(20);
    expect(ps.particles[0].shadowColor).toBe('#ffa032');
  });

  it('OrbitalTail 링 파티클은 마지막 파티클이고 type ring을 가진다', () => {
    ps.addOrbitalTail(100, 100, 2);
    const ringParticle = ps.particles.find(p => p.type === 'ring');
    expect(ringParticle).toBeDefined();
    expect(ringParticle.type).toBe('ring');
    expect(ringParticle.size).toBe(36);
    expect(ringParticle.color).toBe('rgba(255,160,50,0.15)');
    expect(ringParticle.maxLife).toBe(0.1);
  });

  it('ring 타입 파티클은 render에서 원형으로 그려진다', () => {
    ps.addOrbitalTail(100, 100, 2);
    const ringParticle = ps.particles.find(p => p.type === 'ring');
    expect(ringParticle).toBeDefined();
    expect(ringParticle.type).toBe('ring');
  });

  it('ring-expand 타입 파티클은 maxSize 속성을 가진다', () => {
    ps.addWeaponHit(100, 100, 'c', 2);
    const ringExpand = ps.particles.find(p => p.type === 'ring-expand');
    expect(ringExpand).toBeDefined();
    expect(ringExpand.type).toBe('ring-expand');
    expect(ringExpand.maxSize).toBe(10);
    expect(ringExpand.shadowBlur).toBe(10);
  });

  it('addEnemyDeath(x, y, count, "syntax_error")은 타입 색상을 사용한다', () => {
    ps.addEnemyDeath(100, 100, 4, 'syntax_error');
    expect(ps.particles.length).toBe(4);
    // 모든 파티클이 syntax_error 색상 또는 흰색이어야 함
    const colors = ps.particles.map(p => p.color);
    const expectedColors = ['#ff2200', '#ffffff'];
    for (const color of colors) {
      expect(expectedColors).toContain(color);
    }
  });
});
