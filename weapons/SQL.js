import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class SQLWeapon extends WeaponBase {
  constructor() {
    super({ damage: 35, cooldown: 4 });
    this.name = 'SQL';
    this.maxCooldown = 4;
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
    const speed = 800;
    return [new Projectile(x, y, dirX * speed, dirY * speed, 35, {
      piercing: true,
      color: '#4499ff'
    })];
  }
}
