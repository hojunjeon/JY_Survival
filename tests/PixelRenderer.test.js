import { describe, it, expect, vi } from 'vitest';
import { PixelRenderer } from '../sprites/PixelRenderer.js';

describe('PixelRenderer', () => {
  const makeCtx = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  });

  it('drawSprite()는 ctx.fillRect를 여러 번 호출해 픽셀을 그린다', () => {
    const ctx = makeCtx();
    const sprite = [
      ['#ff0000', null],
      [null, '#00ff00'],
    ];
    PixelRenderer.drawSprite(ctx, sprite, 0, 0, 4);
    // 색상 있는 픽셀 2개만 fillRect 호출 (null은 투명)
    expect(ctx.fillRect).toHaveBeenCalledTimes(2);
  });

  it('drawSprite()는 픽셀 크기(scale)를 적용한다', () => {
    const ctx = makeCtx();
    const sprite = [[1]];
    PixelRenderer.drawSprite(ctx, sprite, 10, 20, 4);
    expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 4, 4);
  });

  it('drawSprite()는 save/restore로 ctx 상태를 보호한다', () => {
    const ctx = makeCtx();
    PixelRenderer.drawSprite(ctx, [[1]], 0, 0, 4);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('PLAYER_SPRITE는 32×32 배열이다', () => {
    expect(PixelRenderer.PLAYER_SPRITE.length).toBe(32);
    expect(PixelRenderer.PLAYER_SPRITE[0].length).toBe(32);
  });
});

describe('BUG_SPRITES', () => {
  const EXPECTED_TYPES = [
    'syntax_error',
    'null_pointer',
    'seg_fault',
    'heal_bug',
    'indentation_error',
    'env_error',
  ];

  it('BUG_SPRITES는 6종 모두 정의되어 있다', () => {
    for (const type of EXPECTED_TYPES) {
      expect(PixelRenderer.BUG_SPRITES[type]).toBeDefined();
    }
  });

  it('각 BUG_SPRITE는 16×16 배열이다', () => {
    for (const type of EXPECTED_TYPES) {
      const sprite = PixelRenderer.BUG_SPRITES[type];
      expect(sprite.length).toBe(16);
      for (const row of sprite) {
        expect(row.length).toBe(16);
      }
    }
  });
});
