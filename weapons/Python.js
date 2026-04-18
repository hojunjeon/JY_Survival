import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class PythonWeapon extends WeaponBase {
  constructor() {
    super({ damage: 15, cooldown: 1.0, projectileSpeed: 200, piercing: false });
    this.name = 'Python';
  }

  _createProjectiles(x, y, dirX, dirY) {
    const vx = dirX * this.projectileSpeed;
    const vy = dirY * this.projectileSpeed;
    const proj = new Projectile(x, y, vx, vy, this.damage, {
      color: '#44ff44',
      chainHops: 2,
      chainRadius: 130,
      hitEnemyIds: new Set()
    });
    proj.width = 6;
    proj.height = 6;
    return [proj];
  }
}
