export class Projectile {
  constructor(x, y, vx, vy, damage, {
    piercing = false,
    homing = false,
    color = '#ffff00',
    isAreaEffect = false,
    areaRadius = 0,
    areaColor = '#ffffff',
    isAllEnemy = false,
    chainHops = 0,
    chainRadius = 0,
    hitEnemyIds = null,
    isRailgun = false,
    isBlackhole = false,
    blackholeRadius = 100,
    blackholeLifetime = 2.0,
    weaponType = 'default',
  } = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.piercing = piercing;
    this.homing = homing;
    this.color = color;
    this.isAreaEffect = isAreaEffect;
    this.areaRadius = areaRadius;
    this.areaColor = areaColor;
    this.isAllEnemy = isAllEnemy;
    this.chainHops = chainHops;
    this.chainRadius = chainRadius;
    this.hitEnemyIds = hitEnemyIds;
    this.isRailgun = isRailgun;
    this.isBlackhole = isBlackhole;
    this.blackholeRadius = blackholeRadius;
    this.blackholeLifetime = blackholeLifetime;
    this._bhTimer = blackholeLifetime;
    this.active = true;
    this.width = 8;
    this.height = 8;
    this.weaponType = weaponType;
  }

  update(dt, bounds = null) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (bounds) {
      const margin = 20;
      if (
        this.x < -margin || this.x > bounds.width + margin ||
        this.y < -margin || this.y > bounds.height + margin
      ) {
        this.active = false;
      }
    }
  }

  deactivate() {
    this.active = false;
  }

  render(ctx) {
    if (!this.active) return;
    if (this.isRailgun) {
      ctx.save();
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#ccccff';
      ctx.fillRect(-20, -2, 40, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-20, -1, 40, 2);
      ctx.restore();
      return;
    }
    if (this.weaponType === 'python') {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (this.weaponType === 'c') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = this.color;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
      return;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
