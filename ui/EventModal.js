import { PixelRenderer, NPC_SPRITES } from '../sprites/PixelRenderer.js';

const EVENT_CONFIG = {
  E1: {
    title: '이벤트 : 들여쓰기 지옥',
    character: '박진우',
    dialogueLines: [
      '아니 이거 또 이러네?',
      '지윤님 저 진짜 들여쓰기 오류 때문에 미치겠습니다..',
    ],
    situation: '박진우가 들여쓰기 오류로 인해 컴퓨터를 향해 주먹을 쥡니다.',
    actionBase: 'IndentationError를 처치하세요',
    progressFormat: (extra) => extra?.progress ? ` (${extra.progress})` : ' (0/15)',
    cleared: '들여쓰기 지옥 탈출 성공!',
    reward: '강화 재화 +2',
  },
  E3: {
    title: '이벤트 : 파이참 위기',
    character: '이한정',
    dialogueLines: [
      '어? 이거 뭐야. 아.. 파이참 또 환경변수 꼬였네.',
      '지윤님 이것 좀 풀어주세요.',
    ],
    situation: '이한정의 IDE가 먹통이 됐습니다.',
    actionBase: 'EnvError를 처치하고 60초를 생존하세요',
    progressFormat: () => '',
    cleared: '파이참 위기 극복!',
    reward: '무기 획득',
  },
};

// 레거시: 기존 메시지 포맷 (기존 테스트 호환)
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

export class EventModal {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.type = null;
    this.eventId = null;
    this.extra = {};
    // 레거시 속성 (기존 테스트 호환)
    this.message = '';
    this.reward = '';
    this.character = null;
    this.dialogueLines = [];
  }

  show(type, eventId, extra = {}) {
    this.visible = true;
    this.type = type;
    this.eventId = eventId;
    this.extra = extra;

    // 레거시 속성 업데이트 (기존 테스트 호환)
    this.message = EVENT_MESSAGES[eventId]?.[type] ?? '';
    this.reward = type === 'cleared' ? (EVENT_CONFIG[eventId]?.reward ?? '') : '';
    if (type === 'triggered') {
      this.character = EVENT_CONFIG[eventId]?.character ?? null;
      this.dialogueLines = EVENT_CONFIG[eventId]?.dialogueLines ?? [];
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
    const cfg = EVENT_CONFIG[this.eventId];
    if (!cfg) return;

    const bw = 560;
    const bh = this.type === 'triggered' ? 360 : 200;
    const bx = (this.cw - bw) / 2;
    const by = (this.ch - bh) / 2;
    const accent = this.type === 'triggered' ? '#ffcc00' : '#4caf50';

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, this.cw, this.ch);

    ctx.fillStyle = '#12122a';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    if (this.type === 'triggered') {
      this._renderTriggered(ctx, cfg, bx, by, bw, accent);
    } else {
      this._renderCleared(ctx, cfg, bx, by, bw, accent);
    }
  }

  _renderTriggered(ctx, cfg, bx, by, bw, accent) {
    // 총 콘텐츠 높이 사전 계산
    const bh = 360;
    const titleHeight = 36;
    const divider1Height = 20;
    const npcBlockHeight = 60;
    const divider2Height = 20;
    const dialogueHeight = 22 * cfg.dialogueLines.length + 8;
    const divider3Height = 22;
    const situationHeight = 22;
    const actionHeight = 22;

    const totalContentHeight = titleHeight + divider1Height + npcBlockHeight + divider2Height + dialogueHeight + divider3Height + situationHeight + actionHeight;

    // 수직 중앙 배치
    const startY = by + (bh - totalContentHeight) / 2;
    let y = startY;

    ctx.fillStyle = accent;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[ <${this.eventId}> ${cfg.title} ]`, this.cw / 2, y);
    y += 20;

    this._divider(ctx, bx, y, bw, accent);
    y += 20;

    const sprite = NPC_SPRITES?.[cfg.character];
    if (sprite) {
      PixelRenderer.drawSpriteClipped(ctx, sprite, bx + 24, y, 3, 16);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(cfg.character, bx + 80, y + 28);
    y += 60;

    this._divider(ctx, bx, y, bw, accent);
    y += 22;

    ctx.fillStyle = '#ddeeff';
    ctx.font = '13px monospace';
    for (const line of cfg.dialogueLines) {
      ctx.fillText(`"${line}"`, bx + 24, y);
      y += 22;
    }
    y += 8;

    this._divider(ctx, bx, y, bw, accent);
    y += 22;

    ctx.fillStyle = '#cccccc';
    ctx.font = '12px monospace';
    ctx.fillText(cfg.situation, bx + 24, y);
    y += 22;

    const action = cfg.actionBase + cfg.progressFormat(this.extra);
    ctx.fillStyle = '#ffee88';
    ctx.font = '13px monospace';
    ctx.fillText(action, bx + 24, y);

    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('[ Space ] 계속', bx + bw - 24, by + 360 - 20);
    ctx.textAlign = 'left';
  }

  _renderCleared(ctx, cfg, bx, by, bw, accent) {
    ctx.fillStyle = accent;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[${this.eventId}] ${cfg.cleared}`, this.cw / 2, by + 60);

    ctx.fillStyle = '#4fc3f7';
    ctx.font = '14px monospace';
    ctx.fillText(`보상: ${cfg.reward}`, this.cw / 2, by + 100);

    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText('[ Space ] 계속', this.cw / 2, by + 170);
    ctx.textAlign = 'left';
  }

  _divider(ctx, bx, y, bw, color) {
    ctx.strokeStyle = color + '66';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + 16, y);
    ctx.lineTo(bx + bw - 16, y);
    ctx.stroke();
  }
}
