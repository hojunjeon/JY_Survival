# [RJ Revolution #3] 버그들이 몰려온다 — 적 시스템 TDD 구현기

> **시리즈**: Superpowers + GSD + Gstack으로 게임 만들기  
> **이번 사이클**: Cycle 2 — 적 시스템 (Enemy / WaveSystem / Collision)  
> **테스트 결과**: 64개 GREEN (Cycle 1 누적 34 + Cycle 2 신규 30)

---

## 오늘 만든 것

Cycle 1에서 김지윤(플레이어)이 맵을 돌아다니는 것까지 만들었다면, Cycle 2에서는 그 김지윤을 괴롭히는 **버그 적들**을 만들었다.

구현한 것들:
- `entities/Enemy.js` — 4종 적 + 팩토리 함수
- `core/Collision.js` — AABB 충돌 감지
- `systems/WaveSystem.js` — 시간 기반 웨이브 스폰
- `main.js` — 전체 통합 (충돌 처리 + HP 아이템 드롭)

---

## 적 설계: 버그 캐릭터화

SSAFY 수강생이라면 누구나 만나봤을 오류들을 적으로 만들었다.

| 이름 | HP | 속도 | 접촉 데미지 | 특이사항 |
|------|----|------|------------|---------|
| SyntaxError | 40 | 80 | 10 | 평범한 잡몹 |
| NullPointer | 20 | 140 | 5 | 빠르고 약함 |
| SegFault | 100 | 40 | 25 | 느리고 강함 |
| HealBug | 15 | 150 | 0 | 도망침, 잡으면 HP 회복 아이템 드롭 |

`HealBug`가 처음 설계에서 재미있었던 부분이다. 보통 서바이벌 게임에서 HP 아이템이 맵에 고정 배치되는데, 여기서는 **회복 버그를 잡아야 회복된다**는 구조로 바꿨다. "버그를 잡아서 HP를 회복한다"는 게임적 재미가 SSAFY 개발 경험과도 딱 맞아떨어진다고 생각했다.

```js
const ENEMY_STATS = {
  syntax_error:  { hp: 40,  speed: 80,  contactDamage: 10, flees: false, dropsHpItem: false },
  null_pointer:  { hp: 20,  speed: 140, contactDamage: 5,  flees: false, dropsHpItem: false },
  seg_fault:     { hp: 100, speed: 40,  contactDamage: 25, flees: false, dropsHpItem: false },
  heal_bug:      { hp: 15,  speed: 150, contactDamage: 0,  flees: true,  dropsHpItem: true  },
};
```

`flees: true`면 플레이어 반대 방향으로 이동한다. 같은 `update()` 로직에서 부호 하나로 처리했다.

---

## TDD 순서: 테스트 먼저, 코드 나중

이번에도 Cycle 1과 같은 패턴으로 진행했다. dev-log를 보면 순서가 남아 있다:

```
17:29:54 | Write | tests/Enemy.test.js
17:30:03 | Write | tests/WaveSystem.test.js
17:30:11 | Write | tests/Collision.test.js
17:30:30 | Write | entities/Enemy.js
17:30:35 | Write | core/Collision.js
17:30:41 | Write | systems/WaveSystem.js
17:31:09 | Write | main.js
```

테스트 3개 파일 먼저 작성하고, 구현 3개 파일로 통과시키고, 마지막에 통합했다. 총 소요 시간은 약 1분 30초 — AI가 TDD를 따른다는 것 자체가 이미 놀랍다.

---

## Collision.js: AABB는 충분했다

충돌 감지를 어떻게 할지 잠깐 고민했다. 원형 충돌(Circle collision)이 더 자연스러울 수 있지만, 32×32 픽셀 아트 캐릭터에는 **AABB(축 정렬 바운딩 박스)**가 충분하다고 판단했다.

```js
export function checkCollision(a, b) {
  const aLeft   = a.x - a.width  / 2;
  const aRight  = a.x + a.width  / 2;
  // ...
  return aRight > bLeft && aLeft < bRight && aBottom > bTop && aTop < bBottom;
}
```

