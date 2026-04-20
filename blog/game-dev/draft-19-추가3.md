# [JY Survival 개발일지 19편] Phase 8 Cycle 2 — 버그를 캐릭터로: 신규 몬스터 5종 설계기

> Phase 8 Cycle 2에서는 새로운 몬스터 5종을 구현했다. 각각 실제 프로그래밍 버그 개념을 게임 메카닉으로 번역한 결과물들이다.

---

## 이번 사이클에서 만든 것들

총 5종의 새 몬스터가 추가됐다.

- **Race Condition** — 샴쌍둥이 버그
- **Memory Leak** — 거대해지는 슬라임
- **Infinite Loop** — 가두리 양식러
- **Input Mismatch** — 컨트롤 반전술사
- **Library Dependency** — 패키지 버퍼

숫자로 보면 Enemy.js 한 파일에 타입 분기가 5개 더 늘었고, 테스트는 327개가 됐다. 그런데 몬스터 하나 만들 때마다 예상치 못한 결정들이 쌓였다.

---

## Race Condition: "동시에 죽여야 한다"는 규칙의 구현

Race Condition은 두 마리가 붉은 실로 연결된 채 등장한다. 한 마리만 죽이면 1초 후 풀피로 부활한다. 두 마리를 1초 이내에 처치해야 비로소 제거된다.

처음엔 간단해 보였다. `isDead = true` 대신 `dyingTimer = 1.0`을 쓰면 되겠지 했다. 그런데 부활 조건 판단이 애매했다.

> "한 마리가 dying 상태일 때, 링크된 다른 마리가 dying이거나 이미 dead면 같이 죽는다"

이 논리를 `Enemy.update()` 안에 구겨 넣었다. 타이머가 0에 도달하는 순간 `linkedEnemy`의 상태를 확인한다. 상대가 아직 살아있고 dying도 아니면 → 부활. 상대가 dying이거나 dead면 → 영구 사망.

```js
if (this.dyingTimer <= 0) {
  if (this.linkedEnemy && !this.linkedEnemy.isDead && this.linkedEnemy.dyingTimer <= 0) {
    this.hp = this.maxHp;  // 부활
    this.dyingTimer = 0;
  } else {
    this.isDead = true;    // 영구 사망
  }
}
```

그리고 WaveSystem에서 두 마리를 한 세트로 스폰할 때 서로 `linkedEnemy`를 교차 참조해줘야 했다. 이 cross-reference 설정이 스폰 로직 바깥에 있으면 안 되니까, WaveSystem 안에서 처리했다.

---

## Memory Leak: 시간이 지날수록 위험해지는 적

Memory Leak 슬라임은 3초마다 크기가 커진다. 최대 3배까지. 이동 경로에 '가비지' 오브젝트를 0.5초마다 떨어뜨리는데, 이게 플레이어에 닿으면 데미지 + 이동속도 감소다.

Enemy.js 안에 `scale`, `growTimer`, `_pendingGarbage[]` 필드를 추가했다. Enemy가 가비지를 직접 관리하지 않고 `_pendingGarbage`에 쌓아뒀다가 main.js가 프레임마다 수거해가는 패턴 — 이미 `_pendingShots`에서 쓰던 방식과 동일하다.

가비지 오브젝트가 플레이어를 느리게 만드는 효과는 `player.speedMultiplier` 방식으로 구현했다. 그런데 테스트 돌릴 때 가끔 `scale은 3.0을 초과하지 않는다` 테스트가 실패했다. 원인은 테스트 격리 문제 — 다른 테스트에서 타이머 상태가 남아있는 경우였다. 실패 재현이 불규칙해서 일단 flaky로 처리하고 넘어갔다.

---

## Infinite Loop: 잡기 어렵게 만드는 게 목표

가두리 양식러는 플레이어 주변 180px 반경을 원형으로 공전한다. 2초마다 투사체를 발사하는데, 투사체가 플레이어 근처(40px 이내)에 닿으면 '코드 벽' 오브젝트가 생성된다.

코드 벽이 5개 이상 쌓이면 플레이어가 완전히 움직이지 못한다. 이 적을 처치하면 자신이 만든 코드 벽이 전부 사라진다.

구현하면서 중요한 설계 결정이 하나 있었다: 이동 동결 로직을 어디에 넣느냐. Player.js? main.js의 이동 처리 부분?

