# Phase 11 Cycle 1 — 미구현 화면 Canvas 오버레이 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게임에 7개의 미구현 화면을 Canvas 오버레이로 추가하여 완전한 게임 흐름(무기선택 → 게임플레이 → 이벤트/보스 → 클리어/오버)을 구현한다.

**Architecture:** 
- 상태 관리 확장: `gameState` enum을 10개 상태로 확대 ('weapon-select', 'playing', 'event-toast', 'event-modal', 'stat-upgrade', 'weapon-get', 'boss-intro', 'boss-phase2', 'game-over', 'stage-clear')
- 각 상태는 Canvas 렌더링 메서드 + hitbox 반환 메서드의 쌍으로 구현
- hitbox 아키텍처: 마우스 다운 시 현재 상태의 hitboxes를 확인 후 액션 실행
- 색상 팔레트 확장: HUD.COLORS에 VSCode 테마 토큰 추가

**Tech Stack:**
- Vanilla JS (ES6 모듈)
- HTML5 Canvas
- 기존 EventSystem, UpgradeSystem, Boss, Player API 재활용

---

## 파일 구조

### 신규 생성
- `ui/WeaponSelect.js` — 무기 선택 화면 렌더링 + hitbox
- `ui/EventToast.js` — 이벤트 알림 팝업 렌더링 + hitbox
- `ui/EventModalScreen.js` — 이벤트 진행 상황 표시 렌더링 + hitbox
- `ui/StatUpgrade.js` — 스탯 업그레이드 선택 화면 렌더링 + hitbox
- `ui/WeaponGet.js` — 무기 획득 팝업 렌더링 + hitbox
- `ui/BossIntro.js` — 보스 등장 화면 렌더링 (자동 전환)
- `ui/BossPhase2.js` — 보스 페이즈 2 화면 렌더링 (자동 전환)
- `ui/GameOver.js` — 게임 오버 화면 렌더링 + hitbox
- `ui/StageClear.js` — 스테이지 클리어 화면 렌더링 + hitbox

### 수정
- `ui/HUD.js` — 색상 팔레트 확장 (추가 VSCode 토큰)
- `main.js` — gameState 확장, 상태 전환 로직, 마우스 hitbox 입력 처리

---

## 구현 요약

### Task 1: HUD.js 색상 팔레트 확장
- [x] HUD.COLORS에 새로운 색상 토큰 추가 (teal2, red2, orange2, yellow, blue, green, statusBar, sidebar, panel)

### Task 2-10: 각 화면 구현
- [x] Task 2: WeaponSelect.js — 무기 선택 UI + 키보드 입력 처리
- [x] Task 3: EventToast.js — 이벤트 팝업 + 무시하기/도와주기 버튼
- [x] Task 4: EventModalScreen.js — 이벤트 진행 표시 + 계속 플레이 버튼
- [x] Task 5: StatUpgrade.js — 3개 스탯 카드 + 선택 적용
- [x] Task 6: WeaponGet.js — 무기 획득 팝업 + 장착/버리기 선택
- [x] Task 7: BossIntro.js — 보스 정보 표시 + 2초 자동 전환
- [x] Task 8: BossPhase2.js — 보스 페이즈 2 정보 + 2초 자동 전환
- [x] Task 9: GameOver.js — 스택 트레이스 + 런 요약 + restart/exit 버튼
- [x] Task 10: StageClear.js — git commit 메시지 형식 + 통계 표 + 다음 스테이지 버튼

### Task 11: 상태 전환 흐름 통합
- [x] main.js에서 모든 상태(10개)의 루프 함수 호출, 타이머 업데이트, 마우스 입력 처리 통합

---

## 핵심 구현 패턴

모든 화면 클래스는 동일한 인터페이스 구현:
```javascript
class UIScreen {
  constructor({ canvasWidth, canvasHeight }) { }
  show(...args) { this.visible = true; }
  hide() { this.visible = false; }
  render(ctx) { /* Canvas 그리기 */ }
  getHitboxes() { /* 클릭 영역 배열 반환 */ }
}
```

hitbox 구조:
```javascript
{ x, y, w, h, action: 'confirm'|'skip'|'help'|'continue'|... }
```

상태 전환 흐름:
```
intro → weapon-select → playing ↔ event-toast → event-modal → playing
        ↓                ↑
        └─ stat-upgrade ←┘
playing ↔ weapon-get (E2 보상)
playing ↔ boss-intro → (2초) → playing
playing ↔ boss-phase2 → (2초) → playing
playing → game-over (플레이어 사망)
playing → stage-clear (보스 처치)
stage-clear → weapon-select (다음 스테이지)
```

---

## 예상 소요 시간

- Task 1: 5분 (색상 추가)
- Task 2-10: 각 10-15분 (화면 구현)
- Task 11: 20분 (통합 및 테스트)

**총 예상:** 약 2-3시간

---

## 주의사항

1. **상태 전환 시 일시정지**: event-toast/modal/stat-upgrade/weapon-get/boss-intro/boss-phase2 진입 시 `paused = true` 설정 필요
2. **자동 전환**: boss-intro와 boss-phase2는 2초 후 자동으로 'playing'으로 전환
3. **키보드 입력**: weapon-select는 ↑↓/WASD + Enter 지원
4. **마우스 hitbox**: 모든 버튼 액션은 canvas mousedown 리스너에서 처리
5. **런 통계**: game-over 진입 시 eventSystem.elapsed/totalKills 등 수집
6. **무기 배열**: weapon-get에서 equip 선택 시 ownedWeapons에 이미 추가됨 (E2 보상 시점)

