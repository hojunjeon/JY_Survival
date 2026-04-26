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
    const boxW = 400;
    const boxH = 280;
    const boxX = (this.cw - boxW) / 2;
    const boxY = (this.ch - boxH) / 2;

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // 테두리
    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    let contentY = boxY + 12;

    // 타이틀
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// [E2 보상] 새로운 무기 획득!', boxX + 12, contentY);

    contentY += 20;

    // 무기 박스
    ctx.fillStyle = `rgba(249, 226, 175, 0.05)`;
    ctx.fillRect(boxX + 12, contentY, boxW - 24, 80);

    ctx.strokeStyle = HUD.COLORS.orange;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 12, contentY, boxW - 24, 80);
    ctx.globalAlpha = 1;

    // 무기 이름
    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    const weaponName = this.weaponData.name || 'UnknownWeapon';
    ctx.fillText(weaponName, (this.cw) / 2, contentY + 28);

    // 무기 설명
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    const weaponDesc = this.weaponData.description || '강력한 새로운 무기';
    ctx.fillText(weaponDesc, this.cw / 2, contentY + 48);

    contentY += 88;

    // 코드 스니펫
    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(boxX + 12, contentY, boxW - 24, 80);

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 12, contentY, boxW - 24, 80);

    let codeY = contentY + 8;

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('const', boxX + 16, codeY);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(' newWeapon ', boxX + 16 + ctx.measureText('const').width, codeY);

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('= new ', boxX + 16 + ctx.measureText('const newWeapon ').width, codeY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(weaponName, boxX + 16 + ctx.measureText('const newWeapon = new ').width, codeY);

    codeY += 16;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.fillText(`// 슬롯 ${this.slotIndex + 1} 에 추가됨`, boxX + 16, codeY);

    codeY += 16;

    ctx.fillStyle = HUD.COLORS.keyword;
    ctx.fillText('ownedWeapons', boxX + 16, codeY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText('.push(', boxX + 16 + ctx.measureText('ownedWeapons').width, codeY);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText('newWeapon', boxX + 16 + ctx.measureText('ownedWeapons.push(').width, codeY);

    ctx.fillStyle = HUD.COLORS.text;
    ctx.fillText(')', boxX + 16 + ctx.measureText('ownedWeapons.push(newWeapon').width, codeY);

    contentY += 88;

    // 버튼들
    const btnW = (boxW - 36) / 2;
    const btnH = 20;
    const btnGap = 12;
    const btn1X = boxX + 12;
    const btn2X = boxX + 12 + btnW + btnGap;

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
    ctx.fillText(`장착 (슬롯 ${this.slotIndex + 1})`, btn2X + btnW / 2, contentY + btnH / 2);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];

    const boxW = 400;
    const boxH = 280;
    const boxX = (this.cw - boxW) / 2;
    const boxY = (this.ch - boxH) / 2;

    const btnW = (boxW - 36) / 2;
    const btnH = 20;
    const btnGap = 12;
    const contentY = boxY + boxH - 32;

    return [
      {
        x: boxX + 12,
        y: contentY,
        w: btnW,
        h: btnH,
        action: 'drop',
      },
      {
        x: boxX + 12 + btnW + btnGap,
        y: contentY,
        w: btnW,
        h: btnH,
        action: 'equip',
      },
    ];
  }
}
