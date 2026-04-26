# Phase 11 Cycle 2.1 UI 폴리시 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Canvas CSS Scale 적용으로 게임 화면 키우기 + 9개 UI 화면 스타일 개선 (hitbox 버그 수정 포함)

**Architecture:** `index.html` CSS 변경으로 canvas 확대 (내부 좌표 800×600 유지). UI 화면들은 `examples/phase11-cycle1-ui-screens.html` 레퍼런스로 폰트/레이아웃 개선. hitbox 버그(GameOver, StageClear)는 버튼 Y를 `this.ch - 고정거리`로 고정하여 render()와 getHitboxes() 동기화.

**Tech Stack:** Vanilla JS, Canvas 2D API, 로컬 HTTP 서버 (python -m http.server 또는 live-server)

---

### Task 1: index.html — Canvas CSS Scale

**Files:**
- Modify: `index.html`

- [ ] **Step 1: index.html canvas CSS 수정**

```html
<!-- 변경 전 -->
canvas {
  display: block;
  image-rendering: pixelated;
  border: 2px solid #4a90d9;
}

<!-- 변경 후 -->
canvas {
  display: block;
  image-rendering: pixelated;
  border: 2px solid #4a90d9;
  width: min(100vw, calc(100vh * 4 / 3));
  height: min(100vh, calc(100vw * 3 / 4));
}
```

- [ ] **Step 2: 시각 검증**

```
1. python -m http.server 8000 (또는 기존 서버 실행)
2. 브라우저에서 http://localhost:8000/index.html 열기
3. 확인: canvas가 브라우저 창을 꽉 채우며 4:3 비율 유지
4. F12 → 반응형 테스트: 창 크기 바꿔도 비율 유지되는지 확인
```

- [ ] **Step 3: 커밋**

```bash
git add index.html
git commit -m "fix: canvas CSS scale — viewport 4:3 fit"
```

---

### Task 2: HUD.js — FONTS 상수 추가

**Files:**
- Modify: `ui/HUD.js`

- [ ] **Step 1: FONTS 상수 추가**

`ui/HUD.js`의 `static COLORS = { ... }` 블록 바로 아래에 추가:

```js
  static FONTS = {
    xs:  '9px monospace',
    sm:  '11px monospace',
    md:  '13px monospace',
    lg:  '16px monospace',
    xl:  'bold 20px monospace',
    xxl: 'bold 28px monospace',
  };
```

- [ ] **Step 2: 커밋**

```bash
git add ui/HUD.js
git commit -m "feat: HUD.FONTS 상수 추가 (xs~xxl)"
```

---

### Task 3: GameOver.js — hitbox 버그 수정 + 스타일 개선

**Files:**
- Modify: `ui/GameOver.js`

**현재 버그:** `getHitboxes()`의 `btnY = 240` 하드코딩 — 실제 버튼 위치 ~264 → 클릭 안 됨.

**해결:** 버튼 Y를 `this.ch - 80`으로 고정. render()와 getHitboxes() 동일한 상수 사용.

- [ ] **Step 1: GameOver.js 전체 교체**

