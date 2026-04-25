# Spec: Phase 11 Cycle 2 — 무기 레벨업 이펙트 스케일업

**날짜:** 2026-04-25
**Phase:** 11 / Cycle 2
**분류:** fix
**참조 예제:** `phase11-cycle2-weapon-levelup-fx.html`

---

## 목표

무기 레벨(1~5)에 따라 ParticleSystem 이펙트의 화려도를 단계적으로 증가시킨다.
레벨업 트리거는 강화 재화 소모 (기존 강화 시스템과 동일).

---

## 레벨업 트리거

- 강화 재화 소모 시 `weapon.level` 1 증가 (최대 5)
- 비용: Lv1→2: 재화 1 / Lv2→3: 재화 2 / Lv3→4: 재화 4 / Lv4→5: 재화 8
- 레벨업 성공 시 HUD 상단에 플래시 알림 텍스트 표시 (1.5초)

---

## 레벨별 이펙트 파라미터

### Python.py (Serpent Chain)

| Lv | trail 점 수 | shadowBlur | 추가 효과 |
|----|------------|------------|-----------|
| 1 | 5 | 0 | 없음 |
| 2 | 8 | 5 | 없음 |
| 3 | 12 | 10 | 사인파 진동 (amplitude 3px) |
| 4 | 16 | 15 | 사인파 + 색상 그라데이션 |
| 5 | 20 | 20 | 사인파 + 그라데이션 + 꼬리 스플래시 파티클 |

### C/C++ (Hypersonic Pierce)

| Lv | trail 점 수 | 충격파 링 반경 | 추가 효과 |
|----|------------|---------------|-----------|
| 1 | 4 | 없음 | 없음 |
| 2 | 6 | 10px | 없음 |
| 3 | 8 | 15px | 링 페이드 0.3s |
| 4 | 10 | 20px | 이중 링 |
| 5 | 12 | 25px | 이중 링 + 파편 스파크 4개 |

### Java (Orbital JVM)

| Lv | 오비탈 수 | 잔상 점 수 | 추가 효과 |
|----|----------|-----------|-----------|
| 1 | 3 | 4 | 없음 |
| 2 | 3 | 6 | 공전 링 반투명 |
| 3 | 3 | 8 | 공전 링 + 글로우 |
| 4 | 4 | 8 | 오비탈 4개 + 링 |
| 5 | 4 | 10 | 오비탈 4개 + 외부 링 + 코어 펄스 |

---

## 구현 위치

### ParticleSystem.js

기존 메서드에 `level` 파라미터 추가:

```js
addWeaponTrail(x, y, vx, vy, weaponType, level = 1)
addWeaponHit(x, y, weaponType, level = 1)
addOrbitalTail(orbX, orbY, angle, level = 1)
```

### weapons/*.js

각 무기의 파티클 호출부에 `this.level` 전달:

```js
particleSystem.addWeaponTrail(x, y, vx, vy, 'python', this.level)
```

---

## 레벨업 알림 UI

- HUD 상단 중앙에 1.5초간 표시
- 텍스트: `"Python.py  Lv3 ▲"` 형식
- 색상: `#f9e2af` (yellow), 페이드아웃

---

## 구현 범위 제외

- 나머지 무기(Git, SQL, JavaScript, Django, LinuxBash) 레벨업 이펙트 — Phase 12
- 레벨업 UI 화면 (stat-upgrade와 별개) — 현재 강화 UI 그대로 사용
