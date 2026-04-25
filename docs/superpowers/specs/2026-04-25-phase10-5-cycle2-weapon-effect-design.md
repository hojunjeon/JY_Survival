# Spec: Phase 10.5 Cycle 2 — 무기 이펙트 hero_*.html 스타일 이식

**날짜:** 2026-04-25  
**Phase:** 10.5 / Cycle 2  
**분류:** 수정 (fix)  
**참조 예제:** `examples/weapon_effect/hero_python.html`, `hero_c.html`, `hero_java.html`

---

## 목표

`systems/ParticleSystem.js`에 무기별 전용 파티클 효과를 추가하고,  
각 무기 클래스에서 발사 시 해당 이펙트를 호출하도록 연결한다.

---

## 무기별 이펙트 스펙

### Python — Serpent Chain (뱀 체인)

- **참조:** `hero_python.html` (Serpent Constrictor)
- **색상:** `#44ff44` (네온 그린), 하이라이트 `#88ffaa`
- **표현:** 발사체 뒤에 뱀 몸통처럼 구불구불한 trail 파티클
  - trail 점 20개, 사인파 진동 (amplitude 4px)
  - `shadowBlur: 20, shadowColor: '#44ff44'`
  - 꼬리로 갈수록 alpha 0→1 페이드

### C/C++ — Hypersonic Pierce (고속 슬래시)

- **참조:** `hero_c.html`
- **색상:** `#64b4ff` (아이스 블루), 하이라이트 `#aaddff`
- **표현:** 발사체 경로에 슬래시 trail + 충격파 링
  - trail 점 12개, 직선
  - 충격파: 명중 시 반경 20px 링 확장 (0.3s 페이드)
  - `shadowBlur: 10, shadowColor: '#64b4ff'`

### Java — Orbital JVM (오비탈 오브)

- **참조:** `hero_java.html`
- **색상:** `#ffa032` (앰버), 하이라이트 `#ffcc88`
- **표현:** 오비탈 오브 3개 각각에 회전 궤적 tail
  - 오브 뒤 8개 잔상 점 (angle - j*0.12)
  - 공전 링: `rgba(255,160,50,0.15)` 원형 선
  - `shadowBlur: 20, shadowColor: '#ffa032'`

---

## 구현 범위

### ParticleSystem.js 추가 메서드

```
addWeaponTrail(x, y, weaponType)   // 매 프레임 발사체 위치에서 호출
addWeaponHit(x, y, weaponType)     // 명중 시 호출
addOrbitalTail(x, y)               // Java 오브용
```

### 무기 클래스 연결

| 파일 | 변경 내용 |
|------|----------|
| `weapons/Python.js` | 발사체 update 시 `addWeaponTrail(x, y, 'python')` |
| `weapons/C.js`      | 발사체 update 시 `addWeaponTrail(x, y, 'c')` |
| `weapons/Java.js`   | 오브 update 시 `addOrbitalTail(x, y)` |
| `entities/Projectile.js` | 명중 콜백에서 `addWeaponHit` 호출 가능하도록 weaponType 전달 |
| `systems/ParticleSystem.js` | 위 3개 메서드 추가 |

---

## 완료 기준

- [ ] Python 발사체에 구불구불한 초록 trail이 보임
- [ ] C/C++ 발사체에 파란 슬래시 trail + 명중 시 충격파 링이 보임
- [ ] Java 오비탈 오브에 앰버 궤적 잔상이 보임
- [ ] 기존 파티클(`addHitSpark`, `addEnemyDeath`, `addHeal`) 동작 유지
- [ ] 기존 무기/파티클 테스트 전부 통과
