# 편 23: 무기에 혼을 불어넣다 — ParticleSystem의 이펙트 이식

**주제:** Phase 10.5 Cycle 2 — 기존 무기 3개에 고유한 비주얼 이펙트 추가  
**날짜:** 2026-04-25  
**톤:** fix (기존 무기에 이펙트 이식)

---

## 지난 화까지

편 22에서는 HUD를 정리했다. 게임 화면의 상단에 현재 무기, 체력, 골드 정보를 깔끔하게 배치했다. 이제 화면에 보이는 정보는 완성된 상태다.

하지만 **게임이 너무 밋밋했다.** 무기를 발사하고 적을 맞춰도 화면에 큰 변화가 없었다. 파티클 효과는 있었지만, 모든 무기가 똑같은 흰색 스파크만 튀었다.

예제 HTML 파일(`hero_python.html`, `hero_c.html`, `hero_java.html`)을 살펴보니, 각 무기가 정말 고유한 시각 표현을 가지고 있었다. Python은 뱀처럼 구불거리는 초록 자국, C는 칼날처럼 매끄러운 파란 슬래시, Java는 궤도처럼 회전하는 주황 빛줄기.

이제 그걸 실제 게임에 옮겨오기로 했다.

---

## 무기별 캐릭터를 살려라

### Python — 뱀의 질주, 구불거리는 초록 자국

```python
# 무기 컨셉
Serpent Chain: 뱀처럼 구불거리는 체인
```

발사체가 움직일 때마다 뱀 몸통처럼 구불구불한 trail을 남긴다. 네온 그린(`#44ff44`)으로 20개 점을 이으면서, 각 점이 사인파처럼 상하로 진동한다. 꼬리로 갈수록 희미해지는 fade 효과까지 더하면, 흐릿하게 사라지는 뱀의 꼬리처럼 보인다.

```javascript
// ParticleSystem.js 내부 - addWeaponTrail 메서드
addWeaponTrail(x, y, weaponType) {
  if (weaponType === 'python') {
    // 20개 점, 사인파 진동, amplitude 4px
    // 색상: #44ff44, #88ffaa 교대로
    // shadowBlur: 20, shadowColor: '#44ff44'
  }
}
```

개발 중에 깨달은 점은, **trail이 얼마나 중요한지**였다. 발사체 자체는 작은 원형 이미지지만, 그 뒤에 흐릿한 궤적이 남으면 마치 실제 물체가 날아가는 것처럼 느껴진다. 눈의 착각인데, 그 착각이 게임의 손맛을 결정한다.

### C/C++ — 고속 슬래시, 파란 칼날

```c
// 무기 컨셉
Hypersonic Pierce: 초음속 칼날
```

C의 이펙트는 Python과 다르다. 슬래시 무기답게 직선으로 곧게 뻗은 파란 trail을 남긴다(`#64b4ff`). 12개 점을 일직선으로 배열하면, 칼로 베어낸 궤적처럼 보인다.

더 인상적인 건 **명중 이펙트**다. 적에게 맞는 순간, 발사체 위치에서 반경 20px 원형의 충격파가 확산된다. 0.3초 동안 점점 커졌다가 사라진다. 그 효과가 없으면 발사체가 적에 닿았는지도 모르겠지만, 충격파가 있으면 **"어! 뭔가 맞췄다!"** 하는 느낌이 든다.

```javascript
// 명중 이펙트 연결 흐름
Projectile → 충돌 감지 → 
particleSystem.addWeaponHit(x, y, 'c') → 
8방향 확산 파티클 + 링 확장
```

### Java — 오비탈의 공전, 주황 궤적 잔상

```java
// 무기 컨셉
Orbital JVM: 3개 오브가 공전하는 가상 머신
```

Java는 가장 복잡하지만, 가장 시각적으로 독특하다. 발사체가 아니라 **플레이어 주위를 도는 3개 오브**이기 때문이다. 각 오브 뒤에 8개 잔상 점을 남기는데, 이들이 오브보다 약간 뒤에서 같은 궤도로 회전한다.

색상은 앰버(`#ffa032`)로, 따뜻한 주황빛이 마치 태양계처럼 보인다. 뒤로 갈수록 alpha가 감소하니, 공전 궤적이 연기처럼 흐려진다.

```javascript
// Java.js - 오브 위치 업데이트 시 호출
addOrbitalTail(orbitalX, orbitalY) {
  // 8개 잔상, 색상 #ffa032, shadowBlur: 20
  // 뒤로 갈수록 alpha: 1 → 0
}
```

---

## 설계: ParticleSystem 확장이 깔끔한 이유

처음엔 각 무기 클래스에 `drawTrail()` 메서드를 따로 만들 생각도 했다. Python에는 Python용 trail 렌더링, C에는 C용 렌더링, Java에는 Java용 렌더링을 각각 구현하는 식으로.

하지만 그러면:

1. **렌더링 로직이 분산된다** — 어디서 trail을 그리는지 찾기 어렵다
2. **ParticleSystem의 존재 의미가 흐려진다** — 이미 spark, death, heal 파티클을 관리하는데 또 따로 관리?
3. **테스트가 복잡해진다** — 각 무기마다 캔버스 렌더링을 mocking 해야 함

대신 선택한 방식:

```javascript
// ParticleSystem에 3개 메서드 추가
addWeaponTrail(x, y, weaponType)  // 매 프레임 호출
addWeaponHit(x, y, weaponType)    // 명중 시 호출
addOrbitalTail(x, y)              // Java 오브용
```

