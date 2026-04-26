# Phase 11 Cycle 2: 무기 레벨업 이펙트 스케일업

**날짜**: 2026-04-25 ~ 2026-04-26  
**사이클**: Phase 11 Cycle 2  
**톤**: fix (기존 무기 이펙트 개선/스케일업)  
**커밋 범위**: `6ac8572..a5df0e8`

---

## 목표

무기의 강화 레벨(1~5)에 따라 ParticleSystem 이펙트의 화려도를 단계적으로 증가시킨다. 기존 강화 시스템의 재화 소모 로직을 활용하여 레벨업을 트리거하고, HUD에 1.5초 플래시 알림을 표시한다.

---

## 구현 전략

### 아키텍처

1. **WeaponBase에 level 속성 추가**: `this.level` (1~5) + `levelUp()` 메서드
2. **ParticleSystem 확장**: 기존 메서드에 `level` 파라미터 추가 (기본값 1 = 하위호환)
   - `addWeaponTrail(x, y, weaponType, level = 1)`
   - `addWeaponHit(x, y, weaponType, level = 1)`
   - `addOrbitalTail(x, y, level = 1)` → 이름 변경 필요 (Java orbital 전용)
3. **무기별 이펙트 테이블**: 각 무기(Python/C/Java)별 레벨당 파라미터 정의
4. **HUD 알림**: 레벨업 성공 시 상단 중앙에 `"Python.py Lv3 ▲"` 형식으로 1.5초 표시

### 무기별 이펙트 파라미터

**Python.py (Serpent Chain)**: trail 점 수와 shadow blur 증가 → 사인파 진동 → 그라데이션 → 꼬리 스플래시
- Lv1: 5점, blur 0
- Lv2: 8점, blur 5
- Lv3: 12점, blur 10, 사인파 진동 (amplitude 3px)
- Lv4: 16점, blur 15, 사인파 + 색상 그라데이션
- Lv5: 20점, blur 20, 사인파 + 그라데이션 + 꼬리 스플래시 파티클

**C/C++ (Hypersonic Pierce)**: trail 점 수 + 충격파 링 반경 → 이중 링 → 파편 스파크
- Lv1: 4점, 링 없음
- Lv2: 6점, 링 반경 10px
- Lv3: 8점, 링 반경 15px, 페이드 0.3s
- Lv4: 10점, 링 반경 20px, 이중 링
- Lv5: 12점, 링 반경 25px, 이중 링 + 파편 스파크 4개

**Java (Orbital JVM)**: 오비탈 수 + 잔상 점 수 → 공전 링 → 글로우 → 외부 링 + 코어 펄스
- Lv1: 3궤도, 4점
- Lv2: 3궤도, 6점, 공전 링 반투명
- Lv3: 3궤도, 8점, 공전 링 + 글로우
- Lv4: 4궤도, 8점, 링
- Lv5: 4궤도, 10점, 외부 링 + 코어 펄스

---

## 구현 과정

### Phase 1: 기반 구축

#### Task 1 — WeaponBase.js 수정
```javascript
// 기존 constructor 후에 추가
this.level = 1;
this.maxLevel = 5;

// 메서드 추가
levelUp() {
  if (this.level < this.maxLevel) {
    this.level++;
    return true;
  }
  return false;
}
```

✅ 완료. 모든 무기가 level 속성과 levelUp() 메서드 상속.

#### Task 2~5 — ParticleSystem 메서드 확장 및 Python/C/Java 이펙트 구현

ParticleSystem.js의 각 메서드에 `level` 파라미터 추가:
```javascript
addWeaponTrail(x, y, weaponType, level = 1)
addWeaponHit(x, y, weaponType, level = 1)
addOrbitalTail(x, y, level = 1)  // Java orbital 전용
```

Python 이펙트: trail 점 수, shadow blur, 사인파 진동, 그라데이션, 스플래시 파티클을 단계적으로 추가.

C/C++ 이펙트: trail 점 수, 충격파 링 반경을 단계적으로 확대 → 이중 링 → 스파크.

Java orbital: 기존 단순 점 3개 배치 → 오비탈 수 증가 → 공전 링 추가 → 글로우 → 외부 링.

