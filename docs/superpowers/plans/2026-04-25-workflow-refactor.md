# 워크플로우 리팩터링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CLAUDE.md를 168줄 → ~25줄로 슬림화하고, 사이클 규칙을 workflow 스킬로, 블로그/git 규칙을 rules/ 로 이전한다. UserPromptSubmit 훅으로 세션 시작 시 상태를 자동 주입해 재시작 안정성을 시스템 수준에서 보장한다.

**Architecture:** CLAUDE.md는 라우터 역할만 (목적 + 세션 시작 + 스킬 라우팅 + 참조 포인터). 사이클 파이프라인은 `.claude/skills/workflow/SKILL.md` 에 격리. 블로그/git 같은 도메인 규칙은 `rules/` 폴더로 분리해 필요 시 읽기. 훅 스크립트는 기존 `dev-log.sh` 와 동일 패턴.

**Tech Stack:** Markdown, Bash, JSON (settings.json)

---

### Task 1: rules/ 폴더 생성 + blog.md, git.md 작성

**Files:**
- Create: `rules/blog.md`
- Create: `rules/git.md`

- [ ] **Step 1: rules 폴더 생성 확인 및 blog.md 작성**

`rules/blog.md` 생성:

```markdown
# 블로그 초안 규칙

## 폴더 구조

```
blog/
├── game-dev/       # 게임 개발 과정 중심 (draft-1 ~)
└── prompt-diary/   # AI 프롬프트 관점 일기 (draft-1 ~)
```

## game-dev 시리즈

- 언어: 한국어
- 톤: 개발일지 (실패·결정 순간 포함, 매끄럽게 정제하지 말 것)
- 단위: Cycle 1개 = 1편
- 저장 위치: `blog/game-dev/draft-{편번호}-{주제}.md`

## prompt-diary 시리즈

- 언어: 한국어
- 톤: 막 끝낸 직후 일기. 과거 회고도 동일한 시점감으로 통일
- 단위: 프롬프트/명령 이벤트 하나 = 1편
- 스타일: 사건 서술 + 결정적 순간 프롬프트 인용 (텍스트 그대로)
- 구조: 이 시점의 게임(스크린샷 + 직전 포스트 이후 개발 내용 한 줄) → 그날 상황 → 입력한 프롬프트 인용 → 나온 결과 → 내린 결정 → 한 줄 회고
- 저장 위치: `blog/prompt-diary/draft-{편번호}-{주제}.md`
- 정보 소스 우선순위: `.claude/dev-log/` → `docs/phase-status.md` → git log → 기존 game-dev 초안

## 작성 시점

- 과거 편 (Phase 1~4): 소스 기반 재구성
- Phase 5 이후: 각 사이클 완료 직후 game-dev 초안 + prompt-diary 동시 작성
```

- [ ] **Step 2: git.md 작성**

`rules/git.md` 생성:

```markdown
# Git 커밋 규칙

- **태스크 완료 시마다** git commit && push 한다.
- 사이클 중간의 미완성 작업(코드 절반만 작성 등)은 커밋하지 않는다.
- 사이클 단위 커밋이 아닌 태스크 단위 커밋이므로, 커밋 메시지에 태스크 번호와 내용을 명시한다.
  - 예: `feat: phase11 T3 — 이벤트 대화창 레이아웃 개선`

## 사이클 완료 시 추가 커밋
- 블로그 초안 작성 후 별도 커밋
- phase-status.md Cycle 완료 표시 후 별도 커밋

## Phase 완료 시
- `docs/finished-phase.md` 에 완료 Phase 섹션 이전
- `docs/phase-status.md` 에서 완료 Phase 섹션 한 줄 요약으로 교체
```

- [ ] **Step 3: 두 파일 검토 + commit**

확인:
- `rules/blog.md` 존재
- `rules/git.md` 존재

```bash
git add rules/blog.md rules/git.md
git commit -m "feat: rules/ 신설 — blog.md, git.md 분리"
```

---

### Task 2: workflow 스킬 작성

**Files:**
- Create: `.claude/skills/workflow/SKILL.md`

- [ ] **Step 1: 스킬 폴더 + SKILL.md 작성**

