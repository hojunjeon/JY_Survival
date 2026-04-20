# Phase 9 Gameplay Improvements + Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5개 버그/밸런스 픽스 + WaveSystem minWave 필드 도입으로 게임플레이 개선

**Architecture:** main.js 발사 로직에 nearest-enemy 탐색을 추가해 auto-aim 구현, WaveSystem.js의 WAVE_TYPES 배열을 minWave 필드를 가진 객체 배열로 교체, Player.js에 applyKnockback() 메서드 추가. 모든 변경은 기존 인터페이스 불변.

**Tech Stack:** Vanilla JS (ES6 modules), HTML5 Canvas. 자동화 테스트 없음 — 브라우저 수동 검증.

---

## File Map

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `systems/WaveSystem.js` | Modify | WAVE_TYPES→WAVE_TABLE, waveCount 카운터, minWave 필터 |
| `entities/Player.js` | Modify | applyKnockback() 메서드 추가 |
| `main.js` | Modify | auto-aim 탐색 (line 332), knockback 호출 (line 945), REVERSED CONTROLS y:40→60 (line 1287) |
| `weapons/Python.js` | Modify | projectileSpeed 200→240, cooldown 1.0→0.9 |

---

## Task 1: WaveSystem minWave 필드 도입 (T2 + Cycle 2 T1)

**Files:**
- Modify: `systems/WaveSystem.js`

- [ ] **Step 1: WAVE_TABLE 객체 배열로 교체 + waveCount 추가**

`systems/WaveSystem.js` 전체를 아래로 교체:

```js
import { createEnemy } from '../entities/Enemy.js';

const WAVE_TABLE = [
  { type: 'syntax_error',       minWave: 1  },
  { type: 'null_pointer',       minWave: 1  },
  { type: 'seg_fault',          minWave: 1  },
  { type: 'memory_leak',        minWave: 1  },
  { type: 'race_condition',     minWave: 5  },
  { type: 'infinite_loop',      minWave: 8  },
  { type: 'input_mismatch',     minWave: 8  },
  { type: 'library_dependency', minWave: 10 },
];

export class WaveSystem {
  constructor({ spawnInterval, canvasWidth, canvasHeight }) {
    this.spawnInterval = spawnInterval;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.elapsed = 0;
    this.eventMode = null;       // null | { type, remaining }
    this.waveCount = 0;
  }

  setEventMode(type, count) {
    this.eventMode = { type, remaining: count };
    this.elapsed = 0;
  }

  clearEventMode() {
    this.eventMode = null;
  }

  // 하위 호환 별칭
  setEventEnemyType(type) {
    this.eventMode = { type, remaining: Infinity };
  }

  clearEventEnemyType() {
    this.eventMode = null;
  }

  update(dt, playerX = null, playerY = null) {
    this.elapsed += dt;
    if (this.elapsed >= this.spawnInterval) {
      this.elapsed -= this.spawnInterval;
      return this._spawnWave(playerX, playerY);
    }
    return [];
  }

  _spawnWave(playerX, playerY) {
    this.waveCount++;

    if (this.eventMode && this.eventMode.remaining <= 0) return [];

    const maxCount = this.eventMode
      ? Math.min(3, this.eventMode.remaining)
      : 3;

    const spawned = [];
    for (let i = 0; i < maxCount; i++) {
      const { x, y } = this._edgePosition(playerX, playerY);

      let type;
      if (this.eventMode?.type) {
        type = this.eventMode.type;
      } else {
        const available = WAVE_TABLE.filter(e => this.waveCount >= e.minWave);
        type = available[Math.floor(Math.random() * available.length)].type;
      }

      if (type === 'race_condition') {
        const offset = 60;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x + Math.cos(angle) * offset;
        const y2 = y + Math.sin(angle) * offset;

        const enemy1 = createEnemy(type, x, y);
        const enemy2 = createEnemy(type, x2, y2);
        enemy1.linkedEnemy = enemy2;
        enemy2.linkedEnemy = enemy1;

        spawned.push(enemy1, enemy2);
      } else {
        spawned.push(createEnemy(type, x, y));
      }
    }

    if (this.eventMode) {
      this.eventMode.remaining -= spawned.length;
    }

    return spawned;
  }

  _edgePosition(playerX, playerY) {
    const side = Math.floor(Math.random() * 4);

    if (playerX == null || playerY == null) {
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      switch (side) {
        case 0: return { x: 0, y: Math.random() * h };
        case 1: return { x: w, y: Math.random() * h };
        case 2: return { x: Math.random() * w, y: 0 };
        case 3: return { x: Math.random() * w, y: h };
      }
    }

    const hw = this.canvasWidth  / 2 + 100;
    const hh = this.canvasHeight / 2 + 100;
    const WORLD_W = 2000, WORLD_H = 2000;

    let x, y;
    switch (side) {
      case 0:
        x = playerX - hw;
        y = playerY - hh + Math.random() * (hh * 2);
        break;
      case 1:
        x = playerX + hw;
        y = playerY - hh + Math.random() * (hh * 2);
        break;
      case 2:
        x = playerX - hw + Math.random() * (hw * 2);
        y = playerY - hh;
        break;
      case 3:
        x = playerX - hw + Math.random() * (hw * 2);
        y = playerY + hh;
        break;
    }

    x = Math.max(0, Math.min(WORLD_W, x));
    y = Math.max(0, Math.min(WORLD_H, y));

    return { x, y };
  }
}
```

