# 8편 — MVP를 플레이해봤더니: Phase 3 Cycle 1 수정 작업기

> 시리즈: 김지윤의 디버그 서바이벌 개발일지
> 키워드: Phase 3, 버그 수정, 카메라, TDD, Superpowers

---

## "만들었는데 재미가 없다"

Phase 2에서 MVP를 완성했다. 보스전까지 있고, 테스트도 249개 GREEN이고, 코드 구조도 나름 깔끔했다.

그런데 직접 플레이해보니 문제가 한 가득이었다.

적에게 닿으면 데미지가 프레임마다 들어와서 순식간에 죽는다. 죽어도 화면이 그냥 멈춘다. E1 이벤트가 발생해도 아무 알림도 없다. 플레이어가 맵 경계를 넘어가도 카메라가 멍청하게 고정되어 있다.

기능은 다 있었다. 연결이 안 되어 있었던 것이다.

Phase 3 Cycle 1의 목표는 이 5가지를 고치는 것이었다.

---

## 무엇을 고쳤나

### 1. 접촉 데미지 쿨다운 (0.5초 무적)

가장 급했던 것. 적에 닿으면 매 프레임 데미지가 들어오던 문제.

`Player`에 `contactInvulTimer`를 추가하고 `takeDamageFromContact()` 메서드를 만들었다. 쿨다운이 0보다 크면 데미지를 무시하고, 한 번 맞으면 0.5초 타이머가 시작된다.

```js
takeDamageFromContact(amount) {
  if (this.contactInvulTimer > 0) return;
  this.takeDamage(amount);
  this.contactInvulTimer = 0.5;
}
```

`main.js`에서 `player.takeDamage(enemy.contactDamage)`를 `player.takeDamageFromContact(enemy.contactDamage)`로 한 줄 바꿨다. 그 한 줄 차이가 게임을 플레이 가능하게 만들었다.

### 2. 피격 효과

맞았는지 안 맞았는지 피드백이 전혀 없었다.

- **적 피격**: `Enemy`에 `hitFlashTimer` 추가. `takeDamage()` 호출 시 0.1초 동안 흰색으로 렌더링.
- **플레이어 피격**: 화면 가장자리에 붉은 비네팅 효과. `hitFlashTimer > 0`일 때 radial gradient로 오버레이.

흰색 플래시는 단 한 줄이다.

```js
ctx.fillStyle = this.hitFlashTimer > 0 ? '#ffffff' : (colors[this.type] || colors.enemy);
```

### 3. 게임 오버 화면

HP가 0이 되면 게임이 그냥 멈췄다. 이제는 "김지윤이 쓰러졌다..." 메시지와 함께 GAME OVER 화면이 뜬다.

`game.update` 맨 앞에 감지 코드를 넣었다.

```js
if (player.isDead) {
  state = 'game_over';
  game.stop();
  renderGameOver();
  return;
}
```

### 4. EventModal — 이벤트 UI 연결

E1 이벤트(IndentationError 15마리 처치)가 달성돼도 아무 알림이 없었다. `EventSystem`이 노티피케이션을 발행하고 있었지만 UI가 없었던 것.

`ui/EventModal.js`를 새로 만들고 `main.js`에 연결했다. 이벤트 발생/클리어 시 모달이 뜨고 게임이 일시정지된다. Space를 누르면 재개.

`EventSystem`의 노티피케이션 타입인 `event_triggered`와 `event_cleared`를 처리하도록 수정했다.

```js
if (n.type === 'event_triggered') {
  eventModal.show('triggered', n.event);
  paused = true;
}
```

이 작업을 하면서 `EventSystem`이 사실 이미 완성된 상태였다는 걸 알았다. 연결만 안 됐던 것.

### 5. 배경 및 카메라

가장 덩치가 큰 작업이었다. 기존 `game.render`는 Canvas 엔진의 기본 렌더에 HUD를 덧씌우는 구조였다. 이걸 월드 공간과 화면 공간으로 분리했다.

- 월드 크기: 2000×2000
- 카메라: 플레이어를 중심으로 추적, 월드 경계에서 클램핑
- 그리드 배경: 64px 간격, 반투명 선 (스크롤 시 이동감 표현)
- HUD는 `ctx.save/restore` 이후 화면 좌표에 고정

```js
const camX = Math.max(0, Math.min(WORLD_W - canvas.width, player.x - canvas.width / 2));
ctx.save();
ctx.translate(-camX, -camY);
// 월드 엔티티 렌더
ctx.restore();
// HUD 렌더
```

---

## Superpowers → GSD → 코딩 흐름

이번 Cycle도 같은 흐름이었다.

1. **Phase 3 설계(Superpowers 브레인스토밍)**: 어제 세션에서 플레이테스트 피드백을 정리하고 스펙 문서를 작성했다. (`docs/superpowers/specs/2026-04-15-phase3-improvement-design.md`)
2. **GSD 태스크 분할**: 6개 태스크로 쪼갰다. 순서 의존성도 명시했다. (Task 6이 render를 완전 재정의하므로 마지막에)
3. **TDD 코딩**: 테스트 먼저 작성 → FAIL 확인 → 구현 → PASS 순서. 각 태스크마다 커밋.

Task 6이 끝나면서 Task 3(게임 오버)과 Task 5(EventModal)에서 따로 넣었던 코드들이 자연스럽게 통합됐다. 계획 단계에서 이미 이 순서를 설계해뒀기 때문에 충돌 없이 진행됐다.

---

## 테스트 결과

| 단계 | 누적 테스트 |
|------|------------|
| Task 1 완료 | 253개 GREEN |
| Task 2 완료 | 256개 GREEN |
| Task 4 완료 | 262개 GREEN |
| Cycle 1 최종 | **262개 GREEN** |

Task 3·5·6은 `main.js` 수정이라 단위 테스트 추가가 없었다. 브라우저 동작 확인으로 대체.

---

## 다음은

Phase 3 Cycle 2 — 추가 작업이 남아 있다.

- 타이머 HUD 연결 (`HUD.js` → `main.js`)
- 버그 픽셀 아이콘 6종 추가 (`PixelRenderer.js`)

이쪽은 수정이 아니라 말 그대로 추가다. 있으면 좋은데 없었던 것들.
