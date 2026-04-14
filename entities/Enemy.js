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
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isDead = true;
  }

  update(dt, targetX, targetY) {
    if (dt === 0) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const dirX = dx / dist;
    const dirY = dy / dist;

    if (this.flees) {
      this.x -= dirX * this.speed * dt;
      this.y -= dirY * this.speed * dt;
    } else {
      this.x += dirX * this.speed * dt;
      this.y += dirY * this.speed * dt;
    }
  }

  render(ctx) {
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
}

const ENEMY_STATS = {
  syntax_error:      { hp: 40,  speed: 80,  contactDamage: 10, flees: false, dropsHpItem: false },
  null_pointer:      { hp: 20,  speed: 140, contactDamage: 5,  flees: false, dropsHpItem: false },
  seg_fault:         { hp: 100, speed: 40,  contactDamage: 25, flees: false, dropsHpItem: false },
  heal_bug:          { hp: 15,  speed: 150, contactDamage: 0,  flees: true,  dropsHpItem: true  },
  // 이벤트 전용
  indentation_error: { hp: 60,  speed: 70,  contactDamage: 15, flees: false, dropsHpItem: false },
  env_error:         { hp: 130, speed: 35,  contactDamage: 15, flees: false, dropsHpItem: false },
};

export function createEnemy(type, x, y) {
  const stats = ENEMY_STATS[type];
  if (!stats) throw new Error(`Unknown enemy type: ${type}`);
  return new Enemy(x, y, { ...stats, type });
}
