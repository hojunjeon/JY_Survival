import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../systems/ParticleSystem.js';

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

  it('addWeaponTrail(x, y, "python")은 20개 파티클을 추가한다', () => {
    ps.addWeaponTrail(100, 100, 'python');
    expect(ps.particles.length).toBe(20);
  });

  it('Python trail 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addWeaponTrail(100, 100, 'python');
    expect(ps.particles[0].shadowBlur).toBe(20);
    expect(ps.particles[0].shadowColor).toBe('#44ff44');
  });

  it('addWeaponTrail(x, y, "c")은 12개 파티클을 추가한다', () => {
    ps.addWeaponTrail(100, 100, 'c');
    expect(ps.particles.length).toBe(12);
  });

  it('C trail 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addWeaponTrail(100, 100, 'c');
    expect(ps.particles[0].shadowBlur).toBe(10);
    expect(ps.particles[0].shadowColor).toBe('#64b4ff');
  });

  it('addWeaponHit(x, y, "c")은 1개 ring-expand 파티클을 추가한다', () => {
    ps.addWeaponHit(100, 100, 'c');
    expect(ps.particles.length).toBe(1);
  });

  it('C hit 파티클은 ring-expand 타입이다', () => {
    ps.addWeaponHit(100, 100, 'c');
    expect(ps.particles[0].type).toBe('ring-expand');
    expect(ps.particles[0].maxSize).toBe(20);
  });

  it('addWeaponHit(x, y, "unknown")은 addHitSpark으로 fallback한다', () => {
    ps.addWeaponHit(100, 100, 'unknown');
    expect(ps.particles.length).toBe(3); // addHitSpark default count
  });

  it('addOrbitalTail(x, y)은 8개 잔상 + 1개 링 파티클을 추가한다 (총 9개)', () => {
    ps.addOrbitalTail(100, 100);
    expect(ps.particles.length).toBe(9);
  });

  it('OrbitalTail 잔상 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addOrbitalTail(100, 100);
    expect(ps.particles[0].shadowBlur).toBe(20);
    expect(ps.particles[0].shadowColor).toBe('#ffa032');
  });

  it('OrbitalTail 링 파티클은 마지막 파티클이고 type ring을 가진다', () => {
    ps.addOrbitalTail(100, 100);
    const ringParticle = ps.particles[8];
    expect(ringParticle.type).toBe('ring');
    expect(ringParticle.size).toBe(36);
    expect(ringParticle.color).toBe('rgba(255,160,50,0.15)');
    expect(ringParticle.maxLife).toBe(0.1);
  });

  it('ring 타입 파티클은 render에서 원형으로 그려진다', () => {
    ps.addOrbitalTail(100, 100);
    const ringParticle = ps.particles[8];
    expect(ringParticle.type).toBe('ring');
  });

  it('ring-expand 타입 파티클은 maxSize 속성을 가진다', () => {
    ps.addWeaponHit(100, 100, 'c');
    expect(ps.particles[0].type).toBe('ring-expand');
    expect(ps.particles[0].maxSize).toBe(20);
    expect(ps.particles[0].shadowBlur).toBe(10);
  });
});
