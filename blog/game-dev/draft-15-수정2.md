# [JY Survival 개발일지 15편] Phase 6 Cycle 1 — 눈에 거슬리는 것들 다 고쳐버리기

> Phase 6는 "완성도 3차 개선"이다. Phase 5까지 기능은 다 붙었는데, 뭔가 계속 눈에 걸리는 게 있었다.

---

## 이번 사이클에서 고친 것들

Phase 5가 끝나고 직접 플레이해봤다. 기능은 다 작동하는데 시각적으로 어색한 부분이 여럿 있었다.

- 이벤트 화면을 열면 글자가 전부 상단에 몰려 있다
- 적을 때릴 때 흰색 플래시가 적 크기를 넘어 번진다
- NPC 스프라이트가 풀바디로 나오는데 너무 크다
- 보스 2페이즈 진입하면 빈 배경에 빨간 직사각형이 덩그러니 뜬다

하나씩 정리했다.

---

## T1: 이벤트 화면 글자 수직 중앙 배치

`EventModal.js`의 `_renderTriggered()`는 `y = by + 36`에서 시작해 항목을 위에서부터 쌓아 내려갔다. 360px 높이 박스 안에 콘텐츠가 상단에 몰리는 구조였다.

수정 방향은 렌더 전에 전체 콘텐츠 높이를 미리 계산하고, startY를 중앙에서 시작하도록 조정하는 것이다.

```js
const totalContentHeight =
  36 + 20 + 60 + 20 +
  (22 * cfg.dialogueLines.length + 8) +
  22 + 22 + 22;
const startY = by + (bh - totalContentHeight) / 2;
let y = startY;
```

이벤트가 열릴 때 글자들이 박스 안에서 가운데 정렬되어 보이게 됐다.

---

## T2: 적 피격 플래시 클리핑

기존 코드는 단순히 `fillRect`로 흰색 오버레이를 덮었다. 적 스프라이트가 16×16 픽셀(scale=2, 실제 32×32)로 렌더되는데, 오버레이는 32×32 박스 전체에 그려지다 보니 투명 픽셀 영역까지 번졌다.

`ctx.clip()`으로 바운딩박스 안으로 제한했다:

```js
ctx.save();
ctx.beginPath();
ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
ctx.clip();
ctx.globalAlpha = 0.6;
ctx.fillStyle = '#ffffff';
ctx.fillRect(...);
ctx.restore();
```

사망 시 빨간 오버레이도 동일하게 처리했다.

---

## T3: NPC 스프라이트 상반신만 표시

이벤트 화면에서 NPC(박진우, 이한정) 스프라이트가 32×32 픽셀 전신(scale=3 → 96×96)으로 표시됐다. 대화창 레이아웃 안에 넣기엔 너무 크고, 하반신(바지, 발)은 사실 안 보여도 된다.

`PixelRenderer`에 `drawSpriteClipped` 메서드를 추가했다:

```js
drawSpriteClipped(ctx, sprite, x, y, scale = 1, rowCount) {
  const rows = rowCount != null ? Math.min(rowCount, sprite.length) : sprite.length;
  // rowCount 번째 행까지만 렌더
}
```

`EventModal`에서는 `drawSprite` 대신 `drawSpriteClipped(ctx, sprite, x, y, 3, 16)` 호출. 32행 중 위 16행만 렌더하니 얼굴+상체만 깔끔하게 나온다.

---

## T4: E3 → E2 개명 + 미션 재설계

기존 E3 이벤트는 "EnvError 처치 + 60초 생존"이었다. 플레이해보니 60초가 너무 길고, 처치 조건이 있으면 env_error 몹이 다 죽어버려서 타이머가 의미 없어진다.

변경 사항:
- E3 → **E2** 개명 (이제 E1, E2 두 개 이벤트)
- 미션: "30초 생존" (처치 조건 제거)
- env_error 스폰: 무한 생성 (`maxSpawn: Infinity`)

`EventSystem.js`, `WaveSystem.js`, `EventModal.js`, `HUD.js`, `main.js` 전체에서 `e3` → `e2` 치환. 테스트 파일도 38개 케이스 전부 업데이트했다.

---

## T5: 보스 2페이즈 빨간 오버레이 버그

가장 눈에 거슬렸던 버그다. 보스가 2페이즈에 진입하면 빨간 색조를 보여줘야 하는데, 기존 코드는 스프라이트 렌더 후 64×64 전체에 `fillRect`를 덮었다.

문제는 BOSS_SPRITE 픽셀이 64×64를 꽉 채우지 않는다는 것이다. 투명 픽셀 영역에도 빨간 사각형이 그대로 노출됐다.

해결책으로 `PixelRenderer.drawSpriteTinted`를 추가했다. 각 픽셀을 그릴 때 원본 색 → tint 색 순서로 덮어서, 실제 픽셀이 있는 곳에만 색조가 입혀진다:

```js
drawSpriteTinted(ctx, sprite, x, y, scale = 1, tintColor, tintAlpha = 0.3) {
  for (each pixel) {
    // 원본 픽셀 그리기
    ctx.fillStyle = color;
    ctx.fillRect(...);
    // tint 오버레이 (같은 픽셀 위에만)
    ctx.globalAlpha = tintAlpha;
    ctx.fillStyle = tintColor;
    ctx.fillRect(...);
    ctx.globalAlpha = 1;
  }
}
```

Boss.render()에서 2페이즈 시 `drawSprite` → `drawSpriteTinted(ctx, BOSS_SPRITE, ..., '#cc0044', 0.3)` 교체. 빈 공간에 빨간 사각형이 뜨는 현상이 사라졌다.

---

## 마치며

이번 사이클은 새 기능을 추가한 게 아니라 기존에 있던 어색함을 제거하는 작업이었다. 코드 규모는 크지 않지만 플레이 경험이 확실히 달라진다. Cycle 2에서는 무기 전면 재설계와 게임 피드백 이펙트를 추가할 예정이다.
