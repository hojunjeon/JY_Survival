# CLAUDE.md 개발 사이클 규칙 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시뮬레이션에서 발견된 CLAUDE.md의 모호한 규칙 6개를 수정해 개발 흐름이 명확하게 동작하도록 한다.

**Architecture:** CLAUDE.md 단일 파일 편집. 코드 변경 없음. 각 이슈를 독립 태스크로 처리하고 최종 통합 확인 후 커밋.

**Tech Stack:** Markdown, Git

---

## 수정 대상 이슈 목록

| # | 이슈 | 위치 |
|---|------|------|
| ① | 통합 사이클과 수정/추가 사이클 연결 누락 | 사이클별 프로토콜 표 |
| ② | phase_N.md 항목의 phase-status.md 등록 누락 | 검토 단계 이후 |
| ②-b | phase_N.md 완료 후 처리 규칙 없음 (`phase_feedback/` 이동) | 사이클 완료 처리 |
| ③ | 검토 단계와 수정 사이클 "코드 분석" 중복 | phase_N.md 검토 단계 + 사이클 표 |
| ④ | git commit 규칙 중복 (두 곳에 동일 내용) | 사이클 완료 처리 + Git 커밋 규칙 섹션 |
| ⑤ | 제안 사이클 블로그 초안 여부 불명확 | 사이클 표 산출물 열 |

---

### Task 1: 통합 사이클 연결 명시 (이슈 ①)

**Files:**
- Modify: `CLAUDE.md` — 사이클별 프로토콜 표 + 통합 사이클 섹션

**현재 상태:**
- 통합 사이클 섹션: "Phase 내 각 Cycle을 실행할 때 아래 순서를 따른다"
- 사이클별 프로토콜 표: AI 행동란에 "구현"만 있고 통합 사이클 참조 없음

- [ ] **Step 1: 통합 사이클 섹션 도입부에 참조 범위 명시**

`CLAUDE.md`의 통합 사이클 섹션 첫 줄을 아래로 교체:

```
현재:
Phase 내 각 Cycle(수정/추가 등)을 실행할 때 아래 순서를 따른다:

변경 후:
Phase 내 수정/추가 사이클을 실행할 때 아래 순서를 따른다 (제안 사이클은 코딩 없으므로 해당 없음):
```

- [ ] **Step 2: 사이클 표 수정/추가 행에 통합 사이클 참조 추가**

수정 행의 AI 행동란:
```
현재:
`#수정` 섹션 읽기 → 코드 분석으로 누락 항목 추가 보완 → 구현

변경 후:
`#수정` 섹션 읽기 → **통합 사이클** 실행 (Superpowers→Gstack→GSD→코딩→문서화)
```

추가 행의 AI 행동란:
```
현재:
`#추가` 섹션 읽기 → 구현

변경 후:
`#추가` 섹션 읽기 → **통합 사이클** 실행 (Superpowers→Gstack→GSD→코딩→문서화)
```

- [ ] **Step 3: 변경 후 흐름 재확인**

수정 사이클 진입 시 아래 흐름이 명확히 이어지는지 눈으로 확인:
`phase_N.md 검토 → 승인 → 수정 사이클 → 통합 사이클(Superpowers→...→문서화)`

---

### Task 2: phase-status.md 등록 + phase_N.md 완료 후 처리 규칙 추가 (이슈 ②)

**Files:**
- Modify: `CLAUDE.md` — phase_N.md 검토 단계 이후 + 사이클 완료 시 필수 처리 섹션

**현재 상태:**
- 검토 후 승인을 받아도 phase-status.md에 Phase N 섹션이 등록되지 않음
- 모든 사이클 완료 후 phase_N.md를 어떻게 처리할지 규칙 없음

- [ ] **Step 1: 검토 승인 후 phase-status.md 등록 단계 추가**

`[필수] phase_N.md 검토 단계` 3번 항목 이후에 추가:

```
변경 후:
1. 모호하거나 해석이 갈리는 항목 명시
2. 코드 분석으로 누락된 수정 항목 발굴 및 개선 방향 제안
3. 사람의 승인을 받은 후:
   - `docs/phase-status.md` 에 Phase N 섹션 생성
     (수정/추가/제안 항목을 체크리스트로 등록)
   - 각 사이클 실행 시작
