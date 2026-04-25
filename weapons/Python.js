import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

export class PythonWeapon extends WeaponBase {
  constructor() {
    super({ damage: 18, cooldown: 0.6, projectileSpeed: 240, piercing: false });
    this.name = 'Python';
    this.activeProjectiles = [];
  }

  _createProjectiles(x, y, dirX, dirY) {
    const vx = dirX * this.projectileSpeed;
    const vy = dirY * this.projectileSpeed;
    const proj = new Projectile(x, y, vx, vy, this.damage, {
      color: '#44ff44',
      chainHops: 2,
      chainRadius: 130,
      hitEnemyIds: new Set(),
      weaponType: 'python',
    });
    proj.width = 6;
    proj.height = 6;
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
          particleSystem.addWeaponTrail(proj.x, proj.y, 'python');
        }
      }
    }

    // 비활성 발사체 정리
    this.activeProjectiles = this.activeProjectiles.filter(p => p.active);
  }
}
