# Phase 11 Cycle 1: 9개 UI 화면 Canvas 오버레이 완료

**게임 상태:** 미구현된 화면을 9개 추가해서 메인 게임 루프가 모든 상태를 처리하게 함  
**작업 기간:** 2026-04-25 23:30 ~ 2026-04-26 11:00  
**커밋 범위:** `115346b` ~ `6ac8572` (Task 1-11, 15개 커밋)  
**결과:** 7개 계획 → 9개 구현 (기획 변경), 1차 리뷰 FAIL → 2차 PASS

---

## 이번 사이클에서 한 것

### 1. gameState enum 10개로 확장
원래 게임은 `state` 변수 하나로 'playing' 상태만 관리했다. 이번에 다음 9개를 추가:

| 상태 | 역할 | 자동 전환 |
|------|------|---------|
| weapon-select | 무기 선택 화면 (게임 시작 / 스테이지 클리어 후) | 아니오 |
| event-toast | 이벤트 알림 팝업 (도움/무시 선택) | 아니오 |
| event-modal | 이벤트 미션 진행도 표시 | 아니오 |
| stat-upgrade | Q1(100마리) 달성 후 스탯 선택 | 아니오 |
| weapon-get | 이벤트 E2 보상 무기 획득 | 아니오 |
| boss-intro | 보스 등장 화면 (2초 후 자동 → playing) | **예** |
| boss-phase2 | 보스 페이즈 2 전환 (2초 후 자동 → playing) | **예** |
| game-over | 게임 오버 (스택 트레이스 + 런 요약) | 아니오 |
| stage-clear | 스테이지 클리어 (git 형식 메시지) | 아니오 |
| playing | 게임 진행 중 | - |

**변경 배경:** 스펙에서 7개 화면을 예상했으나, 실제 구현하면서 event-modal을 EventModalScreen으로 명시하고, boss 두 가지 상태를 분리하면서 9개로 확대됨.

### 2. 9개 UI 클래스 추가 + HUD.js 색상 팔레트 확장

#### 추가된 파일
- `ui/WeaponSelect.js` — 왼쪽 사이드바 무기 파일트리, 오른쪽 코드 뷰어, 하단 확인 버튼
- `ui/EventToast.js` — 반투명 오버레이 위 동기 캐릭터 카드, "도와주기" / "무시하기" 버튼
- `ui/EventModalScreen.js` — 이벤트 진행도 (현재 / 목표), progress bar, 보상 미리보기
- `ui/StatUpgrade.js` — 3개 스탯 카드 (moveSpeed +15%, attackSpeed +20%, damageMulti +25%)
- `ui/WeaponGet.js` — 무기 이름 + 설명 + 코드 스니펫, "버리기" / "장착" 버튼
- `ui/BossIntro.js` — 빨간 오버레이, 보스 픽셀 스프라이트, 스탯 테이블, 2초 타이머
- `ui/BossPhase2.js` — 오렌지 오버레이, PHASE 2 변경사항 텍스트, 2초 타이머
- `ui/GameOver.js` — 스택 트레이스 스타일 에러 메시지, 런 요약 (시간/처치수/콤보/웨이브)
- `ui/StageClear.js` — git commit 형식 메시지, 클리어 로그, 통계 테이블

#### HUD.COLORS 확장
```javascript
teal:       '#4ec9b0',
red:        '#f44747',
orange:     '#ce9178',
yellow:     '#dcdcaa',
blue:       '#9cdcfe',
green:      '#b5cea8',
statusBar:  '#007acc',
sidebar:    '#252526',
panel:      '#2d2d2d',
```
VSCode 터미널 테마 기반 색상 토큰 10개 추가. 모든 UI 요소가 일관된 비주얼 언어로 표현됨.

### 3. 히트박스 기반 마우스 입력 아키텍처

**구조:**
- 각 UI 클래스의 `render()` 메서드가 Canvas에 그림
- 각 UI 클래스의 `getHitboxes()` 메서드가 클릭 영역 배열 반환
  ```javascript
  [{ x, y, w, h, action: 'confirm' | 'skip' | 'continue' ... }]
  ```
- `main.js`의 `mousedown` 핸들러가 `gameState` 분기 → 현재 화면의 `getHitboxes()` 호출 → 좌표 비교 → 액션 실행

**예시 (WeaponSelect):**
```javascript
getHitboxes() {
  return [{
    x: this.cw - 180,
    y: this.ch - 80,
    w: 150,
    h: 40,
    action: 'confirm'
  }];
}
```

### 4. main.js 상태 전환 루프 통합

#### 주요 구조
```javascript
// gameState 분기
switch (gameState) {
  case 'weapon-select':
    uiScreens.weaponSelect.render(ctx);
    break;
  case 'playing':
    // 기존 게임 루프
    eventSystem.update(dt);
    player.update(dt, enemies);
    enemies.forEach(e => e.update(dt, player));
    // ...
    break;
  case 'boss-intro':
    uiScreens.bossIntro.render(ctx);
    if (bossIntroTimer > 0) {
      bossIntroTimer -= dt;
      if (bossIntroTimer <= 0) gameState = 'playing';
    }
    break;
  // ... 다른 상태들
}
```

#### 입력 처리 (mousedown)
```javascript
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 현재 상태에 따라 hitbox 확인
  const hitboxes = getCurrentScreenHitboxes();
  for (const hb of hitboxes) {
    if (x >= hb.x && x < hb.x + hb.w &&
        y >= hb.y && y < hb.y + hb.h) {
      handleAction(hb.action);
      break;
    }
  }
});
```

---

## 구현 과정의 결정사항