```js
import { HUD } from './HUD.js';

export class GameOver {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.runStats = null;
  }

  show(runStats = {}) {
    this.runStats = runStats;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible) return;

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, this.cw, this.ch);

    const PAD = 20;
    let y = 40;

    // 에러 헤더
    ctx.fillStyle = 'rgba(243, 139, 168, 0.12)';
    ctx.fillRect(PAD, y - 8, this.cw - PAD * 2, 36);
    ctx.strokeStyle = 'rgba(243, 139, 168, 0.33)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y - 8, this.cw - PAD * 2, 36);

    ctx.fillStyle = HUD.COLORS.red;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('✗ PlayerDied', PAD + 8, y);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('exit code 1', PAD + 8, y + 16);

    y += 48;

    // stacktrace
    ctx.font = '11px monospace';
    ctx.fillStyle = HUD.COLORS.red;
    ctx.fillText('Error: PlayerHP = 0', PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.comment;
    const trace = [
      '  at Game.checkDeath',
      '  at Enemy.onContact',
      '  at GameLoop.update',
    ];
    trace.forEach((line) => {
      ctx.fillText(line, PAD, y);
      y += 14;
    });

    y += 12;

    // run summary 박스
    ctx.fillStyle = HUD.COLORS.sidebar;
    ctx.fillRect(PAD, y, this.cw - PAD * 2, 80);
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y, this.cw - PAD * 2, 80);

    let rowY = y + 10;

    const rows = [
      { label: '생존 시간', value: this._fmtTime(this.runStats.elapsed || 0), color: HUD.COLORS.timerVal },
      { label: '버그 처치', value: `${this.runStats.kills || 0}마리`, color: HUD.COLORS.teal2 },
      { label: '최대 콤보', value: `×${this.runStats.maxCombo || 0}`, color: HUD.COLORS.orange },
    ];

    rows.forEach((row) => {
      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, PAD + 8, rowY);

      ctx.fillStyle = row.color;
      ctx.textAlign = 'right';
      ctx.fillText(row.value, this.cw - PAD - 8, rowY);

      rowY += 18;
    });

    y += 92;

    // 버튼 (하단 고정)
    const BTN_Y = this.ch - 80;
    const btnW = (this.cw - PAD * 2 - 12) / 2;
    const btnH = 28;
    const btn1X = PAD;
    const btn2X = PAD + btnW + 12;

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(btn1X, BTN_Y, btnW, btnH);
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('exit', btn1X + btnW / 2, BTN_Y + btnH / 2);

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(btn2X, BTN_Y, btnW, btnH);
    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('game.restart()', btn2X + btnW / 2, BTN_Y + btnH / 2);

    // 키보드 힌트
    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('R: restart', this.cw / 2, this.ch - 20);

    // 스테이터스 바
    ctx.fillStyle = '#6c1a1a';
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('✗ GAME OVER', 8, this.ch - 5);
    ctx.textAlign = 'right';
    ctx.fillText(this._fmtTime(this.runStats.elapsed || 0), this.cw - 8, this.ch - 5);
  }

  getHitboxes() {
    if (!this.visible) return [];

    const PAD = 20;
    const BTN_Y = this.ch - 80;
    const btnW = (this.cw - PAD * 2 - 12) / 2;
    const btnH = 28;

    return [
      { x: PAD, y: BTN_Y, w: btnW, h: btnH, action: 'exit' },
      { x: PAD + btnW + 12, y: BTN_Y, w: btnW, h: btnH, action: 'restart' },
    ];
  }

  _fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
```

- [ ] **Step 2: 시각 검증**

```
1. 게임 실행 후 플레이어 HP가 0이 되도록 적에게 맞기 (또는 콘솔에서 player.hp = 0 입력)
2. game-over 화면 확인:
   - 에러 헤더 (빨간 박스), stacktrace, 통계 박스 보이는지
   - "exit"와 "game.restart()" 버튼 클릭 동작 확인
3. R 키로 재시작 동작 확인
```

- [ ] **Step 3: 커밋**

```bash
git add ui/GameOver.js
git commit -m "fix: GameOver hitbox 동기화 + examples.html 스타일 적용"
```

---

### Task 4: StageClear.js — hitbox 버그 수정 + 스타일 개선

**Files:**
- Modify: `ui/StageClear.js`

**현재 버그:** `getHitboxes()`의 `btnY = 200` 하드코딩 — 실제 버튼 위치와 불일치.

**해결:** 버튼 Y를 `this.ch - 80`으로 고정.

- [ ] **Step 1: StageClear.js 전체 교체**

