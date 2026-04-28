# Spec: Phase 11 Cycle 2.3 — UI 디자인 적용 (game-flow-demo 기반)

**날짜:** 2026-04-27
**Phase:** 11 / Cycle 2.3
**분류:** fix (visual polish)
**참조 디자인:** `designs/game-flow-demo.html`, `designs/DESIGN.md`

---

## 목표

`designs/game-flow-demo.html`에서 확정된 VS Code Terminal 디자인 시스템을 실제 게임 `ui/` 파일들에 반영한다.  
기능 변경 없이 **시각적 충실도**만 개선한다.

---

## 설계 원칙 (designs/DESIGN.md 요약)

- 폰트: 모든 텍스트 `'JetBrains Mono', 'Consolas', monospace`
- 타이틀바: `background:#3c3c3c` / `height:30px` / dots (12px 원)
- 상태바: `background:#007acc` / `height:22px`
- 팔레트: `--bg:#1e1e1e`, `--panel:#252526`, `--panel2:#2d2d2d`, `--border:#3e3e3e`
- 강조색: `--teal:#4ec9b0`, `--red:#f44747`, `--orange:#ce9178`, `--yellow:#dcdcaa`, `--blue:#9cdcfe`, `--purple:#c586c0`, `--comment:#6a9955`

---

## 변경 파일 목록

### 1. `ui/WeaponSelect.js`

**현재:** 단순 세로 목록 + 오른쪽 코드 프리뷰, 하단 박스 + 시작 버튼  
**목표 (demo s02):**
- 왼쪽 사이드바 175px: 제목 "탐색기", `▸ WEAPONS` 디렉터리, 파일 행 (색점 + `.py/.c/.class` 파일명), 선택 시 teal 하이라이트 배경
- 오른쪽 코드 뷰: 44px 라인넘버 거터(`panel2`) + 코드 영역 (문법 색상 주석/키워드/클래스/값)
- 하단 바: 왼쪽 스탯 (DMG / FIRE / TYPE / RANGE), 오른쪽 `// Start with [무기명]` 버튼
- 구분선: `--border` 색

### 2. `ui/GameOver.js`

**현재:** 에러 헤더 + 스택트레이스 + 박스형 통계, 오렌지 재시작 버튼  
**목표 (demo s10):**
- 배경: `#0a0505` (짙은 적색)
- 스택트레이스 형식: `Traceback (most recent call last):` 스타일, `PlayerDeathError: HP reached 0` 빨간 굵은 강조
- 통계 그리드: 2×2 (생존 시간 / 처치 수 / 최대 콤보 / 도달 웨이브)
- 버튼: 왼쪽 `// exit` (border only), 오른쪽 `game.restart()` (status blue 채움)

### 3. `ui/StageClear.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s11):**
- 배경: `#091209` + 녹색 틴트 dim 오버레이
- 카드: teal 왼쪽 보더, `panel` 배경
- 헤더: `[main 4a8b2c3]` 커밋 해시 + 커밋 메시지
- 본문: `// Clear Log` 섹션 레이블 + 체크리스트 (`✓` teal) + 구분선 + 보상 목록
- 하단 통계 행: 처치 / 최대콤보 / 피격횟수 / 보유무기
- 버튼: `git push origin Stage2 →` (status blue)

### 4. `ui/BossIntro.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s08):**
- 배경: `#1a0808` (짙은 적) + 빨간 dim 오버레이 `rgba(30,0,0,.7)`
- 카드: red 왼쪽 보더, `#241010` 헤더
- 헤더: `⚠ BOSS INCOMING` 빨간 굵은 + HP 바 (80px 너비, red 채움) + HP% 표시
- 본문: 픽셀 스프라이트 (64×80 캔버스) + 이름/대사/stats
- 푸터: `자동 전환 2.0s...` dim 텍스트

### 5. `ui/BossPhase2.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s09):**
- 배경: `#1a0d00` + 오렌지 dim 오버레이 `rgba(30,15,0,.72)`
- 카드: orange 왼쪽 보더
- 헤더: `⚡ PHASE 2 ACTIVATED` orange 굵은
- 본문: `HP 50% 이하 돌입` 태그 + 대사 블록 + 변경사항 목록 (`+` orange)
- 푸터: `자동 전환 2.0s...`

### 6. `ui/StatUpgrade.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s06):**
- 배경: 반투명 dim 오버레이
- 헤더: `// Q1 달성 — Choose Upgrade` 섹션 레이블 + 서브텍스트
- 카드 3개 (가로 나열): 각각 다른 top border 색 (teal/yellow/red)
  - 카드 내: 레이블(9px dim uppercase) / 퍼센트(24px bold) / 이전→이후 / 설명
- 하단 힌트: `클릭하여 선택 · Enter 확인`

### 7. `ui/WeaponGet.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s07):**
- 배경: dim 오버레이
- 카드: purple 왼쪽 보더
- 헤더: `// 이벤트 E2 클리어 보상` 주석 + `WEAPON UNLOCKED: git.revert()` purple 타이틀
- 본문: 코드 스니펫 박스(panel2) + 스탯 행(DMG/범위/CC/쿨다운) + 설명
- 버튼: `// 버리기` (secondary) + `// 장착 슬롯 2` (primary)

### 8. `ui/EventToast.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s04):**
- 위치: 우측 하단 고정 (`bottom:50px right:16px`, width 272px)
- 왼쪽 보더: teal
- 헤더: `⚠ EVENT: [이름]` + `● NEW` 배지
- 본문: NPC 초상화(40×40) + 이름 + 대사(italic dim) + 이벤트 코드
- 버튼: `// 무시하기` (secondary) + `// 도와주기` (primary)

### 9. `ui/EventModal.js` / `ui/EventModalScreen.js`

**현재:** 미확인 (확인 필요)  
**목표 (demo s05):**
- 배경: dim 오버레이
- 모달: teal 왼쪽 보더, 가운데 정렬 (316px 너비)
- 헤더: `⚠ EVENT: [이름]` + `● ACTIVE` 배지
- 본문: 코드 문법 색상 행들 + 진행 바(3px, teal 채움) + NPC 행(panel2 배경)
- 버튼: `// 계속 플레이` (primary, 전폭)

---

## 공통 개선 사항

- 타이틀바 `dots` 크기: 현재 r=4 → 목표 r=6 (직경 12px)
- 타이틀바 높이: 현재 20~24px → 목표 30px
- 상태바 높이: 현재 16px → 목표 22px
- 폰트: `'JetBrains Mono', 'Consolas', monospace` 전통일 (현재 일부 `monospace` 단독)
- 버튼 레이블 접두어: `// ` 스타일 통일

---

## 구현 범위 제외

- 게임 로직, 입력 처리, hitbox 계산 변경 금지
- 새 기능 추가 금지
- `ui/HUD.js`, `ui/FloatingText.js` 변경 최소화 (필요 시 색상 상수만)

---

## 테스트 기준

- 브라우저에서 `designs/game-flow-demo.html`과 나란히 놓고 비교했을 때 레이아웃·색상·폰트 크기가 일치
- 기존 hitbox 좌표가 실제 클릭 가능 영역과 일치
- 모든 화면에서 텍스트 잘림 없음