**각 메서드는 무기 타입별로 파티클을 생성하고, 기존 render() 메서드에서 일괄 처리한다.** ParticleSystem 내부에는 `particles` 배열에 모든 파티클이 들어 있고, render()가 위치/색상/alpha를 일괄 갱신한다.

결과:

- 무기 클래스는 `this.particleSystem.addWeaponTrail(x, y, 'python')` 한 줄만 호출
- ParticleSystem 렌더링 로직은 한 곳에 집중
- 테스트도 간단: `addWeaponTrail()` 호출 후 `particles` 배열 확인

**이게 좋은 설계인 이유는, 책임이 명확하기 때문이다.** ParticleSystem은 "파티클을 생성하고 업데이트하고 렌더링하는" 책임만 지고, 무기는 "언제 파티클을 생성할지" 판단하는 책임만 진다. 둘이 섞이지 않는다.

---

## 구현 과정: Task 1~8 실행

Plan을 8개 Task로 쪼갰다:

**Task 1: ParticleSystem — addWeaponTrail 메서드**
- Python/C 각각의 trail 생성 로직
- `shadowBlur` 속성을 파티클에 추가

**Task 2: ParticleSystem — addWeaponHit 메서드**
- C 명중 시 링 확산
- 다른 무기는 기존 `addHitSpark` fallback

**Task 3: ParticleSystem — addOrbitalTail 메서드**
- 8개 잔상 점, alpha fade

**Task 4~5: Python.js, C.js — ParticleSystem 연결**
- 각 무기의 `update(dt, particleSystem)` 메서드
- 활성 발사체마다 trail 생성

**Task 6: 게임 루프 통합**
- `main.js`에서 무기 update 시 `particleSystem` 전달
- Java 오브마다 `addOrbitalTail` 호출

**Task 7: 명중 이펙트 연결**
- 발사체 충돌 시 `addWeaponHit` 호출

**Task 8: 전체 테스트**
- `npm test` 통과 확인

각 Task는 순차적이었지만, 병렬 가능한 부분도 있었다. 예를 들어 Task 4와 Task 5는 구조가 동일하니 한 번에 작성할 수 있었다.

---

## 삭제된 함수와 다시 쓴 것

**삭제:**
- `weapons/WeaponBase.js`의 더미 `update(dt)` — 모든 무기가 `update(dt, particleSystem)` 시그니처로 통일

**추가:**
- `ParticleSystem.addWeaponTrail()` — 무기 trail 파티클
- `ParticleSystem.addWeaponHit()` — 무기별 명중 이펙트
- `ParticleSystem.addOrbitalTail()` — Java 오브 궤적
- `render()` 메서드: `shadowBlur`, `shadowColor` 파티클 지원

**수정:**
- `weapons/Python.js`, `weapons/C.js` — `update` 메서드에 ParticleSystem 전달
- `weapons/Java.js` — 오브 위치 추적 + `addOrbitalTail` 호출
- `main.js` — 무기 update 호출 시 `particleSystem` 전달

---

## 테스트 케이스: 파티클이 실제로 생기는가?

```javascript
describe('ParticleSystem', () => {
  describe('addWeaponTrail', () => {
    it('should create 20 particles for python trail', () => {
      const system = new ParticleSystem();
      system.addWeaponTrail(100, 100, 'python');
      expect(system.particles.length).toBe(20);
    });

    it('should create 12 particles for c trail', () => {
      const system = new ParticleSystem();
      system.addWeaponTrail(100, 100, 'c');
      expect(system.particles.length).toBe(12);
    });
  });

  describe('addWeaponHit', () => {
    it('should create 8 particles for c hit', () => {
      const system = new ParticleSystem();
      system.addWeaponHit(100, 100, 'c');
      expect(system.particles.length).toBe(8);
    });
  });

  describe('addOrbitalTail', () => {
    it('should create 8 particles for orbital tail', () => {
      const system = new ParticleSystem();
      system.addOrbitalTail(100, 100);
      expect(system.particles.length).toBe(8);
    });
  });
});
```

모든 테스트가 통과했다. 각 메서드가 예상한 개수의 파티클을 생성한다.

---

## 결과: 게임이 살아났다

빌드 후 게임을 실행하면:

1. **Python 무기 발사:** 초록 뱀 자국이 구불거리며 흐릿하게 사라진다
2. **C 무기 발사:** 파란 슬래시가 곧게 뻗고, 명중 시 링이 확산된다
3. **Java 오브 공전:** 주황 궤적이 오브 뒤를 따라 회전한다

각 무기가 이제 **자신만의 캐릭터**를 가졌다. 게임이 훨씬 생생해졌다.

---

## 깨달은 점

1. **trail의 힘** — 발사체 자체가 작아도, 그 뒤의 궤적이 있으면 게임이 살아난다
2. **명중 이펙트의 중요성** — "맞췄는지 안 맞췄는지" 불명확한 게임은 답답하다. 명중 이펙트 하나로 명확성이 생긴다
3. **책임 분리** — 파티클 렌더링을 ParticleSystem에 집중시키니, 코드가 훨씬 깔끔했다
4. **색상의 언어** — 각 무기의 색상(초록, 파랑, 주황)이 그 무기의 정체성이 된다

다음 Cycle에서는 적들도 비슷하게 비주얼을 개선할 예정이다. 적이 죽을 때 더 화려한 이펙트, 적이 공격할 때 경고 효과. 그러면 게임이 정말 완성된 모습이 될 것 같다.
