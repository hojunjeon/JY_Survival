import { describe, it, expect } from 'vitest';

// 좌표 변환 헬퍼 (main.js에서 추출 예정)
function toCanvasCoords(clientX, clientY, rect, canvasW, canvasH) {
  const scaleX = canvasW / rect.width;
  const scaleY = canvasH / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

describe('toCanvasCoords', () => {
  it('스케일 1:1 — 변환 없음', () => {
    const rect = { left: 0, top: 0, width: 800, height: 600 };
    const { x, y } = toCanvasCoords(100, 200, rect, 800, 600);
    expect(x).toBe(100);
    expect(y).toBe(200);
  });

  it('2배 스케일 업 — 좌표 절반으로', () => {
    const rect = { left: 0, top: 0, width: 1600, height: 1200 };
    const { x, y } = toCanvasCoords(400, 600, rect, 800, 600);
    expect(x).toBe(200);
    expect(y).toBe(300);
  });

  it('오프셋 포함 — left/top 빼기', () => {
    const rect = { left: 50, top: 30, width: 800, height: 600 };
    const { x, y } = toCanvasCoords(150, 230, rect, 800, 600);
    expect(x).toBe(100);
    expect(y).toBe(200);
  });
});
