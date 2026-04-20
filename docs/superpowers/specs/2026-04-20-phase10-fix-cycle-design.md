# Phase 10 수정 사이클 설계 문서

> 작성일: 2026-04-20
> 대상: Phase 10 수정(Fix) 사이클 태스크 7개

---

## 범위

플레이 테스트 피드백 기반 버그 수정 및 밸런스 조정.  
추가(Add) 사이클(타격 이펙트 등)은 별도 설계 문서로 분리.

---

## T1 — I-frame 버그 수정

**문제:** 보스 접촉 시 `takeDamage(20)` 직접 호출 (main.js:979) → I-frame 우회로 매 프레임 20 데미지 즉사.

**수정:**
- `main.js:979`: `player.takeDamage(20)` → `player.takeDamageFromContact(20)`
- `Player.js:44`: `contactInvulTimer = 0.5` → `contactInvulTimer = 1.0`

**파일:** `main.js`, `entities/Player.js`

---

## T2 — REVERSED CONTROLS 텍스트 위치

**문제:** 현재 `y=60`으로 무기 목록(y=56~)과 겹침. 게임 중 중요 상태가 묻힘.

**수정:** `main.js:1310` `y=60` → `y=28` (HP바 하단, 명확한 상단 고정)

**파일:** `main.js`

---

## T3 — 조작 반전 발동 타이밍

**문제:** `input_mismatch` 적의 `minWave: 8` → 24초 후 등장. 초반에 조작 반전이 발생해 플레이어 경험 저하.

**수정:** `systems/WaveSystem.js` WAVE_TABLE 내 `input_mismatch` `minWave: 8` → `minWave: 25` (75초 후 등장)

**파일:** `systems/WaveSystem.js`

---

## T4 — C/C++ 에임 시스템 개선 (조준선 일치)

**문제:** 발사는 최근접 적 자동 에임이지만, 조준선은 이동 방향(`player.lastDirX/Y`)을 따름 → 시각/실제 불일치.

**수정:**
- `main.js` `tryFireWeapon` 함수 내 최근접 적 방향 계산 후 `player._aimDirX`, `player._aimDirY`에 저장
- 조준선 렌더(main.js:1138-1153): `player.lastDirX/Y` → `player._aimDirX/Y` 참조

**초기값:** Player 생성 시 `_aimDirX = 1`, `_aimDirY = 0`

**파일:** `main.js`

---

## T5 — Python 공속·연사력 버프

**문제:** cooldown 0.9s, damage 15로 초반 웨이브(3마리/3초) 대응 불가.

**수정:** `weapons/Python.js`
- `cooldown: 0.9` → `cooldown: 0.6`
- `damage: 15` → `damage: 18`

**파일:** `weapons/Python.js`

---

## T6 — Java 무기 밸런스 재조정

**문제:** 오비탈 ORB_DAMAGE 18, hitCooldown 0.5s — 근접 접촉 리스크 대비 딜 낮음.

**수정:** `weapons/Java.js`
- `ORB_DAMAGE: 18` → `ORB_DAMAGE: 25`
- `tryHit` 내 `hitCooldowns.set(enemyId, 0.5)` → `0.4`

**파일:** `weapons/Java.js`

---

## T7 — 적 이동 속도 너프

**문제:** syntax_error(80px/s), null_pointer(140px/s)가 플레이어(160px/s)를 거의 따라잡아 회피 불가.

**수정:** `entities/Enemy.js` ENEMY_STATS
- `syntax_error` speed: `80` → `65`
- `null_pointer` speed: `140` → `110`

seg_fault/heal_bug는 현재 속도 유지 (탱커/도주 역할 명확).

**파일:** `entities/Enemy.js`

---

## 구현 순서

T1 → T7 → T3 → T2 → T4 → T5 → T6

(버그 수정 우선, 밸런스 후순위)

---

## 테스트 기준

| 항목 | 합격 조건 |
|------|---------|
| T1 I-frame | 보스 접촉 후 1초간 데미지 없음 |
| T2 텍스트 | REVERSED CONTROLS가 HP바 아래 표시, 무기 목록 미겹침 |
| T3 타이밍 | 게임 시작 75초 전 input_mismatch 미등장 |
| T4 조준선 | C/C++ 조준선이 최근접 적 방향을 가리킴 |
| T5 Python | 0.6s 간격 발사, 데미지 18 적용 |
| T6 Java | 오브 접촉 시 25 데미지, 적용 간격 0.4s |
| T7 적 이속 | syntax_error·null_pointer 체감 속도 감소 확인 |
