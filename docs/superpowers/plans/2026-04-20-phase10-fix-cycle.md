# Phase 10 Fix Cycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 보스 접촉 즉사 버그, 조준선 불일치, 조작 반전 UI 겹침, 적 등장 타이밍 오류를 수정하고 Python·Java 무기 및 적 이동 속도 밸런스를 조정한다.

**Architecture:** `main.js`의 보스 충돌·조준선 렌더 코드와 각 무기/적/웨이브 파일을 직접 수정하는 단순 패치 방식. `Player`에 `_aimDirX/Y` 필드를 추가해 자동 에임 방향을 저장, 조준선 렌더 시 참조한다.

**Tech Stack:** Vanilla JS (ES6 modules), HTML5 Canvas, 브라우저 직접 실행

---

## 파일 수정 목록

| 파일 | 변경 내용 |
|------|---------|
| `entities/Player.js` | `_aimDirX/Y` 초기화 추가, `contactInvulTimer` 초기값 1.0 |
| `main.js` | 보스 접촉 → `takeDamageFromContact`, `_aimDirX/Y` 저장, 조준선 참조 수정, REVERSED CONTROLS y=28 |
| `systems/WaveSystem.js` | `input_mismatch` minWave 8 → 25 |
| `weapons/Python.js` | cooldown 0.9→0.6, damage 15→18 |
| `weapons/Java.js` | ORB_DAMAGE 18→25, hitCooldown 0.5→0.4 |
| `entities/Enemy.js` | syntax_error speed 80→65, null_pointer speed 140→110 |

---

### Task 1: I-frame 버그 수정 (보스 즉사 방지)

**Files:**
- Modify: `entities/Player.js:44`
- Modify: `main.js:979`

- [ ] **Step 1: `Player.js` contactInvulTimer 초기값 수정**

`entities/Player.js` 44번 줄 `takeDamageFromContact` 내부:

```js
// 변경 전
this.contactInvulTimer = 0.5;

// 변경 후
this.contactInvulTimer = 1.0;
```

- [ ] **Step 2: `main.js` 보스 접촉 데미지 경로 수정**

`main.js` 977-980 줄 (보스 접촉 처리 블록):

```js
// 변경 전
if (boss && !boss.isDead && checkCollision(player, boss)) {
  player.takeDamage(20);
}

// 변경 후
if (boss && !boss.isDead && checkCollision(player, boss)) {
  player.takeDamageFromContact(20);
}
```

- [ ] **Step 3: 브라우저 확인**

브라우저에서 `index.html` 열기. 보스 등장 후 접촉 시 HP가 1초 이내 연속 감소하지 않는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add entities/Player.js main.js
git commit -m "fix: phase10 T1 — 보스 접촉 I-frame 버그 수정 (takeDamageFromContact, 1.0s)"
git push
```

---

### Task 2: REVERSED CONTROLS 텍스트 위치 수정

**Files:**
- Modify: `main.js:1310`

- [ ] **Step 1: y 좌표 수정**

`main.js` 1310번 줄:

```js
// 변경 전
ctx.fillText('CONTROLS REVERSED', canvas.width / 2, 60);

// 변경 후
ctx.fillText('CONTROLS REVERSED', canvas.width / 2, 28);
```

- [ ] **Step 2: 브라우저 확인**

`input_mismatch` 적에게 피격 후 'CONTROLS REVERSED' 텍스트가 상단에 표시되며 오른쪽 무기 목록(y≈56~)과 겹치지 않는지 확인. (직접 테스트가 어렵다면 코드상 y=28임을 육안으로 확인)

- [ ] **Step 3: 커밋**

```bash
git add main.js
git commit -m "fix: phase10 T2 — REVERSED CONTROLS 텍스트 y=28로 이동"
git push
```

---

### Task 3: input_mismatch 등장 타이밍 수정

**Files:**
- Modify: `systems/WaveSystem.js:10`

- [ ] **Step 1: minWave 수정**

`systems/WaveSystem.js` 10번 줄:

```js
// 변경 전
{ type: 'input_mismatch',     minWave: 8  },

// 변경 후
{ type: 'input_mismatch',     minWave: 25 },
```

- [ ] **Step 2: 브라우저 확인**

게임 시작 후 75초(웨이브 25회) 이전에 `input_mismatch`(보라색 투사체 발사 적)가 등장하지 않는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add systems/WaveSystem.js
git commit -m "fix: phase10 T3 — input_mismatch minWave 8→25 (75초 이후 등장)"
git push
```

---

### Task 4: C/C++ 조준선 방향 수정 (_aimDirX/Y 추가)

**Files:**
- Modify: `entities/Player.js` (생성자 + `_aimDirX/Y` 필드 추가)
- Modify: `main.js:332-355` (tryFireWeapon — `_aimDirX/Y` 저장)
- Modify: `main.js:1139-1140` (조준선 렌더 — `lastDirX/Y` → `_aimDirX/Y`)

- [ ] **Step 1: Player.js에 `_aimDirX/Y` 초기화 추가**

`entities/Player.js` 생성자 내 `lastDirX/Y` 선언 바로 아래에 추가:

