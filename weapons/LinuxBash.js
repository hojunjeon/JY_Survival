import { WeaponBase } from './WeaponBase.js';

export class LinuxBashWeapon extends WeaponBase {
  constructor() {
    super({ damage: 60, cooldown: 8 });
    this.name = 'LinuxBash';
    this.maxCooldown = 8;
    this.cooldown = 0;
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
      isUlt: true,
      damage: 60
    }];
  }
}
