import { WeaponBase } from './WeaponBase.js';

export class SQLWeapon extends WeaponBase {
  constructor() {
    super({ damage: 60, cooldown: 8 });
    this.name = 'SQL';
    this.maxCooldown = 8;
    this.cooldown = 0;
    // 'idle' | 'targeting' | 'dropping' | 'landed'
    this.dropPhase = 'idle';
    this.targetX = 0;
    this.targetY = 0;
    this.blockY = 0;
    this.phaseTimer = 0;
    this.flashTimer = 0;
  }

  canFire() {
    return this.cooldown <= 0 && this.dropPhase === 'idle';
  }

  // fire()는 main.js의 tryFireWeapon에서 직접 호출 — 적 위치를 인자로 받음
  startDrop(targetX, targetY) {
    this.dropPhase = 'targeting';
    this.targetX = targetX;
    this.targetY = targetY;
    this.phaseTimer = 0.8;
    this.cooldown = this.maxCooldown;
  }

  update(dt, particleSystem) {
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.flashTimer > 0) this.flashTimer = Math.max(0, this.flashTimer - dt);

    if (this.dropPhase === 'targeting') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.dropPhase = 'dropping';
        this.blockY = this.targetY - 500; // 화면 위에서 시작
      }
    } else if (this.dropPhase === 'dropping') {
      this.blockY += 700 * dt;
      if (this.blockY >= this.targetY) {
        this.blockY = this.targetY;
        this.dropPhase = 'landed';
        this.phaseTimer = 0.4; // 착지 후 잠시 표시
        this.flashTimer = 0.15;
      }
    } else if (this.dropPhase === 'landed') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.dropPhase = 'idle';
      }
    }
  }

  fire(x, y, dirX, dirY) {
    return []; // 투사체 없음 — startDrop()으로 처리
  }
}
