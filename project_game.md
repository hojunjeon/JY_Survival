---
name: JY Survival 게임 프로젝트
description: 김지윤의 디버그 서바이벌 — 뱀파이어 서바이벌류 브라우저 게임, Phase 3 MVP 개선 이터레이션 진행 중
type: project
originSessionId: 7b545135-ec75-4ab7-9b6a-7c0100a4387a
---
## 게임: 김지윤의 디버그 서바이벌

SSAFY 15기 서울 6반을 배경으로 한 뱀파이어 서바이벌류 브라우저 게임.

**Why:** Superpowers + GSD + Gstack 워크플로우 실증 + Velog 개발일지 시리즈 소재
**How to apply:** 구현 시 `docs/superpowers/plans/` 내 플랜 파일을 참조. Cycle 단위로 구현 후 블로그 초안 작성.

## 핵심 결정 사항

- **기술 스택**: Vanilla JS + HTML5 Canvas, ES6 모듈, Vitest
- **주인공**: 김지윤 (전직 초등국어 교사, SSAFY 입과), HP 100
- **보스**: 장선형 (억울+화남 캐릭터)
- **MVP 완성**: Stage 1, 이벤트 E1+E3, 퀘스트 Q1, 무기 3종, 누적 테스트 249개 GREEN
- **무기 3종**: Python(360°), C(전방 관통), Java(오비탈 오브)
- **적 6종**: syntax_error / null_pointer / seg_fault / heal_bug / indentation_error / env_error

## 현재 진행 상황 (2026-04-15)

- **Phase 3 — MVP 개선 이터레이션** 진행 중
- Cycle 1~6 (Phase 2 MVP) 완료, 249 테스트 GREEN
- Phase 3 설계 완료: `docs/superpowers/specs/2026-04-15-phase3-improvement-design.md`
- **Cycle 1 (수정) 구현 예정**: `docs/superpowers/plans/2026-04-15-cycle1-수정.md`
- **Cycle 2 (추가) 구현 예정**: `docs/superpowers/plans/2026-04-15-cycle2-추가.md`
- 실행 방식: Subagent-Driven (태스크당 서브에이전트 1개)

## Phase 3 작업 목록

### Cycle 1 — 수정 (미완료)
- [ ] 접촉 데미지 쿨다운 (0.5초 무적)
- [ ] 피격 효과 (적 플래시 + 플레이어 비네팅)
- [ ] 사망 처리 (게임 오버 화면 + 재시작)
- [ ] EventModal 생성 + main.js 연결
- [ ] 배경 및 카메라 (월드 좌표계)

### Cycle 2 — 추가 (미완료)
- [ ] 타이머 HUD 연결 (HUD.js → main.js)
- [ ] 버그 픽셀 아이콘 6종 (PixelRenderer.js 확장)
