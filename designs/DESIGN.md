# Design System — Style C: VS Code Dark Terminal

## 컨셉

VS Code 다크 테마를 그대로 게임 UI로 재현. 타이틀바·탭바·상태바 등 IDE 크롬을 유지하고,
게임 요소(HUD, 몬스터, 무기 이펙트)도 코드 에디터의 문법 색상 팔레트로 표현한다.

---

## 색상 팔레트

| 변수 | 값 | 용도 |
|---|---|---|
| `--bg` | `#1e1e1e` | 메인 배경 |
| `--panel` | `#252526` | 카드·패널 배경 |
| `--panel2` | `#2d2d2d` | 서브 패널 (탭바, 모달 헤더·푸터) |
| `--border` | `#3e3e3e` | 구분선·테두리 |
| `--teal` | `#4ec9b0` | 주요 강조 (플레이어, HP, 주무기) |
| `--red` | `#f44747` | 오류·위험 (SyntaxError 몬스터, 데미지) |
| `--orange` | `#ce9178` | 문자열·경고 (SegFault 몬스터) |
| `--yellow` | `#dcdcaa` | 키워드·XP (함수명, 킬 카운트) |
| `--blue` | `#9cdcfe` | 변수·정보 (NullPtr 몬스터, SQL) |
| `--purple` | `#c586c0` | 특수·마법 (git 무기, 타임스톱) |
| `--comment` | `#6a9955` | 주석·섹션 레이블 |
| `--status` | `#007acc` | 상태바·주 버튼 (VS Code 블루) |
| `--white` | `#d4d4d4` | 본문 텍스트 |
| `--dim` | `#858585` | 비활성·보조 텍스트 |

---

## 타이포그래피

- **폰트:** `'JetBrains Mono', 'Consolas', monospace` — 전체 통일
- **크기 체계:** 8px(라벨/FX 설명) / 9px(카드 서브) / 10px(HUD, 카드 메타) / 11px(카드 이름, 모달 본문) / 12px(탭, 타이틀바)

---

## VS Code 크롬 (공통 레이아웃)

### 타이틀바
```
background: #3c3c3c | height: 30px | border-bottom: 1px solid #2a2a2a
```
- 왼쪽: 트래픽 라이트 dots (빨강 `#ff5f57` / 노랑 `#febc2e` / 초록 `#28c840`), 지름 12px, gap 6px
- 가운데: 창 제목 `font-size: 12px; color: rgba(255,255,255,0.55)`

### 탭바
```
background: --panel2 | height: 34px | border-bottom: 1px solid #2a2a2a
```
- 비활성 탭: `color: --dim`, 우측 구분선
- 활성 탭: `background: --bg`, `color: --white`, `border-top: 2px solid --status`, 상단 파란 줄
- 탭 안 색점 (tdot): 7px 원, 파일 타입별 색상

### 상태바
```
background: --status | height: 22px | padding: 0 12px
```
- 항목들: `font-size: 10px`, 구분자 `|` (dim), 공백 flex-spacer로 좌우 분리
- 표시 정보: Stage명, git branch (`⎇`), 진행률, UTF-8, 언어, 라인번호

---

## 게임 HUD

### 상단 HUD
```
position: absolute | top: 0 | height: 26px | background: rgba(30,30,30,0.96)
border-bottom: 1px solid --border
```
- 파일명 + teal 색점 (`hud-hdot`: 7px 원, `--teal`)
- HP 바: width 60px, height 3px, fill `--teal`
- 킬 카운트: `⚔ N kills`, color `--yellow`
- 타이머: `⏱ M:SS`, color `--dim`
- 무기 슬롯: 활성 `--white`, 비활성 `--dim` + opacity 0.5

### 배경 코드 라인
- 실제 코드 스니펫 10줄이 위에서 아래로 스크롤
- `globalAlpha: 0.032`, `color: #9cdcfe` (파란 변수색)
- 왼쪽 라인 넘버 거터: width 44px, `background: --panel2`

---

## 섹션 레이블

```css
font-size: 10px; color: --comment; letter-spacing: 2px; text-transform: uppercase;
```
접두어: `// ` (JS 주석 스타일). 우측에 `::after` 수평선 (`border: --border`).

---

## 컴포넌트

