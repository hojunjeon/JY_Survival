import { describe, it, expect, beforeEach } from 'vitest';
import { Projectile } from '../entities/Projectile.js';

describe('Projectile 기본', () => {
  let proj;

  beforeEach(() => {
    // 오른쪽으로 이동하는 투사체, 속도 200, 데미지 15
    proj = new Projectile(100, 200, 200, 0, 15);
  });

  it('초기 위치가 설정된다', () => {
    expect(proj.x).toBe(100);
    expect(proj.y).toBe(200);
  });

  it('충돌박스는 8×8이다', () => {
    expect(proj.width).toBe(8);
    expect(proj.height).toBe(8);
  });

  it('생성 직후 active 상태다', () => {
    expect(proj.active).toBe(true);
  });

  it('damage가 설정된다', () => {
    expect(proj.damage).toBe(15);
  });

  it('update 시 속도에 따라 이동한다', () => {
    proj.update(1);
    expect(proj.x).toBeCloseTo(300);
    expect(proj.y).toBeCloseTo(200);
  });

  it('dt=0이면 위치가 변하지 않는다', () => {
    proj.update(0);
    expect(proj.x).toBe(100);
    expect(proj.y).toBe(200);
  });

  it('대각선 방향으로도 이동한다', () => {
    const speed = 200;
    const angle = Math.PI / 4; // 45도
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const p = new Projectile(0, 0, vx, vy, 10);
    p.update(1);
    expect(p.x).toBeCloseTo(vx, 0);
    expect(p.y).toBeCloseTo(vy, 0);
  });

  it('deactivate() 호출 시 active가 false가 된다', () => {
    proj.deactivate();
    expect(proj.active).toBe(false);
  });
});

describe('Projectile 범위 이탈', () => {
  it('canvasWidth/Height 범위를 벗어나면 비활성화된다', () => {
    const proj = new Projectile(5, 400, -200, 0, 10);
    proj.update(1, { width: 800, height: 600 });
    expect(proj.active).toBe(false);
  });

  it('범위 내에 있으면 active 상태가 유지된다', () => {
    const proj = new Projectile(100, 100, 100, 0, 10);
    proj.update(0.1, { width: 800, height: 600 });
    expect(proj.active).toBe(true);
  });

  it('캔버스 정보 없이도 update가 동작한다', () => {
    const proj = new Projectile(100, 100, 100, 0, 10);
    expect(() => proj.update(0.1)).not.toThrow();
  });
});

describe('Projectile 관통 여부', () => {
  it('기본값은 관통 없음이다', () => {
    const proj = new Projectile(0, 0, 100, 0, 10);
    expect(proj.piercing).toBe(false);
  });

  it('관통 옵션으로 생성하면 piercing이 true다', () => {
    const proj = new Projectile(0, 0, 100, 0, 10, { piercing: true });
    expect(proj.piercing).toBe(true);
  });
});
