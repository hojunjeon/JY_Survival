const EVENT_MESSAGES = {
  E1: {
    triggered: '동기가 IndentationError 패닉! IndentationError 15마리 처치!',
    cleared:   '들여쓰기 지옥 탈출 성공!',
  },
  E3: {
    triggered: '동기의 IDE가 안 켜져! EnvError 처치 + 60초 생존!',
    cleared:   '파이참 위기 극복!',
  },
};

const EVENT_REWARDS = {
  E1: '강화 재화 +2',
  E3: '무기 획득',
};

export class EventModal {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.type = null;    // 'triggered' | 'cleared'
    this.eventId = null; // 'E1' | 'E3'
    this.message = '';
    this.reward = '';
  }

  show(type, eventId) {
    this.visible = true;
    this.type = type;
    this.eventId = eventId;
    this.message = EVENT_MESSAGES[eventId]?.[type] ?? '';
    this.reward = type === 'cleared' ? (EVENT_REWARDS[eventId] ?? '') : '';
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible) return;

    // 반투명 배경
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 모달 박스
    const bw = 460, bh = 170;
    const bx = (this.cw - bw) / 2;
    const by = (this.ch - bh) / 2;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = this.type === 'triggered' ? '#ffcc00' : '#4caf50';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // 제목
    ctx.fillStyle = this.type === 'triggered' ? '#ffcc00' : '#4caf50';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    const title = this.type === 'triggered'
      ? `[${this.eventId}] 이벤트 발생!`
      : `[${this.eventId}] 클리어!`;
    ctx.fillText(title, this.cw / 2, by + 35);

    // 메시지
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px monospace';
    ctx.fillText(this.message, this.cw / 2, by + 65);

    // 보상
    if (this.type === 'cleared') {
      ctx.fillStyle = '#4fc3f7';
      ctx.fillText(`보상: ${this.reward}`, this.cw / 2, by + 95);
    }

    // 계속 힌트
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText('[Space] 계속', this.cw / 2, by + 148);
    ctx.textAlign = 'left';
  }
}
