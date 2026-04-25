# Phase 10.5 Cycle 1 — HUD IDE 컨셉 구현 Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement task-by-task. Use `[~]` to skip completed tasks.

**Goal:** `ui/HUD.js`의 단색 스타일을 Catppuccin Mocha 테마 기반 IDE 컨셉으로 교체한다. Canvas 2D API만 사용 (DOM/CSS 없음).

**Spec:** `docs/superpowers/specs/2026-04-25-phase10-5-cycle1-hud-design.md`

---

## Task 1: HUD.js — 색상 상수 추가

**파일:** `ui/HUD.js`

클래스 상단(constructor 위)에 색상 상수 객체를 추가한다.

```js
static COLORS = {
  bg:          '#1e1e2e',
  border:      '#313244',
  text:        '#cdd6f4',
  keyword:     '#cba6f7',   // purple — hp, kills 키워드
  value:       '#a6e3a1',   // green — 킬/HP 값
  timerKey:    '#89b4fa',   // blue — elapsed 키워드
  timerVal:    '#f5c2e7',   // pink — 타이머 값
  comment:     '#45475a',   // gray — // 주석
  red:         '#f38ba8',   // 저체력
  orange:      '#f9e2af',   // 중체력
  orangeAcc:   '#fab387',
  teal:        '#94e2d5',
};
```

- [ ] Task 1: 색상 상수 `static COLORS` 추가

---

## Task 2: _renderHpBar 교체

**파일:** `ui/HUD.js` — `_renderHpBar` 메서드 전체 교체

구현 사항:
- BAR_W=200, BAR_H=18, x=10, y=10 유지
- 배경: `COLORS.border`
- HP 비율에 따라 3단계 그라데이언트 채우기:
  - 50% 초과: `#a6e3a1 → #94e2d5` + `shadowBlur:8, shadowColor:'#a6e3a188'`
  - 25~50%: `#f9e2af → #fab387` + `shadowBlur:8, shadowColor:'#f9e2af88'`
  - 25% 이하: `#f38ba8` 단색 + `Date.now()` 기반 opacity 펄스 (0.6~1.0, 800ms 주기)
- 테두리: `COLORS.border`
- 텍스트: `"hp = {hp} / {maxHp}"` 형식, `measureText()`로 세그먼트별 색상 분리
  - `"hp"` → keyword, `" = "` → text, 숫자 → text, `" / "` → text

- [ ] Task 2: `_renderHpBar` 교체

---

## Task 3: _renderKillCount 교체

**파일:** `ui/HUD.js` — `_renderKillCount` 메서드 전체 교체

구현 사항:
- 위치: x=10, y=36, font: `'14px monospace'`
- 형식: `"kills = {killCount}  // target: {q1Target}"`
- 세그먼트별 색상:
  - `"kills"` → `COLORS.keyword`
  - `" = "` → `COLORS.text`
  - `"{killCount}"` → `COLORS.value`
  - `"  // target: "` → `COLORS.comment`
  - `"{q1Target}"` → `COLORS.value`
- `ctx.measureText()`로 각 세그먼트 x 오프셋 계산

- [ ] Task 3: `_renderKillCount` 교체

---

## Task 4: _renderTimer 교체

**파일:** `ui/HUD.js` — `_renderTimer` 메서드 전체 교체

구현 사항:
- 위치: 상단 중앙 (cw/2, y=8)
- 형식: `elapsed = "3:42"` (따옴표 포함)
- 세그먼트별 색상:
  - `"elapsed"` → `COLORS.timerKey`
  - `" = "` → `COLORS.text`
  - `'"3:42"'` (따옴표 포함) → `COLORS.timerVal`
- 전체 너비를 `measureText()`로 계산 후 중앙 정렬

- [ ] Task 4: `_renderTimer` 교체

---

## Task 5: _renderEventStatus 교체 (배지 스타일)

**파일:** `ui/HUD.js` — `_renderEventStatus` 메서드 전체 교체

구현 사항:
- 위치: 우상단, y=8부터 배지 높이(24px)만큼 아래로 스택
- 배지 구조: 반투명 배경 + 테두리 + 텍스트 (roundRect 또는 수동 path)
- BOSS 활성: bg `rgba(243,139,168,0.07)`, border `rgba(243,139,168,0.27)`, text `#f38ba8`
  - 테두리에 `Date.now() % 1000` 기반 opacity 펄스
- 이벤트 활성(E1/E2): bg `rgba(249,226,175,0.07)`, border `rgba(249,226,175,0.27)`, text `#f9e2af`
- 이벤트 클리어: bg `rgba(166,227,161,0.07)`, border `rgba(166,227,161,0.27)`, text `#a6e3a1`
- 텍스트 내용은 기존과 동일 유지

- [ ] Task 5: `_renderEventStatus` 교체

---

## Task 6: 테스트 실행

**명령:** `npm test -- tests/HUD.test.js`

- [ ] Task 6: 기존 HUD 테스트 전부 통과 확인

---

## Task 7: 전체 테스트 회귀 검사

**명령:** `npm test`

- [ ] Task 7: 전체 테스트 통과 확인
