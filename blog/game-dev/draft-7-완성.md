# 7편 — 완성: 업그레이드·HUD·통합, 그리고 게임이 완성되다

> 작성일: 2026-04-14 | Cycle 6 개발일지

---

## 이번 사이클에서 만든 것

드디어 마지막 사이클이다. Cycle 6의 목표는 세 가지였다.

1. **UpgradeSystem** — 퀘스트 보상으로 스탯을 올리고, 강화 재화로 무기를 강화하는 시스템
2. **HUD** — 체력 바, 킬카운트, 타이머, 이벤트 상태를 화면에 표시하는 UI
3. **Stage1 통합** — 위 모든 시스템을 하나로 묶는 오케스트레이터 클래스

오늘 세션의 dev-log를 보면 **21:21~21:25** 사이에 파일 6개가 쭉 생겨났다. 테스트 파일이 먼저고, 구현 파일이 뒤따른다. TDD가 몸에 배고 있다는 증거라고 생각한다.

---

## UpgradeSystem — 강화 재화와 스탯 업그레이드

처음에 UpgradeSystem 설계를 떠올렸을 때 고민이 있었다. "업그레이드가 어디에 붙어야 하나? Player에? Weapon에?" 결론은 **UpgradeSystem이 외부에서 주입받은 Player, Weapon 객체를 직접 수정한다**는 방식이었다.

```js
applyStatUpgrade('moveSpeed', player, weapons) → player.speed *= 1.2
applyStatUpgrade('attackSpeed', player, weapons) → weapons.forEach(w => w.cooldown *= 0.8)
applyStatUpgrade('damage', player, weapons) → weapons.forEach(w => w.damage *= 1.2)
```

단순하다. 상태를 캡슐화하는 게 아니라 대상을 직접 건드린다. 게임 개발에서는 이 편이 오히려 명확하다는 걸 이번에 다시 느꼈다.

무기 강화 (`enhanceWeapon`) 역시 비슷한 패턴이다.

- 재화가 부족하면 `false` 반환
- 재화가 충분하면 소모 후 `enhanceLevel++`, `damage *= 1.1`, `true` 반환
- 강화 비용은 `enhanceLevel + 1` — 레벨 0이면 1개, 레벨 1이면 2개

처음 테스트를 돌렸을 때 **18개 전부 한 번에 GREEN**이었다. 설계를 먼저 테스트로 정리했더니 구현이 빠르게 따라왔다.

---

## HUD — 정보를 화면에

HUD는 Canvas API를 직접 다루기 때문에 테스트가 까다로웠다. 방법은 `ctx`를 mock으로 만들어 `fillRect`, `fillText` 호출을 감시하는 것이었다.

한 가지 실수가 있었다. HP 바 너비를 테스트할 때 "가장 넓은 fillRect width를 비교하자"는 아이디어를 썼다가 실패했다. HP가 100이든 50이든 배경 바(200px)가 항상 최대값이기 때문이다.

```
// 잘못된 접근
const maxWidth1 = Math.max(...fullBarCalls.map(c => c[2])); // → 200
const maxWidth2 = Math.max(...halfBarCalls.map(c => c[2])); // → 200 (배경 때문에)
```

수정 방법은 간단했다. "BAR_W(200) 너비의 fillRect가 있는가"와 "BAR_W/2(100) 너비의 fillRect가 있는가"를 각각 체크하는 것으로 바꿨다. 테스트가 더 명확해졌다.

HUD가 보여주는 정보:
- **왼쪽 상단**: HP 바 (색상이 체력에 따라 초록→주황→빨강으로 변함)
- **상단 중앙**: 경과 시간 (`1:15` 포맷)
- **왼쪽 상단 HP 아래**: 킬카운트 `킬: 42 / 100`
- **오른쪽 상단**: 이벤트 상태 (`[E1] 들여쓰기 지옥 진행 중`, `⚠ BOSS 장선형 등장!`)

---

## Stage1 — 모든 것을 묶다

Stage1은 통합 클래스다. Player, WaveSystem, EventSystem, UpgradeSystem을 받아서 `update(dt)` 한 방으로 전체 게임 로직을 처리한다.

```js
const stage = new Stage1({ player, waveSystem, eventSystem, upgradeSystem, ... });
const events = stage.update(dt);
// events: ['event_triggered', 'event_cleared', 'quest_completed', 'boss_triggered', ...]
```

`update(dt)`가 반환하는 이벤트 배열이 핵심이다. HUD 렌더나 UI 모달은 이 배열을 보고 반응한다. Stage1 자신은 화면을 그리지 않는다 — 그것은 `main.js`의 역할이다.

테스트를 짜면서 "보스 트리거 시 일반 적이 모두 제거된다"는 케이스를 확인했을 때 한 가지 설계 결정을 했다. Stage1 안에서 `this.enemies = []`로 직접 비운다. 원래는 게임 엔진(`Game.js`)의 `removeEntity`까지 연동해야 하지만, Stage1 단위 테스트에서는 엔진이 없으니 배열만 비운다. 그리고 main.js에서 보스 트리거 이벤트를 받았을 때 엔진에서 제거하는 로직을 따로 둔다.

이 분리 덕분에 Stage1은 DOM 없이, 엔진 없이, 순수하게 테스트할 수 있다.

---

## 누적 테스트 현황

```
Cycle 1  34개
Cycle 2  64개  (+30)
Cycle 3 122개  (+58)
Cycle 4 166개  (+44)
Cycle 5 207개  (+41)
Cycle 6 249개  (+42) ← 이번
```

**19개 테스트 파일, 249개 테스트 전부 GREEN.**

---

## 이 게임을 만들면서 배운 것

6사이클, 7편의 글을 쓰면서 정리가 된다.

**TDD는 설계 도구다.** "테스트를 먼저 쓴다"는 것은 단순히 테스트 커버리지를 높이는 게 아니다. API를 사용하는 입장에서 먼저 생각하게 만든다. HUD 테스트를 짜면서 "render는 어떤 파라미터를 받아야 하나"를 테스트 코드로 먼저 결정했다. 그 결과 HUD는 독립적으로 테스트 가능한 순수한 렌더러가 됐다.

**의존성 주입이 테스트 가능성을 만든다.** Stage1이 WaveSystem, EventSystem, UpgradeSystem을 생성자에서 받는 이유는 단 하나다 — 테스트에서 원하는 상태로 세팅한 객체를 넣을 수 있기 때문이다. `new Stage1()` 내부에서 `new EventSystem()`을 만들었으면 타이머를 건드릴 수가 없다.

**Canvas 게임도 비즈니스 로직은 분리된다.** 적 스폰, 이벤트 트리거, 킬 카운팅 — 이것들은 Canvas와 전혀 관계없다. Stage1, EventSystem, WaveSystem은 DOM이 없어도 완전히 동작한다. 테스트가 빠른 이유다.

---

## 다음

MVP Stage 1은 완성됐다. 브라우저에서 실제로 플레이할 수 있는 게임이 됐다.

기획에서 "추후 추가 예정"으로 남겨둔 것들이 있다.
- 나머지 무기 5종 (Git, SQL, JavaScript, Django, Linux/Bash)
- 버그별 디버프 시스템
- Stage 2~6

하지만 MVP는 여기서 충분하다. 토이 프로젝트의 목적 — Superpowers + GSD + Gstack 워크플로우를 실제 코드베이스로 검증하는 것 — 은 달성했다.

김지윤은 장선형을 이겼다. (늘 그렇듯이.)