- [ ] **Step 2: 브라우저에서 게임 실행 — 콘솔 오류 없음 확인**

브라우저에서 `index.html` 열기. 개발자 도구 콘솔에 오류 없으면 통과.

- [ ] **Step 3: 웨이브 타이밍 수동 검증**

게임 시작 직후(웨이브 1~7 기간): `input_mismatch`, `infinite_loop` 적이 스폰되지 않음을 확인.
웨이브 8+ 이후: 두 타입이 정상 등장함을 확인.
(임시 확인: `waveSystem.waveCount` 를 콘솔에서 조회 가능)

- [ ] **Step 4: 커밋**

```bash
git add systems/WaveSystem.js
git commit -m "feat: phase9 T2+C2T1 — WaveSystem minWave 필드 도입 (웨이브 타입별 최소 등장 조건)"
```

---

## Task 2: 플레이어 넉백 (T3)

**Files:**
- Modify: `entities/Player.js` (메서드 추가)
- Modify: `main.js` (충돌 처리 호출 추가)

- [ ] **Step 1: Player.js에 applyKnockback() 추가**

`entities/Player.js`의 `takeDamageFromContact` 메서드 아래에 다음을 추가:

```js
  applyKnockback(dx, dy, force) {
    if (this.contactInvulTimer > 0) return;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    this.x -= (dx / len) * force;
    this.y -= (dy / len) * force;
  }
```

위치: `takeDamageFromContact` 메서드 (line 41-45) 바로 아래.

- [ ] **Step 2: main.js 충돌 처리에서 applyKnockback 호출**

`main.js` line 944-951 구간:
```js
    for (const enemy of enemies) {
      if (!enemy.isDead && checkCollision(player, enemy)) {
        player.takeDamageFromContact(enemy.contactDamage);
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.x += (dx / len) * 16;
        enemy.y += (dy / len) * 16;
      }
    }
```

을 아래로 교체:

```js
    for (const enemy of enemies) {
      if (!enemy.isDead && checkCollision(player, enemy)) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        player.takeDamageFromContact(enemy.contactDamage);
        player.applyKnockback(dx, dy, 70);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        enemy.x += (dx / len) * 16;
        enemy.y += (dy / len) * 16;
      }
    }
```

주의: `dx`, `dy` 계산을 `takeDamageFromContact` 호출 **전**으로 이동. `applyKnockback` 내부에서도 `contactInvulTimer` 체크를 하지만, `takeDamageFromContact` 가 먼저 실행되면 timer가 설정된 뒤 체크되므로 반드시 dx/dy를 먼저 캡처해야 함.

- [ ] **Step 3: 브라우저 수동 검증**

게임 실행 후 적에게 접촉 시:
- 플레이어가 적 반대 방향으로 ~70px 튕겨남
- 무적 시간(0.5초) 내 재접촉 시 추가 넉백 없음

- [ ] **Step 4: 커밋**

```bash
git add entities/Player.js main.js
git commit -m "feat: phase9 T3 — 적 접촉 시 플레이어 넉백 70px 추가"
```

---

## Task 3: Auto-Aim (T1)

**Files:**
- Modify: `main.js` (line 332 근처 발사 로직)

- [ ] **Step 1: main.js 발사 로직에 nearest-enemy 탐색 추가**

`main.js` line 330-335 구간:
```js
    if (!weapon.canFire()) return;

    const dirX = player.lastDirX;
    const dirY = player.lastDirY;

    const newProjs = weapon.fire(player.x, player.y, dirX, dirY);
```

를 아래로 교체:

