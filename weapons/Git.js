import { WeaponBase } from './WeaponBase.js';

export class GitWeapon extends WeaponBase {
  constructor() {
    super({ damage: 25, cooldown: 4 });
    this.name = 'Git';
    this.maxCooldown = 4;
    this.cooldown = 0; // 시작 시 발사 가능
  }

  canFire() {
    return this.cooldown <= 0;
  }

  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }
  }

  fire(x, y, dirX, dirY) {
    this.cooldown = this.maxCooldown;
    return [{
      isAreaEffect: true,
      radius: 120,
      damage: 25,
      cx: x,
      cy: y
    }];
  }
}
