import { WeaponBase } from './WeaponBase.js';
import { Projectile } from '../entities/Projectile.js';

const SNAKE_OMEGA = 3.0; // rad/s — S자 주기 (~2.1초)

export class PythonWeapon extends WeaponBase {
  constructor() {
    super({ damage: 18, cooldown: 0.6, projectileSpeed: 240, piercing: true });
    this.name = 'Python';
    this.activeProjectiles = [];
  }

  _createProjectiles(x, y, dirX, dirY) {
    const proj = new Projectile(x, y, dirX * this.projectileSpeed, dirY * this.projectileSpeed, this.damage, {
      color: '#44ff44',
      piercing: true,
      weaponType: 'python',
    });
    proj.width = 6;
    proj.height = 6;
    // S자 뱀 이동 상태
    proj._baseFwd  = { x: dirX, y: dirY };
    proj._snakePerp = { x: -dirY, y: dirX }; // 전진 방향의 수직
    proj._snakeT   = 0;
    this.activeProjectiles.push(proj);
    return [proj];
  }

  update(dt, particleSystem) {
    super.update(dt);

    // 레벨에 따라 진폭 확대 (Lv1=44px → Lv5=80px)
    const amp = 35 + this.level * 9;

    for (const proj of this.activeProjectiles) {
      if (!proj.active) continue;

      // 매 프레임 속도 = 전진 + 수직 진동 (사인 미분 → 코사인)
      const perpFactor = amp * SNAKE_OMEGA * Math.cos(SNAKE_OMEGA * proj._snakeT);
      proj.vx = proj._baseFwd.x * this.projectileSpeed + perpFactor * proj._snakePerp.x;
      proj.vy = proj._baseFwd.y * this.projectileSpeed + perpFactor * proj._snakePerp.y;
      proj._snakeT += dt;

      if (particleSystem) {
        particleSystem.addWeaponTrail(proj.x, proj.y, 'python', this.level);
      }
    }

    this.activeProjectiles = this.activeProjectiles.filter(p => p.active);
  }
}
