import { HUD } from './HUD.js';

const SIDEBAR_BG = '#181825';

export class WeaponSelect {
  constructor({ canvasWidth, canvasHeight, weapons = [] }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.weapons = weapons;
    this.selectedIndex = 0;
    this.visible = false;
  }

  show(weapons = []) {
    this.weapons = weapons || this.weapons;
    this.selectedIndex = 0;
    this.visible = true;
  }

  hide() { this.visible = false; }

  selectPrevious() {
    if (this.weapons.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.weapons.length) % this.weapons.length;
  }

  selectNext() {
    if (this.weapons.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.weapons.length;
  }

  getSelected() { return this.weapons[this.selectedIndex] || null; }

  render(ctx) {
    if (!this.visible) return;
    ctx.save();

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 타이틀바
    this._drawTitleBar(ctx, 'weapon-select.js');

    const sidebarX = 80;
    const listY = 80;

    // 파일트리 헤더
    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = HUD.FONTS.sm;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('▾ weapons/', sidebarX, listY);

    // 무기 목록
    const itemH = 28;
    this.weapons.forEach((weapon, idx) => {
      const y = listY + 22 + idx * itemH;
      const isSelected = idx === this.selectedIndex;

      if (isSelected) {
        ctx.fillStyle = 'rgba(78,201,176,0.08)';
        ctx.fillRect(sidebarX - 10, y - 6, 300, 22);
        ctx.strokeStyle = HUD.COLORS.teal2;
        ctx.lineWidth = 2;
        ctx.strokeRect(sidebarX - 10, y - 6, 300, 22);
      }

      ctx.fillStyle = isSelected ? HUD.COLORS.teal2 : HUD.COLORS.comment;
      ctx.font = HUD.FONTS.sm;
      ctx.textBaseline = 'top';
      ctx.fillText(`⬡ ${weapon.name}.${this._ext(weapon.name)}`, sidebarX, y);
    });

    // 코드 프리뷰
    const codeX = sidebarX + 330;
    const codeY = 80;
    const selected = this.getSelected();

    if (selected) {
      const lines = [
        { parts: [{ c: HUD.COLORS.keyword, t: 'import' }, { c: HUD.COLORS.text, t: ` ${selected.name} ` }, { c: HUD.COLORS.keyword, t: 'from' }, { c: '#f38ba8', t: ` '${selected.name}.${this._ext(selected.name)}'` }] },
        { parts: [{ c: HUD.COLORS.comment, t: `/** ${this._desc(selected.name)} */` }] },
        { parts: [{ c: HUD.COLORS.keyword, t: 'const' }, { c: HUD.COLORS.teal2, t: ' weapon ' }, { c: HUD.COLORS.keyword, t: '= new ' }, { c: HUD.COLORS.text, t: `${selected.name}()` }] },
        { parts: [{ c: HUD.COLORS.comment, t: '// 추천도: ★★★' }] },
      ];

      lines.forEach((line, i) => {
        let xOff = codeX;
        ctx.textBaseline = 'top';
        line.parts.forEach(p => {
          ctx.fillStyle = p.c;
          ctx.font = HUD.FONTS.sm;
          ctx.fillText(p.t, xOff, codeY + 24 + i * 18);
          xOff += ctx.measureText(p.t).width;
        });
      });
    }

    // 하단 confirm 박스
    const btnY = this.ch - 80;
    ctx.fillStyle = 'rgba(78,201,176,0.1)';
    ctx.fillRect(sidebarX - 10, btnY - 10, 540, 40);
    ctx.strokeStyle = HUD.COLORS.teal2;
    ctx.lineWidth = 1;
    ctx.strokeRect(sidebarX - 10, btnY - 10, 540, 40);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = HUD.FONTS.sm;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    if (selected) {
      ctx.fillText(`선택됨: ${selected.name}.${this._ext(selected.name)}`, sidebarX, btnY + 5);
    }

    // 시작 버튼 — x: sidebarX(80) + 450 = 530
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillRect(530, btnY - 8, 80, 32);
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('시작 →', 570, btnY + 8);

    // 키보드 힌트
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('↑↓ 또는 WASD: 선택 | Enter: 시작', this.cw / 2, this.ch - 40);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⎇ main', 8, this.ch - 8);
    ctx.textAlign = 'right';
    ctx.fillText('Stage 1 시작', this.cw - 8, this.ch - 8);

    ctx.restore();
  }

  getHitboxes() {
    if (!this.visible) return [];
    return [{
      x: 530,
      y: this.ch - 80 - 10,
      w: 80,
      h: 32,
      action: 'confirm',
    }];
  }

  _drawTitleBar(ctx, filename) {
    ctx.fillStyle = SIDEBAR_BG;
    ctx.fillRect(0, 0, this.cw, 24);
    const dots = ['#f55', '#fb0', '#5c5'];
    dots.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(12 + i * 16, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = HUD.FONTS.xs;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(filename, 60, 12);
  }

  _ext(name) {
    return { Python: 'py', Java: 'class', 'C/C++': 'c', Git: 'sh', SQL: 'sql', JavaScript: 'js', Django: 'py', LinuxBash: 'sh' }[name] || 'txt';
  }

  _desc(name) {
    return { Python: '360° 자동 투사체', Java: '오비탈 오브 3개', 'C/C++': '전방 고속 관통탄', Git: '분기 & 병합 전략', SQL: 'DROP TABLE 공격', JavaScript: '토네이도 지옥', Django: '프레임워크 대쉬', LinuxBash: '범용 버그 처치' }[name] || '무기 설명';
  }
}
