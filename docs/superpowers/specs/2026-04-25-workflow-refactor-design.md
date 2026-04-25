# 워크플로우 리팩터링 설계 — Step 0~5 파이프라인 + CLAUDE.md 슬림화

**날짜**: 2026-04-25
**범위**: 프로젝트 메타 워크플로우. 게임 코드 변경 없음.
**유형**: 메타 제안 (파이프라인 밖 단발 작업)

---

## 1. 동기

### 현재 문제
- `CLAUDE.md` 168줄이 매 세션 자동 로드되어 토큰 항상 점유
- 사이클 진입/재진입 판단이 4단 로직(plans 존재 여부 × phase-status 미완료 여부)으로 복잡
- "수정 → 추가 → 제안" 순서 강제로 유연성 부족
- 세션 토큰 한도로 끊겼을 때 다음 세션이 어디서 이어가야 하는지 사람 의존

### 목표
1. **세션 로드 토큰 최소화** — CLAUDE.md 25줄 이내
2. **재시작 안정성** — 시스템 수준 보장(훅 + 파일 마커)
3. **워크플로우 가독성** — 단계 책임이 한눈에 보이는 파이프라인
4. **블로그 산출물 누락 방지** — 파이프라인 안에 명시

---

## 2. 새 구조 — 3-Layer 모델

| Layer | 단위 | 산출물 |
|-------|------|--------|
| Phase | 마일스톤 | phase-status.md 한 섹션 |
| Cycle | 응집된 변경 묶음 | spec 1 + plan 1 + 코드 + 리뷰/QA 리포트 + 블로그 초안 1편 |
| Step | Cycle 내부 단계 | Step별 파일 또는 마커 |
| Task | Step 2 내부 반복 | 단일 commit |

**핵심:** 파이프라인은 **Cycle 단위**로 1회 통과. Task는 Step 2의 내부 반복.

---

## 3. Step 파이프라인

| Step | 역할 | 실행 주체 | 사용 스킬 | 입력 | 출력 |
|------|------|----------|----------|------|------|
| 0. Brainstorm | 기획 + Cycle 분할 + spec 작성 | **메인 에이전트(직접)** | `superpowers:brainstorming` | phase_feedback 또는 사용자 요청 | `specs/{date}-{name}.md` × N |
| 1. Plan | Task 분할 | Plan 서브에이전트 | `superpowers:writing-plans` | spec | `plans/{date}-{name}.md` |
| 2. Implement | 코딩 | general-purpose 서브에이전트 | `superpowers:executing-plans` | plan | 코드 + Task별 commit |
| 3. Review | 정적 평가 | code-reviewer 서브에이전트 | `superpowers:requesting-code-review` | plan + diff | review 리포트 (pass/fail+사유) |
| 4. Test | 동적 검증 | general-purpose 서브에이전트 | `gstack:qa` | 실행 게임 | 스크린샷 + 버그 리포트 |
| 5. Document | 블로그 초안 | general-purpose 서브에이전트 | (직접 작성) | dev-log + diff + spec/plan | `blog/game-dev/draft-N-{name}.md` |

### Step 0의 두 가지 모드

| 모드 | 트리거 | 동작 |
|------|--------|------|
| Phase 진입 모드 | `phase_feedback/phase_N.md` 있음 | 피드백 분석 → 사용자와 Cycle 분할 합의 → Cycle별 spec N개 작성 |
| 단발 모드 | 사용자가 즉흥적 요청 | 단일 Cycle용 spec 1개 작성 |

### Step 5 입력 명세
서브에이전트에게 전달할 필수 인자:
- spec 경로
- plan 경로
- 커밋 해시 범위 (Step 2 시작 ~ 완료)
- dev-log 파일 경로 (`.claude/dev-log/{date}.log`)
- 블로그 톤 (`fix` | `add`)
- 저장 경로 (`blog/game-dev/draft-{N}-{name}.md`)

---

## 4. 스킵 규칙 (재진입)

