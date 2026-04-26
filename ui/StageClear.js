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

    ctx.save();

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 모달 윈도우 설정
    const PAD = 20;
    const stageNum = this.stageStats.stageNumber || 1;
    const nextStage = stageNum + 1;
    const modalW = this.cw - PAD * 2;
    const modalH = this.ch - PAD * 2 - 16; // status bar 제외
    const modalX = PAD;
    const modalY = PAD;

    // 타이틀바
    ctx.fillStyle = '#181825';
    ctx.fillRect(modalX, modalY, modalW, 20);

    // 타이틀바 dots (red, yellow, green)
    [['#f55',0],['#fb0',1],['#5c5',2]].forEach(([c,i]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(modalX + 10 + i * 14, modalY + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 타이틀바 텍스트
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`git commit — Stage ${stageNum} 완료`, modalX + 52, modalY + 10);

    let contentY = modalY + 28;

    // git 커맨드 라인
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`$ git commit -m "feat: Stage ${stageNum} 완료"`, modalX + 8, contentY);
    contentY += 16;

    // commit-box
    const commitX = modalX + 8;
    const commitY = contentY;
    const commitW = modalW - 16;
    const commitH = 50;

    ctx.fillStyle = 'rgba(78,201,176,0.08)';
    ctx.fillRect(commitX, commitY, commitW, commitH);
    ctx.strokeStyle = 'rgba(78,201,176,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(commitX, commitY, commitW, commitH);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('COMMIT', commitX + 8, commitY + 8);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`feat: Stage ${stageNum} Python 기초 완료`, commitX + 8, commitY + 22);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = HUD.FONTS.xs;
    ctx.fillText('Author: 김지윤', commitX + 8, commitY + 36);

    contentY = commitY + commitH + 12;

    // 클리어 로그
    ctx.font = HUD.FONTS.sm;
    ctx.textAlign = 'left';

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(`  Stage ${stageNum} 완료`, modalX + 8, contentY);
    contentY += 16;

    ctx.fillStyle = HUD.COLORS.green;
    ctx.fillText('  보스 "장선형" 처치 ✓', modalX + 8, contentY);
    contentY += 16;

    ctx.fillStyle = HUD.COLORS.green;
    ctx.fillText('  퀘스트 Q1 달성 ✓', modalX + 8, contentY);
    contentY += 16;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillText('  보상: Git.exe, 재화 ×5', modalX + 8, contentY);

    contentY += 24;

    // 3열 통계 그리드
    const gridW = modalW - 16;
    const gridX = modalX + 8;
    const gridY = contentY;
    const gridH = 44;
    const colW = gridW / 3;

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(gridX, gridY, gridW, gridH);

    const cols = [
      { label: '처치', value: String(this.stageStats.kills || 0), color: HUD.COLORS.teal2 },
      { label: '시간', value: this._fmtTime(this.stageStats.elapsed || 0), color: HUD.COLORS.timerVal },
      { label: '재화', value: `+${this.stageStats.enhance || 0}`, color: HUD.COLORS.orange },
    ];

    cols.forEach((col, i) => {
      const cx = gridX + i * colW + colW / 2;

      if (i < cols.length - 1) {
        ctx.strokeStyle = HUD.COLORS.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gridX + (i + 1) * colW, gridY);
        ctx.lineTo(gridX + (i + 1) * colW, gridY + gridH);
        ctx.stroke();
      }

      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = HUD.FONTS.xs;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(col.label, cx, gridY + 6);

      ctx.fillStyle = col.color;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(col.value, cx, gridY + 22);
    });

    // 다음 스테이지 버튼
    const btnH = 32;
    const btnY = modalY + modalH - 12 - btnH;
    const btnW = modalW - 16;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(modalX + 8, btnY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`git push origin Stage${nextStage} →`, modalX + modalW / 2, btnY + btnH / 2);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ STAGE CLEAR', 8, this.ch - 8);
    ctx.textAlign = 'right';
    ctx.fillText('main ↑1', this.cw - 8, this.ch - 8);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];

    const PAD = 20;
    const BTN_Y = this.ch - 80;
    const btnW = this.cw - PAD * 2;
    const btnH = 32;

    return [
      { x: PAD, y: BTN_Y, w: btnW, h: btnH, action: 'next-stage' },
    ];
  }

  _fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
