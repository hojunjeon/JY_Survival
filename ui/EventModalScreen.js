import { HUD } from './HUD.js';

export class EventModalScreen {
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

    // 모달 박스
    const modalW = 380;
    const modalH = 280;
    const modalX = (this.cw - modalW) / 2;
    const modalY = (this.ch - modalH) / 2;

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(modalX, modalY, modalW, modalH);

    // 테두리
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    let contentY = modalY + 12;

    // 타이틀 영역
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`// [EVENT ${this.eventData.eventType || 'E1'}] ${this.eventData.name || '들여쓰기 지옥'}`, modalX + 12, contentY);

    contentY += 16;

    // 코드 예제
    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.font = '9px monospace';
    ctx.fillText('const', modalX + 12, contentY);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(' e ', modalX + 12 + ctx.measureText('const').width, contentY);

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('= ', modalX + 12 + ctx.measureText('const e ').width, contentY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText('Event.trigger(', modalX + 12 + ctx.measureText('const e = ').width, contentY);

    ctx.fillStyle = HUD.COLORS.red;
    ctx.fillText(`'${this.eventData.eventType || 'E1'}'`, modalX + 12 + ctx.measureText('const e = Event.trigger(').width, contentY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(')', modalX + 12 + ctx.measureText(`const e = Event.trigger('${this.eventData.eventType || 'E1'}'`).width, contentY);

    contentY += 24;

    // 미션 진행도 박스
    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(modalX + 12, contentY, modalW - 24, 60);

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX + 12, contentY, modalW - 24, 60);

    let missionY = contentY + 8;

    // MISSION 라벨
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MISSION', modalX + 16, missionY);

    missionY += 12;

    // 미션 텍스트 + 진행도
    const bugType = this.eventData.bugType || 'IndentationError';
    const bugCount = this.eventData.bugCount || 15;
    const progress = this.eventData.progress || 8;

    ctx.fillStyle = HUD.COLORS.red;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${bugType} ×${bugCount}`, modalX + 16, missionY);

    ctx.fillStyle = HUD.COLORS.value;
    ctx.textAlign = 'right';
    ctx.fillText(`${progress} / ${bugCount}`, modalX + modalW - 28, missionY);

    missionY += 12;

    // 프로그레스 바
    const barW = modalW - 28;
    const barH = 4;
    const barX = modalX + 16;

    ctx.fillStyle = HUD.COLORS.border;
    ctx.fillRect(barX, missionY, barW, barH);

    const progressRatio = bugCount > 0 ? progress / bugCount : 0;
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillRect(barX, missionY, barW * progressRatio, barH);

    contentY += 70;

    // 보상 영역
    ctx.fillStyle = `rgba(249, 226, 175, 0.08)`;
    ctx.fillRect(modalX + 12, contentY, modalW - 24, 50);

    ctx.strokeStyle = `rgba(249, 226, 175, 0.2)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX + 12, contentY, modalW - 24, 50);

    let rewardY = contentY + 8;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('REWARD', modalX + 16, rewardY);

    rewardY += 12;

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.font = '9px monospace';
    ctx.fillText('return', modalX + 16, rewardY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(' { ', modalX + 16 + ctx.measureText('return').width, rewardY);

    ctx.fillStyle = HUD.COLORS.teal2;
    const rewardValue = this.eventData.reward || 3;
    ctx.fillText('enhance', modalX + 16 + ctx.measureText('return { ').width, rewardY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(': ', modalX + 16 + ctx.measureText('return { enhance').width, rewardY);

    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText(`${rewardValue}`, modalX + 16 + ctx.measureText('return { enhance: ').width, rewardY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(' }', modalX + 16 + ctx.measureText(`return { enhance: ${rewardValue}`).width, rewardY);

    contentY += 58;

    // 버튼들
    const btnW = (modalW - 36) / 2;
    const btnH = 20;
    const btnGap = 12;
    const btn1X = modalX + 12;
    const btn2X = modalX + 12 + btnW + btnGap;

    // 일시정지 해제
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(btn1X, contentY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('일시정지 해제', btn1X + btnW / 2, contentY + btnH / 2);

    // 계속 플레이
    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(btn2X, contentY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('계속 플레이', btn2X + btnW / 2, contentY + btnH / 2);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`● PAUSED · ${this.eventData.eventType || 'E1'}`, 8, this.ch - 5);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.eventData.progress || 0}/${this.eventData.bugCount || 15}`, this.cw - 8, this.ch - 5);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];

    const modalW = 380;
    const modalH = 280;
    const modalX = (this.cw - modalW) / 2;
    const modalY = (this.ch - modalH) / 2;

    const btnW = (modalW - 36) / 2;
    const btnH = 20;
    const btnGap = 12;
    const contentY = modalY + modalH - 32;

    return [
      {
        x: modalX + 12,
        y: contentY,
        w: btnW,
        h: btnH,
        action: 'unpause',
      },
      {
        x: modalX + 12 + btnW + btnGap,
        y: contentY,
        w: btnW,
        h: btnH,
        action: 'continue',
      },
    ];
  }
}