**규칙: "출력 파일이 이미 존재하면 그 Step은 스킵한다."**

| 파일 상태 | 시작 Step |
|-----------|----------|
| spec 없음 | Step 0 |
| spec ✅ / plan 없음 | Step 1 |
| spec ✅ / plan ✅ / 미완료 Task 있음 | Step 2 (해당 Task부터) |
| 모든 Task 완료 / review 없음 | Step 3 |
| review ✅ / QA 없음 | Step 4 |
| QA ✅ / draft 없음 | Step 5 |
| draft ✅ | Cycle 완료 |

세션 끊김 시 다음 세션은 위 표만 보고 재개.

---

## 5. 루프 / 에스컬레이션

### Step 3 루프 (최대 3회)
- **fail (spec 누락 / 잘못된 spec)** → Step 1로 (plan 재작성)
- **fail (코드 결함만)** → Step 2로 (재구현)
- **3회 fail** → 사용자 보고 + 일시정지

### Step 4 루프 (최대 2회)
- **fail (런타임 버그)** → Step 2로
- **2회 fail** → 사용자 보고

### 루프 카운터 위치
`phase-status.md` 활성 Cycle 섹션의 `loop` 필드.

---

## 6. Cycle 선택 메커니즘

| 시나리오 | 방법 |
|----------|------|
| Phase 안에 큰 덩어리를 작은 단위로 진행 | **Cycle 분할** — Step 0에서 N개 Cycle로 나눠 등록 |
| Cycle 내 일부 Task만 이번에 진행 | **plan 파일 편집** — `[~]` 마크로 스킵 표시 |
| 진행 중 멈추고 나머지는 나중에 | **일시정지 + 분할** — 미완료 Task를 새 Cycle로 분리 |

### plan 파일 체크박스 규약
- `[ ]` 실행 대상
- `[x]` 완료
- `[~]` 스킵 (Step 2/3/4 모두 무시)

---

## 7. 파일 구조

### CLAUDE.md (~25줄)

```markdown
# JY Survival

## 목적
Superpowers + Gstack 워크플로우를 게임 토이 프로젝트로 검증, Velog 기록.

## 세션 시작
1. docs/phase-status.md 확인 (현재 Phase / 활성 Cycle / 다음 Step)
2. 활성 Cycle 있음 → /workflow 호출 (이어서 진행)
3. 없음 → 다음 Cycle 무엇으로 할지 사용자에게 확인

## 스킬 라우팅
- 개발 작업 → /workflow
- 단발 QA → /qa
- 이벤트 일기 → /prompt-diary

## 참조 (필요시 읽기)
- rules/blog.md — 블로그 초안 규칙
- rules/git.md — 커밋 규칙
- design.md — 게임 설계 확정본
```

### rules/ (신규)

| 파일 | 내용 |
|------|------|
| `rules/blog.md` | game-dev / prompt-diary 시리즈 작성 규칙 (현 CLAUDE.md 블로그 섹션 이전) |
| `rules/git.md` | 태스크 단위 커밋 규칙 (현 CLAUDE.md git 섹션 이전) |

### `.claude/skills/workflow/SKILL.md` (신규, 핵심)

내용:
- Step 0~5 정의 + 디스패치 템플릿
- 스킵 규칙
- 루프/에스컬레이션 로직
- subagent_type 매핑
- Cycle 선택 메커니즘 적용 방법

### `.claude/hooks/session-status.sh` (신규)

`UserPromptSubmit` 훅에서 호출.
`docs/phase-status.md` 파싱 → 1줄 상태 추출 → stdout 출력.

예시 출력: `[상태] Phase 11 / Cycle: event-ui-emotional / Step 2 (T2 진행)`

### `.claude/settings.json` (수정)

`UserPromptSubmit` 훅에 `session-status.sh` 추가.

---

## 8. phase-status.md 새 포맷

