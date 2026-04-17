# JY Survival

## 목적 및 역할
Superpowers + GSD + Gstack 유기적 연동 워크플로우를 실제 게임 토이 프로젝트를 통해 Velog 개발일지 시리즈로 기록한다.
산출물: 게임 코드(브라우저 실행 가능) + `/blog/` 한국어 초안. AI가 코드 작성 및 블로그 초안 작성, 사람이 퇴고 후 발행.

---

## 세션 시작 시 필독 (IMPORTANT)
세션 시작 시 아래 파일을 반드시 읽어라:
- `docs/phase-status.md` — 현재 Phase 및 다음 작업 확인
- `docs/design.md` — 게임 전체 설계 확정본

## 실행 방식 (Phase 3 이후)
- **Subagent-Driven** 방식을 기본으로 사용한다.
  - 태스크 하나당 서브에이전트 1개 디스패치
  - 서브에이전트 완료 후 결과 리뷰 후 다음 태스크 진행

## Phase 감지 (IMPORTANT)
세션 시작 시 `docs/phase-status.md` 의 현재 Phase를 기준으로 판단하라.

- Phase 1 진입점: Superpowers (브레인스토밍)
- Phase 2 진입점: GSD (태스크 선택)
- Phase 3+ 진입점: `phase_feedback/phase_N.md` 확인 → Phase 개발 사이클 규칙 적용

---

## 통합 사이클 (각 Cycle 내부 실행 방식)
Phase 내 수정/추가 사이클을 실행할 때 아래 순서를 따른다 (제안 사이클은 코딩 없으므로 해당 없음):

1. **Superpowers** → 브레인스토밍(Phase 1) / TDD 코딩(Phase 2+)
2. **Gstack**      → 아키텍처 설계(Phase 1) / 코드 리뷰·QA(Phase 2+)
3. **GSD**         → 전체 태스크 분할(Phase 1) / 기능 단위 원자 태스크 분할(Phase 2+)
4. **코딩**        → Phase 2+ 전용. Phase 1에서는 이 단계를 건너뛴다.
5. **문서화**      → 사이클 종료 후 `/blog/game-dev/draft-{편번호}-{주제}.md` 로 초안 저장.

YOU MUST 사이클 순서를 임의로 변경하지 마라.
단계 전환 시 현재 단계와 다음 단계를 명시적으로 출력하라.
예: "[Gstack → GSD] 아키텍처 설계 완료. 태스크 분할 시작합니다."

---

## Phase 개발 사이클 규칙 (Phase 3 이후)

각 Phase는 아래 3개 사이클을 순서대로 실행한다:

**수정(Fix) → 추가(Add) → 제안(Suggest)**

### phase_N.md 관리 규칙
- 모든 `phase_N.md` 파일은 `phase_feedback/` 디렉토리에서 관리한다.
- 사람이 새 Phase 피드백을 작성할 때도 `phase_feedback/phase_N.md` 로 저장한다.

### 진입 조건
1. `docs/phase-status.md` 에서 현재 Phase 번호 확인
2. `phase_feedback/phase_N.md` 존재 여부 확인
3. 파일이 존재하고 `docs/phase-status.md` 에 해당 Phase가 미완료 상태이면 → Phase 진입
4. 파일이 없거나 이미 완료 상태이면 → 이전 Phase 계속 진행

### [필수] phase_N.md 검토 단계
`phase_N.md`를 읽은 후 즉시 실행하지 않는다. 먼저:
1. 모호하거나 해석이 갈리는 항목 명시
2. 코드 분석으로 누락된 수정 항목 발굴 및 개선 방향 제안
3. 사람의 승인을 받은 후:
   - `docs/phase-status.md` 에 Phase N 섹션 생성 (수정/추가/제안 항목을 체크리스트로 등록)
   - 각 사이클 실행 시작

### 사이클별 프로토콜

| 사이클 | 성격 | AI 행동 | 산출물 |
|--------|------|---------|--------|
| **수정** | 코드·구조 보완 | `#수정` 섹션 읽기 → **통합 사이클** 실행 (Superpowers→Gstack→GSD→코딩→문서화) | 코드 + 블로그 초안 |
| **추가** | 게임 기능 확장 | `#추가` 섹션 읽기 → **통합 사이클** 실행 (Superpowers→Gstack→GSD→코딩→문서화) | 코드 + 블로그 초안 |
| **제안** | 메타 레벨 제안 (선택) | `#제안` 섹션이 있을 경우: 프로젝트 구조 항목(CLAUDE.md 수정 등)은 현재 세션에서 즉시 실행, 게임 관련 항목은 다음 `phase_(N+1).md` 작성 시 참고용으로만 활용 | 프로젝트 구조 항목 실행 시 git commit. 블로그 초안 없음. |