`x, y`를 중심 좌표로 통일했기 때문에 코드가 깔끔하다. Cycle 1에서 Player를 중심 좌표 기반으로 설계한 결정이 여기서 빛났다.

---

## WaveSystem: 엣지 스폰의 위협감

화면 4방향 가장자리에서 랜덤하게 적이 튀어나오는 구조다. 3초마다 3마리씩 스폰된다.

```js
_edgePosition() {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: return { x: 0,     y: Math.random() * h }; // 왼쪽
    case 1: return { x: w,     y: Math.random() * h }; // 오른쪽
    case 2: return { x: Math.random() * w, y: 0 };     // 위
    case 3: return { x: Math.random() * w, y: h };     // 아래
  }
}
```

테스트에서 재미있는 부분이 있었다. WaveSystem의 랜덤 스폰을 어떻게 검증할까? 정확한 위치는 랜덤이니 검증이 불가능하다. 대신 **스폰된 적이 캔버스 경계 위에 있는지**를 검증했다:

```js
it('스폰된 적은 캔버스 경계 위에 위치한다', () => {
  const enemies = wave.update(3);
  for (const e of enemies) {
    const onEdge = e.x === 0 || e.x === 400 || e.y === 0 || e.y === 300;
    expect(onEdge).toBe(true);
  }
});
```

"랜덤이라서 테스트 못한다"가 아니라 **검증 가능한 불변 조건**을 찾아내는 것이 TDD의 묘미다.

---

## main.js 통합: 생각보다 복잡한 충돌 처리

충돌이 감지되면 플레이어가 데미지를 받는 것까지는 간단했다. 문제는 **충돌 반복**이었다.

적이 플레이어와 겹쳐 있으면 매 프레임마다 데미지가 들어간다. 60fps라면 1초에 60번. 이건 의도하지 않은 동작이다.

해결 방법으로 충돌 시 적을 16px 밀어내는 방식을 택했다:

```js
if (checkCollision(player, enemy)) {
  player.takeDamage(enemy.contactDamage);
  const dx = enemy.x - player.x;
  const dy = enemy.y - player.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  enemy.x += (dx / len) * 16;
  enemy.y += (dy / len) * 16;
}
```

완벽한 해결은 아니다. 적이 충분히 빠르면 다음 프레임에 다시 겹칠 수 있다. 하지만 Cycle 2 수준에서는 충분하다고 판단했다. 무기 시스템(Cycle 3)이 들어오면 적이 죽는 속도가 빨라져서 이 문제는 자연스럽게 희석된다.

---

## 테스트 결과

```
✓ tests/Enemy.test.js        (17 tests)
✓ tests/Player.test.js       (12 tests)
✓ tests/Input.test.js        (7 tests)
✓ tests/Collision.test.js    (5 tests)
✓ tests/WaveSystem.test.js   (8 tests)
✓ tests/Game.test.js         (7 tests)
✓ tests/Canvas.test.js       (4 tests)
✓ tests/PixelRenderer.test.js (4 tests)

Test Files: 8 passed
Tests:      64 passed
```

누적 64개. Cycle 1의 34개에서 30개가 늘었다.

---

## 다음은 Cycle 3: 무기 시스템

지금 김지윤은 아무 무기도 없이 적한테 맞고만 있다. Cycle 3에서는 드디어 반격한다.

- Python 언어(뱀) 무기, C 언어(포인터) 무기, Java 언어(무거운 객체) 무기
- 투사체(Projectile) 시스템
- 무기 선택 UI

SSAFY 언어별 특성을 무기 특성으로 표현하는 게 이번 시리즈에서 가장 재미있는 부분이 될 것 같다.

---

*이 시리즈는 Superpowers + GSD + Gstack 워크플로우를 실제 프로젝트에 적용하며 기록하는 개발일지입니다.*
