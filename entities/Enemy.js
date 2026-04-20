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

    // race_condition 필드
    this.linkedEnemy = null;
    this.dyingTimer = 0;

    // memory_leak 필드
    if (type === 'memory_leak') {
      this.growTimer = 0;
      this.scale = 1.0;
      this._garbageTimer = 0;
      this._pendingGarbage = [];
    }

    // infinite_loop 필드
    if (type === 'infinite_loop') {
      this._orbitAngle = Math.random() * Math.PI * 2;
      this._orbitRadius = 180;
      this._shotCooldown = 2.0;
      this.codeWalls = [];
    }

    // input_mismatch 필드
    if (type === 'input_mismatch') {
      this._attackCooldown = 4.0;
      this._chargeTimer = 0;
      this._isCharging = false;
    }
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

  getAndClearPendingGarbage() {
    if (this.type !== 'memory_leak') return [];
    const garbage = [...this._pendingGarbage];
    this._pendingGarbage = [];
    return garbage;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) {
      if (this.type === 'race_condition') {
        this.dyingTimer = 1.0;
      } else {
        this.isDead = true;
      }
    }
    this.hitFlashTimer = 0.1;
  }

  update(dt, targetX, targetY) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    // race_condition: dyingTimer 처리
    if (this.type === 'race_condition' && this.dyingTimer > 0) {
      this.dyingTimer -= dt;
      if (this.dyingTimer <= 0) {
        if (this.linkedEnemy && !this.linkedEnemy.isDead && this.linkedEnemy.dyingTimer <= 0) {
          this.hp = this.maxHp;
          this.dyingTimer = 0;
        } else {
          this.isDead = true;
        }
      }
      return;
    }

    // memory_leak: 크기 증가 + 가비지 생성
    if (this.type === 'memory_leak') {
      this.growTimer += dt;
      while (this.growTimer >= 3.0) {
        this.growTimer -= 3.0;
        this.scale = Math.min(this.scale + 0.3, 3.0);
        this.width = 32 * this.scale;
        this.height = 32 * this.scale;
      }

      this._garbageTimer += dt;
      while (this._garbageTimer >= 0.5) {
        this._garbageTimer -= 0.5;
        this._pendingGarbage.push({ x: this.x, y: this.y, timer: 3.0 });
      }
    }

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

    // Input Mismatch 충전 + 투사체 발사
    if (this.type === 'input_mismatch') {
      this._attackCooldown -= dt;
      if (this._isCharging) {
        this._chargeTimer -= dt;
        if (this._chargeTimer <= 0) {
          this._isCharging = false;
          this._attackCooldown = 4.0;
          // fire projectile
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          this._pendingShots.push({
            x: this.x,
            y: this.y,
            vx: (dx / dist) * 150,
            vy: (dy / dist) * 150,
            damage: 0,
            isControlReversal: true,
          });
        }
      } else if (this._attackCooldown <= 0) {
        this._isCharging = true;
        this._chargeTimer = 0.7;
      }
      // still moves toward player while charging
    }

    // Infinite Loop 공전 + 투사체 발사
    if (this.type === 'infinite_loop') {
      this._orbitAngle += 0.8 * dt;
      this.x = targetX + Math.cos(this._orbitAngle) * this._orbitRadius;
      this.y = targetY + Math.sin(this._orbitAngle) * this._orbitRadius;

      this._shotCooldown -= dt;
      if (this._shotCooldown <= 0) {
        this._shotCooldown = 2.0;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this._pendingShots.push({
          x: this.x,
          y: this.y,
          vx: (dx / dist) * 120,
          vy: (dy / dist) * 120,
          damage: 0,
          isCodeWallProjectile: true,
          ownerEnemy: this,
        });
      }
      return; // skip normal movement
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
        race_condition:    '#ff88cc',
        memory_leak:       '#00dd44',
        enemy:             '#ff8800',
      };
      ctx.fillStyle = colors[this.type] || colors.enemy;
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    // race_condition: 연결선 그리기
    if (this.type === 'race_condition' && this.linkedEnemy && !this.isDead && !this.linkedEnemy.isDead) {
      ctx.save();
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.linkedEnemy.x, this.linkedEnemy.y);
      ctx.stroke();
      ctx.restore();
    }

    // input_mismatch: 시각화
    if (this.type === 'input_mismatch') {
      ctx.save();
      ctx.fillStyle = '#aa00ff';
      ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
      // charging glow
      if (this._isCharging) {
        ctx.globalAlpha = 0.5 + 0.5 * (1 - this._chargeTimer / 0.7);
        ctx.fillStyle = '#ff88ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!=', this.x, this.y);
      ctx.restore();
    }

    // infinite_loop: 시각화
    if (this.type === 'infinite_loop') {
      ctx.save();
      ctx.fillStyle = '#003300';
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
      ctx.strokeRect(this.x - 16, this.y - 16, 32, 32);
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('{ }', this.x, this.y);
      ctx.restore();
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
  race_condition:    { hp: 30,  speed: 70,  contactDamage: 10, flees: false, dropsHpItem: false },
  memory_leak:       { hp: 20,  speed: 40,  contactDamage: 12, flees: false, dropsHpItem: false },
  infinite_loop:     { hp: 35,  speed: 0,   contactDamage: 8,  flees: false, dropsHpItem: false },
  input_mismatch:    { hp: 28,  speed: 60,  contactDamage: 10, flees: false, dropsHpItem: false },
};

export function createEnemy(type, x, y) {
  const stats = ENEMY_STATS[type];
  if (!stats) throw new Error(`Unknown enemy type: ${type}`);
  return new Enemy(x, y, { ...stats, type });
}