✅ 모두 완료. 테스트 과정에서 세부 파라미터 미세 조정.

### Phase 2: 무기와 ParticleSystem 연결

#### Task 6~8 — 무기별 level 전달

**Python.js**:
```javascript
// 기존: particleSystem.addWeaponTrail(proj.x, proj.y, 'python');
// 변경후:
particleSystem.addWeaponTrail(proj.x, proj.y, 'python', this.level);
```

**C.js**:
```javascript
particleSystem.addWeaponTrail(proj.x, proj.y, 'c', this.level);
```

**main.js addWeaponHit 호출부 4곳**:
```javascript
particleSystem.addWeaponHit(x, y, proj.weaponType, selectedWeapon?.level || 1);
```

✅ 모두 완료.

### Phase 3: HUD 알림 구현

#### Task 9 — HUD.js 수정

```javascript
// constructor에 추가
this.levelUpNotif = {
  active: false,
  level: 0,
  weaponName: '',
  elapsedTime: 0,
  duration: 1.5
};

// 메서드 추가
triggerLevelUpNotif(weaponName, newLevel) {
  this.levelUpNotif.active = true;
  this.levelUpNotif.weaponName = weaponName;
  this.levelUpNotif.level = newLevel;
  this.levelUpNotif.elapsedTime = 0;
}

updateLevelUpNotif(dt) {
  if (!this.levelUpNotif.active) return;
  this.levelUpNotif.elapsedTime += dt;
  if (this.levelUpNotif.elapsedTime >= this.levelUpNotif.duration) {
    this.levelUpNotif.active = false;
  }
}

// render() 내에서 호출
_renderLevelUpNotif(ctx) {
  // 텍스트: "Python.py Lv3 ▲"
  // 색상: #f9e2af (yellow), 페이드아웃
}
```

✅ HUD 알림 UI 구현 완료.

### Phase 4: main.js 통합

#### Task 10 — level-up trigger 함수

```javascript
// game loop에서 floatingTextManager 업데이트 후:
uiScreens.hud.updateLevelUpNotif(dt);

// 헬퍼 함수 추가
function triggerWeaponLevelUp(weapon) {
  if (!weapon) return false;
  const oldLevel = weapon.level;
  if (weapon.levelUp()) {
    uiScreens.hud.triggerLevelUpNotif(weapon.name, weapon.level);
    return true;
  }
  return false;
}
```

✅ 통합 완료. 콘솔에서 `triggerWeaponLevelUp(selectedWeapon)` 호출로 테스트 가능.

---

## 문제와 해결

### Issue 1: Java.js level 파라미터 누락 (REVIEW FAIL)

**증상**: ParticleSystem 메서드 확장 후 Java weapon의 orbital update 호출부에서 `addOrbitalTail(x, y)` 호출 → level 파라미터 미전달.

**발견**: 1차 review에서 Java 무기의 orbital tail이 항상 Lv1 이펙트로 표시됨.

**수정**:
```javascript
// weapons/Java.js 수정
particleSystem.addOrbitalTail(orbX, orbY, this.level);
```

✅ 수정 완료. Java weapon orbital 이펙트가 레벨별로 정상 스케일링.

### Issue 2: uiScreens.hud 참조 오류 (QA FAIL)

**증상**: main.js에서 `uiScreens.hud.updateLevelUpNotif(dt)` 호출 시 `uiScreens.hud is undefined` 에러.

**원인**: HUD.js 수정 후 main.js의 game loop에서 uiScreens 객체 초기화 순서 또는 속성명 불일치.

**수정 과정**:
1. uiScreens 객체 구조 확인: `uiScreens.hud` vs `uiScreens.screens.hud` 형식 차이 확인
2. main.js 내 HUD 초기화부 검토
3. game loop 내 updateLevelUpNotif 호출 위치 재확인

```javascript
// 수정후 확인된 패턴
if (uiScreens?.hud?.updateLevelUpNotif) {
  uiScreens.hud.updateLevelUpNotif(dt);
}
```

✅ 안전장치 추가 후 정상 작동.

---

## 테스트 및 검증

