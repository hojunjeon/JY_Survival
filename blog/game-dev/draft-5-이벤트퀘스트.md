# [JY Survival 개발일지 5편] 이벤트·퀘스트 시스템 — "게임이 이야기를 갖기 시작했다"

> 시리즈: 김지윤의 디버그 서바이벌 개발기

---

## 이번 사이클에서 만든 것

Cycle 4는 짧았다. 파일 2개, 테스트 44개 추가. 그런데 체감은 달랐다.

이전까지는 "버그가 나오고 → 플레이어가 때린다"가 전부였다. 이번에 `EventSystem`을 붙이고 나니 게임이 흐름을 갖기 시작했다. 30초가 지나면 뭔가 일어난다. 90초가 지나면 또 다른 일이 일어난다. 그 사이에 조건을 채워야 한다.

아직 UI는 없다. 알림만 뜨는 코드도 없다. 그냥 시스템 내부에서 `{ type: 'event_triggered', event: 'E1' }` 같은 객체가 조용히 생겨날 뿐이다. 그래도 뭔가 달라진 느낌이 있다.

---

## 설계: 이벤트 두 개, 퀘스트 하나

`docs/design.md`에 적어둔 Stage 1 구조는 이렇다:

| 시점 | 이벤트 | 클리어 조건 | 보상 |
|------|--------|------------|------|
| 30초 | E1: 들여쓰기 지옥 | IndentationError 15마리 처치 | 강화 재화 |
| 90초 | E3: 파이참 위기 | EnvError 처치 + 60초 생존 | 무기 획득 |
| 전반 | Q1 퀘스트 | 버그 100마리 누적 처치 | 스탯 업그레이드 |

이걸 어떻게 코드로 옮길까 생각했다.

처음에는 `Game.js`에 직접 타이머를 넣으려 했다. `if (this.elapsed > 30) { spawnIndentationError() }` 이런 식으로. 근데 그렇게 하면 테스트하기가 불편하다. 게임 루프 전체를 돌려야 E1 트리거를 확인할 수 있게 된다.

그래서 분리했다. `EventSystem`은 시간과 킬 정보만 받는다. 게임 루프에서 `dt`를 넘기고, 적이 죽으면 `notifyKill(type)`을 호출하면 된다. 내부적으로 상태를 관리하고 알림을 반환한다.

```js
// 이런 식으로 쓰인다
const es = new EventSystem({ e1TriggerTime: 30, e3TriggerTime: 90, q1Target: 100 });

// 게임 루프에서
const notifications = es.update(dt);
// → [{ type: 'event_triggered', event: 'E1' }]

// 적 처치 시
const killNotifs = es.notifyKill('indentation_error');
// → [{ type: 'event_cleared', event: 'E1' }] (15번째 처치라면
```

---

## TDD 로 짠 이유

사실 이 정도 로직이면 그냥 코드 먼저 짜도 됐다. 상태 기계 하나, 카운터 몇 개. 어렵지 않다.

그런데 직전 사이클(무기 시스템)에서 E3 조건을 생각해보다가 헷갈린 게 있었다. "EnvError 처치 + 60초 생존"이 정확히 무슨 뜻이냐는 거다.

- 60초 동안 EnvError를 한 마리라도 잡으면 되나?
- EnvError를 다 잡은 뒤 60초를 더 버텨야 하나?
- 아니면 60초 이내에 EnvError를 잡으면 되나?

`design.md`만으로는 명확하지 않았다. 그래서 테스트를 먼저 썼다. 테스트를 쓰면서 API를 결정해야 했고, 그 과정에서 내가 원하는 동작이 뭔지 명확해졌다.

최종 결론: **E3 활성 후 EnvError 1마리 이상 처치, 그리고 E3 시작 후 60초 생존.** 두 조건 모두 충족해야 cleared.

```js
it('env_error 1마리 이상 처치 + 60초 생존 시 E3가 cleared된다', () => {
  es.notifyKill('env_error');
  es.update(60);
  expect(es.e3State).toBe('cleared');
});

it('60초 생존해도 env_error 처치 없으면 E3 cleared 안 된다', () => {
  es.update(60);
  expect(es.e3State).toBe('active');
});
```

이걸 먼저 써두니까 구현할 때 고민이 없었다.

---

## 적 타입 2종 추가: IndentationError, EnvError

E1/E3 이벤트 전용 버그들이다. `Enemy.js`의 `ENEMY_STATS`에 추가하는 건 간단했다.

```js
indentation_error: { hp: 60,  speed: 70,  contactDamage: 15, ... },
env_error:         { hp: 130, speed: 35,  contactDamage: 15, ... },
```

코드 리뷰에서 지적 받은 게 하나 있었다. 렌더링 색상 맵에 새 타입을 빠뜨렸다는 것. `render()` 안에 `colors` 객체에 `indentation_error`, `env_error`가 없어서 폴백 색(오렌지)으로 뜨게 됐을 것이다. 즉시 추가했다.

```js
indentation_error: '#ffaa44',  // 주황-노랑
env_error:         '#4488ff',  // 파랑
```

사소해 보이지만 이런 거 누락되면 나중에 "이 버그가 왜 오렌지야?" 하면서 한참 헤맨다. 리뷰가 있어서 잡을 수 있었다.

---

## 상태 기계 설계 결정

처음엔 이벤트 상태를 `boolean`으로 관리할까 했다.

```js
this.e1Active = false;
this.e1Cleared = false;
```

근데 불리언 두 개보다 문자열 상태 하나가 훨씬 읽기 쉽다는 걸 이전 코드들 보면서 알게 됐다.

```js
this.e1State = 'pending' | 'active' | 'cleared'
```

전환 방향은 단방향이다. `pending → active → cleared`. 절대 뒤로 못 간다. 이 제약 덕분에 코드가 단순해진다. `if (e1State === 'active')` 체크 하나면 충분하다.

---

## 숫자: 44개 테스트, 0개 실패

Cycle 4 추가분:

- `tests/EventSystem.test.js`: 38개 (EventSystem 전체 커버리지)
- `tests/Enemy.test.js`: 6개 추가 (이벤트 전용 적 타입)

누적: **166개 테스트, 전부 GREEN.**

---

## 아직 안 된 것

`EventSystem`은 독립 모듈이다. 아직 `Game.js`에 연결하지 않았다. 게임을 실제로 실행해도 이벤트가 트리거되지 않는다. `notifyKill`을 호출하는 코드도 없다.

이 연결은 Cycle 6 (통합)에서 할 예정이다. 지금은 시스템 단위로 검증해두는 것으로 충분하다. 연결 전에 로직이 확실히 맞아야 연결할 때 고민이 줄어드니까.

---

## 다음: Cycle 5 — 장선형 등장

보스다. 설계 문서에 대사까지 다 정해져 있다.

> "지윤님... 이번엔 제가 꼭 이깁니다! 두고 보세요!!"

HP 50% 이하에서 2페이즈 전환, 투사체 패턴 변화. 이번엔 `entities/Boss.js`를 만들어야 한다. 보스 등장 트리거도 `EventSystem`에 연결될 예정이다.

김지윤과 장선형의 첫 대결. 기대된다.

---

*다음 편: [6편] 보스전 — 장선형의 반격*
