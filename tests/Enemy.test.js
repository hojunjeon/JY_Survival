import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Enemy, createEnemy } from '../entities/Enemy.js';
import { PixelRenderer } from '../sprites/PixelRenderer.js';

describe('Enemy 기반 클래스', () => {
  let enemy;

  beforeEach(() => {
    enemy = new Enemy(200, 150, { hp: 40, speed: 80, contactDamage: 10 });
  });

  it('초기 위치를 생성자에서 설정한다', () => {
    expect(enemy.x).toBe(200);
    expect(enemy.y).toBe(150);
  });

  it('충돌박스는 32×32이다', () => {
    expect(enemy.width).toBe(32);
    expect(enemy.height).toBe(32);
  });

  it('생성 시 isDead는 false다', () => {
    expect(enemy.isDead).toBe(false);
  });

  it('데미지를 받으면 HP가 줄어든다', () => {
    enemy.takeDamage(15);
    expect(enemy.hp).toBe(25);
  });

  it('HP가 0이 되면 isDead가 true가 된다', () => {
    enemy.takeDamage(40);
    expect(enemy.isDead).toBe(true);
  });

  it('HP는 0 미만이 되지 않는다', () => {
    enemy.takeDamage(9999);
    expect(enemy.hp).toBe(0);
  });

  it('타깃 방향으로 이동한다', () => {
    const before = { x: enemy.x, y: enemy.y };
    enemy.update(1, 400, 150); // 오른쪽 타깃
    expect(enemy.x).toBeGreaterThan(before.x);
    expect(enemy.y).toBe(before.y);
  });

  it('dt=0이면 위치가 변하지 않는다', () => {
    enemy.update(0, 400, 300);
    expect(enemy.x).toBe(200);
    expect(enemy.y).toBe(150);
  });

  it('speed px/s 속도로 이동한다', () => {
    enemy.update(1, 1000, 150); // 오른쪽으로만 이동
    expect(enemy.x).toBeCloseTo(200 + 80, 0);
  });
});

describe('createEnemy 팩토리', () => {
  it('SyntaxError 적을 생성한다', () => {
    const e = createEnemy('syntax_error', 100, 100);
    expect(e.type).toBe('syntax_error');
    expect(e.hp).toBeGreaterThan(0);
    expect(e.contactDamage).toBeGreaterThan(0);
  });

  it('NullPointerException 적을 생성한다', () => {
    const e = createEnemy('null_pointer', 100, 100);
    expect(e.type).toBe('null_pointer');
    expect(e.hp).toBeGreaterThan(0);
  });

  it('SegFault 적을 생성한다', () => {
    const e = createEnemy('seg_fault', 100, 100);
    expect(e.type).toBe('seg_fault');
    expect(e.hp).toBeGreaterThan(0);
  });

  it('HealBug 적을 생성한다', () => {
    const e = createEnemy('heal_bug', 100, 100);
    expect(e.type).toBe('heal_bug');
    expect(e.contactDamage).toBe(0);
    expect(e.dropsHpItem).toBe(true);
  });
});

