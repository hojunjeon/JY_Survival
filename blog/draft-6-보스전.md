# 6편 — 장선형이 왔다: 보스전 구현기

> Cycle 5 개발일지 | 2026-04-14

---

## 이번에 만든 것

Cycle 5의 목표는 딱 하나였다. **장선형을 게임에 등장시키는 것.**

기획 단계에서 잡아둔 캐릭터다. 김지윤의 라이벌, 1살 연하, 존댓말 사용. 억울함과 분함이 공존하는 인물. 이 캐릭터를 코드로 어떻게 표현할지가 이번 사이클의 핵심 고민이었다.

구현한 것들:
- `entities/Boss.js` — 2페이즈 보스, 투사체 패턴, 대사 시스템
- `systems/EventSystem.js` 확장 — 보스 등장 트리거, 보스 처치 → 스테이지 클리어
- `main.js` 통합 — 보스 HP 바, 말풍선, 스테이지 클리어 화면

테스트: 166개 → **207개** (41개 추가, 전부 GREEN)

---

## 설계 결정: 보스는 언제 등장하는가

가장 먼저 결정해야 했던 것은 **보스 등장 조건**이었다.

기획서에는 이렇게 적혀 있었다:

> "이벤트2 클리어 + 추가 시간 후 등장"

그런데 구체적인 구현 방법이 애매했다. EventSystem이 이미 E1, E3 이벤트와 Q1 퀘스트를 관리하고 있었는데, 보스 트리거를 어디에 넣을지 고민했다.

결론은 **EventSystem 확장**이었다. E3가 cleared 상태가 된 시점을 기록해두고, 그로부터 `bossTriggerDelay`(기본 30초) 경과 시 `boss_triggered` 알림을 발생시키는 방식.

```js
// E3 클리어 시점 기록
if (this.e3State === 'cleared' && this._e3ClearedAt === null) {
  this._e3ClearedAt = this.elapsed;
}

// 보스 등장 트리거
if (
  this.bossState === 'pending' &&
  this._e3ClearedAt !== null &&
  this.elapsed >= this._e3ClearedAt + this._bossTriggerDelay
) {
  this.bossState = 'active';
  notifications.push({ type: 'boss_triggered' });
}
```

이렇게 하면 EventSystem 하나에서 게임 흐름 전체를 관리하게 된다. main.js는 알림만 수신하면 된다.

---

## 2페이즈 전환: 가장 간단하게

보스 2페이즈 전환에서 주의한 점은 **"전환이 1번만 일어나야 한다"**는 것이었다.

매 프레임 HP를 체크해서 50% 이하면 phase를 2로 바꾸는 건 쉬운데, 그러면 매 프레임 `phase2` 대사가 발생할 수 있다. 그래서 `_phaseTransitioned` 플래그를 뒀다.

```js
updatePhase() {
  if (this.phase === 1 && this.hp <= this.maxHp * 0.5 && !this._phaseTransitioned) {
    this.phase = 2;
    this._phaseTransitioned = true;
    return true; // 전환 발생 알림
  }
  return false;
}
```

`true`를 반환할 때만 main.js에서 대사를 출력한다. 이게 TDD로 먼저 테스트를 쓴 덕분에 자연스럽게 나온 설계다. 테스트를 쓸 때 "전환은 1번만 발생한다"는 케이스를 먼저 작성했고, 그 테스트를 통과시키려다 보니 플래그 방식이 나왔다.

---

## 투사체 패턴: 각도 계산

1페이즈는 3방향, 2페이즈는 5방향. 플레이어 방향을 중심으로 좌우로 30도씩 펼치는 부채꼴 패턴.

```js
shoot(targetX, targetY) {
  if (this.shootCooldown > 0) return [];
  this.shootCooldown = SHOOT_INTERVAL;

  const baseAngle = Math.atan2(targetY - this.y, targetX - this.x);
  const count = this.phase === 2 ? 5 : 3;
  const spread = Math.PI / 6; // 30도

  const projectiles = [];
  const half = Math.floor(count / 2);
  for (let i = -half; i <= half; i++) {
    const angle = baseAngle + i * spread;
    projectiles.push({
      x: this.x, y: this.y,
      vx: Math.cos(angle) * 250,
      vy: Math.sin(angle) * 250,
      damage: 15,
    });
  }
  return projectiles;
}
```

