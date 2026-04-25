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
