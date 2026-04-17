import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class DjangoWeapon extends WeaponBase {
  constructor() {
    super({ damage: 15, cooldown: 2 });
    this.name = 'Django';
    this.maxCooldown = 2;
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
    const speed = 300;
    const baseAngle = Math.atan2(dirY, dirX);
    const spread = Math.PI / 4;
    const count = 5;
    const projs = [];
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + spread * (i / (count - 1) - 0.5) * 2;
      projs.push(
        new Projectile(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          15
        )
      );
    }
    return projs;
  }
}
