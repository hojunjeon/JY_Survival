# 4편 — 무기 시스템 구현기: 세 언어, 세 가지 전투 철학

> Cycle 3 완료 | 누적 테스트 122개 GREEN

---

## 이번 사이클에서 만든 것

Cycle 2에서 적이 생겼다. 근데 김지윤한테 무기가 없었다. 적이 달려오는데 그냥 맞고 있는 상황이었다. 이번 Cycle 3는 그걸 고치는 사이클이다.

만든 것:
- `WeaponBase` — 모든 무기의 공통 인터페이스
- `Projectile` — 투사체 엔티티
- Python / C / Java 무기 3종
- `WeaponMenu` — 게임 시작 전 무기 선택 화면
- 투사체 ↔ 적 충돌 통합

---

## 설계 결정: 무기마다 "다른 방식"을 어떻게 추상화할까

처음엔 단순하게 생각했다. 무기 = 투사체를 쏘는 것. 그러면 `fire()`만 있으면 되지 않나?

근데 Java를 설계하다 막혔다. Java 무기는 투사체를 쏘지 않는다. **오비탈 오브**다. 플레이어 주변을 빙글빙글 도는 물체가 적에게 닿으면 데미지를 준다. `fire()`로 뭘 반환해야 하지?

두 가지 선택지가 있었다:

**A안**: 오비탈도 Projectile로 만들고, active 유지하면서 계속 플레이어 위치를 따라다니게 함  
**B안**: Java는 아예 다른 방식. `fire()`는 빈 배열 반환, 대신 `getOrbPositions(px, py)`로 좌표 조회

B안으로 갔다. A안은 Projectile이 플레이어 위치를 참조해야 해서 의존성이 생기고, 투사체의 "발사 후 독립" 원칙이 깨진다.

그래서 WeaponBase는 이렇게 됐다:

```js
fire(x, y, dirX, dirY) {
  if (!this.canFire()) return [];
  this._timer = this.cooldown;
  return this._createProjectiles(x, y, dirX, dirY);
}
```

JavaWeapon은 `canFire()`가 항상 false, `fire()`는 항상 `[]`. 오비탈은 별도로 Game 루프에서 처리한다.

---

## TDD 순서: 테스트 먼저 58개, 그 다음 구현

이번 사이클도 Superpowers TDD 스킬을 따랐다. 파일 하나도 만들기 전에 테스트 5개 파일을 먼저 작성했다.

```
tests/WeaponBase.test.js     — 9개
tests/Projectile.test.js     — 13개
tests/Weapons.test.js        — 23개
tests/ProjectileCollision.test.js — 7개
tests/Menu.test.js           — 6개
```

처음 실행 결과:
```
Test Files  5 failed (5)
Tests       no tests
```

파일이 없어서 전부 실패. 예상한 실패다. 이게 TDD의 "RED"다. 파일 없어서 에러난 거지, 로직이 틀린 게 아니라는 걸 알고 있다.

구현 완료 후:
```
Tests  58 passed (58)
```

---

## 코드 리뷰에서 발견한 것

Gstack 코드 리뷰에서 두 가지 이슈를 잡았다.

### 1. C 무기가 어디를 향해 쏘나?

C 무기는 "전방 단일 관통탄"이다. 근데 이 게임은 WASD 이동이고 마우스 조준이 없다. `fire(x, y, dirX, dirY)`에 뭘 넘겨야 하나?

해결: `Player`에 `lastDirX`, `lastDirY`를 추가했다. 마지막으로 이동한 방향을 기억해두고, C 무기는 그 방향으로 발사한다. 정지해 있으면 직전 방향을 유지한다.

```js
// Player.update()에 추가
if (this.vx !== 0 || this.vy !== 0) {
  const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  this.lastDirX = this.vx / len;
  this.lastDirY = this.vy / len;
}
```

초기값은 오른쪽 `(1, 0)`. 게임 시작 직후 정지 상태면 오른쪽으로 쏜다. 허용 가능한 UX다.

### 2. Java 오브가 같은 적을 1프레임에 3번 때린다

3개 오브가 동시에 같은 적에 겹치면 같은 프레임에 3회 데미지가 들어간다. 이건 버그다.

해결: 오브마다 `hitCooldowns: Map<enemyId, 남은시간>`을 두고, `tryHit(orbIdx, enemy)`로 공격 가능 여부를 확인한다. 한 번 때리면 0.5초 동안 그 적을 다시 못 때린다.

```js
tryHit(orbIndex, enemyId) {
  const orb = this.orbs[orbIndex];
  if (orb.hitCooldowns.has(enemyId)) return false;
  orb.hitCooldowns.set(enemyId, 0.5);
  return true;
}
```

테스트가 없는 수정이었다. 리뷰에서 나온 게임 통합 이슈라 테스트를 나중에 추가할 수 있지만, 지금은 Game 루프에서 `tryHit`을 호출하는 방식으로 반영했다.

---

## 무기 선택 화면

게임 시작 전에 무기를 고르는 화면이 필요하다. `WeaponMenu` 클래스는 순수 로직만 담당한다:

```js
getOptions() // → [{name, description}, ...]
select(index) // → WeaponInstance | null
```

렌더링은 `main.js`에서 Canvas API로 직접 그렸다. 1, 2, 3 키로 선택.

별도 UI 프레임워크 없이 canvas에 텍스트 그리는 방식이다. 단순하지만 게임 컨셉에 맞다.

---

## 통합 결과

```
무기 선택 화면 (1/2/3 키)
  ↓
[Python] 2초마다 8방향 동시 발사
[C/C++] 0.25초마다 전방 관통탄
[Java]  3개 오브가 플레이어 주변 자동 회전
  ↓
투사체 → 적 충돌 → 데미지
오비탈 → 적 접촉 → 데미지 (0.5초 무적)
```

HUD에 HP와 현재 무기명이 표시된다.

---

## 누적 테스트 현황

| 사이클 | 테스트 수 |
|--------|----------|
| Cycle 1 완료 | 34개 |
| Cycle 2 완료 | 64개 |
| **Cycle 3 완료** | **122개** |

---

## 다음 사이클

Cycle 4 — 이벤트 시스템.

- `EventSystem.js`
- E1: IndentationError 웨이브 이벤트
- E3: EnvError + 60초 생존 이벤트
- Q1: 버그 100마리 퀘스트

이벤트는 게임을 일시정지하고 화면 전환을 한다. 지금까지 만든 것 중 가장 복잡한 UI 로직이 될 것 같다.
