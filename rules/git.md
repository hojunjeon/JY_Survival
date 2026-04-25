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
