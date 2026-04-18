const DIALOGUES = {
  appear: '지윤님... 이번엔 제가 꼭 이깁니다! 두고 보세요!!',
  phase2: '이게 말이 돼요?! 왜 지윤님만 무기가 그렇게 많아요!! 억울해서 못 살겠네!!',
  death: '말도 안 돼... 이건 진짜 억울하다고요!! 지윤님 반칙이에요!!',
  taunt: [
    '지윤님 맨날 저 놀리더니 이제 후회하시겠죠?! 이번엔 제 차례예요!!',
    '왜 저만 이래요!! 분명히 저도 열심히 했는데!!',
  ],
};

const PHASE1_SPEED = 70;
const PHASE2_SPEED = 120;
const SHOOT_INTERVAL = 2; // 2초마다 발사

import { PixelRenderer, BOSS_SPRITE } from '../sprites/PixelRenderer.js';

export class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.maxHp = 500;
    this.hp = 500;
    this.phase = 1;
    this.isDead = false;
    this.type = 'boss';
    this.shootCooldown = 0;
    this._phaseTransitioned = false;
    this.hitFlashTimer = 0;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashTimer = 0.1;
    if (this.hp === 0) this.isDead = true;
  }

  // 페이즈 전환 체크. 전환 발생 시 true 반환 (최초 1번만)
  updatePhase() {
    if (this.phase === 1 && this.hp <= this.maxHp * 0.5 && !this._phaseTransitioned) {
      this.phase = 2;
      this._phaseTransitioned = true;
      return true;
    }
    return false;
  }

  update(dt, targetX, targetY) {
    if (dt === 0) return;

    const speed = this.phase === 2 ? PHASE2_SPEED : PHASE1_SPEED;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;
    }

    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
  }

  shoot(targetX, targetY) {
    if (this.shootCooldown > 0) return [];

    this.shootCooldown = SHOOT_INTERVAL;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const baseAngle = Math.atan2(dy, dx);

    const count = this.phase === 2 ? 5 : 3;
    const spread = Math.PI / 6; // 30도 간격
    const projectileSpeed = 250;
    const damage = 15;

    const projectiles = [];
    const half = Math.floor(count / 2);
    for (let i = -half; i <= half; i++) {
      const angle = baseAngle + i * spread;
      projectiles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * projectileSpeed,
        vy: Math.sin(angle) * projectileSpeed,
        damage,
      });
    }
    return projectiles;
  }

  getDialogue(key) {
    if (key === 'taunt') {
      const lines = DIALOGUES.taunt;
      return lines[Math.floor(Math.random() * lines.length)];
    }
    return DIALOGUES[key] ?? '';
  }

  render(ctx) {
    if (BOSS_SPRITE) {
      if (this.phase === 2) {
        PixelRenderer.drawSpriteTinted(ctx, BOSS_SPRITE, this.x - this.width / 2, this.y - this.height / 2, 2, '#cc0044', 0.3);
      } else {
        PixelRenderer.drawSprite(ctx, BOSS_SPRITE, this.x - this.width / 2, this.y - this.height / 2, 2);
      }
    } else {
      // 폴백: 기존 단색 렌더
      ctx.fillStyle = this.phase === 2 ? '#cc0066' : '#990099';
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    // 피격 플래시
    if (this.hitFlashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.restore();
    }
  }
}