```js
// 변경 전 (15-17줄)
this.lastDirX = 1;
this.lastDirY = 0;
this.contactInvulTimer = 0;

// 변경 후
this.lastDirX = 1;
this.lastDirY = 0;
this._aimDirX = 1;
this._aimDirY = 0;
this.contactInvulTimer = 0;
```

- [ ] **Step 2: tryFireWeapon에서 `_aimDirX/Y` 저장**

`main.js` auto-aim 계산 후 (354번 줄, `dirX = bestDx / len;` 아래):

```js
// 변경 전 (351-355)
if (autoNearest) {
  const len = Math.sqrt(bestDx * bestDx + bestDy * bestDy) || 1;
  dirX = bestDx / len;
  dirY = bestDy / len;
}

// 변경 후
if (autoNearest) {
  const len = Math.sqrt(bestDx * bestDx + bestDy * bestDy) || 1;
  dirX = bestDx / len;
  dirY = bestDy / len;
  player._aimDirX = dirX;
  player._aimDirY = dirY;
}
```

- [ ] **Step 3: 조준선 렌더에서 `_aimDirX/Y` 참조**

`main.js` 1139-1140번 줄:

```js
// 변경 전
const aimX = player.lastDirX || 0;
const aimY = player.lastDirY || 0;

// 변경 후
const aimX = player._aimDirX || 0;
const aimY = player._aimDirY || 0;
```

- [ ] **Step 4: 브라우저 확인**

C/C++ 무기 획득 후 적이 있을 때 조준선(점선)이 이동 방향이 아닌 가장 가까운 적 방향을 가리키는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add entities/Player.js main.js
git commit -m "fix: phase10 T4 — C/C++ 조준선 _aimDirX/Y 기준으로 수정"
git push
```

---

### Task 5: Python 무기 버프

**Files:**
- Modify: `weapons/Python.js:6`

- [ ] **Step 1: cooldown·damage 수치 변경**

`weapons/Python.js` 6번 줄:

```js
// 변경 전
super({ damage: 15, cooldown: 0.9, projectileSpeed: 240, piercing: false });

// 변경 후
super({ damage: 18, cooldown: 0.6, projectileSpeed: 240, piercing: false });
```

- [ ] **Step 2: 브라우저 확인**

Python 무기 획득 후 발사 간격이 체감상 빨라졌는지, 적에게 18 데미지가 표시되는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add weapons/Python.js
git commit -m "fix: phase10 T5 — Python 버프 (cooldown 0.9→0.6, damage 15→18)"
git push
```

---

### Task 6: Java 무기 밸런스 재조정

**Files:**
- Modify: `weapons/Java.js:6` (ORB_DAMAGE 상수)
- Modify: `weapons/Java.js:66` (hitCooldowns 초기값)

- [ ] **Step 1: ORB_DAMAGE 상수 수정**

`weapons/Java.js` 6번 줄:

```js
// 변경 전
const ORB_DAMAGE = 18;

// 변경 후
const ORB_DAMAGE = 25;
```

- [ ] **Step 2: hitCooldown 값 수정**

`weapons/Java.js` 66번 줄 `tryHit` 내부:

```js
// 변경 전
orb.hitCooldowns.set(enemyId, 0.5); // 0.5초 무적

// 변경 후
orb.hitCooldowns.set(enemyId, 0.4); // 0.4초 무적
```

- [ ] **Step 3: 브라우저 확인**

Java 무기 획득 후 오브 접촉 시 적 HP 감소량이 늘었는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add weapons/Java.js
git commit -m "fix: phase10 T6 — Java 버프 (ORB_DAMAGE 18→25, hitCooldown 0.5→0.4)"
git push
```

---

### Task 7: 적 이동 속도 너프

**Files:**
- Modify: `entities/Enemy.js:356-357` (ENEMY_STATS)

- [ ] **Step 1: ENEMY_STATS speed 수정**

`entities/Enemy.js` 356-357번 줄:

```js
// 변경 전
syntax_error:      { hp: 24,  speed: 80,  contactDamage: 10, flees: false, dropsHpItem: false },
null_pointer:      { hp: 20,  speed: 140, contactDamage: 5,  flees: false, dropsHpItem: false },

// 변경 후
syntax_error:      { hp: 24,  speed: 65,  contactDamage: 10, flees: false, dropsHpItem: false },
null_pointer:      { hp: 20,  speed: 110, contactDamage: 5,  flees: false, dropsHpItem: false },
```

- [ ] **Step 2: 브라우저 확인**

게임 시작 후 syntax_error(빨간 적)와 null_pointer(반투명 파란 적)의 이동 속도가 이전보다 느려져 회피가 가능한지 확인.

- [ ] **Step 3: 커밋**

```bash
git add entities/Enemy.js
git commit -m "fix: phase10 T7 — 적 속도 너프 (syntax_error 80→65, null_pointer 140→110)"
git push
```

---

## 완료 후 처리

모든 T1-T7 완료 후:
1. `docs/phase-status.md` 수정 사이클 완료 표시
2. 블로그 초안 작성 (`blog/game-dev/draft-22-수정5.md`)
3. 사이클 완료 커밋