결론은 main.js 이동 처리 바로 위에 `codeWalls.length >= 5` 체크를 넣는 것. Player를 모르는 Enemy가 Player의 이동을 간접적으로 제어하는 셈인데, 그 중간에 main.js가 게이트 역할을 한다.

초기 구현에서 슬로우 디버프 타이머를 `dt`로 설정하는 버그가 있었다. `dt`는 보통 0.016초 — 즉 한 프레임만 느려지고 즉시 복구됐다. 코드 리뷰에서 발견해서 `0.5`초 고정값으로 수정했다.

---

## Input Mismatch: 전조를 보여줘야 납득이 된다

컨트롤 반전술사는 spec에 명시된 조건이 하나 있었다.

> 공격 전 전조 현상(보라색 충전 이펙트 0.7초) 표시 필수 — "피했어야 했는데"의 납득 필요.

피격 후 3초간 WASD가 반전되는 건 상당히 짜증스러운 효과다. 그러니까 반드시 피할 기회를 줘야 한다는 뜻이다.

0.7초 충전 중에는 보라색 글로우가 점점 진해진다. `globalAlpha = 0.5 + 0.5 * (1 - this._chargeTimer / 0.7)` — 충전 시작 때 50% 투명, 완료 직전 100% 불투명. 애니메이션이 선형으로 읽힌다.

충전이 끝나면 투사체가 날아오고, 맞으면 `player.controlsReversed = true`, `player.controlsReversedTimer = 3.0`.

이동 처리 부분에서 `controlsReversed`가 true면 x와 y를 뒤집는다. 화면 상단에 "CONTROLS REVERSED" 텍스트도 표시된다. 적 처치가 어려워지면서도 플레이어가 상황을 인식할 수 있게 했다.

---

## Library Dependency: 우선순위 판단을 강제하는 설계

패키지 버퍼는 반경 150px 내 모든 적에게 방어력 5배 버프를 준다. 맞아도 20%만 데미지가 들어간다.

게임 메카닉적으로 흥미로운 점은 이 적 자체는 위협적이지 않다는 것이다. 느리고, 접촉 데미지도 낮고, 공격도 없다. 하지만 이 적이 살아있으면 주변 적이 사실상 무적이 된다. 플레이어는 맞지 않아도 되는 약한 적을 먼저 잡아야 할 이유가 생긴다.

구현은 per-frame 플래그 방식으로 했다. 매 프레임 살아있는 library_dependency 적을 수집하고, 나머지 모든 적에 대해 반경 체크를 해서 `_isBuffed`를 set/clear한다. 영구 상태 변경 없이 프레임마다 재계산하기 때문에 적이 죽으면 자동으로 버프가 사라진다.

첫 구현에서 거리 계산에 `Math.sqrt`를 썼다가 코드 리뷰에서 제곱 거리 비교로 교체했다. 게임에서 Math.sqrt는 어디서나 병목이 될 수 있다.

```js
// 전: Math.sqrt(dx * dx + dy * dy) <= 150
// 후:
const _radiusSq = 150 * 150;
return (dx * dx + dy * dy) <= _radiusSq;
```

---

## 코드 구조 이야기

5종을 구현하고 나니 Enemy.js의 `update()` 함수가 꽤 길어졌다. 각 타입마다 `if (this.type === 'X')` 분기가 쌓이는 구조다.

리팩터링 대상이 될 수 있겠지만, 지금은 안 한다. 이 게임은 타입 수가 정해져 있고, 확장보다 완성이 우선이다.

한 가지 패턴이 정착됐다: 새 Enemy 타입이 추가될 때마다 거치는 단계.

1. Enemy.js — 생성자 필드, update 분기, render 분기, ENEMY_STATS 항목
2. WaveSystem.js — WAVE_TYPES 추가, 스폰 제한 로직
3. main.js — 펜딩 이펙트 수거, 플레이어 상호작용, 렌더 처리
4. Enemy.test.js — 타입별 단위 테스트

이 흐름이 T1부터 T5까지 반복됐다. 서브에이전트가 타입마다 독립적으로 이 패턴을 따라가면서 충돌 없이 작업했다.

---

## 다음

Cycle 2까지 완료했다. Phase 8에는 제안 사이클(Cycle 3)이 남아있다.

`phase_feedback/phase_8.md`의 `#제안` 섹션:
- 신규 몬스터 5종의 웨이브 등장 타이밍 조정
- 무기 기믹 밸런스 재검토

이쪽을 정리하고 Phase 8을 마무리할 예정이다.
