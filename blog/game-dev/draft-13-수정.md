# 13편 — Phase 5 수정: 버그 3종 + 무기 시스템 확장

> Phase 5 Cycle 1 (수정) 개발일지. 2026-04-16~18.

---

## 이번 수정에서 건드린 것들

Phase 4를 끝냈을 때 게임은 "플레이 가능"한 상태였다. 근데 실제로 해보면 이상한 것들이 눈에 계속 밟혔다.

1. **맵 중간에 버그가 뚝 떨어지는 문제** — 스폰이 화면 밖에서 돼야 하는데 가끔 플레이어 코앞에 생겼다
2. **게임 오버 화면 루프** — 죽고 R키 누르면 잔상이 겹쳐 보이거나 화면이 깜빡였다
3. **이벤트 대화창이 너무 작았다** — 세 줄짜리 대사가 잘려서 안 보였다
4. **E3 클리어해도 보상 무기가 안 나왔다** — 코드에 무기 지급 로직이 아예 없었다

네 개다. 3번까지는 UI/버그 수준이었고, 4번은 설계 문제였다.

---

## T1: 맵 중간 버그 스폰 수정

### 원인

`WaveSystem.js`가 스폰 위치를 계산할 때 캔버스 좌표 기준 `(0, 0) ~ (canvasWidth, canvasHeight)`의 네 엣지를 사용했다. 문제는 월드가 2000×2000인데 카메라가 플레이어를 따라다니다 보니 화면 밖이 꼭 월드 밖은 아니었다.

플레이어가 맵 중앙에 있을 때 스폰 로직이 캔버스 좌표 기준으로 계산하면, 화면 기준으론 밖이어도 월드 좌표로는 플레이어 근처 한가운데가 된다.

### 수정

스폰 위치 계산에 플레이어 좌표를 넘기도록 `waveSystem.update(dt, player.x, player.y)`로 바꿨다. WaveSystem 내부에서는 플레이어 위치 + 오프셋으로 뷰포트 엣지를 계산한다.

```js
// 수정 전
waveSystem.update(dt)

// 수정 후
waveSystem.update(dt, player.x, player.y)
```

커밋: `00391d2`

---

## T2: 게임 오버 루프 + 재시작 잔상 제거

### 증상

죽으면 `gameOverLoop()`가 `requestAnimationFrame`으로 돌았는데, R키로 재시작할 때 루프가 제대로 끊기지 않아서 게임 오버 화면이 게임 위에 겹쳐 보이는 현상이 생겼다. 빠르게 죽고 재시작을 반복하면 화면이 두 개 겹쳐 깜빡이는 느낌.

### 수정

`state !== 'game_over'` 체크를 루프 시작 시점에서 하도록 확인하고, `clearRect` 타이밍을 정돈했다. 재시작 시 이전 루프가 자연스럽게 종료되도록.

커밋: `d38da64`, `409c4cb` (두 번에 나눠 수정)

---

## T3: EventModal 크기 확장 + 레이아웃 개선

### 이전 상태

이벤트 대화창이 작아서 박진우·이한정의 대사가 세 줄인데 두 줄만 보였다. "저 진짜 들여쓰기 오류 때문에 미치겠습니다.."가 잘렸다.

### 수정

`EventModal.js`를 560×360으로 확장하고, 내부 레이아웃을 NPC 이름 / 대사 / 닫기 안내로 구분했다. 기존에는 텍스트가 고정 좌표에 박혀있었는데, 이번에 여백과 줄 간격을 정비했다.

이 작업이 의외로 손이 많이 갔다. 캔버스 2D 렌더링에서 텍스트 줄바꿈은 자동이 아니라 직접 `fillText`를 여러 번 찍어야 해서, 대사 길이에 따라 좌표 계산을 다시 잡아야 했다.

커밋: `af54719`

---

## T4: E3 클리어 보상 무기 지급 (+ 보상 무기 5종 구현)

### 왜 이게 버그였나

