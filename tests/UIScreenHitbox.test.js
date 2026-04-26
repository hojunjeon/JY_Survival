import { describe, it, expect } from 'vitest';
import { GameOver } from '../ui/GameOver.js';

describe('GameOver hitbox', () => {
  it('visible=true 시 exit/restart hitbox 반환', () => {
    const go = new GameOver({ canvasWidth: 800, canvasHeight: 600 });
    go.show({ elapsed: 100, kills: 50, maxCombo: 10 });
    const hbs = go.getHitboxes();
    expect(hbs.length).toBe(2);
    expect(hbs.find(h => h.action === 'exit')).toBeDefined();
    expect(hbs.find(h => h.action === 'restart')).toBeDefined();
  });

  it('exit/restart hitbox y가 동일하다', () => {
    const go = new GameOver({ canvasWidth: 800, canvasHeight: 600 });
    go.show({});
    const hbs = go.getHitboxes();
    expect(hbs[0].y).toBe(hbs[1].y);
  });
});
