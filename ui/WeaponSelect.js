import { HUD } from './HUD.js';

export class WeaponSelect {
  constructor({ canvasWidth, canvasHeight, weapons = [] }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.weapons = weapons;  // 선택 가능한 무기 배열
    this.selectedIndex = 0;
    this.visible = false;
  }

  show(weapons = []) {
    this.weapons = weapons || this.weapons;
    this.selectedIndex = 0;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  selectPrevious() {
    if (this.weapons.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.weapons.length) % this.weapons.length;
  }

  selectNext() {
    if (this.weapons.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.weapons.length;
  }

  getSelected() {
    return this.weapons[this.selectedIndex] || null;
  }

  render(ctx) {
    if (!this.visible) return;

    // 배경
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    // 상단 타이틀
    ctx.fillStyle = HUD.COLORS.text;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('김지윤의 디버그 서바이벌', this.cw / 2, 100);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '13px monospace';
    ctx.fillText('Stage 1 — 무기를 선택하세요', this.cw / 2, 130);

    // 좌측 파일트리 (weapons/)
    const sidebarX = 80;
    const sidebarY = 180;
    const itemHeight = 28;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('▾ weapons/', sidebarX, sidebarY);

    this.weapons.forEach((weapon, idx) => {
      const y = sidebarY + 22 + idx * itemHeight;
      const isSelected = idx === this.selectedIndex;

      // 배경
      if (isSelected) {
        ctx.fillStyle = `rgba(78, 201, 176, 0.08)`;
        ctx.fillRect(sidebarX - 10, y - 10, 300, 22);
        ctx.strokeStyle = HUD.COLORS.teal2;
        ctx.lineWidth = 1;
        ctx.strokeRect(sidebarX - 10, y - 10, 300, 22);
      }

      // 아이콘 + 이름
      ctx.fillStyle = isSelected ? HUD.COLORS.teal2 : HUD.COLORS.comment;
      ctx.font = '9px monospace';
      ctx.fillText(`⬡ ${weapon.name}.${this._getFileExt(weapon.name)}`, sidebarX, y);
    });

    // 우측 코드 뷰
    const codeX = sidebarX + 330;
    const codeY = 180;

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('// 선택 무기', codeX, codeY);

    const selected = this.getSelected();
    if (selected) {
      const codeLines = [
        `import ${selected.name} from '${selected.name}.${this._getFileExt(selected.name)}'`,
        `/** ${this._getWeaponDesc(selected.name)} */`,
        `const weapon = new ${selected.name}()`,
        `// 추천도: ★★★`,
      ];

      const keywordColor = HUD.COLORS.keyword;
      const stringColor = '#f38ba8';
      const commentColor = HUD.COLORS.comment;
      const varColor = HUD.COLORS.teal2;

      ctx.font = '9px monospace';
      codeLines.forEach((line, i) => {
        const y = codeY + 24 + i * 16;

        if (line.includes('import')) {
          ctx.fillStyle = keywordColor;
          ctx.fillText('import', codeX, y);
          ctx.fillStyle = HUD.COLORS.text;
          ctx.fillText(` ${selected.name} `, codeX + 48, y);
          ctx.fillStyle = keywordColor;
          ctx.fillText('from', codeX + 48 + ctx.measureText(` ${selected.name} `).width, y);
          ctx.fillStyle = stringColor;
          const remaining = ` '${selected.name}.${this._getFileExt(selected.name)}'`;
          ctx.fillText(remaining, codeX + 48 + ctx.measureText(` ${selected.name} from`).width, y);
        } else if (line.includes('/**')) {
          ctx.fillStyle = commentColor;
          ctx.fillText(line, codeX, y);
        } else if (line.includes('const')) {
          ctx.fillStyle = keywordColor;
          ctx.fillText('const', codeX, y);
          ctx.fillStyle = varColor;
          ctx.fillText(' weapon ', codeX + 36, y);
          ctx.fillStyle = keywordColor;
          ctx.fillText('= new ', codeX + 36 + ctx.measureText(' weapon ').width, y);
          ctx.fillStyle = HUD.COLORS.text;
          ctx.fillText(`${selected.name}()`, codeX + 36 + ctx.measureText(' weapon = new ').width, y);
        } else if (line.includes('//')) {
          ctx.fillStyle = commentColor;
          ctx.fillText(line, codeX, y);
        }
      });
    }

    // 하단 선택 확인 UI
    const btnY = this.ch - 80;
    ctx.fillStyle = `rgba(78, 201, 176, 0.1)`;
    ctx.fillRect(sidebarX - 10, btnY - 10, 540, 40);
    ctx.strokeStyle = HUD.COLORS.teal2;
    ctx.lineWidth = 1;
    ctx.strokeRect(sidebarX - 10, btnY - 10, 540, 40);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    if (selected) {
      ctx.fillText(`선택됨: ${selected.name}.${this._getFileExt(selected.name)}`, sidebarX, btnY + 5);
    }

    // 버튼
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillRect(sidebarX + 450, btnY - 8, 80, 32);
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('시작 →', sidebarX + 490, btnY + 8);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⎇ main', 8, this.ch - 5);
    ctx.textAlign = 'right';
    ctx.fillText('Stage 1 시작', this.cw - 8, this.ch - 5);

    // 키보드 힌트
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 또는 WASD: 선택 | Enter: 시작', this.cw / 2, this.ch - 40);
  }

  getHitboxes() {
    if (!this.visible) return [];

    const btnX = 430;
    const btnY = this.ch - 80 - 10;
    const btnW = 80;
    const btnH = 32;

    return [
      {
        x: btnX,
        y: btnY,
        w: btnW,
        h: btnH,
        action: 'confirm',
      },
    ];
  }

  _getFileExt(weaponName) {
    const extMap = {
      'Python': 'py',
      'Java': 'class',
      'C/C++': 'c',
      'Git': 'sh',
      'SQL': 'sql',
      'JavaScript': 'js',
      'Django': 'py',
      'LinuxBash': 'sh',
    };
    return extMap[weaponName] || 'txt';
  }

  _getWeaponDesc(weaponName) {
    const descMap = {
      'Python': '360° 자동 투사체',
      'Java': '오비탈 오브 3개',
      'C/C++': '전방 고속 관통탄',
      'Git': '분기 & 병합 전략',
      'SQL': 'DROP TABLE 공격',
      'JavaScript': '토네이도 지옥',
      'Django': '프레임워크 대쉬',
      'LinuxBash': '범용 버그 처치',
    };
    return descMap[weaponName] || '무기 설명';
  }
}
