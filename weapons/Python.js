import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class PythonWeapon extends WeaponBase {
  constructor() {
    super({ damage: 10, cooldown: 0.8, projectileSpeed: 150, piercing: false });
    this.name = 'Python';
  }

  _createProjectiles(x, y, dirX, dirY) {
    const baseAngle = Math.atan2(dirY, dirX);
    const spread = Math.PI / 6; // 30도
    const projectiles = [];

    // 3방향 투사체: 중앙, 좌측, 우측
    const angles = [
      baseAngle - spread,
      baseAngle,
      baseAngle + spread
    ];

    for (const angle of angles) {
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      projectiles.push(new Projectile(x, y, vx, vy, this.damage, {
        homing: true,
        color: '#ffe066'
      }));
    }

    return projectiles;
  }
}
