# Phase 11 Cycle 2.2 — 버그 픽스 + UI 디자인 보정

## 배경

Phase 11 Cycle 1에서 9개 UI 클래스를 구현했으나, 버그 4개로 인해 모든 UI 화면에서 클릭이 작동하지 않아 게임이 freeze 상태가 됨. 추가로 초기 무기 선택 화면에 Python이 중복 등장.

## 버그 목록

### Bug 1 — 마우스 좌표 불일치 (모든 UI 화면 클릭 무효)

**위치:** `main.js` mousedown 핸들러 (line ~181)

**원인:** hitbox 좌표는 canvas 내부 좌표계 (800×600) 기준이지만, `e.clientX/Y`는 CSS 스케일된 화면 좌표. canvas가 CSS로 동적 스케일되므로 불일치 발생.

**수정:** `canvas.getBoundingClientRect()`로 스케일 비율 계산 후 변환.

```js
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
const cx = (e.clientX - rect.left) * scaleX;
const cy = (e.clientY - rect.top) * scaleY;
// 이후 모든 hitbox 비교에서 e.clientX → cx, e.clientY → cy
```

### Bug 2 — paused closure 변수 vs gameSession.paused 분리

**위치:** `main.js` startGame() 내부

**원인:** `updateGame`은 local closure `paused` 변수를 읽지만, mousedown 핸들러는 `gameSession.paused = false`를 씀. 두 변수가 별개이므로 클릭해도 게임이 영구 freeze.

**수정:** startGame() 안에 setter 노출.

```js
gameSession.setPaused = (v) => { paused = v; };
// mousedown 핸들러에서 gameSession.paused = false → gameSession.setPaused(false)
```

### Bug 3 — WeaponSelect 초기 무기 목록에 Python 중복

**위치:** `main.js` handleIntroKey() (line ~127)

**원인:** 세 번째 무기를 `new PythonWeapon()` placeholder로 넣음. `weapons/C.js`가 존재하나 import 미연결.

**수정:**
```js
import { CWeapon } from './weapons/C.js';
// AVAILABLE_WEAPONS
const AVAILABLE_WEAPONS = [new PythonWeapon(), new JavaScriptWeapon(), new CWeapon()];
```

### Bug 4 — WeaponSelect 시작 버튼 hitbox X 불일치

**위치:** `ui/WeaponSelect.js` getHitboxes()

**원인:** 버튼 렌더 위치 `sidebarX(80) + 450 = x:530` 이지만 hitbox는 `x: 430` (100px 차이).

**수정:** hitbox x를 `530`으로 맞춤 (또는 sidebarX 상수 참조).

---

## UI 디자인 보정

### 공통 색상 팔레트

각 UI 파일에서 `HUD.COLORS` 의존 최소화. 목업 HTML 기준 상수 정의:

```js
const C = {
  bg:       '#1e1e2e',
  sidebar:  '#181825',
  border:   '#313244',
  teal:     '#4ec9b0',
  orange:   '#f9e2af',
  red:      '#f38ba8',
  text:     '#cdd6f4',
  comment:  '#45475a',
  status:   '#007acc',
  purple:   '#cba6f7',
  blue:     '#89b4fa',
  green:    '#a6e3a1',
};
```

### 공통 컴포넌트

모든 화면에 적용:
- **타이틀바:** 상단에 traffic light dots (빨/노/초 원 7px) + 파일명 텍스트 (8px, `#6c7086`)
- **Status bar:** 하단 16px, `#007acc` 배경, 좌우 상태 텍스트

### 화면별 보정

#### WeaponSelect
- 파일트리 좌측 배치, 선택 항목 teal border + `rgba(78,201,176,0.08)` bg
- 우측 코드 프리뷰: syntax coloring (keyword=purple, fn=teal, str=red, comment=gray)
- 하단 confirm 박스: `선택됨: Python.py` + `시작 →` 버튼 (teal bg, dark text)
- hitbox Bug 4 수정 포함

