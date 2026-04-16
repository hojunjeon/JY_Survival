# RJ Revolution — CLAUDE.md 설계 플랜

## Context
Superpowers, GSD, Gstack 세 프레임워크의 유기적 연동 방법을 실제 게임 토이 프로젝트를 통해 Velog 개발일지 시리즈로 기록하는 사이드 프로젝트다. 이번 작업은 그 프로젝트의 규칙을 정의하는 CLAUDE.md와 하네스 설정(settings.json)을 작성하는 것이다.

**왜 이 작업이 필요한가:** CLAUDE.md 없이 시작하면 세션마다 프레임워크 전환 규칙을 다시 설명해야 하고, 블로그 초안 포맷이 일관성을 잃는다. CLAUDE.md로 규칙을 한 번 정의하면 모든 세션에서 동일한 워크플로우가 보장된다.

---

## 산출물 파일 목록

| 파일 | 용도 |
|------|------|
| `CLAUDE.md` | 프로젝트 루트. 핵심 규칙 (20줄 이내) |
| `.claude/settings.json` | 하네스 훅 설정. git 커밋됨 |
| `blog/` | 블로그 초안 저장 디렉토리 |
| `.claude/dev-log/` | 하네스가 자동 수집하는 개발 로그 디렉토리 |

---

## CLAUDE.md 전체 내용

```markdown
# RJ Revolution

## 목적
Superpowers + GSD + Gstack 유기적 연동 워크플로우를
실제 게임 토이 프로젝트를 통해 Velog 개발일지 시리즈로 기록한다.

## 산출물
1. 게임 코드 (브라우저 실행 가능)
2. `/blog/` 에 저장되는 Velog 시리즈 초안 (한국어)

## AI 역할
코드 작성 + 각 사이클 종료 시 블로그 초안 작성.
사람이 퇴고 후 Velog 발행.

---

## Phase 감지 (IMPORTANT)
세션 시작 시 아래 규칙으로 현재 Phase를 판단하라:

- 게임 코드가 없으면 → Phase 1 (브레인스토밍 + 기획)
- 게임 코드가 존재하고 활성 태스크가 있으면 → Phase 2+ (기능 개발)

Phase 1 사이클 진입점: Superpowers (브레인스토밍)
Phase 2+ 사이클 진입점: GSD (태스크 선택)

---

## 통합 사이클
모든 Phase에서 아래 순서를 따른다:

1. **Superpowers** → 브레인스토밍(Phase 1) / TDD 코딩(Phase 2+)
2. **Gstack**      → 아키텍처 설계(Phase 1) / 코드 리뷰·QA(Phase 2+)
3. **GSD**         → 전체 태스크 분할(Phase 1) / 기능 단위 원자 태스크 분할(Phase 2+)
4. **코딩**        → Phase 2+ 전용. Phase 1에서는 이 단계를 건너뛴다.
5. **문서화**      → 사이클 종료 후 `/blog/draft-{편번호}-{주제}.md` 로 초안 저장.

YOU MUST 사이클 순서를 임의로 변경하지 마라.
단계 전환 시 현재 단계와 다음 단계를 명시적으로 출력하라.
예: "[Gstack → GSD] 아키텍처 설계 완료. 태스크 분할 시작합니다."

---

## 블로그 초안 규칙
- 언어: 한국어
- 톤: 개발일지 (실패·결정 순간 포함, 매끄럽게 정제하지 말 것)
- 저장 위치: `/blog/draft-{편번호}-{주제}.md`
- Phase 1 완료 시 → 1편 초안 저장
- 기능 개발 사이클 완료 시 → N편 초안 저장

## 하네스 로그
파일 변경 로그는 `.claude/dev-log/` 에 자동 수집된다.
블로그 초안 작성 시 이 로그를 소재로 활용하라.
훅 설정: `.claude/settings.json` (git 커밋됨)
```

---

## .claude/settings.json 전체 내용

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "mkdir -p .claude/dev-log && echo \"$(date '+%H:%M:%S') | $CLAUDE_TOOL_NAME | $CLAUDE_FILE_PATHS\" >> .claude/dev-log/$(date '+%Y-%m-%d').log"
          }
        ]
      }
    ]
  }
}
```

---

## 블로그 시리즈 구조 (참고)

| 편 | 내용 | Phase |
|----|------|-------|
| 1편 | 브레인스토밍 + 기획 + 아키텍처 설계 | Phase 1 |
| 2편~ | 기능 단위 개발 (기능 1개 = 1편 기준) | Phase 2+ |

---

## 구현 단계

1. `CLAUDE.md` 작성 — 프로젝트 루트
2. `.claude/settings.json` 작성 — 훅 설정
3. `blog/` 디렉토리 생성
4. `.claude/dev-log/` 디렉토리 생성 (또는 훅이 자동 생성)
5. git init + `.gitignore` 작성 (settings.local.json, dev-log 제외 여부 결정)
6. 첫 커밋

---

## 검증 방법

1. Claude Code에서 새 세션 시작 → CLAUDE.md 자동 로드 확인
2. 아무 파일이나 수정 → `.claude/dev-log/YYYY-MM-DD.log` 자동 생성 확인
3. Phase 감지: 게임 코드 없는 상태에서 세션 시작 → "Phase 1" 판단 확인
4. 단계 전환 메시지 출력 확인

---

## 미결 사항

- `.claude/dev-log/` 를 gitignore할지 여부: 로그가 개발일지 소재이므로 커밋하는 것이 유리하나 노이즈가 될 수 있음. **기본값: 커밋 포함, 추후 결정**
- 게임 기술 스택: Phase 1 브레인스토밍에서 결정 예정