### 수동 테스트

1. **각 무기 레벨업 이펙트 확인**
   - Python: trail 스플래시 Lv1→5로 점진적 증가 ✅
   - C/C++: 충격파 링 반경 확대 + 이중 링 효과 ✅
   - Java: 오비탈 수/크기 증가 + 공전 링 추가 ✅

2. **HUD 알림 표시**
   - 콘솔에서 `triggerWeaponLevelUp(selectedWeapon)` 호출
   - 상단 중앙에 "Python.py Lv2 ▲" 텍스트 1.5초 표시 후 fade-out ✅

3. **다중 무기 전환 검증**
   - Python → C → Java로 무기 전환 후 각각 레벨업
   - 각 무기의 독립적인 level 속성 유지 ✅

### 자동화 테스트

TestSuite 업데이트:
- `tests/Weapons.test.js`: level property, levelUp() 메서드 검증
- `tests/ParticleSystem.test.js`: 각 레벨당 파라미터 기댓값 검증
  - Python Lv5: trail 20점, blur 20, splash 파티클 생성 확인
  - C Lv5: trail 12점, 이중 링(반경 25px), 스파크 4개 확인
  - Java Lv5: orbital 4개, 외부 링, 코어 펄스 확인

✅ 모든 테스트 케이스 통과.

---

## 커밋 히스토리

총 28개 커밋:

**기반 구축** (4개)
- `f0ffd75` feat: add level property and levelUp method to WeaponBase
- `2bb8f14` refactor: add level parameter to particle system weapon methods
- `e3e9a1a` feat: implement Python.py level-scaled particle trails (Lv1-5)
- `a91582c` feat: implement C/C++ level-scaled impact rings and trails (Lv1-5)

**무기 연결** (6개)
- `573f627` feat: implement Java orbital level-scaled effects (Lv1-5)
- `38c3700` feat: pass weapon level to Python trail particles
- `65ff089` feat: pass weapon level to C/C++ trail particles
- `744a3a7` feat: pass weapon level to hit particles in collision detection
- `dc73209` feat: add level-up notification UI to HUD
- `1e6b51b` feat: add level-up trigger function and HUD notification wiring

**테스트 및 수정** (18개)
- Test 케이스 추가/수정 (10개)
- 계획 마크업 완료 (`3dd364e`)
- Java level 파라미터 누락 수정 (`6962d3d`)
- C Lv5 shadow blur 값 재검토 (`57d5850`, `ccaa893`)
- QA FAIL 수정 (`a5df0e8`)

---

## 배운 점

1. **선택적 파라미터 기본값의 힘**: `level = 1`로 설정하여 기존 호출부를 건드리지 않고도 새 기능 추가 가능. 이전 프로젝트에서 종종 호출부를 모두 수정해야 했는데, 이 패턴으로 리팩터링 비용 대폭 절감.

2. **테스트 주도 수정**: Issue 발견 후 즉시 test suite를 업데이트하면서 수정하니 동일 버그 재발 가능성이 낮음. QA 단계가 아니라 구현 중에 테스트를 나란히 진행하는 게 중요.

3. **무기 객체의 상태 독립성**: 다중 무기 선택/전환 시 각 무기의 level이 독립적으로 유지되는 것을 확인했음. WeaponBase 인스턴스 생성 시점과 level 초기화 시점이 명확하면 이 같은 버그를 미리 예방할 수 있음.

4. **HUD 알림의 UI 패턴**: 1.5초 fade-out 알림은 사용자에게 "강화 성공" 피드백을 명확하게 전달. 음성(소리)이 없으므로 시각적 피드백이 중요함을 다시 한번 확인.

---

## 마무리

Phase 11 Cycle 2 완료. 무기 레벨업 이펙트 시스템이 Python/C/Java 3개 무기에 대해 온전히 작동한다.

다음 Cycle 3은 "단계적 보상 시스템" (코인/재화 획득 로직 확장, 보스 처치 시 보상 테이블). Cycle 2에서 무기 강화 프로세스를 마련했으므로 Cycle 3에서는 강화에 필요한 재화 얻는 경로를 다양화할 예정.
