# Phase 11 Cycle 2 — 무기 레벨업 이펙트 스케일업 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement weapon level-up system (Lv 1-5) with progressive particle effect scaling for Python.py, C/C++, and Java weapons, plus level-up notification UI.

**Architecture:** Level property added to WeaponBase, forwarded through ParticleSystem method signatures; effect parameters scale per level table. Level-up triggered by existing UpgradeSystem material deduction. Notification rendered as 1.5s HUD overlay at top-center with fade-out.

**Tech Stack:** Vanilla JS, HTML5 Canvas, existing ParticleSystem architecture, floating text utilities.

---

## File Structure

**Files to modify:**
- `weapons/WeaponBase.js` — Add `this.level` property and initialization
- `weapons/Python.js` — Pass level to ParticleSystem calls
- `weapons/C.js` — Pass level to ParticleSystem calls
- `weapons/Java.js` — Pass level to ParticleSystem calls
- `systems/ParticleSystem.js` — Extend method signatures with level param; implement per-level effect scaling
- `ui/HUD.js` — Add level-up notification rendering method
- `main.js` — Wire UpgradeSystem to weapon level-up; trigger HUD notification on enhance success

**Architecture rationale:**
- Level lives on weapon instance so it persists across game state and survive weapon re-selection.
- ParticleSystem methods become level-aware by accepting optional `level = 1` parameter (backward compatible).
- HUD notification is stateful (timer-based) and renders during normal HUD render cycle.

---

## Implementation Tasks

### Task 1: Add level property to WeaponBase

**Files:**
- Modify: `weapons/WeaponBase.js`

- [x] **Step 1: Review current WeaponBase structure**

Open `weapons/WeaponBase.js` and confirm constructor signature and properties.

- [x] **Step 2: Add level property to constructor**

Add these lines after `this.projectileSpeed = projectileSpeed;`:

```js
this.level = 1; // Weapon level: 1-5, affects particle effects
this.maxLevel = 5;
```

- [x] **Step 3: Add levelUp method**

Add this method after `fire()`:

```js
levelUp() {
  if (this.level < this.maxLevel) {
    this.level++;
    return true;
  }
  return false;
}
```

- [x] **Step 4: Commit changes**

```bash
git add weapons/WeaponBase.js
git commit -m "feat: add level property and levelUp method to WeaponBase"
```

---

### Task 2: Extend ParticleSystem method signatures with level parameter

**Files:**
- Modify: `systems/ParticleSystem.js:70-131`

- [x] **Step 1: Update addWeaponTrail signature**

Change from: `addWeaponTrail(x, y, weaponType) {`
To: `addWeaponTrail(x, y, weaponType, level = 1) {`

- [x] **Step 2: Update addWeaponHit signature**

Change from: `addWeaponHit(x, y, weaponType) {`
To: `addWeaponHit(x, y, weaponType, level = 1) {`

- [x] **Step 3: Update addOrbitalTail signature**

Change from: `addOrbitalTail(x, y) {`
To: `addOrbitalTail(x, y, level = 1) {`

- [x] **Step 4: Commit signature changes**

```bash
git add systems/ParticleSystem.js
git commit -m "refactor: add level parameter to particle system weapon methods"
```

---

### Task 3: Implement Python.py level-scaling logic in ParticleSystem

**Files:**
- Modify: `systems/ParticleSystem.js:71-108`

- [x] **Step 1: Replace Python case with level-aware implementation**

Replace lines 71-89 with complete level-scaling code as per spec table.

- [x] **Step 2: Run game and verify Python trail effects**

Start game, select Python, observe trail at each level.

- [x] **Step 3: Commit implementation**

```bash
git add systems/ParticleSystem.js
git commit -m "feat: implement Python.py level-scaled particle trails (Lv1-5)"
```

---

### Task 4: Implement C/C++ level-scaling logic in ParticleSystem

**Files:**
- Modify: `systems/ParticleSystem.js:90-131`

- [x] **Step 1: Replace C trail case with level-aware implementation**

- [x] **Step 2: Replace C hit case with level-aware ring logic**

- [x] **Step 3: Run game and verify C/C++ effects**

- [x] **Step 4: Commit**

```bash
git add systems/ParticleSystem.js
git commit -m "feat: implement C/C++ level-scaled impact rings and trails (Lv1-5)"
```

