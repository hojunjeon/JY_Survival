import { describe, it, expect } from 'vitest';
import { checkCollision } from '../core/Collision.js';

describe('checkCollision (AABB)', () => {
  // 두 객체 모두 { x, y, width, height } — x,y는 중심 좌표

  it('겹치는 두 객체는 충돌로 판정한다', () => {
    const a = { x: 100, y: 100, width: 32, height: 32 };
    const b = { x: 110, y: 100, width: 32, height: 32 };
    expect(checkCollision(a, b)).toBe(true);
  });

  it('떨어진 두 객체는 충돌하지 않는다', () => {
    const a = { x: 100, y: 100, width: 32, height: 32 };
    const b = { x: 300, y: 100, width: 32, height: 32 };
    expect(checkCollision(a, b)).toBe(false);
  });

  it('정확히 맞닿은 경우는 충돌하지 않는다', () => {
    const a = { x: 100, y: 100, width: 32, height: 32 };
    const b = { x: 132, y: 100, width: 32, height: 32 }; // 좌측 a 우측 끝 = 116, b 좌측 = 116
    expect(checkCollision(a, b)).toBe(false);
  });

  it('y축으로 떨어진 경우 충돌하지 않는다', () => {
    const a = { x: 100, y: 100, width: 32, height: 32 };
    const b = { x: 100, y: 300, width: 32, height: 32 };
    expect(checkCollision(a, b)).toBe(false);
  });

  it('동일 위치는 충돌한다', () => {
    const a = { x: 100, y: 100, width: 32, height: 32 };
    const b = { x: 100, y: 100, width: 32, height: 32 };
    expect(checkCollision(a, b)).toBe(true);
  });
});