### 몬스터 카드 (`.mc`)
```
background: --panel | border: 1px solid --border | border-left: 3px solid <monster-color>
padding: 10px | width: 128px
```
- 64×64 캔버스 (픽셀 아트), `image-rendering: pixelated`
- 이름: `font-size: 10px`, 몬스터 색상
- 타입 주석: `font-size: 9px`, `--dim`, `// ` 접두어
- 스킬: `font-size: 9px`, `--comment` / 스킬명 `--yellow`

### 무기 이펙트 카드 (`.fx-card`)
```
background: --panel | border: 1px solid --border | padding: 9px
```
- 함수명: `font-size: 10px`, `--yellow`
- 138×96 캔버스, `image-rendering: pixelated`
- 설명: `font-size: 9px`, `--dim`, 강조어 `--teal`/`--white`/색상

### 이벤트 모달 (`.modal`)
```
background: --panel | border: 1px solid --border | border-left: 3px solid --teal
box-shadow: 0 8px 28px rgba(0,0,0,0.5)
```
- 헤더 (`.mh`): `background: --panel2`, teal 제목 + 파란 ACTIVE 배지
- 본문: 코드 문법 색상 (`kw: --yellow`, `str: --orange`, `num: --blue`, `cm: --comment`, `err: --red`)
- NPC 행: `background: --panel2`, 48×48 캔버스 + 이름·대사
- 버튼 행: 주 버튼 `--status` 채움 / 보조 버튼 투명 + `--border` 테두리
  - 버튼 레이블: `// Accept`, `// Later` 형식

### 버튼
- **주 버튼 (`.btn-p`):** `background: --status`, `color: #fff`, border 없음
- **보조 버튼 (`.btn-s`):** `background: transparent`, `color: --dim`, `border: 1px solid --border`
- 폰트: `font-family: inherit; font-size: 11px`

---

## 픽셀 아트 스프라이트 컨벤션

- 16×12 또는 16×14 그리드 (픽셀 배열)
- `null` = 투명, 색상 문자열 = 채움
- `drawSprite(ctx, sprite, x, y, scale, tintColor, alpha)` 함수로 렌더
- scale: 보통 2×, 탱커(SegFault)는 3×
- 선택적 틴트: `globalAlpha 0.3`으로 몬스터 색상 오버레이

---

## 애니메이션 패턴

- **보블링:** `Math.sin(frame * 0.03 + wobble) * 2` — 적 캐릭터 상하 부유
- **깜빡임:** `0.55 + 0.45 * Math.sin(frame * 0.08)` — NullPtr 투명도
- **파티클:** 피격 시 6개 파편 + 1개 텍스트 파티클 (오류 단어)
- **투사체 트레일:** 최대 12프레임 위치 기록, 오래될수록 투명·작게
- **데미지 텍스트:** `--red` 숫자 위로 솟았다 사라짐, XP는 `--yellow`

---

## 무기 이펙트 정리

| 무기 | 함수명 | 색상 | 패턴 |
|---|---|---|---|
| Python | `python.attack()` | `--teal` | S자 사인파 관통탄 |
| C/C++ | `c.bullet()` | `--white` | 고속 수평 빔 |
| Java | `Java.gc()` | `--orange` | 3개 오비탈 오브젝트 |
| Git | `git.revert()` | `--purple` | 확산 링 + 타임스톱 |
| SQL | `SQL.query()` | `--blue` | 격자 순차 스캔 |
| JavaScript | `JS.spray()` | `--yellow` | 랜덤 단어 산탄 |
| Django | `django.view()` | `--teal` | 부채꼴 광역 |
| Linux | `$ rm -rf /` | `--white`/멀티 | 전체화면 폭발 궁극기 |

---

## 시작화면 레이아웃 가이드

```
┌─ VS Code 타이틀바 ─────────────────────────────────┐
├─ 탭바 (README.md 활성) ──────────────────────────────┤
│                                                        │
│  // Welcome                    ─────────────────────  │
│                                                        │
│  [픽셀 아트 타이틀 or ASCII 로고]                       │
│  김지윤의 디버그 서바이벌                               │
│                                                        │
│  > python game.js_  ← 깜빡이는 커서                    │
│                                                        │
│  [// Start Game]    [// Select Weapon]                 │
│                                                        │
│  // Available Weapons                 ─────────────── │
│  [python] [C] [Java] [git] [SQL] [JS] [django] [bash] │
│                                                        │
├─ 상태바 (⚡ 준비 완료 | ⎇ main | UTF-8 | Ln 1) ────────┤
└────────────────────────────────────────────────────────┘
```
