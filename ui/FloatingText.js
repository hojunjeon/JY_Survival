export class FloatingTextManager {
  constructor() {
    this.texts = [];
  }

  add(text, x, y, color = '#ffffff') {
    this.texts.push({ text, x, y, color, life: 1.0, maxLife: 1.0 });
  }

  update(dt) {
    for (const t of this.texts) t.life -= dt;
    this.texts = this.texts.filter(t => t.life > 0);
  }

  render(ctx, cameraX, cameraY) {
    for (const t of this.texts) {
      const alpha = t.life / t.maxLife;
      const offsetY = (1 - alpha) * 30; // 위로 30px 이동
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x - cameraX, t.y - cameraY - offsetY);
      ctx.restore();
    }
  }
}
