# 현재 Phase 상태

> 이 파일은 세션 간 작업 연속성을 위해 항상 최신 상태로 유지한다.
> 작업 완료 시 반드시 업데이트할 것.
> 완료된 Phase 기록은 `docs/finished-phase.md` 에 보관한다.

---

## 현재 Phase: Phase 9 진행 중

**업데이트**: 2026-04-20

Phase 8 완료 / Phase 9 진행 중

---

## Phase 9 — 게임플레이 개선 + 밸런스

> 설계 문서: `phase_feedback/phase_9.md`
> 상태: 진행 중

### Cycle 1 — 수정

- [ ] T1: 공격 방향 개선 — 자동 에임 (가장 가까운 적 타겟팅)
- [x] T2: Input Mismatch / Infinite Loop 스폰 타이밍 수정 (웨이브 8+ 조건)
- [x] T3: 적 접촉 시 넉백 추가 (60~80px, 무적 시간 중 없음)
- [ ] T4: 'REVERSED CONTROLS' 텍스트 화면 상단 고정 (y: 60px)
- [ ] T5: Python 무기 밸런스 상향 (속도 +20%, 쿨타임 -10%)

### Cycle 2 — 추가

- [x] T1: WaveSystem.js minWave 필드 도입 (타입별 최소 등장 웨이브)

---

## 블로그 현황

### game-dev 시리즈

| 편 | 파일 | 사이클 | 상태 |
|----|------|--------|------|
| 1편 (기획) | `blog/draft-1-기획.md` | Phase 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 2편 (코어 개발) | `blog/draft-2-코어개발.md` | Cycle 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 3편 (적 시스템) | `blog/draft-3-적시스템.md` | Cycle 2 | ✅ 작성 완료 (퇴고 후 발행) |
| 4편 (무기 시스템) | `blog/draft-4-무기시스템.md` | Cycle 3 | ✅ 작성 완료 (퇴고 후 발행) |
| 5편 (이벤트·퀘스트) | `blog/draft-5-이벤트퀘스트.md` | Cycle 4 | ✅ 작성 완료 (퇴고 후 발행) |
| 6편 (보스전) | `blog/draft-6-보스전.md` | Cycle 5 | ✅ 작성 완료 (퇴고 후 발행) |
| 7편 (완성·통합) | `blog/draft-7-완성.md` | Cycle 6 | ✅ 작성 완료 (퇴고 후 발행) |
| 8편 (수정) | `blog/draft-8-수정.md` | Phase 3 Cycle 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 9편 (추가) | `blog/draft-9-추가.md` | Phase 3 Cycle 2 | ✅ 작성 완료 (퇴고 후 발행) |
| 10편 (CLAUDE.md 진화) | `blog/draft-10-CLAUDE.md진화.md` | Phase 3 Cycle 3 | ✅ 작성 완료 (퇴고 후 발행) |
| 11편 (Phase4 수정) | `blog/draft-11-수정.md` | Phase 4 Cycle 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 12편 (Phase4 추가) | `blog/draft-12-추가.md` | Phase 4 Cycle 2 | ✅ 작성 완료 (퇴고 후 발행) |
| 17편 (Phase7 수정) | `blog/game-dev/draft-17-수정3.md` | Phase 7 Cycle 1 | ✅ 작성 완료 (퇴고 후 발행) |
| 19편 (Phase8 추가) | `blog/game-dev/draft-19-추가3.md` | Phase 8 Cycle 2 | ✅ 작성 완료 (퇴고 후 발행) |

### prompt-diary 시리즈

| 편 | 파일 | 상태 |
|----|------|------|
| (미작성) | — | — |