> 제안 섹션이 없으면 해당 사이클을 스킵한다.

### 태스크 완료 시 필수 처리 (IMPORTANT)
**태스크 하나 완료할 때마다** 반드시:
1. `docs/phase-status.md` — 완료된 태스크 체크 (`[x]`) 및 상태 업데이트
2. git commit && push (태스크 단위 커밋)

> 이유: 세션 도중 토큰 한도 초과 시 완료된 태스크가 유실되지 않도록 한다.
> 다음 세션은 `docs/phase-status.md` 의 체크 상태를 보고 이어서 진행한다.

### 사이클 완료 시 필수 처리
사이클 내 모든 태스크 완료 후 추가로:
1. 블로그 초안 작성 (`blog/game-dev/draft-{편번호}-{주제}.md`)
2. `docs/phase-status.md` — 사이클 완료 표시
3. git commit && push (사이클 완료 커밋)

**Phase 내 모든 사이클(수정+추가+제안) 완료 시 추가 처리:**
4. `docs/phase-status.md` 에 Phase N 완료 표시
5. `docs/phase-status.md` 의 현재 Phase를 Phase N+1 대기 상태로 업데이트

### On-demand 액션
사이클과 무관하게 언제든 실행 가능:
- **gstack QA**: "gstack 테스트" 또는 `/qa` → `gstack-qa` 스킬 실행. 결과는 다음 `phase_N.md` 작성 참고 자료로 활용.
- **프롬프트 일기**: 수정/추가 사이클 완료 후 → `prompt-diary` 스킬 자동 실행. 스킬이 주목할 만한 이벤트를 판단해 포스트 작성 제안. 없으면 무시.

---

## 블로그 폴더 구조
```
blog/
├── game-dev/       # 기존 시리즈 — 게임 개발 과정 중심 (draft-1 ~ 12편+)
└── prompt-diary/   # 새 시리즈 — AI 프롬프트 관점 일기
```

## 블로그 초안 규칙 (game-dev 시리즈)
- 언어: 한국어
- 톤: 개발일지 (실패·결정 순간 포함, 매끄럽게 정제하지 말 것)
- 저장 위치: `/blog/game-dev/draft-{편번호}-{주제}.md`

## 블로그 초안 규칙 (prompt-diary 시리즈)
- 언어: 한국어
- 톤: 막 끝낸 직후 일기. 과거 회고도 동일한 시점감으로 통일
- 단위: 프롬프트/명령 이벤트 하나 = 1편
- 스타일: 사건 서술 + 결정적 순간 프롬프트 인용 (텍스트 그대로)
  - 구조: 이 시점의 게임(스크린샷 + 직전 포스트 이후 개발 내용 한 줄) → 그날 상황 → 입력한 프롬프트 인용 → 나온 결과 → 내린 결정 → 한 줄 회고
- 저장 위치: `/blog/prompt-diary/draft-{편번호}-{주제}.md`
- 작성 시점:
  - 과거 편 (Phase 1~4): 소스 기반 재구성 (dev-log, phase-status.md, git 커밋, 기존 game-dev 초안)
  - 미래 편 (Phase 5~): 각 사이클 완료 직후 game-dev 초안과 동시 작성
- 정보 소스 우선순위: `.claude/dev-log/` → `docs/phase-status.md` → git log → 기존 game-dev 초안

## Git 커밋 규칙
- **태스크 완료 시마다** git commit && push 한다.
- 사이클 중간의 미완성 작업(코드 절반만 작성 등)은 커밋하지 않는다.
- 사이클 단위 커밋이 아닌 태스크 단위 커밋이므로, 커밋 메시지에 태스크 번호와 내용을 명시한다.
  - 예: `feat: phase5 T3 — 이벤트 대화창 레이아웃 개선`

## 하네스 로그
파일 변경 로그는 `.claude/dev-log/` 에 자동 수집된다.
블로그 초안 작성 시 이 로그를 소재로 활용하라.