`.claude/skills/workflow/SKILL.md` 생성:

````markdown
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

- subagent_type: `general-purpose`
- 스킬: `superpowers:executing-plans`
- 입력: plan 경로
- 출력: 코드 + Task별 commit
- 내부 반복: plan의 각 Task (`[ ]`)를 순차 실행, `[~]` 는 스킵

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
````

- [ ] **Step 2: 파일 작성 후 commit**

```bash
git add .claude/skills/workflow/SKILL.md
git commit -m "feat: workflow 스킬 신설 — Step 0~5 파이프라인 정의"
```

---

### Task 3: session-status 훅 작성 + settings.json 등록

**Files:**
- Create: `.claude/hooks/session-status.sh`
- Modify: `.claude/settings.json`

- [ ] **Step 1: session-status.sh 작성**

`.claude/hooks/session-status.sh` 생성:

```bash
#!/bin/bash
# phase-status.md 에서 현재 상태 1줄 추출 → stdout (UserPromptSubmit 훅이 컨텍스트에 주입)

PHASE_FILE="$CLAUDE_PROJECT_DIR/docs/phase-status.md"
[ -f "$PHASE_FILE" ] || exit 0

# 활성 Cycle 섹션 파싱
PHASE=$(grep -m 1 '^## 현재 Phase:' "$PHASE_FILE" | sed 's/^## 현재 Phase: //')
CYCLE=$(grep -m 1 '^### 활성 Cycle:' "$PHASE_FILE" | sed 's/^### 활성 Cycle: //')
STEP=$(grep -m 1 '^- step:' "$PHASE_FILE" | sed 's/^- step: //')

if [ -n "$CYCLE" ]; then
  echo "[상태] Phase $PHASE / Cycle: $CYCLE / Step $STEP"
else
  echo "[상태] Phase $PHASE / 활성 Cycle 없음"
fi
```

실행 권한 부여:

```bash
chmod +x .claude/hooks/session-status.sh
```

- [ ] **Step 2: 훅 수동 실행 검증**

```bash
CLAUDE_PROJECT_DIR="$(pwd)" bash .claude/hooks/session-status.sh
```

기대 출력 (현재 phase-status.md 기준): `[상태] Phase 10 진행 중 / 활성 Cycle 없음` 또는 유사.

출력이 비어있으면 phase-status.md 포맷이 일치하지 않는 것 → Task 5에서 정정.

- [ ] **Step 3: settings.json 에 UserPromptSubmit 훅 추가**

`.claude/settings.json` 을 다음 내용으로 교체:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/dev-log.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/session-status.sh"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 4: 파일 추가 + commit**

```bash
git add .claude/hooks/session-status.sh .claude/settings.json
git commit -m "feat: session-status 훅 추가 — UserPromptSubmit에 phase 상태 자동 주입"
```

---

### Task 4: CLAUDE.md 슬림화

**Files:**
- Modify: `CLAUDE.md` (전체 교체)

- [ ] **Step 1: 새 CLAUDE.md 작성**

`CLAUDE.md` 전체를 다음 내용으로 교체:

```markdown
# JY Survival

## 목적
Superpowers + Gstack 워크플로우를 게임 토이 프로젝트로 검증, Velog 기록.
산출물: 브라우저 게임 코드 + `/blog/` 한국어 초안. AI 작성 → 사람 퇴고 후 발행.

## 세션 시작
1. `docs/phase-status.md` 확인 (현재 Phase / 활성 Cycle / 다음 Step)
2. 활성 Cycle 있음 → workflow 스킬 호출 (이어서 진행)
3. 없음 → 다음 Cycle 무엇으로 할지 사용자에게 확인

## 스킬 라우팅
- 개발 작업 → workflow
- 단발 QA → gstack:qa
- 이벤트 일기 (사이클 종료 후) → prompt-diary

## 메타 작업
CLAUDE.md / 워크플로우 / 스킬 변경 등 메타 작업은 파이프라인 밖에서 직접 대화로 처리.

## 참조 (필요시 읽기)
- `rules/blog.md` — 블로그 초안 규칙
- `rules/git.md` — 커밋 규칙
- `docs/design.md` — 게임 설계 확정본
```

