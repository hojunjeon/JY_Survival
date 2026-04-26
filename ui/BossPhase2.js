import { HUD } from './HUD.js';

export class BossPhase2 {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.bossData = null;
    this.displayTime = 0;
    this.autoDuration = 2000; // 2초 후 자동 전환
  }

  show(bossData) {
    this.bossData = bossData;
    this.visible = true;
    this.displayTime = Date.now();
  }

  hide() {
    this.visible = false;
  }

  isAutoTransitionReady() {
    if (!this.visible) return false;
    return Date.now() - this.displayTime >= this.autoDuration;
  }

  render(ctx) {
    if (!this.visible || !this.bossData) return;

    ctx.save();

    // 오렌지 오버레이
    const elapsed = Date.now() - this.displayTime;
    const fadeRatio = Math.min(1, elapsed / 500);
    ctx.fillStyle = `rgba(206, 145, 120, ${fadeRatio * 0.5})`;
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 모달 박스
    const boxW = 420;
    const boxH = 280;
    const boxX = (this.cw - boxW) / 2;
    const boxY = (this.ch - boxH) / 2;

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    let contentY = boxY + 12;

    // PHASE 2 제목
    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PHASE 2', this.cw / 2, contentY + 20);

    contentY += 40;

    // HP 바 (~50%)
    const barW = boxW - 24;
    const barX = boxX + 12;
    const barY = contentY;
    const barH = 6;

    ctx.fillStyle = HUD.COLORS.border;
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = `linear-gradient(90deg, ${HUD.COLORS.red}, ${HUD.COLORS.orange})`;
    const gradient = ctx.createLinearGradient(barX, barY, barX + barW * 0.5, barY);
    gradient.addColorStop(0, HUD.COLORS.red);
    gradient.addColorStop(1, HUD.COLORS.orange);
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW * 0.5, barH);

    contentY += 16;

    // 보스 픽셀 스프라이트 (분노 상태)
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = HUD.COLORS.red;
    const emoji = this.bossData.emoji || '👹';
    // 스케일/회전 효과 시뮬레이션
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillText(emoji, this.cw / 2, contentY + 35);
    ctx.restore();

    contentY += 70;

    // 격분 대사
    ctx.fillStyle = HUD.COLORS.red;
    ctx.font = 'bold italic 11px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    const dialogue = this.bossData.phase2Dialogue || '"넌... 강하군. 진짜 실력을 보여주겠다!"';
    this._renderWrappedText(ctx, dialogue, this.cw / 2, contentY, boxW - 24, 16, true);

    contentY += 36;

    // PHASE 2 변경사항 표시
    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(boxX + 12, contentY, boxW - 24, 50);

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 12, contentY, boxW - 24, 50);

    let changeY = contentY + 8;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('[ PHASE 2 변경사항 ]', boxX + 16, changeY);

    changeY += 12;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '7px monospace';
    ctx.fillText('• 공격 패턴 변화', boxX + 16, changeY);

    changeY += 10;

    ctx.fillText('• 추적 능력 강화', boxX + 16, changeY);

    // 자동 전환 힌트
    if (elapsed < 1500) {
      const remaining = Math.ceil((this.autoDuration - elapsed) / 1000);
      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`계속: ${remaining}초`, this.cw / 2, boxY + boxH + 20);
    }

    ctx.restore();
  }

  _renderWrappedText(ctx, text, x, y, maxW, lineHeight, center = false) {
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (ctx.measureText(testLine).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    const startY = y - (lines.length - 1) * lineHeight / 2;
    lines.forEach((l, i) => {
      if (center) {
        ctx.textAlign = 'center';
        ctx.fillText(l, x, startY + i * lineHeight);
      } else {
        ctx.fillText(l, x, startY + i * lineHeight);
      }
    });
  }
}
