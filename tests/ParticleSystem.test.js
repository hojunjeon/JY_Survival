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
});
