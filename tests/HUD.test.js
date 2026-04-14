import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HUD } from '../ui/HUD.js';

function makeCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  };
}

function makeState(overrides = {}) {
  return {
    playerHp: 100,
    playerMaxHp: 100,
    killCount: 0,
    q1Target: 100,
    elapsed: 0,
    e1State: 'pending',
    e3State: 'pending',
    bossState: 'pending',
    ...overrides,
  };
}

describe('HUD — HP 바', () => {
  let hud, ctx;
  beforeEach(() => {
    hud = new HUD({ canvasWidth: 800, canvasHeight: 600 });
    ctx = makeCtx();
  });

  it('render 호출 시 fillRect가 실행된다', () => {
    hud.render(ctx, makeState());
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('HP가 절반이면 HP 바 너비가 절반으로 줄어든다', () => {
    const BAR_W = 200;
    // full HP: HP 바 너비 = 200
    hud.render(ctx, makeState({ playerHp: 100, playerMaxHp: 100 }));
    const hasFullBar = ctx.fillRect.mock.calls.some(c => c[2] === BAR_W);
    expect(hasFullBar).toBe(true);

    // half HP: HP 바 너비 = 100
    const ctx2 = makeCtx();
    hud.render(ctx2, makeState({ playerHp: 50, playerMaxHp: 100 }));
    const hasHalfBar = ctx2.fillRect.mock.calls.some(c => c[2] === BAR_W / 2);
    expect(hasHalfBar).toBe(true);
  });

  it('HP가 0이면 HP 바 너비가 0이다', () => {
    hud.render(ctx, makeState({ playerHp: 0, playerMaxHp: 100 }));
    // HP 바 관련 fillRect에서 width가 0인 호출이 있어야 한다
    const hasZeroWidth = ctx.fillRect.mock.calls.some(c => c[2] === 0);
    expect(hasZeroWidth).toBe(true);
  });
});

describe('HUD — 킬카운트 텍스트', () => {
  let hud, ctx;
  beforeEach(() => {
    hud = new HUD({ canvasWidth: 800, canvasHeight: 600 });
    ctx = makeCtx();
  });

  it('killCount가 표시된다', () => {
    hud.render(ctx, makeState({ killCount: 42, q1Target: 100 }));
    const texts = ctx.fillText.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('42'))).toBe(true);
  });

  it('q1Target이 표시된다', () => {
    hud.render(ctx, makeState({ killCount: 0, q1Target: 100 }));
    const texts = ctx.fillText.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('100'))).toBe(true);
  });
});

describe('HUD — 경과 시간', () => {
  let hud, ctx;
  beforeEach(() => {
    hud = new HUD({ canvasWidth: 800, canvasHeight: 600 });
    ctx = makeCtx();
  });

  it('경과 시간(초)이 표시된다', () => {
    hud.render(ctx, makeState({ elapsed: 75 }));
    const texts = ctx.fillText.mock.calls.map(c => String(c[0]));
    // "1:15" 또는 "75" 형태로 표시
    expect(texts.some(t => t.includes('1:15') || t.includes('75'))).toBe(true);
  });
});

describe('HUD — 이벤트 상태', () => {
  let hud, ctx;
  beforeEach(() => {
    hud = new HUD({ canvasWidth: 800, canvasHeight: 600 });
    ctx = makeCtx();
  });

  it('E1이 active 상태이면 이벤트 표시가 있다', () => {
    hud.render(ctx, makeState({ e1State: 'active' }));
    const texts = ctx.fillText.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('E1') || t.includes('들여쓰기'))).toBe(true);
  });

  it('E3이 active 상태이면 이벤트 표시가 있다', () => {
    hud.render(ctx, makeState({ e3State: 'active' }));
    const texts = ctx.fillText.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.includes('E3') || t.includes('파이참'))).toBe(true);
  });

  it('보스가 active 상태이면 BOSS 표시가 있다', () => {
    hud.render(ctx, makeState({ bossState: 'active' }));
    const texts = ctx.fillText.mock.calls.map(c => String(c[0]));
    expect(texts.some(t => t.toUpperCase().includes('BOSS') || t.includes('장선형'))).toBe(true);
  });
});