```js
import { HUD } from './HUD.js';

export class StageClear {
  constructor({ canvasWidth, canvasHeight }) {
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.visible = false;
    this.stageStats = null;
  }

  show(stageStats = {}) {
    this.stageStats = stageStats;
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  render(ctx) {
    if (!this.visible) return;

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.fillRect(0, 0, this.cw, this.ch);

    const PAD = 20;
    const stageNum = this.stageStats.stageNumber || 1;
    const nextStage = stageNum + 1;
    let y = 40;

    // 터미널 헤더
    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`$ git commit -m "feat: Stage ${stageNum} 완료"`, PAD, y);

    y += 24;

    // commit 박스
    ctx.fillStyle = 'rgba(78, 201, 176, 0.08)';
    ctx.fillRect(PAD, y, this.cw - PAD * 2, 50);
    ctx.strokeStyle = 'rgba(78, 201, 176, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y, this.cw - PAD * 2, 50);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('COMMIT', PAD + 8, y + 8);

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`feat: Stage ${stageNum} Python 기초 완료`, PAD + 8, y + 22);

    ctx.fillStyle = HUD.COLORS.comment;
    ctx.font = '9px monospace';
    ctx.fillText('Author: 김지윤', PAD + 8, y + 36);

    y += 62;

    // 클리어 로그
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = HUD.COLORS.teal2;
    ctx.fillText(`  Stage ${stageNum} 완료`, PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText('  보스 "장선형" 처치 ✓', PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.value;
    ctx.fillText('  퀘스트 Q1 달성 ✓', PAD, y);
    y += 16;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillText('  보상: Git.exe, 재화 ×5', PAD, y);

    y += 24;

    // 3열 통계 그리드
    const gridW = this.cw - PAD * 2;
    const colW = gridW / 3;

    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD, y, gridW, 44);

    const cols = [
      { label: '처치', value: String(this.stageStats.kills || 0), color: HUD.COLORS.teal2 },
      { label: '시간', value: this._fmtTime(this.stageStats.elapsed || 0), color: HUD.COLORS.timerVal },
      { label: '재화', value: `+${this.stageStats.enhance || 0}`, color: HUD.COLORS.orange },
    ];

    cols.forEach((col, i) => {
      const cx = PAD + i * colW + colW / 2;

      if (i < cols.length - 1) {
        ctx.strokeStyle = HUD.COLORS.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD + (i + 1) * colW, y);
        ctx.lineTo(PAD + (i + 1) * colW, y + 44);
        ctx.stroke();
      }

      ctx.fillStyle = HUD.COLORS.comment;
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(col.label, cx, y + 10);

      ctx.fillStyle = col.color;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(col.value, cx, y + 32);
    });

    y += 56;

    // 다음 스테이지 버튼 (하단 고정)
    const BTN_Y = this.ch - 80;
    const btnW = this.cw - PAD * 2;
    const btnH = 32;

    ctx.fillStyle = HUD.COLORS.orange;
    ctx.fillRect(PAD, BTN_Y, btnW, btnH);

    ctx.fillStyle = HUD.COLORS.bg;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`git push origin Stage${nextStage} →`, PAD + btnW / 2, BTN_Y + btnH / 2);

    // 스테이터스 바
    ctx.fillStyle = HUD.COLORS.statusBar;
    ctx.fillRect(0, this.ch - 16, this.cw, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('✓ STAGE CLEAR', 8, this.ch - 5);
    ctx.textAlign = 'right';
    ctx.fillText('main ↑1', this.cw - 8, this.ch - 5);
  }

  getHitboxes() {
    if (!this.visible) return [];

    const PAD = 20;
    const BTN_Y = this.ch - 80;
    const btnW = this.cw - PAD * 2;
    const btnH = 32;

    return [
      { x: PAD, y: BTN_Y, w: btnW, h: btnH, action: 'next-stage' },
    ];
  }

  _fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
```

- [ ] **Step 2: 시각 검증**

```
1. 보스를 처치하여 stage-clear 화면 진입 (또는 main.js에서 임시로 gameState = 'stage-clear' 설정)
2. 확인:
   - commit 박스, 클리어 로그, 3열 통계 보이는지
   - "git push origin Stage2 →" 버튼 클릭 → weapon-select 화면으로 전환되는지
```

- [ ] **Step 3: 커밋**

```bash
git add ui/StageClear.js
git commit -m "fix: StageClear hitbox 동기화 + examples.html 스타일 적용"
```

---

### Task 5: WeaponSelect.js — 폰트 크기 개선

**Files:**
- Modify: `ui/WeaponSelect.js`

**문제:** 전체 폰트 9px 사용 — examples.html 기준으로 타이틀/무기명/버튼 폰트 키우기.

- [ ] **Step 1: WeaponSelect.js render() 폰트 크기 수정**

`render(ctx)` 내에서 아래 항목 교체:

```js
// 상단 타이틀 — 변경 전: 'bold 28px monospace' (유지)

// 부제 — 변경 전: '13px monospace'
ctx.font = HUD.FONTS.md;  // '13px monospace'

// 파일트리 헤더 — 변경 전: '9px monospace'
ctx.font = HUD.FONTS.sm;  // '11px monospace'

// 파일트리 아이템 — 변경 전: '9px monospace'
ctx.font = HUD.FONTS.sm;  // '11px monospace'

// 코드 뷰 — 변경 전: '9px monospace'
ctx.font = HUD.FONTS.sm;  // '11px monospace'

// 선택됨 텍스트 — 변경 전: '9px monospace'
ctx.font = HUD.FONTS.sm;  // '11px monospace'

// 버튼 텍스트 — 변경 전: 'bold 9px monospace'
ctx.font = 'bold 11px monospace';

// 스테이터스 바 — 변경 전: '8px monospace'
ctx.font = HUD.FONTS.xs;  // '9px monospace' (유지)

// 키보드 힌트 — 변경 전: '8px monospace'
ctx.font = HUD.FONTS.xs;  // '9px monospace' (유지)
```

