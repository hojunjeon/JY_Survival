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

  it('addWeaponHit(x, y, "c")은 8개 파티클을 추가한다', () => {
    ps.addWeaponHit(100, 100, 'c');
    expect(ps.particles.length).toBe(8);
  });

  it('C hit 파티클은 8방향으로 확산된다', () => {
    ps.addWeaponHit(100, 100, 'c');
    const velocities = ps.particles.map(p => ({ vx: p.vx, vy: p.vy }));
    expect(velocities.every(v => Math.sqrt(v.vx ** 2 + v.vy ** 2) > 0)).toBe(true);
  });

  it('addWeaponHit(x, y, "unknown")은 addHitSpark으로 fallback한다', () => {
    ps.addWeaponHit(100, 100, 'unknown');
    expect(ps.particles.length).toBe(3); // addHitSpark default count
  });

  it('addOrbitalTail(x, y)은 8개 파티클을 추가한다', () => {
    ps.addOrbitalTail(100, 100);
    expect(ps.particles.length).toBe(8);
  });

  it('OrbitalTail 파티클은 shadowBlur 속성을 가진다', () => {
    ps.addOrbitalTail(100, 100);
    expect(ps.particles[0].shadowBlur).toBe(20);
    expect(ps.particles[0].shadowColor).toBe('#ffa032');
  });
});
