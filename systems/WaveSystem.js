import { createEnemy } from '../entities/Enemy.js';

const WAVE_TABLE = [
  { type: 'syntax_error',       minWave: 1  },
  { type: 'null_pointer',       minWave: 1  },
  { type: 'seg_fault',          minWave: 1  },
  { type: 'memory_leak',        minWave: 1  },
  { type: 'race_condition',     minWave: 5  },
  { type: 'infinite_loop',      minWave: 8  },
  { type: 'input_mismatch',     minWave: 25 },
  { type: 'library_dependency', minWave: 10 },
];

export class WaveSystem {
  constructor({ spawnInterval, canvasWidth, canvasHeight }) {
    this.spawnInterval = spawnInterval;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.elapsed = 0;
    this.eventMode = null;       // null | { type, remaining }
    this.waveCount = 0;
  }

  setEventMode(type, count) {
    this.eventMode = { type, remaining: count };
    this.elapsed = 0;
  }

  clearEventMode() {
    this.eventMode = null;
  }

  // 하위 호환 별칭
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
    this.waveCount++;

    if (this.eventMode && this.eventMode.remaining <= 0) return [];

    const maxCount = this.eventMode
      ? Math.min(3, this.eventMode.remaining)
      : 3;

    const spawned = [];
    for (let i = 0; i < maxCount; i++) {
      const { x, y } = this._edgePosition(playerX, playerY);

      let type;
      if (this.eventMode?.type) {
        type = this.eventMode.type;
      } else {
        const available = WAVE_TABLE.filter(e => this.waveCount >= e.minWave);
        const pool = available.length > 0 ? available : WAVE_TABLE.filter(e => e.minWave === 1);
        type = pool[Math.floor(Math.random() * pool.length)].type;
      }

      if (type === 'race_condition') {
        const offset = 60;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x + Math.cos(angle) * offset;
        const y2 = y + Math.sin(angle) * offset;

        const enemy1 = createEnemy(type, x, y);
        const enemy2 = createEnemy(type, x2, y2);
        enemy1.linkedEnemy = enemy2;
        enemy2.linkedEnemy = enemy1;

        spawned.push(enemy1, enemy2);
      } else {
        spawned.push(createEnemy(type, x, y));
      }
    }

    if (this.eventMode) {
      this.eventMode.remaining -= spawned.length;
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
        case 0: // 왼쪽 엣지
          return { x: 0, y: Math.random() * h };
        case 1: // 오른쪽 엣지
          return { x: w, y: Math.random() * h };
        case 2: // 위쪽 엣지
          return { x: Math.random() * w, y: 0 };
        case 3: // 아래쪽 엣지
          return { x: Math.random() * w, y: h };
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
