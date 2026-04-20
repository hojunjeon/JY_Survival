# 완료된 Phase 기록

> 완료된 Phase는 이 파일에 보관한다.
> `docs/phase-status.md` 에는 현재 진행 중인 Phase만 표시한다.

---

## Phase 1 — 브레인스토밍 + 기획 ✅

- [x] Superpowers: 브레인스토밍 완료
- [x] Gstack: 아키텍처 설계 완료
- [x] GSD: 전체 태스크 분할 완료
- [x] 코딩: Phase 1 skip
- [x] 문서화: `blog/draft-1-기획.md` 저장 완료

---

## Phase 2 — 코어 개발 ✅

### Cycle 1 — 코어 & 플레이어 ✅
- [x] `index.html` + Canvas 마운트
- [x] `core/Game.js` 게임 루프 (update/render)
- [x] `core/Input.js` WASD 키보드 입력
- [x] `entities/Player.js` 이동 + HP + 충돌박스
- [x] `core/Canvas.js` 렌더링 유틸
- [x] `sprites/PixelRenderer.js` 김지윤 32×32 스프라이트
- [x] TDD: 테스트 34개 전부 GREEN
- [x] 문서화: `blog/draft-2-코어개발.md` 저장 완료

### Cycle 2 — 적 시스템 ✅
- [x] `entities/Enemy.js` 버그 기반 클래스 4종 (SyntaxError/NullPointer/SegFault/HealBug)
- [x] `systems/WaveSystem.js` 시간 기반 스폰 (3초마다 3마리, 4방향 엣지)
- [x] `core/Collision.js` 충돌 감지 (플레이어 ↔ 적, AABB)
- [x] 회복 버그 + HP 아이템 드롭
- [x] TDD: 누적 테스트 64개 전부 GREEN
- [x] 문서화: `blog/draft-3-적시스템.md` 저장 완료

### Cycle 3 — 무기 시스템 ✅
- [x] `weapons/WeaponBase.js` + `entities/Projectile.js`
- [x] Python / C / Java 무기 구현
- [x] `ui/Menu.js` 무기 선택 화면
- [x] 충돌 감지 (투사체 ↔ 적)
- [x] TDD: 누적 테스트 122개 전부 GREEN
- [x] 문서화: `blog/draft-4-무기시스템.md` 저장 완료

### Cycle 4 — 이벤트·퀘스트 시스템 ✅
- [x] `systems/EventSystem.js` — E1/E3 시간 트리거, Q1 킬 카운팅
- [x] E1 이벤트 (IndentationError 15마리 처치 → cleared)
- [x] E3 이벤트 (EnvError 1마리 이상 + 60초 생존 → cleared)
- [x] Q1 퀘스트 (누적 100마리 → completed 알림)
- [x] 이벤트 전용 적 타입 2종 추가 (indentation_error, env_error)
- [x] TDD: 누적 테스트 166개 전부 GREEN
- [x] 문서화: `blog/draft-5-이벤트퀘스트.md` 저장 완료

### Cycle 5 — 보스전 ✅
- [x] `entities/Boss.js` 장선형 (2페이즈, 대사, 투사체 패턴)
- [x] 보스 등장 트리거 로직 (EventSystem 확장)
- [x] 스테이지 클리어 판정 + 보상 화면
- [x] TDD: 누적 테스트 207개 전부 GREEN
- [x] 문서화: `blog/draft-6-보스전.md` 저장 완료

### Cycle 6 — 완성 ✅
- [x] `systems/UpgradeSystem.js` — 강화 재화, 스탯 업그레이드, 무기 강화
- [x] `ui/HUD.js` — HP바, 킬카운트, 타이머, 이벤트 상태
- [x] `stages/Stage1.js` — 전체 시스템 통합 오케스트레이터
- [x] TDD: 누적 테스트 249개 전부 GREEN
- [x] 문서화: `blog/draft-7-완성.md` 저장 완료

---

## Phase 3 — MVP 개선 이터레이션 ✅

> 설계 문서: `docs/superpowers/specs/2026-04-15-phase3-improvement-design.md`

