# 17편 — 유저 피드백 100판의 무게: Phase 7 수정

> Phase 7 Cycle 1 수정 사이클 개발일지

---

## 이번 편 게임 상태

Phase 6까지 마치고 나서 게임이 꽤 그럴싸해졌다. 8종 무기, 픽셀 스프라이트 NPC, 화면 흔들림, 플로팅 텍스트까지. 그런데 "100판 돌린 썩은물 유저"라는 제목의 피드백이 날아왔다.

---

## 그날 상황

피드백을 읽다가 멈췄다.

> "게임 오버 당하고 R키 눌러서 재시작하면 예전 판에서 죽었던 위치에 플레이어 이미지가 그대로 유령처럼 남아있습니다"

분명 Phase 5에서 재시작 잔상 수정했다고 체크박스에 `[x]` 쳐뒀는데. 직접 플레이해보니 잔상이 여전히 있었다.

그리고 두 번째 버그:

> "몬스터 피격 시 사각형으로 하얗게 반짝이는 거 너무 거슬립니다"

Phase 6 T2에서 "클리핑" 수정했다고 했지만, 코드를 다시 들여다보니 `ctx.clip()`으로 사각형 클리핑 영역을 만들고 그 위에 `fillRect`로 흰색을 채우는 방식이었다. 스프라이트의 투명 픽셀 영역까지 전부 하얗게 되는 건 당연한 결과였다.

---

## 버그 1 — 재시작 잔상 (진짜 원인)

Phase 5에서 수정했다고 생각했던 이유를 추적해봤다. 당시 `gameOverLoop()`에서 `ctx.clearRect`를 올바른 타이밍에 호출하도록 고쳤는데, 그게 화면 표시 문제는 해결했지만 **엔티티 배열**은 전혀 건드리지 않았다.

`Game.js`의 `stop()` 메서드:

```js
stop() {
  this.running = false;
  if (this._rafId !== null) {
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }
}
```

루프만 멈출 뿐 `this.entities = []` 같은 초기화가 없다. `startGame()`이 다시 호출되면 `game.addEntity(player)`로 새 플레이어를 추가하지만, 이전 판의 플레이어·적·투사체가 배열에 그대로 남아있다. 게임 루프가 재시작되면 그 전부를 렌더링한다.

수정은 단순했다:

```js
// core/Game.js
clearEntities() {
  this.entities = [];
}
```

```js
// main.js
function startGame() {
  game.clearEntities(); // ← 이게 빠져 있었다
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state = 'playing';
  // ...
}
```

TDD로 먼저 테스트를 쓰고 구현했다. 테스트는 한 줄짜리지만, 이게 있었다면 Phase 5 때 잡혔을 버그다.

---

## 버그 2 — 피격 이펙트 사각형

`PixelRenderer`에 이미 `drawSpriteTinted` 메서드가 있었다. 스프라이트를 픽셀 단위로 순회하면서 `null`(투명)은 건너뛰고, 색깔 있는 픽셀에만 원본 색 + 흰색 오버레이를 순서대로 칠하는 방식이다.

```js
drawSpriteTinted(ctx, sprite, x, y, scale, tintColor, tintAlpha) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (color === null) continue; // 투명 픽셀 스킵
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      ctx.globalAlpha = tintAlpha;
      ctx.fillStyle = tintColor;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
```

이미 Phase 6 T5(보스 2페이즈 붉은 오버레이)에서 쓰던 메서드인데, 피격 플래시에는 적용을 안 했다. 수정 전 코드와 비교:

**수정 전 (Enemy.js):**
```js
if (this.hitFlashTimer > 0) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(this.x - 16, this.y - 16, 32, 32); // ← 사각형 클리핑
  ctx.clip();
  ctx.fillRect(this.x - 16, this.y - 16, 32, 32); // ← 사각형 채우기
  ctx.restore();
}
```

**수정 후 (Enemy.js):**
```js
if (this.hitFlashTimer > 0) {
  const sprite = PixelRenderer.BUG_SPRITES[this.type];
  if (sprite) {
    PixelRenderer.drawSpriteTinted(ctx, sprite, this.x - 16, this.y - 16, 2, '#ffffff', 0.7);
  } else {
    // 스프라이트 없는 폴백: 기존 사각형 유지
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
    ctx.restore();
  }
}
```

Boss도 동일한 방식으로 교체. 보스는 기존에 클리핑조차 없었으니 더 심각했다.

---

## 결과

- 재시작 시 잔상 없음
- 몬스터 피격 시 스프라이트 모양으로만 반짝임
- 보스 피격 시 보스 스프라이트 모양으로만 반짝임
- 테스트 308 → 309개 (clearEntities 테스트 1개 추가)

---

## 회고

"이미 고쳤다"고 체크한 버그가 실제로는 안 고쳐진 채로 Phase를 넘어갔다. Phase 5 때 진짜 원인(엔티티 배열 초기화)이 아닌 증상(화면 깜빡임)만 고쳤던 것.

유저가 100판 돌리지 않았으면 아마도 그냥 넘어갔을 버그다.

피격 이펙트는 "수정했다"고 커밋 로그에 남아있지만, 당시 수정이 반만 된 수정이었다는 것도 이번에 알았다. `drawSpriteTinted`라는 도구는 이미 있었는데 쓸 생각을 안 했다.
