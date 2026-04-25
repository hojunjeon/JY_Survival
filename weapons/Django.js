import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class DjangoWeapon extends WeaponBase {
  constructor() {
    super({ damage: 12, cooldown: 1.5 });
    this.name = 'Django';
    this.maxCooldown = 1.5;
    this.cooldown = 0;
  }

  canFire() {
    return this.cooldown <= 0;
  }

  update(dt, particleSystem) {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }
  }

  fire(x, y, dirX, dirY) {
    this.cooldown = this.maxCooldown;
    const speed = 300;
    const baseAngle = Math.atan2(dirY, dirX);
    const spread = Math.PI / 3; // 120도 부채꼴
    const count = 7;
    const projs = [];
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + spread * (i / (count - 1) - 0.5) * 2;
      projs.push(
        new Projectile(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          12,
          { color: '#092e20' }
        )
      );
    }
    return projs;
  }
}
