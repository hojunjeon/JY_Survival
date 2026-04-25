import { HUD } from './HUD.js';

export class StatUpgrade {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.selectedIndex = 0;
    this.hoveredIndex = -1;
  }

  show() {
    this.visible = true;
    this.selectedIndex = 0;
  }

  hide() {
    this.visible = false;
  }

  selectIndex(idx) {
    if (idx >= 0 && idx < 3) {
      this.selectedIndex = idx;
    }
  }

  getSelected() {
    const stats = [
      { name: 'moveSpeed', boost: '+15%', desc: '이동 속도 증가', color: HUD.COLORS.teal2 },
      { name: 'attackSpeed', boost: '+20%', desc: '공격 속도 증가', color: HUD.COLORS.orange },
      { name: 'damageMulti', boost: '+25%', desc: '피해량 증가', color: HUD.COLORS.red },
    ];
    return stats[this.selectedIndex];
  }

  render(ctx) {
    if (!this.visible) return;

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 반투명 오버레이
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 모달 박스
    const modalW = 380;
    const modalH = 320;
    const modalX = (this.cw - modalW) / 2;
    const modalY = (this.ch - modalH) / 2;

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(modalX, modalY, modalW, modalH);

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    let contentY = modalY + 12;

    // 타이틀
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// Q1 완료 — 스탯 업그레이드 선택', modalX + 12, contentY);

    contentY += 18;

    // 함수 호출
    ctx.fillStyle = HUD.COLORS.text;
    ctx.font = '11px monospace';
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText('player.upgrade(', modalX + 12, contentY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText('?', modalX + 12 + ctx.measureText('player.upgrade(').width, contentY);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(')', modalX + 12 + ctx.measureText('player.upgrade(?').width, contentY);

    contentY += 24;

    // 3개의 스탯 옵션
    const stats = [
      { name: 'moveSpeed', boost: '+15%', desc: '이동 속도 증가', color: HUD.COLORS.teal2 },
      { name: 'attackSpeed', boost: '+20%', desc: '공격 속도 증가', color: HUD.COLORS.orange },
      { name: 'damageMulti', boost: '+25%', desc: '피해량 증가', color: HUD.COLORS.red },
    ];

    const optH = 70;
    const optGap = 10;

    stats.forEach((stat, idx) => {
      const isSelected = idx === this.selectedIndex;
      const optX = modalX + 12;
      const optY = contentY + idx * (optH + optGap);
      const optW = modalW - 24;

      // 배경
      if (isSelected) {
        ctx.fillStyle = `rgba(78, 201, 176, 0.08)`;
        ctx.fillRect(optX, optY, optW, optH);
      } else {
        ctx.fillStyle = HUD.COLORS.sidebar;
        ctx.fillRect(optX, optY, optW, optH);
      }

      // 테두리
      ctx.strokeStyle = isSelected ? HUD.COLORS.teal2 : HUD.COLORS.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(optX, optY, optW, optH);

      let optContentY = optY + 8;

      // 스탯 이름 + 부스트
      ctx.fillStyle = stat.color;
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(stat.name, optX + 8, optContentY);

      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(stat.boost, optX + optW - 8, optContentY - 2);

      optContentY += 18;

      // 설명
      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '7px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(stat.desc, optX + 8, optContentY);

      // 선택 힌트
      if (isSelected) {
        ctx.fillStyle = HUD.COLORS.teal2;
        ctx.font = '7px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('↵ press to select', optX + 8, optContentY + 12);
      }
    });

    // 키보드 힌트
    contentY = modalY + modalH - 32;
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓: 선택 | Enter: 확인', this.cw / 2, contentY);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⏸ PAUSED', 8, this.ch - 5);
    const selected = this.getSelected();
    ctx.textAlign = 'right';
    ctx.fillText(`선택: ${selected.name}`, this.cw - 8, this.ch - 5);
  }

  getHitboxes() {
    if (!this.visible) return [];

    const modalW = 380;
    const modalX = (this.cw - modalW) / 2;
    const modalY = (this.ch - 320) / 2;

    const contentY = modalY + 54;
    const optH = 70;
    const optGap = 10;
    const optW = modalW - 24;

    const hitboxes = [];
    for (let i = 0; i < 3; i++) {
      hitboxes.push({
        x: modalX + 12,
        y: contentY + i * (optH + optGap),
        w: optW,
        h: optH,
        action: 'select-stat',
        statIndex: i,
      });
    }
    return hitboxes;
  }
}
