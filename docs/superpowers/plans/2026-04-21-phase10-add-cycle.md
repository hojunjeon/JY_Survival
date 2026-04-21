# Phase 10 추가 사이클 — 타격 이펙트 & 시각 피드백 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파티클 시스템, 피격 플래시, Screen Shake 전면 적용 + 무기별 데미지 텍스트·투사체 shape 차별화로 전투 피드백 강화

**Architecture:** `systems/ParticleSystem.js`를 신규 독립 파일로 작성해 타격·사망·회복 파티클을 관리한다. `FloatingTextManager`에 size/duration 옵션을 추가하고, `Projectile`에 `weaponType` 프로퍼티를 추가해 shape를 분기한다. `Player.render()`에 hitFlash 오버레이를 추가하고, `main.js`에서 모든 이펙트를 통합 연동한다.

**Tech Stack:** Vanilla JS ES6 모듈, Canvas 2D API, Vitest

---

## 파일 맵

| 파일 | 역할 |
|------|------|
| `systems/ParticleSystem.js` | **신규** — 파티클 엔진 (addHitSpark / addEnemyDeath / addHeal) |
| `tests/ParticleSystem.test.js` | **신규** — ParticleSystem 단위 테스트 |
| `ui/FloatingText.js` | **수정** — options.size / options.duration 지원 추가 |
| `tests/FloatingText.test.js` | **신규** — FloatingTextManager 단위 테스트 |
| `entities/Projectile.js` | **수정** — weaponType 프로퍼티 추가, render() shape 분기 |
| `entities/Player.js` | **수정** — render()에 hitFlash 오버레이 추가 |
| `main.js` | **수정** — ParticleSystem 연동, Screen Shake 확장, 데미지 텍스트 연동 |

---

## Task 1: ParticleSystem 구현

**Files:**
- Create: `systems/ParticleSystem.js`
- Create: `tests/ParticleSystem.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/ParticleSystem.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../systems/ParticleSystem.js';

describe('ParticleSystem', () => {
  let ps;
  beforeEach(() => { ps = new ParticleSystem(); });

  it('addHitSpark는 count만큼 파티클을 추가한다', () => {
    ps.addHitSpark(100, 200, '#ff0000', 5);
    expect(ps.particles.length).toBe(5);
  });

  it('addEnemyDeath는 count만큼 파티클을 추가한다', () => {
    ps.addEnemyDeath(100, 200, 8);
    expect(ps.particles.length).toBe(8);
  });

  it('addHeal은 파티클을 4개 추가한다', () => {
    ps.addHeal(100, 200);
    expect(ps.particles.length).toBe(4);
  });

  it('update 후 life가 감소한다', () => {
    ps.addHitSpark(0, 0, '#fff', 1);
    const before = ps.particles[0].life;
    ps.update(0.1);
    expect(ps.particles[0].life).toBeLessThan(before);
  });

  it('life가 0 이하인 파티클은 제거된다', () => {
    ps.addHitSpark(0, 0, '#fff', 3);
    ps.update(999);
    expect(ps.particles.length).toBe(0);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/ParticleSystem.test.js
```
Expected: FAIL (ParticleSystem not found)

- [ ] **Step 3: ParticleSystem 구현**

`systems/ParticleSystem.js`:

```js
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addHitSpark(x, y, color = '#ffffff', count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        color,
        size: 3 + Math.random() * 2,
      });
    }
  }

  addEnemyDeath(x, y, count = 8) {
    const colors = ['#ff69b4', '#aaaaaa', '#ff99cc'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        size: 4 + Math.random() * 3,
      });
    }
  }

  addHeal(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: -(30 + Math.random() * 50),
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        color: '#4caf50',
        size: 3 + Math.random() * 2,
      });
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      const size = p.size * alpha;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y - cameraY, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run tests/ParticleSystem.test.js
```
Expected: 5 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add systems/ParticleSystem.js tests/ParticleSystem.test.js
git commit -m "feat: phase10 T1 — ParticleSystem 구현 (hitSpark/enemyDeath/heal)"
```

---

## Task 2: FloatingTextManager 확장

**Files:**
- Modify: `ui/FloatingText.js`
- Create: `tests/FloatingText.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/FloatingText.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { FloatingTextManager } from '../ui/FloatingText.js';

