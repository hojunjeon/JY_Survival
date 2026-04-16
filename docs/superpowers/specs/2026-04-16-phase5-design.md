# Phase 5 설계 문서

**작성일**: 2026-04-16  
**대상**: 수정 사이클 4개 + 추가 사이클 7개

---

## 1. 수정 사이클

### Fix 1 — 맵 중간 버그 스폰 오류

**원인**: `WaveSystem._edgePosition()`이 `canvasWidth/Height(600×600)` 기준으로 좌표를 생성.
월드(2000×2000)에서 플레이어가 (1000,1000)에 있으면 적은 (0~600) 범위에서 스폰되어 플레이어 앞에 갑자기 등장.

**수정 방법**:
- `WaveSystem.update(dt, playerX, playerY)` — 플레이어 위치 인수 추가
- `_edgePosition(playerX, playerY)` — 카메라 중심 기준 뷰포트 엣지(+여유 100px) 스폰
- 월드 경계(0~2000) 클램프 적용
- `main.js`에서 `waveSystem.update(dt, player.x, player.y)` 호출

```
스폰 범위 = 플레이어 위치 ± (canvasHalf + 100px) → 4방향 엣지
```

---

### Fix 2 — 이벤트 대화창 크기 부족

**원인**: `EventModal` 박스 480×230 고정. 새 레이아웃(제목+구분선+캐릭터+대사+액션)에 공간 부족.

**수정 방법**:
- 박스 크기 `560×360` 확장
- 새 레이아웃 구조 (추가 사이클 Add 1과 통합 구현)

---

### Fix 3 — E3 클리어 시 무기 지급 없음

**원인**: `main.js`의 `event_cleared` 처리 블록에 무기 지급 코드 없음.

**수정 방법**:
- 보상 무기 풀 배열 관리 (Add 6 무기 5종 구현 후 통합)
- `event_cleared (E3)` + `boss_killed` → 보상 무기 풀에서 랜덤 1종 지급
- 획득 시 HUD에 무기명 알림 표시 (3초)

---

### Fix 4 — 게임 오버 화면 버튼 안 보임 + 재시작 잔상

**원인**:
- `renderGameOver()` 1회만 호출 → 이후 게임 render 루프가 덮어쓸 가능성
- 재시작(R키) 시 canvas 완전 클리어 없이 `startGame()` 재진입

**수정 방법**:
- `game_over` 상태 진입 시 `game.stop()` + `gameOverLoop()` 별도 시작 (rAF 루프)
- `gameOverLoop()`은 매 프레임 canvas 클리어 후 `renderGameOver()` 그림
- `startGame()` 진입 시 `ctx.clearRect(0, 0, canvas.width, canvas.height)` 추가

---

## 2. 추가 사이클

### Add 1 — 이벤트 화면 구성 변경

**새 레이아웃**:
```
[ <E1> 이벤트 : 들여쓰기 지옥 ]
─────────────────────────────────────────
[스프라이트]  박진우
─────────────────────────────────────────
"아니 이거 또 이러네?"
"지윤님 저 진짜 들여쓰기 오류 때문에 미치겠습니다.."
─────────────────────────────────────────
박진우가 들여쓰기 오류로 인해 컴퓨터를 향해 주먹을 쥡니다.
그를 진정시키기 위해 IndentationError를 처치하세요 (0/15)
                                          [ Space ] 계속
```

- E1 액션 텍스트: "IndentationError를 처치하세요 (진행: n/15)"
- E3 액션 텍스트: "EnvError를 처치하고 60초를 생존하세요"
- `EventModal.show(type, eventId, extra)` — `extra.progress` 인수 추가 (실시간 진행 표시)

---

### Add 2 — 장선형 보스 픽셀 스프라이트

**스펙**:
- 크기: 48×48 픽셀 배열, 렌더 시 `scale=2` → 화면 96×96
- 색상 테마: 보라색 상의 (1페이즈) / 빨간 상의 (2페이즈), 갈색 단발머리
- `PixelRenderer.BOSS_SPRITE` 에 추가
- `Boss.render(ctx)`에서 `ctx.fillRect` 대신 스프라이트 사용
- 2페이즈 색상 변화: 상의 색 오버레이 방식으로 표현

---

### Add 3 — NPC 픽셀 스프라이트 (박진우, 이한정)

**스펙**:
- 크기: 32×32, 렌더 시 `scale=1.5` → 화면 48×48
- 박진우: 남성, 파란 유니폼, 검정 단발
- 이한정: 여성, 파란 유니폼, 갈색 단발
- `PixelRenderer.NPC_SPRITES = { 박진우: [...], 이한정: [...] }` 에 추가
- `EventModal.render()`에서 캐릭터명 옆에 스프라이트 렌더

---

### Add 4 — 기본 버그 체력 조정

Python 데미지(12) 기준:

