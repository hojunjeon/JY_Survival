# 23편 — 게임이 살아있는 느낌: 파티클, 히트플래시, 데미지 숫자

> Phase 10 추가 사이클 | ParticleSystem 신규, hitFlash 구현, Screen Shake 전면 적용, 무기별 데미지 텍스트

---

## 이 시점의 게임

수정 사이클(22편)로 I-frame, 밸런스 조정, C/C++ 에임 개선을 마쳤다. 이제 코드는 맞게 돌아간다. 근데 때릴 때 아무 느낌이 없다. 적이 조용히 사라지고, 플레이어가 맞아도 그냥 HP가 깎인다. '살아있는' 게임이 아니라 '계산이 돌아가는' 게임 같은 느낌.

---

## 그날 상황

Phase 10 추가 사이클 태스크는 처음부터 명확했다.

- **T1**: 타격 이펙트 강화 — 파티클, 피격 플래시, Screen Shake
- **T2**: 무기별 시각 피드백 개선 — 데미지 텍스트 팝업, 투사체 shape 차별화

코드 분석부터 시작했다. `ui/FloatingText.js`가 이미 있었다. `screenShake`도 `main.js`에 구현되어 있었다. `Player.hitFlashTimer`도 존재했다. 근데 `hitFlashTimer`를 세팅하는 코드는 있는데 `render()`에서는 쓰질 않고 있었다. 완성 안 된 기능이 조용히 방치된 상태.

이런 걸 발견할 때 묘한 기분이 든다. 코드가 반쯤 말을 걸고 있는 것 같아서.

---

## 접근 선택

파티클 시스템을 어떻게 둘지 고민했다. 세 가지 옵션:

- **A**: `systems/ParticleSystem.js` 단일 파일 — 범용 파티클 엔진
- **B**: 파티클 + 이펙트 두 파일 분리
- **C**: 최소 파티클만 (hitFlashTimer 방치)

C는 이미 있는 버그를 방치하는 거라 탈락. B는 파일 2개로 나눌 만큼 복잡하지 않았다. A로 결정.

---

## 구현: ParticleSystem.js

```js
export class ParticleSystem {
  addHitSpark(x, y, color = '#ffffff', count = 5) { ... }
  addEnemyDeath(x, y, count = 8) { ... }
  addHeal(x, y) { ... }
  update(dt) { ... }
  render(ctx, cameraX = 0, cameraY = 0) { ... }
}
```

파티클 구조체: `{ x, y, vx, vy, life, maxLife, color, size }`

렌더링은 단순하게. `globalAlpha = life / maxLife`로 페이드아웃, `size = baseSize * alpha`로 크기 줄이기. 각 파티클은 원(arc)으로 그린다.

파티클 종류별로 느낌을 다르게 했다:
- **hitSpark**: 빠르고 작게, 랜덤 방향 방사 (속도 40~120)
- **enemyDeath**: 더 크고 오래, 분홍/회색 색상 믹스 (속도 60~160)
- **heal**: 위로 떠오르는 녹색, 천천히 (음수 vy)

TDD로 5개 테스트 먼저 작성하고 → 실패 확인 → 구현 → 통과 순서로 진행했다. 테스트 짜기 전에 "이게 어떻게 동작해야 하나"를 한 번 더 생각하게 되는 게 TDD의 진짜 가치인 것 같다.

---

## FloatingTextManager 확장

기존 `add(text, x, y, color)` 시그니처에 `options` 파라미터 추가:

```js
add(text, x, y, color = '#ffffff', options = {})
// options.size     — 기본 14px
// options.duration — 기본 1.0s
```

크리티컬 판정(데미지 20 이상)은 `!!-24!!` 형태로 22px 크기, 1.3초 지속.

무기별 색상도 정의했다:

| 무기 | 색상 |
|------|------|
| Python | `#3572A5` (파이썬 파랑) |
| Java | `#b07219` (자바 주황) |
| Git | `#f05033` (Git 빨강) |
| JavaScript | `#f1e05a` (JS 노랑) |
| ... | ... |

실제 플레이할 때 "내가 Git으로 때렸구나"를 텍스트 색으로도 인지할 수 있게 된다.

---

## 투사체 shape 차별화

`Projectile.js`에 `weaponType` 프로퍼티 추가. render()에서 분기:

