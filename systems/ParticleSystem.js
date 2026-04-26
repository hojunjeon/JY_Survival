export const ENEMY_TYPE_COLORS = {
  syntax_error:      '#ff2200',
  null_pointer:      '#aabbff',
  seg_fault:         '#cc6600',
  heal_bug:          '#22cc44',
  indentation_error: '#ff8800',
  env_error:         '#2255cc',
};

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

  addEnemyDeath(x, y, count = 8, enemyType = null) {
    let colors;
    if (enemyType && ENEMY_TYPE_COLORS[enemyType]) {
      const mainColor = ENEMY_TYPE_COLORS[enemyType];
      colors = [mainColor, '#ffffff', mainColor];
    } else {
      colors = ['#ff69b4', '#aaaaaa', '#ff99cc'];
    }
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

  addWeaponTrail(x, y, weaponType, level = 1) {
    if (weaponType === 'python') {
      // Python: Level-based trail scaling (Lv1-5)
      const levelConfig = {
        1: { count: 5, shadowBlur: 0, hasWave: false, hasGradient: false, hasSplash: false },
        2: { count: 8, shadowBlur: 5, hasWave: false, hasGradient: false, hasSplash: false },
        3: { count: 12, shadowBlur: 10, hasWave: true, waveAmplitude: 3, hasGradient: false, hasSplash: false },
        4: { count: 16, shadowBlur: 15, hasWave: true, waveAmplitude: 3, hasGradient: true, hasSplash: false },
        5: { count: 20, shadowBlur: 20, hasWave: true, waveAmplitude: 3, hasGradient: true, hasSplash: true },
      };
      const config = levelConfig[Math.min(level, 5)] || levelConfig[1];

      for (let i = 0; i < config.count; i++) {
        const alpha = i / config.count;
        const offsetX = config.hasWave ? Math.sin(alpha * Math.PI) * config.waveAmplitude : 0;
        const color = config.hasGradient
          ? (i % 2 === 0 ? '#44ff44' : '#88ffaa')
          : '#44ff44';

        this.particles.push({
          x: x + offsetX,
          y,
          vx: 0,
          vy: 0,
          life: 0.15 + (alpha * 0.1),
          maxLife: 0.25,
          color,
          size: 2 + (1 - alpha) * 1.5,
          shadowBlur: config.shadowBlur,
          shadowColor: '#44ff44',
        });
      }

      // Lv5: Add splash particles
      if (config.hasSplash) {
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const splashDist = 8;
          this.particles.push({
            x: x + Math.cos(angle) * splashDist,
            y: y + Math.sin(angle) * splashDist,
            vx: Math.cos(angle) * 30,
            vy: Math.sin(angle) * 30,
            life: 0.2,
            maxLife: 0.3,
            color: '#88ffaa',
            size: 2,
            shadowBlur: 8,
            shadowColor: '#44ff44',
          });
        }
      }
    } else if (weaponType === 'c') {
      // C/C++: Level-based trail scaling (Lv1-5)
      const levelConfig = {
        1: { count: 4, shadowBlur: 0 },
        2: { count: 6, shadowBlur: 5 },
        3: { count: 8, shadowBlur: 10 },
        4: { count: 10, shadowBlur: 15 },
        5: { count: 12, shadowBlur: 20 }, // Lv5: max glow effect
      };
      const config = levelConfig[Math.min(level, 5)] || levelConfig[1];

      for (let i = 0; i < config.count; i++) {
        const alpha = i / config.count;
        this.particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          life: 0.15 + (alpha * 0.1),
          maxLife: 0.25,
          color: '#64b4ff',
          size: 2 + (1 - alpha) * 1.5,
          shadowBlur: config.shadowBlur,
          shadowColor: '#64b4ff',
        });
      }
    }
  }

  addWeaponHit(x, y, weaponType, level = 1) {
    if (weaponType === 'c') {
      // C/C++ 명중: Level-based ring expansion (Lv1-5)
      const levelConfig = {
        1: { maxSize: 0, ringCount: 0 },
        2: { maxSize: 10, ringCount: 1 },
        3: { maxSize: 15, ringCount: 1, fadeTime: 0.3 },
        4: { maxSize: 20, ringCount: 2 },
        5: { maxSize: 25, ringCount: 2, sparks: 4 },
      };
      const config = levelConfig[Math.min(level, 5)] || levelConfig[1];

      // Main ring(s)
      if (config.ringCount >= 1) {
        this.particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          life: config.fadeTime || 0.3,
          maxLife: config.fadeTime || 0.3,
          color: '#64b4ff',
          size: 1,
          maxSize: config.maxSize,
          type: 'ring-expand',
          shadowBlur: 10,
          shadowColor: '#64b4ff',
        });
      }

      // Double ring for Lv4+
      if (config.ringCount >= 2) {
        this.particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          life: 0.35,
          maxLife: 0.35,
          color: '#64b4ff',
          size: 1,
          maxSize: config.maxSize * 0.7,
          type: 'ring-expand',
          shadowBlur: 8,
          shadowColor: '#64b4ff',
        });
      }

      // Spark particles for Lv5
      if (config.sparks) {
        for (let i = 0; i < config.sparks; i++) {
          const angle = (i / config.sparks) * Math.PI * 2;
          const speed = 80;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.25,
            maxLife: 0.3,
            color: '#64b4ff',
            size: 2,
            shadowBlur: 5,
            shadowColor: '#64b4ff',
          });
        }
      }
    } else {
      // 기타 weaponType: addHitSpark fallback
      this.addHitSpark(x, y, '#ffffff', 3);
    }
  }

  addOrbitalTail(x, y, level = 1) {
    // Java (Orbital JVM): Level-based orbital effects (Lv1-5)
    const levelConfig = {
      1: { tailCount: 4, orbitalCount: 3, ringRadius: 0, hasRing: false, hasGlow: false, hasOuterRing: false, hasPulse: false },
      2: { tailCount: 6, orbitalCount: 3, ringRadius: 36, hasRing: true, hasGlow: false, hasOuterRing: false, hasPulse: false },
      3: { tailCount: 8, orbitalCount: 3, ringRadius: 40, hasRing: true, hasGlow: true, hasOuterRing: false, hasPulse: false },
      4: { tailCount: 8, orbitalCount: 4, ringRadius: 40, hasRing: true, hasGlow: true, hasOuterRing: false, hasPulse: false },
      5: { tailCount: 10, orbitalCount: 4, ringRadius: 45, hasRing: true, hasGlow: true, hasOuterRing: true, hasPulse: true },
    };
    const config = levelConfig[Math.min(level, 5)] || levelConfig[1];

    // Tail particles
    for (let i = 0; i < config.tailCount; i++) {
      const alpha = (config.tailCount - i) / config.tailCount;
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

    // Main orbital ring
    if (config.hasRing) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.1,
        maxLife: 0.1,
        color: config.hasGlow ? 'rgba(255,160,50,0.25)' : 'rgba(255,160,50,0.15)',
        size: config.ringRadius,
        type: 'ring',
      });
    }

    // Outer ring for Lv5
    if (config.hasOuterRing) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.12,
        maxLife: 0.12,
        color: 'rgba(255,160,50,0.1)',
        size: config.ringRadius + 20,
        type: 'ring',
      });
    }

    // Core pulse for Lv5
    if (config.hasPulse) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.15,
        maxLife: 0.15,
        color: '#ffa032',
        size: 3,
        shadowBlur: 15,
        shadowColor: '#ffa032',
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