#### EventToast
- 이벤트 배너 (`⚡ EVENT TRIGGER — E1`): `rgba(249,226,175,0.06)` bg + orange border
- 캐릭터 박스: 28px 정사각형, 이모지 중앙, 이름(bold)/역할(우측 align) 헤더
- 대사: italic, `#f5c2e7`, Noto Sans KR fallback
- 버그 타입 라인: `//` comment 색상 + teal 타입명 + orange 보상
- 버튼: 무시하기(투명+border), 도와주기(orange bg+dark text)

#### EventModalScreen
- 코드 주석 헤더 (`// [EVENT E1] 들여쓰기 지옥`)
- MISSION 박스: `#181825` bg, 목표 수/현재 수 + progress bar (4px, teal fill)
- REWARD 박스: `rgba(249,226,175,0.08)` bg, `return { enhance: N }` syntax coloring
- 버튼 2개: `일시정지 해제` / `계속 플레이`

#### StatUpgrade
- 옵션별 색상 구분: moveSpeed=teal, attackSpeed=orange, damageMulti=red
- 선택 시 해당 색 border + `rgba(color,0.08)` bg
- `↵ press to select` 힌트 선택 항목에만 표시
- status bar: `✓ Q1 COMPLETE | 버그 100마리!`

#### WeaponGet
- 중앙 무기 박스: orange border + `rgba(249,226,175,0.05)` bg
- 무기 이모지 (32px) + 이름 (14px bold, orange) + 설명 (8px, comment)
- 코드 스니펫: `#181825` bg, syntax coloring
- 버튼: `버리기`(투명) + `장착 (슬롯 N)`(orange bg)

#### BossIntro
- 상단 HP bar 영역: `rgba(243,139,168,0.15)` bg, 이름 + 페이즈 + gradient HP bar
- 보스 이모지 스프라이트 (36px) + `filter: drop-shadow` 효과 (Canvas shadow API)
- 대사: `#2d1b1b` bg, red border, italic pink text
- 스탯 3칸 그리드: HP/공격/추적
- status bar: `#c0392b` (빨강)

#### GameOver
- 에러 헤더: `rgba(243,139,168,0.12)` bg, `✗ PlayerDied` + `exit code 1`
- Stack trace 라인들: red error + gray trace
- Run summary: 생존시간(blue)/킬(teal)/콤보(orange) 3행
- 버튼: `exit`(투명) + `game.restart()`(orange)
- status bar: `#6c1a1a` (진한 빨강)

#### StageClear
- `$ git commit -m "feat: Stage N 완료"` 커맨드 라인
- commit-box: `rgba(78,201,176,0.08)` bg + teal border, feat 메시지 + Author
- clear-log: teal/green/orange 색상 구분 라인
- 스탯 3칸 그리드: 처치(teal)/시간(blue)/재화(orange), 각 칸 border
- `git push origin Stage2 →` 버튼 (전폭 orange)

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `main.js` | Bug 1(좌표변환), Bug 2(setPaused), Bug 3(C무기 import/list) |
| `ui/WeaponSelect.js` | Bug 4(hitbox x), 디자인 보정 |
| `ui/EventToast.js` | 디자인 보정 |
| `ui/EventModalScreen.js` | 디자인 보정 |
| `ui/StatUpgrade.js` | 디자인 보정 |
| `ui/WeaponGet.js` | 디자인 보정 |
| `ui/BossIntro.js` | 디자인 보정 |
| `ui/GameOver.js` | 디자인 보정 |
| `ui/StageClear.js` | 디자인 보정 |

## 제외 범위

- `ui/BossPhase2.js` — BossIntro와 동일 구조, 별도 보정 불필요
- HUD HP바 — 이미 정상 동작, 변경 없음
- 게임플레이 로직 — 버그 픽스 외 변경 없음
