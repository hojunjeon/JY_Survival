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
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
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

describe('이벤트 몹 특수 공격', () => {
  test('indentation_error — shootCooldown 초과 시 pending shot 생성', () => {
    const e = createEnemy('indentation_error', 100, 100);
    e.update(3.0, 200, 100);
    const shots = e.getAndClearPendingShots();
    expect(shots.length).toBeGreaterThan(0);
    expect(shots[0]).toHaveProperty('vx');
    expect(shots[0]).toHaveProperty('vy');
    expect(shots[0].damage).toBe(8);
  });

  test('indentation_error — getAndClearPendingShots() 는 호출 후 비워진다', () => {
    const e = createEnemy('indentation_error', 100, 100);
    e.update(3.0, 200, 100);
    e.getAndClearPendingShots();
    const shots2 = e.getAndClearPendingShots();
    expect(shots2.length).toBe(0);
  });

  test('env_error — dashCooldown 초과 시 isDashing = true', () => {
    const e = createEnemy('env_error', 100, 100);
    e.update(3.5, 200, 100);
    expect(e.isDashing).toBe(true);
  });

  test('일반 몹(syntax_error)은 getAndClearPendingShots 반환값이 항상 빈 배열', () => {
    const e = createEnemy('syntax_error', 0, 0);
    e.update(5.0, 100, 100);
    expect(e.getAndClearPendingShots()).toEqual([]);
  });
});

describe('race_condition 몬스터', () => {
  test('race_condition 타입을 생성할 수 있다', () => {
    const e = createEnemy('race_condition', 100, 100);
    expect(e.type).toBe('race_condition');
    expect(e.hp).toBe(30);
    expect(e.speed).toBe(70);
    expect(e.contactDamage).toBe(10);
  });

  test('linkedEnemy가 null로 초기화된다', () => {
    const e = createEnemy('race_condition', 100, 100);
    expect(e.linkedEnemy).toBeNull();
  });

  test('dyingTimer가 0으로 초기화된다', () => {
    const e = createEnemy('race_condition', 100, 100);
    expect(e.dyingTimer).toBe(0);
  });

  test('takeDamage로 hp=0이 되면 dyingTimer=1.0으로 설정된다', () => {
    const e = createEnemy('race_condition', 100, 100);
    e.takeDamage(30);
    expect(e.hp).toBe(0);
    expect(e.dyingTimer).toBe(1.0);
    expect(e.isDead).toBe(false);
  });

  test('dyingTimer 카운트다운: 1초 경과 후 linkedEnemy 없으면 isDead=true', () => {
    const e = createEnemy('race_condition', 100, 100);
    e.takeDamage(30);
    e.update(1.0, 0, 0);
    expect(e.isDead).toBe(true);
  });

  test('dyingTimer 카운트다운: 1초 경과 후 linkedEnemy가 살아있으면 부활', () => {
    const e1 = createEnemy('race_condition', 100, 100);
    const e2 = createEnemy('race_condition', 160, 100);
    e1.linkedEnemy = e2;
    e2.linkedEnemy = e1;

    e1.takeDamage(30);
    expect(e1.hp).toBe(0);
    expect(e1.dyingTimer).toBe(1.0);

    e1.update(1.0, 0, 0);
    expect(e1.hp).toBe(30);
    expect(e1.isDead).toBe(false);
    expect(e1.dyingTimer).toBe(0);
  });

  test('두 마리 모두 dyingTimer 상태면 둘 다 isDead=true', () => {
    const e1 = createEnemy('race_condition', 100, 100);
    const e2 = createEnemy('race_condition', 160, 100);
    e1.linkedEnemy = e2;
    e2.linkedEnemy = e1;

    e1.takeDamage(30);
    e2.takeDamage(30);

    e1.update(1.0, 0, 0);
    expect(e1.isDead).toBe(true);
    expect(e2.isDead).toBe(false);
    expect(e2.dyingTimer).toBe(1.0);

    e2.update(1.0, 0, 0);
    expect(e2.isDead).toBe(true);
  });

  test('일반 몬스터는 dyingTimer를 사용하지 않는다', () => {
    const e = createEnemy('syntax_error', 100, 100);
    e.takeDamage(24);
    expect(e.isDead).toBe(true);
    expect(e.dyingTimer).toBe(0);
  });
});

describe('memory_leak 적 타입', () => {
  it('memory_leak 적을 생성한다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    expect(e.type).toBe('memory_leak');
    expect(e.hp).toBe(20);
    expect(e.speed).toBe(40);
    expect(e.contactDamage).toBe(12);
  });

  it('생성 시 growTimer, scale, _pendingGarbage를 초기화한다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    expect(e.growTimer).toBe(0);
    expect(e.scale).toBe(1.0);
    expect(e._pendingGarbage).toEqual([]);
  });

  it('초기 크기는 32×32이다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    expect(e.width).toBe(32);
    expect(e.height).toBe(32);
  });

  it('3초마다 scale이 0.3씩 증가한다 (최대 3.0)', () => {
    const e = createEnemy('memory_leak', 100, 100);
    e.update(3.0, 200, 200);
    expect(e.scale).toBeCloseTo(1.3);
    expect(e.width).toBeCloseTo(32 * 1.3);
    expect(e.height).toBeCloseTo(32 * 1.3);
  });

  it('6초 경과 후 scale은 1.6이 된다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    e.update(6.0, 200, 200);
    expect(e.scale).toBeCloseTo(1.6);
  });

  it('scale은 3.0을 초과하지 않는다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    e.update(3.0, 200, 200);
    expect(e.scale).toBeCloseTo(1.3);
    e.update(3.0, 200, 200);
    expect(e.scale).toBeCloseTo(1.6);
    e.update(3.0, 200, 200);
    expect(e.scale).toBeCloseTo(1.9);
    e.update(3.6, 200, 200);
    expect(e.scale).toBe(3.0);
    expect(e.width).toBe(96);
    expect(e.height).toBe(96);
  });

  it('0.5초마다 가비지 객체를 생성한다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    e.update(0.5, 200, 200);
    expect(e._pendingGarbage.length).toBe(1);
    expect(e._pendingGarbage[0]).toEqual({ x: 100, y: 100, timer: 3.0 });
  });

  it('1초 경과 후 가비지 객체 2개가 생성된다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    e.update(1.0, 200, 200);
    expect(e._pendingGarbage.length).toBe(2);
  });

  it('getAndClearPendingGarbage는 가비지 배열을 반환하고 초기화한다', () => {
    const e = createEnemy('memory_leak', 100, 100);
    e.update(0.5, 200, 200);
    const garbage = e.getAndClearPendingGarbage();
    expect(garbage.length).toBe(1);
    expect(e._pendingGarbage.length).toBe(0);
  });

  it('비 memory_leak 적은 getAndClearPendingGarbage 호출 시 빈 배열을 반환한다', () => {
    const e = createEnemy('syntax_error', 100, 100);
    const garbage = e.getAndClearPendingGarbage();
    expect(garbage).toEqual([]);
  });
});

