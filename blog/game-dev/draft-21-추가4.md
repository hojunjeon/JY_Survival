# 21편 — Phase 9 추가: WaveSystem minWave 설계 의도

> Phase 9 Cycle 2 추가 사이클 개발일지

---

## 이번 사이클 요약

Cycle 2 추가 항목은 `WaveSystem.js`에 `minWave` 필드를 공식 설계로 도입하는 것 하나다. 구현 자체는 Cycle 1의 T2(스폰 타이밍 버그 수정)와 통합해 이미 완료됐다. 이 글은 기능 자체보다 **설계 결정**을 기록한다.

---

## 왜 minWave 필드인가

기존 `WaveSystem.js`의 적 타입 목록:

```js
const WAVE_TYPES = [
  'syntax_error', 'null_pointer', 'seg_fault', 'memory_leak',
  'race_condition', 'infinite_loop', 'input_mismatch', 'library_dependency',
];
```

문자열 배열. 어떤 적이 언제 나오는지 제어할 방법이 없다. 추가 조건이 필요하면 `_spawnWave()` 안에 if문을 덕지덕지 붙여야 한다.

`minWave` 필드를 붙인 객체 배열로 바꾸면 타입 선언 자체에 등장 조건이 담긴다:

```js
const WAVE_TABLE = [
  { type: 'syntax_error',       minWave: 1  },
  { type: 'null_pointer',       minWave: 1  },
  { type: 'seg_fault',          minWave: 1  },
  { type: 'memory_leak',        minWave: 1  },
  { type: 'race_condition',     minWave: 5  },
  { type: 'infinite_loop',      minWave: 8  },
  { type: 'input_mismatch',     minWave: 8  },
  { type: 'library_dependency', minWave: 10 },
];
```

새 적 타입을 추가할 때 배열에 한 줄 넣으면서 `minWave`만 지정하면 된다. 스폰 로직은 건드리지 않아도 된다.

---

## minWave 기준값 결정

| 타입 | minWave | 이유 |
|------|---------|------|
| syntax_error, null_pointer, seg_fault, memory_leak | 1 | 기본 적. 처음부터 등장 |
| race_condition | 5 | 쌍으로 묶여 있어서 둘 중 하나를 처리해야 양쪽이 사라진다. 초반엔 너무 가혹 |
| infinite_loop, input_mismatch | 8 | 조작 반전 이펙트. 패닉 없이 메커니즘을 파악할 시간이 필요 |
| library_dependency | 10 | 보스 등장 직전. 가장 까다로운 타입 |

웨이브 하나에 평균 10~12초라고 보면, 웨이브 8은 약 80~100초다. 게임 흐름을 한 번 파악한 플레이어가 마주치는 타이밍.

---

## 구현 시 나온 엣지 케이스

`waveCount`가 아직 0인 상태(또는 minWave 조건을 아무것도 충족 못하는 가상의 시나리오)에서 필터 결과가 빈 배열이 되면 `pool[Math.random * 0]`이 `undefined`를 반환하고 크래시가 난다.

대비책으로 폴백을 추가했다:

```js
const available = WAVE_TABLE.filter(e => this.waveCount >= e.minWave);
const pool = available.length > 0
  ? available
  : WAVE_TABLE.filter(e => e.minWave === 1);
```

`minWave=1` 항목은 항상 존재하므로 폴백이 빈 배열이 되는 경우는 없다.

---

## 회고

minWave 도입은 "버그 수정"이 아니라 확장 가능성을 위한 설계 변경이다. 지금 당장 새 적 타입을 추가할 계획은 없지만, 다음 Phase에서 보스 2차 페이즈나 엘리트 타입을 넣는다면 `minWave`만 지정하면 바로 연결된다. 구현 비용은 거의 없고 미래 옵션이 생기는 교환.