```markdown
# 현재 Phase 상태

## 현재 Phase: 11

### 활성 Cycle: event-ui-emotional (fix)
- spec: specs/2026-04-25-event-ui-emotional.md ✅
- plan: plans/2026-04-25-event-ui-emotional.md ✅
- step: 2 (T1 ✅ / T2 진행 / T3 대기)
- loop: 0/3

### Cycle 목록
- [x] event-ui-emotional (fix) ← 진행 중
- [ ] weapon-levelup-fx (fix)
- [ ] weapon-synergy (add)
- [ ] stage-expansion (add)

---
(이하 Phase 12 후보, 블로그 현황 등 기존 구조 유지)
```

---

## 9. 명명 규칙

- Cycle 파일명: `{date}-{name}.md` (예: `2026-04-25-event-ui-emotional.md`)
- Cycle 이름: 영문 kebab-case, 한 가지 응집 목표를 표현
- type(fix/add)은 메타데이터로만 phase-status.md에 표기 (파일명 미포함)

---

## 10. 메타 작업 처리

CLAUDE.md 수정, 워크플로우 변경 같은 메타 작업은 **파이프라인 밖에서** 즉시 처리.
- 별도 spec/plan/draft 작성 안 함
- 직접 대화로 진행 (오늘 이 작업이 그 예시)
- 사이클로 등록하지 않음

---

## 11. 기존 파일 마이그레이션 정책

**기본 방침: 보존 + Phase 11부터 새 규칙 적용**

| 대상 | 처리 |
|------|------|
| 기존 `docs/superpowers/specs/`, `plans/` (Phase 10 이하) | 그대로 보존, 손대지 않음 |
| 기존 `phase_feedback/` | 그대로 보존 |
| Phase 11 이후 신규 작업 | 새 명명 규칙·새 포맷 적용 |
| 기존 CLAUDE.md 내용 | rules/ 와 workflow 스킬로 이전, 원본은 git history에 남음 |

---

## 12. Subagent type 매핑

| Step | subagent_type |
|------|--------------|
| 0 (메인 직접) | — |
| 1 Plan | `Plan` |
| 2 Implement | `general-purpose` |
| 3 Review | `superpowers:code-reviewer` |
| 4 Test | `general-purpose` |
| 5 Document | `general-purpose` |

---

## 13. 변경 영향도

### 추가
- `rules/blog.md`, `rules/git.md`
- `.claude/skills/workflow/SKILL.md`
- `.claude/hooks/session-status.sh`

### 수정
- `CLAUDE.md` (168줄 → ~25줄)
- `.claude/settings.json` (훅 추가)
- `docs/phase-status.md` (신 포맷으로 갱신, Phase 11부터)

### 삭제 없음
- 기존 specs/plans/phase_feedback 모두 보존

---

## 14. 검증 기준

이 리팩터링은 코드 변경이 아니므로 Step 3/4 미적용. 대신 **수동 검증**:

| 항목 | 확인 방법 |
|------|----------|
| 세션 시작 시 토큰 절감 | 새 세션에서 컨텍스트 사이즈 비교 |
| 훅 동작 | 새 세션 시 phase-status 1줄 자동 주입 확인 |
| /workflow 스킬 호출 가능 | 다음 세션에서 Phase 11 첫 Cycle 진행 시 검증 |
| 재시작 안정성 | 의도적으로 Step 2 도중 종료 → 재시작 시 스킵 규칙대로 재개되는지 |

---

## 15. 후속 작업

이 spec 승인 후 `superpowers:writing-plans` 로 구현 계획 작성 → 별도 Cycle처럼 처리하지 않고 메타 작업으로 즉시 실행.

구현 순서 초안:
1. `rules/blog.md`, `rules/git.md` 신규 작성
2. `.claude/skills/workflow/SKILL.md` 신규 작성
3. `.claude/hooks/session-status.sh` 작성 + `settings.json` 등록
4. `CLAUDE.md` 슬림화
5. `docs/phase-status.md` 신 포맷으로 갱신
6. 새 세션에서 검증 (재시작 안정성)
