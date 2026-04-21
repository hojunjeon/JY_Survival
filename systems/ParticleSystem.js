export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addHitSpark(x, y, color = '#ffffff', count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        color,
        size: 3 + Math.random() * 2,
      });
    }
  }

  addEnemyDeath(x, y, count = 8) {
    const colors = ['#ff69b4', '#aaaaaa', '#ff99cc'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        size: 4 + Math.random() * 3,
      });
    }
  }

  addHeal(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: -(30 + Math.random() * 50),
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        color: '#4caf50',
        size: 3 + Math.random() * 2,
      });
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      const size = p.size * alpha;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y - cameraY, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
