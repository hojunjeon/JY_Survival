# Phase 5 Cycle 2 추가 — 설계 문서

> 작성일: 2026-04-18
> 대상: Phase 5 Cycle 2 추가 사이클 (6개 태스크)
> 스킵: 보상 무기 5종 (Cycle 1 T4에서 이미 구현 완료)

---

## 구현 순서 및 태스크 목록

| T# | 태스크 | 수정 파일 |
|----|--------|-----------|
| T1 | 이벤트 화면 레이아웃 개선 | `ui/EventModal.js` |
| T2 | 보스·NPC 픽셀 스프라이트 추가 | `sprites/PixelRenderer.js` |
| T3 | NPC 스프라이트 EventModal 연결 + 보스 render() 추가 | `ui/EventModal.js`, `entities/Boss.js` |
| T4 | 기본 버그 체력 조정 | `entities/Enemy.js` |
| T5 | 이벤트 몹 특수 공격 + 소환 수 제한 | `entities/Enemy.js`, `systems/WaveSystem.js` |
| T6 | 몬스터 피격 색상 변화 효과 | `entities/Enemy.js` |

---

## T1: 이벤트 화면 레이아웃 개선

### 대상 파일
- `ui/EventModal.js` — `_renderTriggered()` 개선

### 목표 레이아웃

```
[ <E1> 이벤트 : 들여쓰기 지옥 ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NPC 스프라이트]  박진우
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"아니 이거 또 이러네?"
"지윤님 저 진짜 들여쓰기 오류 때문에 미치겠습니다.."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
박진우가 들여쓰기 오류로 인해 컴퓨터를 향해 주먹을 쥡니다.
IndentationError를 처치하세요 (0/15)
                                          [ Space ] 계속
```

### 변경 사항
- 구분선: `━` 문자로 통일 (기존 `strokeLine` 대신 텍스트로)
- 모달 높이: 400px 고정
- NPC 이름: 스프라이트 오른쪽에 배치 (스프라이트 없을 때도 이름만 표시)
- 폰트 크기: 제목 16px bold, 대사 14px, 상황 설명 13px, 액션 14px yellow
- E3도 동일 포맷 적용

### E3 레이아웃
```
[ <E3> 이벤트 : 파이참 위기 ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NPC 스프라이트]  이한정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"어? 이거 뭐야. 아.. 파이참 또 환경변수 꼬였네."
"지윤님 이것 좀 풀어주세요."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이한정의 IDE가 먹통이 됐습니다.
EnvError를 처치하고 60초를 생존하세요
                                          [ Space ] 계속
```

---

## T2: 보스·NPC 픽셀 스프라이트 추가

### 대상 파일
- `sprites/PixelRenderer.js` — 3종 스프라이트 배열 추가 및 export

### 장선형 보스 스프라이트
- 배열 크기: 24×24 (scale=2 렌더 → 48×48px)
- 컬러 컨셉: 진한 보라/남색 유니폼, 어두운 갈색 머리, 붉은 눈 (화남)
- 김지윤(32×32)보다 크고 위협적인 실루엣
- export: `PixelRenderer.BOSS_SPRITE`

### 박진우 NPC 스프라이트
- 배열 크기: 16×16 (scale=2 렌더 → 32×32px)
- 컬러 컨셉: 밝은 피부, 검정 머리, SSAFY 블루 유니폼
- export: `PixelRenderer.NPC_SPRITES['박진우']`

### 이한정 NPC 스프라이트
- 배열 크기: 16×16 (scale=2 렌더 → 32×32px)
- 컬러 컨셉: 밝은 피부, 어두운 갈색 머리, SSAFY 블루 유니폼
- export: `PixelRenderer.NPC_SPRITES['이한정']`

### export 구조 변경
```js
export const PixelRenderer = {
  PLAYER_SPRITE,
  BOSS_SPRITE,           // 신규
  NPC_SPRITES: {         // 신규
    '박진우': PARK_JINU_SPRITE,
    '이한정': LEE_HANJEONG_SPRITE,
  },
  BUG_SPRITES: { ... },  // 기존 유지
  drawSprite(...) { ... },
  drawPlayer(...) { ... },
};
```

---

## T3: NPC 스프라이트 연결 + 보스 render()

### 대상 파일
- `ui/EventModal.js` — NPC_SPRITES null → PixelRenderer.NPC_SPRITES 연결
- `entities/Boss.js` — render() 메서드 추가