- [ ] **Step 2: 줄 수 확인**

```bash
wc -l CLAUDE.md
```

기대: 25줄 이하.

- [ ] **Step 3: commit**

```bash
git add CLAUDE.md
git commit -m "feat: CLAUDE.md 슬림화 — 168줄 → 25줄, 규칙은 rules/와 workflow 스킬로 이전"
```

---

### Task 5: phase-status.md 신 포맷 갱신

**Files:**
- Modify: `docs/phase-status.md`

- [ ] **Step 1: 신 포맷 적용**

기존 Phase 10 섹션은 보존(완료 처리됨), Phase 11 섹션을 신 포맷으로 갱신.

`docs/phase-status.md` 의 Phase 11 섹션을 다음으로 교체:

```markdown
## 현재 Phase: 11

**업데이트**: 2026-04-25
**상태**: 대기 중 (Phase 진입 시 Cycle 분할 필요)

### 활성 Cycle: (없음)

> Phase 진입 시 메인 에이전트가 `phase_feedback/phase_11.md` 검토 후 Cycle 목록을 채운다.

### Cycle 목록 (후보)

> 출처: 기존 phase-status.md Phase 11 후보 태스크. Step 0 진입 시 Cycle 단위로 분할 예정.

수정 사이클 후보:
- [ ] 이벤트 UI 감성화 — 경고창 텍스트 → 터미널 타자 연출 or 홀로그램 스타일
- [ ] 무기 레벨업 시 이펙트 스케일업 — 레벨에 따라 파티클 화려도 증가

추가 사이클 후보:
- [ ] 무기 시너지/진화 시스템 — 특정 무기 조합 시 융합 무기 생성 (예: Python+C = Cython)
- [ ] 스테이지 추가 — 테마 맵 2종: 프론트엔드 정원(파스텔톤), 백엔드 서버룸(다크 모드)
- [ ] 빌드 검증형 스테이지 기믹 — 스테이지별 유리 무기 조합 강제 환경 디버프
- [ ] 단계적 보상 시스템 — 스테이지별 차별화 드롭 아이템

---
```

기존 Phase 10 섹션 처리: Phase 10은 이미 모든 Cycle 완료됐으므로 `docs/finished-phase.md` 로 이전 후 `phase-status.md` 에서 "Phase 10 완료" 한 줄로 축약.

(이 이전 작업은 Phase 10 완료 처리에 해당하므로 본 Task에서 함께 진행)

- [ ] **Step 2: Phase 10 → finished-phase.md 이전**

`docs/phase-status.md` 의 Phase 10 섹션 전체를 잘라내어 `docs/finished-phase.md` 하단에 추가.

`docs/phase-status.md` 의 Phase 10 자리에 다음 한 줄로 교체:

```markdown
Phase 10 완료 / Phase 11 진행 대기 중
```

- [ ] **Step 3: 신 포맷 검증 — 훅 출력 확인**

```bash
CLAUDE_PROJECT_DIR="$(pwd)" bash .claude/hooks/session-status.sh
```

기대 출력: `[상태] Phase 11 / 활성 Cycle 없음` (활성 Cycle 섹션의 `:` 뒤가 `(없음)` 이므로 빈 값으로 처리됨)

훅 스크립트 8행의 조건 분기 (`-n "$CYCLE"`)는 `(없음)` 도 truthy로 잡으므로, 출력은 `[상태] Phase 11 / Cycle: (없음) / Step ` 가 된다.

→ 이 경우를 깔끔히 처리하려면 훅 스크립트를 다음과 같이 미세 조정:

`.claude/hooks/session-status.sh` 의 분기 로직 갱신:

```bash
if [ -n "$CYCLE" ] && [ "$CYCLE" != "(없음)" ]; then
  echo "[상태] Phase $PHASE / Cycle: $CYCLE / Step $STEP"
else
  echo "[상태] Phase $PHASE / 활성 Cycle 없음"
fi
```

이 변경 후 다시 검증:

```bash
CLAUDE_PROJECT_DIR="$(pwd)" bash .claude/hooks/session-status.sh
```