사실 이 항목은 버그라기보다 "빠진 기능"이었다. Phase 4에서 E3 이벤트를 클리어하면 대화창만 뜨고 아무 보상이 없었다. 스테이지 클리어 화면에는 "보상: 강화 재화 획득 + 무기 획득!"이라고 적혀있는데 실제 무기 지급 코드가 없었다.

### 설계 결정: 보상 무기 5종

이 버그를 고치려면 지급할 무기가 먼저 있어야 했다. 기존 무기 세 개(Python/C/Java)는 시작 선택지라서 보상으로 재활용하기 어색했다. 그래서 보상 전용 무기 5종을 새로 만들었다.

| 무기 | 쿨타임 | 특성 |
|------|--------|------|
| Git | 4초 | 120px 반경 광역 데미지 |
| SQL | 5초 | 화면 전체 수직 줄기 3개 |
| JavaScript | 0.8초 | 랜덤 5방향 투사체 |
| Django | 2초 | 전방 부채꼴 5방향 |
| LinuxBash | 8초 | 전체 화면 궁극기 (60 데미지) |

기술 스택 테마를 살렸다. JavaScript는 빠르고 산발적, LinuxBash는 강력하지만 느리고, Git은 주변 범위를 쓸어담는 느낌.

### 구현: WeaponBase 확장 패턴

기존 무기들은 `_createProjectiles()`를 오버라이드하는 방식이었는데, Git(광역)과 LinuxBash(전체 피격)는 투사체 개념이 아니라 즉시 데미지를 적용하는 방식이라 패턴이 달랐다.

`fire()`가 반환하는 객체에 `isAreaEffect: true` 또는 `isUlt: true`를 담아서 `tryFireWeapon()`에서 분기하도록 했다.

```js
// Git — isAreaEffect 시그널
fire(x, y, dirX, dirY) {
  this.cooldown = this.maxCooldown;
  return [{ isAreaEffect: true, radius: 120, damage: 25, cx: x, cy: y }];
}

// tryFireWeapon에서 처리
if (p.isAreaEffect) {
  for (const enemy of enemies) {
    const dx = enemy.x - p.cx;
    const dy = enemy.y - p.cy;
    if (Math.sqrt(dx * dx + dy * dy) <= p.radius) {
      enemy.takeDamage(p.damage);
    }
  }
  continue;
}
```

### 다중 무기 소지 시스템

보상 무기를 받으면 기존 무기에 추가되어 동시에 모두 자동 발사된다. `selectedWeapon` 하나만 관리하던 구조에서 `ownedWeapons` 배열로 바꿨다.

```js
let ownedWeapons = [selectedWeapon];  // 시작 무기

// 보상 지급 시
function giveRewardWeapon() {
  const weapon = new WeaponClass();
  if (ownedWeapons.length < 4) ownedWeapons.push(weapon);
  rewardNotice = `무기 획득: ${weapon.name}`;
  rewardNoticeTimer = 3;
}
```

E3 클리어 시 랜덤 1종, 보스 처치 시 랜덤 1종. 최대 4개까지 소지.

### TDD

테스트 15개 추가(각 무기 3개씩). 쿨타임, fire() 반환값, 투사체 개수 등을 검증한다.

커밋: `768c841` (무기 5종), `0c5a093` (main.js 연동)

---

## 이번 사이클을 돌아보며

수정 사이클인데 T4가 생각보다 규모가 커졌다. 버그 수정이라고 해서 들어갔더니 "지급할 무기 자체가 없다"는 문제가 있었고, 그걸 해결하려면 보상 무기를 설계하고 구현해야 했다.

계획 문서(phase5-plan.md)에서는 T4(Fix 3)와 T9~10(Add 6)이 연결돼 있었는데, 실제로는 수정 사이클 안에서 같이 처리하게 됐다. 의존 관계가 있는 항목을 서로 다른 사이클로 나누면 이런 식으로 경계가 흐려진다.

테스트는 293개. Phase 5 Cycle 2(추가) 이어서 진행 예정.
