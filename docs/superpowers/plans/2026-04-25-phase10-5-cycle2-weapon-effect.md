# Phase 10.5 Cycle 2 — 무기 이펙트 시스템 구현 Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement task-by-task. Use `[~]` to skip completed tasks.

**Goal:** `ParticleSystem`에 무기별 전용 파티클 효과 3개 메서드를 추가하고, 각 무기 클래스에서 발사/업데이트 시점에 이펙트를 호출하여 시각적으로 구분 가능한 무기 효과를 구현.

**Spec:** `docs/superpowers/specs/2026-04-25-phase10-5-cycle2-weapon-effect-design.md`

---

## Task 1: ParticleSystem — addWeaponTrail 메서드 추가

**파일:** `systems/ParticleSystem.js`, `tests/ParticleSystem.test.js`

- Python trail: 20개 점, 사인파 진동, 색상 `#44ff44`/`#88ffaa` 교대, `shadowBlur:20`
- C trail: 12개 점, 직선, 색상 `#64b4ff`, `shadowBlur:10`
- render 메서드에 `shadowBlur`/`shadowColor` 파티클 속성 지원 추가

- [x] Task 1: `addWeaponTrail(x, y, weaponType)` 구현 + render shadow 지원 + 테스트 추가

---

## Task 2: ParticleSystem — addWeaponHit 메서드 추가

**파일:** `systems/ParticleSystem.js`, `tests/ParticleSystem.test.js`

- C 명중: 8방향 확산 파티클, 색상 `#64b4ff`, 속도 80px/s, 생존 0.3s
- 기타 weaponType: `addHitSpark` fallback (흰색 3개)

- [x] Task 2: `addWeaponHit(x, y, weaponType)` 구현 + 테스트 추가

---

## Task 3: ParticleSystem — addOrbitalTail 메서드 추가

**파일:** `systems/ParticleSystem.js`, `tests/ParticleSystem.test.js`

- 8개 잔상 점, 색상 `#ffa032`, `shadowBlur:20`, 뒤로 갈수록 alpha 감소

- [x] Task 3: `addOrbitalTail(x, y)` 구현 + 테스트 추가

---

## Task 4: Python.js — ParticleSystem 연결

**파일:** `weapons/Python.js`, `tests/Weapons.test.js`

- `activeProjectiles` 배열 추가 (_createProjectiles에서 push)
- `update(dt, particleSystem)` 메서드: 활성 발사체마다 `addWeaponTrail(x, y, 'python')` 호출
- 비활성 발사체 정리

- [x] Task 4: Python.js `update` 메서드 + particleSystem 연결 + 테스트

---

## Task 5: C.js — ParticleSystem 연결

**파일:** `weapons/C.js`, `tests/Weapons.test.js`

- Python과 동일 구조: `activeProjectiles` + `update(dt, particleSystem)`
- `addWeaponTrail(x, y, 'c')` 호출

- [x] Task 5: C.js `update` 메서드 + particleSystem 연결 + 테스트

---

## Task 6: 게임 루프 통합 — 무기 update에 ParticleSystem 전달

**파일:** `main.js` (게임 메인 루프)

- 무기 update 호출 시 `this.particleSystem` 전달
- Java 무기 오브 위치마다 `addOrbitalTail` 호출 (JavaWeapon에 `getOrbPositions` 메서드 추가 필요하면 추가)

- [x] Task 6: 게임 루프에서 ParticleSystem 전달 + Java 오브 tail 연결

---

## Task 7: 명중 이펙트 통합 — addWeaponHit 호출

**파일:** `main.js` 또는 `core/Collision.js` (명중 감지 지점)

- 발사체 명중 시 `particleSystem.addWeaponHit(x, y, projectile.weaponType)` 호출
- Projectile에 `weaponType` 속성 전달 확인

- [x] Task 7: 명중 시 addWeaponHit 호출 연결

---

## Task 8: 전체 테스트

- [x] Task 8: `npm test` — 모든 테스트 통과 확인