기대 출력: `[상태] Phase 11 / 활성 Cycle 없음`

- [ ] **Step 4: commit**

```bash
git add docs/phase-status.md docs/finished-phase.md .claude/hooks/session-status.sh
git commit -m "feat: phase-status.md 신 포맷 적용, Phase 10 finished로 이전"
```

---

### Task 6: 통합 검증

**Files:** 없음 (검증만)

- [ ] **Step 1: 파일 구조 확인**

```bash
ls rules/
ls .claude/skills/workflow/
ls .claude/hooks/
wc -l CLAUDE.md
```

기대:
- `rules/blog.md`, `rules/git.md` 존재
- `.claude/skills/workflow/SKILL.md` 존재
- `.claude/hooks/session-status.sh`, `dev-log.sh` 존재
- CLAUDE.md 25줄 이하

- [ ] **Step 2: settings.json 검증**

```bash
cat .claude/settings.json
```

기대: PostToolUse + UserPromptSubmit 두 훅 모두 등록되어 있음.

JSON 유효성 체크:

```bash
python -c "import json; json.load(open('.claude/settings.json'))"
```

기대: 에러 없음.

- [ ] **Step 3: 훅 출력 최종 확인**

```bash
CLAUDE_PROJECT_DIR="$(pwd)" bash .claude/hooks/session-status.sh
```

기대 출력: `[상태] Phase 11 / 활성 Cycle 없음`

- [ ] **Step 4: 통합 commit**

(검증 단계라 변경사항이 없으면 commit 없이 다음 단계)

- [ ] **Step 5: 사용자에게 새 세션 검증 요청**

다음 항목을 사용자에게 안내:

```
워크플로우 리팩터링 적용 완료. 다음 검증을 권장합니다:

1. 새 세션 시작 (Claude Code 재시작 또는 /clear)
2. 새 세션 첫 메시지 입력 시 훅이 자동으로 "[상태] Phase 11 / 활성 Cycle 없음" 주입 확인
3. CLAUDE.md 25줄 이내로 짧아졌는지 확인 → 토큰 절감 체감
4. 활성 Cycle 등록 후 끊고 재시작 → workflow 스킬이 알아서 재개하는지 확인
```

---

## Self-Review Notes

**Spec coverage:** spec 1~15 섹션 매핑
- §1 동기 → 모든 Task의 motivation
- §2~6 (3-Layer / 파이프라인 / 스킵 / 루프 / Cycle 선택) → Task 2 (workflow 스킬)
- §7 파일 구조 → Task 1, 2, 3, 4 모두 커버
- §8 phase-status.md 포맷 → Task 5
- §9 명명 규칙 → Task 2 SKILL.md 안 명시
- §10 메타 작업 → Task 4 CLAUDE.md + Task 2 SKILL.md
- §11 마이그레이션 → Task 5 (Phase 10 finished로 이전, Phase 11~ 새 규칙)
- §12 subagent type 매핑 → Task 2 (workflow 스킬 안)
- §13 변경 영향도 → Task 1~5 추가/수정 범위와 일치
- §14 검증 기준 → Task 6
- §15 후속 작업(구현 순서) → Task 1~6 순서가 spec 순서와 일치

**Placeholder scan:** 모든 Step에 실제 파일 내용/명령어 명시. TBD/TODO 없음.

**Type consistency:** session-status.sh 의 변수명(`PHASE`, `CYCLE`, `STEP`)이 Task 3, Task 5에서 일관됨. settings.json 구조가 Task 3에서 한 번 정의되고 Task 6에서 검증.

**알려진 미세 개선:**
- Task 5 Step 3에서 `(없음)` 처리를 위해 훅 스크립트를 한 번 수정한다. Task 3에서 처음부터 이 분기를 포함하지 않은 이유: 검증 사이클 한 번을 보여주기 위함(끊김→수정→재검증 패턴 학습 가치).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-25-workflow-refactor.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - 메인이 fresh 서브에이전트를 Task별로 디스패치, Task 사이 리뷰. 빠른 반복.

**2. Inline Execution** - 현재 세션에서 executing-plans 스킬로 일괄 실행, 체크포인트마다 리뷰.

**Which approach?**
