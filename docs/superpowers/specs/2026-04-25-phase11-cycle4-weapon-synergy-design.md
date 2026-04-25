# Spec: Phase 11 Cycle 4 — 무기 시너지/진화 시스템 (MVP: Cython)

**날짜:** 2026-04-25
**Phase:** 11 / Cycle 4
**분류:** add
**참조 예제:** `phase11-cycle4-weapon-synergy.html`
**의존:** Cycle 3 (무기 파편 아이템)

---

## 목표

Python.py + C_Cpp.c 동시 보유 시 Cython.pyx로 진화하는 MVP 시너지 시스템을 구현한다.
이후 조합 확장은 Phase 12에서 진행한다.

---

## 신규 파일

### `systems/SynergySystem.js`

```js
export class SynergySystem {
  constructor(weaponManager, lootSystem) { ... }

  check()   { ... }  // 매 프레임 또는 무기 변경 시 호출 → 진화 가능 여부 반환
  evolve(combo) { ... }  // 진화 실행
}
```

### `weapons/Cython.js`

- Python의 360° 투사체 + C의 고속 관통 병합
- 발사체: 360° 방향, 고속, 관통 가능
- 이펙트: Python 뱀 체인 trail + C 슬래시 링 병합
- 색상: `#44ff44` (Python 그린) + `#64b4ff` (C 아이스 블루) 그라데이션

---

## 진화 조건 (MVP)

| 조합 | 결과 | 재료 |
|------|------|------|
| Python.py + C_Cpp.c | Cython.pyx | 무기 파편 ×3 |

---

## 진화 처리

1. `SynergySystem.check()` — 매 무기 변경 시 호출
2. 조건 충족 시 HUD에 진화 알림 표시 (인게임 즉시)
3. 플레이어 파편 ×3 보유 시 진화 버튼 활성화
4. 진화 확인 → Python + C 슬롯 제거 → Cython 슬롯 1개로 교체 (슬롯 1개 회수)
5. 진화 연출: 0.5초 화면 플래시 + 파티클 버스트

---

## 진화 알림 UI (Canvas 오버레이)

- 화면 하단 중앙에 알림 배너 표시
- 텍스트: `"⚗️ 진화 가능 — Python + C → Cython  [파편 ×3 소모]"`
- 버튼: "진화하기" / "나중에"
- 파편 부족 시: `"파편 부족 (보유: N / 필요: 3)"` 표시, 버튼 비활성

---

## Cython 무기 스펙

| 항목 | 값 |
|------|----|
| 발사 방향 | 360° (Python 동일) |
| 발사 속도 | Python × 1.5 |
| 데미지 | Python + C 합산 |
| 관통 | 최대 2체 |
| 이펙트 레벨 기준 | `(python.level + c.level) / 2` 반올림 |

---

## 구현 범위 제외

- 나머지 진화 조합 (SpringBoot, DjangoORM, Node) — Phase 12
- 진화 되돌리기 — 없음 (단방향)
