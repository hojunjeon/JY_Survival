export class Projectile {
  constructor(x, y, vx, vy, damage, { piercing = false } = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.piercing = piercing;
    this.active = true;
    this.width = 8;
    this.height = 8;
  }

  update(dt, canvas = null) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (canvas) {
      const margin = 20;
      if (
        this.x < -margin || this.x > canvas.width + margin ||
        this.y < -margin || this.y > canvas.height + margin
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
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
