import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class CWeapon extends WeaponBase {
  constructor() {
    super({ damage: 35, cooldown: 1.2, projectileSpeed: 600, piercing: true });
    this.name = 'C/C++';
  }

  _createProjectiles(x, y, dirX, dirY) {
    return [new Projectile(x, y, dirX * this.projectileSpeed, dirY * this.projectileSpeed, this.damage, {
      piercing: true,
      color: '#aaaaaa',
      isRailgun: true,
      weaponType: 'c',
    })];
  }
}
