import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class LinuxBashWeapon extends WeaponBase {
  constructor() {
    super({ damage: 30, cooldown: 6 });
    this.name = 'LinuxBash';
    this.maxCooldown = 6;
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
    return [new Projectile(x, y, 0, 0, 30, {
      isAllEnemy: true
    })];
  }
}
