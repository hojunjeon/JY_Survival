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

    ctx.save();

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, this.cw, this.ch);

    const PAD = 20;
    let y = 40;

    // 에러 헤더
    ctx.fillStyle = 'rgba(243, 139, 168, 0.12)';
    ctx.fillRect(PAD, y - 8, this.cw - PAD * 2, 36);
    ctx.strokeStyle = 'rgba(243, 139, 168, 0.33)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y - 8, this.cw - PAD * 2, 36);

    ctx.fillStyle = HUD.COLORS.red;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('✗ PlayerDied', PAD + 8, y);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('exit code 1', PAD + 8, y + 16);

    y += 48;

    // stacktrace
    ctx.font = '11px monospace';
    ctx.fillStyle = HUD.COLORS.red;
    ctx.fillText('Error: PlayerHP = 0', PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.comment;
    const trace = [
      '  at Game.checkDeath',
      '  at Enemy.onContact',
      '  at GameLoop.update',
    ];
    trace.forEach((line) => {
      ctx.fillText(line, PAD, y);
      y += 14;
    });

    y += 12;

    // run summary 박스
    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(PAD, y, this.cw - PAD * 2, 80);
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y, this.cw - PAD * 2, 80);

    let rowY = y + 10;

    const rows = [
      { label: '생존 시간', value: this._fmtTime(this.runStats.elapsed || 0), color: HUD.COLORS.timerVal },
      { label: '버그 처치', value: `${this.runStats.kills || 0}마리`, color: HUD.COLORS.teal2 },
      { label: '최대 콤보', value: `×${this.runStats.maxCombo || 0}`, color: HUD.COLORS.orange },
    ];

    rows.forEach((row) => {
      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(row.label, PAD + 8, rowY);

      ctx.fillStyle = row.color;
      ctx.textAlign = 'right';
      ctx.fillText(row.value, this.cw - PAD - 8, rowY);

      rowY += 18;
    });

    // 버튼 (하단 고정)
    const BTN_Y = this.ch - 80;
    const btnW = (this.cw - PAD * 2 - 12) / 2;
    const btnH = 28;
    const btn1X = PAD;
    const btn2X = PAD + btnW + 12;

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(btn1X, BTN_Y, btnW, btnH);
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('exit', btn1X + btnW / 2, BTN_Y + btnH / 2);

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(btn2X, BTN_Y, btnW, btnH);
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('game.restart()', btn2X + btnW / 2, BTN_Y + btnH / 2);

    // 키보드 힌트
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('R: restart', this.cw / 2, this.ch - 30);

    // 스테이터스 바
    ctx.fillStyle = '#6c1a1a';
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('✗ GAME OVER', 8, this.ch - 8);
    ctx.textAlign = 'right';
    ctx.fillText(this._fmtTime(this.runStats.elapsed || 0), this.cw - 8, this.ch - 8);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];

    const PAD = 20;
    const BTN_Y = this.ch - 80;
    const btnW = (this.cw - PAD * 2 - 12) / 2;
    const btnH = 28;

    return [
      { x: PAD, y: BTN_Y, w: btnW, h: btnH, action: 'exit' },
      { x: PAD + btnW + 12, y: BTN_Y, w: btnW, h: btnH, action: 'restart' },
    ];
  }

  _fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
