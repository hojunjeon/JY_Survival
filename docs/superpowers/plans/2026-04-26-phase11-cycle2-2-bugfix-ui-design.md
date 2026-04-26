# Phase 11 Cycle 2.2 — 버그 픽스 + UI 디자인 보정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 마우스 좌표 불일치·paused 변수 분리·무기 중복·hitbox 오프셋 버그 4개를 수정하고, Phase 11 Cycle 1 UI 화면 8개를 HTML 목업 디자인에 맞게 보정한다.

**Architecture:** main.js에서 마우스 좌표 변환 헬퍼를 추가하고 paused setter를 gameSession에 노출한다. 각 UI 클래스는 독립적으로 보정 — HUD.COLORS를 계속 사용하되 일부 색상값(sidebar: #181825)과 레이아웃을 목업 기준으로 조정하고 타이틀바 컴포넌트를 추가한다.

**Tech Stack:** Vanilla JS ES Modules, Canvas 2D API, Vitest (jsdom)

---

## 파일 목록

| 파일 | 작업 |
|------|------|
| `main.js` | Bug 1(좌표변환), Bug 2(setPaused), Bug 3(C무기) |
| `ui/WeaponSelect.js` | Bug 4(hitbox x 530), 타이틀바, sidebar 색상 |
| `ui/EventToast.js` | 타이틀바, sidebar 색상, 버튼 레이아웃 |
| `ui/EventModalScreen.js` | 타이틀바, MISSION 박스, progress bar |
| `ui/StatUpgrade.js` | 타이틀바, sidebar 색상, 옵션 색상 |
| `ui/WeaponGet.js` | 타이틀바, 무기 박스 레이아웃 |
| `ui/BossIntro.js` | 타이틀바, gradient HP bar, stats 그리드 |
| `ui/GameOver.js` | 타이틀바, run summary sidebar 색상 |
| `ui/StageClear.js` | 타이틀바, commit-box, 스탯 그리드 |
| `tests/UIScreenHitbox.test.js` | 생성 — hitbox 좌표 정합성 테스트 |

---

## Task 1: main.js 버그 픽스 (Bug 1·2·3)

**Files:**
- Modify: `main.js`

- [ ] **Step 1: 테스트 파일 생성 (좌표 변환 헬퍼 단위 테스트)**

`tests/UIScreenHitbox.test.js` 생성:

```js
import { describe, it, expect } from 'vitest';

// 좌표 변환 헬퍼 (main.js에서 추출 예정)
function toCanvasCoords(clientX, clientY, rect, canvasW, canvasH) {
  const scaleX = canvasW / rect.width;
  const scaleY = canvasH / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

describe('toCanvasCoords', () => {
  it('스케일 1:1 — 변환 없음', () => {
    const rect = { left: 0, top: 0, width: 800, height: 600 };
    const { x, y } = toCanvasCoords(100, 200, rect, 800, 600);
    expect(x).toBe(100);
    expect(y).toBe(200);
  });

  it('2배 스케일 업 — 좌표 절반으로', () => {
    const rect = { left: 0, top: 0, width: 1600, height: 1200 };
    const { x, y } = toCanvasCoords(400, 600, rect, 800, 600);
    expect(x).toBe(200);
    expect(y).toBe(300);
  });

  it('오프셋 포함 — left/top 빼기', () => {
    const rect = { left: 50, top: 30, width: 800, height: 600 };
    const { x, y } = toCanvasCoords(150, 230, rect, 800, 600);
    expect(x).toBe(100);
    expect(y).toBe(200);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인 (헬퍼 함수는 테스트 파일 내 정의)**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

Expected: 3 tests PASS

- [ ] **Step 3: main.js — Bug 1 마우스 좌표 변환 적용**

`main.js` line ~181 `document.addEventListener('mousedown', (e) => {` 직후에 추가:

```js
document.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;
```

이후 핸들러 전체에서 `e.clientX` → `cx`, `e.clientY` → `cy` 로 교체 (약 20곳).

교체 예시:
```js
// Before
if (e.clientX >= hb.x && e.clientX < hb.x + hb.w &&
    e.clientY >= hb.y && e.clientY < hb.y + hb.h) {
// After
if (cx >= hb.x && cx < hb.x + hb.w &&
    cy >= hb.y && cy < hb.y + hb.h) {
```

- [ ] **Step 4: main.js — Bug 2 paused setter 추가**

`startGame()` 내 `gameSession = { ... }` 블록 바로 다음 줄에 추가:

```js
gameSession.setPaused = (v) => { paused = v; };
```

mousedown 핸들러에서 `gameSession.paused = false` 를 모두 `gameSession.setPaused(false)` 로 교체 (5곳):

```js
// event-toast skip
gameSession.setPaused(false);
// event-toast help → event-modal
gameSession.setPaused(false);  // (event-modal에서 resume 시)
// stat-upgrade select-stat
gameSession.setPaused(false);
// weapon-get
gameSession.setPaused(false);
```

- [ ] **Step 5: main.js — Bug 3 C무기 import 및 AVAILABLE_WEAPONS 수정**

파일 상단 import 섹션에 추가 (line ~19 PythonWeapon import 근처):

```js
import { CWeapon } from './weapons/C.js';
```

`handleIntroKey()` 내 AVAILABLE_WEAPONS 수정 (line ~127):

```js
// Before
const AVAILABLE_WEAPONS = [
  new PythonWeapon(),
  new JavaScriptWeapon(),
  new PythonWeapon(), // placeholder for third weapon
];
// After
const AVAILABLE_WEAPONS = [
  new PythonWeapon(),
  new JavaScriptWeapon(),
  new CWeapon(),
];
```

- [ ] **Step 6: 브라우저 수동 확인**

`npx vite` 또는 로컬 서버로 게임 실행:
1. Intro 화면에서 Space → WeaponSelect 화면 진입 확인
2. Python/JavaScript/C++ 세 무기 목록 표시 확인
3. 무기 선택 후 `시작 →` 버튼 클릭 → 게임 시작 확인
4. 게임 플레이 중 이벤트 발동 → EventToast 팝업 → 버튼 클릭 → 게임 재개 확인

- [ ] **Step 7: Commit**

```bash
git add main.js tests/UIScreenHitbox.test.js
git commit -m "fix: 마우스 좌표 변환, paused setter, C무기 연결 (Bug 1·2·3)"
```

---

## Task 2: WeaponSelect hitbox 수정 + 디자인 보정 (Bug 4)

**Files:**
- Modify: `ui/WeaponSelect.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: WeaponSelect hitbox 테스트 추가**

`tests/UIScreenHitbox.test.js` 에 추가:

```js
import { WeaponSelect } from '../ui/WeaponSelect.js';

describe('WeaponSelect hitbox', () => {
  it('confirm 버튼 hitbox x가 렌더 위치(530)와 일치한다', () => {
    const ws = new WeaponSelect({ canvasWidth: 800, canvasHeight: 600 });
    ws.show([]);
    const hitboxes = ws.getHitboxes();
    const confirm = hitboxes.find(h => h.action === 'confirm');
    expect(confirm).toBeDefined();
    // sidebarX(80) + 450 = 530
    expect(confirm.x).toBe(530);
    expect(confirm.y).toBe(600 - 80 - 10);
    expect(confirm.w).toBe(80);
    expect(confirm.h).toBe(32);
  });
});
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

Expected: FAIL — `expect(430).toBe(530)`

- [ ] **Step 3: WeaponSelect.js — Bug 4 hitbox x 수정 + 디자인 보정**

`ui/WeaponSelect.js` 전체를 아래로 교체:

```js
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
```

- [ ] **Step 4: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

Expected: 4 tests PASS (기존 3 + 새 1)

- [ ] **Step 5: Commit**

```bash
git add ui/WeaponSelect.js tests/UIScreenHitbox.test.js
git commit -m "fix: WeaponSelect hitbox x 530 보정 + 타이틀바 추가 (Bug 4)"
```

---

## Task 3: EventToast 디자인 보정

**Files:**
- Modify: `ui/EventToast.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: EventToast hitbox 테스트 추가**

`tests/UIScreenHitbox.test.js` 에 추가:

```js
import { EventToast } from '../ui/EventToast.js';

describe('EventToast hitbox', () => {
  it('visible=false 시 빈 배열', () => {
    const et = new EventToast({ canvasWidth: 800, canvasHeight: 600 });
    expect(et.getHitboxes()).toEqual([]);
  });

  it('visible=true 시 skip/help 2개 hitbox 반환', () => {
    const et = new EventToast({ canvasWidth: 800, canvasHeight: 600 });
    et.show({ eventType: 'E1' });
    const hbs = et.getHitboxes();
    expect(hbs.length).toBe(2);
    expect(hbs.find(h => h.action === 'skip')).toBeDefined();
    expect(hbs.find(h => h.action === 'help')).toBeDefined();
  });

  it('skip/help hitbox y 좌표가 동일하다', () => {
    const et = new EventToast({ canvasWidth: 800, canvasHeight: 600 });
    et.show({ eventType: 'E1' });
    const hbs = et.getHitboxes();
    expect(hbs[0].y).toBe(hbs[1].y);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

Expected: 기존 + 3 PASS

- [ ] **Step 3: EventToast.js 디자인 보정**

`ui/EventToast.js` 에서 아래 변경 적용:

1. `render()` 상단에 타이틀바 추가 (`_drawTitleBar` 메서드 복사 or import 헬퍼 사용):

```js
render(ctx) {
  if (!this.visible || !this.eventData) return;
  ctx.save();

  // 반투명 오버레이
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, this.cw, this.ch);

  const toastW = 380;
  const toastH = 230;
  const toastX = (this.cw - toastW) / 2;
  const toastY = (this.ch - toastH) / 2;

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

  // 박스 배경
  ctx.fillStyle = '#2a2139';
  ctx.fillRect(toastX, toastY + 20, toastW, toastH - 20);

  // 테두리
  ctx.strokeStyle = 'rgba(249,226,175,0.27)';
  ctx.lineWidth = 1;
  ctx.strokeRect(toastX, toastY, toastW, toastH);
```

2. `getHitboxes()` 의 `contentY` 계산을 render와 일치하도록 통일:

```js
getHitboxes() {
  if (!this.visible) return [];
  const toastW = 380;
  const toastH = 230;
  const toastX = (this.cw - toastW) / 2;
  const toastY = (this.ch - toastH) / 2;
  const btnW = 80;
  const btnH = 20;
  const btnGap = 8;
  const totalBtnW = btnW * 2 + btnGap;
  const btnX = toastX + (toastW - totalBtnW) / 2;
  const contentY = toastY + toastH - 34;   // 하단 고정
  return [
    { x: btnX, y: contentY, w: btnW, h: btnH, action: 'skip' },
    { x: btnX + btnW + btnGap, y: contentY, w: btnW, h: btnH, action: 'help' },
  ];
}
```

3. render()의 버튼 렌더 위치를 `contentY = toastY + toastH - 34` 기준으로 통일.

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

Expected: 전체 PASS

- [ ] **Step 5: Commit**

```bash
git add ui/EventToast.js tests/UIScreenHitbox.test.js
git commit -m "fix: EventToast 타이틀바 추가 + hitbox/render 좌표 통일"
```

---

## Task 4: EventModalScreen 디자인 보정

**Files:**
- Modify: `ui/EventModalScreen.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: EventModalScreen hitbox 테스트 추가**

```js
import { EventModalScreen } from '../ui/EventModalScreen.js';

describe('EventModalScreen hitbox', () => {
  it('visible=true 시 continue/unpause hitbox 반환', () => {
    const em = new EventModalScreen({ canvasWidth: 800, canvasHeight: 600 });
    em.show('E1');
    const hbs = em.getHitboxes();
    expect(hbs.length).toBeGreaterThanOrEqual(1);
    const actions = hbs.map(h => h.action);
    expect(actions.some(a => a === 'continue' || a === 'unpause')).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 3: EventModalScreen.js 디자인 보정**

`ui/EventModalScreen.js` `render()` 내에서:

1. 모달 상단에 타이틀바 추가 (타이틀: `event.E1.js` 또는 `event.${this.eventId}.js`):

```js
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
ctx.fillText(`event.${this.eventId || 'E1'}.js`, modalX + 52, modalY + 10);
```

2. MISSION 박스에 progress bar 추가 (E1: e1Kills/15, E2: e2Kills/Infinity):

```js
// MISSION progress bar (4px, teal fill)
const progress = Math.min(1, (this.progress || 0) / (this.target || 15));
ctx.fillStyle = HUD.COLORS.border;
ctx.fillRect(missionX, missionY + 20, missionW, 4);
ctx.fillStyle = HUD.COLORS.teal2;
ctx.fillRect(missionX, missionY + 20, missionW * progress, 4);
```

3. REWARD 박스에 `return { enhance: N }` syntax coloring 추가:

```js
ctx.fillStyle = HUD.COLORS.keyword;
ctx.fillText('return', rewardX, rewardY);
ctx.fillStyle = HUD.COLORS.text;
ctx.fillText(' { ', rewardX + ctx.measureText('return').width, rewardY);
ctx.fillStyle = HUD.COLORS.teal2;
ctx.fillText('enhance', rewardX + ctx.measureText('return { ').width, rewardY);
ctx.fillStyle = HUD.COLORS.text;
ctx.fillText(': ', rewardX + ctx.measureText('return { enhance').width, rewardY);
ctx.fillStyle = '#a6e3a1';
ctx.fillText(`${this.rewardEnhance || 3}`, rewardX + ctx.measureText('return { enhance: ').width, rewardY);
ctx.fillStyle = HUD.COLORS.text;
ctx.fillText(' }', rewardX + ctx.measureText(`return { enhance: ${this.rewardEnhance || 3}`).width, rewardY);
```

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 5: Commit**

```bash
git add ui/EventModalScreen.js tests/UIScreenHitbox.test.js
git commit -m "fix: EventModalScreen 타이틀바 + progress bar + reward syntax coloring"
```

---

## Task 5: StatUpgrade 디자인 보정

**Files:**
- Modify: `ui/StatUpgrade.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: StatUpgrade hitbox 테스트 추가**

```js
import { StatUpgrade } from '../ui/StatUpgrade.js';

describe('StatUpgrade hitbox', () => {
  it('visible=true 시 3개 select-stat hitbox 반환', () => {
    const su = new StatUpgrade({ canvasWidth: 800, canvasHeight: 600 });
    su.show();
    const hbs = su.getHitboxes();
    expect(hbs.length).toBe(3);
    hbs.forEach((h, i) => {
      expect(h.action).toBe('select-stat');
      expect(h.statIndex).toBe(i);
    });
  });

  it('3개 hitbox y좌표가 순서대로 증가한다', () => {
    const su = new StatUpgrade({ canvasWidth: 800, canvasHeight: 600 });
    su.show();
    const hbs = su.getHitboxes();
    expect(hbs[1].y).toBeGreaterThan(hbs[0].y);
    expect(hbs[2].y).toBeGreaterThan(hbs[1].y);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 3: StatUpgrade.js 디자인 보정**

`ui/StatUpgrade.js` `render()` 내에서:

1. 타이틀바 추가 (타이틀: `upgrade.select()`):

```js
// 모달 상단 타이틀바
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
ctx.fillText('upgrade.select()', modalX + 52, modalY + 10);
```

2. 옵션 배경을 `HUD.COLORS.sidebar` → `'#181825'` 로 교체:

```js
// Before
ctx.fillStyle = HUD.COLORS.sidebar;
// After
ctx.fillStyle = '#181825';
```

3. 선택된 옵션에 `↵ press to select` 힌트 줄 추가 (이미 있음 — 동작 확인만):
확인: `ctx.fillText('↵ press to select', ...)` 코드 존재 여부 검증, 없으면 추가.

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 5: Commit**

```bash
git add ui/StatUpgrade.js tests/UIScreenHitbox.test.js
git commit -m "fix: StatUpgrade 타이틀바 + sidebar 색상 보정"
```

---

## Task 6: WeaponGet 디자인 보정

**Files:**
- Modify: `ui/WeaponGet.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: WeaponGet hitbox 테스트 추가**

```js
import { WeaponGet } from '../ui/WeaponGet.js';
import { GitWeapon } from '../weapons/Git.js';

describe('WeaponGet hitbox', () => {
  it('visible=true 시 discard/equip hitbox 반환', () => {
    const wg = new WeaponGet({ canvasWidth: 800, canvasHeight: 600 });
    wg.show(new GitWeapon());
    const hbs = wg.getHitboxes();
    expect(hbs.length).toBeGreaterThanOrEqual(1);
    const actions = hbs.map(h => h.action);
    expect(actions.some(a => a === 'discard' || a === 'equip' || a === 'confirm')).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 3: WeaponGet.js 디자인 보정**

`ui/WeaponGet.js` `render()` 내에서:

1. 타이틀바 추가 (타이틀: `weapon.acquired()`):

```js
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
```

2. 무기 박스: border `HUD.COLORS.orange`, bg `rgba(249,226,175,0.05)`:

```js
ctx.strokeStyle = HUD.COLORS.orange;
ctx.fillStyle = 'rgba(249,226,175,0.05)';
```

3. 무기 이름 폰트 `bold 14px monospace`, 색상 `HUD.COLORS.orange`.

4. 코드 스니펫 박스: bg `'#181825'`, border `HUD.COLORS.border`.

5. status bar 텍스트: `✓ EVENT E2 | 무기 획득!`

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 5: Commit**

```bash
git add ui/WeaponGet.js tests/UIScreenHitbox.test.js
git commit -m "fix: WeaponGet 타이틀바 + 무기박스 orange 테마 보정"
```

---

## Task 7: BossIntro 디자인 보정

**Files:**
- Modify: `ui/BossIntro.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: BossIntro hitbox 테스트 추가**

```js
import { BossIntro } from '../ui/BossIntro.js';

describe('BossIntro', () => {
  it('show() 후 isAutoTransitionReady() = false (즉시)', () => {
    const bi = new BossIntro({ canvasWidth: 800, canvasHeight: 600 });
    bi.show({ name: '장선형', phase: 1 });
    expect(bi.isAutoTransitionReady()).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 3: BossIntro.js 디자인 보정**

`ui/BossIntro.js` `render()` 내에서:

1. 타이틀바 추가 (타이틀: `boss.spawn()`):

```js
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
ctx.fillText('boss.spawn()', modalX + 52, modalY + 10);
```

2. HP bar 영역 bg: `rgba(243,139,168,0.15)` + HP bar gradient:

```js
// HP bar gradient
const grad = ctx.createLinearGradient(hpBarX, 0, hpBarX + hpBarW, 0);
grad.addColorStop(0, '#f38ba8');
grad.addColorStop(1, '#fab387');
ctx.fillStyle = grad;
ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
```

3. 보스 이모지 스프라이트: 36px 폰트 + `ctx.shadowColor = 'rgba(243,139,168,0.53)'` + `ctx.shadowBlur = 12`:

```js
ctx.shadowColor = 'rgba(243,139,168,0.53)';
ctx.shadowBlur = 12;
ctx.font = '36px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('👿', spriteX, spriteY);
ctx.shadowBlur = 0;
ctx.shadowColor = 'transparent';
```

4. 스탯 3칸 그리드 (HP/공격/추적): `#181825` bg, `HUD.COLORS.border` border.

5. status bar bg: `#c0392b`.

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 5: Commit**

```bash
git add ui/BossIntro.js tests/UIScreenHitbox.test.js
git commit -m "fix: BossIntro 타이틀바 + gradient HP bar + 이모지 shadow"
```

---

## Task 8: GameOver 디자인 보정

**Files:**
- Modify: `ui/GameOver.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: GameOver hitbox 테스트 추가**

```js
import { GameOver } from '../ui/GameOver.js';

describe('GameOver hitbox', () => {
  it('visible=true 시 exit/restart hitbox 반환', () => {
    const go = new GameOver({ canvasWidth: 800, canvasHeight: 600 });
    go.show({ elapsed: 100, kills: 50, maxCombo: 10 });
    const hbs = go.getHitboxes();
    expect(hbs.length).toBe(2);
    expect(hbs.find(h => h.action === 'exit')).toBeDefined();
    expect(hbs.find(h => h.action === 'restart')).toBeDefined();
  });

  it('exit/restart hitbox y가 동일하다', () => {
    const go = new GameOver({ canvasWidth: 800, canvasHeight: 600 });
    go.show({});
    const hbs = go.getHitboxes();
    expect(hbs[0].y).toBe(hbs[1].y);
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 3: GameOver.js 디자인 보정**

`ui/GameOver.js` `render()` 내에서:

1. 타이틀바 추가 (타이틀: `FATAL: PlayerDied`):

```js
// 타이틀바
ctx.fillStyle = '#181825';
ctx.fillRect(0, 0, this.cw, 20);
[['#f55',0],['#fb0',1],['#5c5',2]].forEach(([c,i]) => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(10 + i * 14, 10, 4, 0, Math.PI * 2);
  ctx.fill();
});
ctx.fillStyle = HUD.COLORS.comment;
ctx.font = '8px monospace';
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
ctx.fillText('FATAL: PlayerDied', 52, 10);
```

2. `y` 시작점을 `40` → `44` 로 조정 (타이틀바 20px + 여백).

3. run summary bg: `'#181825'` (기존 `HUD.COLORS.sidebar` `#252526` 교체):

```js
ctx.fillStyle = '#181825';
ctx.fillRect(PAD, y, this.cw - PAD * 2, 80);
```

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 5: Commit**

```bash
git add ui/GameOver.js tests/UIScreenHitbox.test.js
git commit -m "fix: GameOver 타이틀바 + run summary sidebar 색상 보정"
```

---

## Task 9: StageClear 디자인 보정

**Files:**
- Modify: `ui/StageClear.js`
- Modify: `tests/UIScreenHitbox.test.js`

- [ ] **Step 1: StageClear hitbox 테스트 추가**

```js
import { StageClear } from '../ui/StageClear.js';

describe('StageClear hitbox', () => {
  it('visible=true 시 next-stage hitbox 반환', () => {
    const sc = new StageClear({ canvasWidth: 800, canvasHeight: 600 });
    sc.show({ stageNumber: 1, kills: 100, elapsed: 200, enhance: 3, coins: 5 });
    const hbs = sc.getHitboxes();
    expect(hbs.length).toBeGreaterThanOrEqual(1);
    expect(hbs.find(h => h.action === 'next-stage')).toBeDefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 3: StageClear.js 디자인 보정**

`ui/StageClear.js` `render()` 내에서:

1. 타이틀바 추가 (타이틀: `git commit — Stage N 완료`):

```js
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
ctx.fillText(`git commit — Stage ${this.stageStats?.stageNumber || 1} 완료`, modalX + 52, modalY + 10);
```

2. git 커맨드 라인 추가 (모달 상단):

```js
ctx.fillStyle = HUD.COLORS.teal2;
ctx.font = HUD.FONTS.xs;
ctx.textAlign = 'left';
ctx.textBaseline = 'top';
ctx.fillText(`$ git commit -m "feat: Stage ${this.stageStats?.stageNumber || 1} 완료"`, modalX + 8, contentY);
contentY += 16;
```

3. commit-box: `rgba(78,201,176,0.08)` bg + teal border:

```js
ctx.fillStyle = 'rgba(78,201,176,0.08)';
ctx.fillRect(commitX, commitY, commitW, commitH);
ctx.strokeStyle = 'rgba(78,201,176,0.4)';
ctx.lineWidth = 1;
ctx.strokeRect(commitX, commitY, commitW, commitH);
```

4. clear-log 라인 색상: 스테이지 완료(teal) / 보스 처치(green) / 퀘스트(green) / 보상(orange).

5. 스탯 3칸 그리드: 처치(teal)/시간(blue)/재화(orange), 칸 사이 `HUD.COLORS.border` 구분선.

6. `git push origin Stage2 →` 버튼: 전폭, `HUD.COLORS.orange` bg, dark text:

```js
const btnH = 32;
const btnY = modalY + modalH - 12 - btnH;
ctx.fillStyle = HUD.COLORS.orange;
ctx.fillRect(modalX + 8, btnY, modalW - 16, btnH);
ctx.fillStyle = HUD.COLORS.bg;
ctx.font = 'bold 11px monospace';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(`git push origin Stage${(this.stageStats?.stageNumber || 1) + 1} →`, modalX + modalW / 2, btnY + btnH / 2);
```

- [ ] **Step 4: 테스트 재실행 — PASS 확인**

```bash
npx vitest run tests/UIScreenHitbox.test.js
```

- [ ] **Step 5: 전체 테스트 실행**

```bash
npx vitest run
```

Expected: 모든 기존 테스트 PASS + 신규 hitbox 테스트 PASS

- [ ] **Step 6: Commit**

```bash
git add ui/StageClear.js tests/UIScreenHitbox.test.js
git commit -m "fix: StageClear 타이틀바 + commit-box + 스탯 그리드 보정"
```

---

## Task 10: phase-status.md 업데이트

**Files:**
- Modify: `docs/phase-status.md`

- [ ] **Step 1: phase-status.md Cycle 2.2 완료 표시**

```markdown
- [x] Cycle 2.2 — 버그 픽스 + UI 디자인 보정 ✅
```

- [ ] **Step 2: Commit**

```bash
git add docs/phase-status.md
git commit -m "docs: Phase 11 Cycle 2.2 완료 표시"
```
