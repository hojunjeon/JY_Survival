# Workflow

## Overview

Phase / Cycle / Step 3-Layer 파이프라인. 한 Cycle은 Step 0~5를 1회 통과한다.

**기본 규칙:** 출력 파일이 존재하는 Step은 스킵한다 → 세션 끊김 시 자동 재개.

## When to Use

- 사용자가 게임 개발 작업을 시작하거나 이어갈 때
- `phase-status.md` 에 활성 Cycle 있고 미완 Step 있을 때
- Phase 진입 직후 Cycle 분할이 필요할 때

## Process

### Step 0 — Brainstorm (메인 에이전트가 직접)

**스킬:** `superpowers:brainstorming`

**두 모드:**
- **Phase 진입 모드:** `phase_feedback/phase_N.md` 읽고 사용자와 Cycle 분할 합의 → Cycle별 spec 파일 N개 작성
- **단발 모드:** 사용자 즉흥 요청 → 단일 Cycle용 spec 1개 작성

**출력:** `docs/superpowers/specs/{date}-{name}.md`

### Step 1 — Plan (서브에이전트)

- subagent_type: `Plan`
- 스킬: `superpowers:writing-plans`
- 입력: spec 경로
- 출력: `docs/superpowers/plans/{date}-{name}.md`

### Step 2 — Implement (서브에이전트)

**표준 모드:**
- subagent_type: `general-purpose`
- 스킬: `superpowers:executing-plans`
- 입력: plan 경로
- 출력: 코드 + Task별 commit
- 내부 반복: plan의 각 Task (`[ ]`)를 순차 실행, `[~]` 는 스킵

**병렬 구현 모드 (독립 task ≥ 3개일 때 선택):**

조건: 각 task가 수정하는 파일이 서로 겹치지 않을 것 (공유 파일 task는 순차 처리).

절차:
1. plan에서 각 task의 수정 파일 목록 확인 → 독립 task / 공유 파일 task 분류
2. git worktree 생성 (`superpowers:using-git-worktrees`)
3. 독립 task: `Agent(model="haiku", run_in_background=True)` 로 병렬 dispatch
4. 공유 파일 task: 완료 후 `Agent(model="haiku")` 순차 dispatch
5. 전체 완료 후 Step 3 (Review) 진행 — 메인 세션 Sonnet이 직접 처리

모델 역할: 메인·Plan·Review·QA = Sonnet / 구현 에이전트 = Haiku (Agent tool `model` 파라미터로 지정)

### Step 3 — Review (서브에이전트)

- subagent_type: `superpowers:code-reviewer`
- 스킬: `superpowers:requesting-code-review`
- 입력: plan + diff
- 출력: review 리포트 (pass/fail + 사유 + target step)

**복귀 규칙:**
- fail (spec 누락 / 잘못된 spec) → Step 1 재디스패치
- fail (코드 결함만) → Step 2 재디스패치
- 루프 한도: **최대 3회**, 초과 시 사용자 에스컬레이션

### Step 4 — Test (서브에이전트)

- subagent_type: `general-purpose`
- 스킬: `gstack:qa`
- 입력: 실행 게임
- 출력: 스크린샷 + 버그 리포트

**복귀 규칙:**
- fail (런타임 버그) → Step 2 재디스패치
- 루프 한도: **최대 2회**, 초과 시 사용자 에스컬레이션

### Step 5 — Document (서브에이전트)

- subagent_type: `general-purpose`
- 입력 (필수):
  - spec 경로
  - plan 경로
  - 커밋 해시 범위 (Step 2 시작~완료)
  - dev-log 경로 (`.claude/dev-log/{date}.log`)
  - 톤 (`fix` | `add`)
  - 저장 경로 (`blog/game-dev/draft-{N}-{name}.md`)
- 출력: 블로그 초안 + (선택) prompt-diary 일기

## Skip Rules

| 파일 상태 | 시작 Step |
|-----------|----------|
| spec 없음 | Step 0 |
| spec ✅ / plan 없음 | Step 1 |
| spec ✅ / plan ✅ / 미완 Task 있음 | Step 2 (해당 Task부터) |
| 모든 Task 완료 / review 없음 | Step 3 |
| review ✅ / QA 없음 | Step 4 |
| QA ✅ / draft 없음 | Step 5 |
| draft ✅ | Cycle 완료 |

## Cycle Selection

| 상황 | 방법 |
|------|------|
| 큰 묶음을 작은 단위로 | Cycle 분할 (Step 0에서 N개로) |
| Cycle 내 일부 Task만 | plan 파일 편집 (`[~]` 마크) |
| 진행 중 멈추고 나중에 | 일시정지 + 미완 Task를 새 Cycle로 분리 |

## Phase 진입

1. `phase_feedback/phase_N.md` 존재 확인
2. 메인 에이전트가 Step 0 (Phase 진입 모드)
3. 사용자와 Cycle 분할 합의
4. Cycle별 spec 파일 작성 + `phase-status.md` 에 Cycle 목록 등록
5. 첫 Cycle부터 Step 1 진행

## Cycle 완료 처리

1. `phase-status.md` 활성 Cycle 섹션 갱신 (체크 표시)
2. 다음 Cycle 진행 또는 Phase 완료 처리
3. Phase 완료 시: `docs/finished-phase.md` 로 이전, `phase-status.md` 한 줄 요약 교체

## 메타 작업 처리

CLAUDE.md 수정, 워크플로우 변경 같은 메타 작업은 **이 파이프라인 밖에서** 즉시 처리한다.
- spec/plan/draft 작성 안 함
- 직접 대화로 진행
- Cycle로 등록하지 않음
