import { HUD } from './HUD.js';

export class WeaponGet {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.weaponData = null;
    this.slotIndex = 0;
  }

  show(weaponData, slotIndex = 0) {
    this.weaponData = weaponData;
    this.slotIndex = slotIndex;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible || !this.weaponData) return;

    ctx.save();

    // 반투명 오버레이
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 박스
    const modalX = (this.cw - 400) / 2;
    const modalY = (this.ch - 280) / 2;
    const modalW = 400;
    const modalH = 280;

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(modalX, modalY, modalW, modalH);

    // 타이틀바
    ctx.fillStyle = '#181825';
    ctx.fillRect(modalX, modalY, modalW, 20);
    [['#f55',0],['#fb0',1],['#5c5',2]].forEach(([c,i]) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(modalX + 10 + i * 14, modalY + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('weapon.acquired()', modalX + 52, modalY + 10);

    // 테두리
    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX, modalY, modalW, modalH);

    let contentY = modalY + 32;

    // 무기 박스
    ctx.fillStyle = 'rgba(249, 226, 175, 0.05)';
    ctx.fillRect(modalX + 12, contentY, modalW - 24, 80);

    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX + 12, contentY, modalW - 24, 80);

    // 무기 이름
    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const weaponName = this.weaponData.name || 'UnknownWeapon';
    ctx.fillText(weaponName, modalX + (modalW) / 2, contentY + 18);

    // 무기 설명
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const weaponDesc = this.weaponData.description || '강력한 새로운 무기';
    ctx.fillText(weaponDesc, modalX + modalW / 2, contentY + 38);

    contentY += 88;

    // 코드 스니펫
    ctx.fillStyle = '#181825';
    ctx.fillRect(modalX + 12, contentY, modalW - 24, 80);

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(modalX + 12, contentY, modalW - 24, 80);

    let codeY = contentY + 8;

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('const', modalX + 16, codeY);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(' newWeapon ', modalX + 16 + ctx.measureText('const').width, codeY);

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('= new ', modalX + 16 + ctx.measureText('const newWeapon ').width, codeY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(weaponName, modalX + 16 + ctx.measureText('const newWeapon = new ').width, codeY);

    codeY += 16;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.fillText(`// 슬롯 ${this.slotIndex + 1} 에 추가됨`, modalX + 16, codeY);

    codeY += 16;

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('ownedWeapons', modalX + 16, codeY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText('.push(', modalX + 16 + ctx.measureText('ownedWeapons').width, codeY);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText('newWeapon', modalX + 16 + ctx.measureText('ownedWeapons.push(').width, codeY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(')', modalX + 16 + ctx.measureText('ownedWeapons.push(newWeapon').width, codeY);

    contentY += 88;

    // 버튼들
    const btnW = (modalW - 36) / 2;
    const btnH = 20;
    const btnGap = 12;
    const btn1X = modalX + 12;
    const btn2X = modalX + 12 + btnW + btnGap;

    // 버리기
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(btn1X, contentY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('버리기', btn1X + btnW / 2, contentY + btnH / 2);

    // 장착
    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(btn2X, contentY, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`장착 (슬롯 ${this.slotIndex + 1})`, btn2X + btnW / 2, contentY + btnH / 2);

    // 상태 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ EVENT E2 | 무기 획득!', 8, this.ch - 8);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];

    const modalW = 400;
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
        action: 'drop',
      },
      {
        x: modalX + 12 + btnW + btnGap,
        y: contentY,
        w: btnW,
        h: btnH,
        action: 'equip',
      },
    ];
  }
}