describe('FloatingTextManager', () => {
  let mgr;
  beforeEach(() => { mgr = new FloatingTextManager(); });

  it('기본 duration은 1.0이다', () => {
    mgr.add('test', 0, 0);
    expect(mgr.texts[0].life).toBe(1.0);
  });

  it('options.duration을 적용한다', () => {
    mgr.add('test', 0, 0, '#fff', { duration: 2.0 });
    expect(mgr.texts[0].life).toBe(2.0);
  });

  it('options.size를 저장한다', () => {
    mgr.add('test', 0, 0, '#fff', { size: 22 });
    expect(mgr.texts[0].size).toBe(22);
  });

  it('기본 size는 14이다', () => {
    mgr.add('test', 0, 0);
    expect(mgr.texts[0].size).toBe(14);
  });

  it('update 후 만료된 텍스트는 제거된다', () => {
    mgr.add('test', 0, 0, '#fff', { duration: 0.1 });
    mgr.update(0.2);
    expect(mgr.texts.length).toBe(0);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/FloatingText.test.js
```
Expected: FAIL (size/duration 옵션 미지원)

- [ ] **Step 3: FloatingTextManager 수정**

`ui/FloatingText.js` 전체 교체:

```js
export class FloatingTextManager {
  constructor() {
    this.texts = [];
  }

  add(text, x, y, color = '#ffffff', options = {}) {
    const duration = options.duration ?? 1.0;
    const size = options.size ?? 14;
    this.texts.push({ text, x, y, color, life: duration, maxLife: duration, size });
  }

  update(dt) {
    for (const t of this.texts) t.life -= dt;
    this.texts = this.texts.filter(t => t.life > 0);
  }

  render(ctx, cameraX, cameraY) {
    for (const t of this.texts) {
      const alpha = t.life / t.maxLife;
      const offsetY = (1 - alpha) * 30;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x - cameraX, t.y - cameraY - offsetY);
      ctx.restore();
    }
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run tests/FloatingText.test.js
```
Expected: 5 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add ui/FloatingText.js tests/FloatingText.test.js
git commit -m "feat: phase10 T1 — FloatingTextManager options(size/duration) 지원"
```

---

## Task 3: Projectile weaponType + shape 분기

**Files:**
- Modify: `entities/Projectile.js`

- [ ] **Step 1: 실패하는 테스트 추가**

`tests/Projectile.test.js` 파일 끝에 아래 describe 블록 추가:

```js
describe('Projectile weaponType', () => {
  it('기본 weaponType은 "default"이다', () => {
    const p = new Projectile(0, 0, 100, 0, 10);
    expect(p.weaponType).toBe('default');
  });

  it('생성 시 weaponType을 지정할 수 있다', () => {
    const p = new Projectile(0, 0, 100, 0, 10, { weaponType: 'python' });
    expect(p.weaponType).toBe('python');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/Projectile.test.js
```
Expected: 2 new tests FAIL

- [ ] **Step 3: Projectile.js 수정**

`entities/Projectile.js` 생성자 파라미터에 `weaponType` 추가:

```js
export class Projectile {
  constructor(x, y, vx, vy, damage, {
    piercing = false,
    homing = false,
    color = '#ffff00',
    isAreaEffect = false,
    areaRadius = 0,
    areaColor = '#ffffff',
    isAllEnemy = false,
    chainHops = 0,
    chainRadius = 0,
    hitEnemyIds = null,
    isRailgun = false,
    isBlackhole = false,
    blackholeRadius = 100,
    blackholeLifetime = 2.0,
    weaponType = 'default',
  } = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.piercing = piercing;
    this.homing = homing;
    this.color = color;
    this.isAreaEffect = isAreaEffect;
    this.areaRadius = areaRadius;
    this.areaColor = areaColor;
    this.isAllEnemy = isAllEnemy;
    this.chainHops = chainHops;
    this.chainRadius = chainRadius;
    this.hitEnemyIds = hitEnemyIds;
    this.isRailgun = isRailgun;
    this.isBlackhole = isBlackhole;
    this.blackholeRadius = blackholeRadius;
    this.blackholeLifetime = blackholeLifetime;
    this._bhTimer = blackholeLifetime;
    this.active = true;
    this.width = 8;
    this.height = 8;
    this.weaponType = weaponType;
  }

  update(dt, bounds = null) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (bounds) {
      const margin = 20;
      if (
        this.x < -margin || this.x > bounds.width + margin ||
        this.y < -margin || this.y > bounds.height + margin
      ) {
        this.active = false;
      }
    }
  }

  deactivate() {
    this.active = false;
  }

  render(ctx) {
    if (!this.active) return;
    if (this.isRailgun) {
      ctx.save();
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#ccccff';
      ctx.fillRect(-20, -2, 40, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-20, -1, 40, 2);
      ctx.restore();
      return;
    }
    if (this.weaponType === 'python') {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (this.weaponType === 'c') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = this.color;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
      return;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run tests/Projectile.test.js
```
Expected: ALL PASS

- [ ] **Step 5: 무기 파일에 weaponType 전달**

`weapons/Python.js` — `_createProjectiles` 내 Projectile 생성 시 `weaponType: 'python'` 추가:

```js
const proj = new Projectile(x, y, vx, vy, this.damage, {
  color: '#44ff44',
  chainHops: 2,
  chainRadius: 130,
  hitEnemyIds: new Set(),
  weaponType: 'python',
});
```

`weapons/C.js` — `_createProjectiles` 내 `weaponType: 'c'` 추가:

```js
return [new Projectile(x, y, dirX * this.projectileSpeed, dirY * this.projectileSpeed, this.damage, {
  piercing: true,
  color: '#aaaaaa',
  isRailgun: true,
  weaponType: 'c',
})];
```

- [ ] **Step 6: 전체 테스트 통과 확인**

```bash
npx vitest run
```
Expected: ALL PASS

- [ ] **Step 7: 커밋**

```bash
git add entities/Projectile.js weapons/Python.js weapons/C.js tests/Projectile.test.js
git commit -m "feat: phase10 T2 — Projectile weaponType + Python원형/C마름모 shape"
```

---

## Task 4: Player hitFlash 렌더링 구현

**Files:**
- Modify: `entities/Player.js`

- [ ] **Step 1: 실패하는 테스트 추가**

`tests/Player.test.js` 파일 끝에 추가:

```js
describe('Player hitFlash', () => {
  it('takeDamage 호출 후 hitFlashTimer가 양수이다', () => {
    const player = new Player(0, 0);
    player.takeDamage(10);
    expect(player.hitFlashTimer).toBeGreaterThan(0);
  });

  it('update 후 hitFlashTimer가 감소한다', () => {
    const player = new Player(0, 0);
    player.takeDamage(10);
    const before = player.hitFlashTimer;
    player.update(0.05);
    expect(player.hitFlashTimer).toBeLessThan(before);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/Player.test.js
```
Expected: 2 new tests FAIL (hitFlashTimer가 0으로 초기화되므로 실제로는 PASS일 수 있음 — 로직은 이미 존재, render가 미사용 상태임을 확인)

- [ ] **Step 3: 테스트 통과 확인 후 render() 수정**

`entities/Player.js` `render()` 메서드를 아래로 교체:

```js
render(ctx) {
  if (this._renderer) {
    this._renderer.drawWithOutline(ctx, this.x, this.y);
  } else {
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - this.width / 2 - 1, this.y - this.height / 2 - 1, this.width + 2, this.height + 2);
  }
  if (this.hitFlashTimer > 0) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.restore();
  }
}
```

- [ ] **Step 4: 전체 테스트 통과 확인**

```bash
npx vitest run
```
Expected: ALL PASS

- [ ] **Step 5: 커밋**

```bash
git add entities/Player.js tests/Player.test.js
git commit -m "feat: phase10 T1 — Player hitFlash 빨간 오버레이 구현"
```

---

## Task 5: main.js 통합 연동

**Files:**
- Modify: `main.js`

이 태스크는 테스트보다 전체 테스트 통과 후 브라우저 확인이 주 검증 방법이다.

- [ ] **Step 1: ParticleSystem import 추가**

`main.js` 상단 import 목록에 추가:

```js
import { ParticleSystem } from './systems/ParticleSystem.js';
```

- [ ] **Step 2: ParticleSystem 인스턴스 + WEAPON_COLOR 맵 추가**

`startGame()` 함수 내 `const floatingTextManager = new FloatingTextManager();` 바로 아래에 추가:

```js
const particleSystem = new ParticleSystem();

const WEAPON_COLOR = {
  'Python':     '#3572A5',
  'Java':       '#b07219',
  'C/C++':      '#555555',
  'Git':        '#f05033',
  'SQL':        '#e38c00',
  'JavaScript': '#f1e05a',
  'Django':     '#0c4b33',
  'LinuxBash':  '#89e051',
};
```

- [ ] **Step 3: 적 피격 시 이펙트 연동**

main.js 내 적에게 데미지를 주는 코드(투사체 충돌 처리)를 검색해 아래 패턴으로 교체한다.  
`e.takeDamage(...)` 호출 직후에 아래 3줄을 추가:

```js
// 투사체 충돌 후 e.takeDamage(proj.damage) 바로 아래
const wName = weapon ? weapon.name : null;
const wColor = WEAPON_COLOR[wName] || '#ffffff';
const isCrit = proj.damage >= 20;
floatingTextManager.add(
  isCrit ? `!!-${proj.damage}!!` : `-${proj.damage}`,
  e.x, e.y - 20,
  wColor,
  { size: isCrit ? 22 : 14, duration: isCrit ? 1.3 : 1.0 }
);
particleSystem.addHitSpark(e.x, e.y, wColor, 5);
triggerScreenShake(2, 0.1);
```

- [ ] **Step 4: 적 사망 시 이펙트 연동**

적 사망 처리(`e.isDead` 필터링) 직전 루프 내에서 dead 배열 순회 시 추가:

```js
// for (const e of dead) { ... } 블록 내 기존 코드 아래
particleSystem.addEnemyDeath(e.x, e.y, 8);
triggerScreenShake(3, 0.15);
```

- [ ] **Step 5: 보스 피격 이펙트 강화**

보스에게 데미지를 주는 코드(`boss.takeDamage(...)`) 직후:

```js
triggerScreenShake(6, 0.3);
particleSystem.addHitSpark(boss.x, boss.y, '#ff4444', 8);
floatingTextManager.add(`-${proj.damage}`, boss.x, boss.y - 30, '#ff4444', { size: 18 });
```

- [ ] **Step 6: 플레이어 피격 이펙트 연동**

`player.takeDamageFromContact(...)` 호출 직후:

```js
floatingTextManager.add(`-${dmg}HP`, player.x, player.y - 40, '#ff4444', { size: 16 });
triggerScreenShake(5, 0.2);
```

- [ ] **Step 7: 회복 이펙트 연동**

`player.heal(20)` 호출 직후:

```js
particleSystem.addHeal(player.x, player.y);
floatingTextManager.add('+20HP', player.x, player.y - 40, '#4caf50', { size: 14 });
```

- [ ] **Step 8: 렌더 루프에 ParticleSystem 추가**

게임 루프 렌더링 부분에서 `floatingTextManager.render(...)` 바로 앞에:

```js
particleSystem.update(dt);
particleSystem.render(ctx, cameraX, cameraY);
```

- [ ] **Step 9: 전체 테스트 통과 확인**

```bash
npx vitest run
```
Expected: ALL PASS

- [ ] **Step 10: 브라우저 확인**

```bash
npx serve .
```

확인 항목:
- 적 타격 시 불꽃 파티클 + 데미지 숫자 팝업 표시
- 적 사망 시 파편 파티클 + 화면 흔들림
- 보스 피격 시 강한 흔들림 + 큰 데미지 숫자
- 플레이어 피격 시 빨간 플래시 오버레이
- HP 회복 시 녹색 파티클 + +20HP 텍스트

- [ ] **Step 11: 커밋**

```bash
git add main.js
git commit -m "feat: phase10 T1+T2 — main.js 이펙트 전체 연동 (파티클/shake/데미지텍스트)"
```