### 결정 1: gameState 확장 vs 별도 상태 변수
**선택:** gameState 하나로 통일  
**이유:** 상태 간 전환이 명확하고, mainLoop에서 한 곳으로 관리하기 쉬움

### 결정 2: 자동 전환 상태 분리
**선택:** boss-intro / boss-phase2는 자동 전환, 나머지는 버튼 입력 필수  
**이유:** 게임 흐름상 보스 등장은 연출 효과가 필요해서, 고정 시간(2초) 후 자동으로 playing으로 돌아옴

### 결정 3: 무기 선택 데이터 구조
**선택:** 1차 리뷰 FAIL → 2차 수정  
**이유:** 첫 번째는 `ownedWeapons` 배열을 그대로 쓰려 했으나, 게임 시작 시점과 스테이지 클리어 후의 무기 풀이 달라야 함. 스펙에서 "게임 시작 / StageClear 후"라고 했으므로, 각 시점에 동적으로 무기 목록을 pass해야 함.

### 결정 4: event-modal 상태 추가
**선택:** EventToast → EventModal 분리 (2개 상태)  
**이유:** 스펙에서 'event-modal'이 별도 상태로 정의되어 있었는데, 초안에서 놓쳤음. 다시 추가함.

---

## 1차 리뷰 FAIL → 2차 PASS

### FAIL 이유 (2026-04-26 11:00경)
main.js 상태 전환 5곳에서 문제 발견:

1. **event-toast → event-modal 미구현**: 도움 버튼 클릭 후 상태 전환 코드 없음
2. **stat-upgrade → playing 미구현**: 스탯 선택 후 playing으로 안 돌아감
3. **weapon-get → playing 미구현**: 무기 선택 후 playing으로 안 돌아감
4. **stage-clear → weapon-select 미구현**: 다음 스테이지 버튼 미클릭 처리
5. **game-over restart 미구현**: restart 버튼이 game.restart()를 호출 안 함

### 2차 수정 (commit: `6ac8572`)
위 5곳을 main.js에서:
```javascript
// event-toast "도와주기" 클릭
if (action === 'help') {
  gameState = 'event-modal';
}

// stat-upgrade 스탯 선택
if (action === 'select-stat') {
  gameState = 'playing';
}

// weapon-get "장착" 클릭
if (action === 'equip') {
  gameState = 'playing';
}

// stage-clear "다음" 버튼
if (action === 'next-stage') {
  gameState = 'weapon-select';
}

// game-over "restart" 버튼
if (action === 'restart') {
  game.restart();
}
```

---

## 기술적 노트

### WeaponSelect의 키보드 입력
```javascript
// ↑↓ / WASD로 무기 이동
document.addEventListener('keydown', (e) => {
  if (gameState !== 'weapon-select') return;
  if (['ArrowUp', 'w', 'W'].includes(e.key)) {
    uiScreens.weaponSelect.selectPrevious();
  }
  if (['ArrowDown', 's', 'S'].includes(e.key)) {
    uiScreens.weaponSelect.selectNext();
  }
  if (e.key === 'Enter') {
    // 선택 확인
  }
});
```

### BossIntro / BossPhase2의 타이머
```javascript
let bossIntroTimer = 2000; // ms 단위

case 'boss-intro':
  uiScreens.bossIntro.render(ctx);
  bossIntroTimer -= dt * 1000; // dt는 초 단위, ms로 변환
  if (bossIntroTimer <= 0) {
    gameState = 'playing';
  }
  break;
```

### GameOver 화면의 런 통계 수집
```javascript
// gameState → 'game-over' 진입 시
const runStats = {
  elapsedTime: eventSystem.elapsed,
  totalKills: eventSystem.totalKills,
  maxCombo: eventSystem.maxCombo,
  waveReached: Math.floor(eventSystem.elapsedTime / 30) // 30초마다 웨이브 증가
};
uiScreens.gameOver.show(runStats);
```

---

## 남은 미해결 사항 (다음 사이클)

1. **EventModal 화면**: event-toast에서 "도와주기" 선택 후 event-modal 상태 진입, 하지만 아직 화면 구현 미완료 (스펙에는 있는데 9개 목록에 빠짐?)
2. **스탯 업그레이드 적용**: stat-upgrade 상태에서 스탯 선택 후 실제 Player 객체의 스탯이 변경되어야 함 (현재 임시 구현)
3. **무기 획득 로직**: E2 이벤트 완료 시 weapon-get 상태 진입, "장착" 선택 시 ownedWeapons에 추가 (기존 로직과 통합 필요)
4. **스테이지 전환**: stage-clear에서 "다음" 버튼 후 weapon-select로 진입했을 때, 다음 스테이지 난이도 설정 미흡

---

## 사이클 평가

### 잘된 것
- 10개 상태 관리 구조가 명확해서 상태 추가 / 수정이 쉬움
- 각 UI 클래스의 `render() + getHitboxes()` 패턴이 일관되어 유지보수성 높음
- VSCode 테마 기반 색상 팔레트가 게임에 통일감 있는 비주얼 제공
- 1차 리뷰 FAIL → 2차 PASS 과정에서 상태 전환 로직의 중요성 확인

### 어려웠던 것
- 히트박스 좌표 계산 (Canvas vs 화면 좌표 변환)
- 무기 선택 시점의 데이터 흐름 (게임 시작 vs 스테이지 클리어 후 다른 무기 풀)
- event-modal vs event-toast의 경계 정의 (스펙 해석)

### 다음 사이클 관점
- event-modal 화면 구현 후 event-toast 연쇄 처리 테스트
- 각 상태 진입 / 탈출 시 pause/resume 처리 명확화
- 게임 실제 플레이 테스트 (현재는 상태 전환만 검증)