### Cycle 1 — 수정 ✅
- [x] 사망 처리 (게임 오버 화면 + 재시작)
- [x] 이벤트 UI 연결 (EventModal → main.js)
- [x] 피격 효과 (적 플래시 + 플레이어 비네팅)
- [x] 접촉 데미지 쿨다운 (0.5초 무적)
- [x] 배경 및 카메라 (월드 좌표계 + 카메라 추적)
- [x] TDD: 누적 테스트 262개 전부 GREEN
- [x] 문서화: `blog/draft-8-수정.md`

### Cycle 2 — 추가 ✅
- [x] 타이머 HUD 연결 (HUD.js → main.js)
- [x] 버그 픽셀 아이콘 6종 (PixelRenderer.js 확장)
- [x] TDD: 누적 테스트 268개 전부 GREEN
- [x] 문서화: `blog/draft-9-추가.md`

### Cycle 3 — 제안 ✅
- [x] Git commit 규칙 통일 → CLAUDE.md 반영 (`8fe90cd`, `5e08194`)
- [x] 블로그 포스팅 → `blog/draft-10-CLAUDE.md진화.md` 작성

---

## Phase 4 — 게임 완성도 개선 ✅

### Cycle 1 — 수정 ✅
- [x] 맵 범위 벗어나면 공격 안 나가는 버그 수정 (worldBounds 적용)
- [x] 이벤트 알림은 뜨지만 실제 이벤트 실행 안 되는 버그 수정
- [x] 사망 시 화면 정지 수정 (R키 재시작 지원)
- [x] 이벤트 진행 상황 직관적 표시
- [x] TDD: 누적 268개 GREEN
- [x] 문서화: `blog/draft-11-수정.md`

### Cycle 2 — 추가 ✅
- [x] 게임 시작 화면 개선 (게임 설명 + 조작법 + 스토리 + 시작 버튼)
- [x] E1: 박진우 등장 이벤트 연출
- [x] E3: 이한정 등장 이벤트 연출
- [x] TDD: 누적 273개 GREEN
- [x] 문서화: `blog/draft-12-추가.md`

### Cycle 3 — 제안 ✅ (스킵)

---

## Phase 5 — 게임 완성도 2차 개선 ✅

> 설계 문서: `docs/superpowers/specs/2026-04-16-phase5-design.md`

### Cycle 1 — 수정 ✅
- [x] 맵 중간 버그 스폰 오류 (WaveSystem 카메라 기반 스폰) — `00391d2`
- [x] 게임 오버 화면 루프 + 재시작 잔상 제거 — `d38da64`, `409c4cb`
- [x] 이벤트 대화창 크기 확장 + 레이아웃 개선 — `af54719`
- [x] E3 클리어 무기 지급 버그 (보상 무기 시스템 연동) — `768c841`, `0c5a093`
- [x] TDD: 누적 테스트 293개 GREEN
- [x] 문서화: `blog/game-dev/draft-13-수정.md`

### Cycle 2 — 추가 ✅
- [x] 이벤트 화면 구성 변경 (560×360 + NPC 스프라이트 + 새 레이아웃) — `47dca53`
- [x] 장선형 보스 픽셀 스프라이트 + NPC 픽셀 스프라이트 박진우·이한정 (32×32) — `9c9bdce`
- [x] 기본 버그 체력 조정 (2/3/4대 기준) — `9f9dfa8`
- [x] 이벤트 몹 특수 공격 + 소환 수 제한 — `2a9d3d3`
- [x] 보상 무기 5종 구현 (Git/SQL/JavaScript/Django/Linux) — `768c841`
- [x] 몬스터 피격 색상 변화 효과 — `1eea67e`
- [x] 보상 무기 지급 시스템 — main.js 연동
- [x] Boss 스프라이트 렌더 적용 + 2페이즈 빨간 오버레이 + 피격 플래시 — `8a502d5`
- [x] TDD: 누적 테스트 308개 GREEN
- [x] 문서화: `blog/game-dev/draft-14-추가.md`

