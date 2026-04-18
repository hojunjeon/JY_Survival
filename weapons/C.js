import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class CWeapon extends WeaponBase {
  constructor() {
    super({ damage: 20, cooldown: 0.3, projectileSpeed: 600, piercing: true });
    this.name = 'C/C++';
  }

  _createProjectiles(x, y, dirX, dirY) {
    return [new Projectile(x, y, dirX * this.projectileSpeed, dirY * this.projectileSpeed, this.damage, {
      piercing: true,
      color: '#aaaaaa'
    })];
  }
}
