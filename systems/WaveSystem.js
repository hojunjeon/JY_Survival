import { createEnemy } from '../entities/Enemy.js';

const WAVE_TYPES = ['syntax_error', 'null_pointer', 'seg_fault'];

export class WaveSystem {
  constructor({ spawnInterval, canvasWidth, canvasHeight }) {
    this.spawnInterval = spawnInterval;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.elapsed = 0;
    this.eventEnemyType = null;
  }

  setEventEnemyType(type) {
    this.eventEnemyType = type;
  }

  clearEventEnemyType() {
    this.eventEnemyType = null;
  }

  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.spawnInterval) {
      this.elapsed -= this.spawnInterval;
      return this._spawnWave();
    }
    return [];
  }

  _spawnWave() {
    const count = 3;
    const spawned = [];
    for (let i = 0; i < count; i++) {
      const { x, y } = this._edgePosition();
      const type = this.eventEnemyType ?? WAVE_TYPES[Math.floor(Math.random() * WAVE_TYPES.length)];
      spawned.push(createEnemy(type, x, y));
    }
    return spawned;
  }

  _edgePosition() {
    const side = Math.floor(Math.random() * 4);
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    switch (side) {
      case 0: return { x: 0,     y: Math.random() * h }; // 왼쪽
      case 1: return { x: w,     y: Math.random() * h }; // 오른쪽
      case 2: return { x: Math.random() * w, y: 0 };     // 위
      case 3: return { x: Math.random() * w, y: h };     // 아래
    }
  }
}
