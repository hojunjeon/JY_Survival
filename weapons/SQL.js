import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class SQLWeapon extends WeaponBase {
  constructor() {
    super({ damage: 20, cooldown: 5 });
    this.name = 'SQL';
    this.maxCooldown = 5;
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
    const CANVAS_W = 600;
    const offsets = [-CANVAS_W / 4, 0, CANVAS_W / 4];
    return offsets.map(dx => new Projectile(x + dx, y, 0, -400, 20));
  }
}