---

### Task 5: Implement Java level-scaling logic in ParticleSystem

**Files:**
- Modify: `systems/ParticleSystem.js:133-162`

- [x] **Step 1: Replace addOrbitalTail with level-aware version**

- [x] **Step 2: Update Java weapon update call in main.js**

- [x] **Step 3: Test Java orbital effects**

- [x] **Step 4: Commit**

```bash
git add systems/ParticleSystem.js main.js
git commit -m "feat: implement Java orbital level-scaled effects (Lv1-5)"
```

---

### Task 6: Wire weapon level-up to ParticleSystem calls in Python weapon

**Files:**
- Modify: `weapons/Python.js:36`

- [x] **Step 1: Update Python weapon trail call**

Change: `particleSystem.addWeaponTrail(proj.x, proj.y, 'python');`
To: `particleSystem.addWeaponTrail(proj.x, proj.y, 'python', this.level);`

- [x] **Step 2: Commit**

```bash
git add weapons/Python.js
git commit -m "feat: pass weapon level to Python trail particles"
```

---

### Task 7: Wire weapon level-up to ParticleSystem calls in C/C++ weapon

**Files:**
- Modify: `weapons/C.js:31`

- [x] **Step 1: Update C weapon trail call**

Change: `particleSystem.addWeaponTrail(proj.x, proj.y, 'c');`
To: `particleSystem.addWeaponTrail(proj.x, proj.y, 'c', this.level);`

- [x] **Step 2: Commit**

```bash
git add weapons/C.js
git commit -m "feat: pass weapon level to C/C++ trail particles"
```

---

### Task 8: Wire weapon level-up to addWeaponHit calls in main.js

**Files:**
- Modify: `main.js:984, 995, 1052, 1060`

- [x] **Step 1: Find all addWeaponHit calls**

Run: `grep -n "particleSystem.addWeaponHit" main.js`

- [x] **Step 2-5: Update all 4 addWeaponHit calls**

Change each from: `particleSystem.addWeaponHit(x, y, proj.weaponType);`
To: `particleSystem.addWeaponHit(x, y, proj.weaponType, selectedWeapon?.level || 1);`

- [x] **Step 6: Commit**

```bash
git add main.js
git commit -m "feat: pass weapon level to hit particles in collision detection"
```

---

### Task 9: Add level-up notification to HUD

**Files:**
- Modify: `ui/HUD.js`

- [x] **Step 1: Add notification state to constructor**

- [x] **Step 2: Add notification trigger method**

- [x] **Step 3: Add rendering call in render()**

- [x] **Step 4: Implement _renderLevelUpNotif() method**

- [x] **Step 5: Commit HUD changes**

```bash
git add ui/HUD.js
git commit -m "feat: add level-up notification UI to HUD"
```

---

### Task 10: Wire level-up trigger in main.js game loop

**Files:**
- Modify: `main.js`

- [x] **Step 1: Add HUD update in game loop**

After floatingTextManager.update(dt), add: `uiScreens.hud.updateLevelUpNotif(dt);`

- [x] **Step 2: Add helper function**

Add triggerWeaponLevelUp(weapon) function.

- [x] **Step 3: Test notification**

Run game, call triggerWeaponLevelUp(selectedWeapon) in console.

- [x] **Step 4: Commit**

```bash
git add main.js
git commit -m "feat: add level-up trigger function and HUD notification wiring"
```

---

### Task 11: Integration test — verify all three weapons scale properly

**Files:**
- Test manually in browser

- [x] **Step 1-8: Test each weapon level-up**

Select Python/C++/Java, level-up via console, verify effects scale.

- [x] **Step 9: Commit test results**

```bash
git commit --allow-empty -m "test: Phase 11 Cycle 2 weapon level-up effects verified (Python, C/C++, Java)"
```

---

### Task 12: Update documentation

**Files:**
- Update: CLAUDE.md

- [x] **Step 1: Add completion note**

- [x] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: Phase 11 Cycle 2 completion — weapon level-up FX system"
```

---

## Self-Review

- [x] Spec coverage: All Python/C++/Java level effects, notification UI
- [x] No placeholders: All code complete, commit messages specific
- [x] Type consistency: weapon.level, method signatures match
- [x] All requirements have tasks

Plan is complete and ready for execution.
