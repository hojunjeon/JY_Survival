export class HUD {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
  }

  render(ctx, { playerHp, playerMaxHp, killCount, q1Target, elapsed, e1State, e3State, bossState, e1Kills = 0, e3Kills = 0, e3Elapsed = 0 }) {
    ctx.save();

    this._renderHpBar(ctx, playerHp, playerMaxHp);
    this._renderKillCount(ctx, killCount, q1Target);
    this._renderTimer(ctx, elapsed);
    this._renderEventStatus(ctx, e1State, e3State, bossState, e1Kills, e3Kills, e3Elapsed);

    ctx.restore();
  }

  _renderHpBar(ctx, hp, maxHp) {
    const BAR_W = 200;
    const BAR_H = 18;
    const x = 10;
    const y = 10;

    // 배경
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, BAR_W, BAR_H);

    // HP 바
    const ratio = maxHp > 0 ? hp / maxHp : 0;
    const barW = BAR_W * ratio;
    ctx.fillStyle = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ff9800' : '#f44336';
    ctx.fillRect(x, y, barW, BAR_H);

    // 테두리
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, BAR_W, BAR_H);

    // HP 텍스트
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`HP ${hp} / ${maxHp}`, x + 4, y + BAR_H / 2);
  }

  _renderKillCount(ctx, killCount, q1Target) {
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`킬: ${killCount} / ${q1Target}`, 10, 36);
  }

  _renderTimer(ctx, elapsed) {
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
    const timeStr = `${mins}:${secs}`;

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(timeStr, this.cw / 2, 8);
  }

  _renderEventStatus(ctx, e1State, e3State, bossState, e1Kills, e3Kills, e3Elapsed) {
    ctx.font = '13px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    let y = 8;
    const x = this.cw - 10;

    if (bossState === 'active') {
      ctx.fillStyle = '#ff4444';
      ctx.fillText('⚠ BOSS 장선형 등장!', x, y);
      y += 20;
    }

    if (e1State === 'active') {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(`[E1] 들여쓰기 지옥 : IndentationError 처치 (${e1Kills}/15)`, x, y);
      y += 20;
    } else if (e1State === 'cleared') {
      ctx.fillStyle = '#4caf50';
      ctx.fillText('[E1] 클리어 ✓', x, y);
      y += 20;
    }

    if (e3State === 'active') {
      ctx.fillStyle = '#ff9800';
      ctx.fillText(`[E3] 파이참 위기 : EnvError 처치 (${e3Kills}/1) | 생존 ${Math.floor(e3Elapsed)}/60초`, x, y);
      y += 20;
    } else if (e3State === 'cleared') {
      ctx.fillStyle = '#4caf50';
      ctx.fillText('[E3] 클리어 ✓', x, y);
      y += 20;
    }
  }
}
