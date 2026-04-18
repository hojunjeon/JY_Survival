import { PixelRenderer } from '../sprites/PixelRenderer.js';

export class Enemy {
  constructor(x, y, { hp, speed, contactDamage, flees = false, dropsHpItem = false, type = 'enemy' }) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.maxHp = hp;
    this.hp = hp;
    this.speed = speed;
    this.contactDamage = contactDamage;
    this.flees = flees;
    this.dropsHpItem = dropsHpItem;
    this.type = type;
    this.isDead = false;
    this.hitFlashTimer = 0;

    // 특수 공격 필드
    this._pendingShots = [];
    this.specialCooldown = this._initialSpecialCooldown();
    this.isDashing = false;
    this._dashTimer = 0;
    this._normalSpeed = speed;
  }

  _initialSpecialCooldown() {
    if (this.type === 'indentation_error') return 2.5;
    if (this.type === 'env_error') return 3.0;
    return Infinity;
  }

  getAndClearPendingShots() {
    const shots = [...this._pendingShots];
    this._pendingShots = [];
    return shots;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isDead = true;
    this.hitFlashTimer = 0.1;
  }

  update(dt, targetX, targetY) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (dt === 0) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const dirX = dx / dist;
    const dirY = dy / dist;

    // EnvError 돌진 처리
    if (this.type === 'env_error') {
      this.specialCooldown -= dt;
      if (this.isDashing) {
        this._dashTimer -= dt;
        if (this._dashTimer <= 0) {
          this.isDashing = false;
          this.speed = this._normalSpeed;
        }
      } else if (this.specialCooldown <= 0) {
        this.isDashing = true;
        this._dashTimer = 0.4;
        this.speed = 400;
        this.specialCooldown = 3.0;
      }
    }

    // IndentationError 총알 발사
    if (this.type === 'indentation_error') {
      this.specialCooldown -= dt;
      if (this.specialCooldown <= 0) {
        this.specialCooldown = 2.5;
        const speed = 100;
        this._pendingShots.push({
          x: this.x,
          y: this.y,
          vx: dirX * speed,
          vy: dirY * speed,
          damage: 8,
        });
      }
    }

    // 이동 처리
    if (this.flees) {
      this.x -= dirX * this.speed * dt;
      this.y -= dirY * this.speed * dt;
    } else {
      this.x += dirX * this.speed * dt;
      this.y += dirY * this.speed * dt;
    }
  }

  render(ctx) {
    const sprite = PixelRenderer.BUG_SPRITES[this.type];
    if (sprite) {
      PixelRenderer.drawSprite(ctx, sprite, this.x - this.width / 2, this.y - this.height / 2, 2);
    } else {
      // 폴백: 단색 사각형 (알 수 없는 타입)
      const colors = {
        syntax_error:      '#ff4444',
        null_pointer:      'rgba(180,180,255,0.7)',
        seg_fault:         '#884400',
        heal_bug:          '#44ff88',
        indentation_error: '#ffaa44',
        env_error:         '#4488ff',
        enemy:             '#ff8800',
      };
      ctx.fillStyle = colors[this.type] || colors.enemy;
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    // 피격 플래시 오버레이 — 스프라이트가 있으면 tinted, 없으면 사각형
    if (this.hitFlashTimer > 0) {
      const sprite = PixelRenderer.BUG_SPRITES[this.type];
      if (sprite) {
        PixelRenderer.drawSpriteTinted(
          ctx, sprite,
          this.x - this.width / 2, this.y - this.height / 2,
          2, '#ffffff', 0.7
        );
      } else {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
      }
    }

    // 사망 시 빨간 오버레이
    if (this.isDead) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.clip();
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.restore();
    }
  }
}

const ENEMY_STATS = {
  syntax_error:      { hp: 24,  speed: 80,  contactDamage: 10, flees: false, dropsHpItem: false },
  null_pointer:      { hp: 20,  speed: 140, contactDamage: 5,  flees: false, dropsHpItem: false },
  seg_fault:         { hp: 48,  speed: 40,  contactDamage: 25, flees: false, dropsHpItem: false },
  heal_bug:          { hp: 15,  speed: 150, contactDamage: 0,  flees: true,  dropsHpItem: true  },
  indentation_error: { hp: 36,  speed: 70,  contactDamage: 15, flees: false, dropsHpItem: false },
  env_error:         { hp: 48,  speed: 35,  contactDamage: 15, flees: false, dropsHpItem: false },
};

export function createEnemy(type, x, y) {
  const stats = ENEMY_STATS[type];
  if (!stats) throw new Error(`Unknown enemy type: ${type}`);
  return new Enemy(x, y, { ...stats, type });
}
