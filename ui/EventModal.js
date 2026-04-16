const EVENT_MESSAGES = {
  E1: {
    triggered: '동기가 IndentationError 패닉! IndentationError 15마리 처치!',
    cleared:   '들여쓰기 지옥 탈출 성공!',
    character: '박진우',
    dialogueLines: [
      '아니 이거 또 이러네?',
      '지윤님 저 진짜 들여쓰기 오류 때문에 미치겠습니다..',
    ],
  },
  E3: {
    triggered: '동기의 IDE가 안 켜져! EnvError 처치 + 60초 생존!',
    cleared:   '파이참 위기 극복!',
    character: '이한정',
    dialogueLines: [
      '어? 이거 뭐야. 아.. 파이참 또 환경변수 꼬였네.',
      '지윤님 이것 좀 풀어주세요.',
    ],
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
    this.character = null;
    this.dialogueLines = [];
  }

  show(type, eventId) {
    this.visible = true;
    this.type = type;
    this.eventId = eventId;
    this.message = EVENT_MESSAGES[eventId]?.[type] ?? '';
    this.reward = type === 'cleared' ? (EVENT_REWARDS[eventId] ?? '') : '';
    if (type === 'triggered') {
      this.character = EVENT_MESSAGES[eventId]?.character ?? null;
      this.dialogueLines = EVENT_MESSAGES[eventId]?.dialogueLines ?? [];
    } else {
      this.character = null;
      this.dialogueLines = [];
    }
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible) return;

    const hasDialogue = this.type === 'triggered' && this.dialogueLines?.length > 0;
    const bw = 480;
    const bh = hasDialogue ? 230 : 170;
    const bx = (this.cw - bw) / 2;
    const by = (this.ch - bh) / 2;

    // 반투명 배경
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 모달 박스
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

    // 캐릭터 대사 말풍선 (triggered일 때만)
    if (hasDialogue) {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(bx + 16, by + 88, bw - 32, 14 + this.dialogueLines.length * 20);

      ctx.fillStyle = '#aaddff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.character}:`, bx + 24, by + 102);

      ctx.fillStyle = '#ddeeff';
      ctx.font = '12px monospace';
      this.dialogueLines.forEach((line, i) => {
        ctx.fillText(`"${line}"`, bx + 24, by + 122 + i * 20);
      });
      ctx.textAlign = 'center';
    }

    // 계속 힌트
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText('[Space] 계속', this.cw / 2, by + bh - 22);
    ctx.textAlign = 'left';
  }
}