`WeaponSelect.js`에서 `9px`로 설정된 모든 `ctx.font` 줄을 `HUD.FONTS.sm`으로 교체:

```js
// 변경 전
ctx.font = '9px monospace';
// 변경 후
ctx.font = HUD.FONTS.sm;
```

단, `8px monospace` 줄은 `HUD.FONTS.xs`로 교체:

```js
// 변경 전
ctx.font = '8px monospace';
// 변경 후
ctx.font = HUD.FONTS.xs;
```

- [ ] **Step 2: 시각 검증**

```
1. 인트로 화면에서 클릭 → weapon-select 진입
2. 확인:
   - 무기 목록 (Python, C/C++, Java 등) 보이는지
   - ↑↓ 키로 선택 전환되는지
   - "시작 →" 버튼 클릭 → 게임 시작되는지
```

- [ ] **Step 3: 커밋**

```bash
git add ui/WeaponSelect.js
git commit -m "fix: WeaponSelect 폰트 크기 HUD.FONTS 적용"
```

---

### Task 6: BossIntro.js — 오버레이 강도 조정

**Files:**
- Modify: `ui/BossIntro.js`

**문제:** `fadeRatio * 0.6` → 최대 60% 빨간 오버레이. 게임 화면이 거의 안 보임.

- [ ] **Step 1: 오버레이 강도 조정**

`ui/BossIntro.js` 34번 줄:

```js
// 변경 전
ctx.fillStyle = `rgba(243, 139, 168, ${fadeRatio * 0.6})`;

// 변경 후
ctx.fillStyle = `rgba(243, 139, 168, ${fadeRatio * 0.12})`;
```

- [ ] **Step 2: 보스 스탯 그리드 — 3열 구조 개선**

`ui/BossIntro.js`의 스탯 표 부분 (`// 스탯 표` 주석 이후):

```js
// 스탯 표 (3열 그리드)
const gridW = boxW - 24;
const gridX = boxX + 12;
const colW = gridW / 3;

ctx.fillStyle = HUD.COLORS.sidebar;
ctx.fillRect(gridX, contentY, gridW, 44);
ctx.strokeStyle = HUD.COLORS.border;
ctx.lineWidth = 1;
ctx.strokeRect(gridX, contentY, gridW, 44);

const stats = [
  { label: 'HP', value: String(this.bossData.hp || '500'), color: HUD.COLORS.red },
  { label: '공격', value: String(this.bossData.attack || '3방향'), color: HUD.COLORS.orange },
  { label: '추적', value: String(this.bossData.tracking || '보통'), color: HUD.COLORS.yellow },
];

stats.forEach((stat, i) => {
  const cx = gridX + i * colW + colW / 2;

  if (i < stats.length - 1) {
    ctx.strokeStyle = HUD.COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gridX + (i + 1) * colW, contentY);
    ctx.lineTo(gridX + (i + 1) * colW, contentY + 44);
    ctx.stroke();
  }

  ctx.fillStyle = HUD.COLORS.comment;
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(stat.label, cx, contentY + 10);

  ctx.fillStyle = stat.color;
  ctx.font = 'bold 11px monospace';
  ctx.fillText(stat.value, cx, contentY + 32);
});
```

기존 스탯 표 코드(93번~120번 줄 `ctx.fillStyle = HUD.COLORS.sidebar;` 부터 `ctx.font = '8px monospace';` 줄까지)를 위 코드로 교체.

- [ ] **Step 3: 시각 검증**

```
1. 보스 등장 조건 충족 (웨이브 진행) 또는 콘솔에서 임시 트리거
2. 확인:
   - 빨간 오버레이가 화면을 덜 가리는지 (기존 60% → 12%)
   - 3열 스탯 그리드 (HP/공격/추적) 보이는지
   - 2초 후 playing으로 자동 전환되는지
```

