# 11편 — Phase 4 수정: 플레이가 되는 게임 만들기

> Phase 4 Cycle 1 (수정) 개발일지. 2026-04-16.

---

## 피드백을 받고 나서

Phase 3가 끝났다고 생각했는데 플레이 피드백을 받고 보니 게임이 제대로 동작하지 않는 버그가 4개나 있었다. "버그가 4개"라고 하면 적어 보이지만, 이 4개가 전부 핵심 게임플레이에 관련된 것들이었다. 공격이 안 되고, 이벤트가 안 되고, 죽어도 아무 반응이 없고, 진행 상황도 안 보인다면 사실상 게임이 아니다.

오늘은 코드를 열기 전에 AI가 먼저 4개 버그의 원인을 분석하게 했다. 분석 결과가 나왔을 때 솔직히 놀랐다. "아 이런 구조적 문제가 있었구나" 하는 지점들이 있었다.

---

## 버그 1: 맵 절반만 나가면 총알이 사라진다

### 현상

플레이어가 월드 중앙(1000, 1000) 쪽으로 이동하면 무기를 쏘자마자 투사체가 바로 사라진다. 맵 왼쪽 상단에선 잘 되는데 오른쪽이나 아래쪽으로 가면 안 된다.

### 원인

`Projectile.update(dt, canvas)`에서 투사체의 범위 이탈 여부를 `canvas.width`(800px)와 `canvas.height`(600px)로 체크하고 있었다. 그런데 게임 월드는 2000×2000이고, 투사체는 월드 좌표로 움직인다. 플레이어가 x=1500 위치에 있으면 투사체도 x=1500에서 시작하는데, `1500 > 800 + margin` 조건이 바로 참이 되어 생성과 동시에 비활성화된다.

```js
// 수정 전: canvas.width(800)으로 체크 → 월드 오른쪽 반이 데드존
if (this.x > canvas.width + margin) this.active = false;

// 수정 후: worldBounds.width(2000)으로 체크
if (this.x > bounds.width + margin) this.active = false;
```

Phase 2 때 카메라 시스템을 추가하면서 월드 좌표계를 도입했는데, Projectile의 범위 체크는 거기 맞춰 업데이트가 안 됐다. 전형적인 리팩토링 후유증이다.

---

## 버그 2: 이벤트 알림은 뜨는데 실제로 아무 일도 안 생긴다

### 현상

30초가 되면 "들여쓰기 지옥" 이벤트 알림이 뜬다. Space를 누르면 닫힌다. 그런데 이후에도 평소와 같은 적들만 계속 나온다. IndentationError 버그를 잡아야 하는데 IndentationError가 등장하지 않는다.

### 원인

두 가지 문제가 겹쳐 있었다.

**문제 A**: E1 트리거 시 WaveSystem이 `indentation_error` 타입 적을 스폰하도록 연결하는 코드가 없었다. `EventSystem`은 트리거 알림을 발행하는데, `main.js`는 그 알림을 받아 모달만 띄우고 WaveSystem에는 아무것도 전달하지 않았다.

**문제 B**: `notifyKill()` 반환값을 완전히 무시하고 있었다.

```js
// 수정 전: 반환값 버림
eventSystem.notifyKill(e.type);

// 수정 후: 반환값 처리
const killNotifs = eventSystem.notifyKill(e.type);
for (const n of killNotifs) {
  if (n.type === 'event_cleared') {
    eventModal.show('cleared', n.event);
    paused = true;
    waveSystem.clearEventEnemyType();
  }
}
```

### 수정

`WaveSystem`에 `setEventEnemyType(type)` / `clearEventEnemyType()` 메서드를 추가했다. 이 상태에서 웨이브가 스폰될 때 `eventEnemyType`이 세팅되어 있으면 그 타입만 스폰한다.

이벤트 트리거 시 `waveSystem.setEventEnemyType('indentation_error')`, 이벤트 클리어 시 `waveSystem.clearEventEnemyType()`을 호출하는 흐름으로 연결했다.

---

## 버그 3: 죽으면 그냥 멈춘다

### 현상

HP가 0이 되면 화면이 굳는다. 게임 오버 화면은 나오는데 그 다음이 없다. "새로고침으로 다시 시작"이라는 텍스트가 있었는데, 게임하다가 죽을 때마다 브라우저 새로고침을 해야 한다는 건 게임이라고 하기 어렵다.

### 수정

`handleGameKey`에 게임 오버 상태에서 R키를 감지하는 분기를 추가했다.

```js
if ((e.key === 'r' || e.key === 'R') && state === 'game_over') {
  window.removeEventListener('keydown', handleGameKey);
  startGame();
}
```

`startGame()`은 이미 새 게임 인스턴스를 초기화하는 함수다. 기존 리스너를 제거하고 다시 호출하면 깔끔하게 재시작된다. 텍스트도 "R키로 재시작"으로 변경했다.

Phase 3 Cycle 1에서 게임 오버 화면 자체는 만들었는데, 재시작 흐름을 빠뜨렸던 것이다.

---

## 버그 4: 이벤트가 뭔지 모르겠다

### 현상

오른쪽 상단 HUD에 `[E1] 들여쓰기 지옥 진행 중`이라고만 표시된다. 뭘 얼마나 해야 클리어되는지 알 수 없다.

### 수정

`EventSystem`에 이미 `e1Kills`, `e3Kills`, `e3Elapsed` 값이 추적되고 있었다. 이 값들을 HUD에 전달하지 않고 있었을 뿐이다.

```js
// HUD 표시 수정
`[E1] 들여쓰기 지옥 : IndentationError 처치 (${e1Kills}/15)`
`[E3] 파이참 위기 : EnvError 처치 (${e3Kills}/1) | 생존 ${Math.floor(e3Elapsed)}/60초`
```

데이터는 있는데 화면에 안 꺼낸 경우였다.

---

## AI 분석 프로세스에 대해

이번 사이클에서 처음으로 버그 분석을 서브에이전트에 완전히 위임해봤다. 결과물이 꽤 정확했다. 파일명과 라인 번호, 원인 요약, 수정 방향까지 나왔다.

흥미로웠던 건 분석 단계에서 버그가 단독으로 발생한 게 아니라 여러 계층에 걸친 연결 누락이었다는 점이다. Projectile은 카메라 도입 후 좌표계 업데이트가 안 됐고, 이벤트 시스템은 설계는 완성됐지만 main.js와의 연결이 반쪽짜리였고, 게임 오버는 화면 구현만 있고 인터랙션이 없었다.

Superpowers + GSD + Gstack 사이클대로 하면 이런 연결 누락은 코드 리뷰 단계에서 잡혀야 했는데, Phase 3에서 속도를 내면서 QA 밀도가 낮아진 것 같다. Phase 4 추가 사이클에서는 gstack QA를 더 꼼꼼히 돌릴 것이다.

---

## 결과

- 테스트: 268개 모두 GREEN (신규 추가 없음, 기존 테스트 통과 확인)
- 수정된 파일: `Projectile.js`, `WaveSystem.js`, `main.js`, `HUD.js`

다음은 Phase 4 Cycle 2 — 게임 시작 화면 개선 + 이벤트 연출 강화.
