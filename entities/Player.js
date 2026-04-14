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
    // 마지막 이동 방향 (C 무기 등 방향 지정 무기에 사용). 초기값: 오른쪽
    this.lastDirX = 1;
    this.lastDirY = 0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // 이동 중일 때만 lastDir 업데이트
    if (this.vx !== 0 || this.vy !== 0) {
      const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.lastDirX = this.vx / len;
      this.lastDirY = this.vy / len;
    }
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
