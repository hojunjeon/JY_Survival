# Spec: Phase 11 Cycle 2.1 — UI 폴리시

**날짜:** 2026-04-26
**Phase:** 11 / Cycle 2.1
**분류:** fix
**참조 예제:** `examples/phase11-cycle1-ui-screens.html`

---

## 목표

두 가지 UI 이슈를 해결한다.
1. 브라우저에서 canvas가 작게 보임 (800×600 고정 크기)
2. UI 화면 9개가 examples.html 스타일과 다름 (폰트 너무 작음, 레이아웃 미반영)

---

## 변경 1 — Canvas CSS Scale

**파일:** `index.html`

현재:
```css
canvas {
  display: block;
  image-rendering: pixelated;
  border: 2px solid #4a90d9;
}
```

변경 후:
```css
canvas {
  display: block;
  image-rendering: pixelated;
  border: 2px solid #4a90d9;
  width: min(100vw, calc(100vh * 4 / 3));
  height: min(100vh, calc(100vw * 3 / 4));
}
```

- canvas 내부 좌표계 800×600 유지 (JS 변경 없음)
- 4:3 aspect ratio 유지하며 viewport 꽉 채움
- 1920×1080 기준 → canvas 1440×1080으로 표시

---

## 변경 2 — HUD.FONTS 상수 추가

**파일:** `ui/HUD.js`

`HUD.COLORS` 아래에 추가:
```js
static FONTS = {
  xs:  '9px monospace',
  sm:  '11px monospace',
  md:  '13px monospace',
  lg:  '16px monospace',
  xl:  'bold 20px monospace',
  xxl: 'bold 28px monospace',
};
```

---

## 변경 3 — UI 화면 9개 재구현

레퍼런스: `examples/phase11-cycle1-ui-screens.html`
모든 화면은 canvas 800×600 기준으로 구현.

### WeaponSelect (`ui/WeaponSelect.js`)

- 타이틀: `HUD.FONTS.xxl` → "김지윤의 디버그 서바이벌"
- 파일트리 아이템: `HUD.FONTS.md`, 선택된 항목 teal2 highlight
- 코드 뷰: `HUD.FONTS.sm`, keyword/string 구문 색상 분리
- 하단 버튼: teal2 배경, bg 텍스트, 충분한 패딩
- 상태바: statusBar 색상, 높이 20px

### EventToast (`ui/EventToast.js`)

- 반투명 오버레이 `rgba(0,0,0,0.6)`
- 토스트 카드: `#2a2139` bg, `f9e2af44` 테두리
- 캐릭터 이름: `HUD.FONTS.md`, pink 색상
- 대사 텍스트: `HUD.FONTS.sm`, italic
- 이벤트 힌트 박스: comment 색상 코드 스타일
- 버튼 2개: "무시하기"(outline), "도와주기"(yellow bg)

### EventModalScreen (`ui/EventModalScreen.js`)

- 미션 섹션: `#181825` bg, 타이틀 `HUD.FONTS.xs`
- 진행 바: 높이 4px, teal2 채우기, `진행/목표` 텍스트
- 보상 박스: `rgba(249,226,175,0.08)` bg, `f9e2af33` 테두리
- 버튼 2개: "일시정지 해제"(outline), "계속 플레이"(yellow bg)

### StatUpgrade (`ui/StatUpgrade.js`)

- 3개 옵션 카드: `#181825` bg, `#313244` 테두리
- 선택된 카드: teal2 테두리, `rgba(78,201,176,0.08)` bg
- 스탯 이름: `HUD.FONTS.md`, 각 스탯별 색상 (teal/yellow/red)
- 스탯 값: `HUD.FONTS.xl` bold
- 설명: `HUD.FONTS.xs`, comment 색상

### WeaponGet (`ui/WeaponGet.js`)

- 무기 박스: `f9e2af` 테두리, `rgba(249,226,175,0.05)` bg
- 무기 이름: `HUD.FONTS.xl`, yellow 색상
- 코드 스니펫: `#181825` bg, `HUD.FONTS.xs`, 구문 색상
- 버튼 2개: "버리기"(outline), "장착 슬롯 N"(yellow bg)

### BossIntro (`ui/BossIntro.js`)

- 붉은 반투명 오버레이 `rgba(243,139,168,0.04)`
- 보스 헤더: `rgba(243,139,168,0.15)` bg, HP 바 (gradient red→orange)
- 보스 스프라이트: 이모지 `👿` 48px, red shadow
- 보스 대사: `#2d1b1b` bg, italic, pink 색상
- 3열 스탯 그리드: HP/공격/추적

### BossPhase2 (`ui/BossPhase2.js`)

- 오렌지 반투명 오버레이 `rgba(250,179,135,0.08)`
- "PHASE 2" 텍스트: `HUD.FONTS.xxl`, orange 색상
- 변경사항 텍스트: `HUD.FONTS.sm`
- 2초 후 자동 전환 (기존 로직 유지)

### GameOver (`ui/GameOver.js`)

- 에러 헤더: `rgba(243,139,168,0.12)` bg, red 테두리
- stacktrace 목록: `HUD.FONTS.sm`, err/trace 색상 구분
- 실행 통계: 생존시간/처치/최대콤보 3행 그리드
- 버튼 2개: "exit"(outline), "game.restart()"(yellow bg)

### StageClear (`ui/StageClear.js`)

- 터미널 헤더: `$ git commit -m "feat: Stage N 완료"`, teal2 색상
- commit 박스: `rgba(78,201,176,0.08)` bg, teal2 테두리
- 클리어 로그: 항목별 색상 (teal/green/yellow)
- 3열 통계: 처치/시간/재화
- "git push origin StageN+1 →" 버튼 (yellow bg)

---

## 구현 순서

1. `index.html` CSS 변경 (1줄)
2. `HUD.js` FONTS 상수 추가
3. UI 화면 9개 순차 재구현
4. 각 화면 완료 후 commit

---

## 완료 기준

- 브라우저에서 canvas가 viewport 크기에 맞게 표시됨
- 각 gameState 진입 시 examples.html과 시각적으로 유사한 화면 렌더링
- 기존 hitbox/gameState 전환 로직 동작 이상 없음
