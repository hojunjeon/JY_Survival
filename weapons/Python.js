import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class PythonWeapon extends WeaponBase {
  constructor() {
    super({ damage: 12, cooldown: 0.5, projectileSpeed: 120, piercing: false });
    this.name = 'Python';
  }

  _createProjectiles(x, y) {
    const count = 8;
    const projectiles = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      projectiles.push(new Projectile(x, y, vx, vy, this.damage, { piercing: false }));
    }
    return projectiles;
  }
}
