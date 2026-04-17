import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class JavaScriptWeapon extends WeaponBase {
  constructor() {
    super({ damage: 8, cooldown: 0.8 });
    this.name = 'JavaScript';
    this.maxCooldown = 0.8;
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
    const speed = 250;
    const projs = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      projs.push(
        new Projectile(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          8
        )
      );
    }
    return projs;
  }
}
