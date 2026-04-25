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

  addWeaponTrail(x, y, weaponType) {
    if (weaponType === 'python') {
      // Python: 20개 점, 사인파 진동, 색상 #44ff44/#88ffaa 교대
      for (let i = 0; i < 20; i++) {
        const alpha = i / 20; // 0 ~ 1: 뒤로 갈수록 alpha 증가
        const offsetX = Math.sin(alpha * Math.PI) * 4; // 사인파 진동
        const color = i % 2 === 0 ? '#44ff44' : '#88ffaa'; // 교대
        this.particles.push({
          x: x + offsetX,
          y,
          vx: 0,
          vy: 0,
          life: 0.15 + (alpha * 0.1), // 뒤 점들이 더 오래 유지
          maxLife: 0.25,
          color,
          size: 2 + (1 - alpha) * 1.5,
          shadowBlur: 20,
          shadowColor: '#44ff44',
        });
      }
    } else if (weaponType === 'c') {
      // C: 12개 점, 직선, 색상 #64b4ff
      for (let i = 0; i < 12; i++) {
        const alpha = i / 12;
        this.particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          life: 0.15 + (alpha * 0.1),
          maxLife: 0.25,
          color: '#64b4ff',
          size: 2 + (1 - alpha) * 1.5,
          shadowBlur: 10,
          shadowColor: '#64b4ff',
        });
      }
    }
  }

  addWeaponHit(x, y, weaponType) {
    if (weaponType === 'c') {
      // C 명중: 링 확장 파티클 (반경 0 → 20px, 0.3s)
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.3,
        maxLife: 0.3,
        color: '#64b4ff',
        size: 1,
        maxSize: 20,
        type: 'ring-expand',
        shadowBlur: 10,
        shadowColor: '#64b4ff',
      });
    } else {
      // 기타 weaponType: addHitSpark fallback
      this.addHitSpark(x, y, '#ffffff', 3);
    }
  }

  addOrbitalTail(x, y) {
    // Java 오브: 8개 잔상 점, 색상 #ffa032, shadowBlur:20, 뒤로 갈수록 alpha 감소
    for (let i = 0; i < 8; i++) {
      const alpha = (8 - i) / 8; // 뒤로 갈수록 alpha 감소 (1 ~ 0)
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.1 + (i * 0.01),
        maxLife: 0.15,
        color: '#ffa032',
        size: 2 + (1 - alpha) * 1.5,
        shadowBlur: 20,
        shadowColor: '#ffa032',
      });
    }
    // 공전 링 파티클: 반경 36, life 0.1s
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.1,
      maxLife: 0.1,
      color: 'rgba(255,160,50,0.15)',
      size: 36,
      type: 'ring',
    });
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
      ctx.save();

      if (p.type === 'ring') {
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'ring-expand') {
        const r = p.maxSize * (1 - p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        if (p.shadowBlur) {
          ctx.shadowBlur = p.shadowBlur;
          ctx.shadowColor = p.shadowColor || 'transparent';
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x - cameraX, p.y - cameraY, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // 기존 원형 파티클
        const size = p.size * alpha;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        if (p.shadowBlur) {
          ctx.shadowBlur = p.shadowBlur;
          ctx.shadowColor = p.shadowColor || p.color;
        }
        ctx.beginPath();
        ctx.arc(p.x - cameraX, p.y - cameraY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
