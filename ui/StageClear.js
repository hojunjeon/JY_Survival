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

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    const PAD = 20;
    const stageNum = this.stageStats.stageNumber || 1;
    const nextStage = stageNum + 1;
    let y = 40;

    // 터미널 헤더
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`$ git commit -m "feat: Stage ${stageNum} 완료"`, PAD, y);

    y += 24;

    // commit 박스
    ctx.fillStyle = 'rgba(78, 201, 176, 0.08)';
    ctx.fillRect(PAD, y, this.cw - PAD * 2, 50);
    ctx.strokeStyle = 'rgba(78, 201, 176, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y, this.cw - PAD * 2, 50);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('COMMIT', PAD + 8, y + 8);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`feat: Stage ${stageNum} Python 기초 완료`, PAD + 8, y + 22);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('Author: 김지윤', PAD + 8, y + 36);

    y += 62;

    // 클리어 로그
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(`  Stage ${stageNum} 완료`, PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText('  보스 "장선형" 처치 ✓', PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText('  퀘스트 Q1 달성 ✓', PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillText('  보상: Git.exe, 재화 ×5', PAD, y);

    y += 24;

    // 3열 통계 그리드
    const gridW = this.cw - PAD * 2;
    const colW = gridW / 3;

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y, gridW, 44);

    const cols = [
      { label: '처치', value: String(this.stageStats.kills || 0), color: HUD.COLORS.teal2 },
      { label: '시간', value: this._fmtTime(this.stageStats.elapsed || 0), color: HUD.COLORS.timerVal },
      { label: '재화', value: `+${this.stageStats.enhance || 0}`, color: HUD.COLORS.orange },
    ];

    cols.forEach((col, i) => {
      const cx = PAD + i * colW + colW / 2;

      if (i < cols.length - 1) {
        ctx.strokeStyle = HUD.COLORS.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD + (i + 1) * colW, y);
        ctx.lineTo(PAD + (i + 1) * colW, y + 44);
        ctx.stroke();
      }

      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(col.label, cx, y + 6);

      ctx.fillStyle = col.color;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(col.value, cx, y + 22);
    });

    // 다음 스테이지 버튼 (하단 고정)
    const BTN_Y = this.ch - 80;
    const btnW = this.cw - PAD * 2;
    const btnH = 32;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(PAD, BTN_Y, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`git push origin Stage${nextStage} →`, PAD + btnW / 2, BTN_Y + btnH / 2);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
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