describe('infinite_loop 몬스터', () => {
  test('infinite_loop 타입을 생성할 수 있다', () => {
    const e = createEnemy('infinite_loop', 100, 100);
    expect(e.type).toBe('infinite_loop');
    expect(e.hp).toBe(35);
    expect(e.speed).toBe(0);
    expect(e.contactDamage).toBe(8);
  });

  test('infinite_loop 생성 시 codeWalls 배열이 빈 배열이다', () => {
    const e = createEnemy('infinite_loop', 100, 100);
    expect(e.codeWalls).toEqual([]);
  });

  test('infinite_loop는 update 후 위치가 플레이어 주변 궤도에 있다', () => {
    const e = createEnemy('infinite_loop', 100, 100);
    const playerX = 500;
    const playerY = 500;
    e.update(1.0, playerX, playerY);

    // 플레이어로부터 거리 확인 (180px ± 약간의 공차)
    const dx = e.x - playerX;
    const dy = e.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    expect(dist).toBeCloseTo(180, 0);
  });

  test('infinite_loop는 2초마다 투사체를 발사한다', () => {
    const e = createEnemy('infinite_loop', 100, 100);

    // 첫 번째 발사 (2초 후)
    e.update(2.0, 200, 100);
    let shots = e.getAndClearPendingShots();
    expect(shots.length).toBe(1);

    // 두 번째 발사 (2초 더 지난 후)
    e.update(2.0, 200, 100);
    shots = e.getAndClearPendingShots();
    expect(shots.length).toBe(1);
  });

  test('infinite_loop 투사체는 isCodeWallProjectile: true를 가진다', () => {
    const e = createEnemy('infinite_loop', 100, 100);
    e.update(2.0, 200, 100);
    const shots = e.getAndClearPendingShots();
    expect(shots[0]).toHaveProperty('isCodeWallProjectile', true);
  });

  test('infinite_loop 투사체는 ownerEnemy 참조를 가진다', () => {
    const e = createEnemy('infinite_loop', 100, 100);
    e.update(2.0, 200, 100);
    const shots = e.getAndClearPendingShots();
    expect(shots[0]).toHaveProperty('ownerEnemy');
    expect(shots[0].ownerEnemy).toBe(e);
  });
});

describe('input_mismatch 몬스터', () => {
  test('input_mismatch 생성 시 올바른 스탯을 가진다', () => {
    const e = createEnemy('input_mismatch', 100, 100);
    expect(e.type).toBe('input_mismatch');
    expect(e.hp).toBe(28);
    expect(e.speed).toBe(60);
    expect(e.contactDamage).toBe(10);
  });

  test('input_mismatch는 4초마다 충전 후 투사체를 발사한다', () => {
    const e = createEnemy('input_mismatch', 100, 100);
    // 처음 4초: 쿨타임 감소, 0초: 충전 시작
    e.update(4.0, 200, 100);
    expect(e._isCharging).toBe(true);
    expect(e._chargeTimer).toBeCloseTo(0.7);

    // 충전 0.7초 후: 투사체 발사
    e.update(0.7, 200, 100);
    expect(e._isCharging).toBe(false);
    const shots = e.getAndClearPendingShots();
    expect(shots.length).toBe(1);
  });

  test('충전 중 _isCharging이 true이다', () => {
    const e = createEnemy('input_mismatch', 100, 100);
    e.update(4.0, 200, 100);
    expect(e._isCharging).toBe(true);
  });

  test('발사된 투사체는 isControlReversal: true를 가진다', () => {
    const e = createEnemy('input_mismatch', 100, 100);
    // 첫 4초: 초기 cooldown
    e.update(4.0, 200, 100);
    expect(e._isCharging).toBe(true);
    // 0.7초 더: 충전 완료 → 발사
    e.update(0.7, 200, 100);
    const shots = e.getAndClearPendingShots();
    expect(shots.length).toBe(1);
    expect(shots[0]).toHaveProperty('isControlReversal', true);
  });

  test('투사체는 150 px/s 속도로 플레이어 방향으로 날아간다', () => {
    const e = createEnemy('input_mismatch', 100, 100);
    e._attackCooldown = -1;
    e._isCharging = true;
    e._chargeTimer = 0;
    e.update(0.01, 200, 100); // targetX=200, targetY=100 (오른쪽)
    const shots = e.getAndClearPendingShots();
    expect(shots[0].vx).toBeCloseTo(150); // 오른쪽
    expect(shots[0].vy).toBeCloseTo(0);
  });
});