| 버그 | 기존 HP | 변경 HP | 타격 수 |
|------|---------|---------|---------|
| syntax_error | 40 | 24 | 2대 |
| null_pointer | 20 | 20 | ~2대 |
| seg_fault | 100 | 48 | 4대 |
| heal_bug | 15 | 15 | 유지 |
| indentation_error | 60 | 36 | 3대 |
| env_error | 130 | 48 | 4대 |

---

### Add 5 — 이벤트 몹 특수 공격 + 소환 수 제한

**소환 수 제한**:
- 이벤트 발생 시 기존 일반 몹 전부 제거
- E1: IndentationError 정확히 15마리만 스폰 (초과 스폰 없음)
- E3: EnvError 정확히 3마리만 스폰
- 이벤트 클리어 시 → 이벤트 몹 전부 제거 + 일반 웨이브 재개

**특수 공격**:
- `IndentationError`: `shootCooldown=2.5s`, 발사 시 플레이어 방향 투사체 1발 (speed=100, damage=8)
- `EnvError`: `dashCooldown=3s`, 돌진 시 플레이어 방향으로 0.4초 동안 speed=400 (평시 speed=35)

**구현 방법**:
- `Enemy` 클래스에 `specialCooldown`, `dashTimer`, `isDashing` 필드 추가
- `update()` 에서 타입별 분기 처리
- 이벤트 몹이 발사한 투사체는 `bossProjectiles` 배열에 추가 (플레이어 피격 처리 기존 로직 재활용)

**WaveSystem 변경**:
- `setEventMode(type, count)` — 이벤트 모드 진입 (남은 스폰 카운트 관리)
- 이벤트 모드에서 카운트 소진 시 스폰 중단
- `clearEventMode()` → 이벤트 몹 전부 제거 신호 반환

---

### Add 6 — 보상 무기 5종 구현

| 무기 | 쿨타임 | 공격 방식 | 데미지 |
|------|--------|---------|--------|
| Git | 4s | 주변 120px 범위 스턴+데미지 (광역) | 25 |
| SQL | 5s | 화면 전체 수직 줄기 3개 동시 발사 | 20 |
| JavaScript | 0.8s | 랜덤 방향 투사체 5발 난사 | 8 |
| Django | 2s | 전방 부채꼴 5방향 투사체 | 15 |
| Linux/Bash | 8s | 전체 화면 궁극기 — 모든 적에게 60 데미지 | 60 |

- 모두 `WeaponBase` 상속
- `weapons/Git.js`, `weapons/SQL.js`, `weapons/JavaScript.js`, `weapons/Django.js`, `weapons/LinuxBash.js` 신규 파일
- 보상 풀: `['Git', 'SQL', 'JavaScript', 'Django', 'LinuxBash']`
- 지급 시점: `event_cleared(E3)`, `boss_killed`
- `main.js`에서 `rewardWeapons[]` 배열 관리, 랜덤 1종 활성화
- HUD에 보유 무기 목록 표시 (최대 4개 슬롯)

---

### Add 7 — 몬스터 피격 색상 변화 효과

**현재 상태**: `Enemy.hitFlashTimer` 필드 이미 존재 (`takeDamage()` 시 0.1초 세팅)

**추가 구현**:
- `Enemy.render()`에서 `hitFlashTimer > 0`이면 스프라이트 위에 흰색 반투명 오버레이 (`rgba(255,255,255,0.6)`) 덮어 그림
- 죽을 때 (`isDead`): 빨간 오버레이 (`rgba(255,0,0,0.8)`) + 0.1초 후 제거

---

## 3. 파일 변경 목록

| 파일 | 변경 유형 |
|------|---------|
| `systems/WaveSystem.js` | 수정 (스폰 위치 + 이벤트 모드 개선) |
| `ui/EventModal.js` | 수정 (레이아웃 + 크기) |
| `main.js` | 수정 (게임오버 루프 + 무기 지급 + waveSystem 호출) |
| `entities/Enemy.js` | 수정 (특수 공격 + 체력 조정 + 피격 효과) |
| `entities/Boss.js` | 수정 (스프라이트 렌더 + 공격 패턴 추가) |
| `sprites/PixelRenderer.js` | 추가 (장선형 보스 스프라이트 + NPC 스프라이트 2종) |
| `weapons/Git.js` | 신규 |
| `weapons/SQL.js` | 신규 |
| `weapons/JavaScript.js` | 신규 |
| `weapons/Django.js` | 신규 |
| `weapons/LinuxBash.js` | 신규 |
| `tests/` | 추가 (새 무기 + 특수 공격 + 스폰 로직 테스트) |

---

## 4. 테스트 전략

- 수정 사이클: 기존 268개 테스트 GREEN 유지
- 추가 사이클: 새 무기 5종 × 최소 3개 테스트 + WaveSystem 이벤트 모드 테스트 추가
- 목표 누적 테스트 수: 290개 이상
