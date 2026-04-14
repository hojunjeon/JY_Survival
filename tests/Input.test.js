import { describe, it, expect, beforeEach } from 'vitest';
import { Input } from '../core/Input.js';

describe('Input', () => {
  let input;

  beforeEach(() => {
    input = new Input();
  });

  it('초기 상태에서 모든 방향키는 false다', () => {
    expect(input.isDown('KeyW')).toBe(false);
    expect(input.isDown('KeyA')).toBe(false);
    expect(input.isDown('KeyS')).toBe(false);
    expect(input.isDown('KeyD')).toBe(false);
  });

  it('keydown 이벤트로 키 상태가 true가 된다', () => {
    input.onKeyDown({ code: 'KeyW' });
    expect(input.isDown('KeyW')).toBe(true);
  });

  it('keyup 이벤트로 키 상태가 false가 된다', () => {
    input.onKeyDown({ code: 'KeyW' });
    input.onKeyUp({ code: 'KeyW' });
    expect(input.isDown('KeyW')).toBe(false);
  });

  it('화살표 키도 동일하게 동작한다', () => {
    input.onKeyDown({ code: 'ArrowUp' });
    expect(input.isDown('ArrowUp')).toBe(true);
  });

  it('getAxis는 WASD 기반 방향벡터를 반환한다', () => {
    input.onKeyDown({ code: 'KeyD' });
    input.onKeyDown({ code: 'KeyW' });
    const { x, y } = input.getAxis();
    expect(x).toBeGreaterThan(0);
    expect(y).toBeLessThan(0);
  });

  it('getAxis는 아무 키도 안 누르면 {x:0, y:0}을 반환한다', () => {
    const { x, y } = input.getAxis();
    expect(x).toBe(0);
    expect(y).toBe(0);
  });

  it('getAxis 대각선은 정규화(길이 1)된다', () => {
    input.onKeyDown({ code: 'KeyD' });
    input.onKeyDown({ code: 'KeyS' });
    const { x, y } = input.getAxis();
    const len = Math.sqrt(x * x + y * y);
    expect(len).toBeCloseTo(1, 5);
  });
});
