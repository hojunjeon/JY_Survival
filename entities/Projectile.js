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
    hitEnemyIds = null
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
    this.active = true;
    this.width = 8;
    this.height = 8;
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
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
