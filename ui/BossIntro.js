import { HUD } from './HUD.js';

export class BossIntro {
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

    // 빨강 오버레이
    const elapsed = Date.now() - this.displayTime;
    const fadeRatio = Math.min(1, elapsed / 500); // 0.5초에 걸쳐 fade in
    ctx.fillStyle = `rgba(243, 139, 168, ${fadeRatio * 0.12})`;
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 모달 박스
    const boxW = 420;
    const boxH = 300;
    const boxX = (this.cw - boxW) / 2;
    const boxY = (this.ch - boxH) / 2;

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.strokeStyle = HUD.COLORS.red;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    let contentY = boxY + 12;

    // 보스 이름
    ctx.fillStyle = HUD.COLORS.red;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    const bossName = this.bossData.name || 'Boss';
    ctx.fillText(bossName, this.cw / 2, contentY + 20);

    contentY += 40;

    // HP 바 (100%)
    const barW = boxW - 24;
    const barX = boxX + 12;
    const barY = contentY;
    const barH = 6;

    ctx.fillStyle = HUD.COLORS.border;
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = HUD.COLORS.red;
    ctx.fillRect(barX, barY, barW, barH);

    contentY += 16;

    // 픽셀 스프라이트 (텍스트 기반)
    ctx.font = '42px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.bossData.emoji || '👹', this.cw / 2, contentY + 30);

    contentY += 70;

    // 보스 대사
    ctx.fillStyle = HUD.COLORS.timerVal;
    ctx.font = 'italic 10px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    const dialogue = this.bossData.dialogue || '"넌 여기까지가 끝이다!"';
    this._renderWrappedText(ctx, dialogue, this.cw / 2, contentY, boxW - 24, 16, true);

    contentY += 36;

    // 스탯 표 (3열 그리드)
    const gridW = boxW - 24;
    const gridX = boxX + 12;
    const colW = gridW / 3;

    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(gridX, contentY, gridW, 44);
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(gridX, contentY, gridW, 44);

    const stats = [
      { label: 'HP', value: String(this.bossData.hp || '500'), color: HUD.COLORS.red },
      { label: '공격', value: String(this.bossData.attack || '3방향'), color: HUD.COLORS.orange },
      { label: '추적', value: String(this.bossData.tracking || '보통'), color: HUD.COLORS.yellow },
    ];

    stats.forEach((stat, i) => {
      const cx = gridX + i * colW + colW / 2;

      if (i < stats.length - 1) {
        ctx.strokeStyle = HUD.COLORS.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gridX + (i + 1) * colW, contentY);
        ctx.lineTo(gridX + (i + 1) * colW, contentY + 44);
        ctx.stroke();
      }

      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(stat.label, cx, contentY + 6);

      ctx.fillStyle = stat.color;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(stat.value, cx, contentY + 22);
    });

    // 자동 전환 힌트
    if (elapsed < 1500) {
      const remaining = Math.ceil((this.autoDuration - elapsed) / 1000);
      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`자동 시작: ${remaining}초`, this.cw / 2, boxY + boxH + 20);
    }
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
