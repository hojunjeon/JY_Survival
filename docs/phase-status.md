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

---

## 다음 작업: Cycle 1 — 코어 & 플레이어

Phase 2 진입점: GSD (태스크 선택)

### Cycle 1 태스크 ✅
- [x] `index.html` + Canvas 마운트
- [x] `core/Game.js` 게임 루프 (update/render)
- [x] `core/Input.js` WASD 키보드 입력
- [x] `entities/Player.js` 이동 + HP + 충돌박스
- [x] `core/Canvas.js` 렌더링 유틸
- [x] `sprites/PixelRenderer.js` 김지윤 32×32 스프라이트
- [x] TDD: 테스트 34개 전부 GREEN

### Cycle 2 태스크 (미완료)
- [ ] `entities/Enemy.js` 버그 기반 클래스 + 3종
- [ ] `systems/WaveSystem.js` 시간 기반 스폰
- [ ] 충돌 감지 (플레이어 ↔ 적)
- [ ] 회복 버그 + HP 아이템 드롭

### Cycle 3 태스크 (미완료)
- [ ] `weapons/WeaponBase.js` + `entities/Projectile.js`
- [ ] Python / C / Java 무기 구현
- [ ] `ui/Menu.js` 무기 선택 화면
- [ ] 충돌 감지 (투사체 ↔ 적)

### Cycle 4 태스크 (미완료)
- [ ] `systems/EventSystem.js`
- [ ] E1 이벤트 (IndentationError 웨이브)
- [ ] E3 이벤트 (EnvError + 60초 생존)
- [ ] Q1 퀘스트 (100마리 + 스탯 업그레이드)

### Cycle 5 태스크 (미완료)
- [ ] `entities/Boss.js` 장선형
- [ ] 보스 등장 트리거 로직
- [ ] 스테이지 클리어 판정 + 보상 화면

### Cycle 6 태스크 (미완료)
- [ ] `systems/UpgradeSystem.js`
- [ ] `ui/HUD.js`
- [ ] `stages/Stage1.js` 전체 통합 테스트

### Cycle 7 — 문서화 (미완료)
- [ ] `blog/draft-2-코어개발.md`

---

## 블로그 초안 현황

| 편 | 파일 | 상태 |
|----|------|------|
| 1편 (기획) | `blog/draft-1-기획.md` | ✅ 작성 완료 (퇴고 후 발행) |
| 2편 (코어 개발) | `blog/draft-2-코어개발.md` | ⏳ Cycle 1 완료 후 작성 |
