import { WeaponBase } from './WeaponBase.js';

export class JavaScriptWeapon extends WeaponBase {
  constructor() {
    super({ damage: 8, cooldown: 4 });
    this.name = 'JavaScript';
    this.maxCooldown = 4;
    this.cooldown = 0;
    this.tornado = null;
    // tornado 구조: { x, y, radius, maxRadius, timer, maxTimer, dmgTimer, angle }
  }

  canFire() {
    return this.cooldown <= 0 && !this.tornado;
  }

  update(dt, particleSystem) {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }
    if (this.tornado) {
      const t = this.tornado;
      t.timer -= dt;
      t.angle += 3.0 * dt; // 회전 애니메이션용
      // 반경 확장
      const progress = 1 - (t.timer / t.maxTimer);
      t.radius = 30 + progress * (t.maxRadius - 30);
      // 데미지 타이머
      t.dmgTimer -= dt;
      if (t.dmgTimer <= 0) {
        t.dmgTimer = 0.3;
        t._pendingDmg = true;
      }
      if (t.timer <= 0) {
        this.tornado = null;
      }
    }
  }

  // 토네이도 시작 (main.js에서 플레이어 위치로 호출)
  startTornado(x, y) {
    this.tornado = {
      x, y,
      radius: 30,
      maxRadius: 180,
      timer: 2.5,
      maxTimer: 2.5,
      dmgTimer: 0.3,
      angle: 0,
      _pendingDmg: false,
    };
    this.cooldown = this.maxCooldown;
  }

  fire(x, y, dirX, dirY) {
    return []; // 투사체 없음 — startTornado()로 처리
  }
}
