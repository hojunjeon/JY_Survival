export class Player {
  // renderer: { draw(ctx, x, y) } 형태의 객체. 없으면 파란 사각형 폴백.
  constructor(x, y, renderer = null) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.speed = 160; // px/s
    this.maxHp = 100;
    this.hp = 100;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;
    this._renderer = renderer;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isDead = true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  render(ctx) {
    if (this._renderer) {
      this._renderer.draw(ctx, this.x, this.y);
    } else {
      // 폴백: 개발/테스트용 사각형
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
  }
}
