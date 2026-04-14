import { WeaponBase } from './WeaponBase.js';

const ORB_COUNT = 3;
const ORB_RADIUS = 60;
const ORB_SPEED = 2.0; // rad/s
const ORB_DAMAGE = 15;

export class JavaWeapon extends WeaponBase {
  constructor() {
    super({ damage: ORB_DAMAGE, cooldown: Infinity, projectileSpeed: 0 });
    this.name = 'Java';

    this.orbs = Array.from({ length: ORB_COUNT }, (_, i) => ({
      angle: (i / ORB_COUNT) * 2 * Math.PI,
      radius: ORB_RADIUS,
      damage: ORB_DAMAGE,
      width: 16,
      height: 16,
      // 동일 적 다중피격 방지: enemyId → 남은 무적시간(초)
      hitCooldowns: new Map(),
    }));
  }

  // 오비탈은 canFire가 항상 false — 투사체를 발사하지 않는다
  canFire() {
    return false;
  }

  fire() {
    return [];
  }

  update(dt) {
    // 부모 update(쿨다운) 건너뜀 — 오비탈은 쿨다운 없음
    this.orbs.forEach(orb => {
      orb.angle += ORB_SPEED * dt;
      // hitCooldown 감소
      for (const [id, remaining] of orb.hitCooldowns) {
        const next = remaining - dt;
        if (next <= 0) orb.hitCooldowns.delete(id);
        else orb.hitCooldowns.set(id, next);
      }
    });
  }

  /**
   * 해당 오브가 enemyId 적을 지금 공격할 수 있는지 확인 후 쿨다운 등록
   * @param {number} orbIndex
   * @param {number|string} enemyId
   * @returns {boolean}
   */
  tryHit(orbIndex, enemyId) {
    const orb = this.orbs[orbIndex];
    if (orb.hitCooldowns.has(enemyId)) return false;
    orb.hitCooldowns.set(enemyId, 0.5); // 0.5초 무적
    return true;
  }

  /**
   * 플레이어 위치 기준 각 오브의 절대 좌표 반환
   * @param {number} px
   * @param {number} py
   * @returns {{ x: number, y: number, damage: number, width: number, height: number }[]}
   */
  getOrbPositions(px, py) {
    return this.orbs.map(orb => ({
      x: px + Math.cos(orb.angle) * orb.radius,
      y: py + Math.sin(orb.angle) * orb.radius,
      damage: orb.damage,
      width: orb.width,
      height: orb.height,
    }));
  }
}