- [ ] **Step 4: 커밋**

```bash
git add ui/BossIntro.js
git commit -m "fix: BossIntro 오버레이 강도 조정 + 스탯 3열 그리드 개선"
```

---

### Task 7: StageClear.js 및 GameOver.js — main.js hitbox 핸들러 확인

**Files:**
- Read: `main.js` (수정 없음, 동작 확인)

- [ ] **Step 1: main.js hitbox 핸들러 확인**

`main.js` 255~280번 줄 근처에서 game-over hitbox 처리 확인:

```js
// 이미 구현되어 있어야 함
} else if (gameState === 'game-over') {
  const hitboxes = uiScreens.gameOver.getHitboxes();
  for (const hb of hitboxes) {
    if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
      if (hb.action === 'restart') { ... }
      if (hb.action === 'exit') { ... }
    }
  }
}
```

`main.js` 268~280번 줄 근처에서 stage-clear hitbox 처리 확인:

```js
} else if (gameState === 'stage-clear') {
  const hitboxes = uiScreens.stageClear.getHitboxes();
  ...
}
```

두 핸들러가 존재하면 추가 수정 불필요. 없으면 아래를 참고하여 추가:

```js
// game-over mousedown 핸들러 (기존 있으면 스킵)
} else if (gameState === 'game-over') {
  const hitboxes = uiScreens.gameOver.getHitboxes();
  for (const hb of hitboxes) {
    if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
      if (hb.action === 'restart') {
        gameState = 'intro';
        renderIntro();
      } else if (hb.action === 'exit') {
        gameState = 'intro';
        renderIntro();
      }
    }
  }
}
```

- [ ] **Step 2: 커밋 (수정했을 경우에만)**

```bash
git add main.js
git commit -m "fix: game-over/stage-clear hitbox 핸들러 누락 추가"
```

---

---

### Task 8: 나머지 화면 시각 검증 (EventToast / EventModalScreen / StatUpgrade / WeaponGet / BossPhase2)

**Files:**
- Read only — 코드 수정 없음. CSS Scale 적용 후 시각 확인만.

**배경:** 5개 화면의 현재 구현은 examples.html과 유사. CSS Scale(Task 1) 적용 시 폰트가 1.8× 확대되어 충분한 가독성 확보 예상.

- [ ] **Step 1: 각 화면 진입 시각 검증**

```
EventToast 확인:
  - 게임 진행 중 E1/E2 이벤트 트리거 대기 또는 main.js에서 임시:
    gameState = 'event-toast'; uiScreens.eventToast.show(gameSession.currentEvent);
  - 확인: 캐릭터 카드, 대사, "무시하기"/"도와주기" 버튼

EventModalScreen 확인:
  - eventToast에서 "도와주기" 클릭 후 진입
  - 확인: 미션 진행바, 보상 박스, 버튼 2개

StatUpgrade 확인:
  - 버그 100마리 처치 후 진입
  - 확인: 3개 카드, ↑↓ 선택, Enter 클릭

WeaponGet 확인:
  - E2 이벤트 완료 후 진입
  - 확인: 무기 박스, 코드 스니펫, "버리기"/"장착" 버튼

BossPhase2 확인:
  - 보스 HP 50% 이하 진입
  - 확인: 오렌지 오버레이, PHASE 2 텍스트, 2초 자동 전환
```

- [ ] **Step 2: 문제 발견 시 해당 파일 수정 후 커밋**

문제 없으면 이 Task는 "확인 완료"로 종료.

문제 있으면: 해당 파일에서 `8px monospace` → `HUD.FONTS.xs`, `9px monospace` → `HUD.FONTS.sm` 교체 후:

```bash
git add ui/<파일명>.js
git commit -m "fix: <화면명> 폰트 크기 HUD.FONTS 적용"
```

---

## 완료 기준 체크리스트

- [ ] 브라우저 창을 꽉 채우는 게임 화면 (4:3 비율)
- [ ] weapon-select: 무기 목록 + 코드 뷰 + 버튼 정상 동작
- [ ] game-over: 에러 헤더 + 통계 + 버튼 클릭 동작
- [ ] stage-clear: commit 박스 + 통계 그리드 + 버튼 클릭 동작
- [ ] boss-intro: 빨간 오버레이가 화면을 과도하게 가리지 않음
- [ ] 모든 hitbox가 실제 버튼 위치와 일치
