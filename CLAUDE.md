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
