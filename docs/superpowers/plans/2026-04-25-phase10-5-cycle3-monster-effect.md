# Phase 10.5 Cycle 3 — 몬스터 이펙트 구현 Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement task-by-task. Use `[~]` to skip completed tasks.

**Goal:** 몬스터 타입별 색상 아이덴티티를 게임에 이식한다. 히트 스파크·사망 파티클을 타입 색상으로 교체하고, PixelRenderer에 글로우 메서드를 추가하여 Enemy 렌더에서 호출한다.

**Spec:** `docs/superpowers/specs/2026-04-25-phase10-5-cycle3-monster-effect-design.md`

---

## Task 1: ParticleSystem — ENEMY_TYPE_COLORS 상수 + addEnemyDeath enemyType 파라미터

**파일:** `systems/ParticleSystem.js`

- 클래스 최상단에 색상 맵 상수 추가 (export):

```js
export const ENEMY_TYPE_COLORS = {
  syntax_error:      '#ff2200',
  null_pointer:      '#aabbff',
  seg_fault:         '#cc6600',
  heal_bug:          '#22cc44',
  indentation_error: '#ff8800',
  env_error:         '#2255cc',
};
```

- `addEnemyDeath(x, y, count = 8, enemyType = null)` 시그니처 변경:
  - `enemyType` 있으면 해당 색상 배열 `[mainColor, '#ffffff', mainColor]` 사용
  - `enemyType` 없거나 맵에 없으면 기존 `['#ff69b4', '#aaaaaa', '#ff99cc']` fallback

- [x] Task 1: ENEMY_TYPE_COLORS 추가 + addEnemyDeath enemyType 파라미터

---

## Task 2: PixelRenderer — drawSpriteWithGlow 메서드 추가

**파일:** `sprites/PixelRenderer.js`

PixelRenderer 객체에 메서드 추가:

```js
drawSpriteWithGlow(ctx, sprite, x, y, scale, glowColor) {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = glowColor;
  this.drawSprite(ctx, sprite, x, y, scale);
  ctx.restore();
},
```

- [x] Task 2: `drawSpriteWithGlow` 메서드 추가

---

## Task 3: Enemy.js — render 시 drawSpriteWithGlow 호출

**파일:** `entities/Enemy.js`

- `render(ctx)` 메서드에서 스프라이트 렌더 블록 수정:
  - BUG_SPRITES에 타입이 있을 때 `PixelRenderer.drawSprite` → `PixelRenderer.drawSpriteWithGlow` 로 교체
  - glowColor는 `ENEMY_TYPE_COLORS[this.type]` + `'88'` suffix (반투명 글로우)
  - ENEMY_TYPE_COLORS에 없는 타입(`race_condition`, `memory_leak` 등)은 기존 렌더 유지

현재 Enemy.js:229 라인:
```js
PixelRenderer.drawSprite(ctx, sprite, this.x - this.width / 2, this.y - this.height / 2, 2);
```
교체 후:
```js
const glowColor = ENEMY_TYPE_COLORS[this.type];
if (glowColor) {
  PixelRenderer.drawSpriteWithGlow(ctx, sprite, this.x - this.width / 2, this.y - this.height / 2, 2, glowColor + '88');
} else {
  PixelRenderer.drawSprite(ctx, sprite, this.x - this.width / 2, this.y - this.height / 2, 2);
}
```

- `import { ENEMY_TYPE_COLORS } from '../systems/ParticleSystem.js';` 추가

- [x] Task 3: Enemy.js render에서 drawSpriteWithGlow 호출

---

## Task 4: main.js — addHitSpark 호출부 enemy 타입 색상 전달

**파일:** `main.js`

- `import { ParticleSystem, ENEMY_TYPE_COLORS } from './systems/ParticleSystem.js';` (ENEMY_TYPE_COLORS 추가)

- 아래 addHitSpark 호출 위치에서 enemy 타입 색상 전달:
  - **line ~790**: `particleSystem.addHitSpark(enemy.x, enemy.y, proj.color, 5)` → `particleSystem.addHitSpark(enemy.x, enemy.y, ENEMY_TYPE_COLORS[enemy.type] || proj.color, 5)`
  - **line ~801**: 동일
  - **line ~380**: `WEAPON_COLOR['LinuxBash']` → `ENEMY_TYPE_COLORS[enemy.type] || WEAPON_COLOR['LinuxBash']`
  - **line ~902**: `'#b07219'` → `ENEMY_TYPE_COLORS[enemy.type] || '#b07219'`

- `addEnemyDeath` 호출 (line ~1041):
  - `particleSystem.addEnemyDeath(e.x, e.y, 8)` → `particleSystem.addEnemyDeath(e.x, e.y, 8, e.type)`

- [x] Task 4: main.js hitSpark + enemyDeath 호출부 수정

---

## Task 5: 테스트 업데이트

**파일:** `tests/ParticleSystem.test.js`

- `addEnemyDeath` 기존 테스트: 파라미터 변경 없이 통과 확인 (enemyType 생략 시 fallback 동작)
- `addEnemyDeath` 신규 케이스 추가:
  - `addEnemyDeath(100, 100, 4, 'syntax_error')` 호출 시 파티클 color가 `#ff2200` 또는 `#ffffff` 중 하나인지 확인

- [x] Task 5: ParticleSystem 테스트 업데이트

---

## Task 6: 전체 테스트

**명령:** `npm test`

- [x] Task 6: 모든 테스트 통과 확인
