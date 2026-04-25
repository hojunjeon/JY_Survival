export class HUD {
  static COLORS = {
    bg:          '#1e1e2e',
    border:      '#313244',
    text:        '#cdd6f4',
    keyword:     '#cba6f7',   // purple — hp, kills 키워드
    value:       '#a6e3a1',   // green — 킬/HP 값
    timerKey:    '#89b4fa',   // blue — elapsed 키워드
    timerVal:    '#f5c2e7',   // pink — 타이머 값
    comment:     '#45475a',   // gray — // 주석
    red:         '#f38ba8',   // 저체력
    orange:      '#f9e2af',   // 중체력
    orangeAcc:   '#fab387',
    teal:        '#94e2d5',
    // Phase 11 UI 확장 토큰
    teal2:       '#4ec9b0',   // VSCode teal — accent highlight
    red2:        '#f44747',   // VSCode red — error
    orange2:     '#ce9178',   // VSCode orange — string
    yellow:      '#dcdcaa',   // VSCode yellow — constant
    blue:        '#9cdcfe',   // VSCode blue — variable
    green:       '#b5cea8',   // VSCode green — number
    statusBar:   '#007acc',   // VSCode status bar blue
    sidebar:     '#252526',   // VSCode sidebar dark
    panel:       '#2d2d2d',   // VSCode panel dark
  };

  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
  }

  render(ctx, { playerHp, playerMaxHp, killCount, q1Target, elapsed, e1State, e2State, bossState, e1Kills = 0, e2Kills = 0, e2Elapsed = 0 }) {
    ctx.save();

    this._renderHpBar(ctx, playerHp, playerMaxHp);
    this._renderKillCount(ctx, killCount, q1Target);
    this._renderTimer(ctx, elapsed);
    this._renderEventStatus(ctx, e1State, e2State, bossState, e1Kills, e2Kills, e2Elapsed);

    ctx.restore();
  }

  _renderHpBar(ctx, hp, maxHp) {
    const BAR_W = 200;
    const BAR_H = 18;
    const x = 10;
    const y = 10;

    // 배경
    ctx.fillStyle = HUD.COLORS.border;
    ctx.fillRect(x, y, BAR_W, BAR_H);

    // HP 비율
    const ratio = maxHp > 0 ? hp / maxHp : 0;
    const barW = BAR_W * ratio;

    // HP 바 채우기 (3단계 그라데이션 또는 펄스)
    if (ratio > 0.5) {
      // 50% 초과: 그린→틸 그라데이션 + 섀도우
      const gradient = ctx.createLinearGradient(x, y, x + barW, y);
      gradient.addColorStop(0, HUD.COLORS.value);      // #a6e3a1
      gradient.addColorStop(1, HUD.COLORS.teal);       // #94e2d5
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barW, BAR_H);

      // 섀도우 효과 (수동으로 반투명 선 추가)
      ctx.strokeStyle = 'rgba(166, 227, 161, 0.53)'; // #a6e3a188
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, BAR_H);
    } else if (ratio > 0.25) {
      // 25~50%: 오렌지→오렌지 그라데이션 + 섀도우
      const gradient = ctx.createLinearGradient(x, y, x + barW, y);
      gradient.addColorStop(0, HUD.COLORS.orange);     // #f9e2af
      gradient.addColorStop(1, HUD.COLORS.orangeAcc);  // #fab387
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barW, BAR_H);

      ctx.strokeStyle = 'rgba(249, 226, 175, 0.53)'; // #f9e2af88
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, BAR_H);
    } else {
      // 25% 이하: 빨강 + 펄스 (opacity 0.6~1.0, 800ms 주기)
      const now = Date.now();
      const pulseCycle = 800;
      const cyclePos = (now % pulseCycle) / pulseCycle;
      const opacity = 0.6 + 0.4 * Math.abs(Math.sin(cyclePos * Math.PI));

      ctx.fillStyle = `rgba(243, 139, 168, ${opacity})`; // #f38ba8
      ctx.fillRect(x, y, barW, BAR_H);
    }

    // 테두리
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, BAR_W, BAR_H);

    // HP 텍스트: "hp = {hp} / {maxHp}" 형식, 색상 분리
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textY = y + BAR_H / 2;
    let textX = x + 4;

    // "hp" - keyword 색상
    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('hp', textX, textY);
    textX += ctx.measureText('hp').width;

    // " = " - text 색상
    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(' = ', textX, textY);
    textX += ctx.measureText(' = ').width;

    // hp 값 - text 색상
    const hpStr = String(hp);
    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(hpStr, textX, textY);
    textX += ctx.measureText(hpStr).width;

    // " / " - text 색상
    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(' / ', textX, textY);
    textX += ctx.measureText(' / ').width;

    // maxHp 값 - text 색상
    const maxHpStr = String(maxHp);
    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(maxHpStr, textX, textY);
  }

  _renderKillCount(ctx, killCount, q1Target) {
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const x = 10;
    const y = 36;
    let textX = x;

    // "kills" - keyword 색상
    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('kills', textX, y);
    textX += ctx.measureText('kills').width;

    // " = " - text 색상
    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(' = ', textX, y);
    textX += ctx.measureText(' = ').width;

    // killCount 값 - value 색상
    const killCountStr = String(killCount);
    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText(killCountStr, textX, y);
    textX += ctx.measureText(killCountStr).width;

    // "  // target: " - comment 색상
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.fillText('  // target: ', textX, y);
    textX += ctx.measureText('  // target: ').width;

    // q1Target 값 - value 색상
    const q1TargetStr = String(q1Target);
    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText(q1TargetStr, textX, y);
  }

  _renderTimer(ctx, elapsed) {
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
    const timeStr = `"${mins}:${secs}"`;

    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // "elapsed" - timerKey 색상
    ctx.fillStyle = HUD.COLORS.timerKey;
    const elapseWidth = ctx.measureText('elapsed').width;
    ctx.fillText('elapsed', 0, 8);

    // " = " - text 색상
    ctx.fillStyle = HUD.COLORS.text;
    const equalsWidth = ctx.measureText(' = ').width;
    ctx.fillText(' = ', elapseWidth, 8);

    // "3:42" (따옴표 포함) - timerVal 색상
    ctx.fillStyle = HUD.COLORS.timerVal;
    const valueWidth = ctx.measureText(timeStr).width;
    ctx.fillText(timeStr, elapseWidth + equalsWidth, 8);

    // 중앙 정렬 위해 전체 너비 계산
    const totalWidth = elapseWidth + equalsWidth + valueWidth;
    const centerX = (this.cw - totalWidth) / 2;

    // 전체를 다시 그리되 중앙 정렬
    ctx.fillStyle = HUD.COLORS.timerKey;
    ctx.fillText('elapsed', centerX, 8);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(' = ', centerX + elapseWidth, 8);

    ctx.fillStyle = HUD.COLORS.timerVal;
    ctx.fillText(timeStr, centerX + elapseWidth + equalsWidth, 8);
  }

  _renderEventStatus(ctx, e1State, e2State, bossState, e1Kills, e2Kills, e2Elapsed) {
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let y = 8;
    const badgeH = 24;
    const padding = 8;

    // 배지 그리기 헬퍼 함수
    const drawBadge = (text, bgColor, borderColor, textColor) => {
      const textW = ctx.measureText(text).width;
      const badgeW = textW + padding * 2;
      const x = this.cw - badgeW - 10;

      // 배경
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, badgeW, badgeH);

      // 텍스트
      ctx.fillStyle = textColor;
      ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

      // 테두리
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, badgeW, badgeH);

      y += badgeH + 4;
    };

    // BOSS 상태
    if (bossState === 'active') {
      // 펄스 테두리: Date.now() % 1000 기반 opacity
      const now = Date.now();
      const pulseCycle = 1000;
      const cyclePos = (now % pulseCycle) / pulseCycle;
      const borderOpacity = 0.27 * (0.5 + 0.5 * Math.abs(Math.sin(cyclePos * Math.PI)));

      const bgColor = 'rgba(243, 139, 168, 0.07)';   // #f38ba811
      const borderColor = `rgba(243, 139, 168, ${borderOpacity})`; // #f38ba8 펄스
      const textColor = HUD.COLORS.red; // #f38ba8

      const text = '⚠ BOSS 장선형 등장!';
      const textW = ctx.measureText(text).width;
      const badgeW = textW + padding * 2;
      const x = this.cw - badgeW - 10;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, badgeW, badgeH);

      ctx.fillStyle = textColor;
      ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, badgeW, badgeH);

      y += badgeH + 4;
    }

    // E1 상태
    if (e1State === 'active') {
      const text = `[E1] 들여쓰기 지옥 : IndentationError 처치 (${e1Kills}/15)`;
      const bgColor = 'rgba(249, 226, 175, 0.07)';   // #f9e2af11
      const borderColor = 'rgba(249, 226, 175, 0.27)'; // #f9e2af44
      const textColor = HUD.COLORS.orange; // #f9e2af

      const textW = ctx.measureText(text).width;
      const badgeW = textW + padding * 2;
      const x = this.cw - badgeW - 10;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, badgeW, badgeH);

      ctx.fillStyle = textColor;
      ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, badgeW, badgeH);

      y += badgeH + 4;
    } else if (e1State === 'cleared') {
      const text = '[E1] 클리어 ✓';
      const bgColor = 'rgba(166, 227, 161, 0.07)';   // #a6e3a111
      const borderColor = 'rgba(166, 227, 161, 0.27)'; // #a6e3a144
      const textColor = HUD.COLORS.value; // #a6e3a1

      const textW = ctx.measureText(text).width;
      const badgeW = textW + padding * 2;
      const x = this.cw - badgeW - 10;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, badgeW, badgeH);

      ctx.fillStyle = textColor;
      ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, badgeW, badgeH);

      y += badgeH + 4;
    }

    // E2 상태
    if (e2State === 'active') {
      const text = `[E2] 파이참 위기 : 생존 ${Math.floor(e2Elapsed)}/30초`;
      const bgColor = 'rgba(249, 226, 175, 0.07)';   // #f9e2af11
      const borderColor = 'rgba(249, 226, 175, 0.27)'; // #f9e2af44
      const textColor = HUD.COLORS.orange; // #f9e2af

      const textW = ctx.measureText(text).width;
      const badgeW = textW + padding * 2;
      const x = this.cw - badgeW - 10;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, badgeW, badgeH);

      ctx.fillStyle = textColor;
      ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, badgeW, badgeH);

      y += badgeH + 4;
    } else if (e2State === 'cleared') {
      const text = '[E2] 클리어 ✓';
      const bgColor = 'rgba(166, 227, 161, 0.07)';   // #a6e3a111
      const borderColor = 'rgba(166, 227, 161, 0.27)'; // #a6e3a144
      const textColor = HUD.COLORS.value; // #a6e3a1

      const textW = ctx.measureText(text).width;
      const badgeW = textW + padding * 2;
      const x = this.cw - badgeW - 10;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, badgeW, badgeH);

      ctx.fillStyle = textColor;
      ctx.fillText(text, x + badgeW / 2, y + badgeH / 2);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, badgeW, badgeH);

      y += badgeH + 4;
    }
  }
}