- **python**: 원형 arc (반지름 5px)
- **c**: 45° 회전 마름모 (fillRect 8×8)
- **railgun**: 기존 긴 직사각형 유지
- **default**: 기존 사각형

작은 차이지만, Python 투사체가 동그랗게 튀어나가는 걸 보면 왠지 Pythonic하다는 느낌이 든다.

---

## Player hitFlash — 방치된 기능 살리기

`Player.render()`에 두 줄 추가:

```js
if (this.hitFlashTimer > 0) {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  ctx.restore();
}
```

이 코드를 추가하기 전에는 `hitFlashTimer`가 세팅되고, 줄어들고, 0이 돼도 화면에는 아무것도 안 보였다. 타이머만 돌아가고 결과가 없는 코드. 이게 이번 사이클에서 가장 작지만 가장 만족스러운 수정이었다.

---

## Screen Shake 전면 적용

기존에는 Git 무기만 Screen Shake를 트리거했다. 이번에 전체로 확대:

| 이벤트 | intensity | duration |
|--------|-----------|----------|
| 일반 적 피격 | 2 | 0.1s |
| 적 사망 | 3 | 0.15s |
| 보스 피격 | 6 | 0.3s |
| 플레이어 피격 | 5 | 0.2s |

보스 피격이 가장 강하고, 일반 적 피격이 가장 약하다. 플레이어가 맞을 때도 흔들리는 게 중요하다 — "내가 맞았다"는 걸 시각으로도 느껴야 하니까.

---

## 연동 작업 — main.js

Task 5가 제일 손이 많이 갔다. 충돌 처리 위치마다 이펙트를 연결해야 했다:

- 투사체 ↔ 적 충돌 (piercing/non-piercing)
- 투사체 ↔ 보스 충돌
- Java 오비탈 ↔ 적 충돌
- 보스 투사체 ↔ 플레이어
- 플레이어 ↔ 적 접촉 (contactInvulTimer 체크)
- 적 사망 처리
- HP 회복

접촉 데미지에서 이중 효과 방지가 한 가지 트릭포인트였다. `player.takeDamageFromContact()`는 내부에서 `contactInvulTimer > 0`이면 early return하기 때문에, 이펙트를 호출 이후에 추가하면 무적 프레임에도 텍스트가 뜬다. `contactInvulTimer <= 0`을 호출 전에 체크해서 해결했다:

```js
const willHit = player.contactInvulTimer <= 0;
player.takeDamageFromContact(enemy.contactDamage);
if (willHit) {
  floatingTextManager.add(`-${enemy.contactDamage}HP`, ...);
  triggerScreenShake(5, 0.2);
}
```

---

## 코드 리뷰에서 나온 지적

코드 품질 리뷰어가 하나를 잡아냈다. LinuxBash 이펙트 색상을 `'#89e051'`로 하드코딩했는데, 이미 `WEAPON_COLOR['LinuxBash']`가 같은 값으로 정의되어 있었다. 지금은 같지만, 나중에 색상 변경하면 한 곳만 고쳐진다. 룩업 테이블 쓰는 의미가 없어지는 것.

```js
// 수정 전
particleSystem.addHitSpark(enemy.x, enemy.y, '#89e051', 4);

// 수정 후
particleSystem.addHitSpark(enemy.x, enemy.y, WEAPON_COLOR['LinuxBash'], 4);
```

사소하지만 맞는 지적이다. 이런 걸 잡아주는 리뷰 루프가 있다는 게 좋다.

---

## 결과

- `systems/ParticleSystem.js` 신규 (히트 불꽃, 적 사망 파편, 회복 녹색 파티클)
- `ui/FloatingText.js` 확장 (size/duration 옵션)
- `entities/Projectile.js` weaponType 추가
- `entities/Player.js` hitFlash 오버레이 구현
- `main.js` 전체 연동

게임이 달라 보인다. 적을 때리면 불꽃이 튀고, 맞으면 빨간 플래시가 나오고, 화면이 흔들린다. 숫자가 공중에 뜬다. 데미지 20 이상이면 `!!-35!!` 형태로 크게 표시된다.

"버그 수정 & 기본 플레이어블 완성"이 Phase 10의 목표였다. 수정 사이클로 작동하게 만들었고, 추가 사이클로 살아있게 만들었다. Phase 10 완료.

---

*다음 편 미리보기*: Phase 11 — 이벤트 UI 감성화 or 무기 시너지 시스템 (예정)
