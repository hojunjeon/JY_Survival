# Workflow

## Overview

Phase / Cycle / Step 구조. 한 Cycle은 Step 0~4를 1회 통과한다.
각 Step은 서브에이전트에 위임 — 메인 에이전트 컨텍스트는 사용자 대화에 집중.

## When to Use

- 사용자가 게임 개발 작업을 시작하거나 이어갈 때
- Phase 진입 직후 Cycle 분할이 필요할 때

---

## Process

### Step 0 — Brainstorm (메인 에이전트 직접)

**스킬:** `superpowers:brainstorming`

**두 모드:**
- **Phase 진입 모드:** `phase_feedback/phase_N.md` 읽고 사용자와 Cycle 분할 합의 → Cycle별 spec 파일 N개 작성 → Cycle 목록 요약 출력 → 사용자 확인 후 첫 Cycle 진행
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

**병렬 구현 모드 (opt-in):**

Plan 서브에이전트가 독립 task 3개 이상을 식별하면 제안, 또는 사용자가 명시 요청 시 진행.
조건: 각 task가 수정하는 파일이 서로 겹치지 않을 것.

절차:
1. 독립 task / 공유 파일 task 분류
2. git worktree 생성 (`superpowers:using-git-worktrees`)
3. 독립 task: `Agent(model="haiku", run_in_background=True)` 병렬 dispatch
4. 공유 파일 task: 완료 후 `Agent(model="haiku")` 순차 dispatch

모델 역할: 메인·Plan·Review·Document = Sonnet / 구현 에이전트 = Haiku

### Step 3 — Review (서브에이전트)

- subagent_type: `superpowers:code-reviewer`
- 스킬: `superpowers:requesting-code-review`
- 입력: plan + diff
- 출력: review 리포트 (pass/fail + 사유)

**복귀 규칙:**
- fail → 메인 에이전트가 원인 한 줄 요약 출력 → Step 2 1회 재디스패치
- 재시도 후도 fail → 사용자 에스컬레이션: "Review 2회 연속 fail. [원인] 어떻게 할까요?"

### Step 4 — Document (서브에이전트, 선택)

Cycle 완료 후 메인 에이전트가 확인: "블로그 초안 작성할까요?"
- 사용자 "응" → 서브에이전트 dispatch
- 사용자 "아니" 또는 무응답 → 스킵

서브에이전트 입력 (필수):
- spec 경로, plan 경로
- 커밋 해시 범위
- 톤 (`fix` | `add`)
- 저장 경로 (`blog/game-dev/draft-{N}-{name}.md`)

---

## Fast Path (소규모 작업)

**조건:** 수정 파일 1~2개, 30분 이내 예상 작업. 사용자가 "빠르게 해줘" 요청 시도 해당.

- 메인 에이전트가 직접 구현 (서브에이전트 없음)
- spec / plan / blog 없음
- phase-status.md 업데이트 없음

**버그 픽스:** Fast Path와 동일하게 처리.
- 완료 후 phase-status.md에 한 줄 메모만 추가: `"Cycle N.N — 버그 픽스 ✅ (내용)"`

---

## phase-status.md 업데이트 규칙

메인 에이전트만 업데이트. 서브에이전트는 건드리지 않음.

| 시점 | 변경 |
|------|------|
| Cycle 시작 | `[ ]` → `[~]` |
| Cycle 완료 | `[~]` → `[x]` |

---

## Phase 진입

1. `phase_feedback/phase_N.md` 존재 확인
2. Step 0 (Phase 진입 모드) — Cycle 분할 합의
3. Cycle별 spec 작성 + phase-status.md Cycle 목록 등록
4. Cycle 목록 요약 출력 → 사용자 확인 후 첫 Cycle Step 1 진행

## Cycle 완료 처리

1. phase-status.md `[~]` → `[x]` 갱신
2. 블로그 초안 여부 확인 (Step 4)
3. 다음 Cycle 진행 여부 사용자에게 확인

## 메타 작업 처리

CLAUDE.md 수정, 워크플로우 변경 등은 파이프라인 밖에서 직접 대화로 처리.
spec / plan / draft 작성 안 함. Cycle로 등록하지 않음.
