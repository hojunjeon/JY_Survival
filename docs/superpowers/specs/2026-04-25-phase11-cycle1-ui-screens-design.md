# Spec: Phase 11 Cycle 1 — 미구현 화면 7개 Canvas 오버레이

**날짜:** 2026-04-25
**Phase:** 11 / Cycle 1
**분류:** fix
**참조 예제:** `examples/total_ui/Debug Survival - Terminal UI-print.html`, `phase11-cycle1-ui-screens.html`

---

## 목표

레퍼런스 HTML에 존재하지만 현재 게임에 미구현된 7개 화면을 Canvas 오버레이로 추가한다.
게임 로직은 유지하고 시각 표현과 상태 전환만 추가한다.

---

## gameState enum 확장

`main.js`의 `gameState` 변수에 다음 상태 추가:

| 상태 | 진입 조건 | 탈출 조건 |
|------|-----------|-----------|
| `'weapon-select'` | 게임 시작 / StageClear 후 | 무기 선택 확인 버튼 클릭 |
| `'playing'` | weapon-select 확인 | 이벤트 트리거 / 보스 등장 / Q1 완료 / 사망 / 스테이지 클리어 |
| `'event-toast'` | 시간 기반 이벤트 트리거 | 도와주기 / 무시하기 버튼 클릭 |
| `'event-modal'` | event-toast에서 도와주기 선택 | 계속 플레이 / 일시정지 해제 버튼 |
| `'stat-upgrade'` | Q1(버그 100마리) 달성 | 스탯 선택 클릭 |
| `'weapon-get'` | 이벤트 E2 완료 보상 | 장착 / 버리기 버튼 클릭 |
| `'boss-intro'` | 보스 등장 조건 충족 | 2초 자동 전환 → `'playing'` |
| `'boss-phase2'` | 보스 HP 50% 이하 | 2초 자동 전환 → `'playing'` |
| `'game-over'` | 플레이어 HP 0 | restart / exit 버튼 클릭 |
| `'stage-clear'` | 보스 처치 | 다음 스테이지 버튼 → `'weapon-select'` |

---

## 색상 팔레트 추가

`ui/HUD.js`의 `HUD.COLORS`에 병합 (VSCode 테마 토큰):

```js
// 추가 토큰
teal:       '#4ec9b0',
red:        '#f44747',
orange:     '#ce9178',
yellow:     '#dcdcaa',
blue:       '#9cdcfe',
green:      '#b5cea8',
statusBar:  '#007acc',
sidebar:    '#252526',
panel:      '#2d2d2d',
```

---

## Canvas 버튼 hitTest 아키텍처

- `HUD.js`의 각 draw 메서드는 클릭 가능한 버튼 영역을 `hitboxes` 배열로 반환
- `main.js` `mousedown` 핸들러가 `hud.getHitboxes()` 호출 후 좌표 비교
- hitbox 구조: `{ x, y, w, h, action: 'confirm' | 'skip' | 'restart' | ... }`

---

## 화면별 구현 스펙

### WeaponSelect
- 좌측 사이드바: weapons/ 파일트리 (Python.py · C_Cpp.c · Java.class)
- 우측: 선택 무기 코드 뷰 (import문 + 주석 + new 호출)
- 하단: 선택 확인 버튼 (hitbox)
- 키보드: ↑↓ 무기 이동, Enter 선택

### EventToast
- 반투명 오버레이 위에 동기 캐릭터 카드
- 캐릭터 이름 + 대사 + 이벤트 버그 타입 표시
- 버튼 2개: "무시하기" (→ playing), "도와주기" (→ event-modal)

### EventModal
- 이벤트 미션 진행 상황 (kill count / target)
- progress bar
- 보상 미리보기 (강화 재화 수량)
- 버튼: "계속 플레이" (→ playing)

### StatUpgrade
- 3개 스탯 옵션 카드 (moveSpeed +15% / attackSpeed +20% / damageMulti +25%)
- 마우스 hover → 하이라이트, 클릭 → 선택 후 playing 복귀

### WeaponGet
- 획득 무기 이름 + 설명 + 코드 스니펫
- 버튼: "버리기" / "장착 (슬롯 N)"

### BossIntro
- 빨간 오버레이 + 보스 HP 바 (100%)
- 보스 픽셀 스프라이트 + 대사
- 스탯 표 (HP/공격/추적)
- 2초 후 자동으로 playing 전환

### BossPhase2
- 오렌지 오버레이 + 보스 HP 바 (~50%)
- 격분 대사
- PHASE 2 변경 사항 텍스트
- 2초 후 자동 전환

### GameOver
- 스택 트레이스 텍스트
- 런 요약 (생존시간 / 처치수 / 최대콤보 / 도달웨이브)
- 버튼: "exit" / "game.restart()"

### StageClear
- git commit 메시지 형식
- 클리어 로그 (보스 처치 ✓ / 퀘스트 ✓ / 보상 목록)
- 통계 표 (처치수 / 시간 / 재화)
- 버튼: "git push origin Stage2 →" (→ weapon-select)

---

## 구현 범위 제외

- Canvas DOM 레이어 전환 없음 (기존 Canvas 오버레이 유지)
- 애니메이션 트랜지션 효과 없음 (즉시 상태 전환)
- 타자 연출 없음 (Phase 11 Cycle 2 이벤트 UI와 별개)
