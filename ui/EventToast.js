import { HUD } from './HUD.js';

export class EventToast {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.eventData = null;
  }

  show(eventData) {
    this.eventData = eventData;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible || !this.eventData) return;
    ctx.save();

    // 반투명 오버레이
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 토스트 팝업 박스
    const toastW = 460;
    const toastH = 300;
    const toastX = (this.cw - toastW) / 2;
    const toastY = (this.ch - toastH) / 2;

    // 배경
    ctx.fillStyle = '#2a2139';
    ctx.fillRect(toastX, toastY, toastW, toastH);

    // 타이틀바
    ctx.fillStyle = '#181825';
    ctx.fillRect(toastX, toastY, toastW, 20);
    [['#f55',0],['#fb0',1],['#5c5',2]].forEach(([c,i]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(toastX + 10 + i * 14, toastY + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('stage1.run() [PAUSED]', toastX + 52, toastY + 10);

    // 테두리
    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.globalAlpha = 0.27;
    ctx.lineWidth = 1;
    ctx.strokeRect(toastX, toastY, toastW, toastH);
    ctx.globalAlpha = 1;

    let contentY = toastY + 26;

    // 이벤트 타입 표시
    ctx.fillStyle = `rgba(249, 226, 175, 0.06)`;
    ctx.fillRect(toastX + 10, contentY, toastW - 20, 16);
    ctx.strokeStyle = `rgba(249, 226, 175, 0.2)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(toastX + 10, contentY, toastW - 20, 16);

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ EVENT TRIGGER — ${this.eventData.eventType || 'E1'}`, toastX + toastW / 2, contentY + 11);

    contentY += 22;

    // 캐릭터 정보 헤더
    const charY = contentY;
    const charSize = 28;
    const charX = toastX + 12;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(charX, charY, charSize, charSize);
    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.strokeRect(charX, charY, charSize, charSize);
    ctx.globalAlpha = 1;

    // 이모지 표시
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.eventData.emoji || '🧑‍💻', charX + charSize / 2, charY + charSize / 2);

    // 이름
    ctx.fillStyle = HUD.COLORS.text;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.eventData.name || '박민준', charX + charSize + 8, charY + 2);

    // 역할/조직
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(this.eventData.role || 'SSAFY 15기', toastX + toastW - 12, charY + 2);

    contentY += charSize + 4;

    // 대사
    ctx.fillStyle = HUD.COLORS.timerVal;
    ctx.font = 'italic 9px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const dialogue = this.eventData.dialogue || '"야 이거 IndentationError가 자꾸 뜨는 거야?!"';
    this._renderWrappedText(ctx, dialogue, toastX + 12, contentY, toastW - 24, 14);

    contentY += 32;

    // 이벤트 버그 타입
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// ', toastX + 12, contentY);

    ctx.fillStyle = HUD.COLORS.teal2;
    const bugType = this.eventData.bugType || '들여쓰기 지옥';
    ctx.fillText(bugType, toastX + 24, contentY);

    const bugCount = this.eventData.bugCount || 15;
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.fillText(` ×${bugCount} → `, toastX + 24 + ctx.measureText(bugType).width, contentY);

    ctx.fillStyle = HUD.COLORS.orange;
    const reward = this.eventData.reward || 3;
    ctx.fillText(`재화 +${reward}`, toastX + 24 + ctx.measureText(bugType + ` ×${bugCount} → `).width, contentY);

    contentY += 20;

    // 도와주기 버튼 (단독 중앙)
    const btnW = 160;
    const btnH = 28;
    const btnX = toastX + (toastW - btnW) / 2;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(btnX, contentY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('도와주기  [Enter]', btnX + btnW / 2, contentY + btnH / 2);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];

    const toastW = 460;
    const toastH = 300;
    const toastX = (this.cw - toastW) / 2;
    const toastY = (this.ch - toastH) / 2;

    const btnW = 160;
    const btnH = 28;
    const btnX = toastX + (toastW - btnW) / 2;
    // render()에서 contentY가 toastY+26+22+32+32+20 = toastY+132에 버튼을 그림
    const contentY = toastY + 132;

    return [
      {
        x: btnX,
        y: contentY,
        w: btnW,
        h: btnH,
        action: 'help',
      },
    ];
  }

  _renderWrappedText(ctx, text, x, y, maxW, lineHeight) {
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

    lines.forEach((l, i) => {
      ctx.fillText(l, x, y + i * lineHeight);
    });
  }
}
