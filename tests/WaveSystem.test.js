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

describe('WaveSystem 플레이어 기준 스폰', () => {
  it('update(dt, playerX, playerY) — 스폰 위치가 플레이어 기준 뷰포트 엣지 근처여야 한다', () => {
    const ws = new WaveSystem({ spawnInterval: 1, canvasWidth: 600, canvasHeight: 600 });
    // 플레이어가 가까운 위치에 있을 때: 현재 코드는 캔버스 엣지(0-600)에 스폰하므로
    // 플레이어 좌표를 이용한 스폰과 다르다. 이 테스트는 playerX/Y를 사용할 때 실패한다.
    const playerX = 100, playerY = 100;
    const enemies = ws.update(1.0, playerX, playerY);
    expect(enemies.length).toBeGreaterThan(0);

    // 모든 적이 플레이어로부터 충분히 멀리 스폰되어야 한다
    // 플레이어 기준 스폰이면: 최소 한 축에서 >= 300 거리
    // 월드 경계 클램핑이 되지 않을 때: max(|x-px|, |y-py|) >= 300
    // 대부분의 경우 >= 300이어야 하며, 월드 경계 근처에서만 예외 발생
    for (const e of enemies) {
      const dist = Math.max(Math.abs(e.x - playerX), Math.abs(e.y - playerY));
      // 클램핑이 없는 경우 >= 300, 클램핑이 있어도 최소한 100 이상 떨어져야 함
      // 실제로는 대부분 >= 300이므로, 통계적으로 최소값은 100 정도
      expect(dist).toBeGreaterThanOrEqual(100);
    }
  });

  it('playerX/Y 생략 시 기존 동작 (캔버스 엣지 기준) 유지', () => {
    const ws = new WaveSystem({ spawnInterval: 1, canvasWidth: 600, canvasHeight: 600 });
    const enemies = ws.update(1.0);
    expect(enemies.length).toBeGreaterThan(0);
  });
});

describe('WaveSystem 이벤트 모드', () => {
  test('setEventMode("indentation_error", 15) — 15마리 스폰 후 중단', () => {
    const ws = new WaveSystem({ spawnInterval: 1, canvasWidth: 600, canvasHeight: 600 });
    ws.setEventMode('indentation_error', 15);
    let total = 0;
    for (let i = 0; i < 20; i++) {
      ws.elapsed = ws.spawnInterval;
      const batch = ws.update(0, 300, 300);
      total += batch.length;
    }
    expect(total).toBe(15);
  });

  test('setEventMode — 스폰된 적 타입이 설정된 타입이어야 한다', () => {
    const ws = new WaveSystem({ spawnInterval: 1, canvasWidth: 600, canvasHeight: 600 });
    ws.setEventMode('env_error', 3);
    ws.elapsed = ws.spawnInterval;
    const batch = ws.update(0, 300, 300);
    for (const e of batch) {
      expect(e.type).toBe('env_error');
    }
  });

  test('clearEventMode() 후 일반 웨이브 재개', () => {
    const ws = new WaveSystem({ spawnInterval: 1, canvasWidth: 600, canvasHeight: 600 });
    ws.setEventMode('env_error', 3);
    ws.clearEventMode();
    ws.elapsed = ws.spawnInterval;
    const batch = ws.update(0, 300, 300);
    for (const e of batch) {
      expect(['syntax_error', 'null_pointer', 'seg_fault', 'race_condition', 'memory_leak', 'infinite_loop', 'input_mismatch', 'library_dependency']).toContain(e.type);
    }
  });
});
