import { createEnemy } from '../entities/Enemy.js';

const WAVE_TYPES = ['syntax_error', 'null_pointer', 'seg_fault'];

export class WaveSystem {
  constructor({ spawnInterval, canvasWidth, canvasHeight }) {
    this.spawnInterval = spawnInterval;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.elapsed = 0;
    this.eventMode = null;       // null | { type, remaining }
  }

  setEventEnemyType(type) {
    this.eventMode = { type, remaining: Infinity };
  }

  clearEventEnemyType() {
    this.eventMode = null;
  }

  update(dt, playerX = null, playerY = null) {
    this.elapsed += dt;
    if (this.elapsed >= this.spawnInterval) {
      this.elapsed -= this.spawnInterval;
      return this._spawnWave(playerX, playerY);
    }
    return [];
  }

  _spawnWave(playerX, playerY) {
    const count = 3;
    const spawned = [];
    for (let i = 0; i < count; i++) {
      const { x, y } = this._edgePosition(playerX, playerY);
      const type = this.eventMode?.type ?? WAVE_TYPES[Math.floor(Math.random() * WAVE_TYPES.length)];
      spawned.push(createEnemy(type, x, y));
    }
    return spawned;
  }

  _edgePosition(playerX, playerY) {
    const side = Math.floor(Math.random() * 4);

    if (playerX == null || playerY == null) {
      // 플레이어 위치 없을 때: 캔버스 엣지 기준 (기존 동작)
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      switch (side) {
        case 0: return { x: 0, y: Math.random() * h };
        case 1: return { x: w, y: Math.random() * h };
        case 2: return { x: Math.random() * w, y: 0 };
        case 3: return { x: Math.random() * w, y: h };
      }
    }

    // 플레이어 기준 뷰포트 엣지 스폰 (100px 버퍼 추가)
    const hw = this.canvasWidth  / 2 + 100;
    const hh = this.canvasHeight / 2 + 100;
    const WORLD_W = 2000, WORLD_H = 2000;

    let x, y;
    switch (side) {
      case 0: // 왼쪽 엣지
        x = playerX - hw;
        y = playerY - hh + Math.random() * (hh * 2);
        break;
      case 1: // 오른쪽 엣지
        x = playerX + hw;
        y = playerY - hh + Math.random() * (hh * 2);
        break;
      case 2: // 위쪽 엣지
        x = playerX - hw + Math.random() * (hw * 2);
        y = playerY - hh;
        break;
      case 3: // 아래쪽 엣지
        x = playerX - hw + Math.random() * (hw * 2);
        y = playerY + hh;
        break;
    }

    // 월드 경계 클램프
    x = Math.max(0, Math.min(WORLD_W, x));
    y = Math.max(0, Math.min(WORLD_H, y));

    return { x, y };
  }
}
