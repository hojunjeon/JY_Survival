import { WeaponBase } from './WeaponBase.js';

export class GitWeapon extends WeaponBase {
  constructor() {
    super({ damage: 50, cooldown: 5 });
    this.name = 'Git';
    this.maxCooldown = 5;
    this.cooldown = 0;
    this.branchPoint = null;   // {x, y}
    this.mergeTimer = 0;
    this.mergeReady = false;
  }

  canFire() {
    return this.cooldown <= 0 && !this.branchPoint;
  }

  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }
    if (this.branchPoint) {
      this.mergeTimer -= dt;
      if (this.mergeTimer <= 0) {
        this.mergeReady = true;
      }
    }
  }

  // branchPoint 저장은 main.js에서 호출
  fire(x, y, dirX, dirY) {
    if (!this.canFire()) return [];
    this.cooldown = this.maxCooldown;
    this.branchPoint = { x, y };
    this.mergeTimer = 3.0;
    this.mergeReady = false;
    return []; // 투사체 없음 — 직선 데미지는 main.js에서 처리
  }

  consumeMerge() {
    const bp = this.branchPoint;
    this.branchPoint = null;
    this.mergeReady = false;
    this.mergeTimer = 0;
    return bp;
  }
}