```

- [ ] **Step 2: Phase 전체 완료 후 처리 규칙 추가**

`사이클 완료 시 필수 처리` 섹션에 Phase 완료 처리 추가:

```
변경 후:
각 사이클(수정/추가/제안) 완료 후 반드시:
1. `docs/phase-status.md` — 완료된 사이클 체크 및 상태 업데이트
2. git commit

**Phase 내 모든 사이클(수정+추가+제안) 완료 시 추가 처리:**
3. `phase_N.md` → `phase_feedback/phase_N.md` 로 이동
   (루트에 파일이 없어야 다음 세션에서 재진입하지 않음)
4. `docs/phase-status.md` 의 현재 Phase를 Phase N+1 대기 상태로 업데이트
```

---

### Task 3: 검토 단계와 수정 사이클 코드 분석 중복 제거 (이슈 ③)

**Files:**
- Modify: `CLAUDE.md` — phase_N.md 검토 단계 + 사이클 표 수정 행

**현재 상태:**
- 검토 단계: "누락된 관점이나 더 나은 개선 방향 제안" (코드 분석 포함)
- 수정 사이클 표: "코드 분석으로 누락 항목 추가 보완" (중복)

- [ ] **Step 1: 검토 단계에 코드 분석 명시**

`[필수] phase_N.md 검토 단계` 2번 항목 수정:

```
현재:
2. 누락된 관점이나 더 나은 개선 방향 제안

변경 후:
2. 코드 분석으로 누락된 수정 항목 발굴 및 개선 방향 제안
```

- [ ] **Step 2: 수정 사이클 표에서 코드 분석 문구 제거**

Task 1의 Step 2에서 이미 수정 사이클 행을 통합 사이클 참조로 교체하면 자연스럽게 해결됨.
Task 1 Step 2 완료 여부 확인 후 이 단계는 스킵.

---

### Task 4: git commit 중복 규칙 통합 (이슈 ④)

**Files:**
- Modify: `CLAUDE.md` — Git 커밋 규칙 섹션

**현재 상태:**
- `사이클 완료 시 필수 처리` 2번: "git commit"
- `Git 커밋 규칙` 섹션: "각 사이클(Phase 포함) 완료 시 반드시 git commit"

- [ ] **Step 1: Git 커밋 규칙 섹션을 사이클 완료 처리로 통합 후 섹션 단순화**

`Git 커밋 규칙` 섹션을 아래로 교체:

```
현재:
## Git 커밋 규칙
- 각 사이클(Phase 포함) 완료 시 반드시 git commit 한다.
- 단, 사이클 중간의 임시 작업은 커밋하지 않는다.

변경 후:
## Git 커밋 규칙
- 사이클 중간의 임시 작업은 커밋하지 않는다.
- 커밋 시점은 `Phase 개발 사이클 규칙 > 사이클 완료 시 필수 처리` 참조.
```

---

### Task 5: 제안 사이클 블로그 초안 여부 명확화 (이슈 ⑤)

**Files:**
- Modify: `CLAUDE.md` — 사이클 표 제안 행

**현재 상태:**
제안 사이클 산출물이 "—" 로 표기되어 있어 블로그 초안이 필요한지 불명확.

- [ ] **Step 1: 제안 사이클 산출물 명시**

제안 행의 산출물 셀 수정:

```
현재:
—

변경 후:
프로젝트 구조 항목 실행 시 git commit. 블로그 초안 없음.
```

---

### Task 6: 최종 검증 및 커밋

- [ ] **Step 1: CLAUDE.md 전체 읽기로 흐름 재시뮬레이션**

Phase 4 세션 시작부터 제안 사이클 완료까지 단계별로 CLAUDE.md를 따라가며
빠진 연결, 모순, 모호한 표현이 없는지 확인.

- [ ] **Step 2: git commit**

```bash
git add CLAUDE.md phase_4.md docs/superpowers/plans/2026-04-16-claude-md-cycle-fix.md
git commit -m "docs: CLAUDE.md 개발 사이클 규칙 수정 (5개 이슈 해결)"
```
