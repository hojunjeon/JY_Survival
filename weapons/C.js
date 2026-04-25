import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class CWeapon extends WeaponBase {
  constructor() {
    super({ damage: 35, cooldown: 1.2, projectileSpeed: 600, piercing: true });
    this.name = 'C/C++';
    this.activeProjectiles = [];
  }

  _createProjectiles(x, y, dirX, dirY) {
    const proj = new Projectile(x, y, dirX * this.projectileSpeed, dirY * this.projectileSpeed, this.damage, {
      piercing: true,
      color: '#aaaaaa',
      isRailgun: true,
      weaponType: 'c',
    });
    // 발사체를 activeProjectiles에 추가
    this.activeProjectiles.push(proj);
    return [proj];
  }

  update(dt, particleSystem) {
    // 부모 update(쿨다운) 실행
    super.update(dt);

    // ParticleSystem이 전달되면 활성 발사체마다 trail 이펙트 추가
    if (particleSystem) {
      for (const proj of this.activeProjectiles) {
        if (proj.active) {
          particleSystem.addWeaponTrail(proj.x, proj.y, 'c');
        }
      }
    }

    // 비활성 발사체 정리
    this.activeProjectiles = this.activeProjectiles.filter(p => p.active);
  }
}
