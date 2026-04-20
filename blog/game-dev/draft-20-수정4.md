# 20편 — Phase 9 수정: 자동 에임, 넉백, 밸런스

> Phase 9 Cycle 1 수정 사이클 개발일지

---

## 이번 사이클 요약

Gemini 플레이테스트 피드백(phase_9.md)을 바탕으로 5개 항목을 수정했다. 전부 "플레이어가 적에게 일방적으로 당하는 느낌"을 없애는 방향이다.

---

## T2 + C2T1: WaveSystem minWave 필드 도입

가장 먼저 손댄 건 스폰 타이밍이었다. 게임 시작 10~15초 만에 `Input Mismatch`(조작 반전) 적이 등장해 신규 플레이어가 이탈한다는 피드백이 있었다.

기존 `WaveSystem.js`는 `WAVE_TYPES` 문자열 배열에서 랜덤으로 적 타입을 골랐다. 어떤 타입이 언제 등장할 수 있는지 제어하는 로직이 없었다.

바꾼 구조:

```js
const WAVE_TABLE = [
  { type: 'syntax_error',       minWave: 1  },
  { type: 'null_pointer',       minWave: 1  },
  { type: 'race_condition',     minWave: 5  },
  { type: 'infinite_loop',      minWave: 8  },
  { type: 'input_mismatch',     minWave: 8  },
  { type: 'library_dependency', minWave: 10 },
  // ...
];
```

`waveCount` 카운터를 생성자에 추가하고, `_spawnWave()` 호출마다 증가시킨다. 타입 선택 시 `waveCount >= minWave` 조건으로 풀을 필터링한다.

구현 중에 엣지 케이스가 하나 나왔다. `waveCount=0`일 때 `minWave=1` 이상 항목만 있으면 필터 결과가 빈 배열이 되고 `.type`에서 크래시가 난다. `minWave=1` 항목 폴백을 추가해서 막았다.

---

## T3: 플레이어 넉백

"적이 달라붙어서 체력이 한순간에 녹는다"는 피드백. `Player.js`에 `applyKnockback()` 메서드를 추가했다.

```js
applyKnockback(dx, dy, force) {
  if (this.contactInvulTimer > 0) return;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  this.x -= (dx / len) * force;
  this.y -= (dy / len) * force;
}
```

무적 시간(`contactInvulTimer`) 체크가 핵심이다. 무적 중에는 추가 넉백을 주지 않는다. 안 그러면 여러 적이 동시에 닿았을 때 플레이어가 순간이동 수준으로 날아간다.

`main.js` 충돌 처리에서 한 가지 순서 문제가 있었다. `dx`, `dy`를 `takeDamageFromContact` **이전**에 캡처해야 한다. `takeDamageFromContact`가 먼저 실행되면 `contactInvulTimer`가 세팅되고, 그 직후 `applyKnockback`이 체크해서 첫 히트에도 넉백이 안 걸린다.

---

## T1: 자동 에임

C/C++ 무기가 이동 방향으로만 발사돼서 카이팅(도망치면서 공격)이 불가능하다는 피드백. `main.js` 발사 로직에 nearest-enemy 탐색을 추가했다.

```js
let dirX = player.lastDirX;
let dirY = player.lastDirY;

const autoTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
let autoNearest = null;
let autoNearestDist = Infinity;
let bestDx = 0, bestDy = 0;
for (const e of autoTargets) {
  if (e.isDead) continue;
  const dx = e.x - player.x;
  const dy = e.y - player.y;
  const dist = dx * dx + dy * dy;
  if (dist < autoNearestDist) {
    autoNearestDist = dist;
    autoNearest = e;
    bestDx = dx;
    bestDy = dy;
  }
}
if (autoNearest) {
  const len = Math.sqrt(bestDx * bestDx + bestDy * bestDy) || 1;
  dirX = bestDx / len;
  dirY = bestDy / len;
}
```

`bestDx`, `bestDy`를 루프 중에 저장해서 나중에 재계산하지 않는다. 거리 비교는 제곱 거리(`dx*dx + dy*dy`)로 하고, 방향 벡터 정규화는 최종 타겟 하나에 대해서만 sqrt를 한 번 쓴다.

SQL, JavaScript, Java는 발사 로직 진입 전에 early return이 있어서 auto-aim 적용 대상에서 빠진다. 영향받는 무기는 Python, C/C++, Django, Git.

---

## T5: Python 무기 밸런스

투사체 속도 200→240(+20%), 쿨타임 1.0→0.9(-10%). 한 줄 수정이지만 초반 생존력이 눈에 띄게 올라간다.

---

## T4: REVERSED CONTROLS 텍스트 위치

`ctx.fillText('CONTROLS REVERSED', canvas.width / 2, 40)` → y값 40→60. 이미 screen 좌표 고정이었고(캐릭터 추종 버그는 코드에 없었다) y만 내려서 헤더 HUD와 겹치지 않게 했다.

---

## 회고

이번 사이클은 "느낌"을 고치는 작업이 많았다. 넉백, 자동 에임, 스폰 타이밍 — 전부 수치 문제가 아니라 컨트롤 감각 문제다. Gemini 피드백이 정확히 짚어줬고 구현은 단순했다. 순서 버그(dx/dy 캡처 타이밍) 하나가 유일한 트릭이었다.
