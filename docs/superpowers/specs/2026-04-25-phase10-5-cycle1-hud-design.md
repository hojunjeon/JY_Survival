# Spec: Phase 10.5 Cycle 1 — HUD IDE 컨셉 리뉴얼

**날짜:** 2026-04-25  
**Phase:** 10.5 / Cycle 1  
**분류:** 수정 (fix)  
**참조 예제:** `examples/total_ui/Debug Survival - Terminal UI-print.html`

---

## 목표

`ui/HUD.js`의 단색 사각형 + 흰 텍스트 스타일을 VSCode/Catppuccin 테마 기반 IDE 컨셉으로 교체한다.  
게임 로직·레이아웃 좌표는 유지하고, 시각 표현만 교체한다.

---

## 디자인 스펙

### 색상 팔레트 (Catppuccin Mocha)

| 용도 | 색상 |
|------|------|
| 배경 패널 | `#1e1e2e` (반투명 `rgba(30,30,46,0.85)`) |
| 테두리 | `#313244` |
| 텍스트 기본 | `#cdd6f4` |
| HP 키워드 | `#cba6f7` (purple) |
| 타이머 값 | `#f5c2e7` (pink) |
| 킬 값 | `#a6e3a1` (green) |
| 주석 | `#45475a` |
| 상태바 배경 | `#89b4fa` (blue) |

### HP 바

- 배경: `#313244`
- 채우기: HP 비율에 따라 3단계 그라데이션
  - 50% 초과: `#a6e3a1 → #94e2d5` + `box-shadow: 0 0 8px #a6e3a188`
  - 25~50%: `#f9e2af → #fab387` + `box-shadow: 0 0 8px #f9e2af88`
  - 25% 이하: `#f38ba8` 단색 + 펄스 애니메이션 (`opacity 0.6→1.0`, 0.8s 반복)
- 테두리: `1px solid #313244`
- 텍스트: `"hp = {hp} / {maxHp}"` 형식, 키워드 색상 분리

### 킬 카운트

- `"kills = {killCount}  // target: {q1Target}"` 형식
- `kills` → `#cba6f7`, 숫자 → `#a6e3a1`, 주석 → `#45475a`

### 타이머

- `"elapsed = \"{m:ss}\""` 형식
- `elapsed` → `#89b4fa`, 값(따옴표 포함) → `#f5c2e7`
- 화면 상단 중앙 고정

### 이벤트 상태

기존 텍스트 나열 → **배지 스타일** 박스로 교체:
- BOSS 활성: `background #f38ba811`, `border #f38ba844`, 텍스트 `#f38ba8` + 펄스 테두리
- 이벤트 활성: `background #f9e2af11`, `border #f9e2af44`, 텍스트 `#f9e2af`
- 이벤트 클리어: `background #a6e3a111`, `border #a6e3a144`, 텍스트 `#a6e3a1`

### 패널 구조

- 좌상단: HP 바 + 킬 카운트 (반투명 IDE 패널 배경, 라인넘버 없음)
- 상단 중앙: 타이머
- 우상단: 이벤트 배지들 (세로 스택)
- 하단 없음 (상태바는 UI 참고용, 게임 캔버스엔 미적용)

---

## 구현 범위

| 파일 | 변경 내용 |
|------|----------|
| `ui/HUD.js` | `_renderHpBar`, `_renderKillCount`, `_renderTimer`, `_renderEventStatus` 시각 교체 |

**변경 없음:** Game.js, 테스트, 게임 로직

---

## 완료 기준

- [ ] HP 바가 3단계 색상 + 저체력 펄스로 렌더링됨
- [ ] 킬/타이머 텍스트가 IDE 신택스 컬러로 표시됨
- [ ] 이벤트 상태가 배지 스타일로 표시됨
- [ ] 기존 HUD 테스트(`tests/HUD.test.js`) 전부 통과
