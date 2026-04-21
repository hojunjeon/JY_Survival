export class FloatingTextManager {
  constructor() {
    this.texts = [];
  }

  add(text, x, y, color = '#ffffff', options = {}) {
    const duration = options.duration ?? 1.0;
    const size = options.size ?? 14;
    this.texts.push({ text, x, y, color, life: duration, maxLife: duration, size });
  }

  update(dt) {
    for (const t of this.texts) t.life -= dt;
    this.texts = this.texts.filter(t => t.life > 0);
  }

  render(ctx, cameraX, cameraY) {
    for (const t of this.texts) {
      const alpha = t.life / t.maxLife;
      const offsetY = (1 - alpha) * 30;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x - cameraX, t.y - cameraY - offsetY);
      ctx.restore();
    }
  }
}
