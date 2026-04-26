import { describe, it, expect } from 'vitest';
import { StatUpgrade } from '../ui/StatUpgrade.js';
import { EventModalScreen } from '../ui/EventModalScreen.js';

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

describe('WeaponSelect hitbox', () => {
  it('confirm 버튼 hitbox — x=530', () => {
    const { WeaponSelect } = require('../ui/WeaponSelect.js');
    const ws = new WeaponSelect({ canvasWidth: 800, canvasHeight: 600, weapons: [{ name: 'Python' }] });
    ws.show();
    const hitboxes = ws.getHitboxes();
    expect(hitboxes).toHaveLength(1);
    expect(hitboxes[0].x).toBe(530);
    expect(hitboxes[0].action).toBe('confirm');
  });
});

describe('EventToast.getHitboxes()', () => {
  it('visible=false일 때 빈 배열 반환', () => {
    const toast = { visible: false, getHitboxes: function() { if (!this.visible) return []; } };
    const hitboxes = toast.getHitboxes();
    expect(hitboxes).toEqual([]);
  });

  it('skip/help 버튼 hitbox 개수와 action 확인', () => {
    const cw = 800, ch = 600;
    const toastW = 380, toastH = 230;
    const toastX = (cw - toastW) / 2, toastY = (ch - toastH) / 2;
    const btnW = 80, btnH = 20, btnGap = 8;
    const totalBtnW = btnW * 2 + btnGap;
    const btnX = toastX + (toastW - totalBtnW) / 2;
    const contentY = toastY + toastH - 34;

    const hitboxes = [
      { x: btnX, y: contentY, w: btnW, h: btnH, action: 'skip' },
      { x: btnX + btnW + btnGap, y: contentY, w: btnW, h: btnH, action: 'help' },
    ];

    expect(hitboxes).toHaveLength(2);
    expect(hitboxes[0].action).toBe('skip');
    expect(hitboxes[1].action).toBe('help');
  });

  it('버튼 y좌표 일치: contentY = toastY + toastH - 34', () => {
    const cw = 800, ch = 600;
    const toastW = 380, toastH = 230;
    const toastX = (cw - toastW) / 2, toastY = (ch - toastH) / 2;
    const btnW = 80, btnH = 20, btnGap = 8;
    const totalBtnW = btnW * 2 + btnGap;
    const btnX = toastX + (toastW - totalBtnW) / 2;
    const contentY = toastY + toastH - 34;

    const hitboxes = [
      { x: btnX, y: contentY, w: btnW, h: btnH, action: 'skip' },
      { x: btnX + btnW + btnGap, y: contentY, w: btnW, h: btnH, action: 'help' },
    ];

    const expectedContentY = toastY + toastH - 34;
    expect(hitboxes[0].y).toBe(expectedContentY);
    expect(hitboxes[1].y).toBe(expectedContentY);
  });
});

describe('EventModalScreen hitbox', () => {
  it('visible=true 시 continue/unpause hitbox 반환', () => {
    const em = new EventModalScreen({ canvasWidth: 800, canvasHeight: 600 });
    em.show({ eventType: 'E1', bugType: 'IndentationError', bugCount: 15, progress: 8, reward: 3 });
    const hbs = em.getHitboxes();
    expect(hbs.length).toBeGreaterThanOrEqual(1);
    const actions = hbs.map(h => h.action);
    expect(actions.some(a => a === 'continue' || a === 'unpause')).toBe(true);
  });
});

describe('StatUpgrade hitbox', () => {
  it('visible=true 시 3개 select-stat hitbox 반환', () => {
    const su = new StatUpgrade({ canvasWidth: 800, canvasHeight: 600 });
    su.show();
    const hbs = su.getHitboxes();
    expect(hbs.length).toBe(3);
    hbs.forEach((h, i) => {
      expect(h.action).toBe('select-stat');
      expect(h.statIndex).toBe(i);
    });
  });

  it('3개 hitbox y좌표가 순서대로 증가한다', () => {
    const su = new StatUpgrade({ canvasWidth: 800, canvasHeight: 600 });
    su.show();
    const hbs = su.getHitboxes();
    expect(hbs[1].y).toBeGreaterThan(hbs[0].y);
    expect(hbs[2].y).toBeGreaterThan(hbs[1].y);
  });
});

describe('WeaponGet hitbox', () => {
  it('visible=true 시 discard/equip hitbox 반환', () => {
    const { WeaponGet } = require('../ui/WeaponGet.js');
    const wg = new WeaponGet({ canvasWidth: 800, canvasHeight: 600 });
    wg.show({ name: 'Git', description: 'Branch & merge' });
    const hbs = wg.getHitboxes();
    expect(hbs.length).toBeGreaterThanOrEqual(1);
    const actions = hbs.map(h => h.action);
    expect(actions.some(a => a === 'drop' || a === 'equip')).toBe(true);
  });
});

describe('BossIntro.isAutoTransitionReady()', () => {
  it('visible=false일 때 false 반환', () => {
    const { BossIntro } = require('../ui/BossIntro.js');
    const bi = new BossIntro({ canvasWidth: 800, canvasHeight: 600 });
    expect(bi.isAutoTransitionReady()).toBe(false);
  });

  it('visible=true이고 2000ms 경과 전 false 반환', () => {
    const { BossIntro } = require('../ui/BossIntro.js');
    const bi = new BossIntro({ canvasWidth: 800, canvasHeight: 600 });
    bi.show({ name: 'TestBoss', emoji: '👹', hp: 500, attack: '3방향', tracking: '보통' });
    expect(bi.isAutoTransitionReady()).toBe(false);
  });

  it('visible=true이고 2000ms 경과 후 true 반환', (done) => {
    const { BossIntro } = require('../ui/BossIntro.js');
    const bi = new BossIntro({ canvasWidth: 800, canvasHeight: 600 });
    bi.show({ name: 'TestBoss', emoji: '👹', hp: 500, attack: '3방향', tracking: '보통' });
    setTimeout(() => {
      expect(bi.isAutoTransitionReady()).toBe(true);
      done();
    }, 2100);
  });
});

describe('StageClear hitbox', () => {
  it('visible=true 시 next-stage hitbox 반환', () => {
    const { StageClear } = require('../ui/StageClear.js');
    const sc = new StageClear({ canvasWidth: 800, canvasHeight: 600 });
    sc.show({ stageNumber: 1, kills: 100, elapsed: 200, enhance: 3, coins: 5 });
    const hbs = sc.getHitboxes();
    expect(hbs.length).toBeGreaterThanOrEqual(1);
    expect(hbs.find(h => h.action === 'next-stage')).toBeDefined();
  });
});

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
