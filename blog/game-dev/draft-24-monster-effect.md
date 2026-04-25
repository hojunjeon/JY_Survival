# 24편: 몬스터 이펙트 시스템 구현 — 타입별 색상 아이덴티티

**Cycle 3 완료 (2026-04-25 / 22:01-22:03)**

---

## 구현 내용: 몬스터 타입별 색상으로 게임에 생명력 불어넣기

지난 Cycle 2에서는 무기별 이펙트를 구현했다. 그럼 이제 반대쪽을 채울 차례다: 몬스터들도 각자의 색상 아이덴티티를 가져야 한다. 

예제 파일 `examples/monster/_*.html`에서 본 각 몬스터 타입의 디자인(syntax_error는 붉은 빛, null_pointer는 파란 빛, heal_bug는 초록 빛 등)을 실제 게임에 이식하는 작업이다. 히트 스파크가 몬스터 색상으로 터지고, 죽을 때도 그 색상으로 폭발하고, 스프라이트 주변에 글로우도 나타나도록.

### Task 1: ParticleSystem에 색상 맵 추가

먼저 6개 기본 몬스터 타입의 색상을 상수로 정의했다.

```
syntax_error:      '#ff2200' (붉은색)
null_pointer:      '#aabbff' (파란색)
seg_fault:         '#cc6600' (주황색)
heal_bug:          '#22cc44' (초록색)
indentation_error: '#ff8800' (주황색 계열)
env_error:         '#2255cc' (파란색 계열)
```

ParticleSystem.js 최상단에 `ENEMY_TYPE_COLORS` 객체를 export로 추가했다. 그리고 `addEnemyDeath(x, y, count, enemyType)` 메서드에 enemyType 파라미터를 추가해서, 파라미터가 있으면 해당 색상을 사용하고 없으면 기존 기본값(분홍색·회색 계열)으로 fallback하도록 했다.

### Task 2: PixelRenderer에 글로우 메서드 추가

새로운 메서드 `drawSpriteWithGlow(ctx, sprite, x, y, scale, glowColor)`를 추가했다. 기존 drawSprite를 호출하되, 그 전에 canvas context의 shadowBlur와 shadowColor를 설정해서 스프라이트 주변에 빛을 입히는 방식이다.

```js
drawSpriteWithGlow(ctx, sprite, x, y, scale, glowColor) {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = glowColor;
  this.drawSprite(ctx, sprite, x, y, scale);
  ctx.restore();
}
```

간단하지만 효과는 확실하다. 모든 몬스터가 자기 색상으로 빛나기 시작한다.

### Task 3: Enemy 렌더에서 글로우 호출

Entity/Enemy.js의 render() 메서드에서, 스프라이트를 그릴 때 `drawSpriteWithGlow`를 사용하도록 변경했다. glowColor는 ENEMY_TYPE_COLORS[this.type]에서 가져오되, 반투명 효과를 위해 '88' suffix를 붙였다(알파값 16진법 표현).

이때 ENEMY_TYPE_COLORS에 없는 타입(race_condition, memory_leak 같은 상급 타입)은 기존 렌더 방식을 그대로 유지해서 호환성을 보장했다.

### Task 4: main.js의 충돌 및 사망 처리 수정

두 가지 호출부를 수정했다:

**addHitSpark 호출부들**: 피격 시 스파크가 터질 때, 무기 색상 대신 적의 몬스터 타입 색상을 사용하도록 변경했다. 무기 색상이 있으면 그것을 쓸 수도 있지만, 몬스터 색상이 우선이다.

**addEnemyDeath 호출부**: 몬스터 사망 파티클에 enemyType을 전달해서, 사망할 때도 자기 색상으로 폭발하도록 했다.

### Task 5: 테스트 수정

ParticleSystem.test.js에서 addEnemyDeath의 새 시그니처를 적용했다. enemyType이 생략된 기존 호출들도 그대로 작동해야 하고(fallback), syntax_error 같이 타입을 전달하면 해당 색상 파티클이 생성되는지 확인하는 테스트를 추가했다.

---

## 결과

이제 게임을 실행하면:
- 문법 에러는 빨간 스파크를 터뜨리고 빨간 글로우로 빛난다.
- null 포인터는 파란 스파크, 파란 글로우.
- heal_bug는 초록색으로 살아있고, 죽을 때도 초록 폭발이 일어난다.
- 모든 6개 기본 타입이 각자의 색상 아이덴티티를 가진다.

무기 이펙트(Cycle 2)와 몬스터 이펙트(Cycle 3)를 함께 보면, 게임이 한층 더 생생해진다. 빨간 문법 에러가 초록 무기에 맞으면 그 장면이 시각적으로 읽혀진다.

모든 테스트 통과. Phase 10.5의 세 Cycle이 모두 완료됐다.

---

**다음:** Phase 11로 넘어갈 준비
