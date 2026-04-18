import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Game } from '../core/Game.js';

describe('Game', () => {
  let game;

  beforeEach(() => {
    const canvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        canvas: { width: 800, height: 600 },
      }),
    };
    game = new Game(canvas);
  });

  it('초기 상태는 stopped다', () => {
    expect(game.running).toBe(false);
  });

  it('start() 호출 후 running이 true다', () => {
    game.start();
    expect(game.running).toBe(true);
  });

  it('stop() 호출 후 running이 false다', () => {
    game.start();
    game.stop();
    expect(game.running).toBe(false);
  });

  it('update()는 dt를 받아 엔티티를 갱신한다', () => {
    const entity = { update: vi.fn(), render: vi.fn() };
    game.addEntity(entity);
    game.update(0.016);
    expect(entity.update).toHaveBeenCalledWith(0.016);
  });

  it('render()는 등록된 엔티티의 render를 호출한다', () => {
    const entity = { update: vi.fn(), render: vi.fn() };
    game.addEntity(entity);
    game.render();
    expect(entity.render).toHaveBeenCalled();
  });

  it('addEntity()로 엔티티를 추가할 수 있다', () => {
    const entity = { update: vi.fn(), render: vi.fn() };
    game.addEntity(entity);
    expect(game.entities).toContain(entity);
  });

  it('removeEntity()로 엔티티를 제거할 수 있다', () => {
    const entity = { update: vi.fn(), render: vi.fn() };
    game.addEntity(entity);
    game.removeEntity(entity);
    expect(game.entities).not.toContain(entity);
  });

  it('clearEntities()는 모든 엔티티를 제거한다', () => {
    const e1 = { update: vi.fn(), render: vi.fn() };
    const e2 = { update: vi.fn(), render: vi.fn() };
    game.addEntity(e1);
    game.addEntity(e2);
    game.clearEntities();
    expect(game.entities).toHaveLength(0);
  });
});