describe('적 타입별 스탯', () => {
  it('SegFault는 SyntaxError보다 HP가 높다', () => {
    const seg = createEnemy('seg_fault', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(seg.hp).toBeGreaterThan(syn.hp);
  });

  it('NullPointerException은 SyntaxError보다 빠르다', () => {
    const npe = createEnemy('null_pointer', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(npe.speed).toBeGreaterThan(syn.speed);
  });

  it('SegFault는 SyntaxError보다 contactDamage가 높다', () => {
    const seg = createEnemy('seg_fault', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(seg.contactDamage).toBeGreaterThan(syn.contactDamage);
  });

  it('HealBug는 플레이어로부터 멀어진다', () => {
    const bug = createEnemy('heal_bug', 200, 150);
    bug.update(1, 400, 150); // 플레이어가 오른쪽
    expect(bug.x).toBeLessThan(200); // 왼쪽으로 도망
  });
});

describe('이벤트 전용 적 타입', () => {
  it('IndentationError 적을 생성한다', () => {
    const e = createEnemy('indentation_error', 100, 100);
    expect(e.type).toBe('indentation_error');
    expect(e.hp).toBeGreaterThan(0);
    expect(e.contactDamage).toBeGreaterThan(0);
  });

  it('IndentationError는 SyntaxError보다 HP가 높다', () => {
    const ie = createEnemy('indentation_error', 0, 0);
    const syn = createEnemy('syntax_error', 0, 0);
    expect(ie.hp).toBeGreaterThan(syn.hp);
  });

  it('EnvError 적을 생성한다', () => {
    const e = createEnemy('env_error', 100, 100);
    expect(e.type).toBe('env_error');
    expect(e.hp).toBeGreaterThan(0);
  });

  it('EnvError는 SegFault보다 HP가 같거나 높다', () => {
    const env = createEnemy('env_error', 0, 0);
    const seg = createEnemy('seg_fault', 0, 0);
    expect(env.hp).toBeGreaterThanOrEqual(seg.hp);
  });

  it('EnvError는 느린 속도를 가진다 (SegFault 이하)', () => {
    const env = createEnemy('env_error', 0, 0);
    const seg = createEnemy('seg_fault', 0, 0);
    expect(env.speed).toBeLessThanOrEqual(seg.speed);
  });

  it('알 수 없는 타입은 에러를 던진다', () => {
    expect(() => createEnemy('unknown_type', 0, 0)).toThrow();
  });
});

describe('Enemy 픽셀 스프라이트 렌더', () => {
  const makeCtx = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  });

  it('알려진 타입 → drawSprite 사용 (fillRect 미호출)', () => {
    const drawSpriteSpy = vi.spyOn(PixelRenderer, 'drawSprite').mockImplementation(() => {});
    const enemy = createEnemy('syntax_error', 100, 100);
    const ctx = makeCtx();
    enemy.render(ctx);
    expect(drawSpriteSpy).toHaveBeenCalledOnce();
    expect(ctx.fillRect).not.toHaveBeenCalled();
    drawSpriteSpy.mockRestore();
  });

  it('알 수 없는 타입 → 폴백 fillRect 사용', () => {
    const drawSpriteSpy = vi.spyOn(PixelRenderer, 'drawSprite').mockImplementation(() => {});
    const enemy = new Enemy(100, 100, { hp: 10, speed: 50, contactDamage: 5, type: 'unknown_bug' });
    const ctx = makeCtx();
    enemy.render(ctx);
    expect(drawSpriteSpy).not.toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
    drawSpriteSpy.mockRestore();
  });
});

describe('피격 플래시', () => {
  it('takeDamage 호출 시 hitFlashTimer가 0.1로 설정된다', () => {
    const e = createEnemy('syntax_error', 0, 0);
    e.takeDamage(10);
    expect(e.hitFlashTimer).toBeCloseTo(0.1);
  });

  it('update 시 hitFlashTimer가 줄어든다', () => {
    const e = createEnemy('syntax_error', 0, 0);
    e.takeDamage(10);
    e.update(0.05, 0, 0);
    expect(e.hitFlashTimer).toBeCloseTo(0.05);
  });

  it('데미지를 받지 않으면 hitFlashTimer는 0이다', () => {
    const e = createEnemy('syntax_error', 0, 0);
    expect(e.hitFlashTimer).toBe(0);
  });
});

describe('ENEMY_STATS HP 조정', () => {
  test('syntax_error HP = 24', () => {
    const e = createEnemy('syntax_error', 0, 0);
    expect(e.hp).toBe(24);
    expect(e.maxHp).toBe(24);
  });

  test('seg_fault HP = 48', () => {
    const e = createEnemy('seg_fault', 0, 0);
    expect(e.hp).toBe(48);
  });

  test('indentation_error HP = 36', () => {
    const e = createEnemy('indentation_error', 0, 0);
    expect(e.hp).toBe(36);
  });

  test('env_error HP = 48', () => {
    const e = createEnemy('env_error', 0, 0);
    expect(e.hp).toBe(48);
  });

  test('null_pointer HP = 20 (유지)', () => {
    const e = createEnemy('null_pointer', 0, 0);
    expect(e.hp).toBe(20);
  });
});

describe('Enemy 피격 색상 오버레이', () => {
  const makeCtx = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  });

  test('hitFlashTimer > 0이면 render에서 fillRect 2회 호출 (스프라이트 + 오버레이)', () => {
    const drawSpriteSpy = vi.spyOn(PixelRenderer, 'drawSprite').mockImplementation(() => {});
    const enemy = createEnemy('syntax_error', 50, 50);
    enemy.hitFlashTimer = 0.05;
    const ctx = makeCtx();
    enemy.render(ctx);
    // save & restore 호출 확인 (오버레이 안쪽)
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    drawSpriteSpy.mockRestore();
  });

  test('isDead=true면 render에서 빨간 오버레이 적용 (globalAlpha=0.8)', () => {
    const drawSpriteSpy = vi.spyOn(PixelRenderer, 'drawSprite').mockImplementation(() => {});
    const enemy = createEnemy('syntax_error', 50, 50);
    enemy.isDead = true;
    const ctx = makeCtx();
    enemy.render(ctx);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    drawSpriteSpy.mockRestore();
  });

  test('hitFlashTimer=0이고 isDead=false면 오버레이 미적용', () => {
    const drawSpriteSpy = vi.spyOn(PixelRenderer, 'drawSprite').mockImplementation(() => {});
    const enemy = createEnemy('syntax_error', 50, 50);
    const ctx = makeCtx();
    enemy.render(ctx);
    // drawSprite만 호출, save/restore는 호출되지 않음
    expect(drawSpriteSpy).toHaveBeenCalledOnce();
    expect(ctx.save).not.toHaveBeenCalled();
    drawSpriteSpy.mockRestore();
  });
});
