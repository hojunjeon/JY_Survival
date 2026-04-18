# 14편 — Phase 5 Cycle 2: 그래픽과 시스템을 한꺼번에 갈아엎다

## 이번에 추가한 것들

Phase 5 Cycle 2는 "추가" 사이클이다. 수정(Fix)으로 게임을 안정시킨 뒤, 이번에는 실제로 게임다운 게임으로 만드는 작업을 했다. 총 7개 항목:

- 기본 버그 체력 조정 (Python 12 기준 2/3/4대)
- 몬스터 피격 색상 변화 효과
- 이벤트 모드 소환 수 제한 + 이벤트 몹 특수 공격
- 장선형 보스 픽셀 스프라이트 (32×32)
- NPC 픽셀 스프라이트 박진우·이한정 (16×16)
- EventModal 560×360 레이아웃 + NPC 스프라이트 연동
- 보상 무기 5종 구현 + 지급 시스템 연동

항목만 보면 많아 보이는데, 이걸 서브에이전트 7번 디스패치로 해결했다.

---

## T3: 체력 조정 — 숫자 하나가 게임을 바꾼다

기존 적들은 체력이 너무 많았다. Python 무기가 12 데미지인데 SyntaxError가 HP 40, EnvError가 HP 130이었다. 3~10대 이상을 때려야 죽는다.

기준을 잡았다: "Python 기준 2~4대에 죽어야 한다."

```
syntax_error: 40 → 24  (2대)
seg_fault: 100 → 48    (4대)
indentation_error: 60 → 36  (3대)
env_error: 130 → 48   (4대)
null_pointer, heal_bug  유지
```

TDD 순서로 먼저 테스트 5개를 실패시키고 ENEMY_STATS 한 줄씩 수정했다. 단순한 작업이지만 기존 테스트 중 `ProjectileCollision.test.js`에서 `syntax_error HP=40` 기준으로 작성된 테스트가 있어서 같이 수정해야 했다.

---

## T4: 피격 플래시 — 있어야 할 게 없었다

사실 이미 `hitFlashTimer` 필드는 `takeDamage()`에서 0.1초로 세팅하고 있었다. 근데 `render()`에서 이걸 쓰는 코드가 없었다. 필드만 있고 시각 효과가 없는 상태였다.

수정은 간단했다:

```js
if (this.hitFlashTimer > 0) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(/* ... */);
  ctx.restore();
}

if (this.isDead) {
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(/* ... */);
  ctx.restore();
}
```

피격 시 흰색 플래시 0.1초, 사망 시 빨간 오버레이. 플레이어 입장에서 "내가 때렸구나"를 눈으로 확인할 수 있게 됐다.

---

## T5+T6: 이벤트 모드 소환 수 제한 + 특수 공격

이 두 태스크를 같이 디스패치했다. 이유: 둘 다 Enemy.js + main.js를 수정하고 관련이 깊어서 분리하면 충돌 가능성이 높다.

### T5: 소환 수 제한

기존 E1/E3 이벤트는 WaveSystem이 계속 이벤트 몹을 찍어내고 있었다. IndentationError가 무한정 스폰됐다. 이번에 `setEventMode(type, count)` 인터페이스를 만들었다:

```js
setEventMode(type, count) {
  this.eventMode = { type, remaining: count };
  this.elapsed = 0;
}
```

`_spawnWave`에서 `remaining`을 차감하고, 0이 되면 스폰 중단. E1은 15마리, E3는 3마리만 등장한다.

이벤트 발생 시 기존 일반 몹을 전부 제거하는 코드도 main.js `event_triggered` 핸들러에 추가했다.

### T6: 특수 공격

- **IndentationError**: 2.5초마다 플레이어 방향으로 speed=100 투사체 발사 (damage=8)
- **EnvError**: 3초마다 0.4초간 speed=400 돌진

Enemy.update()에 `specialCooldown` 타이머를 추가하고, IndentationError는 `_pendingShots` 배열에 발사 정보를 쌓는다. main.js의 적 업데이트 루프에서 이걸 수거해서 `bossProjectiles`에 추가한다. 플레이어 피격 처리 로직이 `bossProjectiles`를 이미 다루고 있어서 재활용이 가능했다.

---

## T7: 픽셀 스프라이트 3종

`sprites/PixelRenderer.js`에 세 가지 스프라이트를 추가했다:

- **BOSS_SPRITE** (32×32) — 장선형 보스. 갈색 단발, 보라 상의, 검은 바지
- **JINU_SPRITE** (16×16) — 박진우. 검정 단발, 블루 SSAFY 유니폼
- **HANJEONG_SPRITE** (16×16) — 이한정. 갈색 단발, 블루 SSAFY 유니폼

각각 hex color 상수를 미리 정의하고 2D 배열로 표현한다. null은 투명 픽셀이다.

테스트 없이 직접 구현했다. 스프라이트는 "보인다 / 안 보인다"로 검증하는 게 더 빠르다.

---

## T8: EventModal 전면 개편

기존 EventModal은 단색 박스에 텍스트만 출력했다. 이번에 560×360 레이아웃으로 바꿨다:

```
[ <E1> 이벤트 : 들여쓰기 지옥 ]
─────────────────────────────────
[박진우 스프라이트 48×48]  박진우
─────────────────────────────────
"아니 이거 또 이러네?"
"지윤님 저 진짜 들여쓰기 오류 때문에 미치겠습니다.."
─────────────────────────────────
박진우가 들여쓰기 오류로 인해 컴퓨터를 향해 주먹을 쥡니다.
IndentationError를 처치하세요 (0/15)
                                   [ Space ] 계속
```

`EVENT_CONFIG` 객체 안에 E1/E3 설정을 담고, `progressFormat` 함수를 통해 진행 표시도 동적으로 렌더한다. NPC 스프라이트는 scale=3으로 48×48 크기로 출력한다.

---

## T9: 보상 무기 5종

| 무기 | 쿨타임 | 동작 | 데미지 |
|------|--------|------|--------|
| Git | 4s | 반경 120px 광역 | 25 |
| SQL | 5s | 수직 3줄 투사체 | 20 |
| JavaScript | 0.8s | 랜덤 5방향 | 8 |
| Django | 2s | 부채꼴 5방향 | 15 |
| LinuxBash | 8s | 전체 화면 궁극기 | 60 |

Git과 LinuxBash는 Projectile 객체 대신 특수 시그널 객체를 반환한다:

```js
// Git
return [{ isAreaEffect: true, radius: 120, damage: 25, cx: x, cy: y }];

// LinuxBash
return [{ isUlt: true, damage: 60 }];
```

`tryFireWeapon`에서 `isAreaEffect`면 범위 내 모든 적에게, `isUlt`면 화면 전체 적에게 데미지를 준다.

---

## T10+T11: 시스템 연동 + Boss 스프라이트

### T10: 랜덤 보상 무기 지급

E3 클리어 또는 보스 처치 시 `giveRewardWeapon()`을 호출한다. 남은 풀에서 랜덤으로 뽑고, `ownedWeapons` 배열에 추가한다. 최대 4개까지 보유 가능.

`ownedWeapons`에 있는 무기는 게임 루프에서 전부 자동 발사된다:

```js
for (const weapon of ownedWeapons) {
  if (weapon.name !== 'Java') weapon.update(dt);
  tryFireWeapon(weapon, player);
}
```

무기 획득 시 3초간 화면 중앙에 "무기 획득: Git" 같은 알림이 표시된다.

### T11: Boss 스프라이트 렌더

`Boss.render()`에서 `BOSS_SPRITE`를 scale=2로 그린다. 2페이즈 진입 시 globalAlpha=0.3 빨간 오버레이를 얹어 페이즈 변화를 시각적으로 표현한다.

---

## 총 테스트: 308개 GREEN

Cycle 2 완료 후 308개 전부 통과. FAIL 0.

---

## 느낀 점

이번 Cycle은 양이 많았다. 태스크 7개를 서브에이전트로 하나씩 처리하니까 각 작업이 깔끔하게 분리됐다. 가장 까다로웠던 건 T5+T6 조합 — 두 태스크가 같은 파일을 건드려서 한 에이전트에 묶었는데, 결과적으로 더 자연스러웠다.

픽셀 스프라이트 작업(T7)은 "테스트 없이 직접 구현" 방식으로 갔다. 32×32 배열을 코드로 그리는 건 TDD로 검증할 수 있는 성질이 아니다. 크기 검증(16×16인지)은 기존 BUG_SPRITES 테스트 방식을 따라 할 수 있지만, "캐릭터처럼 생겼는지"는 눈으로 봐야 한다.

다음은 Phase 6 피드백을 기다리는 중.