```js
    if (!weapon.canFire()) return;

    let dirX = player.lastDirX;
    let dirY = player.lastDirY;

    const autoTargets = [...enemies, ...(boss && !boss.isDead ? [boss] : [])];
    let autoNearest = null;
    let autoNearestDist = Infinity;
    for (const e of autoTargets) {
      if (e.isDead) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dist = dx * dx + dy * dy;
      if (dist < autoNearestDist) { autoNearestDist = dist; autoNearest = e; }
    }
    if (autoNearest) {
      const dx = autoNearest.x - player.x;
      const dy = autoNearest.y - player.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      dirX = dx / len;
      dirY = dy / len;
    }

    const newProjs = weapon.fire(player.x, player.y, dirX, dirY);
```

이 코드는 SQL/JavaScript/Java/LinuxBash 분기의 early return 이후에 위치하므로 해당 무기들은 영향 없음. Python, C/C++, Django, Git이 자동으로 auto-aim을 적용받음.

- [ ] **Step 2: 브라우저 수동 검증**

- C/C++ 무기 장착 후 이동 방향과 무관하게 가장 가까운 적 방향으로 투사체 발사 확인
- Python 무기도 동일하게 auto-aim 작동 확인
- JavaScript(랜덤 난사), LinuxBash(전체 범위)는 기존 동작 유지 확인

- [ ] **Step 3: 커밋**

```bash
git add main.js
git commit -m "feat: phase9 T1 — 자동 에임 (nearest-enemy 타겟팅) 추가"
```

---

## Task 4: Python 밸런스 상향 (T5)

**Files:**
- Modify: `weapons/Python.js`

- [ ] **Step 1: Python 스탯 변경**

`weapons/Python.js` line 6:
```js
    super({ damage: 15, cooldown: 1.0, projectileSpeed: 200, piercing: false });
```

를 아래로 교체:

```js
    super({ damage: 15, cooldown: 0.9, projectileSpeed: 240, piercing: false });
```

- [ ] **Step 2: 브라우저 수동 검증**

Python 무기 장착 후:
- 투사체가 기존보다 빠르게 날아감 (200 → 240, 20% 증가)
- 발사 빈도가 기존보다 약간 빠름 (쿨타임 1.0 → 0.9, 10% 단축)

- [ ] **Step 3: 커밋**

```bash
git add weapons/Python.js
git commit -m "feat: phase9 T5 — Python 무기 밸런스 상향 (속도 +20%, 쿨타임 -10%)"
```

---

## Task 5: REVERSED CONTROLS 텍스트 위치 수정 (T4)

**Files:**
- Modify: `main.js` (line 1287)

- [ ] **Step 1: y 값 40 → 60 변경**

`main.js` line 1287:
```js
      ctx.fillText('CONTROLS REVERSED', canvas.width / 2, 40);
```

를 아래로 교체:

```js
      ctx.fillText('CONTROLS REVERSED', canvas.width / 2, 60);
```

- [ ] **Step 2: 브라우저 수동 검증**

Input Mismatch 이벤트 발동 후(웨이브 8+ 필요 또는 코드 임시 강제):
- 'CONTROLS REVERSED' 텍스트가 화면 상단 y=60 고정 위치에 표시됨
- 플레이어 이동 시 텍스트 위치 변하지 않음 확인

- [ ] **Step 3: 커밋**

```bash
git add main.js
git commit -m "fix: phase9 T4 — REVERSED CONTROLS 텍스트 y=60 고정"
```

---

## Self-Review

### Spec Coverage Check

| 설계 항목 | 대응 태스크 |
|----------|------------|
| T1: Auto-aim (Python, C/C++, Django, Git) | Task 3 ✅ |
| T2: Input Mismatch / Infinite Loop 웨이브 8+ 제한 | Task 1 ✅ |
| T3: 넉백 70px, 무적 시간 중 없음 | Task 2 ✅ |
| T4: REVERSED CONTROLS y=60 | Task 5 ✅ |
| T5: Python speed 240, cooldown 0.9 | Task 4 ✅ |
| C2T1: WaveSystem minWave 필드 | Task 1 (통합) ✅ |

전체 스펙 커버됨.

### Placeholder Scan

없음. 모든 스텝에 실제 코드 포함.

### Type Consistency

- `applyKnockback(dx, dy, force)` — Task 2 Player.js 정의, main.js 호출 모두 동일 시그니처.
- `WAVE_TABLE` — Task 1에서만 사용, 일관됨.
- `autoNearest` 변수명 — Task 3에서만 사용.
