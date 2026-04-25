import { HUD } from './HUD.js';

export class GameOver {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.runStats = null;
  }

  show(runStats = {}) {
    this.runStats = runStats;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible) return;

    // 검정 배경
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, this.cw, this.ch);

    let contentY = 40;

    // 스택 트레이스
    ctx.fillStyle = HUD.COLORS.red;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PlayerDeadError: Player.hp <= 0', 20, contentY);

    contentY += 24;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    const stackTrace = [
      '  at Player.takeDamage (entities/Player.js:87)',
      '  at mainGameLoop (main.js:412)',
      '  at requestAnimationFrame (main.js:1200)',
      '  at Engine.run (core/Game.js:45)',
    ];
    stackTrace.forEach((line) => {
      ctx.fillText(line, 20, contentY);
      contentY += 12;
    });

    contentY += 16;

    // RUN SUMMARY
    ctx.fillStyle = HUD.COLORS.text;
    ctx.font = 'bold 13px monospace';
    ctx.fillText('// ═══════════════════════════════════', 20, contentY);

    contentY += 18;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('// RUN SUMMARY', 20, contentY);

    contentY += 18;

    // 통계 테이블
    const stats = [
      { label: '생존시간', value: `${this.runStats.elapsed || 0}s`, color: HUD.COLORS.timerVal },
      { label: '처치수', value: `${this.runStats.kills || 0}`, color: HUD.COLORS.value },
      { label: '최대콤보', value: `${this.runStats.maxCombo || 0}`, color: HUD.COLORS.keyword },
      { label: '도달웨이브', value: `${this.runStats.maxWave || 1}`, color: HUD.COLORS.teal2 },
    ];

    stats.forEach((stat) => {
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, 20, contentY);

      ctx.fillStyle = HUD.COLORS.text;
      ctx.textAlign = 'right';
      ctx.fillText(stat.value, this.cw - 20, contentY);

      contentY += 16;
    });

    contentY += 12;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// ═══════════════════════════════════', 20, contentY);

    contentY += 24;

    // 버튼들
    const btnW = 100;
    const btnH = 24;
    const btnGap = 16;
    const totalBtnW = btnW * 2 + btnGap;
    const btnX = (this.cw - totalBtnW) / 2;
    const btnY = contentY;

    // Exit 버튼
    ctx.fillStyle = HUD.COLORS.border;
    ctx.fillRect(btnX, btnY, btnW, btnH);

    ctx.strokeStyle = HUD.COLORS.comment;
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX, btnY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[ exit ]', btnX + btnW / 2, btnY + btnH / 2);

    // Restart 버튼
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillRect(btnX + btnW + btnGap, btnY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ restart ]', btnX + btnW + btnGap + btnW / 2, btnY + btnH / 2);

    // 키보드 힌트
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('R: restart | Q: exit', this.cw / 2, this.ch - 30);
  }

  getHitboxes() {
    if (!this.visible) return [];

    const btnW = 100;
    const btnH = 24;
    const btnGap = 16;
    const totalBtnW = btnW * 2 + btnGap;
    const btnX = (this.cw - totalBtnW) / 2;
    const btnY = 240; // Approximate, depends on rendered height

    return [
      {
        x: btnX,
        y: btnY,
        w: btnW,
        h: btnH,
        action: 'exit',
      },
      {
        x: btnX + btnW + btnGap,
        y: btnY,
        w: btnW,
        h: btnH,
        action: 'restart',
      },
    ];
  }
}
