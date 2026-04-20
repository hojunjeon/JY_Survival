# Phase 9 설계 문서 — 게임플레이 개선 + 밸런스

> 날짜: 2026-04-20
> 출처: phase_feedback/phase_9.md (Gemini 플레이테스트 피드백)

---

## 개요

Phase 9는 두 사이클로 구성된다:
- **Cycle 1 (수정)**: 5개 버그/밸런스 픽스
- **Cycle 2 (추가)**: WaveSystem minWave 필드 공식 도입

T2(Cycle 1)와 Cycle 2 T1은 동일한 WaveSystem.js 수정이므로 통합 구현한다.

---

## Cycle 1 — 수정

### T1: 자동 에임 (Auto-Aim)

**대상 무기:** Python, C/C++, Django, Git
**제외 무기:** JavaScript(랜덤 난사), LinuxBash(전체 범위), Java(오비탈 — 별도 처리)

**구현 위치:** `main.js` 발사 로직 (line 332 근처)

**방식 (A안):**
```
적 목록([enemies + boss]) 중 isDead 제외 → 거리 최소 적 탐색
→ 방향 벡터 정규화 → weapon.fire(x, y, autoX, autoY) 호출
타겟 없으면 player.lastDirX/Y 폴백
```

WeaponBase 인터페이스 불변. 각 무기 클래스 수정 없음.
SQL/JavaScript/Java는 기존 개별 처리 분기를 유지하므로 영향 없음.

---

### T2 + Cycle 2 T1: WaveSystem minWave (통합 구현)

**구현 위치:** `systems/WaveSystem.js`

**방식 (A안):** WAVE_TYPES 배열을 객체 배열로 변환, waveCount 카운터 추가

```js
const WAVE_TABLE = [
  { type: 'syntax_error',        minWave: 1  },
  { type: 'null_pointer',        minWave: 1  },
  { type: 'seg_fault',           minWave: 1  },
  { type: 'memory_leak',         minWave: 1  },
  { type: 'race_condition',      minWave: 5  },
  { type: 'infinite_loop',       minWave: 8  },
  { type: 'input_mismatch',      minWave: 8  },
  { type: 'library_dependency',  minWave: 10 },
];
```

- `this.waveCount = 0` 초기화, `_spawnWave()` 호출 시 `waveCount++`
- 타입 선택 시 `waveCount >= minWave` 조건 필터링 후 랜덤 선택
- eventMode 중에는 기존 로직 유지 (type 고정)

---

### T3: 플레이어 넉백

**구현 위치:** `entities/Player.js` + `main.js`

**방식 (A안):** `Player.applyKnockback(dx, dy, force)` 신규 메서드

```js
applyKnockback(dx, dy, force) {
  if (this.contactInvulTimer > 0) return; // 무적 시간 중 넉백 없음
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  this.x -= (dx / len) * force; // 적 반대 방향으로 밀림
  this.y -= (dy / len) * force;
}
```

`main.js` 충돌 처리 (line 944-951)에서 `takeDamageFromContact` 이후 호출:
```js
player.applyKnockback(enemy.x - player.x, enemy.y - player.y, 70);
```

넉백 거리: 70px (60~80px 범위 중간값)
무적 시간 내 추가 넉백 없음 — contactInvulTimer 체크로 처리.

---

### T4: REVERSED CONTROLS 텍스트 위치

**구현 위치:** `main.js` line 1287

**현황:** 이미 screen 좌표 고정 (`canvas.width / 2, 40`). "캐릭터 추종" 버그는 현재 코드에 없음.

**변경:** y 값만 40 → 60 으로 수정.

---

### T5: Python 밸런스 상향

**구현 위치:** `weapons/Python.js`

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| projectileSpeed | 200 | 240 (+20%) |
| cooldown | 1.0 | 0.9 (-10%) |

---

## Cycle 2 — 추가

### T1: WaveSystem minWave 필드

Cycle 1 T2와 통합 구현 완료. 별도 작업 불필요.

---

## 테스트 포인트

- [ ] C/C++ 무기: 이동 방향과 무관하게 가장 가까운 적 방향으로 투사체 발사
- [ ] Python: 위와 동일, 속도/쿨타임 상향 확인
- [ ] 게임 시작 직후(웨이브 1~7): input_mismatch, infinite_loop 미등장 확인
- [ ] 웨이브 8+: input_mismatch, infinite_loop 정상 등장 확인
- [ ] 적 접촉 시 플레이어 넉백 (~70px) 확인, 무적 시간 중 추가 넉백 없음
- [ ] CONTROLS REVERSED 텍스트: y=60 고정 위치 확인
