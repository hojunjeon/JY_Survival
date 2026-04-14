import { describe, it, expect, beforeEach } from 'vitest';
import { WaveSystem } from '../systems/WaveSystem.js';

describe('WaveSystem', () => {
  let wave;

  beforeEach(() => {
    wave = new WaveSystem({ spawnInterval: 3, canvasWidth: 800, canvasHeight: 600 });
  });

  it('초기 경과 시간은 0이다', () => {
    expect(wave.elapsed).toBe(0);
  });

  it('update 호출 시 경과 시간이 증가한다', () => {
    wave.update(1.5);
    expect(wave.elapsed).toBeCloseTo(1.5);
  });

  it('스폰 인터벌 이전에는 적을 스폰하지 않는다', () => {
    const spawned = wave.update(2);
    expect(spawned).toHaveLength(0);
  });

  it('스폰 인터벌 도달 시 적을 스폰한다', () => {
    const spawned = wave.update(3);
    expect(spawned.length).toBeGreaterThan(0);
  });

  it('스폰된 적은 Enemy 인터페이스를 가진다', () => {
    const spawned = wave.update(3);
    const e = spawned[0];
    expect(e).toHaveProperty('x');
    expect(e).toHaveProperty('y');
    expect(e).toHaveProperty('hp');
    expect(e).toHaveProperty('isDead');
    expect(e).toHaveProperty('update');
  });

  it('스폰 후 타이머가 리셋된다', () => {
    wave.update(3);
    const before = wave.elapsed;
    wave.update(1);
    // 리셋 후 1초만 누적돼야 함
    expect(wave.elapsed).toBeCloseTo(1);
  });

  it('스폰 위치는 캔버스 경계 부근이다', () => {
    const spawned = wave.update(3);
    for (const e of spawned) {
      const onEdge =
        e.x <= 0 || e.x >= 800 || e.y <= 0 || e.y >= 600;
      expect(onEdge).toBe(true);
    }
  });

  it('여러 번 인터벌을 넘기면 매번 스폰한다', () => {
    wave.update(3); // 1회
    const spawned2 = wave.update(3); // 2회
    expect(spawned2.length).toBeGreaterThan(0);
  });
});
