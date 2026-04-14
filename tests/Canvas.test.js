import { describe, it, expect, vi } from 'vitest';
import { CanvasUtil } from '../core/Canvas.js';

describe('CanvasUtil', () => {
  const makeCtx = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    canvas: { width: 800, height: 600 },
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
  });

  it('clear()는 캔버스 전체를 지운다', () => {
    const ctx = makeCtx();
    CanvasUtil.clear(ctx);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('drawRect()는 fillRect를 호출한다', () => {
    const ctx = makeCtx();
    CanvasUtil.drawRect(ctx, 10, 20, 32, 32, '#ff0000');
    expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 32, 32);
    expect(ctx.fillStyle).toBe('#ff0000');
  });

  it('drawCircle()는 arc를 호출한다', () => {
    const ctx = makeCtx();
    CanvasUtil.drawCircle(ctx, 50, 50, 10, '#00ff00');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(50, 50, 10, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('drawText()는 fillText를 호출한다', () => {
    const ctx = makeCtx();
    CanvasUtil.drawText(ctx, 'Hello', 100, 200, { color: '#fff', size: 16 });
    expect(ctx.fillText).toHaveBeenCalledWith('Hello', 100, 200);
  });
});
