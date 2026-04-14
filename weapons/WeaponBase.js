import { Projectile } from '../entities/Projectile.js';

export class WeaponBase {
  constructor({ damage, cooldown, projectileSpeed = 200, piercing = false }) {
    this.damage = damage;
    this.cooldown = cooldown;
    this.projectileSpeed = projectileSpeed;
    this.piercing = piercing;
    this._timer = 0; // 0 = 발사 가능
  }

  canFire() {
    return this._timer <= 0;
  }

  update(dt) {
    if (this._timer > 0) {
      this._timer = Math.max(0, this._timer - dt);
    }
  }

  /**
   * @param {number} x - 발사 위치 x
   * @param {number} y - 발사 위치 y
   * @param {number} dirX - 방향 벡터 x (정규화)
   * @param {number} dirY - 방향 벡터 y (정규화)
   * @returns {Projectile[]}
   */
  fire(x, y, dirX, dirY) {
    if (!this.canFire()) return [];
    this._timer = this.cooldown;
    return this._createProjectiles(x, y, dirX, dirY);
  }

  // 서브클래스에서 오버라이드
  _createProjectiles(x, y, dirX, dirY) {
    return [new Projectile(x, y, dirX * this.projectileSpeed, dirY * this.projectileSpeed, this.damage, { piercing: this.piercing })];
  }
}
