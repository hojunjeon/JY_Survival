# 9편: Phase 3 Cycle 2 — HUD 연결 + 버그 픽셀 아이콘

> **JY Survival 개발일지** | Phase 3 Cycle 2 완료 기록  
> 오늘의 두 가지 작업: 타이머·이벤트 HUD를 게임 화면에 연결하고, 단색 사각형이던 적들에게 개성 있는 픽셀 아트를 입혔다.

---

## 이번 사이클에서 한 것

Phase 3 Cycle 1(수정)을 끝내고 나서 남아있던 두 가지 "추가" 작업을 처리했다.

- **Task 1**: `HUD.js`를 `main.js`에 연결 — 타이머·킬카운트·이벤트 상태가 실제 화면에 표시
- **Task 2**: 버그 6종에 16×16 픽셀 아트 스프라이트 추가 — 더 이상 적이 단색 사각형이 아님

테스트 카운트: **264개 → 268개**, 전부 GREEN.

---

## Task 1: HUD 연결 — 코드는 있었는데 연결이 안 돼 있었다

사실 `ui/HUD.js`는 진작에 완성돼 있었다. HP바, 타이머, 킬카운트, 이벤트 상태까지 전부. 근데 `main.js`에서는 그냥 무시하고 직접 `ctx.fillText(`HP: ${player.hp}`)` 하나만 달랑 찍고 있었다.

실제로 게임을 돌려보면 우상단에 무기명, 좌상단에 HP 숫자 하나. 그게 전부였다. 타이머? 없음. 킬카운트? 없음. 이벤트 진행 상태? 역시 없음.

연결 자체는 단순했다.

```js
// main.js - startGame() 안에
const hud = new HUD({ canvasWidth: canvas.width, canvasHeight: canvas.height });

// render 루프 안에서
hud.render(ctx, {
  playerHp: player.hp,
  playerMaxHp: player.maxHp,
  killCount: eventSystem.totalKills,
  q1Target: 100,
  elapsed: eventSystem.elapsed,
  e1State: eventSystem.e1State,
  e3State: eventSystem.e3State,
  bossState: eventSystem.bossState,
});
```

기존 `ctx.fillText(...)` 덩어리를 지우고 이걸로 교체. 무기명 표시만 HUD에 포함이 안 돼 있어서 별도로 유지했다 (y 위치도 56으로 내려서 HUD와 겹치지 않게).

TDD로 먼저 실패 테스트 2개 작성:
- `EventSystem.elapsed=65.5s → HUD 타이머에 "1:05" 표시`
- `EventSystem.e1State=active → HUD에 [E1] 이벤트 상태 표시`

테스트가 FAIL → 코드 연결 → 264개 전부 GREEN. 깔끔했다.

---

## Task 2: 버그 픽셀 아이콘 — 적들이 드디어 얼굴을 가졌다

MVP 단계에서 적들은 타입별 색깔만 다른 사각형이었다. SyntaxError는 빨간 사각형, HealBug는 초록 사각형. 그게 전부. 처치하는 맛이 없었다.

이번에 16×16 픽셀 아트를 직접 그렸다. 렌더 시 scale=2로 찍으면 화면에서 32×32 크기가 된다.

각 타입별 컨셉:

| 타입 | 시각적 컨셉 |
|------|-------------|
| `syntax_error` | 빨간 타원 + 흰색 느낌표 |
| `null_pointer` | 반투명 유령 (물결 밑단) |
| `seg_fault` | 갈색 육각형 + 균열선 |
| `heal_bug` | 녹색 하트 |
| `indentation_error` | 주황 배경 + 들여쓰기 막대 4단계 |
| `env_error` | 파란 배경 + 노란 경고 삼각형 |

코드는 `sprites/PixelRenderer.js`에 `BUG_SPRITES` 맵으로 추가했다. 각 스프라이트는 `null`(투명)과 hex 색상값으로 이루어진 16×16 배열.

```js
export const PixelRenderer = {
  PLAYER_SPRITE,
  BUG_SPRITES: {
    syntax_error:      SYNTAX_ERROR_SPRITE,
    null_pointer:      NULL_POINTER_SPRITE,
    seg_fault:         SEG_FAULT_SPRITE,
    heal_bug:          HEAL_BUG_SPRITE,
    indentation_error: INDENTATION_ERROR_SPRITE,
    env_error:         ENV_ERROR_SPRITE,
  },
  drawSprite(ctx, sprite, x, y, scale = 1) { ... },
  drawPlayer(ctx, x, y, scale = 1) { ... },
};
```

`Enemy.render(ctx)`는 이렇게 바뀌었다:

```js
render(ctx) {
  const sprite = PixelRenderer.BUG_SPRITES[this.type];
  if (sprite) {
    PixelRenderer.drawSprite(ctx, sprite, this.x - this.width / 2, this.y - this.height / 2, 2);
    return;
  }
  // 폴백: 단색 사각형 (알 수 없는 타입)
  ctx.fillStyle = colors[this.type] || colors.enemy;
  ctx.fillRect(...);
}
```

알려진 타입이면 스프라이트 렌더, 모르는 타입이면 사각형 폴백. 이 분기를 테스트로 검증했다:

- `vi.spyOn(PixelRenderer, 'drawSprite')` 로 스파이를 걸고
- 알려진 타입 → `drawSprite` 호출 / `fillRect` 미호출 확인
- 알 수 없는 타입 → `fillRect` 호출 / `drawSprite` 미호출 확인

---

## 느낀 것

**픽셀 아트는 코드다.** 16×16 배열을 손으로 직접 짜면서 "이게 맞나?" 싶었는데, 배열이 테스트를 통과하는 순간 확신이 생겼다. 시각적으로 어떻게 보이느냐는 별개지만, 최소한 크기는 맞다는 것.

**HUD 연결의 교훈**: 컴포넌트를 아무리 잘 만들어도 연결 안 하면 존재하지 않는 것과 같다. `HUD.js`가 Cycle 6부터 있었는데 Phase 3까지 방치됐다. 다음엔 컴포넌트 만드는 시점에 연결까지 같이 하는 게 나을 것 같다.

---

## 결과

- Phase 3 Cycle 2 완료
- 누적 테스트: **268개 GREEN**
- 커밋: `65caf38` (HUD 연결), `f02ec07` (버그 스프라이트)
- 다음: Phase 3 마무리 또는 추가 개선 여부 결정

---

*이 글은 개발 당일 로그와 커밋을 기반으로 작성된 초안입니다. 퇴고 후 Velog 발행 예정.*
