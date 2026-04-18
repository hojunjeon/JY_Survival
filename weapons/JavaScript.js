import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class JavaScriptWeapon extends WeaponBase {
  constructor() {
    super({ damage: 12, cooldown: 0.6 });
    this.name = 'JavaScript';
    this.maxCooldown = 0.6;
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
    const speed = 280;
    const projs = [];
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      projs.push(
        new Projectile(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          12,
          { color: '#f7df1e' }
        )
      );
    }
    return projs;
  }
}