### Cycle 3 — 제안 ✅ (스킵)

---

## Phase 6 — 게임 완성도 3차 개선 ✅

> 설계 문서: `phase_feedback/phase_6.md`

### Cycle 1 — 수정 ✅
- [x] T1: 이벤트 화면 글자 배치 — `bd2d7fb`
- [x] T2: 몬스터 피격 반짝임 범위 수정
- [x] T3: 이벤트 화면 픽셀 이미지 상반신만 표시
- [x] T4: E3→E2 개명 + 무한 스폰 + 30초 생존 미션으로 교체
- [x] T5: 보스 폭주 2페이즈 붉은 사각형 버그 수정

### Cycle 2 — 추가 ✅
- [x] T6: 무기 8종 전면 재구현 (Python/C/Java/Git/SQL/JavaScript/Django/Linux)
- [x] T7: Screen Shake — 모든 적 피격 시 화면 미세 흔들림
- [x] T8: 처치/피격 텍스트 이펙트 ("Bug Fixed!" 등 플로팅 텍스트)
- [x] T9: 플레이어 아웃라인 + 보스 저체력 강조 연출
- [x] TDD: 누적 테스트 308개 GREEN
- [x] 문서화: `blog/game-dev/draft-15-수정2.md`, `blog/game-dev/draft-16-추가2.md`

### Cycle 3 — 제안 ✅ (스킵)

---

## Phase 7 — 게임 완성도 4차 개선 ✅

> 설계 문서: `phase_feedback/phase_7.md`

### Cycle 1 — 수정 ✅
- [x] T1: 재시작 잔상 버그 수정 (Game.clearEntities() + startGame 초기화) — `f33fce3`, `119fe60`
- [x] T2: Enemy/Boss 피격 플래시 drawSpriteTinted로 교체 — `2b701d0`
- [x] 문서화: `blog/game-dev/draft-17-수정3.md`

### Cycle 2 — 추가 ✅ (스킵)
### Cycle 3 — 제안 ✅ (스킵)

---

## Phase 8 — 무기 기믹 + 신규 몬스터 ✅

> 설계 문서: `phase_feedback/phase_8.md`
> 구현 계획: `docs/superpowers/plans/2026-04-18-phase8-cycle1-수정.md`

### Cycle 1 — 수정 (무기 기믹 재구현 6종) ✅
- [x] T1: Python — Chain Lightning (Projectile 체이닝 + 초록 뱀 궤적) — `1157ec7`
- [x] T2: C/C++ — Railgun (조준선 + 빔 이펙트 + Screen Shake) — `ef7d7b1`
- [x] T3: Java — GC Blackhole (5초마다 블랙홀 소환 + 흡입 + 폭발) — `c550130`
- [x] T4: Git — Branch & Merge (분신 저장 → 3초 후 라인 데미지) — `3e672d4`
- [x] T5: SQL — DROP TABLE (표적 → 낙하 블록 → 착지 폭발) — `7c32481`
- [x] T6: JavaScript — Tornado (확장 토네이도 범위 데미지) — `9754ed6`
- [x] 문서화: `blog/game-dev/draft-18-수정3.md`

### Cycle 2 — 추가 (신규 몬스터 5종) ✅
- [x] T1: Race Condition — 샴쌍둥이 버그 (동시 처치 필요) — `071fe9c`
- [x] T2: Memory Leak — 거대해지는 슬라임 (크기 증가 + 가비지 장판) — `d47a4b3`
- [x] T3: Infinite Loop — 가두리 양식러 (코드 벽 생성) — `ffa3246`
- [x] T4: Input Mismatch — 컨트롤 반전술사 (3초 방향키 반전) — `a0dd829`
- [x] T5: Library Dependency — 패키지 버퍼 (주변 적 방어력 버프) — `0672eba`
- [x] TDD: 누적 테스트 340개 (327 GREEN, 13 pre-existing failures)
- [x] 문서화: `blog/game-dev/draft-19-추가3.md`

### Cycle 3 — 제안 ✅ (게임 관련 항목 → phase_9.md에 반영)
