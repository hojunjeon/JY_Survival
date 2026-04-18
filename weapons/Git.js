import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class GitWeapon extends WeaponBase {
  constructor() {
    super({ damage: 40, cooldown: 3 });
    this.name = 'Git';
    this.maxCooldown = 3;
    this.cooldown = 0; // 시작 시 발사 가능
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
    const projectiles = [];

    // 폭발 투사체 (지역 효과)
    const explosionProj = new Projectile(x, y, 0, 0, 40, {
      isAreaEffect: true,
      areaRadius: 150,
      areaColor: '#f05033'
    });
    projectiles.push(explosionProj);

    // 8방향 잔여 투사체 (데미지 15)
    const directions = 8;
    const speed = 250;
    for (let i = 0; i < directions; i++) {
      const angle = (i / directions) * 2 * Math.PI;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      projectiles.push(new Projectile(x, y, vx, vy, 15, {
        color: '#f05033'
      }));
    }

    return projectiles;
  }
}
