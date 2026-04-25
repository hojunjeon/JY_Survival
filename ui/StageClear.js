import { HUD } from './HUD.js';

export class StageClear {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.stageStats = null;
  }

  show(stageStats = {}) {
    this.stageStats = stageStats;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible) return;

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    let contentY = 40;

    // Git commit 형식 헤더
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('git log --oneline -1', 20, contentY);

    contentY += 18;

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = 'bold 11px monospace';
    const stageNum = this.stageStats.stageNumber || 1;
    const nextStage = stageNum + 1;
    ctx.fillText(`3a7f9e2 feat: Stage ${stageNum} clear 도달 (Boss 처치 ✓ + 퀘스트 3/3)`, 20, contentY);

    contentY += 22;

    // 클리어 로그
    ctx.fillStyle = HUD.COLORS.value;
    ctx.font = '9px monospace';
    ctx.fillText('✓ Boss 처치', 20, contentY);

    contentY += 14;

    ctx.fillText('✓ Quest 3/3 완료', 20, contentY);

    contentY += 14;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillText('+ 무기 획득 (E2 보상)', 20, contentY);

    contentY += 18;

    // 통계 표
    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(20, contentY, this.cw - 40, 100);

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, contentY, this.cw - 40, 100);

    let tableY = contentY + 8;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('STATISTICS', 28, tableY);

    tableY += 14;

    // 표 헤더
    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.font = '8px monospace';
    const col1X = 28;
    const col2X = this.cw / 2;
    ctx.fillText('처치수', col1X, tableY);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.stageStats.kills || 0}`, col2X - 8, tableY);

    tableY += 12;

    ctx.fillStyle = HUD.COLORS.timerKey;
    ctx.textAlign = 'left';
    ctx.fillText('소요시간', col1X, tableY);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.stageStats.elapsed || 0}s`, col2X - 8, tableY);

    tableY += 12;

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.textAlign = 'left';
    ctx.fillText('강화 재화', col1X, tableY);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.stageStats.enhance || 0}`, col2X - 8, tableY);

    tableY += 12;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.textAlign = 'left';
    ctx.fillText('보상 코인', col1X, tableY);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.stageStats.coins || 0}`, col2X - 8, tableY);

    contentY += 108;

    // 다음 스테이지 버튼
    const btnW = 240;
    const btnH = 24;
    const btnX = (this.cw - btnW) / 2;
    const btnY = contentY;

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillRect(btnX, btnY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[ git push origin Stage${nextStage} → ]`, btnX + btnW / 2, btnY + btnH / 2);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`✓ Stage ${stageNum} Cleared`, 8, this.ch - 5);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.stageStats.kills || 0} kills`, this.cw - 8, this.ch - 5);
  }

  getHitboxes() {
    if (!this.visible) return [];

    const btnW = 240;
    const btnH = 24;
    const btnX = (this.cw - btnW) / 2;
    const btnY = 200; // Approximate

    return [
      {
        x: btnX,
        y: btnY,
        w: btnW,
        h: btnH,
        action: 'next-stage',
      },
    ];
  }
}