보스가 직접 Projectile 인스턴스를 만들지 않고 순수한 데이터 객체를 반환하도록 했다. 테스트하기 쉽고, main.js에서 Projectile로 감싸는 책임이 분리된다.

---

## 대사 시스템: 게임 속 캐릭터성

장선형의 대사는 4종류다:

- **등장**: "지윤님... 이번엔 제가 꼭 이깁니다! 두고 보세요!!"
- **2페이즈**: "이게 말이 돼요?! 왜 지윤님만 무기가 그렇게 많아요!! 억울해서 못 살겠네!!"
- **처치**: "말도 안 돼... 이건 진짜 억울하다고요!! 지윤님 반칙이에요!!"
- **도발(랜덤)**: "지윤님 맨날 저 놀리더니 이제 후회하시겠죠?! 이번엔 제 차례예요!!"

`getDialogue(key)` 메서드 하나로 처리. 존재하지 않는 키는 빈 문자열. 테스트도 단순하게 유지했다. 대사 내용이 바뀌어도 테스트가 깨지지 않도록 특정 키워드 포함 여부만 검사했다.

```js
it('등장 대사를 반환한다', () => {
  expect(boss.getDialogue('appear')).toContain('이깁니다');
});
```

---

## main.js 통합 과정

보스를 게임 루프에 연결하는 작업이 생각보다 꼼꼼했다. 체크리스트:

1. **보스 등장 시 일반 적 전부 제거** — 보스전 집중을 위해
2. **보스 투사체 ↔ 플레이어 충돌** — bossProjectiles 별도 배열 관리
3. **플레이어 투사체 ↔ 보스 충돌** — 보스 HP 감소 + 페이즈 전환 체크
4. **보스 접촉 데미지** — 플레이어에 20 데미지
5. **보스 처치 → 3초 후 스테이지 클리어 화면** — setTimeout으로 대사 읽을 시간 확보

보스 등장 이후에는 `waveSystem.update()`를 호출하지 않도록 조건을 걸었다. `if (!boss)` 한 줄이지만 이게 없으면 보스전 중에도 일반 적이 계속 스폰된다.

---

## 보스 HP 바

상단 중앙에 보스 HP 바를 그렸다. 2페이즈가 되면 색이 보라(`#990099`)에서 핫핑크(`#cc0066`)로 바뀐다. 육안으로 페이즈 전환을 인지할 수 있게.

말풍선은 하단에 반투명 박스로. 대사가 나오는 동안 `bossDialogueTimer`가 카운트다운되고 0이 되면 사라진다.

---

## 스테이지 클리어

보스 처치 후 3초 대기 → 클리어 화면 전환. 심플하게 텍스트만.

이게 MVP다. 추후 Cycle 6에서 실제 보상 선택 UI와 업그레이드 시스템이 붙을 예정.

---

## 지금까지의 누적

| Cycle | 핵심 구현 | 테스트 |
|-------|-----------|--------|
| 1 (코어+플레이어) | Game 루프, Input, Player | 34개 |
| 2 (적 시스템) | Enemy 4종, WaveSystem, Collision | 64개 |
| 3 (무기 시스템) | WeaponBase, Python/C/Java, Projectile, Menu | 122개 |
| 4 (이벤트·퀘스트) | EventSystem, E1/E3/Q1 | 166개 |
| **5 (보스전)** | **Boss, 보스 트리거, 스테이지 클리어** | **207개** |

---

## 다음: Cycle 6 — 완성

남은 것들:
- `systems/UpgradeSystem.js` — Q1 보상 스탯 업그레이드 선택 UI
- `ui/HUD.js` — 이벤트/퀘스트 진행 상황 화면 표시
- `stages/Stage1.js` — 전체 통합 + 최종 플레이 테스트

MVP 한 사이클 남았다.
