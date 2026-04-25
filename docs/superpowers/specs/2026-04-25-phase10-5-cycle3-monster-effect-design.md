# Spec: Phase 10.5 Cycle 3 — 몬스터 이펙트 _*.html 스타일 이식

**날짜:** 2026-04-25  
**Phase:** 10.5 / Cycle 3  
**분류:** 수정 (fix)  
**참조 예제:** `examples/monster/**/_*.html` (각 몬스터 타입별 Design 1 파일)

---

## 목표

몬스터 타입별 색상 아이덴티티를 실제 게임에 이식한다.  
히트 스파크, 사망 파티클을 타입 색상으로 분리하고,  
`PixelRenderer`의 몬스터 스프라이트에 글로우 효과를 추가한다.

---

## 타입별 색상 맵

| 몬스터 타입 | 메인 색상 | 글로우 색상 | 참조 파일 |
|------------|----------|------------|---------|
| `syntax_error`      | `#ff2200` | `#ff220088` | `_syntax_error_example_1.html` |
| `null_pointer`      | `#aabbff` | `#8899ff88` | `_null_pointer_example_1.html` |
| `seg_fault`         | `#cc6600` | `#cc660088` | `_seg_fault_example_1.html` |
| `heal_bug`          | `#22cc44` | `#22cc4488` | `_heal_bug_example_2.html` |
| `indentation_error` | `#ff8800` | `#ff880088` | `_indentation_error_example_1.html` |
| `env_error`         | `#2255cc` | `#2255cc88` | `_env_error_example_1.html` |

---

## 이펙트 스펙

### 히트 스파크 (`addHitSpark`)

기존: 단일 흰색 파티클 → **타입별 색상**으로 교체  
`ParticleSystem.addHitSpark(x, y, color, count)` — 이미 color 파라미터 존재, 호출부만 수정  
호출 위치: `core/Collision.js` 또는 `entities/Enemy.js`의 피격 처리

### 사망 파티클 (`addEnemyDeath`)

기존: `['#ff69b4', '#aaaaaa', '#ff99cc']` 고정 → **타입별 색상 배열**로 교체

```
addEnemyDeath(x, y, count, enemyType)
// enemyType 없으면 기존 색상 fallback
```

사망 파티클에 **텍스트 조각 추가 (선택)**:
- `syntax_error` 사망 시: `"SyntaxError"` 글자 조각 3개 흩날림
- `null_pointer` 사망 시: `"NULL"` 글자 조각 흩날림
- 구현 복잡도 높으면 생략, 색상 분리만으로 완료 처리 가능

### 스프라이트 글로우 (`drawSpriteWithGlow`)

`PixelRenderer`에 새 메서드 추가:

```js
drawSpriteWithGlow(ctx, sprite, x, y, scale, glowColor)
// shadowBlur: 16, shadowColor: glowColor 로 drawSprite 래핑
```

`entities/Enemy.js` render 시 몬스터 타입에 따라 `drawSpriteWithGlow` 호출

### 몬스터 HP 바

현재 Enemy가 HP 바를 렌더링하면 타입 색상 적용, 없으면 스킵  
(Enemy 렌더 코드 확인 후 존재 시만 수정)

---

## 구현 범위

| 파일 | 변경 내용 |
|------|----------|
| `systems/ParticleSystem.js` | `addEnemyDeath`에 `enemyType` 파라미터 추가, 색상 맵 상수 추가 |
| `sprites/PixelRenderer.js` | `drawSpriteWithGlow` 메서드 추가 |
| `entities/Enemy.js` | render 시 `drawSpriteWithGlow` 호출, 피격 시 타입 색상 전달 |
| `core/Collision.js` | `addHitSpark` 호출 시 enemy.type 색상 전달 |

---

## 완료 기준

- [ ] 각 몬스터 타입의 히트 스파크가 타입 색상으로 표시됨
- [ ] 사망 파티클이 타입별 색상으로 폭발함
- [ ] 스프라이트 주변에 타입 색상 글로우가 렌더링됨
- [ ] 기존 Enemy, Collision, ParticleSystem 테스트 전부 통과