### EventModal.js 변경
```js
// 변경 전
const NPC_SPRITES = null;

// 변경 후 — PixelRenderer에서 직접 참조
// _renderTriggered()에서 PixelRenderer.NPC_SPRITES[cfg.character] 사용
```

### Boss.js render() 추가
```js
render(ctx) {
  if (PixelRenderer.BOSS_SPRITE) {
    PixelRenderer.drawSprite(ctx, PixelRenderer.BOSS_SPRITE,
      this.x - 24, this.y - 24, 2); // 24×24 배열, scale=2 → 48px
    return;
  }
  // 폴백: 기존 보라색 사각형
  ctx.fillStyle = '#8822cc';
  ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
}
```

---

## T4: 기본 버그 체력 조정

### 대상 파일
- `entities/Enemy.js` — `ENEMY_STATS` 수정

### 체력 기준
- Python 1발 데미지 = 12
- 낮음(2대) = 24 HP
- 중간(3대) = 36 HP
- 높음(4대) = 48 HP

### 변경 수치

| 버그 | 현재 HP | 변경 HP | 비고 |
|------|---------|---------|------|
| NullPointer | 20 | 24 | 낮음(2대) |
| HealBug | 15 | 24 | 낮음(2대) |
| SyntaxError | 40 | 36 | 중간(3대) |
| SegFault | 100 | 48 | 높음(4대) |
| IndentationError | 60 | 60 | 이벤트 전용, 유지 |
| EnvError | 130 | 130 | 이벤트 전용, 유지 |

---

## T5: 이벤트 몹 특수 공격 + 소환 수 제한

### 대상 파일
- `entities/Enemy.js` — 이벤트 몹 특수 공격 로직
- `systems/WaveSystem.js` — 이벤트 시 웨이브 제어

### 소환 수 제한 (WaveSystem.js)
- 이벤트 발생 시:
  - 기존 일반 몹 전부 즉시 제거 (`enemies` 배열에서 이벤트 몹이 아닌 것 제거)
  - 일반 웨이브 스폰 정지 (`paused = true`)
  - E1: IndentationError 15마리 일괄 소환
  - E3: EnvError 3마리 일괄 소환
- 이벤트 클리어 시: 일반 웨이브 스폰 재개 (`paused = false`)
- API: `WaveSystem.startEventWave(eventId, enemies)` / `WaveSystem.endEventWave()`

### IndentationError 특수 공격 (E1 느린 총알)
- 쿨다운: 3초마다 1발
- 대상: 플레이어 방향
- 투사체: 기존 `Projectile` 재사용, 속도 80px/s, 데미지 10
- 구현: `Enemy` 생성자에 `shootCooldown`, `canShoot` 플래그 추가
- `update(dt, targetX, targetY)` 반환값: 발사할 투사체 배열 (없으면 `[]`)
- `Stage1.js`에서 반환된 투사체를 적 투사체 배열에 추가, 플레이어와 충돌 처리

### EnvError 특수 공격 (E3 돌진)
- 쿨다운: 5초마다 1회
- 돌진 지속: 0.5초, 속도 350px/s
- 돌진 중 접촉 데미지: 기존의 2배 (15 → 30)
- 구현: `dashCooldown`, `dashTimer`, `isDashing` 플래그
- 일반 이동은 기존 로직 유지, 돌진 중에는 속도만 교체

---

## T6: 몬스터 피격 색상 변화 효과

### 대상 파일
- `entities/Enemy.js` — `render()` 수정

### 구현 방식
- `hitFlashTimer > 0` 조건에서 스프라이트 위에 반투명 흰색 오버레이
- Canvas API: 스프라이트 그린 후 동일 영역에 `ctx.fillStyle = 'rgba(255,255,255,0.6)'` rect 덮기
- `isDead` 직전 마지막 프레임에도 동일 효과 (죽음 플래시)
- 폴백(단색 사각형) 타입도 동일하게 밝게 처리

### 코드 패턴
```js
render(ctx) {
  // 기존 스프라이트 렌더
  this._renderSprite(ctx);

  // 피격 플래시 오버레이
  if (this.hitFlashTimer > 0 || this.isDead) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    ctx.restore();
  }
}
```

---

## 테스트 방針

- T4: 적 HP 수치 단위 테스트 (ENEMY_STATS 값 검증)
- T5: WaveSystem 이벤트 웨이브 진입/종료 단위 테스트, 투사체 생성 테스트
- T1/T2/T3/T6: 렌더링 관련 — 브라우저 시각 확인 (단위 테스트 불필요)
