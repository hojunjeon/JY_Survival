# 현재 Phase 상태

> 이 파일은 세션 간 작업 연속성을 위해 항상 최신 상태로 유지한다.
> 작업 완료 시 반드시 업데이트할 것.

---

## 현재 Phase: Phase 2 (기능 개발)

**업데이트**: 2026-04-14

---

## 완료된 사이클

### Phase 1 — 브레인스토밍 + 기획 ✅
- [x] Superpowers: 브레인스토밍 완료
- [x] Gstack: 아키텍처 설계 완료
- [x] GSD: 전체 태스크 분할 완료
- [x] 코딩: Phase 1 skip
- [x] 문서화: `blog/draft-1-기획.md` 저장 완료

### Cycle 1 — 코어 & 플레이어 ✅
- [x] `index.html` + Canvas 마운트
- [x] `core/Game.js` 게임 루프 (update/render)
- [x] `core/Input.js` WASD 키보드 입력
- [x] `entities/Player.js` 이동 + HP + 충돌박스
- [x] `core/Canvas.js` 렌더링 유틸
- [x] `sprites/PixelRenderer.js` 김지윤 32×32 스프라이트
- [x] TDD: 테스트 34개 전부 GREEN
- [x] 문서화: `blog/draft-2-코어개발.md` 저장 완료

---

## 다음 작업: Cycle 6 — 완성 (업그레이드·HUD·통합)

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

### Cycle 6 태스크 (미완료)
- [ ] `systems/UpgradeSystem.js`
- [ ] `ui/HUD.js`
- [ ] `stages/Stage1.js` 전체 통합 테스트
- [ ] 문서화: `blog/draft-7-완성.md`

---

## 블로그 초안 현황

| 편 | 파일 | 사이클 | 상태 |
|----|------|--------|------|
| 1편 (기획) | `blog/draft-1-기획.md` | Phase 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 2편 (코어 개발) | `blog/draft-2-코어개발.md` | Cycle 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 3편 (적 시스템) | `blog/draft-3-적시스템.md` | Cycle 2 | ✅ 작성 완료 (퇴고 후 발행) |
| 4편 (무기 시스템) | `blog/draft-4-무기시스템.md` | Cycle 3 | ✅ 작성 완료 (퇴고 후 발행) |
| 5편 (이벤트·퀘스트) | `blog/draft-5-이벤트퀘스트.md` | Cycle 4 | ✅ 작성 완료 (퇴고 후 발행) |
| 6편 (보스전) | `blog/draft-6-보스전.md` | Cycle 5 | ✅ 작성 완료 (퇴고 후 발행) |
| 7편 (완성·통합) | `blog/draft-7-완성.md` | Cycle 6 | ⏳ Cycle 6 완료 후 작성 |
